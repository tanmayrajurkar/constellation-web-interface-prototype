"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Satellite, SatelliteState, SatelliteEvent, CommandResponse } from "@/lib/types";
import { INITIAL_SATELLITES, HEARTBEAT_TIMEOUT_MS, DEFAULT_LIVES } from "@/lib/mockData";
import { canTransition } from "@/lib/stateMachine";
import { simulateCommand } from "@/lib/commandSimulator";

const MAX_RECENT_EVENTS = 5;

interface SatelliteContextValue {
  satellites: Satellite[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  transitionSatellite: (id: string, newState: SatelliteState) => void;
  updateSequence: (id: string, seq: number) => void;
  getSatelliteEvents: (id: string) => SatelliteEvent[];
  sendCommand: (id: string, command: string) => Promise<CommandResponse>;
}

const SatelliteContext = createContext<SatelliteContextValue | null>(null);

function cloneSatellites(sats: Satellite[]): Satellite[] {
  return sats.map((s) => ({ ...s }));
}

export function SatelliteProvider({ children }: { children: React.ReactNode }) {
  const [satellites, setSatellites] = useState<Satellite[]>(() =>
    cloneSatellites(INITIAL_SATELLITES)
  );
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_SATELLITES[0]?.id ?? null);
  const [satelliteEvents, setSatelliteEvents] = useState<Record<string, SatelliteEvent[]>>({});

  const addSatelliteEvent = useCallback((id: string, message: string) => {
    const event: SatelliteEvent = { timestamp: Date.now(), message };
    setSatelliteEvents((prev) => {
      const list = [...(prev[id] ?? []), event].slice(-MAX_RECENT_EVENTS);
      return { ...prev, [id]: list };
    });
  }, []);

  const getSatelliteEvents = useCallback((id: string): SatelliteEvent[] => {
    return satelliteEvents[id] ?? [];
  }, [satelliteEvents]);

  const transitionSatellite = useCallback((id: string, newState: SatelliteState) => {
    setSatellites((prev) => {
      const next = cloneSatellites(prev);
      const idx = next.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const sat = next[idx];
      if (!canTransition(sat.state, newState)) return prev;
      const msg = `State: ${newState}`;
      let nextSat = { ...sat, state: newState, lastMessage: msg };
      const recoveringFromShutdownOrError =
        (sat.state === "shutdown" || sat.state === "error") && newState === "initialized";
      if (recoveringFromShutdownOrError) {
        const now = Date.now();
        nextSat = {
          ...nextSat,
          lives: DEFAULT_LIVES,
          lastResponseStatus: "—",
          lastMessage: "Initialized",
          lastHeartbeat: now,
          lastCheckTimestamp: now,
        };
      }
      next[idx] = nextSat;
      addSatelliteEvent(id, nextSat.lastMessage);
      return next;
    });
  }, [addSatelliteEvent]);

  const updateSequence = useCallback((id: string, seq: number) => {
    setSatellites((prev) => {
      const next = cloneSatellites(prev);
      const idx = next.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      next[idx] = { ...next[idx], sequenceNumber: seq };
      addSatelliteEvent(id, `Sequence set to ${seq}`);
      return next;
    });
  }, [addSatelliteEvent]);

  const sendCommand = useCallback(async (id: string, command: string): Promise<CommandResponse> => {
    const sat = satellites.find((s) => s.id === id);
    if (!sat) return { status: "ERROR", payload: { error: "Satellite not found" } };
    await new Promise((r) => setTimeout(r, 300));
    const response = simulateCommand(sat, command);
    const now = Date.now();
    setSatellites((prev) => {
      const next = cloneSatellites(prev);
      const idx = next.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      next[idx] = {
        ...next[idx],
        lastResponseStatus: response.status,
        lastCheckTimestamp: now,
        lastMessage: response.status === "SUCCESS" ? `Command: ${command}` : `Command failed: ${command}`,
      };
      return next;
    });
    addSatelliteEvent(id, `Command: ${command} → ${response.status}`);
    return response;
  }, [satellites, addSatelliteEvent]);

  useEffect(() => {
    const t = setInterval(() => {
      setSatellites((prev) => {
        const next = cloneSatellites(prev);
        const now = Date.now();
        next.forEach((s, i) => {
          if (s.state === "running" && now - s.lastHeartbeat > HEARTBEAT_TIMEOUT_MS) {
            const newLives = Math.max(0, s.lives - 1);
            next[i] = {
              ...s,
              lives: newLives,
              lastCheckTimestamp: now,
              state: newLives === 0 ? "error" : s.state,
              lastMessage: newLives === 0 ? "Heartbeat timeout" : `Heartbeat missed (${newLives} lives)`,
            };
            addSatelliteEvent(s.id, newLives === 0 ? "Heartbeat timeout" : "Heartbeat missed");
          }
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(t);
  }, [addSatelliteEvent]);

  useEffect(() => {
    const t = setInterval(() => {
      setSatellites((prev) => {
        const next = cloneSatellites(prev);
        const live = next.filter((s) => s.state !== "shutdown" && s.state !== "error");
        if (live.length === 0) return next;
        const idx = next.findIndex((s) => s.id === live[Math.floor(Math.random() * live.length)].id);
        next[idx] = { ...next[idx], lastHeartbeat: Date.now() };
        return next;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const value: SatelliteContextValue = {
    satellites,
    selectedId,
    setSelectedId,
    transitionSatellite,
    updateSequence,
    getSatelliteEvents,
    sendCommand,
  };

  return (
    <SatelliteContext.Provider value={value}>{children}</SatelliteContext.Provider>
  );
}

export function useSatellites() {
  const ctx = useContext(SatelliteContext);
  if (!ctx) throw new Error("useSatellites must be used within SatelliteProvider");
  return ctx;
}
