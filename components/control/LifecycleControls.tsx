"use client";

import { isActionEnabled } from "@/lib/stateMachine";
import type { SatelliteState } from "@/lib/types";
import styles from "./LifecycleControls.module.css";

const SAFE_ACTIONS: Array<{ key: "initialize" | "launch" | "land" | "start"; label: string }> = [
  { key: "initialize", label: "Initialize" },
  { key: "launch", label: "Launch" },
  { key: "land", label: "Land" },
  { key: "start", label: "Start" },
];

const DESTRUCTIVE_ACTIONS: Array<{ key: "stop" | "shutdown"; label: string }> = [
  { key: "stop", label: "Stop" },
  { key: "shutdown", label: "Shutdown" },
];

interface LifecycleControlsProps {
  state: SatelliteState;
  onAction: (action: "initialize" | "launch" | "land" | "start" | "stop" | "shutdown") => void;
}

export function LifecycleControls({ state, onAction }: LifecycleControlsProps) {
  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Satellite Lifecycle</h3>
      <div className={styles.buttons}>
        <div className={styles.safe}>
          {SAFE_ACTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={styles.btn}
              disabled={!isActionEnabled(state, key)}
              onClick={() => onAction(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.destructiveGroup}>
        <h3 className={styles.title}>Stop / Shutdown</h3>
        <div className={styles.buttons}>
          {DESTRUCTIVE_ACTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`${styles.btn} ${styles.destructive}`}
              disabled={!isActionEnabled(state, key)}
              onClick={() => onAction(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
