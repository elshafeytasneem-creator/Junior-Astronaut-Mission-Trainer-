# Outpost Sim — UI layer contract (authoritative)

This file pins the boundary between the headless engine (owned by `src/engine/*`,
`src/types/outpost.ts`, `src/types/game.ts`, `src/data/*`) and the app shell
(`src/App.tsx`, `src/main.tsx`, `src/components/Dashboard.tsx`, `src/scenes/GameScene.ts`,
`src/style.css`). Both sides code against this document.

Runtime stack already installed: `react@18`, `react-dom@18`, `phaser@3.80`, `vite@5`,
`typescript@5.5`. **No new dependencies.** No external CSS/UI libraries. Plain CSS in
`src/style.css` is the only styling. TypeScript is `strict` with `noUnusedLocals` and
`noUnusedParameters` — every import and parameter must be used.

## 1. Data / engine exports you may import

```ts
// src/engine/loadDatabase.ts
export interface DatasetRow { id: string; label: string; usedFor: string; url: string;
  retrieved: string; origin: "nasa" | "game_assumption"; live: boolean; file?: string }
export const DATASETS: DatasetRow[];
export function loadGameDatabase(): GameDatabase;            // throws DataValidationError
export function tryLoadGameDatabase(): Result<GameDatabase>;  // safe for the app shell
export function datasetRowsFor(db: GameDatabase | null): DatasetRow[];

// src/engine/simulator.ts
export class OutpostSimulator {
  constructor(db: GameDatabase, options?: SimulatorOptions);
  readonly db: GameDatabase;
  readonly events: EventBus;

  // time
  get hour(): number;
  get paused(): boolean;  set paused(value: boolean);
  get speedIndex(): number;
  get settings(): SimulatorSettings;              // { powerShortageMode, highlightGuidance }
  msPerSimHour(): number;                          // real ms per one simulated hour at current speed
  setSpeed(index: number): void;                   // index into db.config.time.speeds
  step(hours?: number): StepResult;                // default = 1 whole simulated hour
  view(): StepResult;                              // last result; valid immediately after construct
  lunarPhase(): { daylight: boolean; sunlightFactor: number; hoursToChange: number };

  // reads
  instances(): BuildingInstance[];
  instance(instanceId: string): BuildingInstance | undefined;
  crew(): AstronautState[];
  buildables(): BuildableTypeInfo[];
  inspect(instanceId: string | null): SystemPanelData | null;
  eventViews(): EnvironmentEventView[];
  powerUpViews(): PowerUpView[];
  collectibles(): PowerUpCollectible[];
  radiationStormCount(): number;                   // feed to utils/radiation.getRadiationLevel
  crewSheltered(): boolean;
  counters(): { roverCycles: number; powerUpsCollected: number; brownoutsRecovered: number };
  awardedRewards(): string[];                      // reward ids already paid (dedupe)
  level(): { level: number; xpToNext: number };

  // actions — all Result<T> so failures are strings, never exceptions
  build(typeId: string, slotId?: string | null): Result<BuildingInstance>;
  cancelConstruction(instanceId: string): Result<void>;
  demolish(instanceId: string): Result<void>;
  repair(instanceId: string): Result<void>;
  upgrade(instanceId: string): Result<void>;
  setStatus(instanceId: string, status: "ON" | "OFF"): Result<void>;
  runCycle(instanceId: string): Result<void>;      // rover science trip / EVA task
  activatePowerUp(typeId: string): Result<void>;
  collectPowerUp(collectibleId: string): Result<void>;
  setCrewSheltered(on: boolean): Result<void>;
  setPowerShortageMode(mode: PowerShortageMode): void;
  setHighlightGuidance(on: boolean): void;
  awardXp(rewardId: string, amount: number): Result<number>;

  // persistence
  snapshot(): SimulatorSnapshot;
  saveJson(): string;
  static fromSave(db: GameDatabase, json: string, options?: SimulatorOptions): OutpostSimulator;
}

// src/engine/messages.ts
export interface EventMessage { kind: LogKind; message: string }
export function describeEvent(name: SimEventName, payload: unknown): EventMessage;
export function alertMessage(alert: string): EventMessage;
export function alertKind(alert: string): LogKind;

// src/engine/rng.ts (only if a seeded "new game" number is needed)
export class SeededRng { constructor(seed: number); next(): number; nextInt(maxExclusive: number): number }

// src/data/missions.ts
export const MISSIONS: MissionTemplate[];
export const GOAL_XP = 15;
export function missionRewardId(missionId: string, goalId: string): string;
export function missionCompleteRewardId(missionId: string): string;
export function resolveMissions(templates: MissionTemplate[], ctx: MissionContext,
                                rewarded: ReadonlySet<string>): MissionDef[];

// src/utils/radiation.ts
export type RadiationLevel = "Low" | "Medium" | "High";
export function getRadiationLevel(solarEventCount: number): RadiationLevel;
```

`src/types/game.ts` already defines every UI-facing type: `DashboardProps`,
`DashboardAction`, `SystemPanelData`, `PanelFlow`, `PanelAction`, `LogEntry`, `LogKind`,
`EnvironmentEventView`, `PowerUpView`, `MissionDef`, `MissionContext`, `SceneInputData`,
`OUTPOST_SLOTS`, `nextFreeSlotId`, `slotLabel`, `GAME_SCENE_KEY`, `SCENE_INBOUND`,
`SCENE_OUTBOUND`, `SceneSelectPayload`, `SceneCollectPayload`, `SceneBuildPayload`.
`src/types/outpost.ts` defines `StepResult`, `BuildableTypeInfo`, `BuildingInstance`,
`ResourceSnapshot`, `PowerStatus`, `AstronautState`, `SimulatorSnapshot`, `SimulatorOptions`,
`OperationalStatus`, `DamageLevel`, `PowerShortageMode`, `PowerUpCollectible`, `Result<T>`.

**Read both type files before writing UI code — do not redefine or extend them.**

## 2. Simulation loop (App.tsx)

- Construct once: `const db = loadGameDatabase()` (inside `tryLoadGameDatabase()`), then
  `new OutpostSimulator(db, { seed, crewSize: db.config.crew.defaultSize, clock })`.
- Drive time with a `requestAnimationFrame` accumulator: every frame add `dtMs` and while
  `accumulator >= sim.msPerSimHour()` call `sim.step(1)`, subtract, and refresh UI state.
- `sim.paused` is the single pause switch; `speedIndex` selects `db.config.time.speeds`.
- After every step (or batch of steps), produce one UI snapshot:
  `view = sim.view()`, `instances`, `buildables`, `panel`, `events`, `powerUps`, `missions`,
  `log` (append `view.events` through `describeEvent` and `view.alerts` through `alertMessage`,
  newest first, capped at 60 rows).
- Pass `missions` down as resolved `MissionDef[]`: build `MissionContext` from
  `{ view, buildables, ...sim.counters(), crewSheltered: sim.crewSheltered() }`, then
  `resolveMissions(MISSIONS, ctx, new Set(sim.awardedRewards()))`. For each goal that just
  became `done` call `sim.awardXp(missionRewardId(m, goal.id), GOAL_XP)`; when a mission is
  fully complete call `sim.awardXp(missionCompleteRewardId(m.id), m.rewardXp)`. The simulator
  dedupes, so calling twice is harmless.
- Handle `DashboardAction` in one `switch`; call the matching simulator method, and show
  `result.error.message` in the log when a `Result` fails (kind `warn`).
- Save/load: `localStorage` key `"outpost-sim-save-v1"` holding `sim.saveJson()`; load with
  `OutpostSimulator.fromSave(db, json, options)`. Autosave on mission complete and level-up.
- `clock: { requestAutoPause(source) { sim.paused = true } }` — the engine asks for pause on
  emergencies; the shell owns the actual pause.

## 3. Phaser bridge (scenes/GameScene.ts + App.tsx)

- `export class GameScene extends Phaser.Scene` with `constructor()` calling
  `super(GAME_SCENE_KEY)`. Create the game in App with
  `{ parent: divElement, width: 1280, height: 720, backgroundColor: "#05070d",
     scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [new GameScene()] }`.
- App pushes fresh data after each UI refresh: `game.events.emit(SCENE_INBOUND.input, {
  view, instances, collectibles, selectedInstanceId, sunlightFactor, crewSheltered } as SceneInputData)`.
- The scene listens in `init()`/`create()` with `this.game.events.on(SCENE_INBOUND.input, handler)`
  and must `off(...)` in `shutdown()`.
- Scene emits back: `this.game.events.emit(SCENE_OUTBOUND.select, { instanceId })` when a
  building is clicked, `{ instanceId: null }` when empty ground is clicked;
  `SCENE_OUTBOUND.collect` with `{ collectibleId }` when a crate is clicked;
  `SCENE_OUTBOUND.build` with `{ slotId }` when an empty pad is clicked;
  `SCENE_OUTBOUND.ready` once at the end of `create()`.
- **No image or audio assets exist** (`public/assets/*` are empty) — draw everything
  procedurally with `Phaser.GameObjects.Graphics` / text / shapes. Buildings sit at
  `OUTPOST_SLOTS` coordinates; unknown `slotId` renders at a fallback position.
- `GameScene` must expose nothing else to React; App only talks through game events.
- Destroy the game in a `useEffect` cleanup (`game.destroy(true)`) to survive HMR.

## 4. Dashboard (components/Dashboard.tsx)

`export function Dashboard(props: DashboardProps)` (also `export default Dashboard`).
Every interaction is `props.onAction({ kind: ..., ... })` — never mutate the simulator in
the component. Required blocks:

1. Time controls: pause/play, speed buttons from `props.speeds` (highlight `speedIndex`),
   sim clock (`view.hour` -> "Day N, hour H" using `props.view.hour`), moon phase (day/night).
2. Resource meters grouped as **Power**, **Air & Water**, **Shielding & Crew** (3 groups max,
   per the challenge brief). Use `view.resources.display[id]` + `view.resources.capacity[id]`
   and colour by band (`view.atmosphere.*Band`, `powerStatus.brownout`).
3. Cause chain: `props.panel` — name, `kidDescription`, status, damage, requested vs delivered
   power with `cutReason`, inputs/outputs (`wantedPerHour` vs `actualPerHour`, `blocked`),
   `dependsOn` with `problemReason`, `warning`/`warningCause`, `actions` buttons.
4. Build menu from `props.buildables`: greyed with `lockReason` / `affordabilityReason`,
   shows cost, `instances`/`maxInstances`; click -> `onAction({ kind: "build", typeId })`.
5. Alerts/event feed: `props.events` (upcoming/warning/active) with hours, plus the shelter
   toggle, power mode toggle (`priority` vs `total_brownout`) and `highlightGuidance`.
6. Mission panel: current `props.missions` objectives with `done` state and `hint`.
7. Crew list with `health` and `status`, XP and level from `props.view.xp`.
8. Collapsible "Real NASA Data" screen fed by `datasetRowsFor` + `props.dataBadge`, and a log
   list (`props.log`). Accessible: real buttons, `aria-label`s, keyboard focus, colour not the
   only signal (also text labels), font sizes readable for ages 7–12.

## 5. Files owned by the UI task (write ONLY these)

- `src/main.tsx` — React 18 `createRoot`, imports `./style.css` and `./App`.
- `src/App.tsx` — `export default function App()`; owns the simulator, the loop, the Phaser
  host div, and the action switch.
- `src/components/Dashboard.tsx` — as above.
- `src/scenes/GameScene.ts` — as above.
- `src/style.css` — dark space theme, CSS grid layout: left = Phaser canvas (flex 1),
  right = dashboard column (min 380 px, scrolls). Responsive down to 1100 px. Include
  `.meter`, `.band-safe`, `.band-warning`, `.band-critical`, `.btn`, `.btn-primary`,
  `.btn:disabled`, `.panel`, `.chip`, `.log-row`, `.grid-two`, `.section-title`.

Do not edit any file outside that list. Do not run `npm`, `tsc`, or `vite` (the integrator
builds). Keep components pure-functional, no global mutable singletons, no `any` unless a
Phaser callback payload forces it. Prefer many small components in the same file over
premature extraction.
