"use client";

import { useState, useEffect } from "react";
import { useSatellites } from "@/context/SatelliteContext";
import { useGlobal } from "@/context/GlobalContext";
import { SystemStatus } from "@/components/shared/SystemStatus";
import { SatelliteList } from "@/components/control/SatelliteList";
import { ControlWorkspace } from "@/components/control/ControlWorkspace";
import { SatelliteConnectionDetailsModal } from "@/components/control/SatelliteConnectionDetailsModal";
import { SatelliteResponseModal } from "@/components/control/SatelliteResponseModal";
import { CustomCommandModal } from "@/components/control/CustomCommandModal";
import type { Satellite, CommandResponse } from "@/lib/types";
import styles from "./control.module.css";

export default function ControlPage() {
  const {
    satellites,
    selectedId,
    setSelectedId,
    transitionSatellite,
    updateSequence,
    getSatelliteEvents,
    sendCommand,
  } = useSatellites();
  const { setSatelliteCount } = useGlobal();

  const [connectionDetailsSatellite, setConnectionDetailsSatellite] = useState<Satellite | null>(null);
  const [responseModal, setResponseModal] = useState<{
    satelliteName: string;
    response: CommandResponse;
  } | null>(null);
  const [customCommandSatellite, setCustomCommandSatellite] = useState<Satellite | null>(null);

  useEffect(() => {
    setSatelliteCount(satellites.length);
  }, [satellites.length, setSatelliteCount]);

  const selected = satellites.find((s) => s.id === selectedId) ?? null;
  const events = selectedId ? getSatelliteEvents(selectedId) : [];

  const handleSendCommand = async (satelliteId: string, command: string) => {
    const res = await sendCommand(satelliteId, command);
    const name = satellites.find((s) => s.id === satelliteId)?.name ?? satelliteId;
    setResponseModal({ satelliteName: name, response: res });
  };

  const handleCustomSubmit = (command: string) => {
    if (!customCommandSatellite) return;
    sendCommand(customCommandSatellite.id, command).then((res) => {
      setResponseModal({
        satelliteName: customCommandSatellite.name,
        response: res,
      });
      setCustomCommandSatellite(null);
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <SystemStatus />
        <SatelliteList
          satellites={satellites}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onOpenConnectionDetails={setConnectionDetailsSatellite}
          onSendCommand={handleSendCommand}
          onRequestCustomCommand={(sat) => setCustomCommandSatellite(sat)}
        />
      </div>
      <div className={styles.right}>
        <ControlWorkspace
          satellite={selected}
          satelliteEvents={events}
          onTransition={transitionSatellite}
          onApplySequence={updateSequence}
          onOpenConnectionDetails={(sat) => setConnectionDetailsSatellite(sat)}
        />
      </div>
      {connectionDetailsSatellite && (
        <SatelliteConnectionDetailsModal
          satellite={connectionDetailsSatellite}
          onClose={() => setConnectionDetailsSatellite(null)}
        />
      )}
      {responseModal && (
        <SatelliteResponseModal
          satelliteName={responseModal.satelliteName}
          response={responseModal.response}
          onClose={() => setResponseModal(null)}
        />
      )}
      {customCommandSatellite && (
        <CustomCommandModal
          satelliteName={customCommandSatellite.name}
          onClose={() => setCustomCommandSatellite(null)}
          onSubmit={handleCustomSubmit}
        />
      )}
    </div>
  );
}
