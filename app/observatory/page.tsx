"use client";

import { useState } from "react";
import { useLogs } from "@/context/LogContext";
import { FilterPanel } from "@/components/observatory/FilterPanel";
import { LogStream } from "@/components/observatory/LogStream";
import { LogMessageDetailsModal } from "@/components/observatory/LogMessageDetailsModal";
import { MetricsPanel } from "@/components/observatory/MetricsPanel";
import type { LogEntry } from "@/lib/types";
import styles from "./observatory.module.css";

export default function ObservatoryPage() {
  const {
    filteredEntries,
    filters,
    setFilters,
    autoScroll,
    setAutoScroll,
    paused,
    setPaused,
    clearLogs,
    resetFilters,
    messagesPerMinute,
    entries,
  } = useLogs();

  const [logDetailsEntry, setLogDetailsEntry] = useState<LogEntry | null>(null);

  return (
    <div className={styles.page}>
      <aside className={styles.left}>
        <FilterPanel filters={filters} onFiltersChange={setFilters} onReset={resetFilters} />
      </aside>
      <div className={styles.center}>
        <LogStream
          entries={filteredEntries}
          autoScroll={autoScroll}
          paused={paused}
          onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
          onTogglePaused={() => setPaused(!paused)}
          onClear={clearLogs}
          onLogEntryDoubleClick={(entry) => setLogDetailsEntry(entry)}
        />
      </div>
      <aside className={styles.right}>
        <MetricsPanel
          entries={entries}
          messagesPerMinute={messagesPerMinute}
          paused={paused}
        />
      </aside>
      {logDetailsEntry && (
        <LogMessageDetailsModal
          entry={logDetailsEntry}
          onClose={() => setLogDetailsEntry(null)}
        />
      )}
    </div>
  );
}
