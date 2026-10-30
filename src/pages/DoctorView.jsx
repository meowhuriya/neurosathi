import React, { useState, useEffect, useRef } from 'react';
import {
  Stethoscope,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  Activity,
  Brain,
  Pill,
  Users
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { calculatePatientMetrics, calculateBaseline, calculateRecentRollingAvg } from '../utils/scoring';
import { useDeclineDetection } from '../hooks/useDeclineDetection';
import { getTypedNote, getLatestVoiceNote } from '../utils/audioStorage';
import { getLatestReadings } from '../utils/readingsStorage';
import { formatDate } from '../utils/formatters';

export function DoctorView({
  t,
  currentLang = 'en',
  activePatient,
  patients = [],
  setActivePatientId,
  threshold = 0.20
}) {
  const patient = activePatient || patients[0] || { firstName: 'Lakshmi', condition: 'MS', id: 'NS-001' };
  const assessments = patient.assessments || [];
  const detectionResult = useDeclineDetection(assessments, threshold);
  const metrics = calculatePatientMetrics(assessments);
  const { tappingDropPct, reactionSlowedPct, baseTapping, recentTapping, baseReactionMs, recentReactionMs } = metrics;

  const [copied, setCopied] = useState(false);
  const [typedNote, setTypedNote] = useState('');
  const [voiceNoteBlob, setVoiceNoteBlob] = useState(null);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const audioRef = useRef(null);
  const [latestReadings, setLatestReadings] = useState(null);

  const startDate = assessments[0]?.date ? formatDate(assessments[0].date) : "N/A";
  const endDate = assessments[assessments.length - 1]?.date ? formatDate(assessments[assessments.length - 1].date) : "N/A";

  const isDecline = Boolean(detectionResult.isDeclining || tappingDropPct >= 20 || reactionSlowedPct >= 20);

  // Load patient notes & latest user-entered readings
  useEffect(() => {
    let isMounted = true;
    const note = getTypedNote(patient.id);
    setTypedNote(note || '');

    const readings = getLatestReadings(patient);
    setLatestReadings(readings);

    getLatestVoiceNote(patient.id).then((res) => {
      if (isMounted && res?.blob) {
        setVoiceNoteBlob(res.blob);
        const url = URL.createObjectURL(res.blob);
        setVoiceNoteUrl(url);
      } else if (isMounted) {
        setVoiceNoteBlob(null);
        setVoiceNoteUrl(null);
      }
    });

    return () => {
      isMounted = false;
      if (voiceNoteUrl) URL.revokeObjectURL(voiceNoteUrl);
    };
  }, [patient.id]);

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

  // 8-week trend chart data
  const baseLeft = calculateBaseline(assessments, (a) => a.motor?.leftTaps || 0);
  const baseProc = calculateBaseline(assessments, (a) => a.processing?.correct || 0);

  const chartData = assessments.map((a, idx) => ({
    week: `Wk ${idx + 1}`,
    date: a.date,
    leftTaps: a.motor?.leftTaps || 0,
    rightTaps: a.motor?.rightTaps || 0,
    reactionMatches: a.processing?.correct || 0
  }));

  const handleCopySummary = () => {
    const bpStr = latestReadings?.systolic && latestReadings?.diastolic
      ? `${latestReadings.systolic}/${latestReadings.diastolic} mmHg`
      : latestReadings?.systolic
      ? `${latestReadings.systolic} mmHg (systolic)`
      : latestReadings?.diastolic
      ? `${latestReadings.diastolic} mmHg (diastolic)`
      : 'Not recorded';
    const bsStr = latestReadings?.bloodSugar
      ? `${latestReadings.bloodSugar} (${latestReadings.bloodSugarContext || 'unknown'})`
      : 'Not recorded';
    const wtStr = latestReadings?.weight
      ? `${latestReadings.weight} kg`
      : 'Not recorded';

    const text = `
Doctor Clinical Summary (NeuroSathi)
------------------------------------
Patient: ${patient.firstName} (${patient.age}y, ${patient.gender})
Condition: ${patient.condition} • State: ${patient.state}
Assigned ASHA Worker: ${patient.healthWorkerId || 'ASHA-TS-04'}
Monitoring Period: ${startDate} to ${endDate} (8 Weeks)

Suggested for doctor review: ${isDecline ? "consider specialist tele-consult" : "continue monitoring"}
(Prompt for doctor's clinical judgment based on observed longitudinal trend, not an instruction)

LONGITUDINAL FINDINGS:
• Tapping Speed: Baseline ${baseTapping} taps → Recent ${recentTapping} taps (${tappingDropPct}% drop) ${tappingDropPct >= 20 ? '[FLAGGED]' : ''}
• Reaction Time: Baseline ${baseReactionMs} ms → Recent ${recentReactionMs} ms (${reactionSlowedPct}% slowed) ${reactionSlowedPct >= 20 ? '[FLAGGED]' : ''}

READINGS (ENTERED BY USER, NOT VERIFIED):
Date: ${latestReadings?.date ? formatDate(latestReadings.date) : 'N/A'}
• Blood Pressure: ${bpStr}
• Blood Sugar: ${bsStr}
• Weight: ${wtStr}

PATIENT VISIT NOTE:
${typedNote ? `"${typedNote}"` : 'None recorded'}
Voice note: ${voiceNoteBlob ? 'Recorded on device' : 'None'}

Monitoring aid. Not a diagnosis. Sample data.
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-left py-2">
      {/* Top Patient Selector & Action Bar */}
      <div className="no-print flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <label htmlFor="doctor-patient-select" className="text-xs font-bold text-slate-700">
            Select Patient:
          </label>
          <select
            id="doctor-patient-select"
            value={patient.id}
            onChange={(e) => setActivePatientId && setActivePatientId(e.target.value)}
            className="text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} — {p.condition} ({p.age}y, {p.state})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="touch-target px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-300 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Summary"}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="touch-target px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Clinical Document Container (Read-Only) */}
      <div className="print-page bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Patient Header */}
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Portal • Longitudinal Surveillance</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              8-Week Cycle: {startDate} — {endDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {patient.firstName}
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 text-xs sm:text-sm">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Age &amp; Gender</span>
              <span className="font-bold text-slate-900">{patient.age} yrs • {patient.gender}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Primary Condition</span>
              <span className="font-bold text-slate-900">{patient.condition}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">State / Region</span>
              <span className="font-bold text-slate-900">{patient.state}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Assigned ASHA Worker</span>
              <span className="font-bold text-slate-900">{patient.healthWorkerId || "ASHA-TS-04"}</span>
            </div>
          </div>
        </div>

        {/* Suggested Review Line: prompt for doctor's judgment, not an instruction */}
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm ${
          isDecline
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
        }`}>
          <div className="flex items-start gap-2.5">
            <Stethoscope className={`w-5 h-5 shrink-0 mt-0.5 ${isDecline ? 'text-amber-700' : 'text-emerald-700'}`} />
            <div>
              <p className="font-extrabold text-sm sm:text-base">
                Suggested for doctor review: {isDecline ? "consider specialist tele-consult" : "continue monitoring"}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5 font-normal">
                Prompt for the doctor's clinical judgment based on observed longitudinal trend, not an instruction.
              </p>
            </div>
          </div>
        </div>

        {/* Flagged Measures Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            1. Flagged Longitudinal Measures
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className={`p-3.5 rounded-xl border ${tappingDropPct >= 20 ? 'bg-amber-50/80 border-amber-300 text-amber-950' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold">🖐️ Finger Tapping Speed</span>
                {tappingDropPct >= 20 && (
                  <span className="text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    Flagged
                  </span>
                )}
              </div>
              <p className="text-lg font-extrabold mt-1">
                {recentTapping} taps <span className="text-xs font-normal text-slate-500">(Baseline: {baseTapping} taps)</span>
              </p>
              <p className="text-xs font-semibold mt-0.5 text-slate-600">
                {tappingDropPct}% drop over 3 weeks
              </p>
            </div>

            <div className={`p-3.5 rounded-xl border ${reactionSlowedPct >= 20 ? 'bg-amber-50/80 border-amber-300 text-amber-950' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold">🧠 Reaction Time</span>
                {reactionSlowedPct >= 20 && (
                  <span className="text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    Flagged
                  </span>
                )}
              </div>
              <p className="text-lg font-extrabold mt-1">
                {recentReactionMs} ms <span className="text-xs font-normal text-slate-500">(Baseline: {baseReactionMs} ms)</span>
              </p>
              <p className="text-xs font-semibold mt-0.5 text-slate-600">
                {reactionSlowedPct}% slowed over 3 weeks
              </p>
            </div>
          </div>
        </div>

        {/* 8-Week Trend Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              2. 8-Week Trend Chart (Motor &amp; Cognitive)
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Weekly Home Visits
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full bg-slate-50/60 p-3 rounded-2xl border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
                <ReferenceLine y={baseLeft} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Base', fill: '#64748b', fontSize: 10 }} />
                <Line type="monotone" dataKey="leftTaps" name="Left Hand Taps" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rightTaps" name="Right Hand Taps" stroke="#475569" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="reactionMatches" name="Cognitive Matches" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Visit Notes: Typed Note & Play Button for Voice Note */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            3. Patient Visit Notes
          </h2>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm">
            {/* Typed Note */}
            <div>
              <span className="font-bold text-slate-800 block mb-1">Typed Note from Home Visit:</span>
              {typedNote ? (
                <p className="bg-white p-3.5 rounded-xl border border-slate-200 text-slate-800 italic leading-relaxed">
                  "{typedNote}"
                </p>
              ) : (
                <p className="text-slate-400 italic">No typed note recorded for this visit.</p>
              )}
            </div>

            {/* Voice Note Player */}
            <div>
              <span className="font-bold text-slate-800 block mb-1">Voice Note Recording:</span>
              {voiceNoteUrl ? (
                <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <button
                    type="button"
                    onClick={handleTogglePlayVoice}
                    className="touch-target w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                    aria-label={isPlayingVoice ? "Pause voice note" : "Play voice note"}
                  >
                    {isPlayingVoice ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <span className="font-bold text-slate-800 text-xs block">Play patient's voice note</span>
                    <span className="text-[11px] text-slate-500">Stored on device during Step 1 Check</span>
                  </div>
                  <audio
                    ref={audioRef}
                    src={voiceNoteUrl}
                    onEnded={() => setIsPlayingVoice(false)}
                    className="hidden"
                  />
                </div>
              ) : (
                <p className="text-slate-400 italic">No voice note audio recorded.</p>
              )}
            </div>

            {/* Required analysis label */}
            <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200">
              Voice notes are played back for the doctor; automatic analysis is a future step.
            </p>
          </div>
        </div>

        {/* Readings (entered by user, not verified) */}
        <div className="space-y-3">
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

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            {latestReadings && (latestReadings.systolic || latestReadings.diastolic || latestReadings.bloodSugar || latestReadings.weight) ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px] font-medium">Blood Pressure</span>
                  <span className="font-bold text-slate-900 text-base block mt-0.5">
                    {latestReadings.systolic && latestReadings.diastolic
                      ? `${latestReadings.systolic}/${latestReadings.diastolic} mmHg`
                      : latestReadings.systolic
                      ? `${latestReadings.systolic} mmHg (systolic)`
                      : latestReadings.diastolic
                      ? `${latestReadings.diastolic} mmHg (diastolic)`
                      : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Systolic / Diastolic</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px] font-medium">Blood Sugar</span>
                  <span className="font-bold text-slate-900 text-base block mt-0.5">
                    {latestReadings.bloodSugar
                      ? `${latestReadings.bloodSugar} ${latestReadings.bloodSugarContext ? `(${latestReadings.bloodSugarContext})` : ''}`
                      : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Timing: {latestReadings.bloodSugarContext || 'Not specified'}
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
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
            <p className="text-[11px] text-slate-500 font-medium pt-2 mt-2.5 border-t border-slate-200">
              Entered by user or health worker at home visit. Not clinically verified.
            </p>
          </div>
        </div>

        {/* Footer: Monitoring aid. Not a diagnosis. Sample data. */}
        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-600">
            Monitoring aid. Not a diagnosis. Sample data.
          </p>
          <p className="text-[11px] text-slate-400">
            NeuroSathi Platform • SFIC DTU Innovation Challenge Prototype
          </p>
        </div>
      </div>
    </div>
  );
}
