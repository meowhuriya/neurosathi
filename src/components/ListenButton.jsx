import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * Returns matching voice for the target language or null if none available on device.
 * Target languages: English (en-IN), Hindi (hi-IN), Telugu (te-IN), Urdu (ur-PK).
 * If no matching voice is available on device, returns null so button is hidden without error.
 */
function findVoice(voices, lang) {
  if (!voices || voices.length === 0) return null;

  const cleanLang = (l) => (l || '').toLowerCase().replace(/_/g, '-');

  if (lang === 'en') {
    // Prefer Indian English (en-IN), fallback to generic English if available
    const enIn = voices.find((v) => cleanLang(v.lang) === 'en-in');
    if (enIn) return enIn;
    return voices.find((v) => cleanLang(v.lang).startsWith('en')) || null;
  }

  if (lang === 'hi') {
    // Prefer Hindi (hi-IN) or any Hindi voice
    const hiIn = voices.find((v) => cleanLang(v.lang) === 'hi-in');
    if (hiIn) return hiIn;
    return voices.find((v) => cleanLang(v.lang).startsWith('hi')) || null;
  }

  if (lang === 'te') {
    // Telugu (te-IN) or any Telugu voice
    const teIn = voices.find((v) => cleanLang(v.lang) === 'te-in');
    if (teIn) return teIn;
    return voices.find((v) => cleanLang(v.lang).startsWith('te')) || null;
  }

  if (lang === 'ur') {
    // Urdu (ur-PK / ur-IN) or any Urdu voice
    const urPk = voices.find((v) => cleanLang(v.lang) === 'ur-pk' || cleanLang(v.lang) === 'ur-in');
    if (urPk) return urPk;
    return voices.find((v) => cleanLang(v.lang).startsWith('ur')) || null;
  }

  return null;
}

const BUTTON_LABELS = {
  en: { listen: 'Listen', stop: 'Stop' },
  hi: { listen: 'सुनें', stop: 'रोकें' },
  te: { listen: 'వినండి', stop: 'ఆపండి' },
  ur: { listen: 'سنیں', stop: 'روکیں' }
};

export function ListenButton({ text, currentLang = 'en', className = '' }) {
  const [voices, setVoices] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available && available.length > 0) {
        setVoices(available);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cancel any ongoing speech when text or language changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [text, currentLang]);

  // Check voice availability
  const matchingVoice = findVoice(voices, currentLang);

  // If no matching voice is available on this device, hide the button cleanly
  if (!matchingVoice || !text) {
    return null;
  }

  const labels = BUTTON_LABELS[currentLang] || BUTTON_LABELS.en;

  const handleToggle = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = matchingVoice;
    utterance.lang = matchingVoice.lang;
    utterance.rate = 0.95; // Steady, accessible cadence for health instructions

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`touch-target inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 active:scale-95 text-teal-800 font-bold text-sm sm:text-base border border-teal-200 transition-all shadow-xs cursor-pointer shrink-0 ${className}`}
      aria-label={isSpeaking ? labels.stop : labels.listen}
      title={isSpeaking ? labels.stop : labels.listen}
    >
      {isSpeaking ? (
        <VolumeX className="w-5 h-5 text-teal-700 shrink-0" />
      ) : (
        <Volume2 className="w-5 h-5 text-teal-600 shrink-0" />
      )}
      <span>{isSpeaking ? labels.stop : labels.listen}</span>
    </button>
  );
}
