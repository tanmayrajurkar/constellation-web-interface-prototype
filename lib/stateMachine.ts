import type { SatelliteState, LifecycleAction } from "./types";

const SATELLITE_TRANSITIONS: Record<SatelliteState, SatelliteState[]> = {
  new: ["initialized", "error"],
  initialized: ["launched", "shutdown", "error"],
  launched: ["running", "stopped", "initialized", "error"],
  running: ["stopped", "error"],
  stopped: ["running", "shutdown", "error"],
  shutdown: ["initialized", "error"],
  error: ["initialized"],
};

export function canTransition(from: SatelliteState, to: SatelliteState): boolean {
  return SATELLITE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getLifecycleActionTargetState(action: LifecycleAction): SatelliteState {
  const map: Record<string, SatelliteState> = {
    initialize: "initialized",
    launch: "launched",
    land: "initialized",
    start: "running",
    stop: "stopped",
    shutdown: "shutdown",
  };
  return map[action] ?? "new";
}

export function isActionEnabled(state: SatelliteState, action: string): boolean {
  const target = getLifecycleActionTargetState(action as LifecycleAction);
  return canTransition(state, target);
}

export type { SatelliteState, GlobalState, LifecycleAction } from "./types";
