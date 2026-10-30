import React, { useState } from 'react';
import { Phone, AlertTriangle, ShieldAlert, HeartPulse, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';

// CLINICAL NOTE: FAST protocol is AHA/ASA endorsed. Seizure >5 min = status epilepticus requiring emergency intervention. These are evidence-based emergency recognition criteria, not triage — always advise calling emergency services.

export function EmergencyRedFlags({ t }) {
  // FAST check answers: { face: null|bool, arms: null|bool, speech: null|bool }
  const [fastAnswers, setFastAnswers] = useState({
    face: null,
    arms: null,
    speech: null
  });

  // Seizure emergency criteria checks
  const [seizureFlags, setSeizureFlags] = useState({
    longerThan5Min: false,
    noWakeUp: false,
    secondSeizure: false,
    injuredOrPregnant: false,
    firstSeizureEver: false,
    breathingDifficulty: false
  });

  const isStrokeWarning = fastAnswers.face === true || fastAnswers.arms === true || fastAnswers.speech === true;
  const isAllStrokeNo = fastAnswers.face === false && fastAnswers.arms === false && fastAnswers.speech === false;
  const isSeizureEmergency = Object.values(seizureFlags).some(Boolean);

  const toggleSeizureFlag = (key) => {
    setSeizureFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t?.emergency?.title || "Emergency Red Flags"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t?.emergency?.subtitle || "When to seek urgent and immediate emergency medical care"}
          </p>
        </div>
      </div>

      {/* SECTION A: STROKE — FAST CHECK */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-red-200 shadow-sm space-y-4">
        <div className="border-b border-red-100 pb-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>🚨</span>
            <span>{t?.emergency?.strokeTitle || "Stroke Warning — Check FAST"}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t?.emergency?.strokeDesc || "Stroke is a medical emergency. Use FAST to identify symptoms immediately:"}
          </p>
        </div>

        {/* 4 Interactive FAST Questions */}
        <div className="space-y-3">
          {/* F - Face */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🙂/🥴</span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 text-sm block">F — FACE</span>
                <p className="text-xs text-slate-700 font-medium">
                  {t?.emergency?.faceQ || "Ask the person to smile. Does one side of the face droop?"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFastAnswers(prev => ({ ...prev, face: true }))}
                className={`touch-target py-2 px-3 rounded-lg font-bold text-xs border transition-all ${
                  fastAnswers.face === true 
                    ? 'bg-red-600 text-white border-red-700 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                YES (Drooping)
              </button>
              <button
                type="button"
                onClick={() => setFastAnswers(prev => ({ ...prev, face: false }))}
                className={`touch-target py-2 px-3 rounded-lg font-bold text-xs border transition-all ${
                  fastAnswers.face === false 
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                NO (Normal)
              </button>
            </div>
          </div>

          {/* A - Arms */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💪</span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 text-sm block">A — ARMS</span>
                <p className="text-xs text-slate-700 font-medium">
                  {t?.emergency?.armsQ || "Ask them to raise both arms. Does one arm drift downward?"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFastAnswers(prev => ({ ...prev, arms: true }))}
                className={`touch-target py-2 px-3 rounded-lg font-bold text-xs border transition-all ${
                  fastAnswers.arms === true 
                    ? 'bg-red-600 text-white border-red-700 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                YES (Drifting Down)
              </button>
              <button
                type="button"
                onClick={() => setFastAnswers(prev => ({ ...prev, arms: false }))}
                className={`touch-target py-2 px-3 rounded-lg font-bold text-xs border transition-all ${
                  fastAnswers.arms === false 
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                NO (Both Steady)
              </button>
            </div>
          </div>

          {/* S - Speech */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🗣️</span>
              <div className="flex-1">
                <span className="font-bold text-slate-900 text-sm block">S — SPEECH</span>
                <p className="text-xs text-slate-700 font-medium">
                  {t?.emergency?.speechQ || "Ask them to repeat a simple phrase. Is speech slurred or strange?"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFastAnswers(prev => ({ ...prev, speech: true }))}
                className={`touch-target py-2 px-3 rounded-lg font-bold text-xs border transition-all ${
                  fastAnswers.speech === true 
                    ? 'bg-red-600 text-white border-red-700 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                YES (Slurred / Cannot Speak)
              </button>
              <button
                type="button"
                onClick={() => setFastAnswers(prev => ({ ...prev, speech: false }))}
                className={`touch-target py-2 px-3 rounded-lg font-bold text-xs border transition-all ${
                  fastAnswers.speech === false 
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' 
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                NO (Speech Clear)
              </button>
            </div>
          </div>

          {/* T - Time reminder */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 font-semibold">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{t?.emergency?.timeQ || "T — TIME: If ANY of these are YES — this is an emergency. Call 108 NOW."}</span>
          </div>
        </div>

        {/* Dynamic Stroke Alert Panel */}
        {isStrokeWarning && (
          <div className="bg-red-50 border-2 border-red-600 rounded-2xl p-5 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-2xl">🚨</span>
              <h3 className="text-lg sm:text-xl font-bold text-red-900">
                {t?.emergency?.strokeAlert || "⚠ POSSIBLE STROKE — EVERY MINUTE MATTERS"}
              </h3>
              <p className="text-xs text-red-800 font-bold">
                {t?.emergency?.goldenHour || "Golden Hour: Emergency intervention within 4.5 hours can prevent permanent brain damage."}
              </p>
            </div>

            {/* Giant Emergency Buttons */}
            <div className="space-y-2">
              <a
                href="tel:108"
                className="touch-target w-full min-h-[64px] bg-red-600 hover:bg-red-700 text-white font-bold text-lg sm:text-xl rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
              >
                <Phone className="w-7 h-7 fill-white" />
                <span>{t?.emergency?.call108 || "CALL 108 AMBULANCE NOW"}</span>
              </a>

              <a
                href="tel:112"
                className="touch-target w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>{t?.emergency?.call112 || "CALL 112 (National Emergency)"}</span>
              </a>
            </div>

            {/* Critical Instructions Checklist */}
            <div className="bg-white p-4 rounded-xl border border-red-200 text-xs text-slate-800 space-y-1.5">
              <p className="font-bold text-red-950 uppercase tracking-wide">
                {t?.emergency?.instructionsTitle || "Critical Emergency Steps While Waiting:"}
              </p>
              <ul className="list-disc pl-4 space-y-1 font-medium">
                <li>{t?.emergency?.inst1 || "Note the exact time symptoms started — tell the doctor immediately"}</li>
                <li>{t?.emergency?.inst2 || "Do NOT give food or water (choking risk)"}</li>
                <li>{t?.emergency?.inst3 || "Do NOT give aspirin unless specifically instructed by a doctor"}</li>
                <li>{t?.emergency?.inst4 || "Lay the person on their side if they feel sick or vomit"}</li>
                <li>{t?.emergency?.inst5 || "Keep them calm, warm, and still until the ambulance arrives"}</li>
              </ul>
            </div>
          </div>
        )}

        {isAllStrokeNo && !isStrokeWarning && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs sm:text-sm text-emerald-900 font-medium">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>{t?.emergency?.strokeNormal || "No stroke warning signs reported currently. Stay watchful. If any sign appears, return to this screen immediately."}</span>
          </div>
        )}
      </div>

      {/* SECTION B: SEIZURE EMERGENCY SIGNS */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-red-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>⚡</span>
            <span>{t?.emergency?.seizureEmergTitle || "When a Seizure Needs Emergency Care"}</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {t?.emergency?.seizureEmergDesc || "Most seizures end on their own. Call 108 immediately if any of these occur:"}
          </p>
        </div>

        {/* 6 Checkbox Emergency Triggers */}
        <div className="space-y-2">
          {[
            { key: 'longerThan5Min', label: t?.emergency?.seizCrit1 || "Seizure lasts more than 5 minutes" },
            { key: 'noWakeUp', label: t?.emergency?.seizCrit2 || "Person does not wake up after the seizure" },
            { key: 'secondSeizure', label: t?.emergency?.seizCrit3 || "A second seizure follows quickly without regaining consciousness" },
            { key: 'injuredOrPregnant', label: t?.emergency?.seizCrit4 || "Person is injured, in water, or pregnant" },
            { key: 'firstSeizureEver', label: t?.emergency?.seizCrit5 || "This is their FIRST seizure ever" },
            { key: 'breathingDifficulty', label: t?.emergency?.seizCrit6 || "Person has difficulty breathing or blue lips after the seizure" }
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleSeizureFlag(item.key)}
              className={`touch-target w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                seizureFlags[item.key]
                  ? 'bg-red-50 border-red-500 text-red-950 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 font-medium hover:bg-slate-100'
              }`}
            >
              <span className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                seizureFlags[item.key] ? 'bg-red-600 border-red-600 text-white' : 'border-slate-400 bg-white'
              }`}>
                {seizureFlags[item.key] && "✓"}
              </span>
              <span className="text-xs sm:text-sm">{item.label}</span>
            </button>
          ))}
        </div>

        {isSeizureEmergency && (
          <div className="p-4 bg-red-50 border-2 border-red-600 rounded-xl space-y-3">
            <p className="text-xs sm:text-sm font-bold text-red-900 text-center">
              ⚠ SEIZURE EMERGENCY DETECTED — SEEK IMMEDIATE MEDICAL TRANSPORT
            </p>
            <a
              href="tel:108"
              className="touch-target w-full min-h-[56px] bg-red-600 hover:bg-red-700 text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-md"
            >
              <Phone className="w-5 h-5 fill-white" />
              <span>{t?.emergency?.call108 || "CALL 108 AMBULANCE NOW"}</span>
            </a>
          </div>
        )}

        {/* Seizure First Aid Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {t?.emergency?.seizureFirstAidTitle || "SEIZURE FIRST AID — What to do RIGHT NOW"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* DOs */}
            <div className="bg-emerald-50/80 p-3 rounded-lg border border-emerald-200 space-y-1 text-emerald-950">
              <span className="font-bold text-emerald-900 block text-xs">{t?.emergency?.dosTitle || "✅ DO:"}</span>
              <p>• {t?.emergency?.do1 || "Clear the area of sharp or hard objects"}</p>
              <p>• {t?.emergency?.do2 || "Place something soft (cloth/pillow) under head"}</p>
              <p>• {t?.emergency?.do3 || "Turn gently onto their side (recovery position)"}</p>
              <p>• {t?.emergency?.do4 || "Time the seizure with watch or phone"}</p>
              <p>• {t?.emergency?.do5 || "Stay with them reassuringly until fully awake"}</p>
            </div>

            {/* DONTs */}
            <div className="bg-red-50/80 p-3 rounded-lg border border-red-200 space-y-1 text-red-950">
              <span className="font-bold text-red-900 block text-xs">{t?.emergency?.dontsTitle || "❌ DO NOT:"}</span>
              <p>• {t?.emergency?.dont1 || "Do NOT put anything in their mouth (no spoons, keys)"}</p>
              <p>• {t?.emergency?.dont2 || "Do NOT hold them down or restrain movements"}</p>
              <p>• {t?.emergency?.dont3 || "Do NOT give water, food, or medicines until awake"}</p>
              <p>• {t?.emergency?.dont4 || "Do NOT panic — most seizures stop within 1 to 3 minutes"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C: MS RELAPSE WARNING SIGNS */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>🔶</span>
          <span>{t?.emergency?.msRelapseTitle || "Signs of an MS Relapse — When to Contact Your Doctor"}</span>
        </h2>
        <p className="text-xs text-slate-600">
          {t?.emergency?.msRelapseDesc || "A relapse refers to new symptoms or significant worsening of existing symptoms lasting more than 24 hours without fever:"}
        </p>

        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg">
            • {t?.emergency?.msSign1 || "New numbness or tingling lasting more than 24 hours"}
          </div>
          <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg">
            • {t?.emergency?.msSign2 || "Sudden vision problems — blurring, double vision, or eye pain"}
          </div>
          <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg">
            • {t?.emergency?.msSign3 || "Severe new weakness in legs or arms making walking difficult"}
          </div>
          <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg">
            • {t?.emergency?.msSign4 || "Loss of balance or inability to walk that is new"}
          </div>
          <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg">
            • {t?.emergency?.msSign5 || "Bladder problems that are sudden and new"}
          </div>
        </div>

        <p className="text-xs text-slate-500 italic">
          {t?.emergency?.msRelapseMsg || "Contact your neurologist or Primary Health Centre doctor promptly."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <a
            href="https://esanjeevani.mohfw.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Call e-Sanjeevani (Free Tele-OPD)</span>
          </a>
          <a
            href="tel:14416"
            className="touch-target py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Tele-MANAS (14416)</span>
          </a>
        </div>
      </div>

      {/* SECTION D: GENERAL DANGER SIGNS & 24x7 HELPLINES */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
            {t?.emergency?.generalDangerTitle || "General Neurological Danger Signs"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t?.emergency?.dangerDesc || "Proceed to the nearest emergency department if you experience:"}
          </p>
        </div>

        <ul className="text-xs text-slate-700 space-y-1 list-disc pl-5">
          <li>{t?.emergency?.danger1 || "Sudden severe headache (worst headache of your life)"}</li>
          <li>{t?.emergency?.danger2 || "Sudden confusion or inability to understand speech"}</li>
          <li>{t?.emergency?.danger3 || "Sudden loss of vision in one or both eyes"}</li>
          <li>{t?.emergency?.danger4 || "Sudden weakness or numbness on one side of the body"}</li>
          <li>{t?.emergency?.danger5 || "Loss of consciousness or fainting"}</li>
          <li>{t?.emergency?.danger6 || "Repeated vomiting accompanied by headache"}</li>
          <li>{t?.emergency?.danger7 || "High fever (>103°F / 39.4°C) with neck stiffness"}</li>
        </ul>

        {/* Helpline Cards */}
        <div className="border-t border-slate-200 pt-3 space-y-2">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            {t?.emergency?.helplineNumbersTitle || "24x7 Emergency Helplines (India)"}
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a href="tel:108" className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl font-bold text-red-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-600 shrink-0" />
              <span>108 (Ambulance)</span>
            </a>
            <a href="tel:112" className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-700 shrink-0" />
              <span>112 (National)</span>
            </a>
            <a href="tel:102" className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-700 shrink-0" />
              <span>102 (Maternal)</span>
            </a>
            <a href="tel:14416" className="p-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl font-bold text-teal-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-700 shrink-0" />
              <span>14416 (Tele-MANAS)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
