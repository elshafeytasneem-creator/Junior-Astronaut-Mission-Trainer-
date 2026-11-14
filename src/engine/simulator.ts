/**
 * Headless, deterministic outpost simulator (Handbook: no rendering, no wall clock).
 *
 * One `step()` = one whole simulated hour, in the fixed order the architecture doc
 * prescribes: events -> sunlight -> capacities -> power ledger -> crew consumption ->
 * processors -> atmosphere -> thermal -> progress -> xp -> power-ups -> snapshot.
 *
 * Every number comes from the JSON documents; nothing here is a tuning constant.
 */

import type {
  AstronautState,
  BuildableTypeInfo,
  BuildingInstance,
  BuildingType,
  DamageLevel,
  EnvironmentalEvent,
  GameDatabase,
  BrownoutPayload,
  MissionStatus,
  OperationalStatus,
  OutpostConfig,
  PowerShortageMode,
  PowerStatus,
  PowerUpCollectible,
  PowerUpDefinition,
  PowerUpState,
  ResourceSnapshot,
  SafetyBand,
  SimEvent,
  SimulatorOptions,
  SimulatorSettings,
  SimulatorSnapshot,
  StepResult,
  TrackedEnvironmentEvent,
} from "../types/outpost";
import type {
  EnvironmentEventView,
  EventPhase,
  PanelAction,
  PanelDependency,
  PanelFlow,
  PowerUpView,
  SystemPanelData,
} from "../types/game";
import { EventBus } from "./EventBus";
import { SeededRng } from "./rng";
import { err, ok } from "./result";
import type { Result } from "../types/outpost";

const RUNNING_STATES = new Set<OperationalStatus>([
  "ON",
  "PROCESSING",
  "CHARGING",
  "DEPLOYED",
  "ACTIVE",
  "GROWING",
  "CYCLING",
  "REGENERATING",
  "MOVING",
  "IDLE",
]);

const OFFISH_STATES = new Set<OperationalStatus>(["OFF", "STOWED", "INACTIVE", "PARKED"]);

function isOperational(instance: BuildingInstance): boolean {
  return (
    instance.status !== "DESTROYED" &&
    instance.status !== "UNDER_CONSTRUCTION" &&
    instance.status !== "REPAIRING" &&
    instance.status !== "DAMAGED" &&
    !OFFISH_STATES.has(instance.status)
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 4): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

interface FlowRecord {
  wanted: number;
  got: number;
  blocked: boolean;
}

export class OutpostSimulator {
  readonly db: GameDatabase;
  readonly events = new EventBus();

  private hourNow = 0;
  private rng: SeededRng;
  private resources: Record<string, number> = {};
  private capacities: Record<string, number> = {};
  private instanceList: BuildingInstance[] = [];
  private crewList: AstronautState[] = [];
  private settings: SimulatorSettings;
  private missionStatus: MissionStatus = { state: "active" };
  private powerUps: PowerUpState[] = [];
  private crateList: PowerUpCollectible[] = [];
  private tracked: TrackedEnvironmentEvent[] = [];
  private brownoutActive = false;
  private emergencyActive = false;
  private crewSheltered = false;
  private nextInstanceSerial = 1;
  private nextCollectibleSerial = 1;
  private idCounters: Record<string, number> = {};
  private awardedRewardIds: string[] = [];
  private roverCycles = 0;
  private powerUpsCollected = 0;
  private brownoutsRecovered = 0;

  /** Last computed hour snapshot; also what `view()` returns. */
  private last!: StepResult;
  /** Per-instance flows for the inspect panel, refreshed every step. */
  private flows = new Map<string, Record<string, FlowRecord>>();
  private powerByInstance = new Map<string, { requested: number; delivered: number; cutReason: string | null }>();
  private efficiencyByInstance = new Map<string, number>();
  private warnings = new Map<string, { message: string; cause: string | null }>();
  private heatRemovedKwh = 0;
  /** EVA panel cleaning: recovers sunlight, decays as dust settles again. */
  private dustClearance = 0;
  private sunFactor = 1;
  private crewSize: number;
  private clockSink?: { requestAutoPause(source: string): void };
  private stepEvents: SimEvent[] = [];
  private alerts: string[] = [];
  private emergencyFlags: string[] = [];

  private readonly config: OutpostConfig;
  private readonly types = new Map<string, BuildingType>();

  constructor(db: GameDatabase, options: SimulatorOptions = {}) {
    this.db = db;
    this.config = db.config;
    for (const type of db.buildings) this.types.set(type.typeId, type);
    this.crewSize = clamp(Math.round(options.crewSize ?? db.config.crew.defaultSize), 1, db.config.crew.names.length);
    this.settings = {
      powerShortageMode: options.settings?.powerShortageMode ?? db.config.power.shortageModeDefault,
      highlightGuidance: options.settings?.highlightGuidance ?? db.config.power.highlightGuidanceDefault,
    };
    this.clockSink = options.clock;
    this.rng = new SeededRng(options.seed ?? 20261114);

    this.seedResources(options.resources ?? db.resources);
    this.seedCrew();
    this.seedInstances();
    this.seedEvents(options.events ?? db.events);
    this.seedPowerUps();
    this.recomputeCapacities();
    this.last = this.buildStepResult(this.resolvePower());
  }

  /* ------------------------------------------------------------- seeding --- */

  private seedResources(definitions = this.db.resources): void {
    this.resources = {};
    for (const definition of definitions) {
      this.resources[definition.id] = definition.initial;
    }
    // Cabin gases start at the config pressures, not at the JSON "0 kg" placeholder.
    const volume = this.habitatVolume();
    this.resources.cabinTemperature = this.config.atmosphere.initialTemperatureC;
    this.resources.cabinO2 = this.massForPressure(this.config.atmosphere.initialO2MmHg, volume, this.config.gas.o2MolarMassKg);
    this.resources.cabinCO2 = this.massForPressure(this.config.atmosphere.initialCo2MmHg, volume, this.config.gas.co2MolarMassKg);
    this.resources.xp = this.config.xp.starting;
  }

  private seedCrew(): void {
    this.crewList = [];
    for (let index = 0; index < this.crewSize; index += 1) {
      this.crewList.push({
        id: `crew-${index + 1}`,
        name: this.config.crew.names[index] ?? `Crew ${index + 1}`,
        health: 100,
        status: "Normal",
        activityMultiplier: 1,
        assignedTaskId: null,
      });
    }
  }

  private seedInstances(): void {
    this.instanceList = [];
    for (const starter of this.config.starterInstances) {
      if (!this.types.has(starter.typeId)) continue;
      this.instanceList.push(this.makeInstance(starter.typeId, starter.status, starter.slotId ?? null));
    }
  }

  private seedEvents(source: EnvironmentalEvent[]): void {
    this.tracked = source.map((event, index) => {
      // Replayability: shift every event after the first by a seeded offset (0..10 h).
      const jitter = index === 0 ? 0 : this.rng.nextInt(11);
      return {
        ...event,
        startHour: Math.max(0, event.startHour + jitter),
        warned: false,
        active: false,
        ended: false,
        damageApplied: false,
      };
    });
  }

  private seedPowerUps(): void {
    this.powerUps = this.config.powerUps.map((definition) => ({
      typeId: definition.typeId,
      charges: definition.initialCharges,
      cooldownRemainingHours: 0,
      activeRemainingHours: 0,
    }));
  }

  private makeInstance(typeId: string, status: OperationalStatus, slotId: string | null): BuildingInstance {
    const instanceId = `b-${this.nextInstanceSerial}`;
    this.nextInstanceSerial += 1;
    return {
      instanceId,
      typeId,
      status,
      damage: "none",
      level: 1,
      slotId,
      builtAtHour: this.hourNow,
      repairRemainingHours: 0,
      constructionRemainingHours: 0,
      pendingCycle: false,
      isStarved: false,
      lastEfficiency: 1,
    };
  }

  /* --------------------------------------------------------- math helpers --- */

  private typeOf(instance: BuildingInstance): BuildingType {
    const type = this.types.get(instance.typeId);
    if (!type) throw new Error(`unknown building type ${instance.typeId}`);
    return type;
  }

  private habitatVolume(): number {
    const built = this.instanceList.filter((instance) => instance.typeId === "pressurized_habitat" && isOperational(instance));
    const volume = built.reduce((sum, instance) => sum + this.typeOf(instance).volumeM3, 0);
    if (volume > 0) return volume;
    // Fallback keeps the gas math finite before any habitat exists.
    const starter = this.db.buildings.find((type) => type.typeId === "pressurized_habitat");
    return starter ? starter.volumeM3 : 1;
  }

  /** Ideal gas, solved for mass: m = P V M / (R T). */
  private massForPressure(mmHg: number, volumeM3: number, molarMassKg: number): number {
    const pascals = mmHg * this.config.gas.paPerMmHg;
    const kelvin = this.resources.cabinTemperature + 273.15;
    return (pascals * volumeM3 * molarMassKg) / (this.config.gas.rJoules * kelvin);
  }

  private pressureForMass(massKg: number, volumeM3: number, molarMassKg: number): number {
    if (massKg <= 0 || volumeM3 <= 0) return 0;
    const kelvin = this.resources.cabinTemperature + 273.15;
    const moles = massKg / molarMassKg;
    const pascals = (moles * this.config.gas.rJoules * kelvin) / volumeM3;
    return pascals / this.config.gas.paPerMmHg;
  }

  private levelMultiplier(level: number): number {
    return 1 + this.config.level.bonusPerLevel * Math.max(0, level - 1);
  }

  private damageMultiplier(damage: DamageLevel): number {
    return this.config.damageMultipliers[damage] ?? 1;
  }

  private activeMultiplier(field: keyof PowerUpDefinition): number {
    let total = 1;
    for (const state of this.powerUps) {
      if (state.activeRemainingHours <= 0) continue;
      const definition = this.config.powerUps.find((item) => item.typeId === state.typeId);
      const value = definition?.[field];
      if (typeof value === "number") total *= value;
    }
    return total;
  }

  private eventBuildingEfficiency(): number {
    let total = 1;
    for (const event of this.tracked) {
      if (!event.active) continue;
      if (typeof event.effects.buildingEfficiency === "number") total *= event.effects.buildingEfficiency;
    }
    return total;
  }

  private eventSunlightMultiplier(): number {
    let total = 1;
    for (const event of this.tracked) {
      if (!event.active) continue;
      if (typeof event.effects.sunlightMultiplier === "number") total *= event.effects.sunlightMultiplier;
    }
    return total;
  }

  private radiationEventActive(): boolean {
    return this.tracked.some((event) => event.active && event.effects.radiation === true);
  }

  private provides(tag: string): boolean {
    return this.instanceList.some((instance) => {
      if (!isOperational(instance)) return false;
      const type = this.typeOf(instance);
      return type.provides.includes(tag);
    });
  }

  private hasCapability(tag: string): boolean {
    if (tag === "cabin") {
      return this.instanceList.some((item) => item.typeId === "pressurized_habitat" && isOperational(item));
    }
    if (tag === "crew") return this.crewList.some((member) => member.status !== "Deceased");
    return this.provides(tag);
  }

  /* ------------------------------------------------------------- stepping --- */

  /** Advance the world by whole simulated hours. `step(0)` just recomputes the view. */
  step(hours = 1): StepResult {
    let result = this.last;
    const count = Math.max(0, Math.floor(hours));
    for (let index = 0; index < count; index += 1) result = this.tick();
    this.last = result;
    return result;
  }

  view(): StepResult {
    return this.last;
  }

  private emit(name: SimEvent["name"], payload: unknown): void {
    this.stepEvents.push(this.events.emit(name, payload));
  }

  private tick(): StepResult {
    this.hourNow += 1;
    this.stepEvents = [];
    this.alerts = [];
    this.emergencyFlags = [];
    this.flows.clear();
    this.warnings.clear();

    this.advanceEnvironmentEvents();
    this.computeSunlight();
    if (this.recomputeCapacities()) {
      this.emit("CAPACITY_CHANGED", { message: "Storage space changed." });
    }
    const power = this.resolvePower();
    this.runCrewConsumption();
    this.runProcessors(power);
    this.updateCrewHealth();
    this.advanceConstructionAndRepairs();
    this.runPendingCycles(power);
    this.advancePowerUps();
    this.awardSteadyStateXp(power);
    this.paySolIncome();

    const result = this.buildStepResult(power);
    this.last = result;
    return result;
  }

  /* ----------------------------------------------------------- environment --- */

  private advanceEnvironmentEvents(): void {
    const monitored = this.provides("warning") && this.provides("comms");
    const leadScale = monitored ? 1 : this.config.environment.unmonitoredLeadScale;

    for (const event of this.tracked) {
      const lead = event.warningLeadHours * leadScale;
      const warningHour = event.startHour - lead;
      const endHour = event.startHour + event.durationHours;

      if (!event.warned && !event.active && this.hourNow >= warningHour && this.hourNow < event.startHour) {
        event.warned = true;
        const away = Math.max(1, Math.round(event.startHour - this.hourNow));
        this.emit("ENV_WARNING", {
          message: `${this.eventLabel(event.type)} expected in about ${away} h.${monitored ? "" : " Warning is late: no radiation monitor or no dish."}`,
        });
      }
      if (!event.active && !event.ended && this.hourNow >= event.startHour) {
        event.active = true;
        event.warned = true;
        this.emit("ENV_ACTIVE", { message: this.eventLabel(event.type) });
        if (event.effects.radiation === true) this.emergencyFlags.push("radiation");
        if (!event.damageApplied && event.effects.damage) {
          event.damageApplied = true;
          this.applyEventDamage(event.effects.damage);
        }
        if (event.effects.resourceDeltas) this.applyResourceDeltas(event.effects.resourceDeltas);
      }
      if (event.active && this.hourNow >= endHour) {
        event.active = false;
        event.ended = true;
        this.emit("ENV_ENDED", { message: this.eventLabel(event.type) });
      }
    }
  }

  private eventLabel(type: string): string {
    switch (type) {
      case "solar_particle_event":
        return "Solar particle storm";
      case "solar_flare":
        return "Solar flare";
      case "coronal_mass_ejection":
        return "Coronal mass ejection";
      case "dust_storm":
        return "Dust on the panels";
      case "micrometeoroid_strike":
        return "Micrometeoroid strike";
      default:
        return "Space weather event";
    }
  }

  private applyEventDamage(damage: { typeId?: string; instanceId?: string; level: DamageLevel }): void {
    const targets = this.instanceList.filter((instance) => {
      if (damage.instanceId) return instance.instanceId === damage.instanceId;
      if (damage.typeId) return instance.typeId === damage.typeId;
      return false;
    });
    for (const instance of targets) {
      if (instance.status === "DESTROYED") continue;
      instance.damage = this.worseDamage(instance.damage, damage.level);
      if (instance.damage === "destroyed") {
        instance.status = "DESTROYED";
      } else if (isOperational(instance)) {
        instance.status = "DAMAGED";
      }
      this.emit("BUILDING_DAMAGED", {
        message: `${this.typeOf(instance).name} is ${instance.damage}.`,
        instanceId: instance.instanceId,
      });
    }
  }

  private worseDamage(current: DamageLevel, incoming: DamageLevel): DamageLevel {
    const order: DamageLevel[] = ["none", "minor", "moderate", "critical", "destroyed"];
    return order[Math.max(order.indexOf(current), order.indexOf(incoming))];
  }

  private applyResourceDeltas(deltas: Record<string, number>): void {
    for (const [resource, delta] of Object.entries(deltas)) {
      this.resources[resource] = this.clampResource(resource, (this.resources[resource] ?? 0) + delta);
    }
  }

  /* --------------------------------------------------------------- sunlight --- */

  private computeSunlight(): void {
    const { daylightHours, nightHours, cycleEnabled } = this.config.lunar;
    this.dustClearance = Math.max(0, this.dustClearance - 0.12);
    const eventFactor = Math.min(1, this.eventSunlightMultiplier() + this.dustClearance);
    if (!cycleEnabled) {
      this.sunFactor = eventFactor;
      return;
    }
    const cycle = Math.max(1, daylightHours + nightHours);
    const phase = ((this.hourNow % cycle) + cycle) % cycle;
    this.sunFactor = (phase < daylightHours ? 1 : 0) * eventFactor;
  }

  /* ------------------------------------------------------------- capacity --- */

  private recomputeCapacities(): boolean {
    const next: Record<string, number> = {};
    for (const definition of this.db.resources) next[definition.id] = definition.baseCapacity ?? 0;

    for (const instance of this.instanceList) {
      if (!isOperational(instance)) continue;
      const type = this.typeOf(instance);
      for (const grant of type.capacityGrants) {
        next[grant.resource] = (next[grant.resource] ?? 0) + grant.amount * this.levelMultiplier(instance.level);
      }
      // Battery storage is declared once, on `batteryCapacityKwh`, so the data file cannot
      // disagree with itself about how much energy the outpost can hold.
      if (type.batteryCapacityKwh > 0) {
        next.electricalEnergy =
          (next.electricalEnergy ?? 0) +
          type.batteryCapacityKwh * this.levelMultiplier(instance.level) * this.damageMultiplier(instance.damage);
      }
    }

    let changed = false;
    for (const [id, value] of Object.entries(next)) {
      const before = this.capacities[id];
      if (before === undefined || Math.abs(before - value) > 1e-9) changed = true;
    }
    if (Object.keys(this.capacities).length !== Object.keys(next).length) changed = true;
    this.capacities = next;

    // Shared cabin gases have no tank: the atmosphere caps itself through venting.
    for (const definition of this.db.resources) {
      if (definition.hardMax !== null) this.resources[definition.id] = Math.min(this.resources[definition.id], definition.hardMax);
    }
    // A tank cannot hold more than the tank. Launch starts with stores full, not overflowing,
    // otherwise producers would idle forever against a "full" destination.
    for (const [id, capacity] of Object.entries(next)) {
      if (capacity > 0 && (this.resources[id] ?? 0) > capacity) this.resources[id] = capacity;
    }
    return changed;
  }

  private clampResource(resource: string, value: number): number {
    const definition = this.db.resources.find((item) => item.id === resource);
    if (!definition) return value;
    if (resource === "cabinO2" || resource === "cabinCO2" || resource === "cabinTemperature") {
      return Math.max(definition.min, value);
    }
    const capacity = this.capacities[resource] ?? definition.baseCapacity ?? 0;
    const ceiling = definition.hardMax ?? (capacity > 0 ? capacity : null);
    const capped = ceiling === null ? value : Math.min(value, ceiling);
    return Math.max(definition.min, capped);
  }

  /* ----------------------------------------------------------------- power --- */

  private resolvePower(): PowerStatus {
    const drawMultiplier = this.activeMultiplier("powerDrawMultiplier");
    const eventEfficiency = this.eventBuildingEfficiency();

    let solarKwh = 0;
    for (const instance of this.instanceList) {
      const type = this.typeOf(instance);
      if (type.solarKwhPerFullSunHour <= 0) continue;
      if (!isOperational(instance) || OFFISH_STATES.has(instance.status)) continue;
      solarKwh +=
        type.solarKwhPerFullSunHour *
        this.sunFactor *
        this.damageMultiplier(instance.damage) *
        this.levelMultiplier(instance.level) *
        this.activeMultiplier("solarMultiplier") *
        eventEfficiency;
    }

    const consumers: { instance: BuildingInstance; type: BuildingType; draw: number }[] = [];
    for (const instance of this.instanceList) {
      const type = this.typeOf(instance);
      if (type.powerDrawKwh <= 0) continue;
      if (!RUNNING_STATES.has(instance.status)) continue;
      if (instance.status === "UNDER_CONSTRUCTION") continue;
      const draw =
        type.powerDrawKwh *
        this.damageMultiplier(instance.damage) *
        drawMultiplier *
        (instance.typeId === "greenhouse" ? 1 : 1);
      consumers.push({ instance, type, draw });
    }
    consumers.sort((a, b) => a.type.priority - b.type.priority || a.instance.instanceId.localeCompare(b.instance.instanceId));

    const demandKwh = consumers.reduce((sum, item) => sum + item.draw, 0);
    const stored = this.resources.electricalEnergy ?? 0;
    const bankCapacity = this.capacities.electricalEnergy ?? 0;
    let bankRate = 0;
    for (const instance of this.instanceList) {
      const type = this.typeOf(instance);
      if (type.batteryRateKwh <= 0 || !isOperational(instance)) continue;
      bankRate += type.batteryRateKwh * this.damageMultiplier(instance.damage) * this.levelMultiplier(instance.level);
    }

    let chargedKwh = 0;
    let dischargedKwh = 0;
    let availableKwh = solarKwh;
    const deficitKwh = Math.max(0, demandKwh - solarKwh);

    if (deficitKwh > 1e-9) {
      dischargedKwh = Math.min(deficitKwh, bankRate, stored);
      availableKwh = solarKwh + dischargedKwh;
    }

    const totalBrownout = this.settings.powerShortageMode === "total_brownout" && availableKwh + 1e-9 < demandKwh;
    let remaining = totalBrownout ? 0 : availableKwh;
    const starvedInstanceIds: string[] = [];
    let supplyKwh = 0;

    for (const consumer of consumers) {
      const delivered = totalBrownout ? 0 : Math.max(0, Math.min(remaining, consumer.draw));
      remaining -= delivered;
      supplyKwh += delivered;
      const starved = delivered + 1e-9 < consumer.draw;
      if (starved) starvedInstanceIds.push(consumer.instance.instanceId);
      consumer.instance.isStarved = starved;
      this.powerByInstance.set(consumer.instance.instanceId, {
        requested: consumer.draw,
        delivered,
        cutReason: starved
          ? totalBrownout
            ? "Total brownout mode: nothing runs until there is enough power for everything."
            : `Not enough power. Priority ${consumer.type.priority} was cut after ${Math.round(availableKwh * 10) / 10} kWh were used by higher-priority systems.`
          : null,
      });
    }

    if (!totalBrownout && remaining > 1e-9) {
      const headroom = Math.max(0, bankCapacity - (this.resources.electricalEnergy ?? 0));
      chargedKwh = Math.min(remaining, bankRate, headroom);
    }

    const brownout = starvedInstanceIds.length > 0;
    const wasBrownout = this.brownoutActive;
    this.brownoutActive = brownout;

    if (brownout && !wasBrownout) {
      const suggested = consumers
        .filter((item) => !item.type.essential)
        .sort((a, b) => b.draw - a.draw)
        .slice(0, 3)
        .map((item) => ({ instanceId: item.instance.instanceId, typeId: item.instance.typeId, powerDraw: round(item.draw, 2) }));
      const payload: BrownoutPayload = {
        demand: round(demandKwh, 2),
        supply: round(supplyKwh, 2),
        deficit: round(Math.max(0, demandKwh - supplyKwh), 2),
        suggestedShutdowns: suggested,
        highlightEnabled: this.settings.highlightGuidance,
        requestPause: true,
      };
      this.emit("BROWNOUT", payload);
      this.requestEmergencyPause("brownout");
    }
    if (!brownout && wasBrownout) {
      this.brownoutsRecovered += 1;
      this.emit("BROWNOUT_ENDED", { message: "Power balance restored." });
      this.emergencyActive = false;
    }

    this.resources.electricalEnergy = clamp(stored + chargedKwh - dischargedKwh, 0, bankCapacity || Number.MAX_SAFE_INTEGER);

    return {
      solarKwh: round(solarKwh, 3),
      demandKwh: round(demandKwh, 3),
      supplyKwh: round(supplyKwh, 3),
      deficitKwh: round(Math.max(0, demandKwh - supplyKwh), 3),
      chargedKwh: round(chargedKwh, 3),
      dischargedKwh: round(dischargedKwh, 3),
      brownout,
      mode: this.settings.powerShortageMode,
      starvedInstanceIds,
      sunlightFactor: round(this.sunFactor, 3),
    };
  }

  private requestEmergencyPause(source: string): void {
    if (this.emergencyActive) return;
    this.emergencyActive = true;
    this.emit("EMERGENCY_STARTED", { message: `Emergency from ${source}.` });
    this.clockSink?.requestAutoPause(source);
  }

  /* ------------------------------------------------------------------ crew --- */

  private crewScale(): number {
    return this.crewSize / Math.max(1, this.config.crew.referenceSize);
  }

  private averageCrewActivity(): number {
    const living = this.crewList.filter((member) => member.status !== "Deceased");
    if (living.length === 0) return 0;
    return living.reduce((sum, member) => sum + member.activityMultiplier, 0) / living.length;
  }

  private runCrewConsumption(): void {
    const habitat = this.instanceList.find((instance) => instance.typeId === "pressurized_habitat" && isOperational(instance));
    const flows: Record<string, FlowRecord> = {};
    const activity = this.averageCrewActivity();
    const foodMultiplier = this.activeMultiplier("foodConsumptionMultiplier");

    if (!habitat) {
      this.alerts.push("No working habitat: the crew is suiting up and running down fast.");
      this.warnings.set("crew", { message: "No working habitat.", cause: "Build or repair the Habitat Module." });
      return;
    }

    const type = this.typeOf(habitat);
    const scale = this.crewScale() * (0.4 + 0.6 * activity);
    const records = this.flows.get(habitat.instanceId) ?? {};

    for (const flow of type.inputs) {
      const wanted = flow.amount * scale * (flow.resource === "food" ? foodMultiplier : 1);
      const available = this.resources[flow.resource] ?? 0;
      const got = Math.max(0, Math.min(available, wanted));
      this.resources[flow.resource] = available - got;
      records[flow.resource] = { wanted, got, blocked: got + 1e-9 < wanted };
      if (records[flow.resource].blocked && flow.resource !== "cabinO2") {
        this.warnings.set(flow.resource, {
          message: `${this.resourceName(flow.resource)} is empty.`,
          cause: `The crew needs ${round(wanted, 3)} ${this.resourceUnit(flow.resource)} per hour more.`,
        });
      }
    }

    for (const flow of type.outputs) {
      const made = flow.amount * scale;
      this.resources[flow.resource] = this.clampResource(flow.resource, (this.resources[flow.resource] ?? 0) + made);
      records[flow.resource] = { wanted: made, got: made, blocked: false };
    }

    this.flows.set(habitat.instanceId, { ...flows, ...records });
  }

  /* ------------------------------------------------------------- processors --- */

  private missingDependency(type: BuildingType): string | null {
    for (const tag of type.requires) {
      if (!this.hasCapability(tag)) return this.capabilityLabel(tag);
    }
    for (const group of type.requiresAny) {
      if (group.length > 0 && !group.some((tag) => this.hasCapability(tag))) {
        return group.map((tag) => this.capabilityLabel(tag)).join(" or ");
      }
    }
    if (this.config.power.requirePowerDistribution && type.powerDrawKwh > 0 && !this.provides("power_bus")) {
      return "the Power Controller";
    }
    return null;
  }

  private capabilityLabel(tag: string): string {
    switch (tag) {
      case "cabin":
        return "a working habitat";
      case "crew":
        return "at least one crew member";
      case "power_bus":
        return "the Power Controller";
      case "eva":
        return "an Airlock";
      case "rover_power":
        return "the Rover Charger";
      case "comms":
        return "the Communications Dish";
      case "warning":
        return "the Radiation Monitor";
      case "shelter":
        return "the Radiation Shelter";
      case "parts":
        return "a Parts Locker";
      default:
        return tag;
    }
  }

  private runProcessors(power: PowerStatus): void {
    this.heatRemovedKwh = 0;
    const processorMultiplier = this.activeMultiplier("processorMultiplier");
    const eventEfficiency = this.eventBuildingEfficiency();

    for (const instance of this.instanceList) {
      const type = this.typeOf(instance);
      if (type.special === "processor") this.runProcessorInstance(instance, type, processorMultiplier, eventEfficiency);
      if (type.special === "radiator") this.runRadiator(instance, type, processorMultiplier, eventEfficiency);
      void power;
    }
    this.updateThermal();
  }

  private deliveredRatio(instanceId: string): number {
    const entry = this.powerByInstance.get(instanceId);
    if (!entry || entry.requested <= 0) return 1;
    return clamp(entry.delivered / entry.requested, 0, 1);
  }

  private setpointPaused(type: BuildingType): string | null {
    const volume = this.habitatVolume();
    if (type.typeId === "oxygen_generator") {
      const o2 = this.pressureForMass(this.resources.cabinO2 ?? 0, volume, this.config.gas.o2MolarMassKg);
      if (o2 > this.config.atmosphere.o2VentAboveMmHg) return "Cabin oxygen is already high enough, so the generator rests.";
    }
    if (type.typeId === "co2_removal") {
      const co2 = this.pressureForMass(this.resources.cabinCO2 ?? 0, volume, this.config.gas.co2MolarMassKg);
      if (co2 < this.config.atmosphere.bands.co2SafeMax * 0.5) {
        return "Cabin CO2 is already clean, so the scrubber bed rests.";
      }
    }
    if (type.typeId === "greenhouse") {
      const co2 = this.pressureForMass(this.resources.cabinCO2 ?? 0, volume, this.config.gas.co2MolarMassKg);
      if ((this.resources.capturedCO2 ?? 0) <= 0.001 && co2 < this.config.atmosphere.bands.co2SafeMax) {
        return "No captured CO2 left for the plants to eat.";
      }
    }
    return null;
  }

  /**
   * Cabin-gas loops are setpoint controllers, not pumps running flat out: they work harder
   * the further the cabin is from the target. Without this the buffer swings by a whole hour
   * of crew production and reads as either empty or over the line.
   */
  private setpointControl(type: BuildingType): number {
    const bands = this.config.atmosphere.bands;
    const volume = this.habitatVolume();
    if (type.typeId === "oxygen_generator") {
      const o2 = this.pressureForMass(this.resources.cabinO2 ?? 0, volume, this.config.gas.o2MolarMassKg);
      const top = this.config.atmosphere.o2VentAboveMmHg;
      const bottom = bands.o2SafeMin;
      return clamp((top - o2) / Math.max(0.5, top - bottom), 0, 1);
    }
    if (type.typeId === "co2_removal") {
      const co2 = this.pressureForMass(this.resources.cabinCO2 ?? 0, volume, this.config.gas.co2MolarMassKg);
      const floor = bands.co2SafeMax * 0.5;
      return clamp((co2 - floor) / Math.max(0.5, bands.co2SafeMax - floor), 0, 1);
    }
    return 1;
  }

  private runProcessorInstance(
    instance: BuildingInstance,
    type: BuildingType,
    processorMultiplier: number,
    eventEfficiency: number
  ): void {
    const records: Record<string, FlowRecord> = {};
    const hasInputFlow = type.inputs.length > 0 || type.outputs.length > 0;
    if (!hasInputFlow) {
      // Monitors and dishes are pass/fail, they do not move mass.
      if (isOperational(instance) || RUNNING_STATES.has(instance.status)) {
        instance.lastEfficiency = this.damageMultiplier(instance.damage) * this.deliveredRatio(instance.instanceId);
        this.efficiencyByInstance.set(instance.instanceId, instance.lastEfficiency);
      }
      return;
    }

    if (instance.status === "OFF" || instance.status === "DESTROYED" || instance.status === "UNDER_CONSTRUCTION") {
      this.efficiencyByInstance.set(instance.instanceId, 0);
      this.flows.set(instance.instanceId, records);
      return;
    }

    const missing = this.missingDependency(type);
    if (missing) {
      records.__dependency = { wanted: 0, got: 0, blocked: true };
      this.warnings.set(instance.instanceId, {
        message: `${type.name} cannot run.`,
        cause: `It needs ${missing}.`,
      });
      instance.status = "IDLE";
      instance.lastEfficiency = 0;
      this.efficiencyByInstance.set(instance.instanceId, 0);
      this.flows.set(instance.instanceId, records);
      return;
    }

    if (type.blocksWhenFull) {
      const capacity = this.capacities[type.blocksWhenFull] ?? 0;
      const stored = this.resources[type.blocksWhenFull] ?? 0;
      if (capacity > 0 && stored >= capacity - 1e-9) {
        records.__blocked = { wanted: 0, got: 0, blocked: true };
        this.warnings.set(instance.instanceId, {
          message: `${type.name} is waiting.`,
          cause: `The ${this.resourceName(type.blocksWhenFull)} store is full. Something downstream must use it.`,
        });
        instance.status = "IDLE";
        instance.lastEfficiency = 0;
        this.efficiencyByInstance.set(instance.instanceId, 0);
        this.flows.set(instance.instanceId, records);
        return;
      }
    }

    const paused = this.setpointPaused(type);
    const ratio = this.deliveredRatio(instance.instanceId);
    let efficiency =
      ratio *
      this.damageMultiplier(instance.damage) *
      this.levelMultiplier(instance.level) *
      processorMultiplier *
      eventEfficiency;
    if (paused) efficiency = 0;
    else efficiency *= this.setpointControl(type);

    if (paused) {
      this.warnings.set(instance.instanceId, { message: `${type.name} is resting.`, cause: paused });
      instance.status = "IDLE";
      instance.lastEfficiency = 0;
      this.efficiencyByInstance.set(instance.instanceId, 0);
      this.flows.set(instance.instanceId, records);
      return;
    }

    // Proportional limiting: the scarcest input decides how far the batch goes.
    let scale = efficiency;
    for (const flow of type.inputs) {
      const wanted = flow.amount * efficiency;
      const available = this.resources[flow.resource] ?? 0;
      if (wanted > 0) scale = Math.min(scale, available / flow.amount);
    }
    scale = Math.max(0, scale);

    for (const flow of type.inputs) {
      const wanted = flow.amount * efficiency;
      const got = Math.min(this.resources[flow.resource] ?? 0, flow.amount * scale);
      this.resources[flow.resource] = (this.resources[flow.resource] ?? 0) - got;
      records[flow.resource] = { wanted, got, blocked: got + 1e-9 < wanted };
    }

    for (const flow of type.outputs) {
      const made = flow.amount * scale;
      const before = this.resources[flow.resource] ?? 0;
      const after = this.clampResource(flow.resource, before + made);
      const vented = before + made - after;
      this.resources[flow.resource] = after;
      records[flow.resource] = { wanted: flow.amount * efficiency, got: made, blocked: vented > 1e-9 };
      if (vented > 1e-6 && (flow.resource === "cabinO2" || flow.resource === "methane" || flow.resource === "capturedCO2")) {
        this.alerts.push(`${this.resourceName(flow.resource)} vented overboard: storage full.`);
      }
    }

    instance.lastEfficiency = scale / Math.max(1e-9, efficiency || 1);
    if (scale + 1e-9 < efficiency && type.inputs.some((flow) => (this.resources[flow.resource] ?? 0) <= 1e-9)) {
      for (const flow of type.inputs) {
        if ((this.resources[flow.resource] ?? 0) <= 1e-9) {
          this.warnings.set(instance.instanceId, {
            message: `${type.name} is running slowly.`,
            cause: `It ran out of ${this.resourceName(flow.resource)}.`,
          });
        }
      }
    }
    if (!RUNNING_STATES.has(instance.status) || instance.status === "IDLE") {
      instance.status = type.special === "processor" && type.typeId === "greenhouse" ? "GROWING" : "PROCESSING";
    }
    this.efficiencyByInstance.set(instance.instanceId, scale);
    this.flows.set(instance.instanceId, records);
  }

  private runRadiator(
    instance: BuildingInstance,
    type: BuildingType,
    processorMultiplier: number,
    eventEfficiency: number
  ): void {
    if (type.heatRemovalKwh <= 0) return;
    const ratio = this.deliveredRatio(instance.instanceId);
    const capacity =
      type.heatRemovalKwh *
      ratio *
      this.damageMultiplier(instance.damage) *
      this.levelMultiplier(instance.level) *
      this.activeMultiplier("radiatorMultiplier") *
      eventEfficiency *
      processorMultiplier;
    // A real TCS modulates: the loop only pulls at full rate when the cabin is warm.
    const removed = capacity * this.thermalDemand();
    this.heatRemovedKwh += removed;
    this.flows.set(instance.instanceId, {
      heat: { wanted: type.heatRemovalKwh, got: removed, blocked: ratio + 1e-9 < 1 },
    });
    this.efficiencyByInstance.set(instance.instanceId, ratio);
  }

  /** 0 = cabin is cool enough, 1 = radiator must run at full capacity. */
  private thermalDemand(): number {
    const target = this.config.thermal.thermostatTargetC;
    const band = Math.max(0.5, this.config.thermal.controlBandC);
    const temperature = this.resources.cabinTemperature ?? target;
    return clamp((temperature - (target - band / 2)) / band, 0, 1);
  }

  /* ---------------------------------------------------------------- thermal --- */

  private heatProducedKwh(): number {
    const consumed = this.powerByInstanceTotal();
    const crewHeat = this.config.crew.ratesAtReference.heatKwh * this.crewScale() * this.averageCrewActivity();
    return consumed * this.config.thermal.electricalHeatFraction + crewHeat;
  }

  private powerByInstanceTotal(): number {
    let total = 0;
    for (const entry of this.powerByInstance.values()) total += entry.delivered;
    return total;
  }

  private updateThermal(): void {
    const exterior = this.sunFactor > 0 ? this.config.thermal.dayExteriorC : this.config.thermal.nightExteriorC;
    const temperature = this.resources.cabinTemperature ?? this.config.atmosphere.initialTemperatureC;
    const leaked = (exterior - temperature) * this.config.thermal.ambientKwhPerHourPerC;
    const thermostat = this.thermostatKwh(temperature, exterior);
    const net = this.heatProducedKwh() + leaked + thermostat - this.heatRemovedKwh;
    const next = temperature + net / Math.max(0.001, this.config.thermal.massKwhPerC);
    this.resources.cabinTemperature = clamp(next, -90, 90);
  }

  /** Simple bang-bang heater/cooler around the thermostat target, limited by the bus. */
  private thermostatKwh(temperature: number, exterior: number): number {
    const target = this.config.thermal.thermostatTargetC;
    if (!this.provides("power_bus")) return 0;
    if (temperature < target - 1) {
      // Heating costs power; cold exterior makes it worse.
      return Math.min(4, (target - temperature) * 0.4);
    }
    if (temperature > target + 1 && exterior < temperature) return 0;
    return 0;
  }

  /* ------------------------------------------------------------ crew health --- */

  private currentTier(): { id: string; activityMultiplier: number } {
    const volume = this.habitatVolume();
    const o2 = this.pressureForMass(this.resources.cabinO2 ?? 0, volume, this.config.gas.o2MolarMassKg);
    const co2 = this.pressureForMass(this.resources.cabinCO2 ?? 0, volume, this.config.gas.co2MolarMassKg);
    const temperature = this.resources.cabinTemperature ?? 22;
    const tiers = this.config.crew.survivalTiers;
    // Tiers are listed best-first: take the first tier the cabin actually qualifies for.
    // Anything that fails every tier is worse than critical, so critical is the fallback.
    for (const tier of tiers) {
      if (co2 <= tier.maxCo2MmHg && temperature >= tier.minTempC && temperature <= tier.maxTempC && o2 >= tier.minO2MmHg) {
        return { id: tier.id, activityMultiplier: tier.activityMultiplier };
      }
    }
    const critical = tiers[tiers.length - 1];
    return { id: critical.id, activityMultiplier: critical.activityMultiplier };
  }

  private updateCrewHealth(): void {
    const tier = this.currentTier();
    const foodShort = this.habitatFlowBlocked("food");
    const waterShort = this.habitatFlowBlocked("cleanWater");
    const shelterAvailable = this.provides("shelter");
    const exposed = this.radiationEventActive() && !this.crewSheltered;

    let drain = 0;
    if (tier.id === "critical") drain += 100 / this.config.crew.criticalDrainHours;
    else if (tier.id === "warning") drain += 100 / this.config.crew.warningDrainHours;
    if (foodShort || waterShort) drain += 100 / this.config.crew.starvationDrainHours;
    if (exposed) {
      drain += shelterAvailable
        ? this.config.crew.shelterInPlaceDrainPerHour
        : this.config.crew.exposureDrainPerHour;
      this.emergencyFlags.push("radiation_exposed");
    }

    const recovery = this.config.crew.recoveryPerHour;
    for (const member of this.crewList) {
      if (member.status === "Deceased") continue;
      const before = member.health;
      member.health = clamp(drain > 0 ? member.health - drain : member.health + recovery, 0, 100);
      const shelterPenalty = this.crewSheltered ? this.config.crew.shelteredActivityFactor : 1;
      member.activityMultiplier = tier.activityMultiplier * shelterPenalty * (member.status === "Severe" ? 0.5 : 1);
      const nextStatus: AstronautState["status"] =
        member.health <= 0 ? "Deceased" : member.health <= this.config.crew.severeAtOrBelow ? "Severe" : member.health <= this.config.crew.impairedAtOrBelow ? "Impaired" : "Normal";
      if (nextStatus !== member.status) {
        member.status = nextStatus;
        this.emit("CREW_STATUS_CHANGED", {
          message: `${member.name} is now ${nextStatus.toLowerCase()}.`,
          astronautId: member.id,
        });
      }
      if (before > 0 && member.health <= 0) {
        this.alerts.push(`${member.name} has been lost.`);
      }
    }

    if (tier.id !== "nominal") {
      this.warnings.set("crew", {
        message: `Crew are in the ${tier.id} band.`,
        cause: this.tierCause(tier.id),
      });
    }
  }

  private tierCause(tierId: string): string {
    if (tierId === "critical") return "Air, temperature or supplies are outside what a body can take.";
    if (tierId === "warning") return "Something in the cabin is uncomfortable enough to slow work down.";
    return "";
  }

  private habitatFlowBlocked(resource: string): boolean {
    const habitat = this.instanceList.find((instance) => instance.typeId === "pressurized_habitat");
    if (!habitat) return true;
    return this.flows.get(habitat.instanceId)?.[resource]?.blocked === true;
  }

  /* ----------------------------------------------- construction and repair --- */

  private advanceConstructionAndRepairs(): void {
    for (const instance of this.instanceList) {
      const type = this.typeOf(instance);
      if (instance.status === "UNDER_CONSTRUCTION") {
        instance.constructionRemainingHours = Math.max(0, instance.constructionRemainingHours - 1);
        if (instance.constructionRemainingHours === 0) {
          instance.status = this.defaultStatusFor(type);
          instance.builtAtHour = this.hourNow;
          this.emit("CONSTRUCTION_COMPLETE", { message: `${type.name} is finished.`, instanceId: instance.instanceId });
          this.recomputeCapacities();
        }
        continue;
      }
      if (instance.status === "REPAIRING") {
        instance.repairRemainingHours = Math.max(0, instance.repairRemainingHours - 1);
        if (instance.repairRemainingHours === 0) {
          instance.damage = "none";
          instance.status = this.defaultStatusFor(type);
          this.emit("REPAIR_COMPLETE", { message: `${type.name} is back online.`, instanceId: instance.instanceId });
        }
        continue;
      }
      if (instance.status === "DAMAGED" && instance.damage !== "destroyed") {
        // Damage without a repair order stays damaged; the panel tells the player.
        this.warnings.set(instance.instanceId, {
          message: `${type.name} is ${instance.damage}.`,
          cause: "It needs a repair crew and spare parts.",
        });
      }
    }
  }

  private defaultStatusFor(type: BuildingType): OperationalStatus {
    if (type.allowedStates.includes("ON")) return "ON";
    if (type.allowedStates.includes("PARKED")) return "PARKED";
    if (type.allowedStates.includes("DEPLOYED")) return "DEPLOYED";
    if (type.allowedStates.includes("ACTIVE")) return "ACTIVE";
    return type.allowedStates[0] ?? "ON";
  }

  private runPendingCycles(power: PowerStatus): void {
    for (const instance of this.instanceList) {
      if (!instance.pendingCycle) continue;
      instance.pendingCycle = false;
      const type = this.typeOf(instance);
      const missing = this.missingDependency(type);
      if (missing) {
        this.alerts.push(`${type.name} could not start: it needs ${missing}.`);
        continue;
      }
      if (power.brownout && !type.essential && this.deliveredRatio(instance.instanceId) < 0.5) {
        this.alerts.push(`${type.name} stayed parked: not enough power.`);
        continue;
      }

      this.idCounters[`cycle:${type.typeId}`] = (this.idCounters[`cycle:${type.typeId}`] ?? 0) + 1;

      if (type.special === "rover") {
        instance.status = "MOVING";
        for (const flow of type.outputs) {
          this.resources[flow.resource] = this.clampResource(flow.resource, (this.resources[flow.resource] ?? 0) + flow.amount);
        }
        const tripCredits = this.config.economy.roverCycleCredits;
        this.resources.money = (this.resources.money ?? 0) + tripCredits;
        this.roverCycles += 1;
        this.emit("BUILDING_UPGRADED", { message: `${type.name} came back with samples and science.`, instanceId: instance.instanceId });
        this.alerts.push(`${type.name} completed a science trip (+${tripCredits} credits, regolith collected).`);
        if (this.radiationEventActive()) {
          this.alerts.push("The rover crew was outside during the storm.");
          for (const member of this.crewList) {
            if (member.status !== "Deceased") member.health = clamp(member.health - 12, 0, 100);
          }
        }
        continue;
      }

      if (type.special === "airlock") {
        // EVA: crews clean panel dust, at the price of time and exposure.
        this.dustClearance = Math.min(1, this.dustClearance + 0.6);
       this.resources.money = (this.resources.money ?? 0) + this.config.economy.evaCredits;
        this.emit("BUILDING_UPGRADED", { message: "EVA complete: panels wiped, sunlight recovery improved.", instanceId: instance.instanceId });
        if (this.radiationEventActive() && !this.crewSheltered) {
          for (const member of this.crewList) {
            if (member.status !== "Deceased") member.health = clamp(member.health - 18, 0, 100);
          }
          this.alerts.push("The EVA crew took a radiation dose while outside.");
        }
        continue;
      }

      if (type.special === "storage" || type.special === "processor") {
        for (const flow of type.outputs) {
          this.resources[flow.resource] = this.clampResource(flow.resource, (this.resources[flow.resource] ?? 0) + flow.amount);
        }
      }
    }

    // Rover returns to park the hour after it moved.
    for (const instance of this.instanceList) {
      if (this.typeOf(instance).special === "rover" && instance.status === "MOVING") {
        instance.status = "PARKED";
      }
    }
  }

  /* -------------------------------------------------------------- power-ups --- */

  private definitionFor(typeId: string): PowerUpDefinition | undefined {
    return this.config.powerUps.find((definition) => definition.typeId === typeId);
  }

  private advancePowerUps(): void {
    for (const state of this.powerUps) {
      const definition = this.definitionFor(state.typeId);
      if (!definition) continue;

      if (state.activeRemainingHours > 0) {
        state.activeRemainingHours = Math.max(0, state.activeRemainingHours - 1);
        if (state.activeRemainingHours === 0) {
          this.emit("POWERUP_EXPIRED", { message: `${definition.name} wore off.` });
          if (state.cooldownRemainingHours <= 0) state.cooldownRemainingHours = definition.cooldownHours;
        }
        continue;
      }

      if (state.cooldownRemainingHours > 0) {
        state.cooldownRemainingHours = Math.max(0, state.cooldownRemainingHours - 1);
        if (state.cooldownRemainingHours === 0 && state.charges < definition.maxCharges) {
          state.charges += 1;
          this.emit("POWERUP_CHARGED", { message: `${definition.name} ready again (${state.charges}/${definition.maxCharges}).` });
        }
        continue;
      }

      if (state.charges < definition.maxCharges) {
        state.charges += 1;
        this.emit("POWERUP_CHARGED", { message: `${definition.name} recharged (${state.charges}/${definition.maxCharges}).` });
      }
    }

    if (this.crateList.length < 4 && this.rng.next() < 0.05) this.spawnCollectible();
  }

  private spawnCollectible(): void {
    if (this.config.powerUps.length === 0) return;
    const definition = this.config.powerUps[this.rng.nextInt(this.config.powerUps.length)];
    const collectible: PowerUpCollectible = {
      collectibleId: `crate-${this.nextCollectibleSerial}`,
      typeId: definition.typeId,
      position: { x: 120 + this.rng.next() * 1040, y: 110 + this.rng.next() * 560 },
    };
    this.nextCollectibleSerial += 1;
    this.crateList.push(collectible);
    this.emit("POWERUP_SPAWNED", { message: `A supply crate landed on the surface.` });
  }

  /* --------------------------------------------------------------------- xp --- */

  private essentialsOk(): boolean {
    for (const type of this.db.buildings) {
      if (!type.essential) continue;
      const working = this.instanceList.some(
        (instance) => instance.typeId === type.typeId && isOperational(instance) && !instance.isStarved
      );
      if (!working) return false;
    }
    return true;
  }

  private awardSteadyStateXp(power: PowerStatus): void {
    const calm = !power.brownout && !this.radiationEventActive() && this.crewList.some((member) => member.status !== "Deceased");
    if (!calm || !this.essentialsOk()) return;
    const gain = this.config.crew.optimalXpPerHour * this.averageCrewActivity() * this.crewScale();
    if (gain <= 0) return;
    this.resources.xp = (this.resources.xp ?? 0) + gain;
  }

  /**
   * Science only pays when it reaches home. Once per sol, a working comms dish sells the
   * outpost's data and brings in the credits every bigger build needs.
   */
  private paySolIncome(): void {
    const solHours = Math.max(1, Math.round(this.config.time.stepsPerDay));
    if (this.hourNow <= 0 || this.hourNow % solHours !== 0) return;
    const dish = this.instanceList.some(
      (instance) =>
        instance.typeId === "communications" && isOperational(instance) && !instance.isStarved
    );
    if (!dish) {
      this.alerts.push("No working comms dish: this sol's science could not be sent home.");
      return;
    }
    const credits = round(this.config.economy.uplinkCreditsPerSol * this.crewScale(), 0);
    this.resources.money = (this.resources.money ?? 0) + credits;
    this.alerts.push(`Science uplink sold to the agency: +${credits} credits.`);
    // The same ship that takes the data down brings consumables up, so a base that keeps
    // its dish working can always afford to fix something.
    const parts = this.config.economy.resupplyPartsPerSol;
    if (parts > 0) {
      this.resources.spareParts = this.clampResource("spareParts", (this.resources.spareParts ?? 0) + parts);
      this.alerts.push(`Resupply crate landed: +${parts} spare ${parts === 1 ? "part" : "parts"}.`);
    }
  }

  /* ------------------------------------------------------------ alert + end --- */

  private gatherAlerts(power: PowerStatus, atmosphere: StepResult["atmosphere"]): void {
    if (power.brownout) {
      this.alerts.push(`Power shortage: ${round(power.deficitKwh, 1)} kWh short this hour.`);
    }
    const battery = this.resourceSnapshot(this.habitatVolume()).display.electricalEnergy;
    if (battery && battery.value <= 20) {
      this.alerts.push(`Battery is low (${Math.round(battery.value)}%).`);
    }
    if (atmosphere.o2Band !== "safe") this.alerts.push(`Cabin oxygen ${atmosphere.o2Band}: ${round(atmosphere.o2MmHg, 1)} mmHg.`);
    if (atmosphere.co2Band !== "safe") this.alerts.push(`Cabin CO2 ${atmosphere.co2Band}: ${round(atmosphere.co2MmHg, 2)} mmHg.`);
    if (atmosphere.temperatureBand !== "safe") this.alerts.push(`Cabin temperature ${atmosphere.temperatureBand}: ${round(atmosphere.temperatureC, 1)} C.`);

    if (this.radiationEventActive()) {
      this.alerts.push(
        this.crewSheltered
          ? "Radiation event: crew are sheltered and not working."
          : "Radiation event: crew are exposed! Shelter them or the dose adds up."
      );
    }
    for (const definition of this.db.resources) {
      if (!["food", "cleanWater", "spareParts", "nutrients"].includes(definition.id)) continue;
      const capacity = this.capacities[definition.id] ?? 0;
      const value = this.resources[definition.id] ?? 0;
      if (capacity > 0 && value / capacity <= 0.15) {
        this.alerts.push(`${definition.name} is running out (${Math.round((value / capacity) * 100)}%).`);
      }
    }
    for (const instance of this.instanceList) {
      if (instance.isStarved) {
        const type = this.typeOf(instance);
        this.alerts.push(`${type.name} is starved of power and working slowly.`);
      }
    }
  }

  private checkMissionFailure(): void {
    if (this.missionStatus.state !== "active") return;
    const allDead = this.crewList.length > 0 && this.crewList.every((member) => member.status === "Deceased");
    const habitatGone = !this.instanceList.some(
      (instance) => instance.typeId === "pressurized_habitat" && instance.status !== "DESTROYED"
    );
    if (!allDead && !habitatGone) return;
    const reason = habitatGone ? "The habitat was destroyed and there is nowhere to live." : "The whole crew is gone.";
    this.missionStatus = { state: "failed", reason };
    this.emit("MISSION_FAILED", { message: reason });
  }

  /* ------------------------------------------------------------- view model --- */

  private o2Band(mmHg: number): SafetyBand {
    const bands = this.config.atmosphere.bands;
    if (mmHg >= bands.o2SafeMin && mmHg <= bands.o2SafeMax) return "safe";
    if (mmHg >= bands.o2WarningMin) return "warning";
    return "critical";
  }

  private co2Band(mmHg: number): SafetyBand {
    const bands = this.config.atmosphere.bands;
    if (mmHg <= bands.co2SafeMax) return "safe";
    if (mmHg <= bands.co2WarningMax) return "warning";
    return "critical";
  }

  private tempBand(celsius: number): SafetyBand {
    const bands = this.config.atmosphere.bands;
    if (celsius >= bands.tempSafeMin && celsius <= bands.tempSafeMax) return "safe";
    if (celsius >= bands.tempWarningLowMin && celsius <= bands.tempWarningHighMax) return "warning";
    return "critical";
  }

  private molarMass(definitionId: string): number {
    const definition = this.db.resources.find((item) => item.id === definitionId);
    if (definition?.molarMassKgPerMol) return definition.molarMassKgPerMol;
    return definitionId === "cabinCO2" ? this.config.gas.co2MolarMassKg : this.config.gas.o2MolarMassKg;
  }

  private displayFor(definitionId: string, value: number, capacity: number, volume: number): { value: number; unit: string } {
    const definition = this.db.resources.find((item) => item.id === definitionId);
    const kind = definition?.display ?? "raw";
    switch (kind) {
      case "percent_capacity":
        return { value: capacity > 0 ? round((value / capacity) * 100, 1) : 0, unit: "%" };
      case "partial_pressure_mmHg":
        return { value: round(this.pressureForMass(value, volume, this.molarMass(definitionId)), 2), unit: "mmHg" };
      case "celsius":
        return { value: round(value, 2), unit: "C" };
      default:
        return { value: round(value, 3), unit: definition?.unit ?? "" };
    }
  }

  private resourceSnapshot(volume: number): ResourceSnapshot {
    const raw: Record<string, number> = {};
    const capacity: Record<string, number> = {};
    const display: Record<string, { value: number; unit: string }> = {};
    for (const definition of this.db.resources) {
      raw[definition.id] = round(this.resources[definition.id] ?? 0, 4);
      capacity[definition.id] = round(this.capacities[definition.id] ?? 0, 4);
      display[definition.id] = this.displayFor(definition.id, raw[definition.id], capacity[definition.id], volume);
    }
    return { raw, capacity, display };
  }

  private resourceName(resource: string): string {
    return this.db.resources.find((item) => item.id === resource)?.name ?? resource;
  }

  private resourceUnit(resource: string): string {
    return this.db.resources.find((item) => item.id === resource)?.unit ?? "";
  }

  private buildStepResult(power: PowerStatus): StepResult {
    const volume = this.habitatVolume();
    const o2MmHg = this.pressureForMass(this.resources.cabinO2 ?? 0, volume, this.config.gas.o2MolarMassKg);
    const co2MmHg = this.pressureForMass(this.resources.cabinCO2 ?? 0, volume, this.config.gas.co2MolarMassKg);
    const temperatureC = this.resources.cabinTemperature ?? this.config.atmosphere.initialTemperatureC;

    const atmosphere = {
      volumeM3: round(volume, 2),
      o2MmHg: round(o2MmHg, 2),
      co2MmHg: round(co2MmHg, 3),
      temperatureC: round(temperatureC, 2),
      o2Band: this.o2Band(o2MmHg),
      co2Band: this.co2Band(co2MmHg),
      temperatureBand: this.tempBand(temperatureC),
    };

    this.gatherAlerts(power, atmosphere);
    this.checkMissionFailure();

    const radiationActive = this.radiationEventActive();
    const radiationExposure: StepResult["radiationExposure"] = radiationActive
      ? this.crewSheltered
        ? "sheltered"
        : "exposed"
      : "nominal";

    if (this.emergencyActive && !radiationActive && !power.brownout) {
      this.emergencyActive = false;
      this.emit("EMERGENCY_RECOVERED", { message: "All clear." });
    }

    return {
      hour: this.hourNow,
      resources: this.resourceSnapshot(volume),
      instances: this.instanceList.map((instance) => ({ ...instance })),
      crew: this.crewList.map((member) => ({ ...member })),
      xp: round(this.resources.xp ?? 0, 2),
      alerts: [...this.alerts],
      emergencyFlags: [...this.emergencyFlags],
      events: [...this.stepEvents],
      powerStatus: power,
      missionStatus: this.missionStatus,
      radiationExposure,
      atmosphere,
    };
  }

  /* ----------------------------------------------------------- public reads --- */

  get hour(): number {
    return this.hourNow;
  }

  get paused(): boolean {
    return this.pausedFlag;
  }

  set paused(value: boolean) {
    this.pausedFlag = value;
  }

  private pausedFlag = true;

  get speedIndex(): number {
    return this.speedSlot;
  }

  setSpeed(index: number): void {
    this.speedSlot = clamp(Math.round(index), 0, Math.max(0, this.config.time.speeds.length - 1));
  }

  private speedSlot = 1;

  msPerSimHour(): number {
    const multiplier = this.config.time.speeds[this.speedSlot] ?? 1;
    return this.config.time.baseMsPerSimHour / Math.max(0.05, multiplier);
  }

  settingsSnapshot(): SimulatorSettings {
    return { ...this.settings };
  }

  get mode(): PowerShortageMode {
    return this.settings.powerShortageMode;
  }

  get highlightGuidance(): boolean {
    return this.settings.highlightGuidance;
  }

  lunarPhase(): { daylight: boolean; sunlightFactor: number; hoursToChange: number } {
    const { daylightHours, nightHours, cycleEnabled } = this.config.lunar;
    if (!cycleEnabled) {
      return { daylight: true, sunlightFactor: round(this.sunFactor, 3), hoursToChange: 0 };
    }
    const cycle = Math.max(1, daylightHours + nightHours);
    const phase = ((this.hourNow % cycle) + cycle) % cycle;
    const daylight = phase < daylightHours;
    return {
      daylight,
      sunlightFactor: round(this.sunFactor, 3),
      hoursToChange: round(daylight ? daylightHours - phase : cycle - phase, 2),
    };
  }

  instances(): BuildingInstance[] {
    return this.instanceList.map((instance) => ({ ...instance }));
  }

  instance(instanceId: string): BuildingInstance | undefined {
    return this.instanceList.find((instance) => instance.instanceId === instanceId);
  }

  crew(): AstronautState[] {
    return this.crewList.map((member) => ({ ...member }));
  }

  /** Radiation events inside the next simulated day - feeds `utils/radiation.ts`. */
  radiationStormCount(): number {
    const windowEnd = this.hourNow + 24;
    return this.tracked.filter(
      (event) =>
        event.effects.radiation === true &&
        !event.ended &&
        event.startHour + event.durationHours >= this.hourNow &&
        event.startHour <= windowEnd
    ).length;
  }

  crewShelteredNow(): boolean {
    return this.crewSheltered;
  }

  counters(): { roverCycles: number; powerUpsCollected: number; brownoutsRecovered: number } {
    return {
      roverCycles: this.roverCycles,
      powerUpsCollected: this.powerUpsCollected,
      brownoutsRecovered: this.brownoutsRecovered,
    };
  }

  awardedRewards(): string[] {
    return [...this.awardedRewardIds];
  }

  /** A level costs one perfectly run simulated day, derived from the config. */
  level(): { level: number; xpToNext: number } {
    const perLevel = Math.max(1, this.config.crew.optimalXpPerHour * this.config.time.stepsPerDay);
    const xp = this.resources.xp ?? 0;
    const level = Math.floor(xp / perLevel) + 1;
    return { level, xpToNext: round(level * perLevel - xp, 2) };
  }

  collectibles(): PowerUpCollectible[] {
    return this.crateList.map((crate) => ({ ...crate, position: { ...crate.position } }));
  }

  powerUpViews(): PowerUpView[] {
    return this.powerUps.map((state) => {
      const definition = this.definitionFor(state.typeId);
      if (!definition) {
        return { state, ready: false, reason: "Unknown boost." } as unknown as PowerUpView;
      }
      const ready = state.charges > 0 && state.activeRemainingHours === 0;
      let reason: string | null = null;
      if (state.activeRemainingHours > 0) reason = `Running for ${state.activeRemainingHours} more h.`;
      else if (state.charges === 0) reason = `Recharging: ${state.cooldownRemainingHours} h to go.`;
      return { definition, state: { ...state }, ready, reason };
    });
  }

  eventViews(): EnvironmentEventView[] {
    return this.tracked.map((event) => {
      let phase: EventPhase;
      if (event.active || this.hourNow >= event.startHour) phase = event.ended ? "ended" : "active";
      else if (event.ended) phase = "ended";
      else if (event.warned) phase = "warning";
      else phase = "upcoming";
      if (event.ended) phase = "ended";
      return {
        id: event.id,
        type: event.type,
        phase,
        hoursToStart: round(event.startHour - this.hourNow, 2),
        hoursRemaining: round(event.startHour + event.durationHours - this.hourNow, 2),
        label: this.eventLabel(event.type),
        kidExplanation: this.eventExplanation(event.type),
        radiation: event.effects.radiation === true,
      };
    });
  }

  private eventExplanation(type: string): string {
    switch (type) {
      case "solar_particle_event":
        return "Fast charged particles from the Sun. The crew has to be behind dirt or shielding.";
      case "solar_flare":
        return "A bright burst of light and radio noise. It can blind the dish and sting the crew.";
      case "coronal_mass_ejection":
        return "A cloud of solar plasma. It can chip the panels and keeps radiation high for hours.";
      case "dust_storm":
        return "Lofted dust darkens the panel glass, so the outpost makes less power.";
      case "micrometeoroid_strike":
        return "A tiny rock moving very fast. There is no warning, only repair.";
      default:
        return "Something the Moon or the Sun does to the outpost.";
    }
  }

  buildables(): BuildableTypeInfo[] {
    const xp = this.resources.xp ?? 0;
    return this.db.buildings.map((type) => {
      const built = this.instanceList.filter((instance) => instance.typeId === type.typeId).length;
      const unlocked = xp >= type.unlockXp;
      const full = built >= type.maxInstances;
      const missing: string[] = [];
      if ((this.resources.money ?? 0) < type.buildCost.money) missing.push(`${Math.round(type.buildCost.money)} credits`);
      if ((this.resources.regolith ?? 0) < type.buildCost.regolith) missing.push(`${type.buildCost.regolith} kg regolith`);
      if ((this.resources.spareParts ?? 0) < type.buildCost.spareParts) missing.push(`${type.buildCost.spareParts} spare parts`);
      return {
        typeId: type.typeId,
        name: type.name,
        kidDescription: type.kidDescription,
        buildCost: { ...type.buildCost },
        buildHours: type.buildHours,
        unlocked,
        lockReason: unlocked ? null : `Needs ${type.unlockXp} XP (the crew has ${Math.floor(xp)}).`,
        affordable: unlocked && !full && missing.length === 0,
        affordabilityReason: full
          ? `Already at the maximum of ${type.maxInstances}.`
          : missing.length > 0
            ? `Still need ${missing.join(", ")}.`
            : null,
        instances: built,
        maxInstances: type.maxInstances,
      };
    });
  }

  /* ------------------------------------------------------------- inspect --- */

  inspect(instanceId: string | null): SystemPanelData | null {
    if (!instanceId) return null;
    const instance = this.instance(instanceId);
    if (!instance) return null;
    const type = this.typeOf(instance);
    const records = this.flows.get(instanceId) ?? {};
    const power = this.powerByInstance.get(instanceId);
    const requested = power?.requested ?? 0;
    const delivered = power?.delivered ?? 0;

    const mapFlows = (flows: { resource: string; amount: number }[]): PanelFlow[] =>
      flows.map((flow) => {
        const record = records[flow.resource];
        return {
          resourceId: flow.resource,
          label: this.resourceName(flow.resource),
          unit: this.resourceUnit(flow.resource),
          wantedPerHour: round(record?.wanted ?? flow.amount, 4),
          actualPerHour: round(record?.got ?? 0, 4),
          blocked: record?.blocked ?? false,
        };
      });

    const tags = [...type.requires, ...type.requiresAny.flat()];
    if (type.powerDrawKwh > 0 && this.config.power.requirePowerDistribution && !tags.includes("power_bus")) {
      tags.push("power_bus");
    }
    const dependsOn: PanelDependency[] = tags.map((tag) => {
      const okTag = this.hasCapability(tag);
      return {
        typeId: tag,
        name: this.capabilityLabel(tag),
        ok: okTag,
        problemReason: okTag ? null : `Nothing is providing ${this.capabilityLabel(tag)}.`,
      };
    });

    const warning = this.warnings.get(instanceId) ?? null;
    const levelMultiplier = this.levelMultiplier(instance.level);
    const grants = type.capacityGrants.map((grant) => ({
      resourceId: grant.resource,
      label: this.resourceName(grant.resource),
      amount: round(grant.amount * levelMultiplier, 3),
      unit: this.resourceUnit(grant.resource),
    }));

    const actions: PanelAction[] = [];
    const constructing = instance.status === "UNDER_CONSTRUCTION";

    if (constructing) {
      actions.push({
        kind: "cancel",
        instanceId: instance.instanceId,
        label: "Stop building",
        enabled: true,
        reason: null,
        cost: `Refunds ${Math.round(this.config.construction.demolishRefundFraction * 100)}% of the parts used.`,
      });
    } else if (type.allowedStates.includes("ON") && type.allowedStates.includes("OFF")) {
      const on = RUNNING_STATES.has(instance.status);
      actions.push({
        kind: on ? "stop" : "start",
        instanceId: instance.instanceId,
        label: on ? "Switch off" : "Switch on",
        enabled: instance.damage !== "destroyed",
        reason: instance.damage === "destroyed" ? "It is destroyed - repair it first." : null,
        cost: type.powerDrawKwh > 0 ? `${round(type.powerDrawKwh, 2)} kWh per hour` : null,
      });
    }

    if (type.special === "rover" || type.special === "airlock") {
      const canCycle = !constructing && instance.damage !== "destroyed" && !instance.pendingCycle && !this.crewSheltered;
      actions.push({
        kind: "cycle",
        instanceId: instance.instanceId,
        label: type.special === "rover" ? "Send on science trip" : "Crew EVA (clean panels)",
        enabled: canCycle,
        reason: this.crewSheltered
          ? "The crew is sheltered - bring them out first."
          : instance.pendingCycle
            ? "Already queued for this hour."
            : null,
        cost: type.special === "rover" ? `${round(type.powerDrawKwh, 2)} kWh, crew away from base` : "Crew time and no shielding outside",
      });
    }

    if (instance.damage !== "none") {
      const rule = this.config.repair[instance.damage as "minor" | "moderate" | "critical"];
      const partsNeeded = rule?.parts ?? 0;
      const blocked = instance.damage === "destroyed"
        ? "Destroyed systems cannot be repaired - build a new one."
        : !rule
          ? null
          : (this.resources.spareParts ?? 0) < partsNeeded
            ? `Needs ${partsNeeded} spare parts.`
            : rule.directPlayer || this.averageCrewActivity() >= 0.5
              ? null
              : "A big repair needs a fit crew.";
      actions.push({
        kind: "repair",
        instanceId: instance.instanceId,
        label: "Repair",
        enabled: blocked === null,
        reason: blocked,
        cost: rule ? `${rule.parts} parts, ${rule.hours} h` : null,
      });
    }

    const nextUpgrade = type.upgrades.find((upgrade) => upgrade.level === instance.level + 1);
    if (nextUpgrade && !constructing) {
      const missing: string[] = [];
      if ((this.resources.money ?? 0) < nextUpgrade.costMoney) missing.push(`${nextUpgrade.costMoney} credits`);
      if ((this.resources.spareParts ?? 0) < nextUpgrade.costParts) missing.push(`${nextUpgrade.costParts} parts`);
      actions.push({
        kind: "upgrade",
        instanceId: instance.instanceId,
        label: `Upgrade to level ${nextUpgrade.level}`,
        enabled: missing.length === 0,
        reason: missing.length > 0 ? `Still need ${missing.join(" and ")}.` : null,
        cost: `${nextUpgrade.costMoney} credits, ${nextUpgrade.costParts} parts, +${Math.round((this.config.level.bonusPerLevel) * 100)}%`,
      });
    }

    if (!constructing) {
      actions.push({
        kind: "demolish",
        instanceId: instance.instanceId,
        label: "Remove",
        enabled: true,
        reason: type.essential ? "This system is essential - the outpost will suffer." : null,
        cost: `Returns ${Math.round(this.config.construction.demolishRefundFraction * 100)}% of the build cost.`,
      });
    }

    return {
      instanceId: instance.instanceId,
      typeId: instance.typeId,
      name: type.name,
      kidDescription: type.kidDescription,
      slotLabel: instance.slotId,
      status: instance.status,
      damage: instance.damage,
      level: instance.level,
      efficiency: round(this.efficiencyByInstance.get(instanceId) ?? instance.lastEfficiency, 3),
      powerRequestedKwh: round(requested, 3),
      powerDeliveredKwh: round(delivered, 3),
      cutReason: power?.cutReason ?? null,
      inputs: mapFlows(type.inputs),
      outputs: mapFlows(type.outputs),
      grants,
      warning: warning?.message ?? null,
      warningCause: warning?.cause ?? null,
      dependsOn,
      actions,
      sourceNote:
        type.inputs.concat(type.outputs).length > 0
          ? "Flow rates come from buildings.json. Numbers marked NASA are real rates; the rest are game assumptions."
          : "Structure and storage rules from buildings.json (game assumptions).",
    };
  }

  /* -------------------------------------------------------------- actions --- */

  private missingBuildCost(type: BuildingType): string | null {
    const missing: string[] = [];
    if ((this.resources.money ?? 0) < type.buildCost.money) {
      missing.push(`${Math.round(type.buildCost.money - (this.resources.money ?? 0))} credits`);
    }
    if ((this.resources.regolith ?? 0) < type.buildCost.regolith) {
      missing.push(`${round(type.buildCost.regolith - (this.resources.regolith ?? 0), 1)} kg regolith`);
    }
    if ((this.resources.spareParts ?? 0) < type.buildCost.spareParts) {
      missing.push(`${type.buildCost.spareParts - (this.resources.spareParts ?? 0)} spare parts`);
    }
    return missing.length === 0 ? null : `Not enough: still short ${missing.join(", ")}.`;
  }

  private payBuildCost(type: BuildingType): void {
    this.resources.money = Math.max(0, (this.resources.money ?? 0) - type.buildCost.money);
    this.resources.regolith = Math.max(0, (this.resources.regolith ?? 0) - type.buildCost.regolith);
    this.resources.spareParts = Math.max(0, (this.resources.spareParts ?? 0) - type.buildCost.spareParts);
  }

  build(typeId: string, slotId?: string | null): Result<BuildingInstance> {
    const type = this.types.get(typeId);
    if (!type) return err("UNKNOWN_TYPE", `There is no system called ${typeId}.`);
    if ((this.resources.xp ?? 0) < type.unlockXp) {
      return err("LOCKED", `${type.name} unlocks at ${type.unlockXp} XP.`);
    }
    const built = this.instanceList.filter((instance) => instance.typeId === typeId).length;
    if (built >= type.maxInstances) {
      return err("MAX_INSTANCES", `You already have the maximum of ${type.maxInstances} ${type.name}(s).`);
    }
    const missing = this.missingBuildCost(type);
    if (missing) return err("CANNOT_AFFORD", missing);
    const chosenSlot = slotId ?? `slot-${this.nextInstanceSerial}`;
    if (this.instanceList.some((instance) => instance.slotId === chosenSlot)) {
      return err("SLOT_TAKEN", "That pad is already used.");
    }
    this.payBuildCost(type);
    const instance = this.makeInstance(typeId, "UNDER_CONSTRUCTION", chosenSlot);
    instance.constructionRemainingHours = type.buildHours;
    this.instanceList.push(instance);
    this.emit("CONSTRUCTION_STARTED", {
      message: `${type.name} is under construction (${type.buildHours} h).`,
      instanceId: instance.instanceId,
    });
    return ok(instance);
  }

  cancelConstruction(instanceId: string): Result<void> {
    const instance = this.instance(instanceId);
    if (!instance) return err("NOT_FOUND", "That system is gone.");
    if (instance.status !== "UNDER_CONSTRUCTION") return err("NOT_BUILDING", "Nothing is being built there.");
    this.refund(this.typeOf(instance));
    this.removeInstance(instanceId);
    this.emit("BUILDING_DEMOLISHED", { message: "Construction stopped and parts returned.", instanceId });
    return ok(undefined);
  }

  demolish(instanceId: string): Result<void> {
    const instance = this.instance(instanceId);
    if (!instance) return err("NOT_FOUND", "That system is gone.");
    const type = this.typeOf(instance);
    this.refund(type);
    this.removeInstance(instanceId);
    this.emit("BUILDING_DEMOLISHED", { message: `${type.name} removed.`, instanceId });
    this.recomputeCapacities();
    return ok(undefined);
  }

  private refund(type: BuildingType): void {
    const fraction = this.config.construction.demolishRefundFraction;
    this.resources.money = (this.resources.money ?? 0) + type.buildCost.money * fraction;
    this.resources.regolith = this.clampResource(
      "regolith",
      (this.resources.regolith ?? 0) + type.buildCost.regolith * fraction
    );
    this.resources.spareParts = (this.resources.spareParts ?? 0) + type.buildCost.spareParts * fraction;
  }

  private removeInstance(instanceId: string): void {
    this.instanceList = this.instanceList.filter((instance) => instance.instanceId !== instanceId);
    this.flows.delete(instanceId);
    this.powerByInstance.delete(instanceId);
    this.efficiencyByInstance.delete(instanceId);
    this.warnings.delete(instanceId);
  }

  repair(instanceId: string): Result<void> {
    const instance = this.instance(instanceId);
    if (!instance) return err("NOT_FOUND", "That system is gone.");
    if (instance.damage === "none") return err("NOTHING_TO_REPAIR", "That system is fine.");
    if (instance.damage === "destroyed") return err("DESTROYED", "Destroyed systems cannot be repaired - build a new one.");
    if (instance.status === "REPAIRING") return err("ALREADY_REPAIRING", "A repair crew is already on it.");
    const rule = this.config.repair[instance.damage];
    if (!rule) return err("NO_RULE", `No repair rule for ${instance.damage} damage.`);
    if ((this.resources.spareParts ?? 0) < rule.parts) {
      return err("NO_PARTS", `Needs ${rule.parts} spare parts. Build a Parts Locker or wait for a resupply.`);
    }
    if (!rule.directPlayer && this.averageCrewActivity() < 0.5) {
      return err("CREW_TOO_WEAK", "A big repair needs a crew that is not exhausted.");
    }
    this.resources.spareParts = (this.resources.spareParts ?? 0) - rule.parts;
    instance.status = "REPAIRING";
    instance.repairRemainingHours = rule.hours;
    return ok(undefined);
  }

  upgrade(instanceId: string): Result<void> {
    const instance = this.instance(instanceId);
    if (!instance) return err("NOT_FOUND", "That system is gone.");
    const type = this.typeOf(instance);
    const next = type.upgrades.find((upgrade) => upgrade.level === instance.level + 1);
    if (!next) return err("MAX_LEVEL", `${type.name} is already at its top level.`);
    if ((this.resources.money ?? 0) < next.costMoney || (this.resources.spareParts ?? 0) < next.costParts) {
      return err("CANNOT_AFFORD", `Upgrade needs ${next.costMoney} credits and ${next.costParts} parts.`);
    }
    this.resources.money = (this.resources.money ?? 0) - next.costMoney;
    this.resources.spareParts = (this.resources.spareParts ?? 0) - next.costParts;
    instance.level = next.level;
    this.recomputeCapacities();
    this.emit("BUILDING_UPGRADED", { message: `${type.name} is now level ${next.level}.`, instanceId });
    return ok(undefined);
  }

  setStatus(instanceId: string, status: "ON" | "OFF"): Result<void> {
    const instance = this.instance(instanceId);
    if (!instance) return err("NOT_FOUND", "That system is gone.");
    const type = this.typeOf(instance);
    if (instance.status === "UNDER_CONSTRUCTION") return err("BUILDING", "Wait for the build to finish.");
    if (instance.damage === "destroyed") return err("DESTROYED", `${type.name} is destroyed.`);
    if (!type.allowedStates.includes(status)) {
      return err("BAD_STATE", `${type.name} cannot be switched ${status.toLowerCase()}.`);
    }
    if (status === "ON" && this.crewSheltered && type.special === "rover") {
      return err("SHELTERED", "The crew is sheltered, so the rover cannot be used.");
    }
    instance.status = status;
    instance.isStarved = false;
    return ok(undefined);
  }

  runCycle(instanceId: string): Result<void> {
    const instance = this.instance(instanceId);
    if (!instance) return err("NOT_FOUND", "That system is gone.");
    const type = this.typeOf(instance);
    if (type.special !== "rover" && type.special !== "airlock") {
      return err("NO_CYCLE", `${type.name} does not do trips.`);
    }
    if (instance.status === "UNDER_CONSTRUCTION") return err("BUILDING", "It is not finished yet.");
    if (instance.damage === "destroyed") return err("DESTROYED", `${type.name} is destroyed.`);
    if (this.crewSheltered) return err("SHELTERED", "Bring the crew out of the shelter first.");
    const missing = this.missingDependency(type);
    if (missing) return err("DEPENDENCY", `${type.name} needs ${missing}.`);
    instance.pendingCycle = true;
    return ok(undefined);
  }

  activatePowerUp(typeId: string): Result<void> {
    const state = this.powerUps.find((item) => item.typeId === typeId);
    const definition = this.definitionFor(typeId);
    if (!state || !definition) return err("UNKNOWN_POWERUP", `No boost called ${typeId}.`);
    if (state.activeRemainingHours > 0) return err("ALREADY_ACTIVE", `${definition.name} is already running.`);
    if (state.charges <= 0) return err("NO_CHARGES", `${definition.name} is recharging (${state.cooldownRemainingHours} h).`);
    state.charges -= 1;
    state.activeRemainingHours = definition.durationHours;
    state.cooldownRemainingHours = 0;
    this.emit("POWERUP_ACTIVATED", { message: `${definition.name} on for ${definition.durationHours} h.` });
    return ok(undefined);
  }

  collectPowerUp(collectibleId: string): Result<void> {
    const crateIndex = this.crateList.findIndex((crate) => crate.collectibleId === collectibleId);
    if (crateIndex < 0) return err("NOT_FOUND", "That crate is not out there.");
    const crate = this.crateList[crateIndex];
    if (!this.provides("eva")) return err("NO_AIRLOCK", "You need a working Airlock to go outside and get it.");
    if (this.crewSheltered) return err("SHELTERED", "The crew is sheltered - they cannot fetch the crate now.");
    const state = this.powerUps.find((item) => item.typeId === crate.typeId);
    const definition = this.definitionFor(crate.typeId);
    if (state && definition && state.charges < definition.maxCharges) state.charges += 1;
    this.crateList.splice(crateIndex, 1);
    this.powerUpsCollected += 1;
    this.emit("POWERUP_COLLECTED", { message: `Collected a crate (${definition?.name ?? crate.typeId}).`, collectibleId });
    return ok(undefined);
  }

  setCrewSheltered(on: boolean): Result<void> {
    if (on && !this.provides("shelter")) return err("NO_SHELTER", "Build the Radiation Shelter first.");
    if (on && this.crewSheltered) return ok(undefined);
    this.crewSheltered = on;
    this.alerts.push(
      on
        ? "Crew are in the shelter: protected, but not repairing or working outside."
        : "Crew are back at work."
    );
    if (!on && this.radiationEventActive()) {
      this.alerts.push("Careful: a radiation event is still active and the crew is exposed.");
    }
    return ok(undefined);
  }

  setPowerShortageMode(mode: PowerShortageMode): void {
    this.settings.powerShortageMode = mode;
  }

  setHighlightGuidance(on: boolean): void {
    this.settings.highlightGuidance = on;
  }

  /** The only place XP is awarded. Reward ids are stable and deduplicated. */
  awardXp(rewardId: string, amount: number): Result<number> {
    if (this.awardedRewardIds.includes(rewardId)) return ok(this.resources.xp ?? 0);
    this.awardedRewardIds.push(rewardId);
    this.resources.xp = Math.max(0, (this.resources.xp ?? 0) + amount);
    return ok(this.resources.xp);
  }

  /* ----------------------------------------------------------- persistence --- */

  snapshot(): SimulatorSnapshot {
    return {
      version: 1,
      hour: this.hourNow,
      seed: this.rng.seed,
      resources: { ...this.resources },
      capacities: { ...this.capacities },
      instances: this.instanceList.map((instance) => ({ ...instance })),
      crew: this.crewList.map((member) => ({ ...member })),
      settings: { ...this.settings },
      missionStatus: this.missionStatus,
      powerUps: this.powerUps.map((state) => ({ ...state })),
      collectibles: this.crateList.map((crate) => ({ ...crate, position: { ...crate.position } })),
      events: this.tracked.map((event) => ({ ...event })),
      brownoutActive: this.brownoutActive,
      emergencyActive: this.emergencyActive,
      nextInstanceSerial: this.nextInstanceSerial,
      nextCollectibleSerial: this.nextCollectibleSerial,
      idCounters: { ...this.idCounters },
    };
  }

  saveJson(): string {
    return JSON.stringify({
      envelope: 1,
      sim: this.snapshot(),
      progress: {
        awardedRewards: this.awardedRewardIds,
        crewSheltered: this.crewSheltered,
        roverCycles: this.roverCycles,
        powerUpsCollected: this.powerUpsCollected,
        brownoutsRecovered: this.brownoutsRecovered,
        speedIndex: this.speedSlot,
        dustClearance: this.dustClearance,
      },
    });
  }

  static fromSave(db: GameDatabase, json: string, options: SimulatorOptions = {}): OutpostSimulator {
    const parsed = JSON.parse(json) as SimulatorSnapshot & {
      envelope?: number;
      sim?: SimulatorSnapshot;
      progress?: Partial<{
        awardedRewards: string[];
        crewSheltered: boolean;
        roverCycles: number;
        powerUpsCollected: number;
        brownoutsRecovered: number;
        speedIndex: number;
        dustClearance: number;
      }>;
    };
    const snapshot = parsed.sim ?? parsed;
    const sim = new OutpostSimulator(db, options);
    sim.adopt(snapshot);
    const progress = parsed.progress;
    if (progress) {
      sim.awardedRewardIds = progress.awardedRewards ?? [];
      sim.crewSheltered = progress.crewSheltered ?? false;
      sim.roverCycles = progress.roverCycles ?? 0;
      sim.powerUpsCollected = progress.powerUpsCollected ?? 0;
      sim.brownoutsRecovered = progress.brownoutsRecovered ?? 0;
      sim.speedSlot = progress.speedIndex ?? 1;
      sim.dustClearance = progress.dustClearance ?? 0;
    }
    sim.last = sim.buildStepResult(sim.resolvePower());
    return sim;
  }

  private adopt(snapshot: SimulatorSnapshot): void {
    this.rng.setState(snapshot.seed >>> 0);
    this.hourNow = Math.max(0, Math.floor(snapshot.hour));
    this.resources = { ...snapshot.resources };
    this.capacities = { ...snapshot.capacities };
    this.instanceList = snapshot.instances.map((instance) => ({ ...instance }));
    this.crewList = snapshot.crew.map((member) => ({ ...member }));
    this.settings = { ...snapshot.settings };
    this.missionStatus = snapshot.missionStatus;
    this.powerUps = snapshot.powerUps.map((state) => ({ ...state }));
    this.crateList = snapshot.collectibles.map((crate) => ({ ...crate, position: { ...crate.position } }));
    this.tracked =
      snapshot.events.length > 0 ? snapshot.events.map((event) => ({ ...event })) : this.tracked;
    this.brownoutActive = snapshot.brownoutActive;
    this.emergencyActive = snapshot.emergencyActive;
    this.nextInstanceSerial = snapshot.nextInstanceSerial;
    this.nextCollectibleSerial = snapshot.nextCollectibleSerial;
    this.idCounters = { ...snapshot.idCounters };
    if (this.crewList.length > 0) {
      this.crewSize = clamp(this.crewList.length, 1, this.config.crew.names.length);
    }
  }
}
