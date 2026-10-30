import React, { useState } from 'react';
import { HeartHandshake, ShieldAlert, Phone, Apple, Dumbbell, Brain, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

// CLINICAL NOTE: PHQ-2 is a validated ultra-brief depression screening instrument (Kroenke et al., 2003). Score ≥3 has 83% sensitivity for major depression. Not a standalone diagnostic — positive screen warrants clinical evaluation.

export function CaregiverGuide({ t, activePatient }) {
  const [activeTab, setActiveTab] = useState('rehab'); // 'firstAid' | 'stroke' | 'rehab' | 'nutrition' | 'mental'

  // PHQ-2 state
  const [phqQ1, setPhqQ1] = useState(0);
  const [phqQ2, setPhqQ2] = useState(0);
  const [phqSubmitted, setPhqSubmitted] = useState(false);

  const phqTotal = phqQ1 + phqQ2;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <HeartHandshake className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t?.caregiver?.title || "Caregiver & Family Guide"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t?.caregiver?.subtitle || "Practical training, emergency guidance, home rehabilitation, and nutrition"}
          </p>
        </div>
      </div>

      {/* Tab Navigation - Clean horizontal scrolling with shrink-0 to prevent word collision */}
      <div className="w-full overflow-x-auto pb-1 -mx-1 px-1">
        <div className="inline-flex min-w-full sm:min-w-0 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/90 gap-1.5 shadow-2xs">
          {[
            { id: 'firstAid', label: t?.caregiver?.tabFirstAid || "Seizure First Aid", icon: "⚡" },
            { id: 'stroke', label: t?.caregiver?.tabStroke || "Stroke Care", icon: "🧠" },
            { id: 'rehab', label: t?.caregiver?.tabRehab || "Home Exercises", icon: "💪" },
            { id: 'mental', label: t?.caregiver?.tabMental || "Mental Health", icon: "🧘" }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 whitespace-nowrap px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-700/20'
                  : 'bg-white/70 sm:bg-transparent text-slate-700 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <span className="text-sm shrink-0 leading-none">{tab.icon}</span>
              <span className="leading-none tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SEIZURE FIRST AID */}
      {activeTab === 'firstAid' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              What to Do When Someone Has a Seizure (7 Simple Steps)
            </h2>

            <div className="space-y-3">
              {[
                { step: 1, text: "Stay calm. Most seizures stop on their own in 1-3 minutes.", emoji: "🧘" },
                { step: 2, text: "Clear the area. Move away furniture, sharp objects, and fire/stoves.", emoji: "🪑" },
                { step: 3, text: "Protect their head. Place something soft (folded cloth, pillow) under their head.", emoji: "🛏️" },
                { step: 4, text: "Turn them gently onto their side (recovery position). This prevents choking.", emoji: "↩️" },
                { step: 5, text: "Time the seizure with your phone clock. If it lasts >5 minutes, call 108.", emoji: "⏱️" },
                { step: 6, text: "Stay with them. Talk gently when they wake up; confusion is normal.", emoji: "🤝" },
                { step: 7, text: "After the seizure: let them rest. Do not give water until fully awake.", emoji: "💤" }
              ].map(s => (
                <div key={s.step} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-slate-800 font-semibold">{s.text}</p>
                  </div>
                  <span className="text-2xl">{s.emoji}</span>
                </div>
              ))}
            </div>

            {/* BIG RED WARNING CARD */}
            <div className="bg-red-50 border-2 border-red-600 rounded-2xl p-4 sm:p-5 text-red-950 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-900 block">
                🚨 CRITICAL SAFETY WARNING FOR FAMILY:
              </span>
              <p className="text-xs sm:text-sm font-bold">
                • NEVER put anything in their mouth (no iron keys, spoons, cloths, water).
              </p>
              <p className="text-xs sm:text-sm font-bold">
                • NEVER hold them down or try to stop their jerking movements.
              </p>
              <p className="text-xs sm:text-sm font-bold">
                • NEVER splash water or blow into their face during the seizure.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STROKE RECOGNITION & HOME RECOVERY */}
      {activeTab === 'stroke' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Stroke Recognition & What Happens at the Hospital
            </h2>

            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2 text-xs sm:text-sm text-teal-950">
              <p className="font-bold text-teal-900">What Happens at the Hospital (No Need to Fear):</p>
              <p>• The emergency doctor performs an immediate brain scan (CT scan) — it is fast and painless.</p>
              <p>• If brought within 4.5 hours, clot-dissolving treatment can restore blood flow to the brain.</p>
              <p>• Faster arrival directly saves brain cells and speeds long-term walking and speech recovery.</p>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <h3 className="font-bold text-slate-900">Key Home Recovery Principles:</h3>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                • <strong>Daily Movement:</strong> Encourage simple arm, leg, and hand movements daily.
              </p>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                • <strong>Encourage Independence:</strong> Allow them time to button shirts, feed themselves, or walk with support.
              </p>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                • <strong>Depression Vigilance:</strong> Watch for sudden sadness, loss of interest, or refusing food — post-stroke depression is common and treatable.
              </p>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                • <strong>Blood Pressure Adherence:</strong> Never stop prescribed blood pressure medicines without a doctor's advice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HOME REHABILITATION EXERCISES */}
      {activeTab === 'rehab' && (
        <div className="space-y-4">
          {/* Stroke Exercises */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🤜</span>
              <span>{t?.caregiver?.rehabStrokeTitle || "Home Rehabilitation for Stroke Recovery"}</span>
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabStroke1 || "Hand Ball Squeezes: Squeeze a soft rubber ball 10 times with each hand, 3 sets daily."}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabStroke2 || "Supported Arm Raises: Slowly lift both arms overhead for 5 seconds. Repeat 10 times."}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabStroke3 || "Ankle Circles: Rotate ankles in circles 10 times each direction while seated."}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabStroke4 || "Chair Sit-to-Stand: Stand up slowly without pulling, pause, and sit down gently. 5-10 times."}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabStroke5 || "Guided Walking: Walk slowly with a cane or family support, aiming for small daily increases."}
              </div>
            </div>
          </div>

          {/* MS Exercises */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>🧘</span>
              <span>{t?.caregiver?.rehabMsTitle || "Safe Daily Movement for Multiple Sclerosis"}</span>
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabMs1 || "Gentle Stretching: Full-body stretching 5-10 minutes each morning to reduce stiffness."}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabMs2 || "Wall-Supported Balance: Stand near a sturdy wall; raise one foot for 10 seconds. Switch sides."}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabMs3 || "Cooling Precautions: Exercise in ventilated cool areas. Stop if feeling overheated."}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabMs4 || "Energy Pacing: Rest proactively. Do not push through severe neurological fatigue."}
              </div>
            </div>
          </div>

          {/* Epilepsy Lifestyle */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⚡</span>
              <span>{t?.caregiver?.rehabEpilepsyTitle || "Healthy Routines for Epilepsy Wellness"}</span>
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabEpilepsy1 || "Consistent Sleep Schedule: Go to bed and wake up at consistent times every day."}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabEpilepsy2 || "Stress Reduction: 5 minutes of slow diaphragmatic breathing when feeling overwhelmed."}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                • {t?.caregiver?.rehabEpilepsy3 || "Exercise with a Buddy: Exercise with family nearby; avoid swimming or climbing alone."}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* TAB 5: MENTAL HEALTH (PHQ-2 SCREENING) */}
      {activeTab === 'mental' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t?.caregiver?.phqTitle || "PHQ-2 Ultra-Brief Mood Screening"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t?.caregiver?.phqDesc || "Over the past 2 weeks, how often have you been bothered by any of the following problems?"}
              </p>
            </div>

            {/* Q1 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                {t?.caregiver?.phqQ1 || "1. Little interest or pleasure in doing things"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                {[
                  { val: 0, label: "Not at all (0)" },
                  { val: 1, label: "Several days (1)" },
                  { val: 2, label: "More than half (2)" },
                  { val: 3, label: "Nearly daily (3)" }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setPhqQ1(opt.val)}
                    className={`min-h-[44px] py-2 px-2 rounded-xl border text-xs font-semibold text-center leading-snug transition-all ${
                      phqQ1 === opt.val ? 'bg-teal-600 text-white border-teal-700 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                {t?.caregiver?.phqQ2 || "2. Feeling down, depressed, or hopeless"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                {[
                  { val: 0, label: "Not at all (0)" },
                  { val: 1, label: "Several days (1)" },
                  { val: 2, label: "More than half (2)" },
                  { val: 3, label: "Nearly daily (3)" }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setPhqQ2(opt.val)}
                    className={`min-h-[44px] py-2 px-2 rounded-xl border text-xs font-semibold text-center leading-snug transition-all ${
                      phqQ2 === opt.val ? 'bg-teal-600 text-white border-teal-700 shadow-xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Score & Feedback */}
            <div className="p-4 rounded-xl border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">PHQ-2 Score:</span>
                <span className={`text-base font-bold px-2.5 py-0.5 rounded-full ${
                  phqTotal >= 3 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {phqTotal} / 6
                </span>
              </div>

              {phqTotal >= 3 ? (
                <div className="space-y-2 text-xs text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="font-semibold">{t?.caregiver?.phqPositive || "Your responses suggest you may benefit from speaking with a counselor. This is common and treatable. Please call Tele-MANAS (14416) or talk to your doctor."}</p>
                  <a
                    href="tel:14416"
                    className="touch-target inline-flex items-center gap-2 py-2 px-3 rounded-lg bg-teal-600 text-white font-bold text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Free Tele-MANAS (14416)</span>
                  </a>
                </div>
              ) : (
                <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 font-medium">
                  {t?.caregiver?.phqNegative || "Screening score is within the normal range. Continue regular wellness practices."}
                </p>
              )}
            </div>

            {/* Caregiver Burnout Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <h3 className="font-bold text-slate-900">
                {t?.caregiver?.caregiverBurnoutTitle || "Caregiver Wellbeing & Preventing Burnout"}
              </h3>
              <p className="leading-relaxed">
                {t?.caregiver?.burnoutMsg || "Caregiver exhaustion is real and important. You cannot care for a loved one if your own health suffers. Take scheduled rest periods, share chores with relatives, and speak with your ASHA worker."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
