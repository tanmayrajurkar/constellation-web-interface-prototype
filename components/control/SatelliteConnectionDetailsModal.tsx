"use client";

import type { Satellite } from "@/lib/types";
import { Modal } from "@/components/shared/Modal";
import styles from "./SatelliteConnectionDetailsModal.module.css";

const AVAILABLE_COMMANDS = [
  "get_state",
  "get_status",
  "get_version",
  "get_run_id",
  "get_commands",
  "get_config",
  "get_name",
  "get_role",
  "initialize",
];

function formatTs(ts: number): string {
  return new Date(ts).toISOString().replace("T", " ").slice(0, 23);
}

interface SatelliteConnectionDetailsModalProps {
  satellite: Satellite | null;
  onClose: () => void;
}

export function SatelliteConnectionDetailsModal({
  satellite,
  onClose,
}: SatelliteConnectionDetailsModalProps) {
  if (!satellite) return null;

  return (
    <Modal title={`Connection details: ${satellite.name}`} onClose={onClose}>
      <div className={styles.sectionTitle}>Connection</div>
      <div className={styles.grid}>
        <span className={styles.label}>Connection URI</span>
        <span className={styles.value}>{satellite.connectionUri}</span>
        <span className={styles.label}>Heartbeat interval</span>
        <span className={styles.value}>{satellite.heartbeatIntervalMs}ms</span>
        <span className={styles.label}>Last heartbeat</span>
        <span className={styles.value}>{formatTs(satellite.lastHeartbeat)}</span>
        <span className={styles.label}>Last check</span>
        <span className={styles.value}>{formatTs(satellite.lastCheckTimestamp)}</span>
      </div>

      <div className={styles.sectionTitle}>Status</div>
      <div className={styles.grid}>
        <span className={styles.label}>Last message</span>
        <span className={styles.value}>{satellite.lastMessage}</span>
        <span className={styles.label}>Last response</span>
        <span className={styles.value}>{satellite.lastResponseStatus}</span>
        <span className={styles.label}>Lives</span>
        <span className={styles.value}>{satellite.lives}</span>
        <span className={styles.label}>Host ID</span>
        <span className={styles.value}>{satellite.hostId}</span>
      </div>

      <div className={styles.sectionTitle}>Satellite</div>
      <div className={styles.grid}>
        <span className={styles.label}>Role</span>
        <span className={styles.value}>{satellite.role}</span>
        <span className={styles.label}>Type</span>
        <span className={styles.value}>{satellite.type}</span>
      </div>

      <div className={styles.sectionTitle}>Available commands</div>
      <ul className={styles.commandList}>
        {AVAILABLE_COMMANDS.map((cmd) => (
          <li key={cmd}>{cmd}</li>
        ))}
      </ul>
    </Modal>
  );
}
