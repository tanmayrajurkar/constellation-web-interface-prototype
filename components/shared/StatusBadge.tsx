"use client";

import type { SatelliteState, GlobalState } from "@/lib/types";
import styles from "./StatusBadge.module.css";

type BadgeState = SatelliteState | GlobalState;

const styleMap: Record<string, string> = {
  running: styles.running,
  initialized: styles.initialized,
  warning: styles.warning,
  error: styles.error,
  new: styles.new,
  idle: styles.idle,
  launched: styles.launched,
  stopped: styles.stopped,
  shutdown: styles.shutdown,
  mixed: styles.mixed,
  globalIdle: styles.globalIdle,
  globalNew: styles.globalNew,
  globalRunning: styles.globalRunning,
  globalStopped: styles.globalStopped,
  globalShutdown: styles.globalShutdown,
  globalMixed: styles.globalMixed,
  globalInitialized: styles.globalInitialized,
  globalLaunched: styles.globalLaunched,
  globalError: styles.globalError,
};

export function StatusBadge({
  state,
  global = false,
}: {
  state: BadgeState;
  global?: boolean;
}) {
  const key = global ? `global${state.charAt(0).toUpperCase()}${state.slice(1)}` : state;
  const className = styleMap[key] ?? styleMap[state] ?? styles.new;
  return <span className={`${styles.badge} ${className}`}>{state}</span>;
}
