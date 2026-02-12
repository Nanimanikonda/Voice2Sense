import { X, Type, Palette, Volume2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { type CaptionSettings, type AudioSettings } from "@/types/voice2sense";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  captionSettings: CaptionSettings;
  audioSettings: AudioSettings;
  onCaptionSettingsChange: (settings: CaptionSettings) => void;
  onAudioSettingsChange: (settings: AudioSettings) => void;
}

const fontSizeOptions = [
  { value: "xs", label: "Extra Small" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra Large" },
  { value: "2xl", label: "Maximum" },
];

const colorPresets = [
  { name: "High Contrast", fontColor: "#FFFEF0", backgroundColor: "#0A1628" },
  { name: "Warm", fontColor: "#FFF8DC", backgroundColor: "#1A0F0A" },
  { name: "Cool", fontColor: "#E0F7FA", backgroundColor: "#0A1520" },
  { name: "Inverted", fontColor: "#0A1628", backgroundColor: "#FFFEF0" },
];

const SettingsPanel = ({
  open,
  onClose,
  captionSettings,
  audioSettings,
  onCaptionSettingsChange,
  onAudioSettingsChange,
}: SettingsPanelProps) => {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground">Accessibility Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Font Size */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Caption Size</h3>
            </div>
            <Select
              value={captionSettings.fontSize}
              onValueChange={(value) =>
                onCaptionSettingsChange({
                  ...captionSettings,
                  fontSize: value as CaptionSettings["fontSize"],
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Presets */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Color Theme</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    onCaptionSettingsChange({
                      ...captionSettings,
                      fontColor: preset.fontColor,
                      backgroundColor: preset.backgroundColor,
                    })
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    captionSettings.fontColor === preset.fontColor &&
                    captionSettings.backgroundColor === preset.backgroundColor
                      ? "border-primary"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: preset.backgroundColor }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: preset.fontColor }}
                  >
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Display Options</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="speaker-labels" className="text-muted-foreground">
                  Show Speaker Labels
                </Label>
                <Switch
                  id="speaker-labels"
                  checked={captionSettings.showSpeakerLabels}
                  onCheckedChange={(checked) =>
                    onCaptionSettingsChange({
                      ...captionSettings,
                      showSpeakerLabels: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-muted-foreground">
                  High Contrast Mode
                </Label>
                <Switch
                  id="high-contrast"
                  checked={captionSettings.highContrast}
                  onCheckedChange={(checked) =>
                    onCaptionSettingsChange({
                      ...captionSettings,
                      highContrast: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Audio Processing</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="noise-suppression" className="text-muted-foreground">
                  Noise Suppression
                </Label>
                <Switch
                  id="noise-suppression"
                  checked={audioSettings.noiseSuppression}
                  onCheckedChange={(checked) =>
                    onAudioSettingsChange({
                      ...audioSettings,
                      noiseSuppression: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="echo-cancellation" className="text-muted-foreground">
                  Echo Cancellation
                </Label>
                <Switch
                  id="echo-cancellation"
                  checked={audioSettings.echoCancellation}
                  onCheckedChange={(checked) =>
                    onAudioSettingsChange({
                      ...audioSettings,
                      echoCancellation: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-gain" className="text-muted-foreground">
                  Auto Gain Control
                </Label>
                <Switch
                  id="auto-gain"
                  checked={audioSettings.autoGainControl}
                  onCheckedChange={(checked) =>
                    onAudioSettingsChange({
                      ...audioSettings,
                      autoGainControl: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsPanel;
