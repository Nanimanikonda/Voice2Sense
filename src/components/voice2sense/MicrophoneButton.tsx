import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicrophoneButtonProps {
  isRecording: boolean;
  isConnecting: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const MicrophoneButton = ({
  isRecording,
  isConnecting,
  onClick,
  disabled,
}: MicrophoneButtonProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onClick}
        disabled={disabled || isConnecting}
        className={cn(
          "mic-button",
          isRecording ? "mic-button-recording" : "mic-button-idle",
          (disabled || isConnecting) && "opacity-50 cursor-not-allowed"
        )}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        aria-pressed={isRecording}
      >
        {isConnecting ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
        ) : isRecording ? (
          <MicOff className="w-8 h-8 text-destructive-foreground" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </button>

      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {isConnecting
            ? "Connecting..."
            : isRecording
            ? "Recording... Tap to stop"
            : "Tap to start captioning"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isRecording
            ? "Speak clearly into your microphone"
            : "Microphone access required"}
        </p>
      </div>
    </div>
  );
};

export default MicrophoneButton;
