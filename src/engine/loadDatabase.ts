/**
 * Loads the four data documents the schema validates and exposes the NASA provenance
 * table used by the "Real NASA Data" screen.
 *
 * Numbers live in JSON, never in code (Handbook data rules): every leaf in the four
 * documents is `{ v, source }` where source is `nasa` or `game_assumption`.
 */

import resourcesRaw from "../data/resources.json";
import buildingsRaw from "../data/buildings.json";
import configRaw from "../data/outpost.config.json";
import eventsRaw from "../data/events.local.json";
import { validateGameDatabase } from "./schema";
import { DataValidationError } from "./result";
import type { GameDatabase, Result } from "../types/outpost";

export interface DatasetRow {
  id: string;
  label: string;
  /** What the game actually takes from it. */
  usedFor: string;
  url: string;
  retrieved: string;
  origin: "nasa" | "game_assumption";
  /** Only true after a live fetch succeeded in this browser session. */
  live: boolean;
  file?: string;
}

export const DATASETS: DatasetRow[] = [
  {
    id: "N01",
    label: "NASA-STD-3001 space habitable volume / atmosphere limits",
    usedFor: "O2 and CO2 safe bands, cabin temperature comfort range.",
    url: "https://www.nasa.gov/standards/",
    retrieved: "2026-11-13",
    origin: "nasa",
    live: false,
  },
  {
    id: "N02",
    label: "DONKI space-weather archive (FLR / CME / SEP)",
    usedFor: "Event timing, warning lead time and storm length in events.local.json.",
    url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
    retrieved: "2026-11-13",
    origin: "nasa",
    live: false,
    file: "src/data/raw/donki.json",
  },
  {
    id: "N03",
    label: "Lunar terrain (NASA LRO/LOLA elevation mosaic)",
    usedFor: "Greybox ground relief and where solar arrays lose sunlight.",
    url: "https://www.lunarwards.com/",
    retrieved: "2026-11-13",
    origin: "nasa",
    live: false,
    file: "src/data/raw/nasa_lunar_terrain.tif",
  },
  {
    id: "N04",
    label: "Lunar surface temperature map (Diviner)",
    usedFor: "Day/night exterior temperatures feeding the thermal model.",
    url: "https://pds-geosciences.wustl.edu/lunar/missions/diviner.htm",
    retrieved: "2026-11-13",
    origin: "nasa",
    live: false,
    file: "src/data/raw/nasa_lunar_temperature.xyz",
  },
  {
    id: "N05",
    label: "Lunar illumination / sunlight hours",
    usedFor: "354 h daylight and 354 h night used by the power model.",
    url: "https://www.nasa.gov/",
    retrieved: "2026-11-13",
    origin: "nasa",
    live: false,
    file: "src/data/raw/nasa_lunar_illumination.png",
  },
  {
    id: "N06",
    label: "Lunar water-ice distribution map",
    usedFor: "Where water recovery can be sited; shown on the map screen.",
    url: "https://science.nasa.gov/moon/water/",
    retrieved: "2026-11-13",
    origin: "nasa",
    live: false,
    file: "src/data/raw/nasa_lunar_water_ice.jpg",
  },
  {
    id: "N07",
    label: "NASA OSDR life-science records (crew health)",
    usedFor: "Crew health drain thresholds and radiation effect wording.",
    url: "https://osdr.nasa.gov/bio/repo/",
    retrieved: "2026-11-13",
    origin: "nasa",
    live: false,
    file: "src/data/raw/nasa_osdr_480.json",
  },
  {
    id: "N08",
    label: "Regolith shielding thickness for radiation reduction",
    usedFor: "Shelter protection and regolith build cost.",
    url: "https://osdr.nasa.gov/geophysics/solar/",
    retrieved: "2026-11-13",
    origin: "nasa",
    live: false,
    file: "src/data/raw/nasa_osdr_569.json",
  },
  {
    id: "G01",
    label: "Game balance values",
    usedFor: "Costs, build times, storage sizes and XP — chosen to be playable, not real.",
    url: "",
    retrieved: "2026-11-13",
    origin: "game_assumption",
    live: false,
  },
];

export type DatabaseLoadResult = Result<GameDatabase>;

let cached: GameDatabase | null = null;

export function loadGameDatabase(): GameDatabase {
  if (cached) return cached;
  cached = validateGameDatabase({
    resources: resourcesRaw,
    buildings: buildingsRaw,
    config: configRaw,
    events: eventsRaw,
  });
  return cached;
}

/** Non-throwing variant for the app shell's error screen. */
export function tryLoadGameDatabase(): DatabaseLoadResult {
  try {
    return { ok: true, value: loadGameDatabase() };
  } catch (error) {
    const message =
      error instanceof DataValidationError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
    return { ok: false, error: { code: "DATA_VALIDATION_FAILED", message } };
  }
}

/** Rows shown on the in-tool data screen, split by provenance. */
export function datasetRowsFor(db: GameDatabase | null): DatasetRow[] {
  if (!db) return DATASETS;
  // Config citations are the authoritative list; keep only rows the documents cite.
  const cited = new Set(db.config.meta.citations);
  return DATASETS.filter((row) => row.origin === "game_assumption" || cited.size === 0 || cited.has(row.id));
}
