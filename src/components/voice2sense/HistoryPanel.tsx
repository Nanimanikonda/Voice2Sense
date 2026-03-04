import { Clock, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type TranscriptionSegment } from "@/types/voice2sense";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SessionRecord {
  id: string;
  startTime: Date;
  endTime: Date;
  segments: TranscriptionSegment[];
}

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  sessions: SessionRecord[];
  onClearHistory: () => void;
}

const HistoryPanel = ({
  open,
  onClose,
  sessions,
  onClearHistory,
}: HistoryPanelProps) => {
  const formatDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-foreground">Session History</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 mt-4 -mx-2 px-2">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No sessions yet. Start recording to create your first session.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="info-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {session.startTime.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.startTime.toLocaleTimeString()} •{" "}
                        {formatDuration(session.startTime, session.endTime)} •{" "}
                        {session.segments.length} caption
                        {session.segments.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {session.segments.map((seg) => (
                      <div
                        key={seg.id}
                        className="text-xs border-l-2 border-primary/30 pl-3 py-1"
                      >
                        <p className="text-foreground">{seg.text}</p>
                        {seg.translatedText && (
                          <p className="text-primary mt-0.5 italic">
                            → {seg.translatedText}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {sessions.length > 0 && (
          <div className="pt-4 border-t border-border mt-4">
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive"
              onClick={onClearHistory}
            >
              <Trash2 className="w-4 h-4" />
              Clear All History
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default HistoryPanel;
