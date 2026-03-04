import { Languages, History, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDIAN_LANGUAGES } from "@/types/voice2sense";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  sourceLanguage: string;
  onSourceChange: (code: string) => void;
  onSettingsClick: () => void;
  onHistoryClick: () => void;
}

const Header = ({ sourceLanguage, onSourceChange, onSettingsClick, onHistoryClick }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/auth");
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Languages className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary">Voice2Sense</h1>
          <p className="text-xs text-muted-foreground">Real-Time Multilingual Closed Captioning</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* SPEAKING IN LABEL */}
        <span className="text-sm font-medium text-muted-foreground mr-1">Speaking In:</span>
        <Select value={sourceLanguage} onValueChange={onSourceChange}>
          <SelectTrigger className="w-[180px] bg-card border-primary/20">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            {/* Removed Auto-detect to ensure the browser uses the correct native script engine */}
            {INDIAN_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={onHistoryClick}
          className="gap-2 ml-4"
        >
          <History className="w-4 h-4" />
          History
        </Button>
        <Button
          variant="outline"
          onClick={onSettingsClick}
          size="icon"
        >
          <Settings className="w-4 h-4" />
        </Button>

        <Button
          onClick={handleLogout}
          className="gap-2 bg-red-600 hover:bg-red-700 text-white border-none"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;