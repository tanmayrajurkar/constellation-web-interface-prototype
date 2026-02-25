"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { GlobalState } from "@/lib/types";
import { deriveGlobalState } from "@/lib/globalState";
import { useSatellites } from "@/context/SatelliteContext";

interface GlobalContextValue {
  constellationName: string;
  globalState: GlobalState;
  satelliteCount: number;
  runId: string;
  runDurationSeconds: number;
  connected: boolean;
  setSatelliteCount: (n: number) => void;
  setGlobalState: (s: GlobalState) => void;
  setRunId: (id: string) => void;
  startRun: () => void;
  stopRun: () => void;
}

const GlobalContext = createContext<GlobalContextValue | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const { satellites } = useSatellites();
  const [constellationName] = useState("Prototype Constellation");
  const [globalState, setGlobalState] = useState<GlobalState>("idle");
  const [satelliteCount, setSatelliteCount] = useState(3);
  const [runId, setRunId] = useState("—");
  const [runDurationSeconds, setRunDurationSeconds] = useState(0);
  const [connected] = useState(true);

  const runIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasRunningRef = useRef(false);

  const startRun = useCallback(() => {
    setRunId(`run-${Date.now()}`);
    setRunDurationSeconds(0);
    if (runIntervalRef.current) clearInterval(runIntervalRef.current);
    runIntervalRef.current = setInterval(() => {
      setRunDurationSeconds((s) => s + 1);
    }, 1000);
  }, []);

  const stopRun = useCallback(() => {
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current);
      runIntervalRef.current = null;
    }
    setRunId("—");
    setRunDurationSeconds(0);
  }, []);

  useEffect(() => {
    const derived = deriveGlobalState(satellites);
    setGlobalState(derived);

    if (derived === "running" && !wasRunningRef.current) {
      startRun();
      wasRunningRef.current = true;
    }
    if (derived !== "running" && wasRunningRef.current) {
      stopRun();
      wasRunningRef.current = false;
    }
  }, [satellites, startRun, stopRun]);

  useEffect(() => {
    return () => stopRun();
  }, [stopRun]);

  const value: GlobalContextValue = {
    constellationName,
    globalState,
    satelliteCount,
    runId,
    runDurationSeconds,
    connected,
    setSatelliteCount,
    setGlobalState,
    setRunId,
    startRun,
    stopRun,
  };

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

export function useGlobal() {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used within GlobalProvider");
  return ctx;
}
