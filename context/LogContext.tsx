"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { LogEntry, LogLevel, LogFilters } from "@/lib/types";
import { generateLogEntry } from "@/lib/logGenerator";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
};

const DEFAULT_FILTERS: LogFilters = {
  level: "all",
  senders: new Set(),
  topics: new Set(),
  search: "",
  senderTopicLevels: {},
};

interface LogContextValue {
  entries: LogEntry[];
  filters: LogFilters;
  autoScroll: boolean;
  paused: boolean;
  setFilters: React.Dispatch<React.SetStateAction<LogFilters>>;
  setAutoScroll: (v: boolean) => void;
  setPaused: (v: boolean) => void;
  clearLogs: () => void;
  resetFilters: () => void;
  filteredEntries: LogEntry[];
  messagesPerMinute: number;
}

const LogContext = createContext<LogContextValue | null>(null);

function filterEntries(entries: LogEntry[], filters: LogFilters): LogEntry[] {
  return entries.filter((e) => {
    if (filters.level !== "all" && e.level !== filters.level) return false;
    if (filters.senders.size > 0 && !filters.senders.has(e.sender)) return false;
    if (filters.topics.size > 0 && !filters.topics.has(e.topic)) return false;
    const topicLevel = (filters.senderTopicLevels ?? {})[e.sender]?.[e.topic];
    if (topicLevel !== undefined) {
      if (LEVEL_ORDER[e.level] < LEVEL_ORDER[topicLevel]) return false;
    }
    if (
      filters.search &&
      !e.message.toLowerCase().includes(filters.search.toLowerCase()) &&
      !e.sender.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });
}

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<LogFilters>(DEFAULT_FILTERS);
  const [autoScroll, setAutoScroll] = useState(true);
  const [paused, setPaused] = useState(false);
  const [messagesPerMinute, setMessagesPerMinute] = useState(0);
  const [minuteCount, setMinuteCount] = useState(0);
  const [minuteStart, setMinuteStart] = useState(Date.now());

  const clearLogs = useCallback(() => {
    setEntries([]);
    setMinuteCount(0);
    setMinuteStart(Date.now());
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      level: "all",
      senders: new Set(),
      topics: new Set(),
      search: "",
      senderTopicLevels: {},
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (paused) return;
      const entry = generateLogEntry();
      setEntries((prev) => [...prev.slice(-999), entry]);
      setMinuteCount((c) => c + 1);
    }, 800);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    const t = setInterval(() => {
      const elapsed = (Date.now() - minuteStart) / 60000;
      setMessagesPerMinute(elapsed > 0 ? Math.round(minuteCount / elapsed) : minuteCount);
    }, 5000);
    return () => clearInterval(t);
  }, [minuteCount, minuteStart]);

  const filteredEntries = filterEntries(entries, filters);

  const value: LogContextValue = {
    entries,
    filters,
    autoScroll,
    paused,
    setFilters,
    setAutoScroll,
    setPaused,
    clearLogs,
    resetFilters,
    filteredEntries,
    messagesPerMinute,
  };

  return <LogContext.Provider value={value}>{children}</LogContext.Provider>;
}

export function useLogs() {
  const ctx = useContext(LogContext);
  if (!ctx) throw new Error("useLogs must be used within LogProvider");
  return ctx;
}
