import { useRef, useEffect } from "react";
import { Mic, Square, Download, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { INDIAN_LANGUAGES, type CaptionSettings } from "@/types/voice2sense";
import { cn } from "@/lib/utils";
import { type ChatMessage } from "@/hooks/useConversation";
import MessageBubble from "./MessageBubble";
import { toast } from "sonner";

interface ConversationPanelProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  isRecording: boolean;
  isDisabled: boolean;
  messages: ChatMessage[];
  partialText: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClearConversation: () => void;
  captionSettings: CaptionSettings;
  side: "left" | "right";
}

const ConversationPanel = ({
  language,
  onLanguageChange,
  isRecording,
  isDisabled,
  messages,
  partialText,
  onStartRecording,
  onStopRecording,
  onClearConversation,
  captionSettings,
  side,
}: ConversationPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, partialText]);

  // Filter messages for this panel
  const panelMessages = messages.filter((m) => m.side === side);

  const handleDownloadTranscript = () => {
    if (panelMessages.length === 0) {
      toast.error("No conversation to download.");
      return;
    }
    const textContent = panelMessages
      .map((m) => `[${m.timestamp.toLocaleTimeString()}] ${m.spokenText}\nTranslation: ${m.translatedText || "N/A"}`)
      .join("\n\n");
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voice2sense-transcript-${side}-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transcript downloaded successfully");
  };

  return (
    <div
      className={cn(
        "conversation-panel flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm",
        isRecording
          ? "border-primary/60 bg-primary/5 shadow-lg shadow-primary/10 panel-speaking"
          : isDisabled
          ? "border-border/50 bg-muted/30 opacity-75 panel-waiting"
          : "border-border bg-card/60 backdrop-blur-sm"
      )}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-3 or p-4 border-b border-border/50 bg-background/50">
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={onLanguageChange} disabled={isRecording}>
            <SelectTrigger className="w-[180px] bg-background border-border h-9 shadow-sm">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {isRecording && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Recording
            </span>
          )}
          {isDisabled && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
              Waiting
            </span>
          )}

          <div className="flex border-l pl-2 border-border gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={handleDownloadTranscript} title="Download Transcript">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={onClearConversation} title="Clear Conversation">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat area — navy blue background */}
      <div className="chat-area flex-1 min-h-0 bg-[#0d1526] relative overflow-hidden" ref={scrollRef}>
        <ScrollArea className="h-full w-full p-6">
          <div className="max-w-3xl mx-auto flex flex-col justify-end min-h-full">
            {panelMessages.length === 0 && !partialText ? (
              <div className="flex-1 flex flex-col items-center justify-center h-full opacity-60 m-auto pb-10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Mic className="w-8 h-8 text-primary/50" />
                </div>
                <h3 className="text-lg font-medium text-white/50 mb-1">
                  Ready to translate
                </h3>
                <p className="text-sm text-white/30 text-center max-w-xs">
                  {isRecording ? "Listening for speech..." : "Press Start Recording and speak clearly into your microphone."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {panelMessages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} captionSettings={captionSettings} />
                ))}

                {/* Partial / listening indicator */}
                {isRecording && partialText && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse transition-opacity">
                    <p className="text-[15px] text-white/60">
                      {partialText}
                      {captionSettings.liveCaptionAnimation && (
                        <span className="inline-block w-1.5 h-4 bg-primary/70 ml-1 rounded-full animate-bounce" />
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom Control Bar */}
      <div className="p-4 bg-background/50 border-t border-border/50 flex items-center justify-between md:justify-center relative">
        {/* Waveform Animation Placeholder (Left Side) */}
        {isRecording && (
          <div className="absolute left-6 hidden md:flex items-center gap-1 h-8 opacity-70">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-red-500 rounded-full animate-pulse" 
                style={{ 
                  height: `${Math.max(20, Math.random() * 100)}%`,
                  animationDelay: `${i * 0.1}s` 
                }} 
              />
            ))}
          </div>
        )}

        {isRecording ? (
          <Button
            onClick={onStopRecording}
            className="gap-2 bg-red-500 hover:bg-red-600 text-white min-w-[200px] shadow-lg shadow-red-500/20"
            size="lg"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop Recording
          </Button>
        ) : (
          <Button
            onClick={onStartRecording}
            disabled={isDisabled}
            className={cn(
              "gap-2 min-w-[200px] shadow-lg shadow-primary/20",
              isDisabled
                ? "opacity-50 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            size="lg"
          >
            <Mic className="w-4 h-4" />
            Start Recording
          </Button>
        )}
        
        {/* Settings Placeholder (Right Side) */}
        <div className="absolute right-6 hidden md:flex">
           <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground rounded-full">
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationPanel;
