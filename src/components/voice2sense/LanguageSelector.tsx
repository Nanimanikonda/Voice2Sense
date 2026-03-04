import { INDIAN_LANGUAGES } from "@/types/voice2sense";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  sourceLanguage: string;
  targetLanguages: string[];
  onSourceChange: (code: string) => void;
  onTargetToggle: (code: string) => void;
}

const LanguageSelector = ({
  sourceLanguage,
  targetLanguages,
  onSourceChange,
  onTargetToggle,
}: LanguageSelectorProps) => {
  return (
    <div className="space-y-6"> {/* Increased spacing between sections */}
      
      {/* SECTION 1: SOURCE LANGUAGE (What you are speaking) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">
          Speaking In (Select your language)
        </label>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {INDIAN_LANGUAGES.map((lang) => (
              <button
                key={`source-${lang.code}`}
                onClick={() => onSourceChange(lang.code)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0",
                  sourceLanguage === lang.code
                    ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* SECTION 2: TARGET LANGUAGES (What you want to see translated) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">
          Translate to (Select multiple)
        </label>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-2">
            {INDIAN_LANGUAGES.map((lang) => (
              <button
                key={`target-${lang.code}`}
                onClick={() => onTargetToggle(lang.code)}
                disabled={sourceLanguage === lang.code} // Can't translate to the same language you are speaking
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shrink-0",
                  targetLanguages.includes(lang.code)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  sourceLanguage === lang.code && "opacity-50 cursor-not-allowed"
                )}
                aria-pressed={targetLanguages.includes(lang.code)}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default LanguageSelector;