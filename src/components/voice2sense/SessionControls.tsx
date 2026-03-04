import { Download, Trash2, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type TranscriptionSegment } from "@/types/voice2sense";
import { toast } from "sonner";

interface SessionControlsProps {
  segments: TranscriptionSegment[];
  sessionStartTime: Date | null;
  onClearSession: () => void;
}

const SessionControls = ({
  segments,
  sessionStartTime,
  onClearSession,
}: SessionControlsProps) => {
  const formatDuration = (start: Date) => {
    const seconds = Math.floor((Date.now() - start.getTime()) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleExport = () => {
    if (segments.length === 0) {
      toast.error("No captions to export");
      return;
    }

    const content = segments
      .map((seg, index) => {
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

    toast.success("Transcript exported successfully");
  };

  const handleClear = () => {
    if (segments.length === 0) return;
    onClearSession();
    toast.info("Session cleared");
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-4">
        {sessionStartTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(sessionStartTime)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>{segments.length} segments</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          disabled={segments.length === 0}
          className="text-muted-foreground hover:text-foreground"
        >
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={segments.length === 0}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
};

export default SessionControls;
