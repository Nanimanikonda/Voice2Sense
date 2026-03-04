// Voice2Sense Type Definitions

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  iso639_3: string;
}

export interface CaptionSettings {
  fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fontColor: string;
  backgroundColor: string;
  highContrast: boolean;
  showSpeakerLabels: boolean;
}

export interface TranscriptionWord {
  text: string;
  start: number;
  end: number;
  speaker?: string;
}

export interface TranscriptionSegment {
  id: string;
  text: string;
  words?: TranscriptionWord[];
  speaker?: string;
  timestamp: Date;
  language: string;
  translatedText?: string;
  translatedLanguage?: string;
}

export interface Session {
  id: string;
  startTime: Date;
  endTime?: Date;
  segments: TranscriptionSegment[];
  sourceLanguage: string;
  targetLanguages: string[];
}

export interface AudioSettings {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

// Supported Indian languages
export const INDIAN_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', iso639_3: 'eng' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', iso639_3: 'hin' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', iso639_3: 'tel' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', iso639_3: 'tam' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', iso639_3: 'kan' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', iso639_3: 'mal' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', iso639_3: 'mar' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', iso639_3: 'ben' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', iso639_3: 'guj' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', iso639_3: 'pan' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', iso639_3: 'ori' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', iso639_3: 'asm' },
];

export const DEFAULT_CAPTION_SETTINGS: CaptionSettings = {
  fontSize: 'lg',
  fontColor: '#FFFEF0',
  backgroundColor: '#0A1628',
  highContrast: true,
  showSpeakerLabels: true,
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};
