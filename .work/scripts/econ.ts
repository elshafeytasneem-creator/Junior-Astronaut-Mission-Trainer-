import { tryLoadGameDatabase } from "../../src/engine/loadDatabase";
import { OutpostSimulator } from "../../src/engine/simulator";
const db = tryLoadGameDatabase();
if (!db.ok) { console.log(db.error.message); process.exit(1); }
const sim = new OutpostSimulator(db.value, { seed: 20261114, crewSize: 4 });
for (let h = 1; h <= 60; h++) sim.step(1);
for (const b of sim.buildables()) {
  if (["sabatier", "rover", "radiation_shelter", "thermal_control"].includes(b.typeId)) {
    console.log(`${b.typeId}: unlocked=${b.unlocked} affordable=${b.affordable} reason=${b.affordabilityReason ?? "-"} cost=${JSON.stringify(b.buildCost)} instances=${b.instances}/${b.maxInstances}`);
  }
}
console.log(`money=${sim.view().resources.raw.money.toFixed(0)} regolith=${sim.view().resources.raw.regolith.toFixed(0)} parts=${sim.view().resources.raw.spareParts.toFixed(0)} xp=${sim.view().xp.toFixed(0)}`);
console.log("try sabatier:", JSON.stringify(sim.build("sabatier", "pad-16")));
