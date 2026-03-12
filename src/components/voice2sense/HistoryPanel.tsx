import { useState } from "react";
import { Clock, Trash2, Download, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type ConversationSession } from "@/hooks/useConversation";
import { INDIAN_LANGUAGES } from "@/types/voice2sense";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  sessions: ConversationSession[];
  onClearHistory: () => void;
}

const getLangName = (code: string) => {
  const lang = INDIAN_LANGUAGES.find((l) => l.code === code);
  return lang ? lang.name : code.toUpperCase();
};

const HistoryPanel = ({
  open,
  onClose,
  sessions,
  onClearHistory,
}: HistoryPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const formatDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  const getSessionContent = (session: ConversationSession) => {
    const lines = session.messages.map((msg) => {
      const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const side = msg.side === "left" ? getLangName(session.leftLanguage) : getLangName(session.rightLanguage);
      let text = `[${time}] ${side}: ${msg.spokenText}`;
      if (msg.translatedText) {
        text += `\n    → ${msg.translatedText}`;
      }
      return text;
    });

    return `Voice2Sense Session — ${session.startTime.toLocaleString()}\n${getLangName(session.leftLanguage)} ⟷ ${getLangName(session.rightLanguage)}\nDuration: ${formatDuration(session.startTime, session.endTime)}\n${"─".repeat(50)}\n\n${lines.join("\n\n")}`;
  };

  const exportAsTXT = (session: ConversationSession) => {
    const content = getSessionContent(session);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice2sense-${session.startTime.toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("TXT transcript exported");
  };

  const exportAsPDF = (session: ConversationSession) => {
    // Basic browser print/PDF workaround for demo purposes
    // A production app would use jsPDF or a backend service
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to export as PDF");
      return;
    }
    const htmlContent = `
      <html>
        <head>
          <title>Voice2Sense Transcript</title>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.5; color: #333; max-width: 800px; margin: 0 auto; padding: 2rem; }
            .header { border-bottom: 2px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem; }
            .message { margin-bottom: 1.5rem; }
            .meta { color: #666; font-size: 0.875rem; font-weight: bold; margin-bottom: 0.25rem; }
            .translation { color: #2563eb; font-style: italic; margin-top: 0.25rem; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Voice2Sense Session</h2>
            <p><strong>Date:</strong> ${session.startTime.toLocaleString()}</p>
            <p><strong>Languages:</strong> ${getLangName(session.leftLanguage)} ⟷ ${getLangName(session.rightLanguage)}</p>
          </div>
          <div class="content">
            ${session.messages.map(msg => `
              <div class="message">
                <div class="meta">[${msg.timestamp.toLocaleTimeString()}] ${msg.side === "left" ? getLangName(session.leftLanguage) : getLangName(session.rightLanguage)}</div>
                <div class="original">${msg.spokenText}</div>
                ${msg.translatedText ? `<div class="translation">↳ ${msg.translatedText}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    // Use setTimeout to ensure assets are loaded before print dialog
    setTimeout(() => {
      printWindow.print();
      toast.success("Opened print dialog for PDF export");
    }, 250);
  };

  const filteredSessions = sessions.filter(session => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    // Search in language names
    if (getLangName(session.leftLanguage).toLowerCase().includes(query) || 
        getLangName(session.rightLanguage).toLowerCase().includes(query)) {
      return true;
    }
    // Search in messages
    return session.messages.some(msg => 
      msg.spokenText.toLowerCase().includes(query) || 
      (msg.translatedText && msg.translatedText.toLowerCase().includes(query))
    );
  });

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-foreground">Conversation History</SheetTitle>
        </SheetHeader>

        {sessions.length > 0 && (
          <div className="mt-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50 border-border/50"
            />
          </div>
        )}

        <ScrollArea className="flex-1 mt-4 -mx-2 px-2">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No conversations yet. Start a session and it will be saved here.
              </p>
            </div>
          ) : filteredSessions.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No results found for "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div key={session.id} className="info-card space-y-3 p-4 rounded-xl border border-border/50 bg-background/30 transition-colors hover:bg-background/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {getLangName(session.leftLanguage)} ⟷ {getLangName(session.rightLanguage)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {session.startTime.toLocaleString()} •{" "}
                        {formatDuration(session.startTime, session.endTime)} •{" "}
                        {session.messages.length} msg{session.messages.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Download className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => exportAsTXT(session)} className="cursor-pointer">
                          <FileText className="w-4 h-4 mr-2" />
                          Export as TXT
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => exportAsPDF(session)} className="cursor-pointer">
                          <FileText className="w-4 h-4 mr-2" />
                          Export as PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {session.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="text-xs border-l-2 border-primary/30 pl-3 py-1 bg-white/5 rounded-r-md"
                      >
                        <p className="text-foreground/90 leading-tight mb-1">
                          <span className="text-primary/70 font-semibold mr-1">
                            {msg.side === "left" ? getLangName(session.leftLanguage) : getLangName(session.rightLanguage)}:
                          </span>
                          {msg.spokenText}
                        </p>
                        {msg.translatedText && (
                          <p className="text-muted-foreground italic leading-tight">
                            ↳ {msg.translatedText}
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
              className="w-full gap-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
              onClick={() => {
                onClearHistory();
                setSearchQuery("");
                toast.success("History cleared");
              }}
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
