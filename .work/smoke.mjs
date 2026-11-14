// src/data/resources.json
var resources_default = [
  {
    id: "electricalEnergy",
    name: "Battery energy",
    unit: "kWh",
    capacitySource: "Sum of working battery bank capacities",
    display: "percent_capacity",
    baseCapacity: { v: 0, source: "game_assumption", note: "No energy storage until a battery bank is built." },
    initial: { v: 114, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: null,
    molarMassKgPerMol: null
  },
  {
    id: "cleanWater",
    name: "Clean water",
    unit: "L",
    capacitySource: "Sum of cargo module clean-water grants",
    display: "percent_capacity",
    baseCapacity: { v: 0, source: "game_assumption" },
    initial: { v: 240, source: "game_assumption", note: "Water the cargo lander brought up: about sixty days for four crew at a lean ration, which is why closing the loop matters." },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: { min: { v: 0, source: "game_assumption" }, max: null, unit: "L" },
    molarMassKgPerMol: null
  },
  {
    id: "wasteWater",
    name: "Waste water",
    unit: "L",
    capacitySource: "Sum of cargo module waste-water grants",
    display: "percent_capacity",
    baseCapacity: { v: 0, source: "game_assumption" },
    initial: { v: 10, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: null,
    molarMassKgPerMol: null
  },
  {
    id: "cabinO2",
    name: "Cabin oxygen",
    unit: "kg",
    capacitySource: "Shared cabin atmosphere; excess above the safe band is vented",
    display: "partial_pressure_mmHg",
    baseCapacity: null,
    initial: { v: 0, source: "game_assumption", note: "Replaced at load with the mass for initialO2MmHg." },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: { min: { v: 145, source: "nasa", note: "NASA-STD-3001 ppO2 lower comfort." }, max: { v: 155, source: "nasa" }, unit: "mmHg" },
    molarMassKgPerMol: { v: 0.032, source: "nasa", note: "O2 molar mass used by the ideal-gas display." }
  },
  {
    id: "cabinCO2",
    name: "Cabin carbon dioxide",
    unit: "kg",
    capacitySource: "Shared cabin atmosphere",
    display: "partial_pressure_mmHg",
    baseCapacity: null,
    initial: { v: 0, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: { min: { v: 0, source: "nasa" }, max: { v: 3, source: "nasa", note: "NASA-STD-3001 CO2 limit." }, unit: "mmHg" },
    molarMassKgPerMol: { v: 0.044, source: "nasa" }
  },
  {
    id: "food",
    name: "Food",
    unit: "kg",
    capacitySource: "Sum of cargo module food grants",
    display: "percent_capacity",
    baseCapacity: { v: 0, source: "game_assumption" },
    initial: { v: 80, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: null,
    molarMassKgPerMol: null
  },
  {
    id: "nutrients",
    name: "Plant nutrients",
    unit: "kg",
    capacitySource: "Sum of cargo module nutrient grants",
    display: "percent_capacity",
    baseCapacity: { v: 0, source: "game_assumption" },
    initial: { v: 4, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: null,
    molarMassKgPerMol: null
  },
  {
    id: "solidWaste",
    name: "Solid waste",
    unit: "kg",
    capacitySource: "Sum of cargo module solid-waste grants",
    display: "percent_capacity",
    baseCapacity: { v: 0, source: "game_assumption" },
    initial: { v: 1, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: null,
    molarMassKgPerMol: null
  },
  {
    id: "cabinTemperature",
    name: "Cabin temperature",
    unit: "C",
    capacitySource: "Thermal state of the shared cabin, not a tank",
    display: "celsius",
    baseCapacity: null,
    initial: { v: 22, source: "nasa", note: "NASA-STD-3001 nominal cabin temperature used as the start point." },
    min: { v: -80, source: "game_assumption" },
    hardMax: { v: 80, source: "game_assumption" },
    safeRange: { min: { v: 18, source: "nasa" }, max: { v: 27, source: "nasa" }, unit: "C" },
    molarMassKgPerMol: null
  },
  {
    id: "spareParts",
    name: "Spare parts",
    unit: "count",
    capacitySource: "Sum of spare-parts storage grants",
    display: "percent_capacity",
    baseCapacity: { v: 0, source: "game_assumption" },
    initial: { v: 12, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: { min: { v: 0, source: "game_assumption" }, max: { v: 20, source: "game_assumption" }, unit: "count" },
    molarMassKgPerMol: null
  },
  {
    id: "regolith",
    name: "Regolith",
    unit: "kg",
    capacitySource: "Site stockpile base capacity plus any future grants",
    display: "percent_capacity",
    baseCapacity: { v: 500, source: "game_assumption", note: "Starting outpost can hold 500 kg on the surface." },
    initial: { v: 420, source: "game_assumption", note: "Dirt the cargo lander pushed into a berm on site: enough to build the shelter and still have material left for the rover." },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: null,
    molarMassKgPerMol: null
  },
  {
    id: "money",
    name: "Mission credits",
    unit: "credits",
    capacitySource: "Unlimited",
    display: "raw",
    baseCapacity: null,
    initial: { v: 5e3, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: null,
    molarMassKgPerMol: null
  },
  {
    id: "xp",
    name: "Shared crew experience",
    unit: "xp",
    capacitySource: "Unlimited shared pool",
    display: "raw",
    baseCapacity: null,
    initial: { v: 0, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: null,
    molarMassKgPerMol: null
  },
  {
    id: "hydrogen",
    name: "Hydrogen",
    unit: "kg",
    capacitySource: "Sum of oxygen-generator hydrogen tank grants",
    display: "percent_capacity",
    baseCapacity: { v: 0, source: "game_assumption" },
    initial: { v: 0.2, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: null,
    molarMassKgPerMol: null
  },
  {
    id: "methane",
    name: "Methane",
    unit: "kg",
    capacitySource: "Sum of Sabatier methane store grants; excess is vented",
    display: "percent_capacity",
    baseCapacity: { v: 0, source: "game_assumption" },
    initial: { v: 0, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: null,
    molarMassKgPerMol: null
  },
  {
    id: "capturedCO2",
    name: "Captured carbon dioxide",
    unit: "kg",
    capacitySource: "Sum of CDRA store grants; excess is vented",
    display: "percent_capacity",
    baseCapacity: { v: 0, source: "game_assumption" },
    initial: { v: 0, source: "game_assumption" },
    min: { v: 0, source: "game_assumption" },
    hardMax: null,
    safeRange: null,
    molarMassKgPerMol: null
  }
];

// src/data/buildings.json
var buildings_default = [
  {
    typeId: "pressurized_habitat",
    name: "Habitat Module",
    kidDescription: "The crew's pressurized home. It holds the air they breathe and it is where they sleep, eat and warm up.",
    priority: { v: 10, source: "game_assumption", note: "Shed last: it is the crew's living volume." },
    essential: true,
    passive: false,
    powerDrawKwh: { v: 2.5, source: "game_assumption", note: "Fans, lights and cabin controls per simulated hour." },
    inputs: [
      { resource: "food", amount: { v: 0.125, source: "nasa", note: "0.75 kg food per crew member per day x 4 crew / 24 h (NASA-STD-3001 food plan)." } },
      { resource: "cleanWater", amount: { v: 0.6, source: "nasa", note: "3.6 L drinking + hygiene per crew member per day x 4 / 24 h." } },
      { resource: "cabinO2", amount: { v: 0.14, source: "nasa", note: "0.84 kg O2 per crew member per day x 4 / 24 h." } }
    ],
    outputs: [
      { resource: "cabinCO2", amount: { v: 0.18, source: "nasa", note: "About 1.08 kg CO2 per crew member per day x 4 / 24 h." } },
      { resource: "wasteWater", amount: { v: 0.25, source: "game_assumption", note: "Greywater, 1.5 L per crew member per day x 4 / 24 h." } },
      { resource: "solidWaste", amount: { v: 0.1, source: "game_assumption", note: "0.6 kg per crew member per day x 4 / 24 h." } }
    ],
    requires: [],
    requiresAny: [],
    provides: ["cabin", "crew"],
    allowedStates: ["ON", "OFF", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [
      { resource: "cleanWater", amount: { v: 300, source: "game_assumption", note: "Tanks moulded into the habitat structure." } },
      { resource: "food", amount: { v: 60, source: "game_assumption" } },
      { resource: "wasteWater", amount: { v: 40, source: "game_assumption" } },
      { resource: "solidWaste", amount: { v: 20, source: "game_assumption" } }
    ],
    volumeM3: { v: 80, source: "game_assumption", note: "Two connected 4-crew modules. Scaled up from the NASA-STD-3001 space allowance so the cabin gas buffers more than one hour of crew breathing - otherwise every loop swings wildly." },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 2, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 2500, source: "game_assumption" },
      regolith: { v: 200, source: "game_assumption" },
      spareParts: { v: 5, source: "game_assumption" }
    },
    buildHours: { v: 12, source: "game_assumption" },
    upgrades: [
      { level: { v: 2, source: "game_assumption" }, costMoney: { v: 1200, source: "game_assumption" }, costParts: { v: 2, source: "game_assumption" }, hours: { v: 6, source: "game_assumption" } }
    ],
    special: "habitat"
  },
  {
    typeId: "airlock",
    name: "Airlock",
    kidDescription: "A small door with two doors in it. Crew put on their suits here so the habitat never loses its air.",
    priority: { v: 50, source: "game_assumption" },
    essential: false,
    passive: false,
    powerDrawKwh: { v: 0.5, source: "game_assumption", note: "Pumps that cycle the crew in and out." },
    inputs: [],
    outputs: [
      { resource: "regolith", amount: { v: 30, source: "game_assumption", note: "A spacewalk is also a shovel: the crew pile a berm by the airlock. Slow dirt, but it needs no rover." } }
    ],
    requires: ["cabin"],
    requiresAny: [],
    provides: ["eva"],
    allowedStates: ["ON", "OFF", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [],
    volumeM3: { v: 4, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 2, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 900, source: "game_assumption" },
      regolith: { v: 70, source: "game_assumption" },
      spareParts: { v: 2, source: "game_assumption" }
    },
    buildHours: { v: 5, source: "game_assumption" },
    upgrades: [],
    special: "airlock"
  },
  {
    typeId: "greenhouse",
    name: "Greenhouse",
    kidDescription: "Plants make food with light, water and the crew's CO2 - and they give back oxygen while they grow.",
    priority: { v: 60, source: "game_assumption" },
    essential: false,
    passive: false,
    powerDrawKwh: { v: 2.5, source: "game_assumption", note: "Grow lamps are the biggest single power user on the base." },
    inputs: [
      { resource: "capturedCO2", amount: { v: 0.12, source: "nasa", note: "Photosynthesis stoichiometry: 44 g CO2 per mole of carbon fixed." } },
      { resource: "cleanWater", amount: { v: 0.05, source: "nasa", note: "18 g H2O per mole, matched to the CO2 above." } }
    ],
    outputs: [
      { resource: "food", amount: { v: 0.08, source: "nasa", note: "About 30 g of edible biomass per mole; one module cannot feed four crew." } },
      { resource: "cabinO2", amount: { v: 0.087, source: "nasa", note: "32 g O2 released per mole of CO2 fixed." } }
    ],
    requires: ["cabin", "power_bus"],
    requiresAny: [],
    provides: ["food_production"],
    allowedStates: ["ON", "OFF", "PROCESSING", "GROWING", "IDLE", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [],
    volumeM3: { v: 12, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 3, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 1200, source: "game_assumption" },
      regolith: { v: 120, source: "game_assumption" },
      spareParts: { v: 2, source: "game_assumption" }
    },
    buildHours: { v: 6, source: "game_assumption" },
    upgrades: [
      { level: { v: 2, source: "game_assumption" }, costMoney: { v: 700, source: "game_assumption" }, costParts: { v: 1, source: "game_assumption" }, hours: { v: 4, source: "game_assumption" } }
    ],
    special: "processor",
    blocksWhenFull: "food"
  },
  {
    typeId: "solar_array",
    name: "Solar Array",
    kidDescription: "A field of sun panels. It only makes power while the Sun is up, so the outpost needs batteries for the long night.",
    priority: { v: 90, source: "game_assumption" },
    essential: false,
    passive: true,
    powerDrawKwh: { v: 0, source: "game_assumption" },
    inputs: [],
    outputs: [],
    requires: [],
    requiresAny: [],
    provides: ["power_source"],
    allowedStates: ["ON", "OFF", "DEPLOYED", "STOWED", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [],
    volumeM3: { v: 0, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 26, source: "game_assumption", note: "Scaled for play. Lunar sunlight is about 1361 W/m2 (NASA TSIS-1 solar irradiance)." },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 4, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 800, source: "game_assumption" },
      regolith: { v: 60, source: "game_assumption" },
      spareParts: { v: 1, source: "game_assumption" }
    },
    buildHours: { v: 3, source: "game_assumption" },
    upgrades: [
      { level: { v: 2, source: "game_assumption" }, costMoney: { v: 600, source: "game_assumption" }, costParts: { v: 1, source: "game_assumption" }, hours: { v: 2, source: "game_assumption" } }
    ],
    special: "solar"
  },
  {
    typeId: "battery_bank",
    name: "Battery Bank",
    kidDescription: "Stores the daylight so you can spend it at night. Bigger banks mean you can keep more machines running after sunset.",
    priority: { v: 8, source: "game_assumption" },
    essential: false,
    passive: true,
    powerDrawKwh: { v: 0, source: "game_assumption" },
    inputs: [],
    outputs: [],
    requires: [],
    requiresAny: [],
    provides: ["storage_power"],
    allowedStates: ["ON", "OFF", "CHARGING", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [
      { resource: "electricalEnergy", amount: { v: 0, source: "game_assumption", note: "Storage is declared once, on batteryCapacityKwh." } }
    ],
    volumeM3: { v: 3, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 120, source: "game_assumption" },
    batteryRateKwh: { v: 20, source: "game_assumption", note: "Charge and discharge ceiling per hour, so power cannot teleport." },
    aggregation: "stack",
    maxInstances: { v: 4, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 900, source: "game_assumption" },
      regolith: { v: 80, source: "game_assumption" },
      spareParts: { v: 2, source: "game_assumption" }
    },
    buildHours: { v: 4, source: "game_assumption" },
    upgrades: [
      { level: { v: 2, source: "game_assumption" }, costMoney: { v: 650, source: "game_assumption" }, costParts: { v: 1, source: "game_assumption" }, hours: { v: 3, source: "game_assumption" } }
    ],
    special: "battery"
  },
  {
    typeId: "power_distribution",
    name: "Power Controller",
    kidDescription: "The switchboard. Without it the power from the panels cannot reach the machines, so everything else goes quiet.",
    priority: { v: 5, source: "game_assumption", note: "Shed last of all: losing it loses the whole grid." },
    essential: true,
    passive: false,
    powerDrawKwh: { v: 0.5, source: "game_assumption" },
    inputs: [],
    outputs: [],
    requires: [],
    requiresAny: [],
    provides: ["power_bus"],
    allowedStates: ["ON", "OFF", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [],
    volumeM3: { v: 2, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 1, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 600, source: "game_assumption" },
      regolith: { v: 40, source: "game_assumption" },
      spareParts: { v: 1, source: "game_assumption" }
    },
    buildHours: { v: 2, source: "game_assumption" },
    upgrades: [],
    special: "passive"
  },
  {
    typeId: "rover_charger",
    name: "Rover Charger",
    kidDescription: "A plug for the rover. Charging uses power you could have spent on the greenhouse, so plan the night before.",
    priority: { v: 75, source: "game_assumption" },
    essential: false,
    passive: false,
    powerDrawKwh: { v: 2, source: "game_assumption" },
    inputs: [],
    outputs: [],
    requires: ["power_bus"],
    requiresAny: [],
    provides: ["rover_power"],
    allowedStates: ["ON", "OFF", "CHARGING", "IDLE", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [],
    volumeM3: { v: 2, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 1, source: "game_assumption" },
    unlockXp: { v: 20, source: "game_assumption" },
    buildCost: {
      money: { v: 500, source: "game_assumption" },
      regolith: { v: 30, source: "game_assumption" },
      spareParts: { v: 1, source: "game_assumption" }
    },
    buildHours: { v: 2, source: "game_assumption" },
    upgrades: [],
    special: "rover_charger"
  },
  {
    typeId: "water_recovery",
    name: "Water Recycler",
    kidDescription: "Cleans the crew's used water so it can be drunk again or split into oxygen. It stops if the clean tank is full.",
    priority: { v: 25, source: "game_assumption" },
    essential: true,
    passive: false,
    powerDrawKwh: { v: 1.2, source: "game_assumption" },
    inputs: [
      { resource: "wasteWater", amount: { v: 0.8, source: "game_assumption", note: "Processing rate, not a NASA constant." } }
    ],
    outputs: [
      { resource: "cleanWater", amount: { v: 0.6, source: "nasa", note: "75% recovery, in line with the ISS water-recovery assembly rate (NASA)." } }
    ],
    requires: ["power_bus"],
    requiresAny: [],
    provides: ["water_loop"],
    allowedStates: ["ON", "OFF", "PROCESSING", "IDLE", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [],
    volumeM3: { v: 6, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 2, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 1e3, source: "game_assumption" },
      regolith: { v: 90, source: "game_assumption" },
      spareParts: { v: 2, source: "game_assumption" }
    },
    buildHours: { v: 5, source: "game_assumption" },
    upgrades: [
      { level: { v: 2, source: "game_assumption" }, costMoney: { v: 700, source: "game_assumption" }, costParts: { v: 1, source: "game_assumption" }, hours: { v: 3, source: "game_assumption" } }
    ],
    special: "processor",
    blocksWhenFull: "cleanWater"
  },
  {
    typeId: "oxygen_generator",
    name: "Oxygen Generator",
    kidDescription: "Zaps clean water into breathing oxygen and hydrogen. It stops when its hydrogen tank is full - that is your hint to build the Sabatier reactor.",
    priority: { v: 20, source: "game_assumption" },
    essential: true,
    passive: false,
    powerDrawKwh: { v: 2, source: "game_assumption" },
    inputs: [
      { resource: "cleanWater", amount: { v: 0.2, source: "nasa", note: "Electrolysis: 18 g water gives 16 g oxygen plus 2 g hydrogen." } }
    ],
    outputs: [
      { resource: "cabinO2", amount: { v: 0.178, source: "nasa" } },
      { resource: "hydrogen", amount: { v: 0.022, source: "nasa" } }
    ],
    requires: ["cabin", "power_bus"],
    requiresAny: [],
    provides: ["oxygen_loop"],
    allowedStates: ["ON", "OFF", "PROCESSING", "IDLE", "CYCLING", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [
      { resource: "hydrogen", amount: { v: 6, source: "game_assumption" } }
    ],
    volumeM3: { v: 6, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 2, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 1100, source: "game_assumption" },
      regolith: { v: 90, source: "game_assumption" },
      spareParts: { v: 3, source: "game_assumption" }
    },
    buildHours: { v: 5, source: "game_assumption" },
    upgrades: [
      { level: { v: 2, source: "game_assumption" }, costMoney: { v: 800, source: "game_assumption" }, costParts: { v: 1, source: "game_assumption" }, hours: { v: 4, source: "game_assumption" } }
    ],
    special: "processor",
    blocksWhenFull: "hydrogen"
  },
  {
    typeId: "co2_removal",
    name: "CO2 Scrubber",
    kidDescription: "Sucks the crew's breathed-out CO2 out of the air and holds it in a tank. When the tank fills up the air turns stuffy.",
    priority: { v: 20, source: "game_assumption" },
    essential: true,
    passive: false,
    powerDrawKwh: { v: 1, source: "game_assumption" },
    inputs: [
      { resource: "cabinCO2", amount: { v: 0.2, source: "game_assumption", note: "Slightly above crew production so the band stays clean while the store has room." } }
    ],
    outputs: [
      { resource: "capturedCO2", amount: { v: 0.2, source: "game_assumption" } }
    ],
    requires: ["cabin", "power_bus"],
    requiresAny: [],
    provides: ["co2_loop"],
    allowedStates: ["ON", "OFF", "PROCESSING", "IDLE", "CYCLING", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [
      { resource: "capturedCO2", amount: { v: 25, source: "game_assumption", note: "Buffer tank holding about five days of crew CO2, so a short interruption does not back the scrubber up." } }
    ],
    volumeM3: { v: 5, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 2, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 950, source: "game_assumption" },
      regolith: { v: 80, source: "game_assumption" },
      spareParts: { v: 2, source: "game_assumption" }
    },
    buildHours: { v: 5, source: "game_assumption" },
    upgrades: [
      { level: { v: 2, source: "game_assumption" }, costMoney: { v: 650, source: "game_assumption" }, costParts: { v: 1, source: "game_assumption" }, hours: { v: 3, source: "game_assumption" } }
    ],
    special: "processor",
    blocksWhenFull: "capturedCO2"
  },
  {
    typeId: "sabatier",
    name: "Sabatier Reactor",
    kidDescription: "Mixes the stored hydrogen with captured CO2 to make water again, plus methane the rover can burn.",
    priority: { v: 70, source: "game_assumption" },
    essential: false,
    passive: false,
    powerDrawKwh: { v: 1.5, source: "game_assumption" },
    inputs: [
      { resource: "capturedCO2", amount: { v: 0.22, source: "nasa", note: "Sabatier: CO2 + 4H2 -> CH4 + 2H2O. 44 g CO2 per mole." } },
      { resource: "hydrogen", amount: { v: 0.04, source: "nasa", note: "8 g hydrogen per mole of CO2." } }
    ],
    outputs: [
      { resource: "methane", amount: { v: 0.08, source: "nasa", note: "16 g methane per mole." } },
      { resource: "cleanWater", amount: { v: 0.09, source: "nasa", note: "18 g water per mole." } }
    ],
    requires: ["power_bus"],
    requiresAny: [],
    provides: ["water_loop"],
    allowedStates: ["ON", "OFF", "PROCESSING", "IDLE", "CYCLING", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [
      { resource: "methane", amount: { v: 8, source: "game_assumption" } }
    ],
    volumeM3: { v: 6, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 1, source: "game_assumption" },
    unlockXp: { v: 40, source: "game_assumption" },
    buildCost: {
      money: { v: 1400, source: "game_assumption" },
      regolith: { v: 120, source: "game_assumption" },
      spareParts: { v: 3, source: "game_assumption" }
    },
    buildHours: { v: 8, source: "game_assumption" },
    upgrades: [
      { level: { v: 2, source: "game_assumption" }, costMoney: { v: 900, source: "game_assumption" }, costParts: { v: 2, source: "game_assumption" }, hours: { v: 4, source: "game_assumption" } }
    ],
    special: "processor",
    blocksWhenFull: "methane"
  },
  {
    typeId: "thermal_control",
    name: "Thermal Radiator",
    kidDescription: "Radiates the heat that machines and people make into space. Without it the cabin becomes an oven.",
    priority: { v: 30, source: "game_assumption" },
    essential: true,
    passive: false,
    powerDrawKwh: { v: 1.5, source: "game_assumption" },
    inputs: [],
    outputs: [],
    requires: ["cabin", "power_bus"],
    requiresAny: [],
    provides: ["thermal_loop"],
    allowedStates: ["ON", "OFF", "PROCESSING", "IDLE", "DEPLOYED", "STOWED", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [],
    volumeM3: { v: 3, source: "game_assumption" },
    heatRemovalKwh: { v: 14, source: "game_assumption", note: "Sized so one radiator can clear roughly the whole base's heat at full sun." },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 2, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 800, source: "game_assumption" },
      regolith: { v: 70, source: "game_assumption" },
      spareParts: { v: 2, source: "game_assumption" }
    },
    buildHours: { v: 4, source: "game_assumption" },
    upgrades: [
      { level: { v: 2, source: "game_assumption" }, costMoney: { v: 600, source: "game_assumption" }, costParts: { v: 1, source: "game_assumption" }, hours: { v: 3, source: "game_assumption" } }
    ],
    special: "radiator"
  },
  {
    typeId: "radiation_monitor",
    name: "Radiation Monitor",
    kidDescription: "Watches the Sun and the particles. With it, a storm warning arrives early; without it you only learn about the storm when it is on top of you.",
    priority: { v: 40, source: "game_assumption" },
    essential: false,
    passive: false,
    powerDrawKwh: { v: 0.3, source: "game_assumption" },
    inputs: [],
    outputs: [],
    requires: ["power_bus"],
    requiresAny: [],
    provides: ["warning"],
    allowedStates: ["ON", "OFF", "ACTIVE", "INACTIVE", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [],
    volumeM3: { v: 1, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 1, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 400, source: "game_assumption" },
      regolith: { v: 20, source: "game_assumption" },
      spareParts: { v: 1, source: "game_assumption" }
    },
    buildHours: { v: 2, source: "game_assumption" },
    upgrades: [],
    special: "processor"
  },
  {
    typeId: "radiation_shelter",
    name: "Radiation Shelter",
    kidDescription: "A small room buried under regolith. Dirt stops solar particles, so the crew hides here when a storm comes.",
    priority: { v: 15, source: "game_assumption" },
    essential: false,
    passive: false,
    powerDrawKwh: { v: 0.2, source: "game_assumption" },
    inputs: [],
    outputs: [],
    requires: ["cabin"],
    requiresAny: [],
    provides: ["shelter"],
    allowedStates: ["ON", "OFF", "ACTIVE", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [],
    volumeM3: { v: 8, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 1, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 1200, source: "game_assumption" },
      regolith: { v: 150, source: "game_assumption", note: "About a metre of dirt over a small room, scaled to the shelter footprint." },
      spareParts: { v: 2, source: "game_assumption" }
    },
    buildHours: { v: 8, source: "game_assumption" },
    upgrades: [
      { level: { v: 2, source: "game_assumption" }, costMoney: { v: 800, source: "game_assumption" }, costParts: { v: 1, source: "game_assumption" }, hours: { v: 4, source: "game_assumption" } }
    ],
    special: "passive"
  },
  {
    typeId: "cargo_module",
    name: "Cargo Module",
    kidDescription: "Extra lockers for water, food and waste. More storage means a system can keep working while you fix something else.",
    priority: { v: 95, source: "game_assumption" },
    essential: false,
    passive: true,
    powerDrawKwh: { v: 0, source: "game_assumption" },
    inputs: [],
    outputs: [],
    requires: [],
    requiresAny: [],
    provides: ["storage"],
    allowedStates: ["ON", "OFF", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [
      { resource: "cleanWater", amount: { v: 200, source: "game_assumption" } },
      { resource: "wasteWater", amount: { v: 120, source: "game_assumption" } },
      { resource: "food", amount: { v: 100, source: "game_assumption" } },
      { resource: "nutrients", amount: { v: 20, source: "game_assumption" } },
      { resource: "solidWaste", amount: { v: 80, source: "game_assumption" } },
      { resource: "regolith", amount: { v: 200, source: "game_assumption" } }
    ],
    volumeM3: { v: 10, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 3, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 500, source: "game_assumption" },
      regolith: { v: 60, source: "game_assumption" },
      spareParts: { v: 1, source: "game_assumption" }
    },
    buildHours: { v: 3, source: "game_assumption" },
    upgrades: [],
    special: "storage"
  },
  {
    typeId: "communications",
    name: "Communications Dish",
    kidDescription: "Talks to Mission Control on Earth. The signal takes about 1.3 seconds each way, so advice is always a little late - and if the dish is off, warnings arrive even later.",
    priority: { v: 45, source: "game_assumption" },
    essential: false,
    passive: false,
    powerDrawKwh: { v: 0.8, source: "game_assumption" },
    inputs: [],
    outputs: [],
    requires: ["power_bus"],
    requiresAny: [],
    provides: ["comms"],
    allowedStates: ["ON", "OFF", "ACTIVE", "INACTIVE", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [],
    volumeM3: { v: 2, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 1, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 700, source: "game_assumption" },
      regolith: { v: 50, source: "game_assumption" },
      spareParts: { v: 1, source: "game_assumption" }
    },
    buildHours: { v: 3, source: "game_assumption" },
    upgrades: [],
    special: "processor"
  },
  {
    typeId: "rover",
    name: "Rover",
    kidDescription: "Drives out to collect regolith and do science. A trip spends power and takes crew away from the base, so it is a real choice.",
    priority: { v: 80, source: "game_assumption" },
    essential: false,
    passive: false,
    powerDrawKwh: { v: 1.5, source: "game_assumption", note: "Only drawn while MOVING." },
    inputs: [],
    outputs: [
      { resource: "regolith", amount: { v: 40, source: "game_assumption", note: "One scoop per driving hour, capped by site stockpile capacity." } },
      { resource: "spareParts", amount: { v: 1, source: "game_assumption", note: "A crate of consumables and hardware the rover hauls back from the lander, which is how repairs keep being possible." } }
    ],
    requires: ["eva", "rover_power"],
    requiresAny: [],
    provides: [],
    allowedStates: ["PARKED", "MOVING", "CHARGING", "OFF", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [],
    volumeM3: { v: 0, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 2, source: "game_assumption" },
    unlockXp: { v: 30, source: "game_assumption" },
    buildCost: {
      money: { v: 1500, source: "game_assumption" },
      regolith: { v: 60, source: "game_assumption" },
      spareParts: { v: 4, source: "game_assumption" }
    },
    buildHours: { v: 8, source: "game_assumption" },
    upgrades: [
      { level: { v: 2, source: "game_assumption" }, costMoney: { v: 900, source: "game_assumption" }, costParts: { v: 2, source: "game_assumption" }, hours: { v: 4, source: "game_assumption" } }
    ],
    special: "rover"
  },
  {
    typeId: "spare_parts_storage",
    name: "Parts Locker",
    kidDescription: "Keeps the spare parts that repairs need. Run out of parts and a broken machine stays broken.",
    priority: { v: 95, source: "game_assumption" },
    essential: false,
    passive: true,
    powerDrawKwh: { v: 0, source: "game_assumption" },
    inputs: [],
    outputs: [],
    requires: [],
    requiresAny: [],
    provides: ["parts"],
    allowedStates: ["ON", "OFF", "DAMAGED", "REPAIRING", "UNDER_CONSTRUCTION", "DESTROYED"],
    capacityGrants: [
      { resource: "spareParts", amount: { v: 30, source: "game_assumption" } }
    ],
    volumeM3: { v: 4, source: "game_assumption" },
    heatRemovalKwh: { v: 0, source: "game_assumption" },
    solarKwhPerFullSunHour: { v: 0, source: "game_assumption" },
    batteryCapacityKwh: { v: 0, source: "game_assumption" },
    batteryRateKwh: { v: 0, source: "game_assumption" },
    aggregation: "stack",
    maxInstances: { v: 2, source: "game_assumption" },
    unlockXp: { v: 0, source: "game_assumption" },
    buildCost: {
      money: { v: 450, source: "game_assumption" },
      regolith: { v: 40, source: "game_assumption" },
      spareParts: { v: 0, source: "game_assumption" }
    },
    buildHours: { v: 3, source: "game_assumption" },
    upgrades: [],
    special: "storage"
  }
];

// src/data/outpost.config.json
var outpost_config_default = {
  meta: {
    citations: ["N01", "N02", "N03", "N04", "N05", "N06", "N07", "N08"]
  },
  time: {
    stepsPerDay: { v: 24, source: "game_assumption", note: "One simulated hour per step." },
    baseMsPerSimHour: { v: 1e3, source: "game_assumption", note: "At speed 1 one sim hour takes one real second." },
    speeds: [
      { v: 0.5, source: "game_assumption" },
      { v: 1, source: "game_assumption" },
      { v: 2, source: "game_assumption" },
      { v: 4, source: "game_assumption" }
    ]
  },
  crew: {
    referenceSize: { v: 4, source: "game_assumption", note: "Every habitat flow number is written for this many people." },
    defaultSize: { v: 4, source: "game_assumption" },
    names: ["Amira", "Kwame", "Sofia", "Kenji"],
    ratesAtReference: {
      foodKg: { v: 0.125, source: "nasa", note: "0.75 kg per person per day x 4 / 24 h." },
      cleanWaterL: { v: 0.6, source: "nasa", note: "3.6 L per person per day x 4 / 24 h." },
      cabinO2Kg: { v: 0.14, source: "nasa", note: "0.84 kg O2 per person per day x 4 / 24 h." },
      cabinCo2Kg: { v: 0.18, source: "nasa", note: "About 1.08 kg CO2 per person per day x 4 / 24 h." },
      wasteWaterL: { v: 0.25, source: "game_assumption", note: "1.5 L greywater per person per day." },
      solidWasteKg: { v: 0.1, source: "game_assumption", note: "0.6 kg per person per day." },
      heatKwh: { v: 0.4, source: "nasa", note: "A resting human releases about 100 W, so 0.1 kWh per hour each." }
    },
    impairedAtOrBelow: { v: 60, source: "game_assumption", note: "Health percent where a crew member slows down." },
    severeAtOrBelow: { v: 30, source: "game_assumption" },
    criticalDrainHours: { v: 8, source: "game_assumption", note: "Hours from full health to empty inside the critical band." },
    warningDrainHours: { v: 48, source: "game_assumption", note: "Hours to empty inside the warning band." },
    starvationDrainHours: { v: 12, source: "game_assumption", note: "No food or no water." },
    recoveryPerHour: { v: 3, source: "game_assumption", note: "Health regained per hour when everything is nominal." },
    exposureDrainPerHour: { v: 8, source: "game_assumption", note: "Health points lost per hour outside during a radiation event with no shelter built. Chosen so ignoring a storm injures the crew rather than killing them outright." },
    shelterInPlaceDrainPerHour: { v: 4, source: "game_assumption", note: "Same storm, but the shelter exists and the crew are not using it." },
    shelteredActivityFactor: { v: 0.5, source: "game_assumption", note: "Sheltered crew are safe but half as productive: no repairs, no EVA." },
    optimalXpPerHour: { v: 1.2, source: "game_assumption" },
    survivalTiers: [
      {
        id: "nominal",
        maxCo2MmHg: { v: 3, source: "nasa", note: "NASA-STD-3001 400 ppm CO2 ceiling." },
        minTempC: { v: 18, source: "nasa" },
        maxTempC: { v: 27, source: "nasa" },
        minO2MmHg: { v: 145, source: "nasa" },
        activityMultiplier: { v: 1, source: "game_assumption" }
      },
      {
        id: "warning",
        maxCo2MmHg: { v: 7.6, source: "nasa", note: "Long-duration ceiling used by NASA for symptom-free operation." },
        minTempC: { v: 10, source: "game_assumption" },
        maxTempC: { v: 35, source: "game_assumption" },
        minO2MmHg: { v: 120, source: "game_assumption" },
        activityMultiplier: { v: 0.75, source: "game_assumption" }
      },
      {
        id: "critical",
        maxCo2MmHg: { v: 15, source: "game_assumption", note: "Above this people get headaches fast; chosen for play." },
        minTempC: { v: -10, source: "game_assumption" },
        maxTempC: { v: 45, source: "game_assumption" },
        minO2MmHg: { v: 90, source: "game_assumption" },
        activityMultiplier: { v: 0.45, source: "game_assumption" }
      }
    ]
  },
  atmosphere: {
    initialTemperatureC: { v: 22, source: "nasa", note: "NASA-STD-3001 nominal cabin temperature." },
    initialO2MmHg: { v: 150, source: "nasa", note: "Sea-level-equivalent ppO2." },
    initialCo2MmHg: { v: 2, source: "nasa" },
    o2VentAboveMmHg: { v: 155, source: "game_assumption", note: "Generators are setpoint-controlled; anything above this is vented overboard." },
    comfortTempMinC: { v: 18, source: "nasa" },
    comfortTempMaxC: { v: 27, source: "nasa" },
    bands: {
      o2SafeMin: { v: 145, source: "nasa" },
      o2SafeMax: { v: 155, source: "nasa" },
      o2WarningMin: { v: 120, source: "game_assumption" },
      co2SafeMax: { v: 3, source: "nasa" },
      co2WarningMax: { v: 7.6, source: "nasa" },
      tempSafeMin: { v: 18, source: "nasa" },
      tempSafeMax: { v: 27, source: "nasa" },
      tempWarningLowMin: { v: 10, source: "game_assumption" },
      tempWarningHighMax: { v: 35, source: "game_assumption" },
      tempCriticalLow: { v: -20, source: "game_assumption" },
      tempCriticalHigh: { v: 45, source: "game_assumption" }
    }
  },
  gas: {
    rJoules: { v: 8.314, source: "nasa", note: "Universal gas constant." },
    paPerMmHg: { v: 133.322, source: "nasa" },
    o2MolarMassKg: { v: 0.032, source: "nasa" },
    co2MolarMassKg: { v: 0.044, source: "nasa" }
  },
  thermal: {
    massKwhPerC: { v: 40, source: "game_assumption", note: "Effective thermal mass of the pressurized volume: kWh needed to move it 1 C." },
    electricalHeatFraction: { v: 0.9, source: "game_assumption", note: "Almost all electrical work ends up as heat inside the hull." },
    ambientKwhPerHourPerC: { v: 0.02, source: "game_assumption", note: "Hull heat leak per degree of difference. Multi-layer insulation makes this small, which is why radiators - not conduction - do the work." },
    dayExteriorC: { v: 120, source: "nasa", note: "Diviner lunar daytime surface temperature (equatorial, sunlit)." },
    nightExteriorC: { v: -170, source: "nasa", note: "Diviner lunar night surface temperature." },
    thermostatTargetC: { v: 22, source: "nasa" },
    controlBandC: { v: 4, source: "game_assumption", note: "Radiator output ramps from zero to full across this band around the target, like a real closed-loop TCS." }
  },
  power: {
    requirePowerDistribution: true,
    shortageModeDefault: "priority",
    highlightGuidanceDefault: true
  },
  economy: {
    roverCycleCredits: { v: 250, source: "game_assumption", note: "What the agency pays for one sampled site, scaled for play." },
    evaCredits: { v: 60, source: "game_assumption", note: "Paid for a spacewalk that cleans the panels and returns samples." },
    uplinkCreditsPerSol: { v: 380, source: "game_assumption", note: "A sol of science beamed home. Needs a working comms dish, so the money follows the infrastructure." },
    resupplyPartsPerSol: { v: 1, source: "game_assumption", note: "Spare parts the supply lander brings with the data relay, so repairs never dead-end." }
  },
  damageMultipliers: {
    none: { v: 1, source: "game_assumption" },
    minor: { v: 0.85, source: "game_assumption" },
    moderate: { v: 0.6, source: "game_assumption" },
    critical: { v: 0.3, source: "game_assumption" },
    destroyed: { v: 0, source: "game_assumption" }
  },
  repair: {
    minor: { hours: { v: 1, source: "game_assumption" }, parts: { v: 0, source: "game_assumption" }, directPlayer: true },
    moderate: { hours: { v: 4, source: "game_assumption" }, parts: { v: 1, source: "game_assumption" }, directPlayer: true },
    critical: { hours: { v: 10, source: "game_assumption" }, parts: { v: 3, source: "game_assumption" }, directPlayer: false }
  },
  construction: {
    demolishRefundFraction: { v: 0.5, source: "game_assumption" }
  },
  level: {
    bonusPerLevel: { v: 0.25, source: "game_assumption", note: "+25% output or capacity per upgrade level above 1." }
  },
  lunar: {
    daylightHours: { v: 16, source: "game_assumption", note: "Compressed for play. A real lunar day is about 354 hours of sunlight (NASA LRO illumination)." },
    nightHours: { v: 8, source: "game_assumption", note: "Real lunar night is about 354 hours; the game uses one 24-hour light/heat cycle." },
    cycleEnabled: true
  },
  environment: {
    unmonitoredLeadScale: { v: 0.25, source: "game_assumption", note: "No monitor or no dish means you only get a quarter of the warning lead." },
    defaultStormHours: { v: 6, source: "nasa", note: "Typical short SEP/FLR storm length in the DONKI archive." }
  },
  xp: {
    starting: { v: 0, source: "game_assumption" }
  },
  starterInstances: [
    { typeId: "pressurized_habitat", status: "ON", slotId: "pad-01" },
    { typeId: "airlock", status: "ON", slotId: "pad-02" },
    { typeId: "power_distribution", status: "ON", slotId: "pad-03" },
    { typeId: "solar_array", status: "ON", slotId: "pad-04" },
    { typeId: "battery_bank", status: "ON", slotId: "pad-05" },
    { typeId: "water_recovery", status: "ON", slotId: "pad-06" },
    { typeId: "co2_removal", status: "ON", slotId: "pad-07" },
    { typeId: "greenhouse", status: "ON", slotId: "pad-08" },
    { typeId: "oxygen_generator", status: "OFF", slotId: "pad-09" }
  ],
  powerUps: [
    {
      typeId: "suntracer",
      name: "Sun Trimmer",
      kidDescription: "Tilts the panels straight at the Sun for a few hours, so they make half again as much power.",
      durationHours: { v: 6, source: "game_assumption" },
      cooldownHours: { v: 24, source: "game_assumption" },
      maxCharges: { v: 2, source: "game_assumption" },
      initialCharges: { v: 1, source: "game_assumption" },
      solarMultiplier: { v: 1.5, source: "game_assumption" },
      powerDrawMultiplier: { v: 1, source: "game_assumption" },
      processorMultiplier: { v: 1, source: "game_assumption" },
      radiatorMultiplier: { v: 1, source: "game_assumption" },
      foodConsumptionMultiplier: { v: 1, source: "game_assumption" }
    },
    {
      typeId: "eco_mode",
      name: "Eco Mode",
      kidDescription: "Runs every machine a bit quieter. Nothing slows down, but everything draws less.",
      durationHours: { v: 8, source: "game_assumption" },
      cooldownHours: { v: 30, source: "game_assumption" },
      maxCharges: { v: 2, source: "game_assumption" },
      initialCharges: { v: 1, source: "game_assumption" },
      solarMultiplier: { v: 1, source: "game_assumption" },
      powerDrawMultiplier: { v: 0.7, source: "game_assumption" },
      processorMultiplier: { v: 1, source: "game_assumption" },
      radiatorMultiplier: { v: 1, source: "game_assumption" },
      foodConsumptionMultiplier: { v: 1, source: "game_assumption" }
    },
    {
      typeId: "grow_burst",
      name: "Grow Burst",
      kidDescription: "Extra light and a CO2 boost in the greenhouse: plants work faster and the crew eats a little less.",
      durationHours: { v: 6, source: "game_assumption" },
      cooldownHours: { v: 30, source: "game_assumption" },
      maxCharges: { v: 2, source: "game_assumption" },
      initialCharges: { v: 1, source: "game_assumption" },
      solarMultiplier: { v: 1, source: "game_assumption" },
      powerDrawMultiplier: { v: 1, source: "game_assumption" },
      processorMultiplier: { v: 1.4, source: "game_assumption" },
      radiatorMultiplier: { v: 1, source: "game_assumption" },
      foodConsumptionMultiplier: { v: 0.8, source: "game_assumption" }
    }
  ]
};

// src/data/events.local.json
var events_local_default = {
  events: [
    {
      id: "ev_sep_01",
      type: "solar_particle_event",
      startHour: { v: 14, source: "nasa", note: "Archived DONKI solar-particle-event pattern; the shell re-seeds the exact start each run." },
      durationHours: { v: 6, source: "nasa", note: "Short SEP event length in the DONKI archive." },
      warningLeadHours: { v: 8, source: "game_assumption", note: "Game lead time: a real SEP warning is usually minutes, which is not playable." },
      effects: {
        radiation: true,
        buildingEfficiency: { v: 0.9, source: "game_assumption", note: "Charged particles cause single-event upsets in electronics." }
      }
    },
    {
      id: "ev_dust_02",
      type: "dust_storm",
      startHour: { v: 22, source: "game_assumption", note: "Lunar dust is lofted by electrostatic levitation and micrometeoroid churn (NASA LDSE findings)." },
      durationHours: { v: 8, source: "game_assumption" },
      warningLeadHours: { v: 4, source: "game_assumption" },
      effects: {
        sunlightMultiplier: { v: 0.65, source: "game_assumption", note: "Dust on the panel glass; Apollo 12/14/16 surveyors reported coatings darkening the surfaces." }
      }
    },
    {
      id: "ev_flr_x32",
      type: "solar_flare",
      startHour: { v: 30, source: "nasa", note: "Named after the X3.2 class flare of 2026-01-17 in the DONKI flare catalogue shape." },
      durationHours: { v: 3, source: "nasa" },
      warningLeadHours: { v: 6, source: "game_assumption" },
      effects: {
        radiation: true,
        buildingEfficiency: { v: 0.75, source: "game_assumption", note: "Radio blackout degrades the communications and monitor systems." }
      }
    },
    {
      id: "ev_cme_04",
      type: "coronal_mass_ejection",
      startHour: { v: 44, source: "nasa", note: "DONKI CME archive: Earth-directed arrivals follow the flare by 15-48 h; compressed for play." },
      durationHours: { v: 10, source: "nasa" },
      warningLeadHours: { v: 12, source: "game_assumption" },
      effects: {
        radiation: true,
        buildingEfficiency: { v: 0.85, source: "game_assumption" },
        damage: { typeId: "solar_array", level: "moderate" }
      }
    },
    {
      id: "ev_meteoroid_05",
      type: "micrometeoroid_strike",
      startHour: { v: 55, source: "nasa", note: "Meteoroid flux environment for crewed lunar surface operations (NASA MPRB model)." },
      durationHours: { v: 1, source: "game_assumption" },
      warningLeadHours: { v: 0, source: "nasa", note: "There is no useful warning for a strike - this is a genuine no-safe-choice moment." },
      effects: {
        damage: { typeId: "thermal_control", level: "minor" },
        resourceDeltas: { spareParts: { v: -1, source: "game_assumption", note: "One part consumed by the emergency patch." } }
      }
    },
    {
      id: "ev_sep_06",
      type: "solar_particle_event",
      startHour: { v: 66, source: "nasa" },
      durationHours: { v: 8, source: "nasa" },
      warningLeadHours: { v: 10, source: "game_assumption" },
      effects: {
        radiation: true,
        buildingEfficiency: { v: 0.9, source: "game_assumption" }
      }
    },
    {
      id: "ev_cme_07",
      type: "coronal_mass_ejection",
      startHour: { v: 96, source: "nasa" },
      durationHours: { v: 12, source: "nasa" },
      warningLeadHours: { v: 14, source: "game_assumption" },
      effects: {
        radiation: true,
        damage: { typeId: "rover", level: "critical" }
      }
    },
    {
      id: "ev_dust_08",
      type: "dust_storm",
      startHour: { v: 110, source: "game_assumption" },
      durationHours: { v: 10, source: "game_assumption" },
      warningLeadHours: { v: 4, source: "game_assumption" },
      effects: {
        sunlightMultiplier: { v: 0.55, source: "game_assumption" }
      }
    },
    {
      id: "ev_sep_09",
      type: "solar_particle_event",
      startHour: { v: 130, source: "nasa" },
      durationHours: { v: 6, source: "nasa" },
      warningLeadHours: { v: 9, source: "game_assumption" },
      effects: {
        radiation: true,
        resourceDeltas: { solidWaste: { v: 2, source: "game_assumption", note: "Spoiled food packs when the greenhouse has to shut down." } }
      }
    }
  ]
};

// src/engine/result.ts
function ok(value) {
  return { ok: true, value };
}
function err(code, message) {
  return { ok: false, error: { code, message } };
}
var DataValidationError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "DataValidationError";
  }
};

// src/engine/schema.ts
var SOURCES = /* @__PURE__ */ new Set(["nasa", "game_assumption"]);
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function fail(path, message) {
  throw new DataValidationError(`${path}: ${message}`);
}
function isSourced(value) {
  return isRecord(value) && "v" in value && "source" in value && Object.keys(value).every((k) => k === "v" || k === "source" || k === "note");
}
function assertSourcedTree(value, path) {
  if (typeof value === "number") {
    fail(path, 'bare number is not allowed; use { "v": number, "source": "nasa" | "game_assumption" }');
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
    if (value.note !== void 0 && typeof value.note !== "string") fail(path, "note must be a string");
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    assertSourcedTree(child, `${path}.${key}`);
  }
}
function flattenSourced(value) {
  if (isSourced(value)) return value.v;
  if (Array.isArray(value)) return value.map((item) => flattenSourced(item));
  if (isRecord(value)) {
    const out = {};
    for (const [key, child] of Object.entries(value)) out[key] = flattenSourced(child);
    return out;
  }
  return value;
}
var RESOURCE_IDS = [
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
  "capturedCO2"
];
var BUILDING_IDS = [
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
  "spare_parts_storage"
];
function validateGameDatabase(raw) {
  assertSourcedTree(raw.resources, "resources.json");
  assertSourcedTree(raw.buildings, "buildings.json");
  assertSourcedTree(raw.config, "outpost.config.json");
  assertSourcedTree(raw.events, "events.local.json");
  const resourcesFlat = flattenSourced(raw.resources);
  const buildingsFlat = flattenSourced(raw.buildings);
  const config = flattenSourced(raw.config);
  const eventsDoc = flattenSourced(raw.events);
  if (!Array.isArray(resourcesFlat)) fail("resources.json", "root must be an array");
  const seen = /* @__PURE__ */ new Set();
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
  const typeIds = /* @__PURE__ */ new Set();
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
  const database = {
    resources: resourcesFlat,
    buildings: buildingsFlat,
    config,
    events: eventsDoc.events
  };
  assertHabitatRatesMatch(database, rates);
  return database;
}
function assertHabitatRatesMatch(db2, rates) {
  const habitat = db2.buildings.find((b) => b.typeId === "pressurized_habitat");
  if (!habitat) return;
  const input = (id) => habitat.inputs.find((flow) => flow.resource === id)?.amount;
  const output = (id) => habitat.outputs.find((flow) => flow.resource === id)?.amount;
  const checks = [
    ["food", rates.foodKg, input("food")],
    ["cleanWater", rates.cleanWaterL, input("cleanWater")],
    ["cabinO2", rates.cabinO2Kg, input("cabinO2")],
    ["cabinCO2", rates.cabinCo2Kg, output("cabinCO2")],
    ["wasteWater", rates.wasteWaterL, output("wasteWater")],
    ["solidWaste", rates.solidWasteKg, output("solidWaste")]
  ];
  for (const [name, expected, actual] of checks) {
    if (actual === void 0 || Math.abs(actual - expected) > 1e-9) {
      fail("outpost.config.json", `crew rate ${name} (${expected}) must match pressurized_habitat flow (${actual})`);
    }
  }
}

// src/engine/loadDatabase.ts
var cached = null;
function loadGameDatabase() {
  if (cached) return cached;
  cached = validateGameDatabase({
    resources: resources_default,
    buildings: buildings_default,
    config: outpost_config_default,
    events: events_local_default
  });
  return cached;
}
function tryLoadGameDatabase() {
  try {
    return { ok: true, value: loadGameDatabase() };
  } catch (error) {
    const message = error instanceof DataValidationError ? error.message : error instanceof Error ? error.message : String(error);
    return { ok: false, error: { code: "DATA_VALIDATION_FAILED", message } };
  }
}

// src/engine/EventBus.ts
var EventBus = class {
  handlers = /* @__PURE__ */ new Map();
  subscribe(name, handler) {
    let set = this.handlers.get(name);
    if (!set) {
      set = /* @__PURE__ */ new Set();
      this.handlers.set(name, set);
    }
    const wrapped = handler;
    set.add(wrapped);
    return () => set.delete(wrapped);
  }
  emit(name, payload) {
    const event = { name, payload };
    const set = this.handlers.get(name);
    if (set) {
      for (const handler of set) handler(payload);
    }
    return event;
  }
};

// src/engine/rng.ts
var SeededRng = class {
  state;
  constructor(seed) {
    this.state = seed >>> 0;
  }
  get seed() {
    return this.state >>> 0;
  }
  /** Restore the exact generator state (already advanced). */
  setState(state) {
    this.state = state >>> 0;
  }
  next() {
    this.state = this.state + 1831565813 >>> 0;
    let t = this.state;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  nextInt(maxExclusive) {
    if (maxExclusive <= 0) return 0;
    return Math.floor(this.next() * maxExclusive);
  }
};

// src/engine/simulator.ts
var RUNNING_STATES = /* @__PURE__ */ new Set([
  "ON",
  "PROCESSING",
  "CHARGING",
  "DEPLOYED",
  "ACTIVE",
  "GROWING",
  "CYCLING",
  "REGENERATING",
  "MOVING",
  "IDLE"
]);
var OFFISH_STATES = /* @__PURE__ */ new Set(["OFF", "STOWED", "INACTIVE", "PARKED"]);
function isOperational(instance) {
  return instance.status !== "DESTROYED" && instance.status !== "UNDER_CONSTRUCTION" && instance.status !== "REPAIRING" && instance.status !== "DAMAGED" && !OFFISH_STATES.has(instance.status);
}
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function round(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
var OutpostSimulator = class _OutpostSimulator {
  db;
  events = new EventBus();
  hourNow = 0;
  rng;
  resources = {};
  capacities = {};
  instanceList = [];
  crewList = [];
  settings;
  missionStatus = { state: "active" };
  powerUps = [];
  crateList = [];
  tracked = [];
  brownoutActive = false;
  emergencyActive = false;
  crewSheltered = false;
  nextInstanceSerial = 1;
  nextCollectibleSerial = 1;
  idCounters = {};
  awardedRewardIds = [];
  roverCycles = 0;
  powerUpsCollected = 0;
  brownoutsRecovered = 0;
  /** Last computed hour snapshot; also what `view()` returns. */
  last;
  /** Per-instance flows for the inspect panel, refreshed every step. */
  flows = /* @__PURE__ */ new Map();
  powerByInstance = /* @__PURE__ */ new Map();
  efficiencyByInstance = /* @__PURE__ */ new Map();
  warnings = /* @__PURE__ */ new Map();
  heatRemovedKwh = 0;
  /** EVA panel cleaning: recovers sunlight, decays as dust settles again. */
  dustClearance = 0;
  sunFactor = 1;
  crewSize;
  clockSink;
  stepEvents = [];
  alerts = [];
  emergencyFlags = [];
  config;
  types = /* @__PURE__ */ new Map();
  constructor(db2, options = {}) {
    this.db = db2;
    this.config = db2.config;
    for (const type of db2.buildings) this.types.set(type.typeId, type);
    this.crewSize = clamp(Math.round(options.crewSize ?? db2.config.crew.defaultSize), 1, db2.config.crew.names.length);
    this.settings = {
      powerShortageMode: options.settings?.powerShortageMode ?? db2.config.power.shortageModeDefault,
      highlightGuidance: options.settings?.highlightGuidance ?? db2.config.power.highlightGuidanceDefault
    };
    this.clockSink = options.clock;
    this.rng = new SeededRng(options.seed ?? 20261114);
    this.seedResources(options.resources ?? db2.resources);
    this.seedCrew();
    this.seedInstances();
    this.seedEvents(options.events ?? db2.events);
    this.seedPowerUps();
    this.recomputeCapacities();
    this.last = this.buildStepResult(this.resolvePower());
  }
  /* ------------------------------------------------------------- seeding --- */
  seedResources(definitions = this.db.resources) {
    this.resources = {};
    for (const definition of definitions) {
      this.resources[definition.id] = definition.initial;
    }
    const volume = this.habitatVolume();
    this.resources.cabinTemperature = this.config.atmosphere.initialTemperatureC;
    this.resources.cabinO2 = this.massForPressure(this.config.atmosphere.initialO2MmHg, volume, this.config.gas.o2MolarMassKg);
    this.resources.cabinCO2 = this.massForPressure(this.config.atmosphere.initialCo2MmHg, volume, this.config.gas.co2MolarMassKg);
    this.resources.xp = this.config.xp.starting;
  }
  seedCrew() {
    this.crewList = [];
    for (let index = 0; index < this.crewSize; index += 1) {
      this.crewList.push({
        id: `crew-${index + 1}`,
        name: this.config.crew.names[index] ?? `Crew ${index + 1}`,
        health: 100,
        status: "Normal",
        activityMultiplier: 1,
        assignedTaskId: null
      });
    }
  }
  seedInstances() {
    this.instanceList = [];
    for (const starter of this.config.starterInstances) {
      if (!this.types.has(starter.typeId)) continue;
      this.instanceList.push(this.makeInstance(starter.typeId, starter.status, starter.slotId ?? null));
    }
  }
  seedEvents(source) {
    this.tracked = source.map((event, index) => {
      const jitter = index === 0 ? 0 : this.rng.nextInt(11);
      return {
        ...event,
        startHour: Math.max(0, event.startHour + jitter),
        warned: false,
        active: false,
        ended: false,
        damageApplied: false
      };
    });
  }
  seedPowerUps() {
    this.powerUps = this.config.powerUps.map((definition) => ({
      typeId: definition.typeId,
      charges: definition.initialCharges,
      cooldownRemainingHours: 0,
      activeRemainingHours: 0
    }));
  }
  makeInstance(typeId, status, slotId) {
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
      lastEfficiency: 1
    };
  }
  /* --------------------------------------------------------- math helpers --- */
  typeOf(instance) {
    const type = this.types.get(instance.typeId);
    if (!type) throw new Error(`unknown building type ${instance.typeId}`);
    return type;
  }
  habitatVolume() {
    const built = this.instanceList.filter((instance) => instance.typeId === "pressurized_habitat" && isOperational(instance));
    const volume = built.reduce((sum, instance) => sum + this.typeOf(instance).volumeM3, 0);
    if (volume > 0) return volume;
    const starter = this.db.buildings.find((type) => type.typeId === "pressurized_habitat");
    return starter ? starter.volumeM3 : 1;
  }
  /** Ideal gas, solved for mass: m = P V M / (R T). */
  massForPressure(mmHg, volumeM3, molarMassKg) {
    const pascals = mmHg * this.config.gas.paPerMmHg;
    const kelvin = this.resources.cabinTemperature + 273.15;
    return pascals * volumeM3 * molarMassKg / (this.config.gas.rJoules * kelvin);
  }
  pressureForMass(massKg, volumeM3, molarMassKg) {
    if (massKg <= 0 || volumeM3 <= 0) return 0;
    const kelvin = this.resources.cabinTemperature + 273.15;
    const moles = massKg / molarMassKg;
    const pascals = moles * this.config.gas.rJoules * kelvin / volumeM3;
    return pascals / this.config.gas.paPerMmHg;
  }
  levelMultiplier(level) {
    return 1 + this.config.level.bonusPerLevel * Math.max(0, level - 1);
  }
  damageMultiplier(damage) {
    return this.config.damageMultipliers[damage] ?? 1;
  }
  activeMultiplier(field) {
    let total = 1;
    for (const state of this.powerUps) {
      if (state.activeRemainingHours <= 0) continue;
      const definition = this.config.powerUps.find((item) => item.typeId === state.typeId);
      const value = definition?.[field];
      if (typeof value === "number") total *= value;
    }
    return total;
  }
  eventBuildingEfficiency() {
    let total = 1;
    for (const event of this.tracked) {
      if (!event.active) continue;
      if (typeof event.effects.buildingEfficiency === "number") total *= event.effects.buildingEfficiency;
    }
    return total;
  }
  eventSunlightMultiplier() {
    let total = 1;
    for (const event of this.tracked) {
      if (!event.active) continue;
      if (typeof event.effects.sunlightMultiplier === "number") total *= event.effects.sunlightMultiplier;
    }
    return total;
  }
  radiationEventActive() {
    return this.tracked.some((event) => event.active && event.effects.radiation === true);
  }
  provides(tag) {
    return this.instanceList.some((instance) => {
      if (!isOperational(instance)) return false;
      const type = this.typeOf(instance);
      return type.provides.includes(tag);
    });
  }
  hasCapability(tag) {
    if (tag === "cabin") {
      return this.instanceList.some((item) => item.typeId === "pressurized_habitat" && isOperational(item));
    }
    if (tag === "crew") return this.crewList.some((member) => member.status !== "Deceased");
    return this.provides(tag);
  }
  /* ------------------------------------------------------------- stepping --- */
  /** Advance the world by whole simulated hours. `step(0)` just recomputes the view. */
  step(hours = 1) {
    let result = this.last;
    const count = Math.max(0, Math.floor(hours));
    for (let index = 0; index < count; index += 1) result = this.tick();
    this.last = result;
    return result;
  }
  view() {
    return this.last;
  }
  emit(name, payload) {
    this.stepEvents.push(this.events.emit(name, payload));
  }
  tick() {
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
  advanceEnvironmentEvents() {
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
          message: `${this.eventLabel(event.type)} expected in about ${away} h.${monitored ? "" : " Warning is late: no radiation monitor or no dish."}`
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
  eventLabel(type) {
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
  applyEventDamage(damage) {
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
        instanceId: instance.instanceId
      });
    }
  }
  worseDamage(current, incoming) {
    const order = ["none", "minor", "moderate", "critical", "destroyed"];
    return order[Math.max(order.indexOf(current), order.indexOf(incoming))];
  }
  applyResourceDeltas(deltas) {
    for (const [resource, delta] of Object.entries(deltas)) {
      this.resources[resource] = this.clampResource(resource, (this.resources[resource] ?? 0) + delta);
    }
  }
  /* --------------------------------------------------------------- sunlight --- */
  computeSunlight() {
    const { daylightHours, nightHours, cycleEnabled } = this.config.lunar;
    this.dustClearance = Math.max(0, this.dustClearance - 0.12);
    const eventFactor = Math.min(1, this.eventSunlightMultiplier() + this.dustClearance);
    if (!cycleEnabled) {
      this.sunFactor = eventFactor;
      return;
    }
    const cycle = Math.max(1, daylightHours + nightHours);
    const phase = (this.hourNow % cycle + cycle) % cycle;
    this.sunFactor = (phase < daylightHours ? 1 : 0) * eventFactor;
  }
  /* ------------------------------------------------------------- capacity --- */
  recomputeCapacities() {
    const next = {};
    for (const definition of this.db.resources) next[definition.id] = definition.baseCapacity ?? 0;
    for (const instance of this.instanceList) {
      if (!isOperational(instance)) continue;
      const type = this.typeOf(instance);
      for (const grant of type.capacityGrants) {
        next[grant.resource] = (next[grant.resource] ?? 0) + grant.amount * this.levelMultiplier(instance.level);
      }
      if (type.batteryCapacityKwh > 0) {
        next.electricalEnergy = (next.electricalEnergy ?? 0) + type.batteryCapacityKwh * this.levelMultiplier(instance.level) * this.damageMultiplier(instance.damage);
      }
    }
    let changed = false;
    for (const [id, value] of Object.entries(next)) {
      const before2 = this.capacities[id];
      if (before2 === void 0 || Math.abs(before2 - value) > 1e-9) changed = true;
    }
    if (Object.keys(this.capacities).length !== Object.keys(next).length) changed = true;
    this.capacities = next;
    for (const definition of this.db.resources) {
      if (definition.hardMax !== null) this.resources[definition.id] = Math.min(this.resources[definition.id], definition.hardMax);
    }
    for (const [id, capacity] of Object.entries(next)) {
      if (capacity > 0 && (this.resources[id] ?? 0) > capacity) this.resources[id] = capacity;
    }
    return changed;
  }
  clampResource(resource, value) {
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
  resolvePower() {
    const drawMultiplier = this.activeMultiplier("powerDrawMultiplier");
    const eventEfficiency = this.eventBuildingEfficiency();
    let solarKwh = 0;
    for (const instance of this.instanceList) {
      const type = this.typeOf(instance);
      if (type.solarKwhPerFullSunHour <= 0) continue;
      if (!isOperational(instance) || OFFISH_STATES.has(instance.status)) continue;
      solarKwh += type.solarKwhPerFullSunHour * this.sunFactor * this.damageMultiplier(instance.damage) * this.levelMultiplier(instance.level) * this.activeMultiplier("solarMultiplier") * eventEfficiency;
    }
    const consumers = [];
    for (const instance of this.instanceList) {
      const type = this.typeOf(instance);
      if (type.powerDrawKwh <= 0) continue;
      if (!RUNNING_STATES.has(instance.status)) continue;
      if (instance.status === "UNDER_CONSTRUCTION") continue;
      const draw = type.powerDrawKwh * this.damageMultiplier(instance.damage) * drawMultiplier * (instance.typeId === "greenhouse" ? 1 : 1);
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
    const starvedInstanceIds = [];
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
        cutReason: starved ? totalBrownout ? "Total brownout mode: nothing runs until there is enough power for everything." : `Not enough power. Priority ${consumer.type.priority} was cut after ${Math.round(availableKwh * 10) / 10} kWh were used by higher-priority systems.` : null
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
      const suggested = consumers.filter((item) => !item.type.essential).sort((a, b) => b.draw - a.draw).slice(0, 3).map((item) => ({ instanceId: item.instance.instanceId, typeId: item.instance.typeId, powerDraw: round(item.draw, 2) }));
      const payload = {
        demand: round(demandKwh, 2),
        supply: round(supplyKwh, 2),
        deficit: round(Math.max(0, demandKwh - supplyKwh), 2),
        suggestedShutdowns: suggested,
        highlightEnabled: this.settings.highlightGuidance,
        requestPause: true
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
      sunlightFactor: round(this.sunFactor, 3)
    };
  }
  requestEmergencyPause(source) {
    if (this.emergencyActive) return;
    this.emergencyActive = true;
    this.emit("EMERGENCY_STARTED", { message: `Emergency from ${source}.` });
    this.clockSink?.requestAutoPause(source);
  }
  /* ------------------------------------------------------------------ crew --- */
  crewScale() {
    return this.crewSize / Math.max(1, this.config.crew.referenceSize);
  }
  averageCrewActivity() {
    const living = this.crewList.filter((member) => member.status !== "Deceased");
    if (living.length === 0) return 0;
    return living.reduce((sum, member) => sum + member.activityMultiplier, 0) / living.length;
  }
  runCrewConsumption() {
    const habitat = this.instanceList.find((instance) => instance.typeId === "pressurized_habitat" && isOperational(instance));
    const flows = {};
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
          cause: `The crew needs ${round(wanted, 3)} ${this.resourceUnit(flow.resource)} per hour more.`
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
  missingDependency(type) {
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
  capabilityLabel(tag) {
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
  runProcessors(power) {
    this.heatRemovedKwh = 0;
    const processorMultiplier = this.activeMultiplier("processorMultiplier");
    const eventEfficiency = this.eventBuildingEfficiency();
    for (const instance of this.instanceList) {
      const type = this.typeOf(instance);
      if (type.special === "processor") this.runProcessorInstance(instance, type, processorMultiplier, eventEfficiency);
      if (type.special === "radiator") this.runRadiator(instance, type, processorMultiplier, eventEfficiency);
    }
    this.updateThermal();
  }
  deliveredRatio(instanceId) {
    const entry = this.powerByInstance.get(instanceId);
    if (!entry || entry.requested <= 0) return 1;
    return clamp(entry.delivered / entry.requested, 0, 1);
  }
  setpointPaused(type) {
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
      if ((this.resources.capturedCO2 ?? 0) <= 1e-3 && co2 < this.config.atmosphere.bands.co2SafeMax) {
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
  setpointControl(type) {
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
  runProcessorInstance(instance, type, processorMultiplier, eventEfficiency) {
    const records = {};
    const hasInputFlow = type.inputs.length > 0 || type.outputs.length > 0;
    if (!hasInputFlow) {
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
        cause: `It needs ${missing}.`
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
          cause: `The ${this.resourceName(type.blocksWhenFull)} store is full. Something downstream must use it.`
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
    let efficiency = ratio * this.damageMultiplier(instance.damage) * this.levelMultiplier(instance.level) * processorMultiplier * eventEfficiency;
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
      const before2 = this.resources[flow.resource] ?? 0;
      const after2 = this.clampResource(flow.resource, before2 + made);
      const vented = before2 + made - after2;
      this.resources[flow.resource] = after2;
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
            cause: `It ran out of ${this.resourceName(flow.resource)}.`
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
  runRadiator(instance, type, processorMultiplier, eventEfficiency) {
    if (type.heatRemovalKwh <= 0) return;
    const ratio = this.deliveredRatio(instance.instanceId);
    const capacity = type.heatRemovalKwh * ratio * this.damageMultiplier(instance.damage) * this.levelMultiplier(instance.level) * this.activeMultiplier("radiatorMultiplier") * eventEfficiency * processorMultiplier;
    const removed = capacity * this.thermalDemand();
    this.heatRemovedKwh += removed;
    this.flows.set(instance.instanceId, {
      heat: { wanted: type.heatRemovalKwh, got: removed, blocked: ratio + 1e-9 < 1 }
    });
    this.efficiencyByInstance.set(instance.instanceId, ratio);
  }
  /** 0 = cabin is cool enough, 1 = radiator must run at full capacity. */
  thermalDemand() {
    const target = this.config.thermal.thermostatTargetC;
    const band = Math.max(0.5, this.config.thermal.controlBandC);
    const temperature = this.resources.cabinTemperature ?? target;
    return clamp((temperature - (target - band / 2)) / band, 0, 1);
  }
  /* ---------------------------------------------------------------- thermal --- */
  heatProducedKwh() {
    const consumed = this.powerByInstanceTotal();
    const crewHeat = this.config.crew.ratesAtReference.heatKwh * this.crewScale() * this.averageCrewActivity();
    return consumed * this.config.thermal.electricalHeatFraction + crewHeat;
  }
  powerByInstanceTotal() {
    let total = 0;
    for (const entry of this.powerByInstance.values()) total += entry.delivered;
    return total;
  }
  updateThermal() {
    const exterior = this.sunFactor > 0 ? this.config.thermal.dayExteriorC : this.config.thermal.nightExteriorC;
    const temperature = this.resources.cabinTemperature ?? this.config.atmosphere.initialTemperatureC;
    const leaked = (exterior - temperature) * this.config.thermal.ambientKwhPerHourPerC;
    const thermostat = this.thermostatKwh(temperature, exterior);
    const net = this.heatProducedKwh() + leaked + thermostat - this.heatRemovedKwh;
    const next = temperature + net / Math.max(1e-3, this.config.thermal.massKwhPerC);
    this.resources.cabinTemperature = clamp(next, -90, 90);
  }
  /** Simple bang-bang heater/cooler around the thermostat target, limited by the bus. */
  thermostatKwh(temperature, exterior) {
    const target = this.config.thermal.thermostatTargetC;
    if (!this.provides("power_bus")) return 0;
    if (temperature < target - 1) {
      return Math.min(4, (target - temperature) * 0.4);
    }
    if (temperature > target + 1 && exterior < temperature) return 0;
    return 0;
  }
  /* ------------------------------------------------------------ crew health --- */
  currentTier() {
    const volume = this.habitatVolume();
    const o2 = this.pressureForMass(this.resources.cabinO2 ?? 0, volume, this.config.gas.o2MolarMassKg);
    const co2 = this.pressureForMass(this.resources.cabinCO2 ?? 0, volume, this.config.gas.co2MolarMassKg);
    const temperature = this.resources.cabinTemperature ?? 22;
    const tiers = this.config.crew.survivalTiers;
    for (const tier of tiers) {
      if (co2 <= tier.maxCo2MmHg && temperature >= tier.minTempC && temperature <= tier.maxTempC && o2 >= tier.minO2MmHg) {
        return { id: tier.id, activityMultiplier: tier.activityMultiplier };
      }
    }
    const critical = tiers[tiers.length - 1];
    return { id: critical.id, activityMultiplier: critical.activityMultiplier };
  }
  updateCrewHealth() {
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
      drain += shelterAvailable ? this.config.crew.shelterInPlaceDrainPerHour : this.config.crew.exposureDrainPerHour;
      this.emergencyFlags.push("radiation_exposed");
    }
    const recovery = this.config.crew.recoveryPerHour;
    for (const member of this.crewList) {
      if (member.status === "Deceased") continue;
      const before2 = member.health;
      member.health = clamp(drain > 0 ? member.health - drain : member.health + recovery, 0, 100);
      const shelterPenalty = this.crewSheltered ? this.config.crew.shelteredActivityFactor : 1;
      member.activityMultiplier = tier.activityMultiplier * shelterPenalty * (member.status === "Severe" ? 0.5 : 1);
      const nextStatus = member.health <= 0 ? "Deceased" : member.health <= this.config.crew.severeAtOrBelow ? "Severe" : member.health <= this.config.crew.impairedAtOrBelow ? "Impaired" : "Normal";
      if (nextStatus !== member.status) {
        member.status = nextStatus;
        this.emit("CREW_STATUS_CHANGED", {
          message: `${member.name} is now ${nextStatus.toLowerCase()}.`,
          astronautId: member.id
        });
      }
      if (before2 > 0 && member.health <= 0) {
        this.alerts.push(`${member.name} has been lost.`);
      }
    }
    if (tier.id !== "nominal") {
      this.warnings.set("crew", {
        message: `Crew are in the ${tier.id} band.`,
        cause: this.tierCause(tier.id)
      });
    }
  }
  tierCause(tierId) {
    if (tierId === "critical") return "Air, temperature or supplies are outside what a body can take.";
    if (tierId === "warning") return "Something in the cabin is uncomfortable enough to slow work down.";
    return "";
  }
  habitatFlowBlocked(resource) {
    const habitat = this.instanceList.find((instance) => instance.typeId === "pressurized_habitat");
    if (!habitat) return true;
    return this.flows.get(habitat.instanceId)?.[resource]?.blocked === true;
  }
  /* ----------------------------------------------- construction and repair --- */
  advanceConstructionAndRepairs() {
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
        this.warnings.set(instance.instanceId, {
          message: `${type.name} is ${instance.damage}.`,
          cause: "It needs a repair crew and spare parts."
        });
      }
    }
  }
  defaultStatusFor(type) {
    if (type.allowedStates.includes("ON")) return "ON";
    if (type.allowedStates.includes("PARKED")) return "PARKED";
    if (type.allowedStates.includes("DEPLOYED")) return "DEPLOYED";
    if (type.allowedStates.includes("ACTIVE")) return "ACTIVE";
    return type.allowedStates[0] ?? "ON";
  }
  runPendingCycles(power) {
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
    for (const instance of this.instanceList) {
      if (this.typeOf(instance).special === "rover" && instance.status === "MOVING") {
        instance.status = "PARKED";
      }
    }
  }
  /* -------------------------------------------------------------- power-ups --- */
  definitionFor(typeId) {
    return this.config.powerUps.find((definition) => definition.typeId === typeId);
  }
  advancePowerUps() {
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
  spawnCollectible() {
    if (this.config.powerUps.length === 0) return;
    const definition = this.config.powerUps[this.rng.nextInt(this.config.powerUps.length)];
    const collectible = {
      collectibleId: `crate-${this.nextCollectibleSerial}`,
      typeId: definition.typeId,
      position: { x: 120 + this.rng.next() * 1040, y: 110 + this.rng.next() * 560 }
    };
    this.nextCollectibleSerial += 1;
    this.crateList.push(collectible);
    this.emit("POWERUP_SPAWNED", { message: `A supply crate landed on the surface.` });
  }
  /* --------------------------------------------------------------------- xp --- */
  essentialsOk() {
    for (const type of this.db.buildings) {
      if (!type.essential) continue;
      const working = this.instanceList.some(
        (instance) => instance.typeId === type.typeId && isOperational(instance) && !instance.isStarved
      );
      if (!working) return false;
    }
    return true;
  }
  awardSteadyStateXp(power) {
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
  paySolIncome() {
    const solHours = Math.max(1, Math.round(this.config.time.stepsPerDay));
    if (this.hourNow <= 0 || this.hourNow % solHours !== 0) return;
    const dish = this.instanceList.some(
      (instance) => instance.typeId === "communications" && isOperational(instance) && !instance.isStarved
    );
    if (!dish) {
      this.alerts.push("No working comms dish: this sol's science could not be sent home.");
      return;
    }
    const credits = round(this.config.economy.uplinkCreditsPerSol * this.crewScale(), 0);
    this.resources.money = (this.resources.money ?? 0) + credits;
    this.alerts.push(`Science uplink sold to the agency: +${credits} credits.`);
    const parts = this.config.economy.resupplyPartsPerSol;
    if (parts > 0) {
      this.resources.spareParts = this.clampResource("spareParts", (this.resources.spareParts ?? 0) + parts);
      this.alerts.push(`Resupply crate landed: +${parts} spare ${parts === 1 ? "part" : "parts"}.`);
    }
  }
  /* ------------------------------------------------------------ alert + end --- */
  gatherAlerts(power, atmosphere) {
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
        this.crewSheltered ? "Radiation event: crew are sheltered and not working." : "Radiation event: crew are exposed! Shelter them or the dose adds up."
      );
    }
    for (const definition of this.db.resources) {
      if (!["food", "cleanWater", "spareParts", "nutrients"].includes(definition.id)) continue;
      const capacity = this.capacities[definition.id] ?? 0;
      const value = this.resources[definition.id] ?? 0;
      if (capacity > 0 && value / capacity <= 0.15) {
        this.alerts.push(`${definition.name} is running out (${Math.round(value / capacity * 100)}%).`);
      }
    }
    for (const instance of this.instanceList) {
      if (instance.isStarved) {
        const type = this.typeOf(instance);
        this.alerts.push(`${type.name} is starved of power and working slowly.`);
      }
    }
  }
  checkMissionFailure() {
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
  o2Band(mmHg) {
    const bands = this.config.atmosphere.bands;
    if (mmHg >= bands.o2SafeMin && mmHg <= bands.o2SafeMax) return "safe";
    if (mmHg >= bands.o2WarningMin) return "warning";
    return "critical";
  }
  co2Band(mmHg) {
    const bands = this.config.atmosphere.bands;
    if (mmHg <= bands.co2SafeMax) return "safe";
    if (mmHg <= bands.co2WarningMax) return "warning";
    return "critical";
  }
  tempBand(celsius) {
    const bands = this.config.atmosphere.bands;
    if (celsius >= bands.tempSafeMin && celsius <= bands.tempSafeMax) return "safe";
    if (celsius >= bands.tempWarningLowMin && celsius <= bands.tempWarningHighMax) return "warning";
    return "critical";
  }
  molarMass(definitionId) {
    const definition = this.db.resources.find((item) => item.id === definitionId);
    if (definition?.molarMassKgPerMol) return definition.molarMassKgPerMol;
    return definitionId === "cabinCO2" ? this.config.gas.co2MolarMassKg : this.config.gas.o2MolarMassKg;
  }
  displayFor(definitionId, value, capacity, volume) {
    const definition = this.db.resources.find((item) => item.id === definitionId);
    const kind = definition?.display ?? "raw";
    switch (kind) {
      case "percent_capacity":
        return { value: capacity > 0 ? round(value / capacity * 100, 1) : 0, unit: "%" };
      case "partial_pressure_mmHg":
        return { value: round(this.pressureForMass(value, volume, this.molarMass(definitionId)), 2), unit: "mmHg" };
      case "celsius":
        return { value: round(value, 2), unit: "C" };
      default:
        return { value: round(value, 3), unit: definition?.unit ?? "" };
    }
  }
  resourceSnapshot(volume) {
    const raw = {};
    const capacity = {};
    const display = {};
    for (const definition of this.db.resources) {
      raw[definition.id] = round(this.resources[definition.id] ?? 0, 4);
      capacity[definition.id] = round(this.capacities[definition.id] ?? 0, 4);
      display[definition.id] = this.displayFor(definition.id, raw[definition.id], capacity[definition.id], volume);
    }
    return { raw, capacity, display };
  }
  resourceName(resource) {
    return this.db.resources.find((item) => item.id === resource)?.name ?? resource;
  }
  resourceUnit(resource) {
    return this.db.resources.find((item) => item.id === resource)?.unit ?? "";
  }
  buildStepResult(power) {
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
      temperatureBand: this.tempBand(temperatureC)
    };
    this.gatherAlerts(power, atmosphere);
    this.checkMissionFailure();
    const radiationActive = this.radiationEventActive();
    const radiationExposure = radiationActive ? this.crewSheltered ? "sheltered" : "exposed" : "nominal";
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
      atmosphere
    };
  }
  /* ----------------------------------------------------------- public reads --- */
  get hour() {
    return this.hourNow;
  }
  get paused() {
    return this.pausedFlag;
  }
  set paused(value) {
    this.pausedFlag = value;
  }
  pausedFlag = true;
  get speedIndex() {
    return this.speedSlot;
  }
  setSpeed(index) {
    this.speedSlot = clamp(Math.round(index), 0, Math.max(0, this.config.time.speeds.length - 1));
  }
  speedSlot = 1;
  msPerSimHour() {
    const multiplier = this.config.time.speeds[this.speedSlot] ?? 1;
    return this.config.time.baseMsPerSimHour / Math.max(0.05, multiplier);
  }
  settingsSnapshot() {
    return { ...this.settings };
  }
  get mode() {
    return this.settings.powerShortageMode;
  }
  get highlightGuidance() {
    return this.settings.highlightGuidance;
  }
  lunarPhase() {
    const { daylightHours, nightHours, cycleEnabled } = this.config.lunar;
    if (!cycleEnabled) {
      return { daylight: true, sunlightFactor: round(this.sunFactor, 3), hoursToChange: 0 };
    }
    const cycle = Math.max(1, daylightHours + nightHours);
    const phase = (this.hourNow % cycle + cycle) % cycle;
    const daylight = phase < daylightHours;
    return {
      daylight,
      sunlightFactor: round(this.sunFactor, 3),
      hoursToChange: round(daylight ? daylightHours - phase : cycle - phase, 2)
    };
  }
  instances() {
    return this.instanceList.map((instance) => ({ ...instance }));
  }
  instance(instanceId) {
    return this.instanceList.find((instance) => instance.instanceId === instanceId);
  }
  crew() {
    return this.crewList.map((member) => ({ ...member }));
  }
  /** Radiation events inside the next simulated day - feeds `utils/radiation.ts`. */
  radiationStormCount() {
    const windowEnd = this.hourNow + 24;
    return this.tracked.filter(
      (event) => event.effects.radiation === true && !event.ended && event.startHour + event.durationHours >= this.hourNow && event.startHour <= windowEnd
    ).length;
  }
  crewShelteredNow() {
    return this.crewSheltered;
  }
  counters() {
    return {
      roverCycles: this.roverCycles,
      powerUpsCollected: this.powerUpsCollected,
      brownoutsRecovered: this.brownoutsRecovered
    };
  }
  awardedRewards() {
    return [...this.awardedRewardIds];
  }
  /** A level costs one perfectly run simulated day, derived from the config. */
  level() {
    const perLevel = Math.max(1, this.config.crew.optimalXpPerHour * this.config.time.stepsPerDay);
    const xp = this.resources.xp ?? 0;
    const level = Math.floor(xp / perLevel) + 1;
    return { level, xpToNext: round(level * perLevel - xp, 2) };
  }
  collectibles() {
    return this.crateList.map((crate) => ({ ...crate, position: { ...crate.position } }));
  }
  powerUpViews() {
    return this.powerUps.map((state) => {
      const definition = this.definitionFor(state.typeId);
      if (!definition) {
        return { state, ready: false, reason: "Unknown boost." };
      }
      const ready = state.charges > 0 && state.activeRemainingHours === 0;
      let reason = null;
      if (state.activeRemainingHours > 0) reason = `Running for ${state.activeRemainingHours} more h.`;
      else if (state.charges === 0) reason = `Recharging: ${state.cooldownRemainingHours} h to go.`;
      return { definition, state: { ...state }, ready, reason };
    });
  }
  eventViews() {
    return this.tracked.map((event) => {
      let phase;
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
        radiation: event.effects.radiation === true
      };
    });
  }
  eventExplanation(type) {
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
  buildables() {
    const xp = this.resources.xp ?? 0;
    return this.db.buildings.map((type) => {
      const built = this.instanceList.filter((instance) => instance.typeId === type.typeId).length;
      const unlocked = xp >= type.unlockXp;
      const full = built >= type.maxInstances;
      const missing = [];
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
        affordabilityReason: full ? `Already at the maximum of ${type.maxInstances}.` : missing.length > 0 ? `Still need ${missing.join(", ")}.` : null,
        instances: built,
        maxInstances: type.maxInstances
      };
    });
  }
  /* ------------------------------------------------------------- inspect --- */
  inspect(instanceId) {
    if (!instanceId) return null;
    const instance = this.instance(instanceId);
    if (!instance) return null;
    const type = this.typeOf(instance);
    const records = this.flows.get(instanceId) ?? {};
    const power = this.powerByInstance.get(instanceId);
    const requested = power?.requested ?? 0;
    const delivered = power?.delivered ?? 0;
    const mapFlows = (flows) => flows.map((flow) => {
      const record = records[flow.resource];
      return {
        resourceId: flow.resource,
        label: this.resourceName(flow.resource),
        unit: this.resourceUnit(flow.resource),
        wantedPerHour: round(record?.wanted ?? flow.amount, 4),
        actualPerHour: round(record?.got ?? 0, 4),
        blocked: record?.blocked ?? false
      };
    });
    const tags = [...type.requires, ...type.requiresAny.flat()];
    if (type.powerDrawKwh > 0 && this.config.power.requirePowerDistribution && !tags.includes("power_bus")) {
      tags.push("power_bus");
    }
    const dependsOn = tags.map((tag) => {
      const okTag = this.hasCapability(tag);
      return {
        typeId: tag,
        name: this.capabilityLabel(tag),
        ok: okTag,
        problemReason: okTag ? null : `Nothing is providing ${this.capabilityLabel(tag)}.`
      };
    });
    const warning = this.warnings.get(instanceId) ?? null;
    const levelMultiplier = this.levelMultiplier(instance.level);
    const grants = type.capacityGrants.map((grant) => ({
      resourceId: grant.resource,
      label: this.resourceName(grant.resource),
      amount: round(grant.amount * levelMultiplier, 3),
      unit: this.resourceUnit(grant.resource)
    }));
    const actions = [];
    const constructing = instance.status === "UNDER_CONSTRUCTION";
    if (constructing) {
      actions.push({
        kind: "cancel",
        instanceId: instance.instanceId,
        label: "Stop building",
        enabled: true,
        reason: null,
        cost: `Refunds ${Math.round(this.config.construction.demolishRefundFraction * 100)}% of the parts used.`
      });
    } else if (type.allowedStates.includes("ON") && type.allowedStates.includes("OFF")) {
      const on = RUNNING_STATES.has(instance.status);
      actions.push({
        kind: on ? "stop" : "start",
        instanceId: instance.instanceId,
        label: on ? "Switch off" : "Switch on",
        enabled: instance.damage !== "destroyed",
        reason: instance.damage === "destroyed" ? "It is destroyed - repair it first." : null,
        cost: type.powerDrawKwh > 0 ? `${round(type.powerDrawKwh, 2)} kWh per hour` : null
      });
    }
    if (type.special === "rover" || type.special === "airlock") {
      const canCycle = !constructing && instance.damage !== "destroyed" && !instance.pendingCycle && !this.crewSheltered;
      actions.push({
        kind: "cycle",
        instanceId: instance.instanceId,
        label: type.special === "rover" ? "Send on science trip" : "Crew EVA (clean panels)",
        enabled: canCycle,
        reason: this.crewSheltered ? "The crew is sheltered - bring them out first." : instance.pendingCycle ? "Already queued for this hour." : null,
        cost: type.special === "rover" ? `${round(type.powerDrawKwh, 2)} kWh, crew away from base` : "Crew time and no shielding outside"
      });
    }
    if (instance.damage !== "none") {
      const rule = this.config.repair[instance.damage];
      const partsNeeded = rule?.parts ?? 0;
      const blocked = instance.damage === "destroyed" ? "Destroyed systems cannot be repaired - build a new one." : !rule ? null : (this.resources.spareParts ?? 0) < partsNeeded ? `Needs ${partsNeeded} spare parts.` : rule.directPlayer || this.averageCrewActivity() >= 0.5 ? null : "A big repair needs a fit crew.";
      actions.push({
        kind: "repair",
        instanceId: instance.instanceId,
        label: "Repair",
        enabled: blocked === null,
        reason: blocked,
        cost: rule ? `${rule.parts} parts, ${rule.hours} h` : null
      });
    }
    const nextUpgrade = type.upgrades.find((upgrade) => upgrade.level === instance.level + 1);
    if (nextUpgrade && !constructing) {
      const missing = [];
      if ((this.resources.money ?? 0) < nextUpgrade.costMoney) missing.push(`${nextUpgrade.costMoney} credits`);
      if ((this.resources.spareParts ?? 0) < nextUpgrade.costParts) missing.push(`${nextUpgrade.costParts} parts`);
      actions.push({
        kind: "upgrade",
        instanceId: instance.instanceId,
        label: `Upgrade to level ${nextUpgrade.level}`,
        enabled: missing.length === 0,
        reason: missing.length > 0 ? `Still need ${missing.join(" and ")}.` : null,
        cost: `${nextUpgrade.costMoney} credits, ${nextUpgrade.costParts} parts, +${Math.round(this.config.level.bonusPerLevel * 100)}%`
      });
    }
    if (!constructing) {
      actions.push({
        kind: "demolish",
        instanceId: instance.instanceId,
        label: "Remove",
        enabled: true,
        reason: type.essential ? "This system is essential - the outpost will suffer." : null,
        cost: `Returns ${Math.round(this.config.construction.demolishRefundFraction * 100)}% of the build cost.`
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
      sourceNote: type.inputs.concat(type.outputs).length > 0 ? "Flow rates come from buildings.json. Numbers marked NASA are real rates; the rest are game assumptions." : "Structure and storage rules from buildings.json (game assumptions)."
    };
  }
  /* -------------------------------------------------------------- actions --- */
  missingBuildCost(type) {
    const missing = [];
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
  payBuildCost(type) {
    this.resources.money = Math.max(0, (this.resources.money ?? 0) - type.buildCost.money);
    this.resources.regolith = Math.max(0, (this.resources.regolith ?? 0) - type.buildCost.regolith);
    this.resources.spareParts = Math.max(0, (this.resources.spareParts ?? 0) - type.buildCost.spareParts);
  }
  build(typeId, slotId) {
    const type = this.types.get(typeId);
    if (!type) return err("UNKNOWN_TYPE", `There is no system called ${typeId}.`);
    if ((this.resources.xp ?? 0) < type.unlockXp) {
      return err("LOCKED", `${type.name} unlocks at ${type.unlockXp} XP.`);
    }
    const built = this.instanceList.filter((instance2) => instance2.typeId === typeId).length;
    if (built >= type.maxInstances) {
      return err("MAX_INSTANCES", `You already have the maximum of ${type.maxInstances} ${type.name}(s).`);
    }
    const missing = this.missingBuildCost(type);
    if (missing) return err("CANNOT_AFFORD", missing);
    const chosenSlot = slotId ?? `slot-${this.nextInstanceSerial}`;
    if (this.instanceList.some((instance2) => instance2.slotId === chosenSlot)) {
      return err("SLOT_TAKEN", "That pad is already used.");
    }
    this.payBuildCost(type);
    const instance = this.makeInstance(typeId, "UNDER_CONSTRUCTION", chosenSlot);
    instance.constructionRemainingHours = type.buildHours;
    this.instanceList.push(instance);
    this.emit("CONSTRUCTION_STARTED", {
      message: `${type.name} is under construction (${type.buildHours} h).`,
      instanceId: instance.instanceId
    });
    return ok(instance);
  }
  cancelConstruction(instanceId) {
    const instance = this.instance(instanceId);
    if (!instance) return err("NOT_FOUND", "That system is gone.");
    if (instance.status !== "UNDER_CONSTRUCTION") return err("NOT_BUILDING", "Nothing is being built there.");
    this.refund(this.typeOf(instance));
    this.removeInstance(instanceId);
    this.emit("BUILDING_DEMOLISHED", { message: "Construction stopped and parts returned.", instanceId });
    return ok(void 0);
  }
  demolish(instanceId) {
    const instance = this.instance(instanceId);
    if (!instance) return err("NOT_FOUND", "That system is gone.");
    const type = this.typeOf(instance);
    this.refund(type);
    this.removeInstance(instanceId);
    this.emit("BUILDING_DEMOLISHED", { message: `${type.name} removed.`, instanceId });
    this.recomputeCapacities();
    return ok(void 0);
  }
  refund(type) {
    const fraction = this.config.construction.demolishRefundFraction;
    this.resources.money = (this.resources.money ?? 0) + type.buildCost.money * fraction;
    this.resources.regolith = this.clampResource(
      "regolith",
      (this.resources.regolith ?? 0) + type.buildCost.regolith * fraction
    );
    this.resources.spareParts = (this.resources.spareParts ?? 0) + type.buildCost.spareParts * fraction;
  }
  removeInstance(instanceId) {
    this.instanceList = this.instanceList.filter((instance) => instance.instanceId !== instanceId);
    this.flows.delete(instanceId);
    this.powerByInstance.delete(instanceId);
    this.efficiencyByInstance.delete(instanceId);
    this.warnings.delete(instanceId);
  }
  repair(instanceId) {
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
    return ok(void 0);
  }
  upgrade(instanceId) {
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
    return ok(void 0);
  }
  setStatus(instanceId, status) {
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
    return ok(void 0);
  }
  runCycle(instanceId) {
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
    return ok(void 0);
  }
  activatePowerUp(typeId) {
    const state = this.powerUps.find((item) => item.typeId === typeId);
    const definition = this.definitionFor(typeId);
    if (!state || !definition) return err("UNKNOWN_POWERUP", `No boost called ${typeId}.`);
    if (state.activeRemainingHours > 0) return err("ALREADY_ACTIVE", `${definition.name} is already running.`);
    if (state.charges <= 0) return err("NO_CHARGES", `${definition.name} is recharging (${state.cooldownRemainingHours} h).`);
    state.charges -= 1;
    state.activeRemainingHours = definition.durationHours;
    state.cooldownRemainingHours = 0;
    this.emit("POWERUP_ACTIVATED", { message: `${definition.name} on for ${definition.durationHours} h.` });
    return ok(void 0);
  }
  collectPowerUp(collectibleId) {
    const crateIndex = this.crateList.findIndex((crate2) => crate2.collectibleId === collectibleId);
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
    return ok(void 0);
  }
  setCrewSheltered(on) {
    if (on && !this.provides("shelter")) return err("NO_SHELTER", "Build the Radiation Shelter first.");
    if (on && this.crewSheltered) return ok(void 0);
    this.crewSheltered = on;
    this.alerts.push(
      on ? "Crew are in the shelter: protected, but not repairing or working outside." : "Crew are back at work."
    );
    if (!on && this.radiationEventActive()) {
      this.alerts.push("Careful: a radiation event is still active and the crew is exposed.");
    }
    return ok(void 0);
  }
  setPowerShortageMode(mode) {
    this.settings.powerShortageMode = mode;
  }
  setHighlightGuidance(on) {
    this.settings.highlightGuidance = on;
  }
  /** The only place XP is awarded. Reward ids are stable and deduplicated. */
  awardXp(rewardId, amount) {
    if (this.awardedRewardIds.includes(rewardId)) return ok(this.resources.xp ?? 0);
    this.awardedRewardIds.push(rewardId);
    this.resources.xp = Math.max(0, (this.resources.xp ?? 0) + amount);
    return ok(this.resources.xp);
  }
  /* ----------------------------------------------------------- persistence --- */
  snapshot() {
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
      idCounters: { ...this.idCounters }
    };
  }
  saveJson() {
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
        dustClearance: this.dustClearance
      }
    });
  }
  static fromSave(db2, json2, options = {}) {
    const parsed = JSON.parse(json2);
    const snapshot = parsed.sim ?? parsed;
    const sim2 = new _OutpostSimulator(db2, options);
    sim2.adopt(snapshot);
    const progress = parsed.progress;
    if (progress) {
      sim2.awardedRewardIds = progress.awardedRewards ?? [];
      sim2.crewSheltered = progress.crewSheltered ?? false;
      sim2.roverCycles = progress.roverCycles ?? 0;
      sim2.powerUpsCollected = progress.powerUpsCollected ?? 0;
      sim2.brownoutsRecovered = progress.brownoutsRecovered ?? 0;
      sim2.speedSlot = progress.speedIndex ?? 1;
      sim2.dustClearance = progress.dustClearance ?? 0;
    }
    sim2.last = sim2.buildStepResult(sim2.resolvePower());
    return sim2;
  }
  adopt(snapshot) {
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
    this.tracked = snapshot.events.length > 0 ? snapshot.events.map((event) => ({ ...event })) : this.tracked;
    this.brownoutActive = snapshot.brownoutActive;
    this.emergencyActive = snapshot.emergencyActive;
    this.nextInstanceSerial = snapshot.nextInstanceSerial;
    this.nextCollectibleSerial = snapshot.nextCollectibleSerial;
    this.idCounters = { ...snapshot.idCounters };
    if (this.crewList.length > 0) {
      this.crewSize = clamp(this.crewList.length, 1, this.config.crew.names.length);
    }
  }
};

// src/data/missions.ts
function batteryFraction(ctx) {
  const stored = ctx.view.resources.raw.electricalEnergy ?? 0;
  const capacity = ctx.view.resources.capacity.electricalEnergy ?? 0;
  if (capacity <= 0) return 0;
  return stored / capacity;
}
function countType(ctx, typeId) {
  return ctx.view.instances.filter((instance) => instance.typeId === typeId).length;
}
function typeWorking(ctx, typeId) {
  return ctx.view.instances.some(
    (instance) => instance.typeId === typeId && instance.status !== "OFF" && instance.status !== "DESTROYED" && instance.status !== "DAMAGED" && instance.status !== "UNDER_CONSTRUCTION"
  );
}
var MISSIONS = [
  {
    id: "first-light",
    name: "First Light",
    brief: "Power is the first job on the Moon. Keep the batteries charged through a full lunar day-night cycle.",
    rewardXp: 60,
    goals: [
      {
        id: "hour-24",
        label: "Run the outpost for 24 hours",
        hint: "Press play and let time pass.",
        check: (ctx) => ctx.view.hour >= 24
      },
      {
        id: "battery-half",
        label: "Charge the battery bank to at least 40%",
        hint: "Solar arrays make power only in sunlight, so the bank stores it for night.",
        check: (ctx) => batteryFraction(ctx) >= 0.4
      },
      {
        id: "solar-two",
        label: "Have two solar arrays working",
        hint: null,
        check: (ctx) => countType(ctx, "solar_array") >= 2 && typeWorking(ctx, "solar_array")
      },
      {
        id: "no-brownout-left",
        label: "End the day with power for everything",
        hint: "Fix a shortage by building power or switching something off.",
        check: (ctx) => !ctx.view.powerStatus.brownout && ctx.view.hour >= 24
      }
    ]
  },
  {
    id: "breathe-easy",
    name: "Breathe Easy",
    brief: "Air is chemistry. Oxygen comes from water, and the crew's CO2 has to be pulled back out of the cabin.",
    rewardXp: 80,
    goals: [
      {
        id: "o2-safe",
        label: "Keep cabin oxygen in the safe band",
        hint: "The oxygen generator uses clean water and power.",
        check: (ctx) => ctx.view.atmosphere.o2Band === "safe"
      },
      {
        id: "co2-safe",
        label: "Keep cabin CO2 in the safe band",
        hint: "The CO2 scrubber has to be running.",
        check: (ctx) => ctx.view.atmosphere.co2Band === "safe"
      },
      {
        id: "water-loop",
        label: "Run the water recycler",
        hint: null,
        check: (ctx) => typeWorking(ctx, "water_recovery")
      },
      {
        id: "greenhouse",
        label: "Grow food in the greenhouse",
        hint: "Plants need light (power) and water. No power means no salad.",
        check: (ctx) => countType(ctx, "greenhouse") >= 1 && typeWorking(ctx, "greenhouse")
      },
      {
        id: "crew-normal",
        label: "Every crew member back to Normal",
        hint: null,
        check: (ctx) => ctx.view.crew.length > 0 && ctx.view.crew.every((member) => member.status === "Normal")
      }
    ]
  },
  {
    id: "storm-ready",
    name: "Storm Ready",
    brief: "The Sun can be dangerous. Use a real archived solar-storm warning to protect the crew \u2014 and remember, every safe choice has a cost.",
    rewardXp: 100,
    goals: [
      {
        id: "shelter",
        label: "Build the radiation shelter",
        hint: "Shelter needs regolith and spare parts.",
        check: (ctx) => countType(ctx, "radiation_shelter") >= 1
      },
      {
        id: "monitor",
        label: "Get the radiation monitor working",
        hint: "Without a monitor the warning arrives late.",
        check: (ctx) => typeWorking(ctx, "radiation_monitor")
      },
      {
        id: "shelter-crew",
        label: "Shelter the crew during a radiation watch",
        hint: "Crew resting in the shelter cannot repair or work outside.",
        check: (ctx) => ctx.crewSheltered
      },
      {
        id: "rover-trip",
        label: "Complete one rover science trip",
        hint: "Driving the rover uses power and takes the crew away from the base.",
        check: (ctx) => ctx.roverCycles >= 1
      },
      {
        id: "recover",
        label: "Recover from a power shortage",
        hint: null,
        check: (ctx) => ctx.brownoutsRecovered >= 1
      }
    ]
  }
];
var GOAL_XP = 15;
function missionRewardId(missionId, goalId) {
  return `mission:${missionId}:obj:${goalId}`;
}
function missionCompleteRewardId(missionId) {
  return `mission:${missionId}:complete`;
}
function resolveMissions(templates, ctx, rewarded2) {
  return templates.map((template) => {
    const objectives = template.goals.map((goal) => ({
      id: goal.id,
      label: goal.label,
      hint: goal.hint,
      done: goal.check(ctx) || rewarded2.has(missionRewardId(template.id, goal.id))
    }));
    const complete = objectives.every((objective) => objective.done);
    return {
      id: template.id,
      name: template.name,
      brief: template.brief,
      rewardXp: template.rewardXp,
      objectives,
      complete,
      rewarded: rewarded2.has(missionCompleteRewardId(template.id))
    };
  });
}

// .work/scripts/smoke.ts
function line(value) {
  process.stdout.write(`${value}
`);
}
function crewText(view) {
  return view.crew.map((member) => `${member.health.toFixed(0)}${member.status.charAt(0)}`).join("/");
}
function trace(hour, view, daylight) {
  const battery = view.resources.display.electricalEnergy;
  const flags = [
    view.powerStatus.brownout ? "BROWNOUT" : "",
    view.radiationExposure === "exposed" ? "RADIATION" : "",
    view.missionStatus.state === "failed" ? "FAILED" : "",
    `sol ${view.powerStatus.solarKwh.toFixed(1)}`,
    `dem ${view.powerStatus.demandKwh.toFixed(1)}`,
    `sup ${view.powerStatus.supplyKwh.toFixed(1)}`,
    `chg ${view.powerStatus.chargedKwh.toFixed(1)}`,
    `dis ${view.powerStatus.dischargedKwh.toFixed(1)}`,
    `raw ${view.resources.raw.electricalEnergy.toFixed(0)}`,
    `starved ${view.powerStatus.starvedInstanceIds.length}`,
    view.instances.some((item) => item.damage !== "none") ? `dmg ${view.instances.filter((item) => item.damage !== "none").map((item) => `${item.typeId}:${item.damage}`).join(",")}` : ""
  ].filter(Boolean).join(" ");
  line(
    [
      `h${String(hour).padStart(3, "0")}`,
      daylight ? "day " : "night",
      `bat ${battery.value.toFixed(0)}%`,
      `O2 ${view.atmosphere.o2MmHg.toFixed(1)}(${view.atmosphere.o2Band})`,
      `CO2 ${view.atmosphere.co2MmHg.toFixed(2)}(${view.atmosphere.co2Band})`,
      `T ${view.atmosphere.temperatureC.toFixed(1)}(${view.atmosphere.temperatureBand})`,
      `food ${view.resources.raw.food.toFixed(1)}`,
      `water ${view.resources.raw.cleanWater.toFixed(1)}`,
      `H2 ${view.resources.raw.hydrogen.toFixed(2)}`,
      `cCO2 ${view.resources.raw.capturedCO2.toFixed(2)}`,
      `xp ${view.xp.toFixed(0)}`,
      `crew ${crewText(view)}`,
      `cr ${view.resources.raw.money.toFixed(0)}`,
      `parts ${view.resources.raw.spareParts.toFixed(0)}`,
      `dirt ${view.resources.raw.regolith.toFixed(0)}`,
      flags
    ].filter(Boolean).join("  ")
  );
}
var loaded = tryLoadGameDatabase();
if (!loaded.ok) {
  line(`DATA VALIDATION FAILED: ${loaded.error.message}`);
  process.exit(1);
}
var db = loaded.value;
line(`schema OK: ${db.resources.length} resources, ${db.buildings.length} buildings, ${db.events.length} events`);
var sim = new OutpostSimulator(db, { seed: 20261114, crewSize: db.config.crew.defaultSize });
trace(0, sim.view(), sim.lunarPhase().daylight);
var buildComplaints = /* @__PURE__ */ new Map();
var failures = 0;
var started = Date.now();
for (let hour = 1; hour <= 240; hour += 1) {
  if (hour === 2) {
    for (const instance of sim.instances()) {
      if (instance.typeId === "oxygen_generator") sim.setStatus(instance.instanceId, "ON");
    }
  }
  const wanted = [
    // Order matters: keep the crew alive, earn credits, then close the loops.
    ["thermal_control", "pad-11"],
    // the cabin cooks without radiators
    ["radiation_shelter", "pad-12"],
    // storms arrive with warning; dirt stops them
    ["rover", "pad-10"],
    // dirt, credits and spare hardware
    ["rover_charger", "pad-15"],
    // the rover cannot drive without it
    ["communications", "pad-17"],
    // science only pays when it reaches home
    ["sabatier", "pad-16"],
    // eats captured CO2 + hydrogen, gives water back
    ["solar_array", "pad-13"],
    ["cargo_module", "pad-14"]
  ];
  for (const [typeId, slotId] of wanted) {
    if (sim.instances().some((instance) => instance.typeId === typeId)) continue;
    const result = sim.build(typeId, slotId);
    if (result.ok) line(`  h${hour} build ${typeId} -> ok`);
    else {
      const complaint = `${result.error.code} - ${result.error.message}`;
      if (buildComplaints.get(typeId) !== complaint) {
        buildComplaints.set(typeId, complaint);
        line(`  h${hour} ${typeId} waiting: ${complaint}`);
      }
    }
  }
  if (hour % 12 === 2) {
    const rover = sim.instances().find((instance) => instance.typeId === "rover");
    if (rover) {
      const trip = sim.runCycle(rover.instanceId);
      if (!trip.ok) line(`  rover trip FAILED (${rover.status}): ${trip.error.code} - ${trip.error.message}`);
      else line(`  rover trip -> ok`);
    }
    const airlock = sim.instances().find((instance) => instance.typeId === "airlock");
    if (airlock) {
      const eva = sim.runCycle(airlock.instanceId);
      if (!eva.ok && hour === 2) line(`  eva waiting: ${eva.error.code} - ${eva.error.message}`);
    }
  }
  if (hour === 90) line(`  suntracer -> ${JSON.stringify(sim.activatePowerUp("suntracer"))}`);
  const exposureNow = sim.view().radiationExposure;
  if (exposureNow === "exposed" && !sim.crewShelteredNow()) sim.setCrewSheltered(true);
  if (exposureNow === "nominal" && sim.crewShelteredNow()) sim.setCrewSheltered(false);
  {
    for (const instance of sim.instances()) {
      if (instance.damage !== "none" && instance.status !== "REPAIRING" && instance.damage !== "destroyed") {
        const result = sim.repair(instance.instanceId);
        if (!result.ok && hour % 4 === 1) line(`  repair ${instance.typeId} -> ${result.error.message}`);
      }
    }
    const before2 = sim.view();
    const lamps = sim.instances().filter((instance) => instance.typeId === "greenhouse");
    if (before2.powerStatus.brownout || before2.resources.display.electricalEnergy.value < 35) {
      for (const lamp of lamps) {
        if (lamp.status !== "OFF" && lamp.status !== "UNDER_CONSTRUCTION") sim.setStatus(lamp.instanceId, "OFF");
      }
      if (before2.powerStatus.starvedInstanceIds.length > 3) {
        for (const charger of sim.instances().filter((instance) => instance.typeId === "rover_charger")) {
          if (charger.status !== "OFF") sim.setStatus(charger.instanceId, "OFF");
        }
      }
    } else if (before2.resources.display.electricalEnergy.value > 90) {
      for (const lamp of lamps) {
        if (lamp.status === "OFF") sim.setStatus(lamp.instanceId, "ON");
      }
    }
  }
  const view = sim.step(1);
  {
    const paid = new Set(sim.awardedRewards());
    const counts = sim.counters();
    const solved = resolveMissions(
      MISSIONS,
      {
        view,
        buildables: sim.buildables(),
        roverCycles: counts.roverCycles,
        powerUpsCollected: counts.powerUpsCollected,
        crewSheltered: sim.crewShelteredNow(),
        brownoutsRecovered: counts.brownoutsRecovered
      },
      paid
    );
    for (const mission of solved) {
      for (const goal of mission.objectives) {
        const rewardId = missionRewardId(mission.id, goal.id);
        if (goal.done && !paid.has(rewardId)) sim.awardXp(rewardId, GOAL_XP);
      }
      const completeId = missionCompleteRewardId(mission.id);
      if (mission.complete && !paid.has(completeId)) sim.awardXp(completeId, mission.rewardXp);
    }
  }
  for (const [id, value] of Object.entries(view.resources.raw)) {
    if (!Number.isFinite(value)) {
      line(`  !! non-finite resource ${id} at hour ${hour}: ${value}`);
      failures += 1;
    }
  }
  if (hour % 4 === 0 || view.missionStatus.state === "failed") trace(hour, view, sim.lunarPhase().daylight);
  if (view.missionStatus.state === "failed") {
    line(`  mission failed at hour ${hour}: ${view.missionStatus.reason}`);
    break;
  }
}
var counters = sim.counters();
var rewarded = new Set(sim.awardedRewards());
var missions = resolveMissions(
  MISSIONS,
  {
    view: sim.view(),
    buildables: sim.buildables(),
    roverCycles: counters.roverCycles,
    powerUpsCollected: counters.powerUpsCollected,
    crewSheltered: sim.crewShelteredNow(),
    brownoutsRecovered: counters.brownoutsRecovered
  },
  rewarded
);
for (const mission of missions) {
  const done = mission.objectives.filter((goal) => goal.done).length;
  line(`mission ${mission.id}: ${done}/${mission.objectives.length} goals, complete=${mission.complete}`);
}
line(`buildables affordable: ${sim.buildables().filter((item) => item.affordable).length}, instances=${sim.instances().length}`);
line(`level ${JSON.stringify(sim.level())}, storms ahead ${sim.radiationStormCount()}, radiation ${sim.view().radiationExposure}`);
line(`counters ${JSON.stringify(counters)}, rewards paid ${rewarded.size}`);
line(`event log rows: ${sim.eventViews().filter((event) => event.phase !== "upcoming").length}`);
line(`log tail: ${sim.view().alerts.slice(0, 3).join(" | ") || "(no active alerts)"}`);
var before = sim.view();
var json = sim.saveJson();
var restored = OutpostSimulator.fromSave(db, json, { seed: 4242 });
restored.step(5);
var after = restored.view();
line(`save ${json.length} bytes; hour ${before.hour} -> restored ${after.hour} (expect +5)`);
if (after.hour !== before.hour + 5) {
  line("  !! save/load hour mismatch");
  failures += 1;
}
if (!Number.isFinite(after.resources.raw.cabinO2) || after.resources.raw.cabinO2 <= 0) {
  line("  !! restored cabin oxygen lost");
  failures += 1;
}
if (restored.awardedRewards().length !== rewarded.size) {
  line("  !! rewards lost across save/load");
  failures += 1;
}
var twin = new OutpostSimulator(db, { seed: 20261114, crewSize: db.config.crew.defaultSize });
var otherTwin = new OutpostSimulator(db, { seed: 20261114, crewSize: db.config.crew.defaultSize });
var deterministic = JSON.stringify(twin.step(40)) === JSON.stringify(otherTwin.step(40));
line(`deterministic replay: ${deterministic}`);
if (!deterministic) failures += 1;
line(`done in ${((Date.now() - started) / 1e3).toFixed(2)} s, failures=${failures}`);
process.exit(failures === 0 ? 0 : 1);
