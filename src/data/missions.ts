/**
 * Mission flow definitions (Handbook: objectives -> XP through the simulator only).
 *
 * Objectives are pure predicates over the current simulation view plus a few run
 * counters, so they can be re-evaluated every sim hour without extra state.
 */

import type { MissionContext, MissionDef, MissionTemplate } from "../types/game";

/** Fraction of electrical-energy capacity used by several goals. */
function batteryFraction(ctx: MissionContext): number {
  const stored = ctx.view.resources.raw.electricalEnergy ?? 0;
  const capacity = ctx.view.resources.capacity.electricalEnergy ?? 0;
  if (capacity <= 0) return 0;
  return stored / capacity;
}

function countType(ctx: MissionContext, typeId: string): number {
  return ctx.view.instances.filter((instance) => instance.typeId === typeId).length;
}

function typeWorking(ctx: MissionContext, typeId: string): boolean {
  return ctx.view.instances.some(
    (instance) =>
      instance.typeId === typeId &&
      instance.status !== "OFF" &&
      instance.status !== "DESTROYED" &&
      instance.status !== "DAMAGED" &&
      instance.status !== "UNDER_CONSTRUCTION"
  );
}

export const MISSIONS: MissionTemplate[] = [
  {
    id: "first-light",
    name: "First Light",
    brief:
      "Power is the first job on the Moon. Keep the batteries charged through a full lunar day-night cycle.",
    rewardXp: 60,
    goals: [
      {
        id: "hour-24",
        label: "Run the outpost for 24 hours",
        hint: "Press play and let time pass.",
        check: (ctx) => ctx.view.hour >= 24,
      },
      {
        id: "battery-half",
        label: "Charge the battery bank to at least 40%",
        hint: "Solar arrays make power only in sunlight, so the bank stores it for night.",
        check: (ctx) => batteryFraction(ctx) >= 0.4,
      },
      {
        id: "solar-two",
        label: "Have two solar arrays working",
        hint: null,
        check: (ctx) => countType(ctx, "solar_array") >= 2 && typeWorking(ctx, "solar_array"),
      },
      {
        id: "no-brownout-left",
        label: "End the day with power for everything",
        hint: "Fix a shortage by building power or switching something off.",
        check: (ctx) => !ctx.view.powerStatus.brownout && ctx.view.hour >= 24,
      },
    ],
  },
  {
    id: "breathe-easy",
    name: "Breathe Easy",
    brief:
      "Air is chemistry. Oxygen comes from water, and the crew's CO2 has to be pulled back out of the cabin.",
    rewardXp: 80,
    goals: [
      {
        id: "o2-safe",
        label: "Keep cabin oxygen in the safe band",
        hint: "The oxygen generator uses clean water and power.",
        check: (ctx) => ctx.view.atmosphere.o2Band === "safe",
      },
      {
        id: "co2-safe",
        label: "Keep cabin CO2 in the safe band",
        hint: "The CO2 scrubber has to be running.",
        check: (ctx) => ctx.view.atmosphere.co2Band === "safe",
      },
      {
        id: "water-loop",
        label: "Run the water recycler",
        hint: null,
        check: (ctx) => typeWorking(ctx, "water_recovery"),
      },
      {
        id: "greenhouse",
        label: "Grow food in the greenhouse",
        hint: "Plants need light (power) and water. No power means no salad.",
        check: (ctx) => countType(ctx, "greenhouse") >= 1 && typeWorking(ctx, "greenhouse"),
      },
      {
        id: "crew-normal",
        label: "Every crew member back to Normal",
        hint: null,
        check: (ctx) => ctx.view.crew.length > 0 && ctx.view.crew.every((member) => member.status === "Normal"),
      },
    ],
  },
  {
    id: "storm-ready",
    name: "Storm Ready",
    brief:
      "The Sun can be dangerous. Use a real archived solar-storm warning to protect the crew — and remember, every safe choice has a cost.",
    rewardXp: 100,
    goals: [
      {
        id: "shelter",
        label: "Build the radiation shelter",
        hint: "Shelter needs regolith and spare parts.",
        check: (ctx) => countType(ctx, "radiation_shelter") >= 1,
      },
      {
        id: "monitor",
        label: "Get the radiation monitor working",
        hint: "Without a monitor the warning arrives late.",
        check: (ctx) => typeWorking(ctx, "radiation_monitor"),
      },
      {
        id: "shelter-crew",
        label: "Shelter the crew during a radiation watch",
        hint: "Crew resting in the shelter cannot repair or work outside.",
        check: (ctx) => ctx.crewSheltered,
      },
      {
        id: "rover-trip",
        label: "Complete one rover science trip",
        hint: "Driving the rover uses power and takes the crew away from the base.",
        check: (ctx) => ctx.roverCycles >= 1,
      },
      {
        id: "recover",
        label: "Recover from a power shortage",
        hint: null,
        check: (ctx) => ctx.brownoutsRecovered >= 1,
      },
    ],
  },
];

export const GOAL_XP = 15;

export function missionRewardId(missionId: string, goalId: string): string {
  return `mission:${missionId}:obj:${goalId}`;
}

export function missionCompleteRewardId(missionId: string): string {
  return `mission:${missionId}:complete`;
}

/** Active mission = the first template that is not yet fully rewarded. */
export function resolveMissions(
  templates: MissionTemplate[],
  ctx: MissionContext,
  rewarded: ReadonlySet<string>
): MissionDef[] {
  return templates.map((template) => {
    const objectives = template.goals.map((goal) => ({
      id: goal.id,
      label: goal.label,
      hint: goal.hint,
      done: goal.check(ctx) || rewarded.has(missionRewardId(template.id, goal.id)),
    }));
    const complete = objectives.every((objective) => objective.done);
    return {
      id: template.id,
      name: template.name,
      brief: template.brief,
      rewardXp: template.rewardXp,
      objectives,
      complete,
      rewarded: rewarded.has(missionCompleteRewardId(template.id)),
    };
  });
}
