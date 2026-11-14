/**
 * Mission dashboard: the child-facing control panel for the headless simulator.
 *
 * It renders, it does not simulate. Every control emits a `DashboardAction` and the
 * app shell applies it to the simulator, so this file stays free of game logic.
 */

import type {
  AstronautState,
  BuildableTypeInfo,
  BuildingInstance,
  PowerShortageMode,
  SafetyBand,
  StepResult,
} from "../types/outpost";
import type { DashboardProps, LogEntry, PanelAction, PowerUpView, EnvironmentEventView } from "../types/game";

const WASTE_IDS = new Set(["wasteWater", "solidWaste", "capturedCO2", "methane", "hydrogen"]);

const LABELS: Record<string, string> = {
  electricalEnergy: "Battery",
  cleanWater: "Clean water",
  wasteWater: "Waste water",
  cabinO2: "Cabin oxygen",
  cabinCO2: "Cabin CO2",
  food: "Food",
  nutrients: "Plant nutrients",
  solidWaste: "Solid waste",
  cabinTemperature: "Cabin temp",
  spareParts: "Spare parts",
  regolith: "Regolith",
  money: "Credits",
  xp: "XP",
  hydrogen: "Hydrogen",
  methane: "Methane",
  capturedCO2: "Captured CO2",
};

interface MeterSpec {
  id: string;
  readout: string;
  fill: number;
  band: SafetyBand;
  note: string;
}

function bandFromPercent(percent: number): SafetyBand {
  if (percent <= 12) return "critical";
  if (percent <= 30) return "warning";
  return "safe";
}

function wasteBand(percent: number): SafetyBand {
  if (percent >= 99) return "critical";
  if (percent >= 80) return "warning";
  return "safe";
}

function meter(view: StepResult, id: string): MeterSpec | null {
  const raw = view.resources.raw[id];
  const capacity = view.resources.capacity[id];
  const display = view.resources.display[id];
  if (raw === undefined || !display) return null;

  switch (id) {
    case "electricalEnergy":
      return {
        id,
        readout: `${display.value.toFixed(0)}%  (${raw.toFixed(1)} / ${capacity.toFixed(0)} kWh)`,
        fill: display.value,
        band: bandFromPercent(display.value),
        note: view.powerStatus.brownout ? `short by ${view.powerStatus.deficitKwh.toFixed(1)} kWh` : `solar ${view.powerStatus.solarKwh.toFixed(1)} kWh/h`,
      };
    case "cabinO2":
      return {
        id,
        readout: `${display.value.toFixed(1)} mmHg`,
        fill: ((display.value - 80) / 90) * 100,
        band: view.atmosphere.o2Band,
        note: `target 145-155 mmHg (NASA-STD-3001)`,
      };
    case "cabinCO2":
      return {
        id,
        readout: `${display.value.toFixed(2)} mmHg`,
        fill: (display.value / 15) * 100,
        band: view.atmosphere.co2Band,
        note: "safe up to 3 mmHg",
      };
    case "cabinTemperature":
      return {
        id,
        readout: `${display.value.toFixed(1)} C`,
        fill: ((display.value + 20) / 70) * 100,
        band: view.atmosphere.temperatureBand,
        note: "comfort 18-27 C",
      };
    default:
      break;
  }

  if (capacity > 0) {
    const percent = (raw / capacity) * 100;
    return {
      id,
      readout: `${round2(raw)} ${display.unit || ""} / ${round2(capacity)}`,
      fill: percent,
      band: WASTE_IDS.has(id) ? wasteBand(percent) : bandFromPercent(percent),
      note: WASTE_IDS.has(id) ? "full store blocks the system that fills it" : "space comes from cargo and module storage",
    };
  }
  return {
    id,
    readout: `${round2(raw)} ${display.unit || ""}`,
    fill: 0,
    band: raw <= 0 ? "critical" : "safe",
    note: "unlimited",
  };
}

function round2(value: number): string {
  return Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(2);
}

const PHASE_LABEL: Record<EnvironmentEventView["phase"], string> = {
  upcoming: "expected",
  warning: "warning",
  active: "happening now",
  ended: "passed",
};

export function Dashboard(props: DashboardProps) {
  const {
    view,
    buildables,
    instances,
    panel,
    log,
    powerUps,
    events,
    missions,
    crew,
    speeds,
    speedIndex,
    paused,
    mode,
    highlightGuidance,
    crewSheltered,
    radiationLabel,
    dataBadge,
    onAction,
  } = props;

  const day = Math.floor(view.hour / 24) + 1;
  const hourOfDay = view.hour % 24;
  const activeMission = missions.find((mission) => !mission.rewarded) ?? missions[missions.length - 1];
  const activeEvents = events.filter((event) => event.phase === "warning" || event.phase === "active");
  const futureEvents = events.filter((event) => event.phase === "upcoming").slice(0, 2);

  const powerGroup = ["electricalEnergy"];
  const airGroup = ["cabinO2", "cabinCO2", "cleanWater", "food"];
  const shieldGroup = ["cabinTemperature", "spareParts", "regolith"];
  const chemistryGroup = ["wasteWater", "solidWaste", "nutrients", "hydrogen", "capturedCO2", "methane", "money"];

  return (
    <aside className="dashboard" aria-label="Mission dashboard">
      <section className="section">
        <h2 className="section-title">Mission clock</h2>
        <div className="row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onAction({ kind: "pause", paused: !paused })}
            aria-label={paused ? "Start the simulation" : "Pause the simulation"}
          >
            {paused ? "Start" : "Pause"}
          </button>
          <div className="segmented" role="group" aria-label="Simulation speed">
            {speeds.map((speed, index) => (
              <button
                key={speed}
                type="button"
                className={`btn ${index === speedIndex ? "btn-on" : ""}`}
                onClick={() => onAction({ kind: "speed", index })}
                aria-pressed={index === speedIndex}
              >
                {speed}x
              </button>
            ))}
          </div>
          <span className="chip">
            Day {day} · {String(hourOfDay).padStart(2, "0")}:00
          </span>
          <span className="chip">{dataBadge}</span>
        </div>
        <p className="hint">
          One tick is one simulated hour. Solar arrays only make power while the Sun is up.
        </p>
      </section>

      {view.missionStatus.state === "failed" ? (
        <section className="section banner banner-danger">
          <h2 className="section-title">Mission failed</h2>
          <p>{view.missionStatus.reason}</p>
          <div className="row">
            <button type="button" className="btn btn-primary" onClick={() => onAction({ kind: "load" })}>
              Load last save
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => onAction({ kind: "newGame", seed: Date.now() % 100000 })}
            >
              Start a new run
            </button>
          </div>
        </section>
      ) : null}

      {activeEvents.length > 0 ? (
        <section className="section banner banner-warn">
          <h2 className="section-title">Right now</h2>
          {activeEvents.map((event) => (
            <div key={event.id} className="event">
              <strong>
                {event.label} <span className="chip">{PHASE_LABEL[event.phase]}</span>
              </strong>
              <p>{event.kidExplanation}</p>
              <p className="hint">
                {event.radiation ? "Radiation: " : ""}
                {event.hoursRemaining > 0 ? `${event.hoursRemaining} h left.` : "ending"}
                {crewSheltered ? " Crew are sheltered (safe, but not working)." : " Crew are exposed."}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="section">
        <h2 className="section-title">Power</h2>
        {powerGroup.map((id) => (
          <Meter key={id} spec={meter(view, id)} />
        ))}
        <div className="row small">
          <span className="chip">Solar {view.powerStatus.solarKwh.toFixed(1)} kWh/h</span>
          <span className="chip">Demand {view.powerStatus.demandKwh.toFixed(1)}</span>
          <span className="chip">Delivered {view.powerStatus.supplyKwh.toFixed(1)}</span>
          <span className="chip">Sun factor {view.powerStatus.sunlightFactor.toFixed(2)}</span>
        </div>
        <div className="segmented" role="group" aria-label="Power shortage handling">
          {(["priority", "total_brownout"] as PowerShortageMode[]).map((option) => (
            <button
              key={option}
              type="button"
              className={`btn ${option === mode ? "btn-on" : ""}`}
              onClick={() => onAction({ kind: "mode", mode: option })}
              aria-pressed={option === mode}
            >
              {option === "priority" ? "Shed by priority" : "Total brownout"}
            </button>
          ))}
          <button
            type="button"
            className={`btn ${highlightGuidance ? "btn-on" : ""}`}
            onClick={() => onAction({ kind: "highlight", on: !highlightGuidance })}
            aria-pressed={highlightGuidance}
          >
            Highlight help
          </button>
        </div>
        {view.powerStatus.starvedInstanceIds.length > 0 ? (
          <p className="hint danger">
            Not enough power for everything this hour. Systems waiting:{" "}
            {view.powerStatus.starvedInstanceIds
              .map((id) => instances.find((instance) => instance.instanceId === id)?.typeId ?? id)
              .join(", ")}
            .
          </p>
        ) : null}
      </section>

      <section className="section">
        <h2 className="section-title">Air &amp; water</h2>
        {airGroup.map((id) => (
          <Meter key={id} spec={meter(view, id)} />
        ))}
        <p className="hint">
          Cabin volume {view.atmosphere.volumeM3} m3. Oxygen comes from split water; CO2 has to be scrubbed out
          again.
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">Shielding &amp; crew</h2>
        {shieldGroup.map((id) => (
          <Meter key={id} spec={meter(view, id)} />
        ))}
        <div className="row small">
          <span className={`chip band-${view.radiationExposure === "nominal" ? "safe" : "critical"}`}>
            Radiation: {view.radiationExposure}
          </span>
          <span className="chip">Risk from the archive: {radiationLabel}</span>
        </div>
        <div className="row">
          <button
            type="button"
            className={`btn ${crewSheltered ? "btn-on" : ""}`}
            onClick={() => onAction({ kind: "shelter", on: !crewSheltered })}
            aria-pressed={crewSheltered}
          >
            {crewSheltered ? "Bring crew out" : "Shelter crew"}
          </button>
          <span className="chip">{crewSheltered ? "Safe, but no repairs or EVA" : "Working everywhere"}</span>
        </div>
        <ul className="crew">
          {crew.map((member) => (
            <CrewRow key={member.id} member={member} />
          ))}
        </ul>
        <p className="hint">
          XP {view.xp.toFixed(1)}. Shared pool: the whole crew levels together.
        </p>
      </section>

      {activeMission ? (
        <section className="section">
          <h2 className="section-title">
            Mission: {activeMission.name}
            {activeMission.complete ? " (done)" : ""}
          </h2>
          <p className="hint">{activeMission.brief}</p>
          <ul className="goals">
            {activeMission.objectives.map((goal) => (
              <li key={goal.id} className={goal.done ? "done" : ""}>
                <span className="tick" aria-hidden="true">
                  {goal.done ? "OK" : "··"}
                </span>
                <span>
                  {goal.label}
                  {goal.hint ? <em className="hint"> {goal.hint}</em> : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="section">
        <h2 className="section-title">Inspect {panel ? `· ${panel.name}` : ""}</h2>
        {!panel ? (
          <p className="hint">Click a system on the map, or pick one below.</p>
        ) : (
          <div className="panel">
            <p className="kid">{panel.kidDescription}</p>
            <div className="row small">
              <span className="chip">status {panel.status}</span>
              <span className="chip">damage {panel.damage}</span>
              <span className="chip">level {panel.level}</span>
              <span className="chip">works {Math.round(panel.efficiency * 100)}%</span>
              {panel.slotLabel ? <span className="chip">{panel.slotLabel}</span> : null}
            </div>
            <p>
              Power wanted {panel.powerRequestedKwh} kWh · delivered {panel.powerDeliveredKwh} kWh
              {panel.cutReason ? <span className="danger"> · {panel.cutReason}</span> : null}
            </p>
            {panel.warning ? (
              <p className="danger">
                {panel.warning}
                {panel.warningCause ? ` ${panel.warningCause}` : ""}
              </p>
            ) : null}
            <FlowTable title="Takes in" rows={panel.inputs} />
            <FlowTable title="Puts out" rows={panel.outputs} />
            {panel.grants.length > 0 ? (
              <p className="hint">
                Adds storage:{" "}
                {panel.grants.map((grant) => `${grant.label} +${grant.amount} ${grant.unit}`).join(", ")}
              </p>
            ) : null}
            {panel.dependsOn.length > 0 ? (
              <ul className="deps">
                {panel.dependsOn.map((dependency) => (
                  <li key={dependency.typeId} className={dependency.ok ? "done" : "broken"}>
                    {dependency.name}
                    {dependency.ok ? " · working" : ` · ${dependency.problemReason}`}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="row wrap">
              {panel.actions.map((action) => (
                <ActionButton key={`${action.kind}-${action.instanceId}`} action={action} onAction={onAction} />
              ))}
            </div>
            <p className="hint">{panel.sourceNote}</p>
          </div>
        )}
        <details className="list">
          <summary>Systems on the ground ({instances.length})</summary>
          <ul>
            {instances.map((instance) => (
              <li key={instance.instanceId}>
                <button type="button" className="linklike" onClick={() => onAction({ kind: "select", instanceId: instance.instanceId })}>
                  {nameOf(buildables, instance)}
                </button>
                <span className="chip">{instance.status}</span>
                {instance.damage !== "none" ? <span className="chip danger">{instance.damage}</span> : null}
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="section">
        <h2 className="section-title">Build</h2>
        <ul className="build">
          {buildables.map((item) => (
            <li key={item.typeId}>
              <button
                type="button"
                className="btn btn-build"
                disabled={!item.affordable}
                onClick={() => onAction({ kind: "build", typeId: item.typeId })}
                title={item.kidDescription}
              >
                {item.name}
                <span className="chip">
                  {item.instances}/{item.maxInstances}
                </span>
                <span className="cost">
                  {item.buildCost.money}c · {item.buildCost.regolith}kg · {item.buildCost.spareParts} parts ·{" "}
                  {item.buildHours} h
                </span>
              </button>
              {item.lockReason ? <p className="hint">{item.lockReason}</p> : null}
              {!item.lockReason && item.affordabilityReason ? <p className="hint">{item.affordabilityReason}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="section-title">Boost kits</h2>
        <div className="row wrap">
          {powerUps.map((powerUp) => (
            <BoostButton key={powerUp.definition.typeId} view={powerUp} onAction={onAction} />
          ))}
        </div>
        <p className="hint">Crates that land on the map give extra charges. Fetching one needs an airlock.</p>
      </section>

      <section className="section">
        <h2 className="section-title">Space weather schedule</h2>
        {futureEvents.length === 0 ? (
          <p className="hint">Nothing else expected in this run.</p>
        ) : (
          <ul className="events">
            {futureEvents.map((event) => (
              <li key={event.id}>
                {event.label} · {PHASE_LABEL[event.phase]} in {event.hoursToStart} h
                {event.radiation ? " (radiation)" : ""}
                <p className="hint">{event.kidExplanation}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="hint">
          Warnings are full length only with a working Radiation Monitor and Dish; otherwise you get a quarter of
          the lead time.
        </p>
      </section>

      <details className="section">
        <summary className="section-title">Chemistry stores &amp; ledger</summary>
        {chemistryGroup.map((id) => (
          <Meter key={id} spec={meter(view, id)} />
        ))}
      </details>

      <section className="section">
        <h2 className="section-title">What happened</h2>
        <div className="row">
          <button type="button" className="btn" onClick={() => onAction({ kind: "save" })}>
            Save
          </button>
          <button type="button" className="btn" onClick={() => onAction({ kind: "load" })}>
            Load
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => onAction({ kind: "newGame", seed: (Date.now() % 900000) + 1 })}
          >
            New run
          </button>
        </div>
        <ul className="log">
          {log.slice(0, 24).map((entry) => (
            <li key={entry.id} className={`log-row log-${entry.kind}`}>
              <span className="log-hour">h{entry.hour}</span>
              {entry.message}
            </li>
          ))}
          {log.length === 0 ? <li className="hint">Nothing yet - press Start.</li> : null}
        </ul>
      </section>
    </aside>
  );
}

export default Dashboard;

/* ------------------------------------------------------------ subcomponents --- */

function Meter({ spec }: { spec: MeterSpec | null }) {
  if (!spec) return null;
  const fill = Math.max(0, Math.min(100, spec.fill));
  return (
    <div className="meter" role="group" aria-label={`${LABELS[spec.id] ?? spec.id} ${spec.readout}`}>
      <div className="meter-head">
        <span>{LABELS[spec.id] ?? spec.id}</span>
        <span className={`band-text band-${spec.band}`}>{spec.band}</span>
      </div>
      <div className="meter-bar" aria-hidden="true">
        <div className={`meter-fill band-${spec.band}`} style={{ width: `${fill}%` }} />
      </div>
      <div className="meter-foot">
        <span>{spec.readout}</span>
        <span className="hint">{spec.note}</span>
      </div>
    </div>
  );
}

function CrewRow({ member }: { member: AstronautState }) {
  const band: SafetyBand = member.health >= 70 ? "safe" : member.health >= 40 ? "warning" : "critical";
  return (
    <li className="crew-row">
      <span className="crew-name">{member.name}</span>
      <div className="meter-bar" aria-hidden="true">
        <div className={`meter-fill band-${band}`} style={{ width: `${member.health}%` }} />
      </div>
      <span className={`chip band-${band}`}>
        {member.status} · {member.health.toFixed(0)}% · work {Math.round(member.activityMultiplier * 100)}%
      </span>
    </li>
  );
}

function FlowTable({
  title,
  rows,
}: {
  title: string;
  rows: { resourceId: string; label: string; unit: string; wantedPerHour: number; actualPerHour: number; blocked: boolean }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div className="flows">
      <h3>{title} per hour</h3>
      <ul>
        {rows.map((row) => (
          <li key={row.resourceId}>
            {row.label}: wanted {row.wantedPerHour} {row.unit}, got{" "}
            <strong className={row.blocked ? "danger" : ""}>{row.actualPerHour}</strong>
            {row.blocked ? " (short)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActionButton({
  action,
  onAction,
}: {
  action: PanelAction;
  onAction: DashboardProps["onAction"];
}) {
  const fire = (): void => {
    switch (action.kind) {
      case "repair":
        onAction({ kind: "repair", instanceId: action.instanceId });
        break;
      case "upgrade":
        onAction({ kind: "upgrade", instanceId: action.instanceId });
        break;
      case "demolish":
        onAction({ kind: "demolish", instanceId: action.instanceId });
        break;
      case "cancel":
        onAction({ kind: "cancel", instanceId: action.instanceId });
        break;
      case "cycle":
        onAction({ kind: "cycle", instanceId: action.instanceId });
        break;
      case "start":
        onAction({ kind: "toggle", instanceId: action.instanceId, on: true });
        break;
      case "stop":
        onAction({ kind: "toggle", instanceId: action.instanceId, on: false });
        break;
      default:
        break;
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-${action.kind}`}
      disabled={!action.enabled}
      onClick={fire}
      title={action.reason ?? action.cost ?? undefined}
    >
      {action.label}
      {action.cost ? <span className="cost">{action.cost}</span> : null}
      {action.reason && !action.enabled ? <span className="hint">{action.reason}</span> : null}
    </button>
  );
}

function BoostButton({ view: powerUp, onAction }: { view: PowerUpView; onAction: DashboardProps["onAction"] }) {
  return (
    <button
      type="button"
      className={`btn ${powerUp.ready ? "btn-on" : ""}`}
      disabled={!powerUp.ready}
      onClick={() => onAction({ kind: "powerUp", typeId: powerUp.definition.typeId })}
      title={powerUp.definition.kidDescription}
    >
      {powerUp.definition.name}
      <span className="chip">
        {powerUp.state.charges}/{powerUp.definition.maxCharges}
      </span>
      {powerUp.reason ? <span className="hint">{powerUp.reason}</span> : null}
    </button>
  );
}

function nameOf(buildables: BuildableTypeInfo[], instance: BuildingInstance): string {
  const type = buildables.find((item) => item.typeId === instance.typeId);
  return `${type?.name ?? instance.typeId} (${instance.instanceId})`;
}

/** Re-exported for the shell's log de-duplication tests. */
export type { LogEntry };
