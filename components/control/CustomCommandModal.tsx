"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import styles from "./CustomCommandModal.module.css";

interface CustomCommandModalProps {
  satelliteName: string;
  onClose: () => void;
  onSubmit: (command: string) => void;
}

export function CustomCommandModal({
  satelliteName,
  onClose,
  onSubmit,
}: CustomCommandModalProps) {
  const [command, setCommand] = useState("");

  const handleSubmit = () => {
    const trimmed = command.trim();
    if (trimmed) {
      onSubmit(trimmed);
      onClose();
    }
  };

  return (
    <Modal title={`Custom command: ${satelliteName}`} onClose={onClose}>
      <label className={styles.label} htmlFor="custom-cmd">
        Command name
      </label>
      <input
        id="custom-cmd"
        type="text"
        className={styles.input}
        placeholder="e.g. get_config"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={styles.submit}
          onClick={handleSubmit}
          disabled={!command.trim()}
        >
          Send
        </button>
      </div>
    </Modal>
  );
}
