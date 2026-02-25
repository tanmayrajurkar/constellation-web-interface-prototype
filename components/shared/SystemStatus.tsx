"use client";

import { useGlobal } from "@/context/GlobalContext";
import { StatusBadge } from "./StatusBadge";
import styles from "./SystemStatus.module.css";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SystemStatus() {
  const { globalState, runId, runDurationSeconds } = useGlobal();

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>System status</h2>
      <div className={styles.row}>
        <span className={styles.label}>State</span>
        <StatusBadge state={globalState} global />
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Run ID</span>
        <span>{runId}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Duration</span>
        <span>{formatDuration(runDurationSeconds)}</span>
      </div>
    </div>
  );
}
