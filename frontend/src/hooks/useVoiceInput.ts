import { useRef, useState } from "react";

// Uses the browser-native Web Speech API (free, no server round-trip, no API
// key) — supported in Chrome/Edge, not in Firefox/Safari. See ROADMAP.md for
// the cloud-STT alternative if broader browser support is needed later.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

export const VOICE_LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिन्दी (Hindi)" },
  { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)" },
];

export function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [lang, setLang] = useState(VOICE_LANGUAGES[0].code);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  function start() {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setUnsupported(true);
      return;
    }
    const recognition: SpeechRecognitionLike = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const text = event.results[0]?.[0]?.transcript;
      if (text) onResult(text);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return { listening, unsupported, lang, setLang, start, stop };
}
