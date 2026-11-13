export type RadiationLevel = "Low" | "Medium" | "High";

export function getRadiationLevel(
  solarEventCount: number
): RadiationLevel {
  if (solarEventCount >= 3) return "High";
  if (solarEventCount >= 1) return "Medium";
  return "Low";
}