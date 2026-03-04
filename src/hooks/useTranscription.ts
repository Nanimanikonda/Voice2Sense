// Voice2Sense - Transcription Hook
import { useState, useCallback, useRef } from "react"; // Fixed: Added useCallback here
import { supabase } from "@/integrations/supabase/client";
import {
  type TranscriptionSegment,
  type AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
} from "@/types/voice2sense";
import { toast } from "sonner";

interface UseTranscriptionOptions {
  sourceLanguage: string;
  targetLanguages: string[];
  audioSettings?: AudioSettings;
  onSegmentComplete?: (segment: TranscriptionSegment) => void;
}

// Translate text using the edge function
async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguages: string[]
): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.functions.invoke("translate", {
      body: { text, sourceLanguage, targetLanguages },
    });

    if (error) {
      console.error("Translation error:", error);
      return {};
    }

    return data?.translations || {};
  } catch (err) {
    console.error("Translation failed:", err);
    return {};
  }
}

export const useTranscription = ({
  sourceLanguage,
  targetLanguages,
  audioSettings = DEFAULT_AUDIO_SETTINGS,
  onSegmentComplete,
}: UseTranscriptionOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [partialText, setPartialText] = useState("");
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const targetLanguagesRef = useRef(targetLanguages);
  const sourceLanguageRef = useRef(sourceLanguage);
  targetLanguagesRef.current = targetLanguages;
  sourceLanguageRef.current = sourceLanguage;

  const mediaRecorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: audioSettings.echoCancellation,
          noiseSuppression: audioSettings.noiseSuppression,
          autoGainControl: audioSettings.autoGainControl,
        },
      });

      streamRef.current = stream;

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        throw new Error("Speech recognition not supported.");
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      // Listen for the native script you selected (e.g., 'te-IN' for Telugu)
      recognition.lang = getLanguageCode(sourceLanguage); 

      recognition.onstart = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setIsRecording(true);
        toast.success(`Listening in ${sourceLanguage.toUpperCase()}`);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setPartialText(interimTranscript);

        if (finalTranscript) {
          const segmentId = `seg-${Date.now()}`;
          
          const newSegment: TranscriptionSegment = {
            id: segmentId,
            text: finalTranscript.trim(),
            timestamp: new Date(),
            language: sourceLanguage,
          };

          setSegments((prev) => [...prev, newSegment]);
          setPartialText("");
          
          const targets = targetLanguagesRef.current;
          if (targets.length > 0) {
            translateText(finalTranscript.trim(), sourceLanguage, targets).then((translations) => {
              if (Object.keys(translations).length > 0) {
                setSegments((prev) =>
                  prev.map((seg) =>
                    seg.id === segmentId
                      ? { ...seg, translatedText: Object.values(translations)[0] }
                      : seg
                  )
                );
              }
            });
          }
          onSegmentComplete?.(newSegment);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "aborted") {
          setError(`Recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (isRecording && streamRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already active
          }
        }
      };

      recognition.start();
      mediaRecorderRef.current = recognition;
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError(err instanceof Error ? err.message : "Failed to start recording");
      setIsConnecting(false);
    }
  }, [audioSettings, sourceLanguage, onSegmentComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setIsConnected(false);
    setPartialText("");
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const clearSession = useCallback(() => {
    setSegments([]);
    setPartialText("");
    setError(null);
  }, []);

  return {
    isConnected,
    isConnecting,
    isRecording,
    partialText,
    segments,
    error,
    toggleRecording,
    clearSession,
  };
};

function getLanguageCode(code: string): string {
  const langMap: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN",
    te: "te-IN",
    ta: "ta-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    mr: "mr-IN",
    bn: "bn-IN",
    gu: "gu-IN",
    pa: "pa-IN",
    or: "or-IN",
    as: "as-IN",
  };
  return langMap[code] || "en-US";
}