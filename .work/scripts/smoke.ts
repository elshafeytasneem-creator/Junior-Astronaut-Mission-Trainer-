/**
 * Headless smoke test for the finished engine + data documents.
 *
 * Run (from the project root):
 *   node .\node_modules\esbuild\bin\esbuild .work\scripts\smoke.ts --bundle --platform=node --format=esm --outfile=.work\smoke.mjs
 *   node .work\smoke.mjs
 *
 * Checks: schema validation of all four JSON docs, a 240-hour run with scripted player
 * actions, the emergent cause chains, and a save/load round trip.
 */

import { tryLoadGameDatabase } from "../../src/engine/loadDatabase";
import { OutpostSimulator } from "../../src/engine/simulator";
import { GOAL_XP, MISSIONS, missionCompleteRewardId, missionRewardId, resolveMissions } from "../../src/data/missions";
import type { StepResult } from "../../src/types/outpost";

function line(value: string): void {
  process.stdout.write(`${value}\n`);
}

function crewText(view: StepResult): string {
  return view.crew.map((member) => `${member.health.toFixed(0)}${member.status.charAt(0)}`).join("/");
}

function trace(hour: number, view: StepResult, daylight: boolean): void {
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
    view.instances.some((item) => item.damage !== "none")
      ? `dmg ${view.instances
          .filter((item) => item.damage !== "none")
          .map((item) => `${item.typeId}:${item.damage}`)
          .join(",")}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
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
      flags,
    ]
      .filter(Boolean)
      .join("  ")
  );
}

const loaded = tryLoadGameDatabase();
if (!loaded.ok) {
  line(`DATA VALIDATION FAILED: ${loaded.error.message}`);
  process.exit(1);
}
const db = loaded.value;
line(`schema OK: ${db.resources.length} resources, ${db.buildings.length} buildings, ${db.events.length} events`);

const sim = new OutpostSimulator(db, { seed: 20261114, crewSize: db.config.crew.defaultSize });
trace(0, sim.view(), sim.lunarPhase().daylight);
const buildComplaints = new Map<string, string>();

let failures = 0;
const started = Date.now();

for (let hour = 1; hour <= 240; hour += 1) {
  // Scripted "player": fixes the obvious teaching moments.
  if (hour === 2) {
    for (const instance of sim.instances()) {
      if (instance.typeId === "oxygen_generator") sim.setStatus(instance.instanceId, "ON");
    }
  }
  // A competent player: thermal control first (the cabin heats up without it), then more power.
  // A competent player works down a shopping list: radiators first (the cabin cooks without
  // them), then the rover and its charger so there is dirt to bury the shelter in, then more
  // power and storage. Each item is retried every hour until the outpost can actually afford it.
  const wanted: [string, string][] = [
    // Order matters: keep the crew alive, earn credits, then close the loops.
    ["thermal_control", "pad-11"], // the cabin cooks without radiators
    ["radiation_shelter", "pad-12"], // storms arrive with warning; dirt stops them
    ["rover", "pad-10"], // dirt, credits and spare hardware
    ["rover_charger", "pad-15"], // the rover cannot drive without it
    ["communications", "pad-17"], // science only pays when it reaches home
    ["sabatier", "pad-16"], // eats captured CO2 + hydrogen, gives water back
    ["solar_array", "pad-13"],
    ["cargo_module", "pad-14"],
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
    // Before there is a rover, a spacewalk is the only shovel the outpost has.
    const airlock = sim.instances().find((instance) => instance.typeId === "airlock");
    if (airlock) {
      const eva = sim.runCycle(airlock.instanceId);
      if (!eva.ok && hour === 2) line(`  eva waiting: ${eva.error.code} - ${eva.error.message}`);
    }
  }
  if (hour === 90) line(`  suntracer -> ${JSON.stringify(sim.activatePowerUp("suntracer"))}`);

  // Reactive radiation discipline: shelter while exposed, come back out when it clears.
  const exposureNow = sim.view().radiationExposure;
  if (exposureNow === "exposed" && !sim.crewShelteredNow()) sim.setCrewSheltered(true);
  if (exposureNow === "nominal" && sim.crewShelteredNow()) sim.setCrewSheltered(false);

  // Reactive load shedding: when power runs short, switch the grow lamps off first and
  // bring them back once there is spare again. This is the trade the game is built to teach.
  {
    // A good player also fixes what the storm broke - spare parts exist for exactly this.
    for (const instance of sim.instances()) {
      if (instance.damage !== "none" && instance.status !== "REPAIRING" && instance.damage !== "destroyed") {
        const result = sim.repair(instance.instanceId);
        if (!result.ok && hour % 4 === 1) line(`  repair ${instance.typeId} -> ${result.error.message}`);
      }
    }

    const before = sim.view();
    const lamps = sim.instances().filter((instance) => instance.typeId === "greenhouse");
    if (before.powerStatus.brownout || before.resources.display.electricalEnergy.value < 35) {
      for (const lamp of lamps) {
        if (lamp.status !== "OFF" && lamp.status !== "UNDER_CONSTRUCTION") sim.setStatus(lamp.instanceId, "OFF");
      }
      if (before.powerStatus.starvedInstanceIds.length > 3) {
        for (const charger of sim.instances().filter((instance) => instance.typeId === "rover_charger")) {
          if (charger.status !== "OFF") sim.setStatus(charger.instanceId, "OFF");
        }
      }
    } else if (before.resources.display.electricalEnergy.value > 90) {
      for (const lamp of lamps) {
        if (lamp.status === "OFF") sim.setStatus(lamp.instanceId, "ON");
      }
    }
  }

  const view = sim.step(1);

  // The app shell is what normally pays mission XP; mirror it so unlocks progress like a real run.
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
        brownoutsRecovered: counts.brownoutsRecovered,
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

const counters = sim.counters();
const rewarded = new Set(sim.awardedRewards());
const missions = resolveMissions(
  MISSIONS,
  {
    view: sim.view(),
    buildables: sim.buildables(),
    roverCycles: counters.roverCycles,
    powerUpsCollected: counters.powerUpsCollected,
    crewSheltered: sim.crewShelteredNow(),
    brownoutsRecovered: counters.brownoutsRecovered,
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

const before = sim.view();
const json = sim.saveJson();
const restored = OutpostSimulator.fromSave(db, json, { seed: 4242 });
restored.step(5);
const after = restored.view();
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

const twin = new OutpostSimulator(db, { seed: 20261114, crewSize: db.config.crew.defaultSize });
const otherTwin = new OutpostSimulator(db, { seed: 20261114, crewSize: db.config.crew.defaultSize });
const deterministic = JSON.stringify(twin.step(40)) === JSON.stringify(otherTwin.step(40));
line(`deterministic replay: ${deterministic}`);
if (!deterministic) failures += 1;

line(`done in ${((Date.now() - started) / 1000).toFixed(2)} s, failures=${failures}`);
process.exit(failures === 0 ? 0 : 1);
