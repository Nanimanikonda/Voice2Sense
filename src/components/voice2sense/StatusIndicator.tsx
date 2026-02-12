import { Wifi, WifiOff, Mic, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  isConnected: boolean;
  isRecording: boolean;
  error?: string | null;
}

const StatusIndicator = ({
  isConnected,
  isRecording,
  error,
}: StatusIndicatorProps) => {
  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <span className="text-sm text-destructive">{error}</span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
        <div className="relative">
          <Mic className="w-4 h-4 text-success" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-pulse" />
        </div>
        <span className="text-sm text-success">Live</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        isConnected ? "bg-primary/10" : "bg-muted"
      )}
    >
      {isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Ready</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Offline</span>
        </>
      )}
    </div>
  );
};

export default StatusIndicator;
