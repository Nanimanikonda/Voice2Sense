import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type TranscriptionSegment, type CaptionSettings } from "@/types/voice2sense";
import { cn } from "@/lib/utils";

interface CaptionDisplayProps {
  segments: TranscriptionSegment[];
  partialText: string;
  settings: CaptionSettings;
  showTranslation: boolean;
}

const fontSizeClasses = {
  xs: "caption-xs",
  sm: "caption-sm",
  md: "caption-md",
  lg: "caption-lg",
  xl: "caption-xl",
  "2xl": "caption-2xl",
};

const CaptionDisplay = ({
  segments,
  partialText,
  settings,
  showTranslation,
}: CaptionDisplayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic to keep the latest text in view
  useEffect(() => {
    const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [segments, partialText]);

  const isEmpty = segments.length === 0 && !partialText;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-foreground">Live Captions</h2>
        <p className="text-sm text-muted-foreground">
          Click "Start Recording" to begin capturing speech
        </p>
      </div>

      <div
        className="caption-display min-h-[300px] max-h-[500px] overflow-hidden rounded-xl border border-white/10"
        style={{ backgroundColor: settings.backgroundColor }}
      >
        <ScrollArea className="h-[500px] w-full p-6" ref={scrollRef}>
          <div className="space-y-6">
            {isEmpty ? (
              <div className="flex items-center justify-center h-[250px]">
                <p
                  className={cn(
                    "caption-text text-center opacity-50",
                    fontSizeClasses[settings.fontSize]
                  )}
                  style={{ color: settings.fontColor }}
                >
                  Captions will appear here
                </p>
              </div>
            ) : (
              <>
                {segments.map((segment) => (
                  <div key={segment.id} className="space-y-2 border-l-2 border-primary/20 pl-4 py-1">
                    {settings.showSpeakerLabels && segment.speaker && (
                      <span className="text-xs font-medium text-primary uppercase tracking-wider">
                        {segment.speaker}
                      </span>
                    )}
                    
                    {/* PRIMARY TEXT: Now showing Translated Text (Telugu) if available */}
                    <p
                      className={cn("caption-text leading-relaxed", fontSizeClasses[settings.fontSize])}
                      style={{ color: settings.fontColor }}
                    >
                      {showTranslation && segment.translatedText ? segment.translatedText : segment.text}
                    </p>

                    {/* SECONDARY TEXT: Showing original English in smaller font if translated */}
                    {showTranslation && segment.translatedText && (
                      <p
                        className={cn(
                          "caption-text opacity-60 italic",
                          fontSizeClasses[
                            settings.fontSize === "2xl" ? "lg" : 
                            settings.fontSize === "xl" ? "md" : 
                            settings.fontSize === "lg" ? "sm" : "xs"
                          ]
                        )}
                        style={{ color: settings.fontColor }}
                      >
                        Original: {segment.text}
                      </p>
                    )}
                  </div>
                ))}

                {partialText && (
                  <div className="border-l-2 border-primary/10 pl-4 py-1">
                    <p
                      className={cn("caption-text opacity-60", fontSizeClasses[settings.fontSize])}
                      style={{ color: settings.fontColor }}
                    >
                      {partialText}
                      <span className="inline-block w-1.5 h-[1em] bg-primary/70 ml-2 animate-pulse rounded-full" />
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CaptionDisplay;