import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  CalendarCheck,
  FileText,
  Printer,
  Copy,
  ExternalLink,
  Phone,
  Check,
  Award,
  MessageSquare
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { evaluatePatientDecline, calculatePatientMetrics } from '../utils/scoring';
import { getLatestReadings } from '../utils/readingsStorage';
import { formatDate } from '../utils/formatters';
import { PublicHealthCard } from '../components/PublicHealthCard';
import { SmsPacketModal } from '../components/SmsPacketModal';
import { ESanjeevaniModal } from '../components/ESanjeevaniModal';

export function Home({
  t,
  currentLang,
  setLanguage,
  activePatient,
  patients,
  setActivePatientId,
  setPatients
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [kpiFilter, setKpiFilter] = useState('all'); // 'all' | 'needs-visit' | 'followup-due' | 'completed'
  const [conditionFilter, setConditionFilter] = useState('all'); // 'all' | 'MS' | 'Stroke' | "Parkinson's" | 'Epilepsy'
  const [carePlanPatient, setCarePlanPatient] = useState(null);
  const [viewDoctorSummaryPatient, setViewDoctorSummaryPatient] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [followUpVisitMsg, setFollowUpVisitMsg] = useState('');
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showESanjeevani, setShowESanjeevani] = useState(false);

  // Evaluate patients with decline detection
  const patientStats = useMemo(() => {
    let needsDoctorVisitCount = 0;
    let pendingVisits = 0;
    let completedVisits = 0;

    const evaluatedPatients = patients.map((p) => {
      const evaluation = evaluatePatientDecline(p.assessments, 0.20);
      const isNeedsVisit = evaluation.isDeclining;
      if (isNeedsVisit) needsDoctorVisitCount += 1;

      const isConfirmed = Boolean(p.followUp?.visitConfirmed);
      if (isConfirmed) completedVisits += 1;
      else pendingVisits += 1;

      // Calculate unified metrics for patient
      const metrics = calculatePatientMetrics(p.assessments);

      return {
        ...p,
        isNeedsVisit,
        isDeclining: evaluation.isDeclining,
        evaluation,
        baseTapping: metrics.baseTapping,
        recentTapping: metrics.recentTapping,
        tappingDropPct: metrics.tappingDropPct,
        baseReactionMs: metrics.baseReactionMs,
        recentReactionMs: metrics.recentReactionMs,
        reactionSlowedPct: metrics.reactionSlowedPct,
        baseProc: metrics.baseProc,
        recentProc: metrics.recentProc,
        isConfirmed
      };
    });

    // Patients needing attention appear first
    evaluatedPatients.sort((a, b) => {
      if (a.isNeedsVisit && !b.isNeedsVisit) return -1;
      if (!a.isNeedsVisit && b.isNeedsVisit) return 1;
      return 0;
    });

    const priorityQueue = evaluatedPatients.filter(p => p.isNeedsVisit);

    return {
      evaluatedPatients,
      totalCount: patients.length,
      needsDoctorVisitCount,
      pendingVisits,
      completedVisits,
      priorityQueue
    };
  }, [patients]);

  // Combined filtering: Search Query + KPI Filter + Condition Filter
  const displayedPatients = useMemo(() => {
    let list = [...patientStats.evaluatedPatients];

    // 1. KPI Filter
    if (kpiFilter === 'needs-visit') {
      list = list.filter(p => p.isNeedsVisit);
    } else if (kpiFilter === 'followup-due') {
      list = list.filter(p => !p.isConfirmed);
    } else if (kpiFilter === 'completed') {
      list = list.filter(p => p.isConfirmed);
    }

    // 2. Condition Filter
    if (conditionFilter !== 'all') {
      list = list.filter(p => p.condition === conditionFilter);
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.firstName.toLowerCase().includes(q) ||
        p.condition.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [patientStats.evaluatedPatients, kpiFilter, conditionFilter, searchQuery]);

  const handleStartCheck = (patientId) => {
    setActivePatientId(patientId);
    navigate('/motor');
  };

  const handleMarkFollowUpDone = (patientId) => {
    if (!setPatients) return;
    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            followUp: {
              ...p.followUp,
              visitConfirmed: true,
              notes: "ASHA worker confirmed clinical follow-up completed."
            }
          };
        }
        return p;
      })
    );

    // Update in carePlanPatient if open
    setCarePlanPatient(prev => (prev && prev.id === patientId ? { ...prev, isConfirmed: true } : prev));
  };

  const handleConfirmVisitStatus = (patientId, status) => {
    if (status === 'yes') {
      handleMarkFollowUpDone(patientId);
      setFollowUpVisitMsg("✓ Confirmed: Clinical visit completed. Routine home surveillance continues.");
    } else if (status === 'not-yet') {
      setFollowUpVisitMsg("⏳ Reminder logged: Follow-up is due. Please assist with e-Sanjeevani booking.");
    } else {
      setFollowUpVisitMsg("🤝 Help requested: ASHA worker alerted to help with PM-JAY card or tele-OPD booking.");
    }
  };

  const handleCopySummary = (p) => {
    const suggestedAction = p.isNeedsVisit ? "consider specialist tele-consult" : "continue monitoring";
    const text = `NeuroSathi Clinical Summary for ${p.firstName} (${p.condition}, ${p.age}y - ${p.state})\n` +
      `Suggested action for doctor review: ${suggestedAction} (Prompt for doctor's clinical judgment)\n` +
      `Assigned ASHA Worker: ${p.healthWorkerId}\n` +
      `Status: ${p.isNeedsVisit ? 'Needs doctor visit' : 'Stable'}\n` +
      `Tapping Speed: Baseline ${p.baseTapping || 45.2} taps -> Recent ${p.recentTapping || 31.8} taps (${p.tappingDropPct || 30}% drop)\n` +
      `Reaction Time: Baseline ${p.baseReactionMs || 1140} ms -> Recent ${p.recentReactionMs || 1533} ms (${p.reactionSlowedPct || 35}% slowed)\n` +
      `Follow-up Status: ${p.followUp?.visitConfirmed ? 'Visit Confirmed' : 'Pending'}\n` +
      `Not a diagnosis — for doctor review only.\n` +
      `https://esanjeevani.mohfw.gov.in`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // -------------------------------------------------------------
  // CARE PLAN SCREEN (When ASHA worker taps "Review Care Plan")
  // -------------------------------------------------------------
  if (carePlanPatient) {
    const cp = patientStats.evaluatedPatients.find(p => p.id === carePlanPatient.id) || carePlanPatient;
    const chartData = (cp.assessments || []).map((a, idx) => ({
      week: `Wk ${idx + 1}`,
      leftTaps: a.motor?.leftTaps || 0,
      rightTaps: a.motor?.rightTaps || 0,
      reactionMatches: a.processing?.correct || 0
    }));

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Back Button */}
        <div>
          <button
            type="button"
            onClick={() => {
              setCarePlanPatient(null);
              setFollowUpVisitMsg('');
            }}
            className="touch-target inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Patients List</span>
          </button>
        </div>

        {/* 1. Header: Name, Age, Condition, State, Assigned ASHA Worker ID */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-base shadow-xs">
                {cp.firstName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                    {cp.firstName} — ASHA Care Plan
                  </h1>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-bold">
                    {cp.schemeEligibility || 'PM-JAY Eligible'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {cp.age} yrs • {cp.gender} • {cp.condition} • {cp.state} • <span className="font-mono text-teal-700 font-bold">ABHA: {cp.abhaId || '91-4523-8819-2041'}</span>
                </p>
              </div>
            </div>
            <span className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold">
              ASHA ID: {cp.healthWorkerId || "ASHA-TS-04"}
            </span>
          </div>

          {/* 2. "Why Flagged": One plain sentence + calculated numbers */}
          <div className="bg-red-50/90 border border-red-200 rounded-xl p-4 text-red-950 space-y-1 mt-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 block">
              🚨 Why Flagged for Urgent Doctor Review:
            </span>
            <p className="text-sm font-bold leading-relaxed">
              Tapping speed dropped about {cp.tappingDropPct}% (baseline: {cp.baseTapping} taps → recent: {cp.recentTapping} taps) and reaction time slowed about {cp.reactionSlowedPct}% over 3 weeks.
            </p>
          </div>
        </div>

        {/* 3. Trend Chart: 8-Week Chart for that patient */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              8-Week Tapping & Reaction Time Trend ({cp.tappingDropPct}% tapping drop, {cp.reactionSlowedPct}% reaction time slowed)
            </h2>
            <span className="text-xs text-slate-500 font-medium">Consecutive Weekly Checks</span>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
                <Line type="monotone" dataKey="leftTaps" name="Left Hand Taps" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rightTaps" name="Right Hand Taps" stroke="#475569" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="reactionMatches" name="Reaction Matches" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. "Next Steps" Checklist for the ASHA Worker */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Next Steps Checklist for ASHA Worker
          </h2>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
              <span className="font-semibold text-slate-800">1. Call or visit the patient at home</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
              <span className="font-semibold text-slate-800">2. Share and review the doctor summary with family</span>
            </div>

            {/* Book consult button */}
            <div className="pt-1">
              <a
                href="https://esanjeevani.mohfw.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>3. Book Free Doctor Consult on e-Sanjeevani</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Check Ayushman Bharat eligibility */}
            <div>
              <a
                href="https://pmjay.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="touch-target w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>4. Check Ayushman Bharat PM-JAY Cashless Eligibility</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Confirm the visit happened */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
              <span className="font-bold text-slate-900 block">5. Confirm whether the doctor visit happened:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmVisitStatus(cp.id, 'yes')}
                  className="touch-target py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center shadow-xs"
                >
                  Yes ✓
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmVisitStatus(cp.id, 'not-yet')}
                  className="touch-target py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs text-center"
                >
                  Not yet ⏳
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmVisitStatus(cp.id, 'need-help')}
                  className="touch-target py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs text-center"
                >
                  Need help 🤝
                </button>
              </div>

              {followUpVisitMsg && (
                <p className="text-xs font-semibold text-teal-800 bg-teal-50 p-2 rounded-lg border border-teal-200 mt-2">
                  {followUpVisitMsg}
                </p>
              )}
            </div>
          </div>

          {/* 5. Two Action Buttons: View Doctor Summary & Mark ASHA Follow-up Done */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => setViewDoctorSummaryPatient(cp)}
              className="touch-target flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>View Doctor Summary</span>
            </button>

            <button
              type="button"
              onClick={() => handleMarkFollowUpDone(cp.id)}
              className={`touch-target flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors ${
                cp.isConfirmed
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{cp.isConfirmed ? "ASHA Follow-Up Done ✓" : "Mark ASHA Follow-up Done"}</span>
            </button>
          </div>
        </div>

        {/* Public Health Support, Zero-Literacy Pill Guide & Jan Aushadhi Generic Savings */}
        <PublicHealthCard patient={cp} />
      </div>
    );
  }

  // -------------------------------------------------------------
  // DOCTOR SUMMARY MODAL / EMBED (If requested from care plan)
  // -------------------------------------------------------------
  if (viewDoctorSummaryPatient) {
    const p = viewDoctorSummaryPatient;
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <button
            type="button"
            onClick={() => setViewDoctorSummaryPatient(null)}
            className="touch-target inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Care Plan</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                Official Clinical Summary Slip
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {p.firstName} ({p.condition}, {p.age}y)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                State: {p.state} • ASHA Worker ID: {p.healthWorkerId || "ASHA-TS-04"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowSmsModal(true)}
                className="touch-target px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>📲 2G SMS Packet</span>
              </button>
              <button
                type="button"
                onClick={() => setShowESanjeevani(true)}
                className="touch-target px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 text-xs font-bold flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-teal-700" />
                <span>📄 e-Sanjeevani Slip</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="touch-target px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-300"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopySummary(p)}
                className="touch-target px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedSummary ? "Copied!" : "Copy Summary"}</span>
              </button>
            </div>
          </div>

          {/* Clinical summary text */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs sm:text-sm leading-relaxed text-slate-800">
            {/* Top line for receiving doctor */}
            <div className="pb-2.5 mb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900 block">
                Suggested action for doctor review: {p.isNeedsVisit ? "consider specialist tele-consult" : "continue monitoring"}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Prompt for receiving doctor's clinical judgment based on observed trend.
              </span>
            </div>

            <p className="font-bold text-slate-900">Longitudinal Surveillance Finding:</p>
            <p>
              Over the 8-week monitoring period, {p.firstName} ({p.condition}) exhibited a sustained decline: tapping speed dropped about {p.tappingDropPct}% (baseline {p.baseTapping} taps → recent 3-week rolling average {p.recentTapping} taps) and reaction time slowed about {p.reactionSlowedPct}% over 3 weeks.
            </p>
            <p>
              <strong>Follow-Up Status:</strong> {p.isConfirmed ? "Clinical consultation completed ✓" : "Pending consultation ⏳"}.
            </p>

            {/* Readings (entered by user, not verified) if available */}
            {(() => {
              const readings = getLatestReadings(p);
              if (!readings || (!readings.systolic && !readings.diastolic && !readings.bloodSugar && !readings.weight)) return null;
              return (
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">Readings (entered by user, not verified):</span>
                  <div className="text-xs text-slate-700 space-y-0.5">
                    {readings.date && <p>• Date: {formatDate(readings.date)}</p>}
                    {(readings.systolic || readings.diastolic) && (() => {
                      const sys = Number(readings.systolic);
                      const dia = Number(readings.diastolic);
                      const isStage2HTN = (sys && sys >= 150) || (dia && dia >= 95);
                      const isStage1HTN = !isStage2HTN && ((sys && sys >= 140) || (dia && dia >= 90));
                      return (
                        <p>
                          • Blood Pressure: {readings.systolic && readings.diastolic ? `${readings.systolic}/${readings.diastolic} mmHg` : readings.systolic ? `${readings.systolic} mmHg (systolic)` : `${readings.diastolic} mmHg (diastolic)`}
                          {isStage2HTN && <span className="text-red-700 font-bold ml-1.5">🚨 Stage 2 Hypertension (High Secondary Stroke Risk)</span>}
                          {isStage1HTN && <span className="text-amber-700 font-bold ml-1.5">⚠️ Stage 1 Hypertension</span>}
                        </p>
                      );
                    })()}
                    {readings.bloodSugar && (() => {
                      const bs = Number(readings.bloodSugar);
                      const ctx = readings.bloodSugarContext || 'unknown';
                      const isElevatedBS = bs && ((ctx === 'fasting' && bs >= 140) || (ctx === 'after meal' && bs >= 200) || (ctx === 'unknown' && bs >= 180));
                      return (
                        <p>
                          • Blood Sugar: {readings.bloodSugar} ({readings.bloodSugarContext || 'unknown'})
                          {isElevatedBS && <span className="text-amber-700 font-bold ml-1.5">⚠️ Elevated Blood Sugar</span>}
                        </p>
                      );
                    })()}
                    {readings.weight && <p>• Weight: {readings.weight} kg</p>}
                  </div>
                </div>
              );
            })()}

            <p className="text-xs text-slate-500 italic pt-1">
              * Clinically inspired monitoring report. Not a diagnosis — for doctor review and clinical evaluation only.
            </p>
          </div>
        </div>

        {/* 2G SMS & e-Sanjeevani Modals */}
        <SmsPacketModal
          isOpen={showSmsModal}
          onClose={() => setShowSmsModal(false)}
          patient={p}
        />
        <ESanjeevaniModal
          isOpen={showESanjeevani}
          onClose={() => setShowESanjeevani(false)}
          patient={p}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // DEFAULT HOME SCREEN = ASHA PATIENT REGISTRY LIST
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Standard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Patients Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Community Health Home Visits (1 Check → 2 Flag → 3 Connect)
            </p>
          </div>
        </div>

        {/* Search Input & Condition Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Condition Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All' },
              { id: 'MS', label: 'MS' },
              { id: 'Stroke', label: 'Stroke' },
              { id: "Parkinson's", label: "Parkinson's" },
              { id: 'Epilepsy', label: 'Epilepsy' }
            ].map(cond => (
              <button
                key={cond.id}
                type="button"
                onClick={() => setConditionFilter(cond.id)}
                className={`touch-target px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  conditionFilter === cond.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {cond.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Interactive KPI Filter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => setKpiFilter('all')}
          className={`touch-target p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            kpiFilter === 'all'
              ? 'bg-teal-50/60 border-teal-500 ring-2 ring-teal-500/30 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 block">Total Enrolled</span>
            {kpiFilter === 'all' && <span className="w-2 h-2 rounded-full bg-teal-600"></span>}
          </div>
          <span className="text-2xl font-bold text-slate-900 mt-0.5 block">{patientStats.totalCount}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {kpiFilter === 'all' ? '● Showing all' : 'Click to show all'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setKpiFilter(prev => prev === 'needs-visit' ? 'all' : 'needs-visit')}
          className={`touch-target p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            kpiFilter === 'needs-visit'
              ? 'bg-red-50/80 border-red-500 ring-2 ring-red-500/30 shadow-xs'
              : 'bg-white border-red-200 hover:border-red-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 block">Needs Doctor Visit</span>
            {kpiFilter === 'needs-visit' && <span className="w-2 h-2 rounded-full bg-red-600"></span>}
          </div>
          <span className="text-2xl font-bold text-red-800 mt-0.5 block">{patientStats.needsDoctorVisitCount}</span>
          <span className="text-[10px] text-red-600 font-medium mt-1 block">
            {kpiFilter === 'needs-visit' ? '● Filter active' : 'Click to filter'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setKpiFilter(prev => prev === 'followup-due' ? 'all' : 'followup-due')}
          className={`touch-target p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            kpiFilter === 'followup-due'
              ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/30 shadow-xs'
              : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 block">Follow-up Due</span>
            {kpiFilter === 'followup-due' && <span className="w-2 h-2 rounded-full bg-amber-600"></span>}
          </div>
          <span className="text-2xl font-bold text-amber-900 mt-0.5 block">{patientStats.pendingVisits}</span>
          <span className="text-[10px] text-amber-700 font-medium mt-1 block">
            {kpiFilter === 'followup-due' ? '● Filter active' : 'Click to filter'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setKpiFilter(prev => prev === 'completed' ? 'all' : 'completed')}
          className={`touch-target p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            kpiFilter === 'completed'
              ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs'
              : 'bg-white border-emerald-200 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 block">Visit Completed</span>
            {kpiFilter === 'completed' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
          </div>
          <span className="text-2xl font-bold text-emerald-900 mt-0.5 block">{patientStats.completedVisits}</span>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
            {kpiFilter === 'completed' ? '● Filter active' : 'Click to filter'}
          </span>
        </button>
      </div>

      {/* Active Filter Bar if filtered */}
      {(kpiFilter !== 'all' || conditionFilter !== 'all' || searchQuery.trim() !== '') && (
        <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-bold text-slate-900">Filtered Results:</span>
            <span>Showing {displayedPatients.length} of {patientStats.totalCount} patients</span>
            {kpiFilter !== 'all' && (
              <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                Status: {kpiFilter === 'needs-visit' ? 'Needs Doctor Visit' : kpiFilter === 'followup-due' ? 'Follow-up Due' : 'Completed'}
              </span>
            )}
            {conditionFilter !== 'all' && (
              <span className="bg-teal-100 text-teal-900 px-2 py-0.5 rounded text-[11px] font-semibold">
                Condition: {conditionFilter}
              </span>
            )}
            {searchQuery.trim() !== '' && (
              <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                Query: "{searchQuery}"
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setKpiFilter('all');
              setConditionFilter('all');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* PRIORITY ACTION QUEUE (Patients needing doctor attention) */}
      {patientStats.priorityQueue.length > 0 && (
        <div className="bg-red-50/90 border-2 border-red-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h2 className="text-sm sm:text-base font-bold text-red-950 uppercase tracking-wide">
                Priority Action Queue — Urgent ASHA Follow-up
              </h2>
            </div>
            <span className="text-xs font-bold bg-red-200 text-red-950 px-2 py-0.5 rounded-full">
              {patientStats.priorityQueue.length} Patients Flagged
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patientStats.priorityQueue.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl border border-red-200 shadow-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{p.firstName}</span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {p.schemeEligibility || 'PM-JAY Eligible'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">({p.age}y, {p.condition} — {p.state})</span>
                    <span className="text-[10px] text-teal-700 font-mono block font-semibold mt-0.5">
                      ABHA: {p.abhaId || '91-4523-8819-2041'}
                    </span>
                  </div>
                  <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                    Needs doctor visit
                  </span>
                </div>

                {/* Tapping & reaction decline label (NO SDMT abbreviation) */}
                <div className="flex flex-wrap gap-1 text-[11px] font-bold">
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    ⚠ Tapping & reaction decline
                  </span>
                  <span className={`px-2 py-0.5 rounded ${p.isConfirmed ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-700'}`}>
                    {p.isConfirmed ? "Visit: Done ✓" : "Visit: Pending ⏳"}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCarePlanPatient(p)}
                    className="touch-target flex-1 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <span>Review Care Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartCheck(p.id)}
                    className="touch-target flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>1 Check</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULL PATIENTS LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            All Monitored Patients (Tap a patient to start Step 1 Check)
          </h2>
          <span className="text-xs text-slate-500 font-medium">Default demo patient: Lakshmi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-3">Age / Sex</th>
                <th className="py-3 px-3">Condition</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Health Status</th>
                <th className="py-3 px-3">Visit Status</th>
                <th className="py-3 px-4 text-right">Start Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedPatients.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => handleStartCheck(p.id)}
                  className={`cursor-pointer transition-colors hover:bg-teal-50/50 ${
                    p.isNeedsVisit ? 'bg-red-50/30' : ''
                  }`}
                  title="Click to start 1 Check for this patient"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900">{p.firstName}</span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        {p.schemeEligibility || 'PM-JAY'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">{p.id}</span>
                      <span className="text-[10px] text-teal-700 font-mono font-medium">ABHA: {p.abhaId || '91-4523-8819-2041'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 font-medium">
                    {p.age}y / {p.gender[0]}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                      {p.condition}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 font-medium">
                    {p.state}
                  </td>
                  <td className="py-3.5 px-3">
                    {p.isNeedsVisit ? (
                      <span className="bg-red-100 text-red-800 border border-red-200 px-2.5 py-1 rounded-full text-xs font-bold inline-block">
                        Needs doctor visit
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold inline-block">
                        Stable ✓
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    {p.isConfirmed ? (
                      <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Done ✓
                      </span>
                    ) : (
                      <span className="text-amber-800 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Pending ⏳
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartCheck(p.id);
                      }}
                      className="touch-target px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <span>1 Check</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WHY NEUROSATHI STATS (Requirement C - EXACT 3 STATS ONLY) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-600" />
          <span>Why NeuroSathi?</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Stat 1 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                "Fewer than 1 neurologist per 100,000 people in India"
              </p>
            </div>
            <p className="text-[11px] text-slate-500 italic border-t border-slate-200 pt-1.5">
              Source: published estimates (range about 0.3 to 0.96 per 100,000), to be verified.
            </p>
          </div>

          {/* Stat 2 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                "India's neurologist-to-patient ratio is nearly 80 times worse than in high-income countries"
              </p>
            </div>
            <p className="text-[11px] text-slate-500 italic border-t border-slate-200 pt-1.5">
              Source: WHO Global Status Report on Neurological Disorders (2025), as reported by BioSpectrum India, July 2026.
            </p>
          </div>

          {/* Stat 3 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                "About 30 million people in India live with neurological disorders (excluding neurotrauma and neuro-infections)"
              </p>
            </div>
            <p className="text-[11px] text-slate-500 italic border-t border-slate-200 pt-1.5">
              Source: Gourie Devi, Neurology India review (older estimate).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
