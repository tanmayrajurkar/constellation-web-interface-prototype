export type SatelliteState =
  | "new"
  | "initialized"
  | "launched"
  | "running"
  | "stopped"
  | "shutdown"
  | "error";

export type GlobalState =
  | "idle"
  | "new"
  | "initialized"
  | "launched"
  | "running"
  | "stopped"
  | "shutdown"
  | "mixed"
  | "error";

export type LifecycleAction =
  | "initialize"
  | "launch"
  | "land"
  | "start"
  | "stop"
  | "shutdown";

export interface Satellite {
  id: string;
  name: string;
  type: string;
  role: string;
  state: SatelliteState;
  lastMessage: string;
  lastHeartbeat: number;
  lastCheckTimestamp: number;
  lastResponseStatus: string;
  sequenceNumber: number;
  lives: number;
  connectionUri: string;
  heartbeatIntervalMs: number;
  hostId: string;
  metadata: Record<string, string>;
}

export type LogLevel = "debug" | "info" | "warning" | "error";

export interface LogEntryTags {
  filename?: string;
  funcname?: string;
  lineno?: number;
  thread?: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  sender: string;
  topic: string;
  message: string;
  tags?: LogEntryTags;
}

export type CommandStatus = "SUCCESS" | "ERROR";

export interface CommandResponse {
  status: CommandStatus;
  payload: Record<string, unknown>;
}

export interface LogFilters {
  level: LogLevel | "all";
  senders: Set<string>;
  topics: Set<string>;
  search: string;
  senderTopicLevels: Record<string, Record<string, LogLevel>>;
}

export interface SatelliteEvent {
  timestamp: number;
  message: string;
}
