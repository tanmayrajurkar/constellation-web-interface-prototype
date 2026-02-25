"use client";

import type { LogEntry, LogEntryTags } from "@/lib/types";
import { Modal } from "@/components/shared/Modal";
import styles from "./LogMessageDetailsModal.module.css";

function formatTime(ts: number): string {
  return new Date(ts).toISOString().replace("T", " ").slice(0, 23);
}

function TagsSection({ tags }: { tags: LogEntryTags }) {
  const entries = [
    tags.filename != null && ["filename", tags.filename],
    tags.funcname != null && ["funcname", tags.funcname],
    tags.lineno != null && ["lineno", String(tags.lineno)],
    tags.thread != null && ["thread", String(tags.thread)],
  ].filter(Boolean) as [string, string][];
  if (entries.length === 0) return null;
  return (
    <>
      <div className={styles.sectionTitle}>Tags</div>
      <ul className={styles.tagsList}>
        {entries.map(([k, v]) => (
          <li key={k}>
            {k}: {v}
          </li>
        ))}
      </ul>
    </>
  );
}

interface LogMessageDetailsModalProps {
  entry: LogEntry | null;
  onClose: () => void;
}

export function LogMessageDetailsModal({ entry, onClose }: LogMessageDetailsModalProps) {
  if (!entry) return null;

  return (
    <Modal title="Log message details" onClose={onClose}>
      <div className={styles.sectionTitle}>Message</div>
      <div className={styles.grid}>
        <span className={styles.label}>Time</span>
        <span className={styles.value}>{formatTime(entry.timestamp)}</span>
        <span className={styles.label}>Sender</span>
        <span className={styles.value}>{entry.sender}</span>
        <span className={styles.label}>Level</span>
        <span className={styles.value}>
          <span className={`${styles.levelBadge} ${styles[`level${entry.level.charAt(0).toUpperCase()}${entry.level.slice(1)}`]}`}>
            {entry.level}
          </span>
        </span>
        <span className={styles.label}>Topic</span>
        <span className={styles.value}>{entry.topic}</span>
        <span className={styles.label}>Message</span>
        <span className={styles.value}>{entry.message}</span>
      </div>
      {entry.tags && <TagsSection tags={entry.tags} />}
      <div className={styles.sectionTitle}>Full message</div>
      <div className={styles.value} style={{ fontFamily: "monospace", fontSize: 11 }}>
        {entry.message}
      </div>
    </Modal>
  );
}
