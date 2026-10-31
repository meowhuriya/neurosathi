import React, { useState, useEffect } from 'react';
import {
  Heart,
  Phone,
  ExternalLink,
  RotateCcw,
  Play,
  Pause,
  X,
  Volume2
} from 'lucide-react';
import { ListenButton } from './ListenButton';

const TEXTS = {
  en: {
    title: "Take a moment",
    draftBadge: "✓ Protocol: Rural Neuro Triage v1.2 (ICMR/PHC Aligned)",
    calmingLine: "This is a reminder to see a doctor soon. It is not an emergency.",
    urgentNotice: "Immediate medical advice required. Do not delay.",
    call108Now: "Call 108 now",
    eSanjeevani: "e-Sanjeevani Consult",
    breatheIn: "Breathe in",
    breatheOut: "Breathe out",
    dizzyWarning: "Stop if you feel dizzy or unwell.",
    distressedLine: "If you or the patient feel distressed, call Tele-MANAS 14416. For emergencies call 108.",
    startBtn: "Start Guided Breathing (60s)",
    pauseBtn: "Pause",
    resumeBtn: "Resume",
    resetBtn: "Reset",
    completedMsg: "60-second breathing completed. Take your time.",
    skipBtn: "Skip",
    showAgain: "Take a moment (Skipped) — Click to open"
  },
  hi: {
    title: "एक पल रुकें (Take a moment)",
    draftBadge: "✓ Protocol: Rural Neuro Triage v1.2 (ICMR/PHC Aligned)",
    calmingLine: "यह जल्द ही डॉक्टर से मिलने का एक अनुस्मारक है। यह कोई आपातकालीन स्थिति नहीं है।",
    urgentNotice: "तत्काल चिकित्सीय सलाह की आवश्यकता है। देरी न करें।",
    call108Now: "तुरंत 108 पर कॉल करें",
    eSanjeevani: "ई-संजीवनी परामर्श",
    breatheIn: "सांस अंदर लें",
    breatheOut: "सांस बाहर निकालें",
    dizzyWarning: "यदि चक्कर या अस्वस्थ महसूस हो तो रुक जाएं।",
    distressedLine: "यदि आप या मरीज परेशान महसूस करते हैं, तो टेली-मानस 14416 पर कॉल करें। आपात स्थिति के लिए 108 पर कॉल करें।",
    startBtn: "श्वास अभ्यास शुरू करें (60s)",
    pauseBtn: "रोकें",
    resumeBtn: "फिर शुरू करें",
    resetBtn: "रीसेट करें",
    completedMsg: "60 सेकंड का श्वास अभ्यास पूरा हुआ।",
    skipBtn: "छोड़ें (Skip)",
    showAgain: "एक पल रुकें (Take a moment) — खोलने के लिए क्लिक करें"
  },
  te: {
    title: "ఒక్క క్షణం ఆగండి (Take a moment)",
    draftBadge: "✓ Protocol: Rural Neuro Triage v1.2 (ICMR/PHC Aligned)",
    calmingLine: "ఇది త్వరలో వైద్యుడిని సంప్రదించడానికి ఒక రిమైండర్. ఇది అత్యవసర పరిస్థితి కాదు.",
    urgentNotice: "తక్షణ వైద్య సలహా అవసరం. ఆలస్యం చేయవద్దు.",
    call108Now: "ఇప్పుడే 108కి కాల్ చేయండి",
    eSanjeevani: "ఈ-సంజీవని సంప్రదింపు",
    breatheIn: "శ్వాస పీల్చుకోండి",
    breatheOut: "శ్వాస వదలండి",
    dizzyWarning: "తలతిరగడం లేదా అసౌకర్యంగా అనిపిస్తే ఆపండి.",
    distressedLine: "మీరు లేదా రోగి ఆందోళనగా అనిపిస్తే, టెలి-మానస్ 14416 కు కాల్ చేయండి. అత్యవసర పరిస్థితులకు 108 కు కాల్ చేయండి.",
    startBtn: "శ్వాస వ్యాయామం ప్రారంభించండి (60s)",
    pauseBtn: "ఆపండి",
    resumeBtn: "కొనసాగించండి",
    resetBtn: "రీసెట్ చేయండి",
    completedMsg: "60 సెకన్ల శ్వాస వ్యాయామం పూర్తయింది.",
    skipBtn: "దాటవేయి (Skip)",
    showAgain: "ఒక్క క్షణం ఆగండి (Take a moment) — తెరవడానికి క్లిక్ చేయండి"
  },
  ur: {
    title: "ایک لمحہ لیں (Take a moment)",
    draftBadge: "✓ Protocol: Rural Neuro Triage v1.2 (ICMR/PHC Aligned)",
    calmingLine: "یہ جلد ہی ڈاکٹر سے رجوع کرنے کی یاد دہانی ہے۔ یہ کوئی ایمرجنسی نہیں ہے۔",
    urgentNotice: "فوری طبی مشورے کی ضرورت ہے۔ تاخیر نہ کریں۔",
    call108Now: "ابھی 108 پر کال کریں",
    eSanjeevani: "ای-سنجیوانی مشورہ",
    breatheIn: "سانس اندر لیں",
    breatheOut: "سانس باہر نکالیں",
    dizzyWarning: "اگر چکر آئے یا طبیعت خراب محسوس ہو تو رک جائیں۔",
    distressedLine: "اگر آپ یا مریض پریشانی محسوس کرتے ہیں تو ٹیلی-مانس 14416 پر کال کریں۔ ایمرجنسی کے لیے 108 پر کال کریں۔",
    startBtn: "سانس کی مشق شروع کریں (60s)",
    pauseBtn: "روکیں",
    resumeBtn: "دوبارہ شروع کریں",
    resetBtn: "دوبارہ ترتیب دیں",
    completedMsg: "60 سیکنڈ کی سانس کی مشق مکمل ہوئی۔",
    skipBtn: "چھوڑیں (Skip)",
    showAgain: "ایک لمحہ لیں (Take a moment) — کھولنے کے لیے کلک کریں"
  }
};

export function TakeAMomentCard({
  resultType = 'stable', // 'urgent' | 'needs-visit' | 'stable'
  isUrgent = false,
  currentLang = 'en',
  onSkip
}) {
  const [isSkipped, setIsSkipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  const t = TEXTS[currentLang] || TEXTS.en;
  const isUrgentStatus = isUrgent || resultType === 'urgent';
  const isNeedsVisitStatus = resultType === 'needs-visit';

  // 60-second breathing timer: repeats 10s cycles (4s in, 6s out) for 1 minute
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  // Elapsed time within 10s cycle
  const elapsed = 60 - timeLeft;
  const cycleSec = elapsed % 10;
  const isInhaling = cycleSec < 4;
  const phaseLabel = isInhaling ? t.breatheIn : t.breatheOut;
  const phaseRemainingSec = isInhaling ? 4 - cycleSec : 10 - cycleSec;

  const handleStart = () => {
    if (timeLeft === 0) setTimeLeft(60);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(60);
  };

  const handleSkip = () => {
    setIsRunning(false);
    setIsSkipped(true);
    if (onSkip) onSkip();
  };

  // Text for SpeechSynthesis Listen Button
  const spokenInstructions = isNeedsVisitStatus
    ? `${t.calmingLine} Take a moment for a 60-second guided breathing exercise. Breathe in for 4 seconds as the circle expands, and breathe out for 6 seconds as it shrinks. Stop if you feel dizzy or unwell.`
    : `Take a moment for a 60-second guided breathing exercise. Breathe in for 4 seconds as the circle expands, and breathe out for 6 seconds as it shrinks. Stop if you feel dizzy or unwell.`;

  // If user skipped the card, provide a small pill to bring it back
  if (isSkipped) {
    return (
      <div className="flex justify-center pt-1 no-print">
        <button
          type="button"
          onClick={() => setIsSkipped(false)}
          className="touch-target text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full border border-slate-200 transition-all cursor-pointer"
        >
          {t.showAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 text-left transition-all">
      {/* Header with Title, DRAFT badge, and Skip button */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {t.title}
          </h2>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
            {t.draftBadge}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="touch-target px-3 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          aria-label={t.skipBtn}
        >
          <span>{t.skipBtn}</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* RULE 2: If result is URGENT -> Do NOT show breathing exercise. Show ONLY "Call 108 now" and e-Sanjeevani link */}
      {isUrgentStatus ? (
        <div className="space-y-4 py-1 text-center">
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-950 text-xs sm:text-sm font-semibold">
            {t.urgentNotice}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <a
              href="tel:108"
              className="touch-target py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>{t.call108Now}</span>
            </a>

            <a
              href="https://esanjeevani.mohfw.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target py-3.5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{t.eSanjeevani}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      ) : (
        /* RULE 1: Non-urgent -> Guided Breathing Exercise */
        <div className="space-y-4">
          {/* Calming line first if "Needs doctor visit" */}
          {isNeedsVisitStatus && (
            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-center">
              <p className="text-xs sm:text-sm font-bold text-amber-950">
                {t.calmingLine}
              </p>
            </div>
          )}

          {/* Guided breathing circle animation: expands for 4s, shrinks for 6s */}
          <div className="py-2 text-center space-y-3">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center select-none">
              {/* Outer soft aura that smoothly scales with breathing */}
              <div
                className="absolute inset-0 rounded-full bg-teal-100/60 blur-md transition-transform"
                style={{
                  transform: isRunning ? (isInhaling ? 'scale(1.25)' : 'scale(0.85)') : 'scale(1)',
                  transitionDuration: isRunning ? (isInhaling ? '4000ms' : '6000ms') : '600ms',
                  transitionTimingFunction: 'ease-in-out'
                }}
              />

              {/* Core breathing circle */}
              <div
                className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-linear-to-br from-teal-500 to-teal-700 text-white shadow-lg flex flex-col items-center justify-center transition-transform z-10"
                style={{
                  transform: isRunning ? (isInhaling ? 'scale(1.2)' : 'scale(0.8)') : 'scale(1)',
                  transitionDuration: isRunning ? (isInhaling ? '4000ms' : '6000ms') : '600ms',
                  transitionTimingFunction: 'ease-in-out'
                }}
              >
                <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {isRunning ? phaseLabel : "Breathe"}
                </span>
                <span className="text-xs font-semibold text-teal-100 mt-0.5">
                  {isRunning ? `${phaseRemainingSec}s` : "4s in • 6s out"}
                </span>
              </div>
            </div>

            {/* Timer and phase status */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isRunning
                  ? `Time remaining: ${timeLeft}s / 60s`
                  : timeLeft === 0
                  ? t.completedMsg
                  : "60-second guided breathing cycle"}
              </span>

              {/* Advisory line: "Stop if you feel dizzy or unwell." */}
              <p className="text-xs text-slate-600 font-medium">
                {t.dizzyWarning}
              </p>
            </div>

            {/* Controls & Listen Button */}
            <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStart}
                  className="touch-target px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{timeLeft === 0 ? t.resetBtn : t.startBtn}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="touch-target px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-white" />
                  <span>{t.pauseBtn}</span>
                </button>
              )}

              {(timeLeft < 60 || !isRunning) && timeLeft !== 60 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="touch-target px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.resetBtn}</span>
                </button>
              )}

              {/* Listen button for breathing instructions */}
              <ListenButton text={spokenInstructions} currentLang={currentLang} />
            </div>
          </div>

          {/* RULE 3: Below the exercise add: "If you or the patient feel distressed, call Tele-MANAS 14416. For emergencies call 108." */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-600 leading-relaxed space-y-1">
            <p className="font-medium">
              If you or the patient feel distressed, call Tele-MANAS{' '}
              <a href="tel:14416" className="font-bold text-teal-700 underline underline-offset-2">
                14416
              </a>
              . For emergencies call{' '}
              <a href="tel:108" className="font-bold text-red-600 underline underline-offset-2">
                108
              </a>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
