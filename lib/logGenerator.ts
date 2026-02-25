import type { LogEntry, LogLevel } from "./types";

const SENDERS = ["DAQ-Controller", "Detector-Readout", "Storage-Writer", "System"];
const TOPICS = ["lifecycle", "data", "config", "heartbeat", "error"];
export const SUBSCRIPTION_TOPICS = ["CTRL", "FSM", "LINK", "MNTR"] as const;
const OBSERVATORY_TOPICS = [...SUBSCRIPTION_TOPICS];
const MESSAGES: Record<LogLevel, string[]> = {
  debug: ["Heartbeat received", "Config applied", "Buffer flushed", "Sequence updated"],
  info: ["State transition: new -> initialized", "Run started", "Run stopped", "Satellite connected"],
  warning: ["High memory usage", "Retry attempt 2/3", "Slow response from Storage-Writer"],
  error: ["Connection timeout", "Invalid sequence", "Disk full", "Heartbeat missed"],
};

let logId = 0;

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedLevel(): LogLevel {
  const r = Math.random();
  if (r < 0.6) return "info";
  if (r < 0.85) return "debug";
  if (r < 0.95) return "warning";
  return "error";
}

const FILES = ["constellation/satellite/FSM.cpp", "constellation/ctrl/Controller.cpp"];
const FUNCS = ["call_satellite_function", "handle_transition", "process_message"];

export function generateLogEntry(): LogEntry {
  logId += 1;
  const level = weightedLevel();
  const topic = randomChoice([...TOPICS, ...OBSERVATORY_TOPICS]);
  const message = randomChoice(MESSAGES[level]);
  return {
    id: `log-${logId}`,
    timestamp: Date.now(),
    level,
    sender: randomChoice(SENDERS),
    topic,
    message,
    tags:
      level === "error" || Math.random() < 0.3
        ? {
            filename: randomChoice(FILES),
            funcname: randomChoice(FUNCS),
            lineno: 300 + Math.floor(Math.random() * 200),
            thread: 60000 + Math.floor(Math.random() * 10000),
          }
        : undefined,
  };
}
