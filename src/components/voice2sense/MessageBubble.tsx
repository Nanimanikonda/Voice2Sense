import { FC, memo } from "react";
import { Copy, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ChatMessage } from "@/hooks/useConversation";
import { type CaptionSettings } from "@/types/voice2sense";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageBubbleProps {
  message: ChatMessage;
  captionSettings: CaptionSettings;
  isTransliterated?: boolean;
}

const fontSizeClassMap: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

const MessageBubbleComponent: FC<MessageBubbleProps> = ({ message, captionSettings }) => {
  const { spokenText, translatedText, timestamp, side } = message;
  const textSize = fontSizeClassMap[captionSettings.fontSize] || "text-base";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="group flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 mb-4">
      {/* Sender info */}
      {captionSettings.showSpeakerLabels && (
        <div className="flex items-center gap-2 mb-1 px-1">
          <Avatar className="w-5 h-5">
            <AvatarFallback className={cn("text-[10px]", side === "left" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400")}>
              {side === "left" ? "L" : "R"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground font-medium">
            {side === "left" ? "Speaker 1" : "Speaker 2"}
          </span>
          <span className="text-[10px] text-muted-foreground/50 ml-auto">
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      )}

      {/* Main Spoken Bubble */}
      <div className={cn("relative group/bubble chat-bubble-spoken p-3.5 rounded-2xl rounded-tl-sm transition-colors border", captionSettings.highContrast ? "bg-white/10 border-white/20 text-white" : "bg-primary/10 border-primary/20 text-foreground")}>
        <p className={cn("leading-relaxed", textSize)}>{spokenText}</p>
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex bg-background/80 backdrop-blur-sm rounded-md shadow-sm border border-border">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(spokenText)}>
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSpeak(spokenText)}>
            <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Translated Bubble */}
      {translatedText && (
        <div className={cn("relative group/bubble chat-bubble-translated p-3.5 rounded-2xl rounded-bl-sm ml-6 mt-1 transition-colors border", captionSettings.highContrast ? "bg-muted/80 border-border text-white" : "bg-muted/40 border-border/50 text-muted-foreground")}>
          <p className={cn("italic leading-relaxed", fontSizeClassMap[captionSettings.fontSize] ? `text-[calc(1rem*${captionSettings.fontSize === 'xs' ? 0.75 : captionSettings.fontSize === 'sm' ? 0.875 : captionSettings.fontSize === 'md' ? 1 : captionSettings.fontSize === 'lg' ? 1.125 : captionSettings.fontSize === 'xl' ? 1.25 : 1.5}-2px)]` : "text-[14px]")}>
            {translatedText}
          </p>
          
          <div className="absolute top-2 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex bg-background/80 backdrop-blur-sm rounded-md shadow-sm border border-border">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(translatedText)}>
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSpeak(translatedText)}>
              <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const MessageBubble = memo(MessageBubbleComponent);
export default MessageBubble;
