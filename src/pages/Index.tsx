import { useState, useCallback, useEffect } from "react"; 
import Header from "@/components/voice2sense/Header";
import StatsCards from "@/components/voice2sense/StatsCards";
import LanguageSelector from "@/components/voice2sense/LanguageSelector";
import CaptionDisplay from "@/components/voice2sense/CaptionDisplay";
import ActionControls from "@/components/voice2sense/ActionControls";
import ProductionInfo from "@/components/voice2sense/ProductionInfo";
import Footer from "@/components/voice2sense/Footer";
import SettingsPanel from "@/components/voice2sense/SettingsPanel";
import HistoryPanel, {
  type SessionRecord,
} from "@/components/voice2sense/HistoryPanel";
import { useTranscription } from "@/hooks/useTranscription";
import {
  type CaptionSettings,
  type AudioSettings,
  DEFAULT_CAPTION_SETTINGS,
  DEFAULT_AUDIO_SETTINGS,
} from "@/types/voice2sense";

const Index = () => {
  const [sourceLanguage, setSourceLanguage] = useState("en"); 
  const [targetLanguages, setTargetLanguages] = useState<string[]>(["hi"]);
  const [captionSettings, setCaptionSettings] = useState<CaptionSettings>(DEFAULT_CAPTION_SETTINGS);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  const {
    isConnecting,
    isRecording,
    partialText,
    segments,
    error,
    toggleRecording,
    clearSession,
  } = useTranscription({
    sourceLanguage,
    targetLanguages,
    audioSettings,
  });

  // NEW: Effect to restart transcription when the source language changes
  useEffect(() => {
    if (isRecording) {
      console.log(`Language changed to ${sourceLanguage}. Restarting listener...`);
      toggleRecording(); // Stop current session
      setTimeout(() => {
        toggleRecording(); // Restart session with new native script (e.g., Telugu)
      }, 300);
    }
  }, [sourceLanguage]); 

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      if (segments.length > 0 && sessionStartTime) {
        const session: SessionRecord = {
          id: `session-${Date.now()}`,
          startTime: sessionStartTime,
          endTime: new Date(),
          segments: [...segments],
        };
        setSessions((prev) => [session, ...prev]);
      }
    } else {
      setSessionStartTime(new Date());
      if (!isRecording) clearSession();
    }
    toggleRecording();
  }, [isRecording, toggleRecording, segments, sessionStartTime, clearSession]);

  const handleTargetToggle = useCallback((code: string) => {
    setTargetLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }, []);

  const handleClearHistory = useCallback(() => {
    setSessions([]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* UPDATED: Added sourceLanguage and onSourceChange props here */}
      <Header
        sourceLanguage={sourceLanguage}
        onSourceChange={setSourceLanguage}
        onSettingsClick={() => setSettingsOpen(true)}
        onHistoryClick={() => setHistoryOpen(true)}
      />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          <StatsCards
            segments={segments}
            sessionStartTime={sessionStartTime}
            isRecording={isRecording}
          />

          <div className="info-card">
            <LanguageSelector
              sourceLanguage={sourceLanguage}
              targetLanguages={targetLanguages}
              onSourceChange={setSourceLanguage}
              onTargetToggle={handleTargetToggle}
            />
          </div>

          <CaptionDisplay
            segments={segments}
            partialText={partialText}
            settings={captionSettings}
            showTranslation={targetLanguages.length > 0}
          />

          <ActionControls
            isRecording={isRecording}
            isConnecting={isConnecting}
            error={error}
            segments={segments}
            onToggleRecording={handleToggleRecording}
            onSettingsClick={() => setSettingsOpen(true)}
          />

          <ProductionInfo />
        </div>
      </main>

      <Footer />

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
        onClearHistory={handleClearHistory}
      />
    </div>
  );
};

export default Index;