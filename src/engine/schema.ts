import { DataValidationError } from "./result";
import type {
  BuildingType,
  EnvironmentalEvent,
  GameDatabase,
  OperationalStatus,
  OutpostConfig,
  ResourceDefinition,
  SourcedNumber,
} from "../types/outpost";

const SOURCES = new Set(["nasa", "game_assumption"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fail(path: string, message: string): never {
  throw new DataValidationError(`${path}: ${message}`);
}

function isSourced(value: unknown): value is SourcedNumber {
  return isRecord(value) && "v" in value && "source" in value && Object.keys(value).every((k) => k === "v" || k === "source" || k === "note");
}

/** Every numeric leaf must be `{ v, source }`. Strings and booleans stay as-is. */
export function assertSourcedTree(value: unknown, path: string): void {
  if (typeof value === "number") {
    fail(path, "bare number is not allowed; use { \"v\": number, \"source\": \"nasa\" | \"game_assumption\" }");
  }
  if (typeof value === "string" || typeof value === "boolean" || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertSourcedTree(item, `${path}[${i}]`));
    return;
  }
  if (!isRecord(value)) fail(path, "expected object, array, string, boolean, or sourced number");
  if (isSourced(value)) {
    if (typeof value.v !== "number" || !Number.isFinite(value.v)) fail(path, "sourced v must be a finite number");
    if (typeof value.source !== "string" || !SOURCES.has(value.source)) {
      fail(path, 'source must be "nasa" or "game_assumption"');
    }
    if (value.note !== undefined && typeof value.note !== "string") fail(path, "note must be a string");
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    assertSourcedTree(child, `${path}.${key}`);
  }
}

export function flattenSourced<T>(value: unknown): T {
  if (isSourced(value)) return value.v as T;
  if (Array.isArray(value)) return value.map((item) => flattenSourced(item)) as T;
  if (isRecord(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) out[key] = flattenSourced(child);
    return out as T;
  }
  return value as T;
}

const RESOURCE_IDS = [
  "electricalEnergy",
  "cleanWater",
  "wasteWater",
  "cabinO2",
  "cabinCO2",
  "food",
  "nutrients",
  "solidWaste",
  "cabinTemperature",
  "spareParts",
  "regolith",
  "money",
  "xp",
  "hydrogen",
  "methane",
  "capturedCO2",
] as const;

const BUILDING_IDS = [
  "pressurized_habitat",
  "airlock",
  "greenhouse",
  "solar_array",
  "battery_bank",
  "power_distribution",
  "rover_charger",
  "water_recovery",
  "oxygen_generator",
  "co2_removal",
  "sabatier",
  "thermal_control",
  "radiation_monitor",
  "radiation_shelter",
  "cargo_module",
  "communications",
  "rover",
  "spare_parts_storage",
] as const;

export function validateGameDatabase(raw: {
  resources: unknown;
  buildings: unknown;
  config: unknown;
  events: unknown;
}): GameDatabase {
  assertSourcedTree(raw.resources, "resources.json");
  assertSourcedTree(raw.buildings, "buildings.json");
  assertSourcedTree(raw.config, "outpost.config.json");
  assertSourcedTree(raw.events, "events.local.json");

  const resourcesFlat = flattenSourced<ResourceDefinition[]>(raw.resources);
  const buildingsFlat = flattenSourced<BuildingType[]>(raw.buildings);
  const config = flattenSourced<OutpostConfig>(raw.config);
  const eventsDoc = flattenSourced<{ events: EnvironmentalEvent[] }>(raw.events);

  if (!Array.isArray(resourcesFlat)) fail("resources.json", "root must be an array");
  const seen = new Set<string>();
  for (const [index, resource] of resourcesFlat.entries()) {
    const path = `resources.json[${index}]`;
    if (!resource || typeof resource.id !== "string") fail(path, "missing id");
    if (seen.has(resource.id)) fail(path, `duplicate id ${resource.id}`);
    seen.add(resource.id);
    if (typeof resource.unit !== "string") fail(path, "unit must be a string");
    if (typeof resource.capacitySource !== "string") fail(path, "capacitySource must be a string");
    if (!["percent_capacity", "partial_pressure_mmHg", "celsius", "raw"].includes(resource.display)) {
      fail(path, "display is invalid");
    }
    if (resource.baseCapacity !== null && typeof resource.baseCapacity !== "number") {
      fail(path, "baseCapacity must be a number or null");
    }
  }
  for (const id of RESOURCE_IDS) {
    if (!seen.has(id)) fail("resources.json", `missing starter resource ${id}`);
  }

  if (!Array.isArray(buildingsFlat)) fail("buildings.json", "root must be an array");
  if (buildingsFlat.length !== BUILDING_IDS.length) {
    fail("buildings.json", `expected ${BUILDING_IDS.length} building types, found ${buildingsFlat.length}`);
  }
  const typeIds = new Set<string>();
  for (const [index, building] of buildingsFlat.entries()) {
    const path = `buildings.json[${index}]`;
    if (!building || typeof building.typeId !== "string") fail(path, "missing typeId");
    if (typeIds.has(building.typeId)) fail(path, `duplicate typeId ${building.typeId}`);
    typeIds.add(building.typeId);
    if (typeof building.name !== "string" || typeof building.kidDescription !== "string") {
      fail(path, "name and kidDescription are required");
    }
    if (!Array.isArray(building.allowedStates) || building.allowedStates.length === 0) {
      fail(path, "allowedStates must be a non-empty array");
    }
    if (building.aggregation !== "stack") fail(path, 'aggregation must be "stack"');
    if (!building.buildCost) fail(path, "buildCost is required");
    building.inputs = building.inputs ?? [];
    building.outputs = building.outputs ?? [];
    building.requires = building.requires ?? [];
    building.requiresAny = building.requiresAny ?? [];
    building.provides = building.provides ?? [];
    building.capacityGrants = building.capacityGrants ?? [];
    building.upgrades = building.upgrades ?? [];
    building.volumeM3 = building.volumeM3 ?? 0;
    building.heatRemovalKwh = building.heatRemovalKwh ?? 0;
    building.solarKwhPerFullSunHour = building.solarKwhPerFullSunHour ?? 0;
    building.batteryCapacityKwh = building.batteryCapacityKwh ?? 0;
    building.batteryRateKwh = building.batteryRateKwh ?? 0;
    for (const flow of [...building.inputs, ...building.outputs]) {
      if (!seen.has(flow.resource)) fail(path, `unknown resource ${flow.resource}`);
    }
    for (const grant of building.capacityGrants) {
      if (!seen.has(grant.resource)) fail(path, `unknown capacity resource ${grant.resource}`);
    }
  }
  for (const id of BUILDING_IDS) {
    if (!typeIds.has(id)) fail("buildings.json", `missing building type ${id}`);
  }

  if (!config?.crew?.ratesAtReference) fail("outpost.config.json", "crew.ratesAtReference is required");
  if (!config.gas || config.gas.rJoules <= 0 || config.gas.paPerMmHg <= 0) {
    fail("outpost.config.json", "gas constants must be positive");
  }
  if (!config.time || config.time.baseMsPerSimHour <= 0) {
    fail("outpost.config.json", "time.baseMsPerSimHour must be positive");
  }
  const habitat = buildingsFlat.find((b) => b.typeId === "pressurized_habitat");
  if (!habitat) fail("buildings.json", "missing habitat");
  const rates = config.crew.ratesAtReference;
  if (habitat.inputs.length === 0) fail("buildings.json pressurized_habitat", "crew inputs must be listed on the habitat");

  if (!eventsDoc || !Array.isArray(eventsDoc.events)) fail("events.local.json", "events array is required");
  for (const [index, event] of eventsDoc.events.entries()) {
    const path = `events.local.json.events[${index}]`;
    if (!event.id || !event.type) fail(path, "id and type are required");
    if (event.durationHours < 0 || event.warningLeadHours < 0) fail(path, "durations must be >= 0");
  }

  const database: GameDatabase = {
    resources: resourcesFlat,
    buildings: buildingsFlat,
    config,
    events: eventsDoc.events,
  };
  assertHabitatRatesMatch(database, rates);
  return database;
}

function assertHabitatRatesMatch(db: GameDatabase, rates: OutpostConfig["crew"]["ratesAtReference"]): void {
  const habitat = db.buildings.find((b) => b.typeId === "pressurized_habitat");
  if (!habitat) return;
  const input = (id: string) => habitat.inputs.find((flow) => flow.resource === id)?.amount;
  const output = (id: string) => habitat.outputs.find((flow) => flow.resource === id)?.amount;
  const checks: [string, number, number | undefined][] = [
    ["food", rates.foodKg, input("food")],
    ["cleanWater", rates.cleanWaterL, input("cleanWater")],
    ["cabinO2", rates.cabinO2Kg, input("cabinO2")],
    ["cabinCO2", rates.cabinCo2Kg, output("cabinCO2")],
    ["wasteWater", rates.wasteWaterL, output("wasteWater")],
    ["solidWaste", rates.solidWasteKg, output("solidWaste")],
  ];
  for (const [name, expected, actual] of checks) {
    if (actual === undefined || Math.abs(actual - expected) > 1e-9) {
      fail("outpost.config.json", `crew rate ${name} (${expected}) must match pressurized_habitat flow (${actual})`);
    }
  }
}

export function assertRawDocument(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) fail(label, "document must be an object");
  return value;
}

export function assertStatus(value: string): OperationalStatus {
  return value as OperationalStatus;
}
