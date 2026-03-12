import { FC } from "react";
import { History, Settings, Languages, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onHistoryClick: () => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}

const Sidebar: FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onHistoryClick, 
  onSettingsClick, 
  onLogoutClick 
}) => {
  return (
    <div 
      className={cn(
        "bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-r border-border h-full transition-all duration-300 flex flex-col z-20",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border min-h-[73px]">
        {isOpen && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Languages className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-primary truncate">Voice2Sense</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className={cn("shrink-0", !isOpen && "mx-auto")}
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </Button>
      </div>

      <nav className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto">
        <SidebarItem 
          icon={<History className="w-5 h-5" />} 
          label="History" 
          isOpen={isOpen} 
          onClick={onHistoryClick} 
        />
        <SidebarItem 
          icon={<Settings className="w-5 h-5" />} 
          label="Settings" 
          isOpen={isOpen} 
          onClick={onSettingsClick} 
        />
      </nav>

      <div className="p-3 border-t border-border">
        <SidebarItem 
          icon={<LogOut className="w-5 h-5 text-red-500" />} 
          label="Logout" 
          isOpen={isOpen} 
          onClick={onLogoutClick}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
        />
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

const SidebarItem = ({ icon, label, isOpen, onClick, className }: SidebarItemProps) => (
  <Button
    variant="ghost"
    className={cn(
      "w-full flex items-center justify-start gap-3 px-3 py-6", 
      !isOpen && "justify-center px-0",
      className
    )}
    onClick={onClick}
    title={!isOpen ? label : undefined}
  >
    {icon}
    {isOpen && <span>{label}</span>}
  </Button>
);

export default Sidebar;
