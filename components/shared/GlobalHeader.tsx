"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGlobal } from "@/context/GlobalContext";
import { useLogs } from "@/context/LogContext";
import { StatusBadge } from "./StatusBadge";
import styles from "./GlobalHeader.module.css";

const WARNING_THRESHOLD = 5;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function GlobalHeader() {
  const pathname = usePathname();
  const {
    constellationName,
    globalState,
    satelliteCount,
    runId,
    runDurationSeconds,
    connected,
  } = useGlobal();
  const { entries } = useLogs();

  const errorCount = entries.filter((e) => e.level === "error").length;
  const warningCount = entries.filter((e) => e.level === "warning").length;
  const showWarningBadge = warningCount > WARNING_THRESHOLD;

  return (
    <header className={styles.header}>
      <span className={styles.name}>{constellationName}</span>
      <div className={styles.stateBlock}>
        <span className={styles.stateLabel}>State</span>
        <StatusBadge state={globalState} global />
      </div>
      <span className={styles.stateLabel}>Satellites: {satelliteCount}</span>
      <span className={styles.stateLabel}>Run ID: {runId}</span>
      <span className={styles.stateLabel}>Duration: {formatDuration(runDurationSeconds)}</span>
      {errorCount > 0 && (
        <span className={styles.severityBadge} data-severity="error">
          {errorCount} error{errorCount !== 1 ? "s" : ""}
        </span>
      )}
      {showWarningBadge && (
        <span className={styles.severityBadge} data-severity="warning">
          {warningCount} warnings
        </span>
      )}
      <div className={styles.connection}>
        <span className={`${styles.dot} ${connected ? "" : styles.disconnected}`} />
        {connected ? "Connected" : "Disconnected"}
      </div>
      <nav className={styles.nav}>
        <Link
          href="/control"
          className={`${styles.navLink} ${pathname === "/control" ? styles.active : ""}`}
        >
          Control Center
        </Link>
        <Link
          href="/observatory"
          className={`${styles.navLink} ${pathname === "/observatory" ? styles.active : ""}`}
        >
          Observatory
        </Link>
      </nav>
    </header>
  );
}
