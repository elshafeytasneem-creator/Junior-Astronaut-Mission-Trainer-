import { useCallback, useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { Dashboard } from "./components/Dashboard";
import { GameScene } from "./scenes/GameScene";
import { OutpostSimulator } from "./engine/simulator";
import { datasetRowsFor, tryLoadGameDatabase } from "./engine/loadDatabase";
import { alertMessage, describeEvent } from "./engine/messages";
import { GOAL_XP, MISSIONS, missionCompleteRewardId, missionRewardId, resolveMissions } from "./data/missions";
import { getRadiationLevel } from "./utils/radiation";
import type { GameDatabase, Result, StepResult } from "./types/outpost";
import type {
  DashboardAction,
  LogEntry,
  LogKind,
  MissionContext,
  SceneBuildPayload,
  SceneCollectPayload,
  SceneInputData,
  SceneSelectPayload,
  SystemPanelData,
} from "./types/game";
import {
  GAME_SCENE_KEY,
  SCENE_INBOUND,
  SCENE_OUTBOUND,
  nextFreeSlotId,
  slotLabel,
} from "./types/game";

const SAVE_KEY = "outpost-sim-save-v1";
const START_SEED = 20261114;

interface UiState {
  view: StepResult;
  panel: SystemPanelData | null;
  log: LogEntry[];
  radiationLabel: string;
  }

export default function App() {
  const [database] = useState(() => tryLoadGameDatabase());
  if (!database.ok) {
    return (
      <div className="fatal">
        <h1>Outpost data did not validate</h1>
        <p>The simulation numbers live in <code>src/data</code>. Fix this and reload:</p>
        <pre>{database.error.message}</pre>
      </div>
    );
  }
  return <Trainer db={database.value} />;
}

interface TrainerProps {
  db: GameDatabase;
}

function Trainer({ db }: TrainerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const simRef = useRef<OutpostSimulator | null>(null);
  const logRef = useRef<LogEntry[]>([]);
  const logSeq = useRef(1);
  const inputRef = useRef<SceneInputData | null>(null);
  const selectedRef = useRef<string | null>(null);
  const handlersRef = useRef<{
    select: (payload: SceneSelectPayload) => void;
    collect: (payload: SceneCollectPayload) => void;
    build: (payload: SceneBuildPayload) => void;
    ready: () => void;
  }>({
    select: () => undefined,
    collect: () => undefined,
    build: () => undefined,
    ready: () => undefined,
  });

  const seedRef = useRef(START_SEED);
  const [selected, setSelected] = useState<string | null>(null);

  const createSim = useCallback(
    (nextSeed: number): OutpostSimulator => {
      const created = new OutpostSimulator(db, {
        seed: nextSeed,
        crewSize: db.config.crew.defaultSize,
        clock: {
          requestAutoPause: () => {
            if (simRef.current) simRef.current.paused = true;
          },
        },
      });
      created.paused = true;
      return created;
    },
    [db]
  );

  const [sim, setSim] = useState<OutpostSimulator>(() => createSim(START_SEED));

  simRef.current = sim;

  const [ui, setUi] = useState<UiState>(() => ({
    view: sim.view(),
    panel: null,
    log: [],
    radiationLabel: getRadiationLevel(sim.radiationStormCount()),
  }));
  const [paused, setPaused] = useState(true);
  const [speedIndex, setSpeedIndex] = useState(sim.speedIndex);
  const [mode, setMode] = useState(sim.mode);
  const [highlight, setHighlight] = useState(sim.highlightGuidance);
  const [sheltered, setSheltered] = useState(sim.crewShelteredNow());
  const [dataBadge, setDataBadge] = useState<"LIVE NASA DATA" | "ARCHIVED NASA EVENT">("ARCHIVED NASA EVENT");
  const previousLevel = useRef(1);

  const pushLog = useCallback((entries: LogEntry[]): void => {
    logRef.current = [...entries, ...logRef.current].slice(0, 60);
  }, []);

  /** Recompute every derived value the dashboard and the scene need. */
  const refresh = useCallback((): void => {
    const instance = simRef.current;
    if (!instance) return;
    const view = instance.view();
    const entries: LogEntry[] = [];

    for (const event of view.events) {
      const described = describeEvent(event.name, event.payload);
      entries.push({ id: logSeq.current++, hour: view.hour, kind: described.kind, message: described.message });
    }
    for (const alert of view.alerts) {
      const described = alertMessage(alert);
      const duplicate = logRef.current.some((row) => row.message === described.message && row.hour === view.hour);
      if (!duplicate) {
        entries.push({ id: logSeq.current++, hour: view.hour, kind: described.kind, message: described.message });
      }
    }
    pushLog(entries);

    const rewarded = new Set(instance.awardedRewards());
    const missionContext = {
      view,
      buildables: instance.buildables(),
      roverCycles: instance.counters().roverCycles,
      powerUpsCollected: instance.counters().powerUpsCollected,
      crewSheltered: instance.crewShelteredNow(),
      brownoutsRecovered: instance.counters().brownoutsRecovered,
    };
    let missions = resolveMissions(MISSIONS, missionContext, rewarded);
    let awardedAnything = false;
    for (const mission of missions) {
      for (const goal of mission.objectives) {
        const rewardId = missionRewardId(mission.id, goal.id);
        if (goal.done && !rewarded.has(rewardId)) {
          instance.awardXp(rewardId, GOAL_XP);
          rewarded.add(rewardId);
          awardedAnything = true;
        }
      }
    }
    missions = resolveMissions(MISSIONS, missionContext, rewarded);
    for (const mission of missions) {
      const completeId = missionCompleteRewardId(mission.id);
      if (mission.complete && !rewarded.has(completeId)) {
        instance.awardXp(completeId, mission.rewardXp);
        rewarded.add(completeId);
        awardedAnything = true;
        pushLog([
          {
            id: logSeq.current++,
            hour: view.hour,
            kind: "good",
            message: `Mission "${mission.name}" complete: +${mission.rewardXp} XP. Progress saved.`,
          },
        ]);
      }
    }
    if (awardedAnything) missions = resolveMissions(MISSIONS, missionContext, rewarded);

    const levelNow = instance.level().level;
    if (levelNow > previousLevel.current) {
      pushLog([
        {
          id: logSeq.current++,
          hour: view.hour,
          kind: "good",
          message: `Level ${levelNow} reached. Some systems unlocked a higher output.`,
        },
      ]);
      previousLevel.current = levelNow;
      saveGame();
    }

    const rawPanel = instance.inspect(selectedRef.current);
    const panel: SystemPanelData | null = rawPanel
      ? { ...rawPanel, slotLabel: slotLabel(rawPanel.slotLabel) ?? rawPanel.slotLabel }
      : null;

    setUi({
      view,
      panel,
      log: logRef.current,
      radiationLabel: getRadiationLevel(instance.radiationStormCount()),
    });
    setPaused(instance.paused);
    setSpeedIndex(instance.speedIndex);
    setMode(instance.settingsSnapshot().powerShortageMode);
    setHighlight(instance.settingsSnapshot().highlightGuidance);
    setSheltered(instance.crewShelteredNow());

    const input: SceneInputData = {
      view,
      instances: instance.instances(),
      collectibles: instance.collectibles(),
      selectedInstanceId: selectedRef.current,
      sunlightFactor: instance.lunarPhase().sunlightFactor,
      crewSheltered: instance.crewShelteredNow(),
    };
    inputRef.current = input;
    gameRef.current?.events.emit(SCENE_INBOUND.input, input);
  }, [pushLog]);

  const saveGame = useCallback((): void => {
    const instance = simRef.current;
    if (!instance) return;
    try {
      window.localStorage.setItem(SAVE_KEY, instance.saveJson());
    } catch {
      // Private mode or a full quota: the game keeps running without a save.
    }
  }, []);


  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let accumulator = 0;

    const loop = (now: number): void => {
      frame = requestAnimationFrame(loop);
      const delta = Math.min(250, now - last);
      last = now;
      const instance = simRef.current;
      if (!instance) return;
      if (instance.paused) {
        accumulator = 0;
        return;
      }
      accumulator += delta;
      let steps = 0;
      const perHour = instance.msPerSimHour();
      while (accumulator >= perHour && steps < 8) {
        accumulator -= perHour;
        instance.step(1);
        steps += 1;
      }
      if (steps > 0) refresh();
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [refresh, sim]);

  /* ------------------------------------------------------- selection + reset --- */

  const pendingSlotRef = useRef<string | null>(null);
  const [liveNote, setLiveNote] = useState<string | null>(null);

  const selectBuilding = useCallback((instanceId: string | null): void => {
    selectedRef.current = instanceId;
    setSelected(instanceId);
  }, []);

  useEffect(() => {
    refresh();
  }, [selected, refresh]);

  /** A new simulator (load or new game) clears the shell's derived state. */
  useEffect(() => {
    logRef.current = [];
    previousLevel.current = 1;
    selectedRef.current = null;
    pendingSlotRef.current = null;
    setSelected(null);
    setUi({
      view: sim.view(),
      panel: null,
      log: [],
      radiationLabel: getRadiationLevel(sim.radiationStormCount()),
    });
    refresh();
  }, [sim, refresh]);

  /* ------------------------------------------------------------ phaser host --- */

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      backgroundColor: "#05070d",
      width: 1280,
      height: 720,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: [new GameScene()],
    });
    gameRef.current = game;

    const onSelect = (payload: SceneSelectPayload) => handlersRef.current.select(payload);
    const onCollect = (payload: SceneCollectPayload) => handlersRef.current.collect(payload);
    const onBuild = (payload: SceneBuildPayload) => handlersRef.current.build(payload);
    const onReady = () => handlersRef.current.ready();

    game.events.on(SCENE_OUTBOUND.select, onSelect);
    game.events.on(SCENE_OUTBOUND.collect, onCollect);
    game.events.on(SCENE_OUTBOUND.build, onBuild);
    game.events.on(SCENE_OUTBOUND.ready, onReady);

    return () => {
      game.events.off(SCENE_OUTBOUND.select, onSelect);
      game.events.off(SCENE_OUTBOUND.collect, onCollect);
      game.events.off(SCENE_OUTBOUND.build, onBuild);
      game.events.off(SCENE_OUTBOUND.ready, onReady);
      gameRef.current = null;
      game.destroy(true);
    };
  }, []);

  /* ------------------------------------------------------------- app actions --- */

  const notify = useCallback(
    (message: string, kind: LogKind = "info"): void => {
      const instance = simRef.current;
      pushLog([{ id: logSeq.current++, hour: instance ? instance.view().hour : 0, kind, message }]);
    },
    [pushLog]
  );

  const report = useCallback(
    (result: Result<unknown>): void => {
      if (!result.ok) notify(result.error.message, "warn");
    },
    [notify]
  );

  const handleAction = useCallback(
    (action: DashboardAction): void => {
      const instance = simRef.current;
      if (!instance) return;

      switch (action.kind) {
        case "build": {
          const occupied = instance.instances().map((item) => item.slotId);
          const slot = pendingSlotRef.current ?? nextFreeSlotId(occupied);
          pendingSlotRef.current = null;
          if (!slot) {
            notify("Every pad is taken. Remove something before building.", "warn");
            break;
          }
          report(instance.build(action.typeId, slot));
          refresh();
          break;
        }
        case "cancel":
          report(instance.cancelConstruction(action.instanceId));
          refresh();
          break;
        case "demolish":
          report(instance.demolish(action.instanceId));
          if (selectedRef.current === action.instanceId) selectBuilding(null);
          refresh();
          break;
        case "repair":
          report(instance.repair(action.instanceId));
          refresh();
          break;
        case "upgrade":
          report(instance.upgrade(action.instanceId));
          refresh();
          break;
        case "toggle":
          report(instance.setStatus(action.instanceId, action.on ? "ON" : "OFF"));
          refresh();
          break;
        case "cycle":
          report(instance.runCycle(action.instanceId));
          refresh();
          break;
        case "powerUp":
          report(instance.activatePowerUp(action.typeId));
          refresh();
          break;
        case "collect":
          report(instance.collectPowerUp(action.collectibleId));
          refresh();
          break;
        case "shelter":
          report(instance.setCrewSheltered(action.on));
          setSheltered(instance.crewShelteredNow());
          refresh();
          break;
        case "mode":
          instance.setPowerShortageMode(action.mode);
          setMode(action.mode);
          notify(
            action.mode === "priority"
              ? "Shortage handling: priority. The least important systems are switched off first."
              : "Shortage handling: total brownout. Nothing runs until there is power for everything."
          );
          refresh();
          break;
        case "highlight":
          instance.setHighlightGuidance(action.on);
          setHighlight(action.on);
          break;
        case "speed":
          instance.setSpeed(action.index);
          setSpeedIndex(instance.speedIndex);
          break;
        case "pause":
          instance.paused = action.paused;
          setPaused(instance.paused);
          break;
        case "select":
          selectBuilding(action.instanceId);
          break;
        case "save":
          saveGame();
          notify("Progress saved in this browser.", "good");
          break;
        case "load": {
          const json = window.localStorage.getItem(SAVE_KEY);
          if (!json) {
            notify("No saved outpost in this browser yet. Press Save first.", "warn");
            break;
          }
          try {
            seedRef.current += 1;
            setSim(OutpostSimulator.fromSave(db, json, { seed: seedRef.current }));
          } catch (error) {
            notify(
              `Could not load the save: ${error instanceof Error ? error.message : String(error)}`,
              "danger"
            );
          }
          break;
        }
        case "newGame":
          seedRef.current = action.seed;
          setSim(createSim(action.seed));
          notify(
            `New run, seed ${action.seed}. The archived solar storm lands at a different hour this time.`,
            "info"
          );
          break;
        default:
          break;
      }
    },
    [createSim, db, notify, refresh, report, saveGame, selectBuilding]
  );

  handlersRef.current.select = (payload) => selectBuilding(payload.instanceId);
  handlersRef.current.collect = (payload) => {
    const instance = simRef.current;
    if (!instance) return;
    report(instance.collectPowerUp(payload.collectibleId));
    refresh();
  };
  handlersRef.current.build = (payload) => {
    pendingSlotRef.current = payload.slotId;
    notify(`Pad chosen: ${slotLabel(payload.slotId) ?? payload.slotId}. Now pick a system in Build.`, "info");
  };
  handlersRef.current.ready = () => {
    if (!gameRef.current?.scene.isActive(GAME_SCENE_KEY)) return;
    if (inputRef.current) gameRef.current.events.emit(SCENE_INBOUND.input, inputRef.current);
  };

  /* ----------------------------------------------------- live / archived data --- */

  const checkLive = useCallback((): void => {
    const url = "https://ccmc.gsfc.nasa.gov/DONKI/FLR?startDate=2026-01-01&endDate=2026-11-13&allEvents=true";
    setLiveNote("Asking NASA for the archived flare list...");
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`DONKI answered ${response.status}`);
        return response.text();
      })
      .then((text) => {
        if (!text || text.trim().length === 0) throw new Error("DONKI answered with nothing");
        setDataBadge("LIVE NASA DATA");
        setLiveNote(`Live answer received: ${text.length} characters of flare records.`);
        notify("Live NASA check succeeded, so the badge now says LIVE NASA DATA.", "good");
      })
      .catch((error: unknown) => {
        setDataBadge("ARCHIVED NASA EVENT");
        const message = error instanceof Error ? error.message : String(error);
        setLiveNote(`Live check failed (${message}). The game keeps using the archived copies.`);
        notify("Live NASA check failed, so nothing is claimed as live data.", "warn");
      });
  }, [notify]);

  /* ------------------------------------------------------------- render data --- */

  const buildables = sim.buildables();
  const counters = sim.counters();
  const missionContext: MissionContext = {
    view: ui.view,
    buildables,
    roverCycles: counters.roverCycles,
    powerUpsCollected: counters.powerUpsCollected,
    crewSheltered: sim.crewShelteredNow(),
    brownoutsRecovered: counters.brownoutsRecovered,
  };
  const missions = resolveMissions(MISSIONS, missionContext, new Set(sim.awardedRewards()));
  const phase = sim.lunarPhase();
  const progress = sim.level();

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Junior Astronaut Trainer</h1>
          <p className="subtitle">
            Run a lunar outpost: power, air, water, shielding. Every choice has a cost.
          </p>
        </div>
        <DataBadge db={db} badge={dataBadge} note={liveNote} onCheck={checkLive} />
      </header>

      <main className="layout">
        <section className="stage" aria-label="Outpost map">
          <div ref={hostRef} className="stage-canvas" />
          <div className="stage-foot">
            <span className={`chip ${phase.daylight ? "chip-sun" : "chip-night"}`}>
              {phase.daylight ? "Sunlight" : "Lunar night"} · {phase.hoursToChange} h to change
            </span>
            <span className="chip">Radiation risk: {ui.radiationLabel}</span>
            <span className="chip">
              Level {progress.level} · {progress.xpToNext} XP to next
            </span>
            <span className="chip">
              {selected ? "Inspect panel updated" : "Click a system on the map to see why it struggles"}
            </span>
          </div>
        </section>

        <Dashboard
          view={ui.view}
          buildables={buildables}
          instances={ui.view.instances}
          panel={ui.panel}
          log={ui.log}
          powerUps={sim.powerUpViews()}
          events={sim.eventViews()}
          missions={missions}
          crew={ui.view.crew}
          speeds={db.config.time.speeds}
          speedIndex={speedIndex}
          paused={paused}
          mode={mode}
          highlightGuidance={highlight}
          crewSheltered={sheltered}
          radiationLabel={ui.radiationLabel}
          dataBadge={dataBadge}
          onAction={handleAction}
        />
      </main>
    </div>
  );
}

interface DataBadgeProps {
  db: GameDatabase;
  badge: "LIVE NASA DATA" | "ARCHIVED NASA EVENT";
  note: string | null;
  onCheck: () => void;
}

/** The "Real NASA Data" screen: sources, what was taken from each, and honest badges. */
function DataBadge({ db, badge, note, onCheck }: DataBadgeProps) {
  const rows = datasetRowsFor(db);
  return (
    <details className="databar">
      <summary>
        <span className={`badge ${badge === "LIVE NASA DATA" ? "badge-live" : "badge-archived"}`}>
          {badge}
        </span>
        <span className="databar-title">Real NASA data used here</span>
      </summary>
      <div className="databar-body">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Source</th>
              <th scope="col">What the game takes from it</th>
              <th scope="col">Retrieved</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  {row.url ? (
                    <a href={row.url} target="_blank" rel="noreferrer noopener">
                      {row.label}
                    </a>
                  ) : (
                    row.label
                  )}
                  <span className={`origin origin-${row.origin}`}>
                    {row.origin === "nasa" ? "NASA value" : "game assumption"}
                  </span>
                  {row.file ? <code className="file">{row.file}</code> : null}
                </td>
                <td>{row.usedFor}</td>
                <td>{row.retrieved}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" className="btn" onClick={onCheck}>
          Check NASA live now
        </button>
        <p className="note">
          {note ??
            "Every number in the simulation comes from the archived copies listed above. The badge only says LIVE after a request succeeds in this browser."}
        </p>
      </div>
    </details>
  );
}
