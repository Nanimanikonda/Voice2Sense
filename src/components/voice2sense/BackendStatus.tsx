/**
 * Voice2Sense — Backend Status Indicator
 *
 * Shows connection status to the local Python backend.
 */

import { useState, useEffect, useRef } from "react";
import { checkHealth, type HealthStatus } from "@/services/offlineApi";
import { cn } from "@/lib/utils";

const BackendStatus = () => {
  const [status, setStatus] = useState<"connected" | "loading" | "disconnected">("disconnected");
  const [details, setDetails] = useState<HealthStatus | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = async () => {
    try {
      const health = await checkHealth();
      setDetails(health);
      if (health.modelsLoading) {
        setStatus("loading");
      } else {
        setStatus("connected");
      }
    } catch {
      setStatus("disconnected");
      setDetails(null);
    }
  };

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const dotColor =
    status === "connected"
      ? "bg-green-500"
      : status === "loading"
      ? "bg-yellow-500 animate-pulse"
      : "bg-red-500";

  const label =
    status === "connected"
      ? "Connected"
      : status === "loading"
      ? "Loading Models..."
      : "Backend Offline";

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
        status === "connected"
          ? "bg-green-500/10 text-green-600 border-green-500/20"
          : status === "loading"
          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
          : "bg-red-500/10 text-red-500 border-red-500/20"
      )}
      title={
        details
          ? `Whisper: ${details.whisperLoaded ? "✓" : "✗"} | Translator: ${details.translatorLoaded ? "✓" : "✗"}`
          : "Backend not reachable"
      }
    >
      <span className={cn("w-2 h-2 rounded-full", dotColor)} />
      {label}
    </div>
  );
};

export default BackendStatus;
