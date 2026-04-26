import type { Stage } from "@/types";

/** Stage ordering for the linear flow. */
export const STAGE_ORDER: Stage[] = [
  "intro",
  "analysis",
  "intentions",
  "hatching",
  "coaching1",
  "coaching2",
  "reflection",
  "end",
];

/** Advance to the next stage in the linear flow. Returns null at the end. */
export function nextStage(current: Stage): Stage | null {
  const i = STAGE_ORDER.indexOf(current);
  if (i < 0 || i >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[i + 1];
}
