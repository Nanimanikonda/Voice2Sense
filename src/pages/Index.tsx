import { useState } from "react";
import Header from "@/components/voice2sense/Header";
import Sidebar from "@/components/voice2sense/Sidebar";
import ConversationPanel from "@/components/voice2sense/ConversationPanel";
import SettingsPanel from "@/components/voice2sense/SettingsPanel";
import HistoryPanel from "@/components/voice2sense/HistoryPanel";
import { useConversation } from "@/hooks/useConversation";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  type CaptionSettings,
  type AudioSettings,
  DEFAULT_CAPTION_SETTINGS,
  DEFAULT_AUDIO_SETTINGS,
} from "@/types/voice2sense";

const Index = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [captionSettings, setCaptionSettings] = useState<CaptionSettings>(DEFAULT_CAPTION_SETTINGS);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);

  const {
    leftLanguage,
    rightLanguage,
    activeSpeaker,
    messages,
    partialText,
    sessions,
    setLeftLanguage,
    setRightLanguage,
    startRecording,
    stopRecording,
    clearMessages,
    clearSessions,
  } = useConversation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/auth");
    }
  };

  return (
    <div className="h-screen w-full flex bg-background overflow-hidden relative">
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onHistoryClick={() => setHistoryOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        onLogoutClick={handleLogout}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onSettingsClick={() => setSettingsOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="conversation-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0">
              {/* Left Panel */}
              <ConversationPanel
                language={leftLanguage}
                onLanguageChange={setLeftLanguage}
                isRecording={activeSpeaker === "left"}
                isDisabled={activeSpeaker === "right"}
                messages={messages}
                partialText={activeSpeaker === "left" ? partialText : ""}
                onStartRecording={() => startRecording("left")}
                onStopRecording={stopRecording}
                onClearConversation={clearMessages}
                captionSettings={captionSettings}
                side="left"
              />

              {/* Right Panel */}
              <ConversationPanel
                language={rightLanguage}
                onLanguageChange={setRightLanguage}
                isRecording={activeSpeaker === "right"}
                isDisabled={activeSpeaker === "left"}
                messages={messages}
                partialText={activeSpeaker === "right" ? partialText : ""}
                onStartRecording={() => startRecording("right")}
                onStopRecording={stopRecording}
                onClearConversation={clearMessages}
                captionSettings={captionSettings}
                side="right"
              />
            </div>
          </div>
        </main>
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        captionSettings={captionSettings}
        audioSettings={audioSettings}
        onCaptionSettingsChange={setCaptionSettings}
        onAudioSettingsChange={setAudioSettings}
      />

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        sessions={sessions}
        onClearHistory={clearSessions}
      />
    </div>
  );
};

export default Index;