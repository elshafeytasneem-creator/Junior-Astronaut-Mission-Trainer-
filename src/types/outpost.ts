/** Public types for the headless OutpostSimulator. No rendering or mission-flow types. */

export type SourceTag = "nasa" | "game_assumption";

export type SourcedNumber = {
  v: number;
  source: SourceTag;
  note?: string;
};

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } };

export type CrewStatus = "Normal" | "Impaired" | "Severe" | "Deceased";

export type DamageLevel = "none" | "minor" | "moderate" | "critical" | "destroyed";

export type OperationalStatus =
  | "ON"
  | "OFF"
  | "IDLE"
  | "PROCESSING"
  | "CHARGING"
  | "DAMAGED"
  | "REPAIRING"
  | "DESTROYED"
  | "UNDER_CONSTRUCTION"
  | "DEPLOYED"
  | "STOWED"
  | "CYCLING"
  | "PRESSURIZING"
  | "GROWING"
  | "REGENERATING"
  | "ACTIVE"
  | "INACTIVE"
  | "PARKED"
  | "MOVING"
  | "AVAILABLE"
  | "LOW"
  | "EMPTY"
  | "FULL";

export type PowerShortageMode = "total_brownout" | "priority";

export type MissionStatus =
  | { state: "active" }
  | { state: "failed"; reason: string };

export type DisplayKind = "percent_capacity" | "partial_pressure_mmHg" | "celsius" | "raw";

export type SafetyBand = "safe" | "warning" | "critical";

export interface ResourceDefinition {
  id: string;
  name: string;
  unit: string;
  /** Where the number comes from, in words (building sum, site stockpile, atmosphere). */
  capacitySource: string;
  display: DisplayKind;
  /** Null means unlimited. Building grants add to this base. */
  baseCapacity: number | null;
  initial: number;
  min: number;
  /** Hard cap independent of buildings. Null means no extra cap. */
  hardMax: number | null;
  safeRange: { min: number | null; max: number | null; unit: string } | null;
  molarMassKgPerMol: number | null;
}

export interface ResourceFlow {
  resource: string;
  amount: number;
}

export interface CapacityGrant {
  resource: string;
  amount: number;
}

export interface BuildCost {
  money: number;
  regolith: number;
  spareParts: number;
}

export interface UpgradeLevel {
  level: number;
  costMoney: number;
  costParts: number;
  hours: number;
}

export type BuildingSpecial =
  | "processor"
  | "solar"
  | "battery"
  | "habitat"
  | "radiator"
  | "airlock"
  | "rover"
  | "rover_charger"
  | "storage"
  | "passive";

export interface BuildingType {
  typeId: string;
  name: string;
  kidDescription: string;
  priority: number;
  essential: boolean;
  passive: boolean;
  powerDrawKwh: number;
  inputs: ResourceFlow[];
  outputs: ResourceFlow[];
  requires: string[];
  /** Each inner list is an OR-group; every group must match. */
  requiresAny: string[][];
  provides: string[];
  allowedStates: OperationalStatus[];
  capacityGrants: CapacityGrant[];
  volumeM3: number;
  heatRemovalKwh: number;
  solarKwhPerFullSunHour: number;
  batteryCapacityKwh: number;
  batteryRateKwh: number;
  aggregation: "stack";
  maxInstances: number;
  unlockXp: number;
  buildCost: BuildCost;
  buildHours: number;
  upgrades: UpgradeLevel[];
  special: BuildingSpecial;
  /** If this resource is at capacity, the processor does not run. */
  blocksWhenFull?: string;
}

export interface BuildingInstance {
  instanceId: string;
  typeId: string;
  status: OperationalStatus;
  damage: DamageLevel;
  level: number;
  slotId: string | null;
  builtAtHour: number;
  repairRemainingHours: number;
  constructionRemainingHours: number;
  /** One-shot movement / EVA cycle queued for the next processing pass. */
  pendingCycle: boolean;
  isStarved: boolean;
  lastEfficiency: number;
}

export interface AstronautState {
  id: string;
  name: string;
  health: number;
  status: CrewStatus;
  activityMultiplier: number;
  assignedTaskId: string | null;
}

export interface SimulatorSettings {
  powerShortageMode: PowerShortageMode;
  highlightGuidance: boolean;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface PowerUpDefinition {
  typeId: string;
  name: string;
  kidDescription: string;
  durationHours: number;
  cooldownHours: number;
  maxCharges: number;
  initialCharges: number;
  solarMultiplier: number;
  powerDrawMultiplier: number;
  processorMultiplier: number;
  radiatorMultiplier: number;
  foodConsumptionMultiplier: number;
}

export interface PowerUpState {
  typeId: string;
  charges: number;
  cooldownRemainingHours: number;
  activeRemainingHours: number;
}

export interface PowerUpCollectible {
  collectibleId: string;
  typeId: string;
  position: Vector2;
}

export interface EnvironmentEffects {
  sunlightMultiplier?: number;
  buildingEfficiency?: number;
  resourceDeltas?: Record<string, number>;
  damage?: { typeId?: string; instanceId?: string; level: DamageLevel };
  /** Marks a radiation event. Shelter changes exposure reporting only. */
  radiation?: boolean;
}

export interface EnvironmentalEvent {
  id: string;
  type: string;
  startHour: number;
  durationHours: number;
  warningLeadHours: number;
  effects: EnvironmentEffects;
}

export interface TrackedEnvironmentEvent extends EnvironmentalEvent {
  warned: boolean;
  active: boolean;
  ended: boolean;
  damageApplied: boolean;
}

export type SimEventName =
  | "BROWNOUT"
  | "BROWNOUT_ENDED"
  | "EMERGENCY_STARTED"
  | "EMERGENCY_RECOVERED"
  | "CREW_STATUS_CHANGED"
  | "BUILDING_DAMAGED"
  | "REPAIR_COMPLETE"
  | "CONSTRUCTION_STARTED"
  | "CONSTRUCTION_COMPLETE"
  | "BUILDING_DEMOLISHED"
  | "BUILDING_UPGRADED"
  | "CAPACITY_CHANGED"
  | "ENV_WARNING"
  | "ENV_ACTIVE"
  | "ENV_ENDED"
  | "POWERUP_ACTIVATED"
  | "POWERUP_EXPIRED"
  | "POWERUP_CHARGED"
  | "POWERUP_COLLECTED"
  | "POWERUP_SPAWNED"
  | "MISSION_FAILED";

export interface BrownoutPayload {
  demand: number;
  supply: number;
  deficit: number;
  suggestedShutdowns: { instanceId: string; typeId: string; powerDraw: number }[];
  highlightEnabled: boolean;
  requestPause: boolean;
}

export interface SimEvent {
  name: SimEventName;
  payload: unknown;
}

export interface ResourceSnapshot {
  raw: Record<string, number>;
  capacity: Record<string, number>;
  display: Record<string, { value: number; unit: string }>;
}

export interface PowerStatus {
  solarKwh: number;
  demandKwh: number;
  supplyKwh: number;
  deficitKwh: number;
  chargedKwh: number;
  dischargedKwh: number;
  brownout: boolean;
  mode: PowerShortageMode;
  starvedInstanceIds: string[];
  sunlightFactor: number;
}

export interface StepResult {
  hour: number;
  resources: ResourceSnapshot;
  instances: BuildingInstance[];
  crew: AstronautState[];
  xp: number;
  alerts: string[];
  emergencyFlags: string[];
  events: SimEvent[];
  powerStatus: PowerStatus;
  missionStatus: MissionStatus;
  radiationExposure: "nominal" | "exposed" | "sheltered";
  atmosphere: {
    volumeM3: number;
    o2MmHg: number;
    co2MmHg: number;
    temperatureC: number;
    o2Band: SafetyBand;
    co2Band: SafetyBand;
    temperatureBand: SafetyBand;
  };
}

export interface BuildableTypeInfo {
  typeId: string;
  name: string;
  kidDescription: string;
  buildCost: BuildCost;
  buildHours: number;
  unlocked: boolean;
  lockReason: string | null;
  affordable: boolean;
  affordabilityReason: string | null;
  instances: number;
  maxInstances: number;
}

export interface CrewRates {
  foodKg: number;
  cleanWaterL: number;
  cabinO2Kg: number;
  cabinCo2Kg: number;
  wasteWaterL: number;
  solidWasteKg: number;
  heatKwh: number;
}

export interface RepairRule {
  hours: number;
  parts: number;
  directPlayer: boolean;
}

export interface SurvivalTier {
  id: string;
  maxCo2MmHg: number;
  minTempC: number;
  maxTempC: number;
  minO2MmHg: number;
  activityMultiplier: number;
}

export interface OutpostConfig {
  meta: { citations: string[] };
  time: {
    stepsPerDay: number;
    baseMsPerSimHour: number;
    speeds: number[];
  };
  crew: {
    referenceSize: number;
    defaultSize: number;
    names: string[];
    ratesAtReference: CrewRates;
    impairedAtOrBelow: number;
    severeAtOrBelow: number;
    criticalDrainHours: number;
    warningDrainHours: number;
    starvationDrainHours: number;
    recoveryPerHour: number;
    exposureDrainPerHour: number;
    shelterInPlaceDrainPerHour: number;
    shelteredActivityFactor: number;
    optimalXpPerHour: number;
    survivalTiers: SurvivalTier[];
  };
  atmosphere: {
    initialTemperatureC: number;
    initialO2MmHg: number;
    initialCo2MmHg: number;
    o2VentAboveMmHg: number;
    comfortTempMinC: number;
    comfortTempMaxC: number;
    bands: {
      o2SafeMin: number;
      o2SafeMax: number;
      o2WarningMin: number;
      co2SafeMax: number;
      co2WarningMax: number;
      tempSafeMin: number;
      tempSafeMax: number;
      tempWarningLowMin: number;
      tempWarningHighMax: number;
      tempCriticalLow: number;
      tempCriticalHigh: number;
    };
  };
  gas: {
    rJoules: number;
    paPerMmHg: number;
    o2MolarMassKg: number;
    co2MolarMassKg: number;
  };
  thermal: {
    massKwhPerC: number;
    electricalHeatFraction: number;
    ambientKwhPerHourPerC: number;
    dayExteriorC: number;
    nightExteriorC: number;
    thermostatTargetC: number;
    controlBandC: number;
  };
  power: {
    requirePowerDistribution: boolean;
    shortageModeDefault: PowerShortageMode;
    highlightGuidanceDefault: boolean;
  };
  economy: {
    /** Credits the agency pays for one completed rover science trip. */
    roverCycleCredits: number;
    /** Credits for an EVA (panel cleaning, sample pickup). */
    evaCredits: number;
    /** Credits paid each sol when a working comms dish beams the science home. */
    uplinkCreditsPerSol: number;
    /** Spare parts the supply lander delivers with the data relay, so repairs never dead-end. */
    resupplyPartsPerSol: number;
  };
  damageMultipliers: Record<DamageLevel, number>;
  repair: Record<"minor" | "moderate" | "critical", RepairRule>;
  construction: { demolishRefundFraction: number };
  level: { bonusPerLevel: number };
  lunar: {
    daylightHours: number;
    nightHours: number;
    cycleEnabled: boolean;
  };
  environment: {
    /** Lead time used when no radiation monitor is operational, as a fraction of the event lead. */
    unmonitoredLeadScale: number;
    defaultStormHours: number;
  };
  xp: { starting: number };
  starterInstances: { typeId: string; status: OperationalStatus; slotId?: string }[];
  powerUps: PowerUpDefinition[];
}

export interface GameDatabase {
  resources: ResourceDefinition[];
  buildings: BuildingType[];
  config: OutpostConfig;
  events: EnvironmentalEvent[];
}

export interface MissionTaskEffect {
  repairInstanceId?: string;
  upgradeInstanceId?: string;
  airlockInstanceId?: string;
  roverInstanceId?: string;
  roverMoving?: boolean;
  resourceDeltas?: Record<string, number>;
  xp?: number;
  money?: number;
  crewAssignments?: { astronautId: string; taskId: string | null }[];
  crewHealth?: { astronautId: string; health: number }[];
  damage?: { instanceId: string; level: DamageLevel };
}

export interface SimulatorSnapshot {
  version: 1;
  hour: number;
  seed: number;
  resources: Record<string, number>;
  capacities: Record<string, number>;
  instances: BuildingInstance[];
  crew: AstronautState[];
  settings: SimulatorSettings;
  missionStatus: MissionStatus;
  powerUps: PowerUpState[];
  collectibles: PowerUpCollectible[];
  events: TrackedEnvironmentEvent[];
  brownoutActive: boolean;
  emergencyActive: boolean;
  nextInstanceSerial: number;
  nextCollectibleSerial: number;
  idCounters: Record<string, number>;
}

export interface SimulatorOptions {
  crewSize?: number;
  seed?: number;
  settings?: Partial<SimulatorSettings>;
  resources?: ResourceDefinition[];
  events?: EnvironmentalEvent[];
  /** Injectable clock. The simulator never reads the wall clock itself. */
  clock?: { requestAutoPause(source: string): void };
}

export type EventHandler<T = unknown> = (payload: T) => void;
