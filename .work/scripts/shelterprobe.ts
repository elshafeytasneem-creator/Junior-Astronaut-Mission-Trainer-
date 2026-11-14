import { tryLoadGameDatabase } from "../../src/engine/loadDatabase";
import { OutpostSimulator } from "../../src/engine/simulator";
const db = tryLoadGameDatabase();
if (!db.ok) { console.log(db.error.message); process.exit(1); }
const sim = new OutpostSimulator(db.value, { seed: 20261114, crewSize: 4 });
for (let h = 1; h <= 12; h++) sim.step(1);
const info = sim.buildables().find((b) => b.typeId === "radiation_shelter");
console.log("buildable:", JSON.stringify(info));
console.log("build(pad-13):", JSON.stringify(sim.build("radiation_shelter", "pad-13")));
console.log("build(null):", JSON.stringify(sim.build("radiation_shelter", null)));
console.log("money:", sim.view().resources.raw.money, "xp:", sim.view().xp);
