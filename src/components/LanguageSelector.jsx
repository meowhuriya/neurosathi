import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';

export const LANGUAGES = [
  { code: 'en', num: 1, label: 'English', nativeName: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'hi', num: 2, label: 'हिन्दी', nativeName: 'Hindi', flag: '🇮🇳', short: 'HI' },
  { code: 'te', num: 3, label: 'తెలుగు', nativeName: 'Telugu', flag: '🇮🇳', short: 'TE' },
  { code: 'ur', num: 4, label: 'اردو', nativeName: 'Urdu', flag: '🇮🇳', short: 'UR' }
];

export function LanguageSelector({ currentLang, onSelectLang, compact = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    onSelectLang(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="touch-target inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Change Language / भाषा बदलें"
      >
        <span className="text-sm" aria-hidden="true">{activeLang.flag}</span>
        <span className="font-bold tracking-wide">{activeLang.short}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-1.5 w-56 sm:w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
          role="listbox"
          aria-label="Available Languages"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3 h-3 text-teal-600" />
              <span>Select Language (1-4)</span>
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors ${
                    isSelected 
                      ? 'bg-teal-50 text-teal-900 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {lang.num}
                    </span>
                    <span className="text-sm">{lang.flag}</span>
                    <div>
                      <span className="text-xs block leading-tight">{lang.label}</span>
                      <span className="text-[10px] text-slate-400 block leading-tight">{lang.nativeName}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-teal-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
