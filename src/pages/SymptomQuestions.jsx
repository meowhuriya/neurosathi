import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowRight, Check } from 'lucide-react';

const EMOJI_SCALE = [
  { val: 1, emoji: '😟', label: '1 - Poor' },
  { val: 2, emoji: '🙁', label: '2 - Low' },
  { val: 3, emoji: '😐', label: '3 - Moderate' },
  { val: 4, emoji: '🙂', label: '4 - Good' },
  { val: 5, emoji: '😊', label: '5 - Great' },
];

export function SymptomQuestions({ t, onSaveSymptoms }) {
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({
    fatigue: 4,
    balance: 4,
    vision: 4,
    mood: 4
  });

  const questions = [
    { key: 'fatigue', text: t.symptoms.q1, icon: '⚡' },
    { key: 'balance', text: t.symptoms.q2, icon: '🚶' },
    { key: 'vision', text: t.symptoms.q3, icon: '👁️' },
    { key: 'mood', text: t.symptoms.q4, icon: '🧠' },
  ];

  const handleSelect = (key, val) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
  };

  const handleFinish = () => {
    if (onSaveSymptoms) {
      onSaveSymptoms(answers);
    }
    navigate('/results');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <ClipboardList className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.symptoms.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500">{t.symptoms.step} • {t.symptoms.subtitle}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/60 shadow-xs text-xs sm:text-sm text-slate-600">
        <p>{t.symptoms.instructions}</p>
      </div>

      {/* 4 Question Cards (Tap-only, Large targets) */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div 
            key={q.key} 
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">{q.icon}</span>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                {idx + 1}. {q.text}
              </h2>
            </div>

            {/* 1-5 Emoji Scale Buttons */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
              {EMOJI_SCALE.map((opt) => {
                const isSelected = answers[q.key] === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleSelect(q.key, opt.val)}
                    aria-label={`${q.text} rating ${opt.label}`}
                    aria-pressed={isSelected}
                    className={`touch-target flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border-2 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl leading-none">{opt.emoji}</span>
                    <span className={`text-[11px] font-bold mt-1 ${isSelected ? 'text-teal-800' : 'text-slate-600'}`}>
                      {opt.val}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-between text-[11px] text-slate-400 px-1">
              <span>{t.symptoms.scaleLow}</span>
              <span>{t.symptoms.scaleHigh}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Big "See Results" CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleFinish}
          className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-lg font-bold shadow-lg shadow-teal-700/20 flex items-center justify-center gap-3 transition-all"
        >
          <span>{t.symptoms.seeResults}</span>
          <ArrowRight className="w-5 h-5 shrink-0" />
        </button>
      </div>
    </div>
  );
}
