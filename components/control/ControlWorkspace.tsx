"use client";

import type { Satellite, SatelliteState } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LifecycleControls } from "@/components/control/LifecycleControls";
import { ConfigPanel } from "@/components/control/ConfigPanel";
import { RecentActivityPanel } from "@/components/control/RecentActivityPanel";
import { getLifecycleActionTargetState } from "@/lib/stateMachine";
import styles from "./ControlWorkspace.module.css";

interface ControlWorkspaceProps {
  satellite: Satellite | null;
  satelliteEvents: { timestamp: number; message: string }[];
  onTransition: (id: string, state: SatelliteState) => void;
  onApplySequence: (id: string, seq: number) => void;
  onOpenConnectionDetails: (sat: Satellite) => void;
}

export function ControlWorkspace({
  satellite,
  satelliteEvents,
  onTransition,
  onApplySequence,
  onOpenConnectionDetails,
}: ControlWorkspaceProps) {
  if (!satellite) {
    return (
      <div className={styles.workspace}>
        <p className={styles.placeholder}>Select a satellite from the list.</p>
      </div>
    );
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.details}>
        <div className={styles.detailHeader}>
          <span className={styles.detailName}>{satellite.name}</span>
          <button
            type="button"
            className={styles.expandBtn}
            onClick={() => onOpenConnectionDetails(satellite)}
          >
            More metadata
          </button>
        </div>
        <div className={styles.summary}>
          <div className={styles.summaryRow}>Role: {satellite.role}</div>
          <div className={styles.summaryRow}>
            State: <StatusBadge state={satellite.state} />
          </div>
          <div className={styles.summaryRow}>{satellite.lastMessage}</div>
        </div>
      </div>

      <LifecycleControls
        state={satellite.state}
        onAction={(action) =>
          onTransition(satellite.id, getLifecycleActionTargetState(action))
        }
      />

      <ConfigPanel
        sequenceNumber={satellite.sequenceNumber}
        onApply={(seq) => onApplySequence(satellite.id, seq)}
      />

      <RecentActivityPanel events={satelliteEvents} />
    </div>
  );
}
