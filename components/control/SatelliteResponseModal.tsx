"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import type { CommandResponse } from "@/lib/types";
import styles from "./SatelliteResponseModal.module.css";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function PayloadTreeRow({
  name,
  value,
  depth,
}: {
  name: string;
  value: unknown;
  depth: number;
}) {
  const [open, setOpen] = useState(depth < 1);
  if (isPlainObject(value) && Object.keys(value).length > 0) {
    return (
      <div>
        <div className={styles.treeRow}>
          <button
            type="button"
            className={styles.treeToggle}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            {open ? "▼" : "▶"}
          </button>
          <span className={styles.treeKey}>{name}</span>
        </div>
        {open && (
          <div className={styles.treeChildren}>
            {Object.entries(value).map(([k, v]) => (
              <PayloadTreeRow key={k} name={k} value={v} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={styles.treeRow}>
      <span className={styles.treeKey}>{name}:</span>
      <span className={styles.treeValue}>
        {typeof value === "string" ? value : JSON.stringify(value)}
      </span>
    </div>
  );
}

function PayloadTree({ data }: { data: Record<string, unknown> }) {
  return (
    <>
      {Object.entries(data).map(([key, value]) => (
        <PayloadTreeRow key={key} name={key} value={value} depth={0} />
      ))}
    </>
  );
}

interface SatelliteResponseModalProps {
  satelliteName: string;
  response: CommandResponse | null;
  onClose: () => void;
}

export function SatelliteResponseModal({
  satelliteName,
  response,
  onClose,
}: SatelliteResponseModalProps) {
  if (!response) return null;

  const isSuccess = response.status === "SUCCESS";

  return (
    <Modal title={`Satellite Response: ${satelliteName}`} onClose={onClose}>
      <span
        className={`${styles.status} ${
          isSuccess ? styles.statusSuccess : styles.statusError
        }`}
      >
        {response.status}
      </span>
      {Object.keys(response.payload).length > 0 && (
        <div className={styles.payloadSection}>
          <div className={styles.payloadLabel}>Payload</div>
          <div className={styles.tree}>
            <PayloadTree data={response.payload} />
          </div>
        </div>
      )}
    </Modal>
  );
}
