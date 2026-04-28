import type { FlowState } from "@/types";

// v2: schema changed when we replaced the questionnaire with intentions.
// Bumping the key avoids reading stale state from earlier prototype runs.
const KEY = "synko.flow.v2";

/** Read flow state from localStorage. Returns null on first visit / parse error. */
export function loadFlow(): FlowState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FlowState;
    // Defensive: if shape is wrong (e.g. dev edit broke schema), treat as fresh.
    if (
      typeof parsed?.stage !== "string" ||
      !Array.isArray(parsed?.intentions)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Persist flow state to localStorage. No-op on the server. */
export function saveFlow(state: FlowState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Quota errors etc. — non-fatal for a prototype.
  }
}

/** Clear persisted state — used by the Reset button. */
export function clearFlow(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Initial flow state. */
export const INITIAL_FLOW: FlowState = {
  stage: "intro",
  intentions: [],
  speciesId: null,
};
