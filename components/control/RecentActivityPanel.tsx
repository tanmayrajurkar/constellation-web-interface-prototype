"use client";

import type { SatelliteEvent } from "@/lib/types";
import styles from "./RecentActivityPanel.module.css";

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

interface RecentActivityPanelProps {
  events: SatelliteEvent[];
}

export function RecentActivityPanel({ events }: RecentActivityPanelProps) {
  const list = events.slice(-5).reverse();

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Recent activity</h3>
      <div className={styles.scroll}>
        {list.length === 0 ? (
          <div className={styles.empty}>No recent events</div>
        ) : (
          <ul className={styles.list}>
            {list.map((e, i) => (
              <li key={`${e.timestamp}-${i}`} className={styles.item}>
                <span className={styles.time}>{formatTime(e.timestamp)}</span>
                <span className={styles.msg}>{e.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
