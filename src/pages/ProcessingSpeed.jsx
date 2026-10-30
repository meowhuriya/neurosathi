import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, ArrowRight, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { ListenButton } from '../components/ListenButton';

// CLINICAL NOTE: Symbol-digit modalities test (SDMT) is standard in MS monitoring. This is a simplified, non-validated adaptation.

const SYMBOLS_MAP = [
  { symbol: '★', number: 1, label: 'Star' },
  { symbol: '●', number: 2, label: 'Circle' },
  { symbol: '▲', number: 3, label: 'Triangle' },
  { symbol: '■', number: 4, label: 'Square' }
];

export function ProcessingSpeed({ t, currentLang = 'en', activePatient, onSaveProcessing }) {
  const navigate = useNavigate();
  const examiner = typeof window !== 'undefined' ? localStorage.getItem('neurosathi_examiner') || 'asha' : 'asha';

  const getExaminerActionText = () => {
    const name = activePatient?.firstName || "Lakshmi";
    switch (examiner) {
      case 'clinic':
        return `Clinic nurse or rural doctor checks ${name} at the health center`;
      case 'caregiver':
        return `Family member or caregiver checks ${name} at home`;
      case 'patient':
        return `Patient checks herself at home`;
      case 'asha':
      default:
        return `ASHA worker checks ${name} at her home visit`;
    }
  };

  const [gameState, setGameState] = useState('ready'); // 'ready' | 'active' | 'completed'
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const lastPromptTime = useRef(Date.now());
  const timerRef = useRef(null);

  const startTest = () => {
    setCorrectCount(0);
    setWrongCount(0);
    setReactionTimes([]);
    setTimeLeft(30);
    setGameState('active');
    setCurrentSymbolIndex(Math.floor(Math.random() * SYMBOLS_MAP.length));
    lastPromptTime.current = Date.now();
  };

  useEffect(() => {
    if (gameState === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameState('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const handleChoice = (selectedNumber) => {
    if (gameState !== 'active') return;

    const reactionTime = Date.now() - lastPromptTime.current;
    setReactionTimes((prev) => [...prev, reactionTime]);

    const targetNumber = SYMBOLS_MAP[currentSymbolIndex].number;
    if (selectedNumber === targetNumber) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setWrongCount((prev) => prev + 1);
    }

    // Pick next random symbol (try not to repeat immediately)
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * SYMBOLS_MAP.length);
    } while (nextIdx === currentSymbolIndex && SYMBOLS_MAP.length > 1);

    setCurrentSymbolIndex(nextIdx);
    lastPromptTime.current = Date.now();
  };

  const avgReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const handleProceed = () => {
    if (onSaveProcessing) {
      onSaveProcessing({
        correct: correctCount,
        wrong: wrongCount,
        avgReactionMs: avgReactionTime
      });
    }
    navigate('/results');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">1 Check: Reaction Time Test</h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">{getExaminerActionText()}</p>
        </div>
      </div>

      {/* Main Assessment Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-xs text-center space-y-5">
        {/* Instructions with Listen button */}
        <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-left">
          <p className="text-sm sm:text-base text-slate-700 flex-1 leading-relaxed">
            {t.processing.instructions}
          </p>
          <ListenButton
            text={t.processing.instructions}
            currentLang={currentLang}
          />
        </div>

        {/* Reference Key (Always visible for clinical fidelity to SDMT) */}
        <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
            {t.processing.referenceKey}
          </span>
          <div className="grid grid-cols-4 gap-2">
            {SYMBOLS_MAP.map((item) => (
              <div key={item.number} className="bg-white py-2 rounded-lg border border-slate-200 shadow-sm">
                <div className="text-2xl text-teal-700">{item.symbol}</div>
                <div className="text-sm font-bold text-slate-700 mt-0.5">= {item.number}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready State */}
        {gameState === 'ready' && (
          <div className="py-4 space-y-4">
            <button
              type="button"
              onClick={startTest}
              className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-lg font-bold shadow-md transition-all"
            >
              {t.processing.startBtn}
            </button>
          </div>
        )}

        {/* Active Test State */}
        {gameState === 'active' && (
          <div className="space-y-5 py-2">
            {/* Timer and Score bar */}
            <div className="flex justify-between items-center px-2 text-sm font-bold text-slate-700">
              <span className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>{timeLeft}s</span>
              </span>
              <span className="bg-slate-100 px-3 py-1.5 rounded-full">
                {t.processing.score}: <span className="text-teal-700">{correctCount}</span>
              </span>
            </div>

            {/* Target Symbol Display */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto bg-teal-50 border-2 border-teal-300 rounded-2xl flex flex-col items-center justify-center shadow-inner">
              <span className="text-6xl sm:text-7xl text-teal-800 leading-none">
                {SYMBOLS_MAP[currentSymbolIndex].symbol}
              </span>
            </div>

            {/* 4 Number Input Buttons with min 48px target */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleChoice(num)}
                  className="touch-target h-14 sm:h-16 rounded-xl bg-slate-800 hover:bg-slate-900 active:bg-teal-700 text-white font-bold text-2xl shadow-md border-2 border-slate-700 transition-all active:scale-95"
                  aria-label={`Match number ${num}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Completed State */}
        {gameState === 'completed' && (
          <div className="space-y-5 py-2">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
              <p className="font-bold text-base">{t.processing.completed}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="text-xs text-slate-500 block">{t.processing.score}</span>
                <span className="text-xl font-bold text-emerald-700">{correctCount}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="text-xs text-slate-500 block">Errors</span>
                <span className="text-xl font-bold text-slate-700">{wrongCount}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span className="text-xs text-slate-500 block">{t.processing.avgReaction}</span>
                <span className="text-xl font-bold text-teal-700">{avgReactionTime}ms</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={startTest}
                className="touch-target px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium flex items-center justify-center gap-1.5 hover:bg-slate-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={handleProceed}
                className="touch-target flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow flex items-center justify-center gap-2"
              >
                <span>Proceed to Step 2: Flag</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
