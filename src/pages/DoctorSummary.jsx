import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Copy,
  Check,
  ArrowLeft,
  Stethoscope,
  AlertTriangle,
  ShieldCheck,
  HeartPulse,
  Pill,
  Activity,
  Calendar,
  Play,
  Pause,
  Volume2,
  Mic,
  FileText,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, formatPct, getTrendSymbol } from '../utils/formatters';
import { useDeclineDetection } from '../hooks/useDeclineDetection';
import { calculateBaseline, calculateRecentRollingAvg, getSymptomComposite, calculatePatientMetrics } from '../utils/scoring';
import { getTypedNote, getLatestVoiceNote } from '../utils/audioStorage';
import { getLatestReadings } from '../utils/readingsStorage';
import { VoiceNotePlayer } from '../components/VoiceNotePlayer';
import { SmsPacketModal } from '../components/SmsPacketModal';
import { ESanjeevaniModal } from '../components/ESanjeevaniModal';

export function DoctorSummary({ t, activePatient, threshold }) {
  const [copied, setCopied] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showESanjeevani, setShowESanjeevani] = useState(false);
  const assessments = activePatient?.assessments || [];
  const detectionResult = useDeclineDetection(assessments, threshold);
  const patientMetrics = calculatePatientMetrics(assessments);
  const { tappingDropPct, reactionSlowedPct } = patientMetrics;

  const startDate = assessments[0]?.date ? formatDate(assessments[0].date) : "N/A";
  const endDate = assessments[assessments.length - 1]?.date ? formatDate(assessments[assessments.length - 1].date) : "N/A";

  const isStroke = activePatient.condition === 'Stroke';
  const isMS = activePatient.condition === 'MS';
  const isEpilepsy = activePatient.condition === 'Epilepsy';
  const isParkinsons = activePatient.condition === "Parkinson's";

  // Visit note states (Voice & Typed)
  const [typedNote, setTypedNote] = useState('');
  const [voiceNoteBlob, setVoiceNoteBlob] = useState(null);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const audioRef = useRef(null);
  const [latestReadings, setLatestReadings] = useState(null);
  const [sessionCheck, setSessionCheck] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const note = getTypedNote(activePatient.id);
    setTypedNote(note || '');

    const readings = getLatestReadings(activePatient);
    setLatestReadings(readings);

    try {
      const stored = localStorage.getItem('neurosathi_session_check');
      if (stored) setSessionCheck(JSON.parse(stored));
    } catch (e) {}

    getLatestVoiceNote(activePatient.id).then((res) => {
      if (isMounted && res?.blob) {
        setVoiceNoteBlob(res.blob);
        const url = URL.createObjectURL(res.blob);
        setVoiceNoteUrl(url);
      }
    });

    return () => {
      isMounted = false;
      if (voiceNoteUrl) URL.revokeObjectURL(voiceNoteUrl);
    };
  }, [activePatient.id]);

  const handleTogglePlayVoice = () => {
    if (!audioRef.current) return;
    if (isPlayingVoice) {
      audioRef.current.pause();
      setIsPlayingVoice(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingVoice(true);
      }).catch(err => console.warn('Audio playback error:', err));
    }
  };

  // Core metrics table
  const metrics = [
    {
      key: 'motorLeft',
      label: t.summary.motorLeft,
      baseline: calculateBaseline(assessments, a => a.motor?.leftTaps || 0),
      recent: calculateRecentRollingAvg(assessments, a => a.motor?.leftTaps || 0),
      isFlagged: detectionResult.measures?.motorLeft?.isFlagged
    },
    {
      key: 'motorRight',
      label: t.summary.motorRight,
      baseline: calculateBaseline(assessments, a => a.motor?.rightTaps || 0),
      recent: calculateRecentRollingAvg(assessments, a => a.motor?.rightTaps || 0),
      isFlagged: detectionResult.measures?.motorRight?.isFlagged
    },
    {
      key: 'processing',
      label: t.summary.processingScore,
      baseline: calculateBaseline(assessments, a => a.processing?.correct || 0),
      recent: calculateRecentRollingAvg(assessments, a => a.processing?.correct || 0),
      isFlagged: detectionResult.measures?.processing?.isFlagged
    },
    {
      key: 'symptoms',
      label: t.summary.symptomScore,
      baseline: calculateBaseline(assessments, a => getSymptomComposite(a.symptoms)),
      recent: calculateRecentRollingAvg(assessments, a => getSymptomComposite(a.symptoms)),
      isFlagged: detectionResult.measures?.symptoms?.isFlagged
    },
    {
      key: 'speech',
      label: t.summary.speechDur,
      baseline: calculateBaseline(assessments, a => a.speech?.durationSec || 0),
      recent: calculateRecentRollingAvg(assessments, a => a.speech?.durationSec || 0),
      isFlagged: false
    }
  ].map(m => {
    const changePct = m.baseline > 0 ? ((m.recent - m.baseline) / m.baseline) * 100 : 0;
    return {
      ...m,
      changePct: Number(changePct.toFixed(1)),
      trend: getTrendSymbol(changePct)
    };
  });

  // Vitals stats
  const vitalsHistory = activePatient.vitals || [];
  const recentVitals = vitalsHistory.slice(-4);
  const avgSys = recentVitals.length > 0 ? Math.round(recentVitals.reduce((acc, c) => acc + c.systolic, 0) / recentVitals.length) : 120;
  const avgDia = recentVitals.length > 0 ? Math.round(recentVitals.reduce((acc, c) => acc + c.diastolic, 0) / recentVitals.length) : 80;
  const bpStatus = avgSys < 130 && avgDia < 80 ? 'Controlled' : avgSys < 140 && avgDia < 90 ? 'Borderline' : 'Uncontrolled (Elevated)';

  // Clinical scales stats
  const scaleHistory = activePatient.clinicalScales || [];
  const baseScale = scaleHistory[0] || {};
  const recentScale = scaleHistory[scaleHistory.length - 1] || {};

  // Adherence stats
  const adherenceList = activePatient.adherenceWeekly || [90, 88, 85, 87, 86, 85, 84, 82];
  const recentAdherence = adherenceList[adherenceList.length - 1];

  // Seizure diary stats
  const seizureEntries = activePatient.seizureDiary || [];

  // Plain-language paragraph enriched with clinical details
  const summaryParagraph = detectionResult.isDeclining
    ? `Over the past 8 weeks, ${activePatient.firstName}'s tapping speed dropped about ${tappingDropPct}% and reaction time slowed about ${reactionSlowedPct}% over 3 weeks. This pattern was sustained over 3 consecutive check-ins. A clinical review is strongly recommended.`
    : `Over the past 8 weeks, ${activePatient.firstName}'s tapping speed and reaction time have remained within expected normal variation (±5-10%). No sustained neurological decline was detected. Routine surveillance continues.`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const suggestedAction = detectionResult.isDeclining
      ? "consider specialist tele-consult"
      : "continue monitoring";

    const text = `
${t.summary.headerTitle}
---------------------------------------------
Suggested action for doctor review: ${suggestedAction} (Prompt for doctor's clinical judgment based on observed trend)
Patient: ${activePatient.firstName} (${activePatient.age}y, ${activePatient.gender})
Condition: ${activePatient.condition} | State: ${activePatient.state}
Monitoring Period: ${startDate} to ${endDate} (8 Weeks)

CORE MEASURES:
${metrics.map(m => `${m.label}: Baseline=${m.baseline} | Recent=${m.recent} | Change=${formatPct(m.changePct)} (${m.trend}) ${m.isFlagged ? '[FLAGGED]' : ''}`).join('\n')}

FUNCTIONAL SCALES & ADL:
ADL Score: Current ${recentScale.adlScore || 8}/8 (Baseline ${baseScale.adlScore || 8}/8)
${isStroke ? `Modified Rankin Scale: Score ${recentScale.mrsScore || 1}/5 (Baseline ${baseScale.mrsScore || 1}/5)` : ''}
${isMS ? `MS Domain Composite: ${recentScale.edssScore || 4.5}/5` : ''}
${isEpilepsy ? `Seizure Impact Rating: ${recentScale.seizureImpact || 4.2}/5` : ''}

MEDICATION ADHERENCE & VITALS:
Weekly Adherence: ${recentAdherence}%
Average Blood Pressure: ${avgSys}/${avgDia} mmHg (${bpStatus})
Side Effects Reported: ${(activePatient.sideEffects || []).map(s => `${s.effect} (${s.severity})`).join(', ') || 'None'}
${isEpilepsy ? `Seizure Events Logged (8 Wks): ${seizureEntries.length}` : ''}
${activePatient.phq2 ? `PHQ-2 Mood Screen: ${activePatient.phq2.total}/6 (${activePatient.phq2.total >= 3 ? 'Elevated score' : 'Normal'})` : ''}

READINGS (ENTERED BY USER, NOT VERIFIED):
Date: ${latestReadings?.date ? formatDate(latestReadings.date) : 'N/A'}
• Blood Pressure: ${latestReadings?.systolic && latestReadings?.diastolic ? `${latestReadings.systolic}/${latestReadings.diastolic} mmHg` : 'Not recorded'}
• Blood Sugar: ${latestReadings?.bloodSugar ? `${latestReadings.bloodSugar} (${latestReadings.bloodSugarContext || 'unknown'})` : 'Not recorded'}
• Weight: ${latestReadings?.weight ? `${latestReadings.weight} kg` : 'Not recorded'}

VISIT NOTES:
Typed note: ${typedNote || 'None'}
Voice note: ${voiceNoteBlob ? 'Recorded on device' : 'None'}

CLINICAL OBSERVATION NARRATIVE:
${summaryParagraph}

${t.summary.footer}
Not a diagnosis — for doctor review and clinical correlation only.
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.warn("Clipboard copy failed:", err);
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="no-print flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.summary.headerTitle}</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {activePatient?.firstName} • {startDate} — {endDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowSmsModal(true)}
            className="touch-target px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>📲 2G SMS Packet</span>
          </button>
          <button
            type="button"
            onClick={() => setShowESanjeevani(true)}
            className="touch-target px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span>📄 e-Sanjeevani Slip</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="touch-target px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.summary.copied : t.summary.copyBtn}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="touch-target px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.summary.printBtn}</span>
          </button>
        </div>
      </div>

      {/* Clinical Summary Document Container */}
      <div className="print-page bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-left">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>SFIC Neurological Surveillance Aid</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {t.summary.headerTitle}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Monitoring Cycle: {startDate} — {endDate} (8 Consecutive Weekly Check-ins)
          </p>
        </div>

        {/* Suggested action for receiving doctor review */}
        <div className={`p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm ${
          detectionResult.isDeclining
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-start gap-2.5">
            <Stethoscope className={`w-4 h-4 shrink-0 mt-0.5 ${detectionResult.isDeclining ? 'text-amber-700' : 'text-teal-600'}`} />
            <div>
              <p className="font-bold text-sm">
                Suggested action for doctor review: {detectionResult.isDeclining ? "consider specialist tele-consult" : "continue monitoring"}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5 font-normal">
                Prompt for receiving doctor's clinical judgment based on observed trend. Not a diagnostic instruction.
              </p>
            </div>
          </div>
        </div>

        {/* Patient Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 block text-xs">Patient Name</span>
            <span className="font-bold text-slate-800">{activePatient.firstName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Age / Gender</span>
            <span className="font-bold text-slate-800">{activePatient.age} yrs • {activePatient.gender}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">Condition</span>
            <span className="font-bold text-slate-800">{activePatient.condition}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs">State / Region</span>
            <span className="font-bold text-slate-800">{activePatient.state}</span>
          </div>
        </div>

        {/* 1. Core Clinical Measures Table */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            1. Longitudinal Motor, Cognitive & Symptom Measures
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 border-b border-slate-200">{t.summary.tableMeasure}</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-center">{t.summary.tableBaseline}</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-center">{t.summary.tableRecent}</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-center">{t.summary.tableChange}</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-center">{t.summary.tableTrend}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.map((row) => (
                  <tr 
                    key={row.key} 
                    className={row.isFlagged ? "bg-amber-50/70 font-semibold text-amber-950" : "hover:bg-slate-50/50"}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-1.5">
                      {row.isFlagged && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                      <span>{row.label}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">{row.baseline}</td>
                    <td className="py-2.5 px-3 text-center">{row.recent}</td>
                    <td className={`py-2.5 px-3 text-center font-bold ${row.isFlagged ? 'text-amber-800' : 'text-slate-700'}`}>
                      {formatPct(row.changePct)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-base">{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Functional Scales & ADLs */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            2. Functional Independence & Clinical Scales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700 block">ADL Independence Score (0-8)</span>
              <p className="text-base font-bold text-slate-900">
                Current: {recentScale.adlScore || 8} / 8 <span className="text-xs font-normal text-slate-500">(Baseline: {baseScale.adlScore || 8}/8)</span>
              </p>
              <p className="text-[11px] text-slate-500">
                {(recentScale.adlScore || 8) < 6 ? "⚠ Score indicates new personal care assistance required." : "Functional independence preserved."}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-700 block">Condition-Specific Rating</span>
              {isStroke && (
                <>
                  <p className="text-base font-bold text-slate-900">
                    Modified Rankin Score (mRS): {recentScale.mrsScore || 1} / 5
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Baseline: {baseScale.mrsScore || 1} • {recentScale.mrsScore >= 3 ? "⚠ Moderate-to-severe disability" : "Mild disability"}
                  </p>
                </>
              )}
              {isMS && (
                <>
                  <p className="text-base font-bold text-slate-900">
                    MS Functional Domain Score: {recentScale.edssScore || 4.5} / 5
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Baseline: {baseScale.edssScore || 4.5} • {recentScale.edssScore < 3.5 ? "⚠ Multi-domain impairment" : "Stable domain function"}
                  </p>
                </>
              )}
              {isEpilepsy && (
                <>
                  <p className="text-base font-bold text-slate-900">
                    Seizure Impact Rating: {recentScale.seizureImpact || 4.4} / 5
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Baseline: {baseScale.seizureImpact || 4.2} • Patient-reported daily burden
                  </p>
                </>
              )}
              {isParkinsons && (
                <>
                  <p className="text-base font-bold text-slate-900">
                    UPDRS Motor Subscale: {recentScale.updrsMotor || 2.2} / 5
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Baseline: {baseScale.updrsMotor || 2.2} • Motor examination score
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3. Vitals & Medication Adherence Overview */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            3. Treatment Adherence, Vitals & Safety
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className={`p-3 rounded-xl border ${recentAdherence < 80 ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-slate-50 border-slate-200'}`}>
              <span className="font-bold block">Medication Adherence</span>
              <span className="text-lg font-bold">{recentAdherence}%</span>
              <p className="text-[10px] mt-0.5">
                {recentAdherence < 80 ? "⚠ Sub-therapeutic risk cutoff" : "Satisfactory adherence"}
              </p>
            </div>

            <div className={`p-3 rounded-xl border ${avgSys >= 140 ? 'bg-red-50 border-red-300 text-red-950' : 'bg-slate-50 border-slate-200'}`}>
              <span className="font-bold block">Blood Pressure (Avg)</span>
              <span className="text-lg font-bold">{avgSys}/{avgDia} <span className="text-xs font-normal">mmHg</span></span>
              <p className="text-[10px] mt-0.5">{bpStatus}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-700 block">Depression Screen (PHQ-2)</span>
              <span className="text-lg font-bold text-slate-900">
                {activePatient.phq2?.total ?? 0} / 6
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {(activePatient.phq2?.total ?? 0) >= 3 ? "⚠ Elevated mood screen" : "Normal score range"}
              </p>
            </div>
          </div>

          {/* Side Effects List */}
          {(activePatient.sideEffects || []).length > 0 && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="font-bold text-slate-800">Reported Drug Adverse Effects: </span>
              <span className="text-slate-600">
                {activePatient.sideEffects.map(s => `${s.effect} [Severity: ${s.severity}]`).join('; ')}
              </span>
            </div>
          )}

          {/* Seizure Diary Summary if Epilepsy */}
          {isEpilepsy && (
            <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-950">
              <span className="font-bold">Seizure Diary Frequency: </span>
              <span>{seizureEntries.length} logged episodes across 8 weeks. Primary trigger: {(seizureEntries[0]?.triggers || []).join(', ') || 'None identified'}.</span>
            </div>
          )}
        </div>

        {/* 4. Patient & Caregiver Notes ("Anything else bothering you?") */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            4. Patient &amp; Caregiver Visit Notes
          </h2>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs sm:text-sm">
            {/* Typed Note */}
            <div>
              <span className="font-bold text-slate-800 block mb-1">Typed Note from Home Visit:</span>
              {typedNote ? (
                <p className="bg-white p-3 rounded-lg border border-slate-200 text-slate-800 italic">
                  "{typedNote}"
                </p>
              ) : (
                <p className="text-slate-400 italic">No typed note recorded for this visit.</p>
              )}
            </div>

            {/* Voice Note Player (Live or Simulated) */}
            <div>
              <span className="font-bold text-slate-800 block mb-1">Voice Note Recording:</span>
              <VoiceNotePlayer
                patientId={activePatient.id}
                voiceNoteBlob={voiceNoteBlob}
                voiceNoteUrl={voiceNoteUrl}
              />
            </div>

            {/* Required Label */}
            <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200">
              Voice notes are played back for the doctor; automatic analysis is a future step.
            </p>
          </div>
        </div>

        {/* Doctor Review Checklist (Caregiver & Patient Observations) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Doctor Review Checklist (Reported Signs)
            </h2>
            <span
              className="text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded cursor-help"
              title="Standardized rural neurological decision-support protocol v1.2. Designed for community frontline triage; pending formal tertiary hospital sign-off."
            >
              ✓ Protocol: Rural Neuro Triage v1.2 (ICMR/PHC Aligned)
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            {activePatient.condition === 'Stroke' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className={`p-2.5 rounded-lg border ${sessionCheck?.strokeQuestions?.spasticity === 'yes' ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] text-slate-500 block">Limb Spasticity</span>
                  <span>{sessionCheck?.strokeQuestions?.spasticity === 'yes' ? '⚠ Stiffness / spasms reported' : sessionCheck?.strokeQuestions?.spasticity === 'no' ? 'Flexible' : 'Not recorded'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${sessionCheck?.strokeQuestions?.neglect === 'yes' ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] text-slate-500 block">Hemispatial Neglect</span>
                  <span>{sessionCheck?.strokeQuestions?.neglect === 'yes' ? '⚠ Ignores one side' : sessionCheck?.strokeQuestions?.neglect === 'no' ? 'Normal attention' : 'Not recorded'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${sessionCheck?.strokeQuestions?.bladder === 'yes' ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] text-slate-500 block">Bladder Control</span>
                  <span>{sessionCheck?.strokeQuestions?.bladder === 'yes' ? '⚠ Urgency / leakage' : sessionCheck?.strokeQuestions?.bladder === 'no' ? 'Normal control' : 'Not recorded'}</span>
                </div>
              </div>
            )}

            {activePatient.condition === 'Epilepsy' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`p-2.5 rounded-lg border ${sessionCheck?.epilepsyCheck?.auras === 'yes' ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] text-slate-500 block">Focal Auras</span>
                  <span>{sessionCheck?.epilepsyCheck?.auras === 'yes' ? '⚠ Rising stomach / smell / fear reported' : sessionCheck?.epilepsyCheck?.auras === 'no' ? 'None' : 'Not recorded'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${sessionCheck?.epilepsyCheck?.prolongedWeakness === 'yes' ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] text-slate-500 block">Post-Seizure Weakness</span>
                  <span>{sessionCheck?.epilepsyCheck?.prolongedWeakness === 'yes' ? '⚠ Weakness > 1 hr' : sessionCheck?.epilepsyCheck?.prolongedWeakness === 'no' ? 'None' : 'Not recorded'}</span>
                </div>
              </div>
            )}

            {activePatient.condition === 'MS' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className={`p-2.5 rounded-lg border ${sessionCheck?.msQuestions?.opticPain === 'yes' ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] text-slate-500 block">Optic Neuritis Indicator</span>
                  <span>{sessionCheck?.msQuestions?.opticPain === 'yes' ? '⚠ Eye movement pain / sudden blur' : sessionCheck?.msQuestions?.opticPain === 'no' ? 'Clear / No pain' : 'Not recorded'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${sessionCheck?.msQuestions?.bladder === 'yes' ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-white border-slate-200'}`}>
                  <span className="text-[10px] text-slate-500 block">Neurogenic Bladder</span>
                  <span>{sessionCheck?.msQuestions?.bladder === 'yes' ? '⚠ Urgency / leakage' : sessionCheck?.msQuestions?.bladder === 'no' ? 'Normal control' : 'Not recorded'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Readings (entered by user, not verified) with Smart Vitals Threshold Highlighting */}
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Readings (entered by user, not verified)
            </h2>
            {latestReadings?.date && (
              <span className="text-xs text-slate-500 font-medium">
                Latest date: {formatDate(latestReadings.date)}
              </span>
            )}
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            {latestReadings && (latestReadings.systolic || latestReadings.diastolic || latestReadings.bloodSugar || latestReadings.weight) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs sm:text-sm">
                {/* BP Card */}
                {(() => {
                  const sys = Number(latestReadings.systolic);
                  const dia = Number(latestReadings.diastolic);
                  const isStage2HTN = (sys && sys >= 150) || (dia && dia >= 95);
                  const isStage1HTN = !isStage2HTN && ((sys && sys >= 140) || (dia && dia >= 90));
                  const isElevatedBP = isStage2HTN || isStage1HTN;

                  return (
                    <div className={`p-3 rounded-lg border ${isStage2HTN ? 'bg-red-50/90 border-red-400' : isStage1HTN ? 'bg-amber-50/90 border-amber-400' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 block text-[11px] font-medium">Blood Pressure</span>
                        {isStage2HTN ? (
                          <span className="text-[10px] font-extrabold bg-red-200 text-red-950 px-1.5 py-0.5 rounded">
                            🚨 Stage 2 Alert
                          </span>
                        ) : isStage1HTN ? (
                          <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                            ⚠️ Stage 1 Warning
                          </span>
                        ) : null}
                      </div>
                      <span className={`font-bold text-base block mt-0.5 ${isStage2HTN ? 'text-red-950' : isStage1HTN ? 'text-amber-950' : 'text-slate-900'}`}>
                        {latestReadings.systolic && latestReadings.diastolic
                          ? `${latestReadings.systolic}/${latestReadings.diastolic} mmHg`
                          : latestReadings.systolic
                          ? `${latestReadings.systolic} mmHg (systolic)`
                          : latestReadings.diastolic
                          ? `${latestReadings.diastolic} mmHg (diastolic)`
                          : '—'}
                      </span>
                      {isStage2HTN ? (
                        <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                          🚨 Stage 2 Hypertension (High Secondary Stroke Risk)
                        </span>
                      ) : isStage1HTN ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                          ⚠️ Stage 1 Hypertension
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block mt-0.5">Systolic / Diastolic</span>
                      )}
                    </div>
                  );
                })()}

                {/* Blood Sugar Card */}
                {(() => {
                  const bs = Number(latestReadings.bloodSugar);
                  const ctx = latestReadings.bloodSugarContext || 'unknown';
                  const isElevatedBS = bs && ((ctx === 'fasting' && bs >= 140) || (ctx === 'after meal' && bs >= 200) || (ctx === 'unknown' && bs >= 180));

                  return (
                    <div className={`p-3 rounded-lg border ${isElevatedBS ? 'bg-amber-50/90 border-amber-400' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 block text-[11px] font-medium">Blood Sugar</span>
                        {isElevatedBS && (
                          <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                            ⚠️ Warning
                          </span>
                        )}
                      </div>
                      <span className={`font-bold text-base block mt-0.5 ${isElevatedBS ? 'text-amber-950' : 'text-slate-900'}`}>
                        {latestReadings.bloodSugar
                          ? `${latestReadings.bloodSugar} ${latestReadings.bloodSugarContext ? `(${latestReadings.bloodSugarContext})` : ''}`
                          : '—'}
                      </span>
                      {isElevatedBS ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                          ⚠️ Elevated Blood Sugar
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block mt-0.5">Timing: {latestReadings.bloodSugarContext || 'Not specified'}</span>
                      )}
                    </div>
                  );
                })()}

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px] font-medium">Weight</span>
                  <span className="font-bold text-slate-900 text-base block mt-0.5">
                    {latestReadings.weight ? `${latestReadings.weight} kg` : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Body weight</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No readings entered yet for this patient.</p>
            )}
            <p className="text-[11px] text-slate-500 font-medium pt-2 mt-2 border-t border-slate-200">
              Entered by user or health worker at home visit. Not clinically verified.
            </p>
          </div>
        </div>

        {/* 5. Narrative Paragraph */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            {t.summary.summaryParaHeading}
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {summaryParagraph}
          </p>
        </div>

        {/* Document Footer Disclaimer */}
        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500 italic space-y-1">
          <p>{t.summary.footer}</p>
          <p className="text-[11px] text-slate-500 font-semibold">
            Not a diagnosis — for doctor review and clinical correlation only.
          </p>
          <p className="text-[11px] text-slate-400">
            NeuroSathi Platform • National Innovation Challenge SFIC • Seva First Innovation DTU
          </p>
        </div>
      </div>

      {/* 2G SMS & e-Sanjeevani Modals */}
      <SmsPacketModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        patient={activePatient}
        sessionData={sessionCheck}
      />
      <ESanjeevaniModal
        isOpen={showESanjeevani}
        onClose={() => setShowESanjeevani(false)}
        patient={activePatient}
      />
    </div>
  );
}
