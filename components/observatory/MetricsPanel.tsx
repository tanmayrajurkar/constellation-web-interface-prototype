"use client";

import type { LogEntry } from "@/lib/types";
import styles from "./MetricsPanel.module.css";

interface MetricsPanelProps {
  entries: LogEntry[];
  messagesPerMinute: number;
  paused: boolean;
}

export function MetricsPanel({ entries, messagesPerMinute, paused }: MetricsPanelProps) {
  const total = entries.length;
  const errors = entries.filter((e) => e.level === "error").length;
  const warnings = entries.filter((e) => e.level === "warning").length;

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Quick metrics</h2>
      <div className={styles.metric}>
        <span className={styles.metricLabel}>Total messages</span>
        <span className={styles.metricValue}>{total}</span>
      </div>
      <div className={styles.metric}>
        <span className={styles.metricLabel}>Errors</span>
        <span className={`${styles.metricValue} ${errors ? styles.error : ""}`}>{errors}</span>
      </div>
      <div className={styles.metric}>
        <span className={styles.metricLabel}>Warnings</span>
        <span className={`${styles.metricValue} ${warnings ? styles.warning : ""}`}>{warnings}</span>
      </div>
      <div className={styles.metric}>
        <span className={styles.metricLabel}>Msg/min</span>
        <span className={styles.metricValue}>{messagesPerMinute}</span>
      </div>
      <div className={styles.indicator}>
        <span className={styles.dot} />
        {paused ? "Paused" : "Live"}
      </div>
    </div>
  );
}
