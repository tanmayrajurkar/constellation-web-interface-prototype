import type { GlobalState, Satellite } from "./types";

export function deriveGlobalState(satellites: Satellite[]): GlobalState {
  if (satellites.length === 0) return "idle";
  const states = satellites.map((s) => s.state);
  if (states.some((s) => s === "error")) return "error";
  const allSame = states.every((s) => s === states[0]);
  if (allSame) return states[0];
  return "mixed";
}
