/**
 * Public types for RENDERING and MISSION FLOW.
 *
 * `types/outpost.ts` is deliberately headless (no rendering or mission types), so
 * everything the Phaser scene and the React dashboard need lives here. The simulator
 * never imports this module for its physics; only the app shell and the scene do.
 */

import type {
  AstronautState,
  BuildableTypeInfo,
  BuildingInstance,
  DamageLevel,
  OperationalStatus,
  PowerShortageMode,
  PowerUpCollectible,
  PowerUpDefinition,
  PowerUpState,
  StepResult,
} from "./outpost";

/* ------------------------------------------------------------------ layout --- */

export type SlotKind = "pad" | "ridge" | "crater" | "dock";

export interface LayoutSlot {
  slotId: string;
  /** Child-friendly name shown when the slot is empty. */
  label: string;
  kind: SlotKind;
  /** World coordinates in the 1280x720 Phaser design size. */
  x: number;
  y: number;
}

/** Fixed building pads. The shell owns placement, the simulator only stores `slotId`. */
export const OUTPOST_SLOTS: readonly LayoutSlot[] = [
  { slotId: "pad-01", label: "North pad", kind: "pad", x: 300, y: 200 },
  { slotId: "pad-02", label: "Ridge shelf", kind: "ridge", x: 520, y: 150 },
  { slotId: "pad-03", label: "Crater rim", kind: "crater", x: 760, y: 180 },
  { slotId: "pad-04", label: "East pad", kind: "pad", x: 980, y: 230 },
  { slotId: "pad-05", label: "Solar field", kind: "ridge", x: 300, y: 400 },
  { slotId: "pad-06", label: "Storage row", kind: "pad", x: 520, y: 450 },
  { slotId: "pad-07", label: "Greenhouse bay", kind: "pad", x: 760, y: 460 },
  { slotId: "pad-08", label: "Docking apron", kind: "dock", x: 980, y: 430 },
  { slotId: "pad-09", label: "South pad", kind: "pad", x: 410, y: 600 },
  { slotId: "pad-10", label: "Rover yard", kind: "pad", x: 660, y: 610 },
  { slotId: "pad-11", label: "West pad", kind: "pad", x: 180, y: 560 },
  { slotId: "pad-12", label: "Antenna hill", kind: "ridge", x: 1090, y: 590 },
  { slotId: "pad-13", label: "Low terrace", kind: "pad", x: 120, y: 330 },
  { slotId: "pad-14", label: "Ravine spur", kind: "ridge", x: 1200, y: 320 },
  { slotId: "pad-15", label: "South-east pad", kind: "pad", x: 880, y: 680 },
  { slotId: "pad-16", label: "North-west shelf", kind: "crater", x: 430, y: 110 },
  { slotId: "pad-17", label: "Dish flat", kind: "pad", x: 1080, y: 130 },
  { slotId: "pad-18", label: "Tailings mound", kind: "crater", x: 200, y: 690 },
];

/** First unoccupied pad, or null when the map is full. */
export function nextFreeSlotId(occupied: (string | null | undefined)[]): string | null {
  const taken = new Set(occupied.filter((id): id is string => typeof id === "string"));
  return OUTPOST_SLOTS.find((slot) => !taken.has(slot.slotId))?.slotId ?? null;
}

export function slotLabel(slotId: string | null | undefined): string | null {
  if (!slotId) return null;
  return OUTPOST_SLOTS.find((slot) => slot.slotId === slotId)?.label ?? slotId;
}

/* ------------------------------------------------------- inspect panel data --- */

export interface PanelFlow {
  resourceId: string;
  label: string;
  unit: string;
  /** What the system wants per sim hour at full efficiency. */
  wantedPerHour: number;
  /** What actually moved this hour (starved systems show the shortfall). */
  actualPerHour: number;
  blocked: boolean;
}

export interface PanelDependency {
  typeId: string;
  name: string;
  ok: boolean;
  /** Set when the dependency is the reason this system is struggling. */
  problemReason: string | null;
}

export type PanelActionKind =
  | "repair"
  | "upgrade"
  | "demolish"
  | "start"
  | "stop"
  | "cycle"
  | "cancel";

export interface PanelAction {
  kind: PanelActionKind;
  instanceId: string;
  label: string;
  enabled: boolean;
  /** Why the button is greyed out, in child language. */
  reason: string | null;
  /** Cost summary, e.g. "2 parts, 4 h". */
  cost: string | null;
}

/** The "cause chain" panel a child follows when something is wrong. */
export interface SystemPanelData {
  instanceId: string;
  typeId: string;
  name: string;
  kidDescription: string;
  slotLabel: string | null;
  status: OperationalStatus;
  damage: DamageLevel;
  level: number;
  efficiency: number;
  powerRequestedKwh: number;
  powerDeliveredKwh: number;
  cutReason: string | null;
  inputs: PanelFlow[];
  outputs: PanelFlow[];
  grants: { resourceId: string; label: string; amount: number; unit: string }[];
  warning: string | null;
  warningCause: string | null;
  dependsOn: PanelDependency[];
  actions: PanelAction[];
  sourceNote: string | null;
}

/* ---------------------------------------------------------------- events ----- */

export type EventPhase = "upcoming" | "warning" | "active" | "ended";

export interface EnvironmentEventView {
  id: string;
  type: string;
  phase: EventPhase;
  /** Negative while the event is already running. */
  hoursToStart: number;
  hoursRemaining: number;
  label: string;
  kidExplanation: string;
  radiation: boolean;
}

export type LogKind = "info" | "good" | "warn" | "danger";

export interface LogEntry {
  id: number;
  hour: number;
  kind: LogKind;
  message: string;
}

/* --------------------------------------------------------------- missions --- */

export interface MissionContext {
  view: StepResult;
  buildables: BuildableTypeInfo[];
  /** Rover EVA/science cycles completed since the run started. */
  roverCycles: number;
  powerUpsCollected: number;
  crewSheltered: boolean;
  brownoutsRecovered: number;
}

export interface MissionGoalTemplate {
  id: string;
  label: string;
  hint: string | null;
  check: (ctx: MissionContext) => boolean;
}

export interface MissionTemplate {
  id: string;
  name: string;
  brief: string;
  rewardXp: number;
  goals: MissionGoalTemplate[];
}

export interface MissionObjective {
  id: string;
  label: string;
  hint: string | null;
  done: boolean;
}

export interface MissionDef {
  id: string;
  name: string;
  brief: string;
  rewardXp: number;
  objectives: MissionObjective[];
  complete: boolean;
  rewarded: boolean;
}

/* -------------------------------------------------------------- power-ups --- */

export interface PowerUpView {
  definition: PowerUpDefinition;
  state: PowerUpState;
  ready: boolean;
  reason: string | null;
}

/* ------------------------------------------------------------------- scene --- */

export const GAME_SCENE_KEY = "OutpostScene";

/** Phaser game events used as the React <-> scene bridge. */
export const SCENE_INBOUND = {
  /** Shell pushes fresh render data every simulation hour. */
  input: "outpost:input",
  clear: "outpost:clear",
} as const;

export const SCENE_OUTBOUND = {
  select: "outpost:select",
  collect: "outpost:collect",
  build: "outpost:build",
  ready: "outpost:ready",
} as const;

export interface SceneInputData {
  view: StepResult;
  instances: BuildingInstance[];
  collectibles: PowerUpCollectible[];
  selectedInstanceId: string | null;
  sunlightFactor: number;
  crewSheltered: boolean;
}

export interface SceneSelectPayload {
  instanceId: string | null;
}

export interface SceneCollectPayload {
  collectibleId: string;
}

export interface SceneBuildPayload {
  slotId: string;
}

/* ------------------------------------------------------------- dashboard --- */

export type DashboardAction =
  | { kind: "build"; typeId: string }
  | { kind: "cancel"; instanceId: string }
  | { kind: "demolish"; instanceId: string }
  | { kind: "repair"; instanceId: string }
  | { kind: "upgrade"; instanceId: string }
  | { kind: "toggle"; instanceId: string; on: boolean }
  | { kind: "cycle"; instanceId: string }
  | { kind: "powerUp"; typeId: string }
  | { kind: "collect"; collectibleId: string }
  | { kind: "shelter"; on: boolean }
  | { kind: "mode"; mode: PowerShortageMode }
  | { kind: "highlight"; on: boolean }
  | { kind: "speed"; index: number }
  | { kind: "pause"; paused: boolean }
  | { kind: "select"; instanceId: string | null }
  | { kind: "save" }
  | { kind: "load" }
  | { kind: "newGame"; seed: number };

export interface DashboardProps {
  view: StepResult;
  buildables: BuildableTypeInfo[];
  instances: BuildingInstance[];
  panel: SystemPanelData | null;
  log: LogEntry[];
  powerUps: PowerUpView[];
  events: EnvironmentEventView[];
  missions: MissionDef[];
  crew: AstronautState[];
  speeds: number[];
  speedIndex: number;
  paused: boolean;
  mode: PowerShortageMode;
  highlightGuidance: boolean;
  crewSheltered: boolean;
  /** From `utils/radiation.ts` â€” storm count -> risk label. */
  radiationLabel: string;
  /** Live-vs-archived badge text for the NASA data screen. */
  dataBadge: "LIVE NASA DATA" | "ARCHIVED NASA EVENT";
  onAction: (action: DashboardAction) => void;
}
