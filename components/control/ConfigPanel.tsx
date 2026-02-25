"use client";

import { useState } from "react";
import styles from "./ConfigPanel.module.css";

interface ConfigPanelProps {
  sequenceNumber: number;
  onApply: (seq: number) => void;
}

export function ConfigPanel({ sequenceNumber, onApply }: ConfigPanelProps) {
  const [value, setValue] = useState(String(sequenceNumber));
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const num = parseInt(value, 10);
  const valid = !Number.isNaN(num) && num >= 0 && num <= 999999;

  const handleApply = () => {
    if (!valid) {
      setFeedback({ type: "error", text: "Enter a number between 0 and 999999" });
      return;
    }
    onApply(num);
    setFeedback({ type: "success", text: "Applied" });
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Configuration</h3>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="seq">
          Sequence number
        </label>
        <input
          id="seq"
          type="text"
          className={`${styles.input} ${!valid && value !== "" ? styles.invalid : ""}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {feedback && (
          <div className={`${styles.feedback} ${styles[feedback.type]}`}>{feedback.text}</div>
        )}
      </div>
      <button
        type="button"
        className={styles.apply}
        disabled={!valid}
        onClick={handleApply}
      >
        Apply
      </button>
    </div>
  );
}
