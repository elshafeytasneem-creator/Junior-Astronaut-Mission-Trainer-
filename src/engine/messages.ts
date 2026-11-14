/**
 * Child-friendly wording for simulator events and alerts.
 *
 * The simulator never builds UI strings for React; it emits `SimEvent`s and plain
 * alert strings. This module is the single place that turns both into log rows.
 */

import type { BrownoutPayload, SimEventName } from "../types/outpost";
import type { LogKind } from "../types/game";

export interface EventMessage {
  kind: LogKind;
  message: string;
}

const DANGER_ALERT = /(destroyed|deceased|lost|failed|critical|no power|unbreathable|venting|cannot)/i;
const GOOD_ALERT = /(back online|recovered|complete|ready|safe again|finished|upgraded|growing|harvested)/i;
const WARN_ALERT = /(low|shortage|warning|running out|dirty|dim|cold|hot|slow|shut)/i;

/** Keyword table kept in sync with the alert strings emitted by `simulator.ts`. */
export function alertKind(alert: string): LogKind {
  if (DANGER_ALERT.test(alert)) return "danger";
  if (GOOD_ALERT.test(alert)) return "good";
  if (WARN_ALERT.test(alert)) return "warn";
  return "info";
}

export function alertMessage(alert: string): EventMessage {
  return { kind: alertKind(alert), message: alert };
}

function brownoutMessage(payload: unknown): EventMessage {
  const data = payload as Partial<BrownoutPayload>;
  const deficit = typeof data?.deficit === "number" ? data.deficit : 0;
  const mode = data?.highlightEnabled ? "priority mode" : "total brownout";
  const picks = Array.isArray(data?.suggestedShutdowns) ? data.suggestedShutdowns.length : 0;
  return {
    kind: "danger",
    message: `Not enough power: short by ${deficit.toFixed(1)} kWh (${mode}). ${picks} system(s) can be switched off.`,
  };
}

const STATIC: Record<SimEventName, EventMessage> = {
  BROWNOUT: { kind: "danger", message: "Power brownout started." },
  BROWNOUT_ENDED: { kind: "good", message: "Power is back online." },
  EMERGENCY_STARTED: { kind: "danger", message: "Emergency! The sim pauses so you can decide." },
  EMERGENCY_RECOVERED: { kind: "good", message: "Emergency over — systems recovered." },
  CREW_STATUS_CHANGED: { kind: "warn", message: "A crew member's condition changed." },
  BUILDING_DAMAGED: { kind: "danger", message: "Something got damaged." },
  REPAIR_COMPLETE: { kind: "good", message: "Repair complete." },
  CONSTRUCTION_STARTED: { kind: "info", message: "Construction started." },
  CONSTRUCTION_COMPLETE: { kind: "good", message: "Build finished — the system is ready." },
  BUILDING_DEMOLISHED: { kind: "info", message: "System removed." },
  BUILDING_UPGRADED: { kind: "good", message: "Upgrade installed." },
  CAPACITY_CHANGED: { kind: "info", message: "Storage capacity changed." },
  ENV_WARNING: { kind: "warn", message: "Mission Control sent an early warning." },
  ENV_ACTIVE: { kind: "danger", message: "A space-weather event is hitting the outpost." },
  ENV_ENDED: { kind: "good", message: "The event has passed." },
  POWERUP_ACTIVATED: { kind: "good", message: "Boost activated." },
  POWERUP_EXPIRED: { kind: "info", message: "Boost finished." },
  POWERUP_CHARGED: { kind: "info", message: "Boost recharged." },
  POWERUP_COLLECTED: { kind: "good", message: "Kit piece collected." },
  POWERUP_SPAWNED: { kind: "info", message: "A supply crate landed on the surface." },
  MISSION_FAILED: { kind: "danger", message: "Mission failed." },
};

/** Turn one emitted event into a log row. */
export function describeEvent(name: SimEventName, payload: unknown): EventMessage {
  if (name === "BROWNOUT") return brownoutMessage(payload);
  const base = STATIC[name];
  const detail = (payload as { message?: string; label?: string } | undefined)?.message;
  if (!detail) return base;
  return { kind: base.kind, message: `${base.message} ${detail}` };
}
