"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import type { LogEntry } from "@/lib/types";
import styles from "./LogStream.module.css";

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toISOString().replace("T", " ").slice(0, 23);
}

type SortKey = "time" | "sender" | "level";

interface LogStreamProps {
  entries: LogEntry[];
  autoScroll: boolean;
  paused: boolean;
  onToggleAutoScroll: () => void;
  onTogglePaused: () => void;
  onClear: () => void;
  onLogEntryDoubleClick?: (entry: LogEntry) => void;
}

export function LogStream({
  entries,
  autoScroll,
  paused,
  onToggleAutoScroll,
  onTogglePaused,
  onClear,
  onLogEntryDoubleClick,
}: LogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState<SortKey>("time");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedEntries = useMemo(() => {
    const arr = [...entries];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "time") cmp = a.timestamp - b.timestamp;
      else if (sortBy === "sender") cmp = a.sender.localeCompare(b.sender);
      else if (sortBy === "level") {
        const order = { debug: 0, info: 1, warning: 2, error: 3 };
        cmp = order[a.level] - order[b.level];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [entries, sortBy, sortDir]);

  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries, autoScroll]);

  const cycleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir(key === "time" ? "desc" : "asc");
    }
  };

  const errorCount = entries.filter((e) => e.level === "error").length;
  const warningCount = entries.filter((e) => e.level === "warning").length;

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${autoScroll ? styles.active : ""}`}
          onClick={onToggleAutoScroll}
        >
          Auto-scroll
        </button>
        <button
          type="button"
          className={`${styles.toolbarBtn} ${paused ? styles.active : ""}`}
          onClick={onTogglePaused}
        >
          {paused ? "Resume" : "Pause stream"}
        </button>
        <button type="button" className={styles.toolbarBtn} onClick={onClear}>
          Clear logs
        </button>
      </div>
      <div className={styles.scroll} ref={scrollRef}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th
                className={`${styles.th} ${styles.thTime} ${styles.sortable}`}
                onClick={() => cycleSort("time")}
              >
                Time {sortBy === "time" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className={`${styles.th} ${styles.thLevel}`}>
                <span
                  className={styles.sortable}
                  onClick={() => cycleSort("level")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && cycleSort("level")}
                >
                  Level {sortBy === "level" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </span>
              </th>
              <th
                className={`${styles.th} ${styles.thSender} ${styles.sortable}`}
                onClick={() => cycleSort("sender")}
              >
                Sender {sortBy === "sender" ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className={`${styles.th} ${styles.thTopic}`}>Topic</th>
              <th className={styles.th}>Message</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.td}>
                  No log entries. Stream is active when not paused.
                </td>
              </tr>
            ) : (
              sortedEntries.map((e) => (
                <tr
                  key={e.id}
                  className={styles.tr}
                  onDoubleClick={() => onLogEntryDoubleClick?.(e)}
                >
                  <td className={styles.td}>{formatTime(e.timestamp)}</td>
                  <td className={`${styles.td} ${styles.tdLevel} ${styles[`level${e.level.charAt(0).toUpperCase()}${e.level.slice(1)}`]}`}>
                    {e.level}
                  </td>
                  <td className={styles.td}>{e.sender}</td>
                  <td className={styles.td}>{e.topic}</td>
                  <td className={`${styles.td} ${styles.message}`}>{e.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>
        <span>{errorCount} errors</span>
        <span>{warningCount} warnings</span>
        <span>{entries.length} messages</span>
      </div>
    </div>
  );
}
