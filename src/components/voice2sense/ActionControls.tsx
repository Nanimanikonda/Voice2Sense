import { Play, Square, MicOff, Download, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type TranscriptionSegment } from "@/types/voice2sense";
import { toast } from "sonner";

interface ActionControlsProps {
  isRecording: boolean;
  isConnecting: boolean;
  error: string | null;
  segments: TranscriptionSegment[];
  onToggleRecording: () => void;
  onSettingsClick: () => void;
}

const ActionControls = ({
  isRecording,
  isConnecting,
  error,
  segments,
  onToggleRecording,
  onSettingsClick,
}: ActionControlsProps) => {
  const handleExport = () => {
    if (segments.length === 0) {
      toast.error("No captions to export");
      return;
    }

    const content = segments
      .map((seg) => {
        const time = seg.timestamp.toLocaleTimeString();
        let text = `[${time}]`;
        if (seg.speaker) text += ` ${seg.speaker}:`;
        text += ` ${seg.text}`;
        if (seg.translatedText) {
          text += `\n    → ${seg.translatedText}`;
        }
        return text;
      })
      .join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice2sense-transcript-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transcript exported");
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Button
        onClick={onToggleRecording}
        disabled={isConnecting}
        className={
          isRecording
            ? "bg-foreground text-background hover:bg-foreground/90 gap-2"
            : "bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        }
      >
        {isConnecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isRecording ? (
          <Square className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        {isConnecting ? "Connecting..." : isRecording ? "Stop Recording" : "Start Recording"}
      </Button>

      {error && (
        <Button variant="outline" className="gap-2 border-destructive text-destructive hover:bg-destructive/5">
          <MicOff className="w-4 h-4" />
          No Mic Access
        </Button>
      )}

      <Button variant="outline" onClick={handleExport} disabled={segments.length === 0} className="gap-2">
        <Download className="w-4 h-4" />
        Export
      </Button>

      <Button variant="outline" onClick={onSettingsClick} className="gap-2">
        <Settings className="w-4 h-4" />
        Settings
      </Button>
    </div>
  );
};

export default ActionControls;
