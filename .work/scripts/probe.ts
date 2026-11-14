/** Diagnostic: why is each starter system in the state it is in? */
import { tryLoadGameDatabase } from "../../src/engine/loadDatabase";
import { OutpostSimulator } from "../../src/engine/simulator";

function out(value: string): void {
  process.stdout.write(`${value}\n`);
}

const loaded = tryLoadGameDatabase();
if (!loaded.ok) {
  out(`validation failed: ${loaded.error.message}`);
  process.exit(1);
}
const db = loaded.value;

for (const type of db.buildings) {
  if (type.typeId === "greenhouse" || type.typeId === "co2_removal" || type.typeId === "pressurized_habitat") {
    out(
      `${type.typeId}: requires=[${type.requires}] any=[${JSON.stringify(type.requiresAny)}] provides=[${type.provides}] ` +
        `blocksWhenFull=${type.blocksWhenFull ?? "null"} special=${type.special} states=[${type.allowedStates}]`
    );
  }
}
out(`capabilities provided by starters: ${JSON.stringify(db.buildings.filter((t) => t.starter).map((t) => [t.typeId, t.provides]))}`);
out(`volume config? ${JSON.stringify(Object.keys(db.config))}`);

const sim = new OutpostSimulator(db, { seed: 20261114, crewSize: 4 });
sim.setStatus(
  sim.instances().find((i) => i.typeId === "oxygen_generator")!.instanceId,
  "ON"
);
const view = sim.step(1);
out(`h1 volume ${view.atmosphere.volumeM3} m3`);
for (const instance of view.instances) {
  const panel = sim.inspect(instance.instanceId);
  out(
    `  ${instance.typeId.padEnd(20)} status=${String(instance.status).padEnd(12)} eff=${panel?.efficiency} ` +
      `warn=${panel?.warning ?? "-"} cause=${panel?.warningCause ?? "-"}`
  );
}
out(`h1 alerts: ${view.alerts.join(" || ") || "none"}`);
out(`capacities: ${JSON.stringify(view.resources.capacity)}`);
out(`raw: ${JSON.stringify(view.resources.raw)}`);
