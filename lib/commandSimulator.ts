import type { Satellite, CommandResponse } from "./types";

function payloadForGetState(sat: Satellite): Record<string, unknown> {
  return { state: sat.state };
}

function payloadForGetStatus(sat: Satellite): Record<string, unknown> {
  return {
    state: sat.state,
    last_message: sat.lastMessage,
    last_heartbeat: new Date(sat.lastHeartbeat).toISOString(),
    lives: sat.lives,
  };
}

function payloadForGetVersion(): Record<string, unknown> {
  return { version: "Constellation v0.7 (Reticulum)" };
}

function payloadForGetRunId(sat: Satellite): Record<string, unknown> {
  return { run_id: `run_${sat.sequenceNumber}` };
}

function payloadForGetCommands(): Record<string, unknown> {
  return {
    commands: [
      "get_state",
      "get_status",
      "get_version",
      "get_run_id",
      "get_commands",
      "get_config",
      "get_name",
      "get_role",
      "initialize",
    ],
  };
}

function payloadForInitialize(sat: Satellite): Record<string, unknown> {
  return {
    _autonomy: { max_heartbeat_interval: 30, role: sat.role.toUpperCase() },
    _data: { interval: sat.heartbeatIntervalMs },
  };
}

export function simulateCommand(sat: Satellite, command: string): CommandResponse {
  const cmd = command.toLowerCase().replace(/-/g, "_");
  let payload: Record<string, unknown> = {};
  let status: CommandResponse["status"] = "SUCCESS";

  switch (cmd) {
    case "get_state":
      payload = payloadForGetState(sat);
      break;
    case "get_status":
      payload = payloadForGetStatus(sat);
      break;
    case "get_version":
      payload = payloadForGetVersion();
      break;
    case "get_run_id":
      payload = payloadForGetRunId(sat);
      break;
    case "get_commands":
      payload = payloadForGetCommands();
      break;
    case "initialize":
      payload = payloadForInitialize(sat);
      break;
    default:
      payload = { command: cmd, message: "Simulated response" };
      if (cmd.startsWith("get_")) status = "SUCCESS";
      break;
  }

  return { status, payload };
}
