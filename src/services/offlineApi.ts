/**
 * Voice2Sense — Offline API Client
 * Communicates with the local Python backend at /api
 */

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export interface HealthStatus {
  status: string;
  whisperLoaded: boolean;
  translatorLoaded: boolean;
  modelsLoading: boolean;
}

export interface TranscribeResult {
  text: string;
  language: string;
}

export interface TranslateResult {
  translatedText: string;
}

/**
 * Check if the backend is running and models are loaded.
 */
export async function checkHealth(): Promise<HealthStatus> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error("Backend unreachable");
  return res.json();
}

/**
 * Send an audio blob to the backend for transcription.
 */
export async function transcribeAudio(
  audioBlob: Blob,
  language?: string
): Promise<TranscribeResult> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  if (language) {
    formData.append("language", language);
  }

  const res = await fetch(`${BASE_URL}/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Transcription failed" }));
    throw new Error(err.detail || "Transcription failed");
  }

  return res.json();
}

/**
 * Translate text from one language to another.
 */
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslateResult> {
  const res = await fetch(`${BASE_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, sourceLanguage, targetLanguage }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Translation failed" }));
    throw new Error(err.detail || "Translation failed");
  }

  return res.json();
}
