"use client";

import { useEffect } from "react";
import styles from "./SatelliteCardContextMenu.module.css";

const COMMANDS = [
  "get_state",
  "get_status",
  "get_version",
  "get_run_id",
  "get_commands",
  "initialize",
] as const;

interface SatelliteCardContextMenuProps {
  x: number;
  y: number;
  onSelect: (command: string) => void;
  onCustom: () => void;
  onClose: () => void;
}

export function SatelliteCardContextMenu({
  x,
  y,
  onSelect,
  onCustom,
  onClose,
}: SatelliteCardContextMenuProps) {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className={styles.menu}
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      role="menu"
    >
      {COMMANDS.map((cmd) => (
        <button
          key={cmd}
          type="button"
          className={styles.menuItem}
          role="menuitem"
          onClick={() => onSelect(cmd)}
        >
          {cmd}
        </button>
      ))}
      <button
        type="button"
        className={`${styles.menuItem} ${styles.custom}`}
        role="menuitem"
        onClick={onCustom}
      >
        Custom…
      </button>
    </div>
  );
}
