"use client";

import { useState, useRef } from "react";
import type { Satellite } from "@/lib/types";
import { HEARTBEAT_TIMEOUT_MS } from "@/lib/mockData";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SatelliteCardContextMenu } from "@/components/control/SatelliteCardContextMenu";
import styles from "./SatelliteCard.module.css";

interface SatelliteCardProps {
  satellite: Satellite;
  selected: boolean;
  onSelect: () => void;
  onOpenConnectionDetails: () => void;
  onSendCommand: (command: string) => void;
  onRequestCustomCommand: () => void;
}

export function SatelliteCard({
  satellite,
  selected,
  onSelect,
  onOpenConnectionDetails,
  onSendCommand,
  onRequestCustomCommand,
}: SatelliteCardProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const heartbeatStale = Date.now() - satellite.lastHeartbeat > HEARTBEAT_TIMEOUT_MS;
  const idle = satellite.state === "new" || satellite.state === "shutdown";
  const heartbeatClass = heartbeatStale
    ? styles.stale
    : idle
      ? styles.idle
      : "";

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const openMenuAtButton = () => {
    const el = menuButtonRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setContextMenu({ x: rect.left, y: rect.bottom + 2 });
    }
  };

  const handleCommand = (command: string) => {
    setContextMenu(null);
    onSendCommand(command);
  };

  const handleCustom = () => {
    setContextMenu(null);
    onRequestCustomCommand();
  };

  return (
    <>
      <div
        className={`${styles.card} ${selected ? styles.selected : ""}`}
        onClick={onSelect}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onOpenConnectionDetails();
        }}
        onContextMenu={handleContextMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
      >
        <div className={styles.cardHeader}>
          <div className={styles.name}>{satellite.name}</div>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuBtn}
            onClick={(e) => {
              e.stopPropagation();
              openMenuAtButton();
            }}
            aria-label="Commands"
          >
            ⋮
          </button>
        </div>
        <div className={styles.meta}>
          <span>{satellite.type}</span>
          <span className={`${styles.heartbeat} ${heartbeatClass}`} />
          <span className={styles.lives}>Lives: {satellite.lives}</span>
          <StatusBadge state={satellite.state} />
        </div>
        <div className={styles.message}>{satellite.lastMessage}</div>
      </div>
      {contextMenu && (
        <SatelliteCardContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onSelect={handleCommand}
          onCustom={handleCustom}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
