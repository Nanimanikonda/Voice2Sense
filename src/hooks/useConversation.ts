/**
 * Voice2Sense — Two-Way Conversation Hook
 *
 * Uses the BROWSER'S built-in SpeechRecognition for real-time speech-to-text.
 * Uses the local Python backend for translation (with graceful fallback).
 * Mutex logic: only one person can speak at a time.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { translateText } from "@/services/offlineApi";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  side: "left" | "right";
  spokenText: string;
  translatedText: string;
  timestamp: Date;
}

export interface ConversationSession {
  id: string;
  startTime: Date;
  endTime: Date;
  leftLanguage: string;
  rightLanguage: string;
  messages: ChatMessage[];
}

export interface UseConversationReturn {
  leftLanguage: string;
  rightLanguage: string;
  activeSpeaker: "left" | "right" | null;
  messages: ChatMessage[];
  partialText: string;
  sessions: ConversationSession[];
  setLeftLanguage: (lang: string) => void;
  setRightLanguage: (lang: string) => void;
  startRecording: (side: "left" | "right") => void;
  stopRecording: () => void;
  clearMessages: () => void;
  clearSessions: () => void;
}

// Browser SpeechRecognition language codes
const LANG_CODE_MAP: Record<string, string> = {
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

export function useConversation(): UseConversationReturn {
  const [leftLang, setLeftLang] = useState("te");
  const [rightLang, setRightLang] = useState("en");
  const [activeSpeaker, setActiveSpeaker] = useState<"left" | "right" | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [partialText, setPartialText] = useState("");
  const [sessions, setSessions] = useState<ConversationSession[]>([]);

  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeSpeakerRef = useRef<"left" | "right" | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const leftLangRef = useRef(leftLang);
  const rightLangRef = useRef(rightLang);

  // Keep refs in sync
  useEffect(() => {
    activeSpeakerRef.current = activeSpeaker;
  }, [activeSpeaker]);
  useEffect(() => {
    leftLangRef.current = leftLang;
  }, [leftLang]);
  useEffect(() => {
    rightLangRef.current = rightLang;
  }, [rightLang]);

  const handleTranslation = useCallback(async (
    text: string,
    side: "left" | "right",
    msgId: string
  ) => {
    const sourceLang = side === "left" ? leftLangRef.current : rightLangRef.current;
    const targetLang = side === "left" ? rightLangRef.current : leftLangRef.current;

    try {
      const { translatedText } = await translateText(text, sourceLang, targetLang);
      if (translatedText) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, translatedText } : m
          )
        );
      }
    } catch (err) {
      console.error("Translation failed:", err);
      // Removed the explicit "translation unavailable" text as requested
      // The translated message will simply not appear to save UI space
    }
  }, []);

  const startRecording = useCallback(async (side: "left" | "right") => {
    if (activeSpeakerRef.current !== null) return; // Mutex

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      // Request mic access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // Set the language based on which side is speaking
      const lang = side === "left" ? leftLangRef.current : rightLangRef.current;
      recognition.lang = LANG_CODE_MAP[lang] || "en-US";

      recognition.onstart = () => {
        setActiveSpeaker(side);
        setPartialText("");
        sessionStartRef.current = new Date();
        const langName = lang.toUpperCase();
        toast.success(`Listening in ${langName}...`);
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

        // Show interim text as partial
        if (interimTranscript) {
          setPartialText(interimTranscript);
        }

        // When we get a final transcript, create a chat message
        if (finalTranscript && finalTranscript.trim()) {
          const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

          const msg: ChatMessage = {
            id: msgId,
            side,
            spokenText: finalTranscript.trim(),
            translatedText: "Translating...",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, msg]);
          
          // Kick off translation in the background
          handleTranslation(finalTranscript.trim(), side, msgId);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error !== "aborted" && event.error !== "no-speech") {
          toast.error(`Recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // Auto-restart if still supposed to be recording
        if (activeSpeakerRef.current === side && streamRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already running or stopped intentionally
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error("Failed to start recording:", err);
      toast.error("Microphone access denied");
    }
  }, [handleTranslation]);

  const stopRecording = useCallback(() => {
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setPartialText("");
    setActiveSpeaker(null);
    toast.info("Recording stopped");
  }, []);

  const clearMessages = useCallback(() => {
    // Save current messages as a session before clearing
    if (messages.length > 0) {
      const session: ConversationSession = {
        id: `session-${Date.now()}`,
        startTime: sessionStartRef.current || new Date(),
        endTime: new Date(),
        leftLanguage: leftLang,
        rightLanguage: rightLang,
        messages: [...messages],
      };
      setSessions((prev) => [session, ...prev]);
    }
    setMessages([]);
    setPartialText("");
  }, [messages, leftLang, rightLang]);

  const clearSessions = useCallback(() => {
    setSessions([]);
  }, []);

  return {
    leftLanguage: leftLang,
    rightLanguage: rightLang,
    activeSpeaker,
    messages,
    partialText,
    sessions,
    setLeftLanguage: setLeftLang,
    setRightLanguage: setRightLang,
    startRecording,
    stopRecording,
    clearMessages,
    clearSessions,
  };
}
