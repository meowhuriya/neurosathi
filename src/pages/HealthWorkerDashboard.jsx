import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  CalendarX,
  Search,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  HeartPulse,
  Pill,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { StatusPill } from '../components/StatusPill';
import { formatDate } from '../utils/formatters';
import { evaluatePatientDecline, calculatePatientMetrics } from '../utils/scoring';

export function HealthWorkerDashboard({ t, patients, activePatientId, setActivePatientId, threshold = 0.20, onUpdateFollowUp }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFlaggedFirst, setShowFlaggedFirst] = useState(true);
  const [expandedPatientId, setExpandedPatientId] = useState('NS-001'); // Lakshmi expanded by default
  const [carePlanPatient, setCarePlanPatient] = useState(null);
  const [followUpMsg, setFollowUpMsg] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Compute stats across all patients with V2 clinical indicators
  const patientStats = useMemo(() => {
    let flaggedCount = 0;
    let unconfirmedVisits = 0;
    let lowAdherenceCount = 0;
    let highBpCount = 0;

    const evaluatedPatients = patients.map((p) => {
      const evaluation = evaluatePatientDecline(p.assessments, threshold);
      if (evaluation.isDeclining) flaggedCount += 1;
      if (!p.followUp?.visitConfirmed) unconfirmedVisits += 1;

      const lastAssessment = p.assessments[p.assessments.length - 1];

      // Adherence rate
      const adherenceHistory = p.adherenceWeekly || [90];
      const recentAdherence = adherenceHistory[adherenceHistory.length - 1] ?? 90;
      const isLowAdherence = recentAdherence < 80;
      if (isLowAdherence) lowAdherenceCount += 1;

      // Vitals BP
      const vitalsHistory = p.vitals || [];
      const latestVital = vitalsHistory[vitalsHistory.length - 1] || { systolic: 120, diastolic: 80 };
      const isHighBp = latestVital.systolic >= 140 || latestVital.diastolic >= 90;
      if (isHighBp) highBpCount += 1;

      // PHQ-2 mood screen
      const isPhqPositive = (p.phq2?.total ?? 0) >= 3;

      // Multi-flag score for priority queue
      let priorityScore = 0;
      if (evaluation.isDeclining) priorityScore += 2;
      if (isLowAdherence) priorityScore += 1;
      if (isHighBp) priorityScore += 1;
      if (isPhqPositive) priorityScore += 1;
      if (!p.followUp?.visitConfirmed) priorityScore += 1;

      return {
        ...p,
        isDeclining: evaluation.isDeclining,
        flaggedMeasuresCount: evaluation.flaggedCount,
        lastCheckInDate: lastAssessment?.date,
        recentAdherence,
        isLowAdherence,
        latestVital,
        isHighBp,
        isPhqPositive,
        priorityScore,
        evaluation
      };
    });

    // Priority queue: patients with multiple flags (priorityScore >= 3)
    const priorityQueue = evaluatedPatients
      .filter(p => p.priorityScore >= 3)
      .sort((a, b) => b.priorityScore - a.priorityScore);

    return {
      evaluatedPatients,
      totalCount: patients.length,
      flaggedCount,
      unconfirmedVisits,
      lowAdherenceCount,
      highBpCount,
      priorityQueue
    };
  }, [patients, threshold]);

  // Filter & sort patients
  const displayedPatients = useMemo(() => {
    let list = [...patientStats.evaluatedPatients];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.firstName.toLowerCase().includes(q) ||
        p.condition.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
      );
    }

    if (showFlaggedFirst) {
      list.sort((a, b) => {
        if (a.isDeclining && !b.isDeclining) return -1;
        if (!a.isDeclining && b.isDeclining) return 1;
        return b.priorityScore - a.priorityScore;
      });
    }

    return list;
  }, [patientStats.evaluatedPatients, searchQuery, showFlaggedFirst]);

  const handleSelectPatient = (id) => {
    setActivePatientId(id);
    setExpandedPatientId(prev => prev === id ? null : id);
  };

  const handleMarkFollowUpDone = (patientId) => {
    if (onUpdateFollowUp) {
      onUpdateFollowUp({
        patientId,
        visitConfirmed: true,
        notes: "ASHA follow-up marked as completed."
      });
    }
  };

  if (carePlanPatient) {
    const cp = patients.find(p => p.id === carePlanPatient.id) || carePlanPatient;
    const metrics = calculatePatientMetrics(cp.assessments);
    const { tappingDropPct, reactionSlowedPct, baseTapping, recentTapping } = metrics;

    const chartData = (cp.assessments || []).map((a, idx) => ({
      week: `Wk ${idx + 1}`,
      leftTaps: a.motor?.leftTaps || 0,
      rightTaps: a.motor?.rightTaps || 0,
      reactionMatches: a.processing?.correct || 0
    }));

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => {
            setCarePlanPatient(null);
            setFollowUpMsg('');
          }}
          className="touch-target inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Dashboard</span>
        </button>

        {/* 1. Header */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {cp.firstName} — ASHA Care Plan Screen
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {cp.age} yrs • {cp.gender} • {cp.condition} • {cp.state}
              </p>
            </div>
            <span className="bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold">
              ASHA ID: {cp.healthWorkerId || "ASHA-TS-04"}
            </span>
          </div>

          {/* 2. Why Flagged */}
          <div className="bg-red-50/90 border border-red-200 rounded-xl p-4 text-red-950 space-y-1 mt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 block">
              🚨 Why Flagged for Urgent Doctor Review:
            </span>
            <p className="text-sm font-bold leading-relaxed">
              Tapping speed dropped about {tappingDropPct}% (baseline: {baseTapping} taps → recent: {recentTapping} taps) and reaction time slowed about {reactionSlowedPct}% over 3 weeks.
            </p>
          </div>
        </div>

        {/* 3. Trend Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            8-Week Tapping & Reaction Time Trend ({tappingDropPct}% tapping drop, {reactionSlowedPct}% reaction time slowed)
          </h2>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
                <Line type="monotone" dataKey="leftTaps" name="Left Hand Taps" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rightTaps" name="Right Hand Taps" stroke="#475569" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="reactionMatches" name="Reaction Matches" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Next Steps Checklist */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Next Steps Checklist for ASHA Worker</h2>
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
              <span className="font-semibold text-slate-800">1. Call or visit the patient at home</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
              <span className="font-semibold text-slate-800">2. Share and review the doctor summary</span>
            </div>
            <a
              href="https://esanjeevani.mohfw.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>3. Book Free Doctor Consult on e-Sanjeevani</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://pmjay.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>4. Check Ayushman Bharat PM-JAY Cashless Eligibility</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Confirm Visit Happened */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-2">
              <span className="font-bold text-slate-900 block">5. Confirm the visit happened:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleMarkFollowUpDone(cp.id);
                    setFollowUpMsg("✓ Clinical visit confirmed completed.");
                  }}
                  className="touch-target py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center shadow-xs"
                >
                  Yes ✓
                </button>
                <button
                  type="button"
                  onClick={() => setFollowUpMsg("⏳ Follow-up reminder active.")}
                  className="touch-target py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs text-center"
                >
                  Not yet ⏳
                </button>
                <button
                  type="button"
                  onClick={() => setFollowUpMsg("🤝 Assistance requested for telemedicine or transport.")}
                  className="touch-target py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs text-center"
                >
                  Need help 🤝
                </button>
              </div>
              {followUpMsg && (
                <p className="text-xs font-semibold text-teal-800 bg-teal-50 p-2 rounded-lg border border-teal-200 mt-2">
                  {followUpMsg}
                </p>
              )}
            </div>
          </div>

          {/* 5. Two Action Buttons */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => {
                setActivePatientId(cp.id);
                navigate('/doctor-summary');
              }}
              className="touch-target flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>View Doctor Summary</span>
            </button>
            <button
              type="button"
              onClick={() => handleMarkFollowUpDone(cp.id)}
              className="touch-target flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Mark ASHA follow-up done</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.dashboard.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500">{t.dashboard.subtitle}</p>
        </div>
      </div>

      {/* Top Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block">Monitored</span>
          <span className="text-2xl font-bold text-slate-900">{patientStats.totalCount}</span>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-amber-800 block">Flagged Decline</span>
          <span className="text-2xl font-bold text-amber-900">{patientStats.flaggedCount}</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-rose-800 block">High BP (≥140/90)</span>
          <span className="text-2xl font-bold text-rose-900">{patientStats.highBpCount}</span>
        </div>

        <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-purple-800 block">Low Adherence (&lt;80%)</span>
          <span className="text-2xl font-bold text-purple-900">{patientStats.lowAdherenceCount}</span>
        </div>
      </div>

      {/* "NEEDS ATTENTION" PRIORITY QUEUE (NEW V2) */}
      {patientStats.priorityQueue.length > 0 && (
        <div className="bg-red-50/80 border-2 border-red-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h2 className="text-sm sm:text-base font-bold text-red-950 uppercase tracking-wide">
                Priority Action Queue — Urgent ASHA Follow-up
              </h2>
            </div>
            <span className="text-xs font-bold bg-red-200 text-red-950 px-2 py-0.5 rounded-full">
              {patientStats.priorityQueue.length} Patients with Multiple Flags
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {patientStats.priorityQueue.map(p => (
              <div key={p.id} className="bg-white p-3.5 rounded-xl border border-red-200 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{p.firstName}</span>
                    <span className="text-xs text-slate-500 ml-1">({p.age}y, {p.condition} — {p.state})</span>
                  </div>
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {p.priorityScore} Alerts Active
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 text-[10px] font-bold">
                  {p.isDeclining && <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded">⚠ Tapping & reaction decline</span>}
                  {p.isLowAdherence && <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded">💊 Adherence {p.recentAdherence}%</span>}
                  {p.isHighBp && <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded">🩺 BP {p.latestVital.systolic}/{p.latestVital.diastolic}</span>}
                  {p.isPhqPositive && <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded">🧘 Mood Screen (PHQ-2: {p.phq2.total})</span>}
                </div>

                <button
                  type="button"
                  onClick={() => setCarePlanPatient(p)}
                  className="touch-target w-full py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 mt-1"
                >
                  <span>Review Care Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simulated WhatsApp Health Worker Alert Card */}
      <div className="bg-[#E7F6E7] border-2 border-[#25D366]/40 rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <span className="text-lg">💬</span>
            <span>{t.dashboard.simulatedAlertTitle}</span>
          </div>
          <span className="bg-[#25D366] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            WhatsApp Bot Preview
          </span>
        </div>

        <div className="bg-white/90 backdrop-blur rounded-xl p-3 border border-[#25D366]/30 shadow-xs text-xs sm:text-sm text-slate-800 font-medium space-y-1">
          <p className="text-emerald-950 font-bold">{t.dashboard.simulatedAlertDesc}</p>
          <p className="text-[11px] text-slate-600">
            "ASHA Worker Notice: Lakshmi (ID: NS-001) has shown consecutive weekly declines in finger tapping (44 → 30 taps), functional ADL drop (8 → 5), and adherence fell to 71%. Recommended: Schedule PHC visit or Aarogyasri tele-OPD."
          </p>
        </div>

        <p className="text-[11px] text-emerald-900 italic font-medium">
          ℹ️ {t.dashboard.alertNote}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.dashboard.search}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-slate-700 w-full sm:w-auto justify-end">
          <input
            type="checkbox"
            checked={showFlaggedFirst}
            onChange={(e) => setShowFlaggedFirst(e.target.checked)}
            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
          />
          <span>{t.dashboard.showFlagged}</span>
        </label>
      </div>

      {/* Patient Surveillance Table (Enriched with V2 Adherence & BP columns) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 sm:px-4">{t.dashboard.colName}</th>
                <th className="py-3 px-2 sm:px-3">{t.dashboard.colAge}</th>
                <th className="py-3 px-2 sm:px-3">{t.dashboard.colCondition}</th>
                <th className="py-3 px-2 sm:px-3">{t.dashboard.colStatus}</th>
                <th className="py-3 px-2 sm:px-3">Adherence</th>
                <th className="py-3 px-2 sm:px-3">BP Status</th>
                <th className="py-3 px-2 sm:px-3 text-center">{t.dashboard.colVisit}</th>
                <th className="py-3 px-2 sm:px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedPatients.map((p) => {
                const isExpanded = expandedPatientId === p.id;
                return (
                  <React.Fragment key={p.id}>
                    <tr 
                      onClick={() => handleSelectPatient(p.id)}
                      className={`cursor-pointer transition-colors ${
                        p.isDeclining ? 'bg-amber-50/40 hover:bg-amber-50/80' : 'hover:bg-slate-50'
                      } ${activePatientId === p.id ? 'ring-1 ring-teal-500 font-semibold' : ''}`}
                    >
                      <td className="py-3 px-3 sm:px-4">
                        <span className="font-bold text-slate-900 block">{p.firstName}</span>
                        <span className="text-[10px] text-slate-400 block">{p.id}</span>
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-slate-600">
                        {p.age}y / {p.gender[0]}
                      </td>
                      <td className="py-3 px-2 sm:px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                          {p.condition}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-3">
                        {p.isDeclining ? (
                          <StatusPill status="flagged" label="Flagged" size="sm" />
                        ) : (
                          <StatusPill status="stable" label="Stable" size="sm" />
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-3 font-semibold">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          p.isLowAdherence ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.recentAdherence}%
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-3 font-semibold">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          p.isHighBp ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.latestVital.systolic}/{p.latestVital.diastolic}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center">
                        {p.followUp?.visitConfirmed ? (
                          <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Yes ✓
                          </span>
                        ) : (
                          <span className="text-amber-800 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Pending ⏳
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-right">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100"
                          aria-label={`Toggle details for ${p.firstName}`}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Patient Action Card */}
                    {isExpanded && (
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <td colSpan={8} className="p-4">
                          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <div>
                                <span className="font-bold text-slate-900 text-sm">
                                  {p.firstName}'s Care Details ({p.state}, {p.language})
                                </span>
                                <p className="text-xs text-slate-500">
                                  Health Worker: {p.healthWorkerId} • Notes: {p.followUp?.notes}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenSummary(p.id)}
                                  className="touch-target px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                                >
                                  <FileText className="w-4 h-4" />
                                  <span>View 60-Sec Clinical Summary</span>
                                </button>
                              </div>
                            </div>

                            {/* Summary of measures */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              {Object.entries(p.evaluation.measures).map(([k, m]) => (
                                <div key={k} className={`p-2 rounded-lg border ${m.isFlagged ? 'bg-amber-50 border-amber-300 font-semibold' : 'bg-slate-50 border-slate-200'}`}>
                                  <span className="text-[10px] text-slate-500 block truncate">{m.name}</span>
                                  <span className="font-bold">{m.recent} vs {m.baseline}</span>
                                  <span className={`block text-[10px] font-bold ${m.isFlagged ? 'text-amber-800' : 'text-slate-600'}`}>
                                    {m.changePct}% {m.isFlagged ? '⚠ DECLINE' : ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
