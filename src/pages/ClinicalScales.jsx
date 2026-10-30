import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, CheckCircle2, ChevronRight, Activity, ShieldCheck, Check } from 'lucide-react';
import { formatDate } from '../utils/formatters';

// CLINICAL NOTE: Modified Rankin Scale (mRS) is the primary global outcome measure for stroke trials and clinical practice. Score ≥3 indicates significant disability. Simplified language used for patient self-report — clinical confirmation recommended.
// CLINICAL NOTE: This is a simplified patient-reported functional assessment inspired by the EDSS (Expanded Disability Status Scale). The actual EDSS requires neurological examination and is scored 0-10 by a clinician. This adaptation captures self-reported functional status for longitudinal monitoring — not a substitute for EDSS.
// CLINICAL NOTE: Adapted from QOLIE-10 (Quality of Life in Epilepsy) screening. Validated QOLIE requires formal administration. This simplified version captures patient-reported seizure burden for longitudinal tracking.
// CLINICAL NOTE: Based on Katz Index of Independence in ADL and Lawson IADL scale. ADL decline is a key indicator of neurological progression and predicts care needs. Score <6/8 warrants clinical review.

export function ClinicalScales({ t, activePatient, onSaveScales }) {
  const isStroke = activePatient.condition === 'Stroke';
  const isMS = activePatient.condition === 'MS';
  const isEpilepsy = activePatient.condition === 'Epilepsy';

  // Latest clinical scale values or defaults
  const scaleHistory = activePatient.clinicalScales || [];
  const latestEntry = scaleHistory[scaleHistory.length - 1] || {};

  // Form states
  const [selectedMrs, setSelectedMrs] = useState(latestEntry.mrsScore ?? 1);
  const [edssDomains, setEdssDomains] = useState(latestEntry.edssDomains || {
    walking: 4, hand: 4, vision: 4, bladder: 4, fatigue: 3, cognition: 4
  });
  const [seizureImpactAnswers, setSeizureImpactAnswers] = useState({
    work: 4, social: 4, publicWorry: 4, control: 4, sideEffects: 4
  });
  const [adlAnswers, setAdlAnswers] = useState({
    bathing: 'independent',
    dressing: 'independent',
    eating: 'independent',
    toilet: 'independent',
    walkIn: 'independent',
    walkOut: 'independent',
    meds: 'independent',
    phone: 'independent'
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // mRS Options
  const mrsOptions = [
    { score: 0, emoji: '😊', desc: t?.clinicalScales?.mrs0 || "0 — No problems at all. I can do everything I did before." },
    { score: 1, emoji: '🙂', desc: t?.clinicalScales?.mrs1 || "1 — Minor difficulties, but I can do all my usual activities without help." },
    { score: 2, emoji: '😐', desc: t?.clinicalScales?.mrs2 || "2 — I cannot do some things I used to, but I manage my own daily care without help." },
    { score: 3, emoji: '🙁', desc: t?.clinicalScales?.mrs3 || "3 — I need some help, but I can walk on my own." },
    { score: 4, emoji: '😟', desc: t?.clinicalScales?.mrs4 || "4 — I cannot walk without help. I need help with daily body care." },
    { score: 5, emoji: '😣', desc: t?.clinicalScales?.mrs5 || "5 — I am bedridden. I need constant nursing care and attention." }
  ];

  // ADL Questions
  const adlItems = [
    { key: 'bathing', label: t?.clinicalScales?.adl1 || "Bathing and showering" },
    { key: 'dressing', label: t?.clinicalScales?.adl2 || "Dressing and grooming" },
    { key: 'eating', label: t?.clinicalScales?.adl3 || "Eating independently" },
    { key: 'toilet', label: t?.clinicalScales?.adl4 || "Using the toilet independently" },
    { key: 'walkIn', label: t?.clinicalScales?.adl5 || "Walking inside the house" },
    { key: 'walkOut', label: t?.clinicalScales?.adl6 || "Going outside the house" },
    { key: 'meds', label: t?.clinicalScales?.adl7 || "Taking your own medications" },
    { key: 'phone', label: t?.clinicalScales?.adl8 || "Using a mobile phone or communicating" }
  ];

  const currentAdlScore = Object.values(adlAnswers).filter(v => v === 'independent').length;

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    const newRecord = {
      date: today,
      adlScore: currentAdlScore
    };

    if (isStroke) newRecord.mrsScore = selectedMrs;
    if (isMS) {
      newRecord.edssDomains = edssDomains;
      newRecord.edssScore = Number((Object.values(edssDomains).reduce((a, b) => a + b, 0) / 6).toFixed(1));
    }
    if (isEpilepsy) {
      newRecord.seizureImpact = Number((Object.values(seizureImpactAnswers).reduce((a, b) => a + b, 0) / 5).toFixed(1));
    }

    if (onSaveScales) {
      onSaveScales(newRecord);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Recharts trend data
  const trendData = scaleHistory.map((s, idx) => ({
    week: `Wk ${idx + 1}`,
    score: isStroke ? s.mrsScore : isMS ? s.edssScore : s.seizureImpact,
    adl: s.adlScore
  }));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t?.clinicalScales?.title || "Clinical Functional Scales"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t?.clinicalScales?.subtitle || "Standardized clinician-aligned functional evaluations for longitudinal monitoring"}
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          <span>Evaluation scores saved to patient profile!</span>
        </div>
      )}

      {/* STROKE: Modified Rankin Scale */}
      {isStroke && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t?.clinicalScales?.mrsTitle || "Modified Rankin Scale (Stroke Recovery)"}
              </h2>
              <p className="text-xs text-slate-500">{t?.clinicalScales?.mrsDesc}</p>
            </div>
            <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-1 rounded-full">
              Score: {selectedMrs}/5
            </span>
          </div>

          <div className="space-y-2">
            {mrsOptions.map(opt => (
              <button
                key={opt.score}
                type="button"
                onClick={() => setSelectedMrs(opt.score)}
                className={`touch-target w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  selectedMrs === opt.score
                    ? 'bg-teal-50 border-teal-600 shadow-sm font-bold text-teal-950'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl shrink-0">{opt.emoji}</span>
                <span className="text-xs sm:text-sm leading-relaxed mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MS: EDSS-Inspired Functional Domains */}
      {isMS && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-900">
              {t?.clinicalScales?.edssTitle || "MS Daily Functional Assessment"}
            </h2>
            <p className="text-xs text-slate-500">{t?.clinicalScales?.edssDesc}</p>
          </div>

          <div className="space-y-3">
            {[
              { key: 'walking', label: t?.clinicalScales?.domainWalking || "Walking ability & distance", icon: "🚶" },
              { key: 'hand', label: t?.clinicalScales?.domainHand || "Hand function (buttoning, utensils)", icon: "🖐️" },
              { key: 'vision', label: t?.clinicalScales?.domainVision || "Vision & eye comfort", icon: "👁️" },
              { key: 'bladder', label: t?.clinicalScales?.domainBladder || "Bladder control & urgency", icon: "💧" },
              { key: 'fatigue', label: t?.clinicalScales?.domainFatigue || "Energy level & fatigue resistance", icon: "⚡" },
              { key: 'cognition', label: t?.clinicalScales?.domainCognition || "Thinking clarity & memory", icon: "🧠" }
            ].map(dom => (
              <div key={dom.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{dom.icon} {dom.label}</span>
                  <span className="text-teal-700">{edssDomains[dom.key]}/5</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setEdssDomains(prev => ({ ...prev, [dom.key]: v }))}
                      className={`touch-target py-1.5 text-xs font-bold rounded-lg border ${
                        edssDomains[dom.key] === v
                          ? 'bg-teal-600 text-white border-teal-700'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EPILEPSY: Seizure Severity & Impact Scale */}
      {isEpilepsy && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-900">
              {t?.clinicalScales?.seizureImpactTitle || "Seizure Impact on Daily Life"}
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { key: 'work', label: t?.clinicalScales?.seizQ1 || "How much do seizures affect work or study?" },
              { key: 'social', label: t?.clinicalScales?.seizQ2 || "How much do seizures affect social life?" },
              { key: 'publicWorry', label: t?.clinicalScales?.seizQ3 || "How worried are you about seizures in public?" },
              { key: 'control', label: t?.clinicalScales?.seizQ4 || "How well controlled do seizures feel on medication?" },
              { key: 'sideEffects', label: t?.clinicalScales?.seizQ5 || "How much do medication side effects bother you?" }
            ].map(q => (
              <div key={q.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-slate-800 block">{q.label}</span>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSeizureImpactAnswers(prev => ({ ...prev, [q.key]: v }))}
                      className={`touch-target py-1.5 text-xs font-bold rounded-lg border ${
                        seizureImpactAnswers[q.key] === v
                          ? 'bg-teal-600 text-white border-teal-700'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL PATIENTS: Activities of Daily Living (ADL) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t?.clinicalScales?.adlTitle || "Activities of Daily Living (ADL) Independence"}
            </h2>
            <p className="text-xs text-slate-500">{t?.clinicalScales?.adlDesc}</p>
          </div>
          <span className={`font-bold text-xs px-2.5 py-1 rounded-full ${
            currentAdlScore >= 6 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            Score: {currentAdlScore}/8
          </span>
        </div>

        <div className="space-y-2">
          {adlItems.map(item => {
            const currentVal = adlAnswers[item.key];
            return (
              <div key={item.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-800">{item.label}</span>
                <div className="grid grid-cols-3 gap-1 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setAdlAnswers(prev => ({ ...prev, [item.key]: 'independent' }))}
                    className={`touch-target py-1.5 px-2 text-[11px] font-bold rounded-lg border ${
                      currentVal === 'independent' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Independent ✅
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdlAnswers(prev => ({ ...prev, [item.key]: 'someHelp' }))}
                    className={`touch-target py-1.5 px-2 text-[11px] font-bold rounded-lg border ${
                      currentVal === 'someHelp' ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Some Help ⚠
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdlAnswers(prev => ({ ...prev, [item.key]: 'cannotDo' }))}
                    className={`touch-target py-1.5 px-2 text-[11px] font-bold rounded-lg border ${
                      currentVal === 'cannotDo' ? 'bg-red-600 text-white border-red-700' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Cannot Do ❌
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="touch-target w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base rounded-2xl shadow-md transition-all active:scale-[0.99]"
      >
        {t?.clinicalScales?.saveScalesBtn || "Save Functional Evaluation"}
      </button>

      {/* Longitudinal Scale Trend Chart */}
      {trendData.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-2">
          <h2 className="text-sm font-bold text-slate-900">
            📊 8-Week Functional & ADL Trend
          </h2>
          <div className="h-44 sm:h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 8]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" name={isStroke ? "mRS Score (0-5)" : "Domain Score (1-5)"} stroke="#D97706" strokeWidth={2.5} />
                <Line type="monotone" dataKey="adl" name="ADL Score (0-8)" stroke="#0D9488" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
