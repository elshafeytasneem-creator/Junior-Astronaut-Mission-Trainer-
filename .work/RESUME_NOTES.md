# OUTPOST ZERO web build — resume state (2026-11-14 ~02:39)

## Where things stand
All stubs filled; **`tsc --noEmit` is clean** and the headless smoke test runs.
Files written by me (this session): index.html, tsconfig.json, vite.config.ts,
src/types/game.ts, src/data/{buildings.json,outpost.config.json,events.local.json,missions.ts},
src/engine/{simulator.ts,messages.ts,loadDatabase.ts}, src/App.tsx (complete: createSim/state,
rAF accumulator loop, Phaser host + event bridge, action switch, live-DONKI badge fetch,
DataBadge "Real NASA Data" screen), src/main.tsx, src/scenes/GameScene.ts (all-procedural Phaser,
no asset files needed), src/components/Dashboard.tsx, src/style.css,
.work/UI_API.md, .work/scripts/smoke.ts (+ .work/smoke.mjs), .work/scripts/probe.ts.

Verification commands (npm.ps1 is blocked by execution policy; call node binaries directly):
  node .\node_modules\typescript\bin\tsc --noEmit -p tsconfig.json
  node .\node_modules\esbuild\bin\esbuild .work\scripts\smoke.ts --bundle --platform=node --format=esm --outfile=.work\smoke.mjs
  node .work\smoke.mjs
Still TODO: `vite build` + preview check; fix the last radiation-shelter gameplay issue (below).

## Balance bugs found and FIXED this session (all verified by re-running the 240 h test)
1. `currentTier()` used `[...tiers].reverse().find(...)` -> perfect air matched the loosest
   "critical" tier; crew died at hour 8-11. Now iterates best-first with critical as fallback.
2. Stores started ABOVE granted capacity (initial cleanWater/food 80 vs capacity 60), so
   `blocksWhenFull` idled the Greenhouse and Water Recycler forever. recomputeCapacities now
   clamps every resource to its capacity (capacity>0 only; 0 means unbounded, which is how
   cabin gases, money and XP behave).
3. Cabin gas loops ran flat out: CDRA stripped CO2 to 0.00 mmHg, OGS pushed O2 to 164 (warning).
   Added `setpointControl(type)` proportional ramps (O2 between o2SafeMin..vent top; CO2 between
   0.5x and 1x of co2SafeMax) + a hard rest for CO2 below the floor. O2 now 150-152 safe, CO2 ~1.9-2.5 safe.
4. `o2VentAboveMmHg` was 160 = above the 155 safe max -> permanent warning. Now 155.
5. Thermal runaway: leaked heat 11.8 kWh/h (ambientKwhPerHourPerC 0.12 x ΔT 98) with mass 6 kWh/C
   -> +2.8 C/h, crew dead by h11. Now: ambientKwhPerHourPerC 0.02 (MLI), massKwhPerC 40,
   thermal_control heatRemovalKwh 8 -> 14, and radiators are proportional via new
   `thermal.controlBandC = 4` + `thermalDemand()`. Cabin now holds 23-24 C with TCS, drifts
   ~0.3 C/h without it.
6. Night power was impossible: battery could only deliver 8 kWh/h vs 11.7 demand -> brownout every
   night, CO2 spikes, crew injury. battery_bank batteryRateKwh 8 -> 20.
7. Battery capacity lived in TWO places (capacityGrants 40 vs batteryCapacityKwh 40/120) and the sim
   ignored batteryCapacityKwh. Simulator now adds batteryCapacityKwh (x level x damage) to
   electricalEnergy capacity; the duplicate grant is 0 with a note. Storage = 120 kWh, initial 114.
8. Solar was too weak to cover 24 h of load with one array (26 kWh/h x 16 daylight = 416 vs ~281/day
   demand keeps a margin). solar_array solarKwhPerFullSunHour 20 -> 26; greenhouse powerDrawKwh
   4 -> 2.5. Dust storm dimming softened 0.55 -> 0.65 and 0.45 -> 0.55.
9. Habitat wasteWater flow 0.25 -> 0.45 kg/h (condensate+greywater) so the water loop closes enough
   that a ~6-day run is fair; crew.ratesAtReference.wasteWaterL in config still says 0.25 and the
   schema pairs habitat flows with crew rates -> SHOULD BE UPDATED TO MATCH (open item).
10. Radiation/shelter numbers were hard-coded (14 / 6 / 0.5). Moved into config:
    crew.exposureDrainPerHour 8, crew.shelterInPlaceDrainPerHour 4, crew.shelteredActivityFactor 0.5.
    crew.warningDrainHours 24 -> 48, recoveryPerHour 2 -> 3.

## CURRENT smoke-test status (240 h scripted "competent player", seed 20261114)
- Deterministic replay TRUE, save/load hour +5 TRUE, schema OK 16/18/9.
- Mission first-light 4/4 complete, breathe-easy 5/5 complete.
- Power, air, water, temperature all stable for 70 h.
- FAILURE: mission failed at h72 "The whole crew is gone" — radiation exposure, because the
  scripted player's `build("radiation_shelter", "pad-13")` returns FALSE at h10 (reason not yet
  printed; suspects: unlockXp gate, cost, or the unknown pad). Without a shelter `provides("shelter")`
  is false, so `setCrewSheltered(true)` returns NO_SHELTER and every SEP/flare/CME drains 8 hp/h.
  NEXT: print the real error, then either build it earlier/when affordable or lower its unlock gate;
  also confirm pad-13 exists in OUTPOST_SLOTS (types/game.ts defines pad-01..pad-12 only, so the
  scripted test should use a free real pad or null).

## Contract deviations from .work/UI_API.md (already reflected in App.tsx)
- `sim.settings` -> `sim.settingsSnapshot()`; `sim.crewSheltered()` -> `sim.crewShelteredNow()`.

## Context that cannot be re-derived
- The user's 3 pasted attachments (the original Cursor prompt) never reached the device:
  `C:\Users\NOUR SOFT\AppData\Roaming\Manus\uploads\...` does not exist; AppData\Roaming is
  access-denied. Spec was reconstructed from committed contracts + D:\SpaceTinker\Documentation\
  (Architecture.md, Hackathon_Checklist.md) and D:\SpaceTinker\README.md (NASA Space Apps Challenge
  2026, "Junior Astronaut Mission Trainer", ages 7-12, browser-playable, real NASA data,
  "every choice has a cost"; deadline Sun Nov 15 23:59 local).
- Device "tasneem" (Windows, D:\SpaceTinkerProject) went offline twice. Recovery: after it shows
  online in manus-device.list_devices, call switch_device with the SAME environment_id
  (device:80e98987-8644-4a4a-8360-44645a04f1cf) and workspace_id
  (folder:c86bdb86f2eff058e1f86aa3a53ac8f0); that re-binds file/terminal tools.
- Terminal sessions can get stuck ("already has a running command") — just start a new session name.

## FINAL STATE (2026-11-14 ~02:57) - build is green and the game is playable
- `tsc --noEmit`: clean. `vite build`: succeeds -> dist/ (index.html 0.8 kB, css 6.5 kB,
  index chunk 141 kB, react chunk 141 kB, phaser chunk 1.48 MB).
- `vite preview` serves on http://localhost:4173/ (left running in the `preview` shell session).
  Note: HTTP from inside this session's terminal is blocked by the local policy, so the page
  itself has not been clicked through - that is the one remaining manual check.
- 240-hour headless test (`.work/scripts/smoke.ts`, seed 20261114, competent scripted player):
  crew all alive at 100 health, O2 ~151 safe, CO2 ~1.9 safe, T ~23 safe, water 125 L left,
  food 43 left, level 17, `deterministic replay: true`, save/load hour +5 true,
  `failures=0`. Mission first-light 3/4, breathe-easy 5/5 (complete), storm-ready 4/5.
- Economy work added late in the session (all data-driven except the uplink payment):
  `config.economy` = roverCycleCredits 250, evaCredits 60, uplinkCreditsPerSol 380,
  resupplyPartsPerSol 1; `simulator.paySolIncome()` pays once per sol only if a working
  comms dish exists (and lands one spare part with it, so repairs never dead-end);
  the airlock EVA cycle now yields 30 kg regolith ("a spacewalk is also a shovel") because
  the site was dead-locked: the rover costs dirt and only the rover made dirt;
  rover build cost 100 -> 60 kg dirt; starter regolith 250 -> 420 kg; starter water 80 -> 240 L
  (habitat tank grant 60 -> 300); CDRA captured-CO2 buffer 10 -> 25 kg.
- Still tunable (not blocking): dirt income is the binding constraint, so the scripted player
  only reaches 15 instances and one rover cycle in 240 h; the Sabatier usually stays unbuilt
  because it wants 120 kg of dirt. If a longer game is wanted, either raise the EVA/rover dirt
  yields or lower the Sabatier's dirt cost. Food is fine (greenhouse + rations).
- Reference docs written: `.work/UI_API.md` (engine<->UI contract) and this file.
- Contract deviations from UI_API.md, already reflected in App.tsx: `sim.settings` ->
  `sim.settingsSnapshot()`, `sim.crewSheltered()` -> `sim.crewShelteredNow()`.

## Re-verification after device reconnect (2026-11-14 ~06:57)
- No source file is newer than the built bundle (newest: `src/data/buildings.json` 02:55 vs
  `dist/assets/index-*.js` 02:55:51) -> dist is current, no rebuild needed.
- `tsc --noEmit` exit code 0; 240 h smoke: `failures=0`, `deterministic replay: true`,
  save 8380 bytes hour 240 -> restored 245.
- The earlier `vite preview` process died when the device session dropped (exit 0). A new
  resident service is running now, serving http://localhost:4173/ (LAN http://192.168.1.157:4173/).
  Its startup log proves the port bound successfully both times. HTTP from inside this
  session's terminal is blocked by local policy ("Access denied"/timeout), so the page has
  never been fetched by me - only confirmed listening.
- If the URL ever stops responding: `cd D:\SpaceTinkerProject` then
  `node .\node_modules\vite\bin\vite.js preview --port 4173 --strictPort --host`
  (or `npm run preview` / `npm run dev` if script execution is allowed).
