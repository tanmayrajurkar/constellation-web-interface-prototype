"use client";

import { useState } from "react";
import type { LogLevel, LogFilters } from "@/lib/types";
import styles from "./FilterPanel.module.css";

const LOG_LEVELS: (LogLevel | "all")[] = ["all", "debug", "info", "warning", "error"];
const SENDERS = ["DAQ-Controller", "Detector-Readout", "Storage-Writer", "System"];
const TOPICS = ["lifecycle", "data", "config", "heartbeat", "error"];
const PER_TOPIC_NAMES = ["CTRL", "FSM", "LINK", "MNTR"] as const;

function countActiveFilters(f: LogFilters): number {
  let n = 0;
  if (f.level !== "all") n += 1;
  if (f.senders.size > 0) n += f.senders.size;
  if (f.topics.size > 0) n += f.topics.size;
  if (f.search.trim()) n += 1;
  Object.values(f.senderTopicLevels ?? {}).forEach((topics) => {
    n += Object.keys(topics).length;
  });
  return n;
}

function setSenderTopicLevel(
  filters: LogFilters,
  sender: string,
  topic: string,
  level: LogLevel | ""
): LogFilters {
  const next = { ...filters.senderTopicLevels };
  if (!next[sender]) next[sender] = {};
  const senderNext = { ...next[sender] };
  if (level) senderNext[topic] = level as LogLevel;
  else delete senderNext[topic];
  if (Object.keys(senderNext).length === 0) delete next[sender];
  else next[sender] = senderNext;
  return { ...filters, senderTopicLevels: next };
}

interface FilterPanelProps {
  filters: LogFilters;
  onFiltersChange: React.Dispatch<React.SetStateAction<LogFilters>>;
  onReset: () => void;
}

function toggleSender(filters: LogFilters, sender: string): LogFilters {
  const { senders } = filters;
  if (senders.size === 0) {
    return { ...filters, senders: new Set(SENDERS.filter((x) => x !== sender)) };
  }
  const next = new Set(senders);
  if (next.has(sender)) next.delete(sender);
  else next.add(sender);
  return { ...filters, senders: next };
}

function toggleTopic(filters: LogFilters, topic: string): LogFilters {
  const { topics } = filters;
  if (topics.size === 0) {
    return { ...filters, topics: new Set(TOPICS.filter((x) => x !== topic)) };
  }
  const next = new Set(topics);
  if (next.has(topic)) next.delete(topic);
  else next.add(topic);
  return { ...filters, topics: next };
}

export function FilterPanel({ filters, onFiltersChange, onReset }: FilterPanelProps) {
  const [senderOverrideOpen, setSenderOverrideOpen] = useState(false);
  const [expandedSenders, setExpandedSenders] = useState<Set<string>>(new Set());

  const activeCount = countActiveFilters(filters);

  const toggleSenderExpanded = (s: string) => {
    setExpandedSenders((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  return (
    <div className={styles.panel}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Filter &amp; subscription</h2>
        {activeCount > 0 && (
          <span className={styles.filterCount}>{activeCount} active</span>
        )}
      </div>

      <div>
        <label className={styles.label} htmlFor="level">
          Log level
        </label>
        <select
          id="level"
          className={styles.select}
          value={filters.level}
          onChange={(e) =>
            onFiltersChange((prev) => ({ ...prev, level: e.target.value as LogFilters["level"] }))
          }
        >
          {LOG_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={styles.label}>Sender</label>
        <div className={styles.checkboxGroup}>
          {SENDERS.map((s) => {
          const included = filters.senders.size === 0 || filters.senders.has(s);
          return (
            <label
              key={s}
              className={`${styles.checkboxLabel} ${!included ? styles.muted : ""}`}
            >
              <input
                type="checkbox"
                checked={included}
                onChange={() => onFiltersChange((prev) => toggleSender(prev, s))}
              />
              {s}
              {!included && <span className={styles.mutedLabel}>muted</span>}
            </label>
          );
        })}
        </div>
      </div>

      <div>
        <label className={styles.label}>Topic</label>
        <div className={styles.checkboxGroup}>
          {TOPICS.map((t) => (
            <label key={t} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.topics.size === 0 || filters.topics.has(t)}
                onChange={() => onFiltersChange((prev) => toggleTopic(prev, t))}
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={styles.label} htmlFor="search">
          Search
        </label>
        <input
          id="search"
          type="text"
          className={styles.input}
          placeholder="Message or sender..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange((prev) => ({ ...prev, search: e.target.value }))
          }
        />
      </div>

      <button type="button" className={styles.reset} onClick={onReset}>
        Reset filters
      </button>

      <div className={styles.overrideBlock}>
        <button
          type="button"
          className={styles.collapseHeader}
          onClick={() => setSenderOverrideOpen((o) => !o)}
          aria-expanded={senderOverrideOpen}
        >
          {senderOverrideOpen ? "▼" : "▶"} Per-sender / per-topic level
        </button>
        {senderOverrideOpen && (
          <div className={styles.collapseContent}>
            {SENDERS.map((sender) => {
              const expanded = expandedSenders.has(sender);
              const topicLevels = filters.senderTopicLevels[sender] ?? {};
              return (
                <div key={sender} className={styles.perSenderBlock}>
                  <button
                    type="button"
                    className={styles.perSenderHeader}
                    onClick={() => toggleSenderExpanded(sender)}
                    aria-expanded={expanded}
                  >
                    {expanded ? "▼" : "▶"} {sender}
                  </button>
                  {expanded && (
                    <div className={styles.perTopicGrid}>
                      {PER_TOPIC_NAMES.map((topic) => (
                        <label key={topic} className={styles.topicRow}>
                          <span className={styles.topicName}>{topic}</span>
                          <select
                            className={styles.topicSelect}
                            value={topicLevels[topic] ?? ""}
                            onChange={(e) =>
                              onFiltersChange((prev) =>
                                setSenderTopicLevel(
                                  prev,
                                  sender,
                                  topic,
                                  e.target.value as LogLevel | ""
                                )
                              )}
                          >
                            <option value="">– global –</option>
                            {(["debug", "info", "warning", "error"] as LogLevel[]).map((l) => (
                              <option key={l} value={l}>
                                {l}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
