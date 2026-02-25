import type { Satellite } from "./types";

export const DEFAULT_LIVES = 3;
export const HEARTBEAT_INTERVAL_MS = 3000;

function sat(
  id: string,
  name: string,
  type: string,
  role: string,
  port: string
): Satellite {
  const now = Date.now();
  return {
    id,
    name,
    type,
    role,
    state: "new",
    lastMessage: "Waiting for initialization",
    lastHeartbeat: now,
    lastCheckTimestamp: now,
    lastResponseStatus: "—",
    sequenceNumber: 0,
    lives: DEFAULT_LIVES,
    connectionUri: `tcp://127.0.0.1:${port}`,
    heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS,
    hostId: `md5-${id}-${Math.random().toString(36).slice(2, 10)}`,
    metadata: { host: "localhost", port },
  };
}

export const INITIAL_SATELLITES: Satellite[] = [
  sat("sat-1", "DAQ-Controller", "Controller", "primary", "9001"),
  sat("sat-2", "Detector-Readout", "Readout", "worker", "9002"),
  sat("sat-3", "Storage-Writer", "Storage", "worker", "9003"),
];

export const HEARTBEAT_TIMEOUT_MS = 8000;
export const RUN_ID_PREFIX = "run-";
