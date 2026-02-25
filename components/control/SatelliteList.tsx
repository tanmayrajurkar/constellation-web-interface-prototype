"use client";

import type { Satellite } from "@/lib/types";
import { SatelliteCard } from "@/components/control/SatelliteCard";
import styles from "./SatelliteList.module.css";

interface SatelliteListProps {
  satellites: Satellite[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenConnectionDetails: (sat: Satellite) => void;
  onSendCommand: (satelliteId: string, command: string) => void;
  onRequestCustomCommand: (sat: Satellite) => void;
}

export function SatelliteList({
  satellites,
  selectedId,
  onSelect,
  onOpenConnectionDetails,
  onSendCommand,
  onRequestCustomCommand,
}: SatelliteListProps) {
  return (
    <div className={styles.list}>
      <h2 className={styles.title}>Satellites</h2>
      {satellites.map((sat) => (
        <SatelliteCard
          key={sat.id}
          satellite={sat}
          selected={sat.id === selectedId}
          onSelect={() => onSelect(sat.id)}
          onOpenConnectionDetails={() => onOpenConnectionDetails(sat)}
          onSendCommand={(cmd) => onSendCommand(sat.id, cmd)}
          onRequestCustomCommand={() => onRequestCustomCommand(sat)}
        />
      ))}
    </div>
  );
}
