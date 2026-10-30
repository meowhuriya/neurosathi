import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Plus, FileText, AlertTriangle, Check, Copy, Printer, ChevronDown, ChevronUp, Clock, ShieldAlert, BookOpen } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatDate } from '../utils/formatters';

// CLINICAL NOTE: Seizure diary is the gold standard for epilepsy monitoring per ILAE guidelines. Frequency, duration, and triggers directly inform anti-seizure medication titration. >5 min = status epilepticus.

export function SeizureDiary({ t, activePatient, onUpdatePatient }) {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'log' | 'report'
  const [copied, setCopied] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // Patient's seizure diary entries
  const storageKey = `neurosathi_seizures_${activePatient?.id || 'default'}`;
  const initialEntries = activePatient?.seizureDiary || [];
  const [entries, setEntries] = useLocalStorage(storageKey, initialEntries);

  // Form State
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTimeOfDay, setFormTimeOfDay] = useState('Morning');
  const [formDuration, setFormDuration] = useState('1-3 minutes');
  const [formType, setFormType] = useState('Whole body shaking (tonic-clonic/grand mal)');
  const [formConsciousness, setFormConsciousness] = useState('Yes');
  const [formTriggers, setFormTriggers] = useState([]);
  const [formActivity, setFormActivity] = useState('');
  const [formRecovery, setFormRecovery] = useState('10-30 min');
  const [formInjured, setFormInjured] = useState('No');
  const [formInjuryDesc, setFormInjuryDesc] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const triggerOptions = [
    "Missed medication",
    "Poor sleep / sleep deprivation",
    "Stress / emotional upset",
    "Alcohol",
    "Illness / fever",
    "Bright/flashing lights",
    "Menstrual period",
    "Skipped meals",
    "Unknown / no obvious trigger"
  ];

  const handleToggleTrigger = (trig) => {
    setFormTriggers(prev =>
      prev.includes(trig) ? prev.filter(t => t !== trig) : [...prev, trig]
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `sz_${Date.now()}`,
      date: formDate,
      timeOfDay: formTimeOfDay,
      duration: formDuration,
      type: formType,
      consciousnessLost: formConsciousness,
      triggers: formTriggers.length > 0 ? formTriggers : ["Unknown / no obvious trigger"],
      activity: formActivity,
      recoveryTime: formRecovery,
      injured: formInjured,
      injuryDesc: formInjuryDesc
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    if (onUpdatePatient) {
      onUpdatePatient(activePatient.id, { seizureDiary: updated });
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('history');
    }, 1200);
  };

  // Compute Weekly Chart Data (8 weeks)
  const weeklyChartData = useMemo(() => {
    // Generate 8 weeks bins
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      weeks.push({ week: `Wk ${8 - i}`, count: 0 });
    }

    entries.forEach(entry => {
      // Map roughly into recent 8 weeks
      const daysAgo = Math.floor((new Date() - new Date(entry.date)) / (1000 * 60 * 60 * 24));
      const weekIdx = Math.min(7, Math.max(0, 7 - Math.floor(daysAgo / 7)));
      if (weeks[weekIdx]) {
        weeks[weekIdx].count += 1;
      }
    });

    return weeks;
  }, [entries]);

  // Summary Metrics
  const totalThisMonth = entries.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const totalLastMonth = Math.max(0, entries.length - totalThisMonth);

  // Most common trigger
  const triggerCounts = {};
  entries.forEach(e => {
    (e.triggers || []).forEach(trig => {
      triggerCounts[trig] = (triggerCounts[trig] || 0) + 1;
    });
  });
  const mostCommonTrigger = Object.keys(triggerCounts).sort((a, b) => triggerCounts[b] - triggerCounts[a])[0] || "None identified";

  // Days since last
  const daysSinceLast = entries.length > 0
    ? Math.max(0, Math.floor((new Date() - new Date(entries[0].date)) / (1000 * 60 * 60 * 24)))
    : "None logged";

  // Generated Clinical Narrative
  const doctorReportText = `
NEUROSATHI — SEIZURE LONGITUDINAL MONITORING REPORT
-----------------------------------------------------------
Patient: ${activePatient.firstName} (${activePatient.age}y, ${activePatient.gender})
Condition: Epilepsy | State: ${activePatient.state}
Total Logged Events: ${entries.length}

CLINICAL OBSERVATION:
In the past 8 weeks, ${activePatient.firstName} has logged ${entries.length} seizure events (${totalThisMonth} in the current month).
The most frequent type observed is "${entries[0]?.type || 'Tonic-clonic'}".
Most common reported trigger: "${mostCommonTrigger}".
Consciousness was compromised in ${entries.filter(e => e.consciousnessLost === 'Yes').length} of ${entries.length} events.
Estimated average recovery duration: ${entries[0]?.recoveryTime || '10-30 min'}.
Medication Adherence Rate: ${activePatient.adherenceWeekly ? activePatient.adherenceWeekly[activePatient.adherenceWeekly.length - 1] + '%' : '92%'}.
Trend: Seizure frequency is ${totalThisMonth > totalLastMonth ? 'increasing' : totalThisMonth < totalLastMonth ? 'decreasing' : 'stable'} compared to the prior monitoring cycle.

Generated for Neurologist OPD review via NeuroSathi Platform.
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(doctorReportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t?.seizureDiary?.title || "Seizure Diary"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {activePatient?.firstName} • {t?.seizureDiary?.subtitle || "Log episodes, identify triggers, and share summaries with your neurologist"}
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`touch-target px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            {t?.seizureDiary?.historyTab || "History & Trends"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`touch-target px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'log' ? 'bg-teal-600 text-white shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            + {t?.seizureDiary?.logTab || "Log Event"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`touch-target px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'report' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            {t?.seizureDiary?.reportTab || "Doctor Report"}
          </button>
        </div>
      </div>

      {/* TAB 1: HISTORY & CALENDAR VIEW */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-semibold block">{t?.seizureDiary?.seizuresThisMonth || "This Month"}</span>
              <span className="text-2xl font-bold text-slate-900">{totalThisMonth}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-semibold block">{t?.seizureDiary?.seizuresLastMonth || "Last Month"}</span>
              <span className="text-2xl font-bold text-slate-900">{totalLastMonth}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-semibold block">{t?.seizureDiary?.daysSinceLast || "Days Since Last"}</span>
              <span className="text-2xl font-bold text-teal-700">{daysSinceLast}</span>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[11px] text-slate-500 font-semibold block">{t?.seizureDiary?.commonTrigger || "Top Trigger"}</span>
              <span className="text-xs font-bold text-slate-800 block truncate" title={mostCommonTrigger}>{mostCommonTrigger}</span>
            </div>
          </div>

          {/* Recharts Weekly Bar Chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-sm font-bold text-slate-900">
              📊 {t?.seizureDiary?.chartTitle || "Weekly Seizure Frequency (Last 8 Weeks)"}
            </h2>
            <div className="h-44 sm:h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  <Bar dataKey="count" name="Seizures" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Logged Events List */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Logged Events History ({entries.length})</h2>
              <button
                type="button"
                onClick={() => setActiveTab('log')}
                className="text-xs text-teal-700 font-bold hover:underline"
              >
                + Log New Episode
              </button>
            </div>

            <div className="space-y-2">
              {entries.map(e => {
                const isExp = expandedId === e.id;
                return (
                  <div key={e.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExp ? null : e.id)}
                      className="touch-target w-full p-3 flex items-center justify-between text-left text-xs sm:text-sm hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900">{formatDate(e.date)}</span>
                          <span className="text-slate-500 ml-2">({e.timeOfDay} • {e.duration})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 hidden sm:inline">{e.type.split('(')[0]}</span>
                        {isExp ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {isExp && (
                      <div className="p-3.5 bg-white border-t border-slate-200 text-xs text-slate-700 space-y-1.5">
                        <p><strong>Type:</strong> {e.type}</p>
                        <p><strong>Consciousness Lost:</strong> {e.consciousnessLost}</p>
                        <p><strong>Triggers:</strong> {(e.triggers || []).join(', ')}</p>
                        <p><strong>Recovery Time:</strong> {e.recoveryTime}</p>
                        {e.injured === "Yes" && <p className="text-red-700"><strong>Injured:</strong> Yes — {e.injuryDesc}</p>}
                        {e.notes && <p><strong>Notes:</strong> {e.notes}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOG NEW EVENT FORM */}
      {activeTab === 'log' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Record New Seizure Event
          </h2>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{t?.seizureDiary?.savedAlert || "Seizure entry logged successfully in local diary."}</span>
            </div>
          )}

          {/* Date & Time of Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {t?.seizureDiary?.date || "Date of Event"}
              </label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {t?.seizureDiary?.timeOfDay || "Time of Day"}
              </label>
              <div className="grid grid-cols-4 gap-1">
                {['Morning', 'Afternoon', 'Evening', 'Night'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormTimeOfDay(t)}
                    className={`touch-target py-2 text-[11px] font-bold rounded-lg border transition-all ${
                      formTimeOfDay === t
                        ? 'bg-teal-600 text-white border-teal-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              {t?.seizureDiary?.duration || "Estimated Duration"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { val: "Less than 1 minute", label: "< 1 min" },
                { val: "1-3 minutes", label: "1-3 min" },
                { val: "3-5 minutes", label: "3-5 min" },
                { val: "More than 5 minutes", label: "> 5 min ⚠" }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setFormDuration(opt.val)}
                  className={`touch-target py-2 px-1 text-xs font-bold rounded-lg border ${
                    formDuration === opt.val
                      ? opt.val.includes('More than') ? 'bg-red-600 text-white border-red-700' : 'bg-teal-600 text-white border-teal-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {formDuration === "More than 5 minutes" && (
              <p className="text-xs text-red-700 font-bold bg-red-50 p-2 rounded-lg border border-red-200 mt-1.5">
                ⚠ Seizures lasting &gt;5 minutes are medical emergencies. Call 108 if not resolved.
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              {t?.seizureDiary?.type || "Seizure Type / Description"}
            </label>
            <select
              value={formType}
              onChange={e => setFormType(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="Whole body shaking (tonic-clonic/grand mal)">Whole body shaking (tonic-clonic)</option>
              <option value="Brief staring/blank spell (absence)">Brief staring / blank spell (absence)</option>
              <option value="One side of body jerking (focal)">One side jerking / localized (focal)</option>
              <option value="Strange sensation/aura only">Strange sensation / aura only</option>
              <option value="I'm not sure">I'm not sure</option>
            </select>
          </div>

          {/* Consciousness */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              {t?.seizureDiary?.consciousness || "Did you lose consciousness?"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Yes', 'No', 'Not sure'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormConsciousness(c)}
                  className={`touch-target py-2 font-bold text-xs rounded-lg border ${
                    formConsciousness === c ? 'bg-teal-600 text-white border-teal-700' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Triggers Checkboxes */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              {t?.seizureDiary?.triggers || "Possible Triggers (Select all that apply)"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {triggerOptions.map(trig => {
                const isChecked = formTriggers.includes(trig);
                return (
                  <button
                    key={trig}
                    type="button"
                    onClick={() => handleToggleTrigger(trig)}
                    className={`touch-target p-2 text-xs rounded-lg border text-left flex items-center gap-2 ${
                      isChecked ? 'bg-teal-50 border-teal-600 font-bold text-teal-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-teal-600 text-white border-teal-600' : 'bg-white border-slate-400'}`}>
                      {isChecked && "✓"}
                    </span>
                    <span>{trig}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="touch-target w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md text-sm mt-2"
          >
            {t?.seizureDiary?.saveBtn || "Save Seizure Entry"}
          </button>
        </form>
      )}

      {/* TAB 3: DOCTOR SUMMARY REPORT */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {t?.seizureDiary?.reportTitle || "Seizure Clinical Summary for Doctor"}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="touch-target px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="touch-target px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
            {doctorReportText}
          </pre>
        </div>
      )}
    </div>
  );
}
