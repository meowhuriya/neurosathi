import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pill, AlertTriangle, Plus, Check, Clock, Calendar, ShieldAlert, FileText, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// CLINICAL NOTE: WHO defines medication adherence <80% as sub-therapeutic for chronic neurological conditions. Non-adherence is the leading modifiable cause of seizure recurrence (ILAE) and secondary stroke events (AHA/ASA).

const COMMON_DRUGS = [
  "Sodium Valproate (Epilepsy)",
  "Carbamazepine (Epilepsy)",
  "Levetiracetam (Epilepsy)",
  "Phenytoin (Epilepsy)",
  "Lamotrigine (Epilepsy)",
  "Clobazam (Epilepsy)",
  "Dimethyl Fumarate (MS)",
  "Fingolimod (MS)",
  "Interferon Beta (MS)",
  "Glatiramer Acetate (MS)",
  "Aspirin (Stroke)",
  "Clopidogrel (Stroke)",
  "Atorvastatin (Stroke / Lipids)",
  "Amlodipine (Blood Pressure)",
  "Losartan (Blood Pressure)",
  "Metformin (Blood Sugar)"
];

export function MedicineAdherence({ t, activePatient, onUpdatePatient }) {
  const [tab, setTab] = useState('daily'); // 'daily' | 'profile' | 'analytics' | 'sideEffects'

  // Medications list
  const medKey = `neurosathi_meds_${activePatient.id}`;
  const [medications, setMedications] = useLocalStorage(medKey, activePatient.medications || []);

  // Today log state
  const [todayStatus, setTodayStatus] = useState({});
  const [missReason, setMissReason] = useState({});
  const [activeReasonModalMedId, setActiveReasonModalMedId] = useState(null);

  // New medication form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('500mg');
  const [newFrequency, setNewFrequency] = useState('Twice daily');
  const [newTimes, setNewTimes] = useState(['Morning', 'Night']);

  // Side effects state
  const [sideEffects, setSideEffects] = useState(activePatient.sideEffects || []);
  const [selectedEffect, setSelectedEffect] = useState('Nausea or stomach discomfort');
  const [effectSeverity, setEffectSeverity] = useState('Moderate');

  // Adherence history for chart (8 weeks)
  const weeklyRates = activePatient.adherenceWeekly || [90, 88, 85, 87, 86, 85, 84, 82];
  const chartData = weeklyRates.map((rate, i) => ({
    week: `Wk ${i + 1}`,
    rate
  }));

  const currentRate = weeklyRates[weeklyRates.length - 1] || 85;

  const handleMarkDose = (medId, status) => {
    setTodayStatus(prev => ({ ...prev, [medId]: status }));
    if (status === 'missed' || status === 'skipped') {
      setActiveReasonModalMedId(medId);
    }
  };

  const handleSelectReason = (medId, reason) => {
    setMissReason(prev => ({ ...prev, [medId]: reason }));
    setActiveReasonModalMedId(null);
  };

  const handleAddMed = (e) => {
    e.preventDefault();
    if (!newMedName) return;

    const newMed = {
      id: `med_${Date.now()}`,
      name: newMedName.split('(')[0].trim(),
      dosage: newDosage,
      frequency: newFrequency,
      times: newTimes,
      prescribingDoctor: "Government Hospital OPD"
    };

    const updated = [...medications, newMed];
    setMedications(updated);
    if (onUpdatePatient) {
      onUpdatePatient(activePatient.id, { medications: updated });
    }
    setShowAddForm(false);
    setNewMedName('');
  };

  const handleDeleteMed = (id) => {
    const updated = medications.filter(m => m.id !== id);
    setMedications(updated);
    if (onUpdatePatient) {
      onUpdatePatient(activePatient.id, { medications: updated });
    }
  };

  const handleAddSideEffect = (e) => {
    e.preventDefault();
    const newSe = {
      id: `se_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      effect: selectedEffect,
      severity: effectSeverity,
      medication: medications[0]?.name || "Prescribed Medicine"
    };
    const updated = [newSe, ...sideEffects];
    setSideEffects(updated);
    if (onUpdatePatient) {
      onUpdatePatient(activePatient.id, { sideEffects: updated });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t?.medicine?.title || "Medicine Adherence Tracker"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {activePatient?.firstName} • {t?.medicine?.subtitle || "Track daily doses, understand barriers, and review treatment consistency"}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('daily')}
            className={`touch-target px-3 py-1.5 rounded-lg transition-all ${
              tab === 'daily' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Today's Log
          </button>
          <button
            type="button"
            onClick={() => setTab('analytics')}
            className={`touch-target px-3 py-1.5 rounded-lg transition-all ${
              tab === 'analytics' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Trends ({currentRate}%)
          </button>
          <button
            type="button"
            onClick={() => setTab('sideEffects')}
            className={`touch-target px-3 py-1.5 rounded-lg transition-all ${
              tab === 'sideEffects' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Side Effects
          </button>
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`touch-target px-3 py-1.5 rounded-lg transition-all ${
              tab === 'profile' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            My Meds
          </button>
        </div>
      </div>

      {/* Low Adherence Warning Banner */}
      {currentRate < 80 && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-amber-950 font-medium">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900">
              {t?.medicine?.warningLowAdherence || "⚠ Adherence is below 80% — this significantly increases the risk of seizures or recurrent stroke. Please discuss barriers with your Primary Health Centre doctor or ASHA worker."}
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: DAILY DOSES LOG */}
      {tab === 'daily' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-900">
              {t?.medicine?.dailyLogTitle || "Today's Medication Doses"}
            </h2>
            <span className="text-xs text-slate-500 font-semibold">{new Date().toLocaleDateString()}</span>
          </div>

          {medications.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No medications listed yet. Click "My Meds" to add your prescribed drugs.
            </p>
          ) : (
            <div className="space-y-3">
              {medications.map(med => {
                const status = todayStatus[med.id];
                const reason = missReason[med.id];

                return (
                  <div key={med.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm sm:text-base">{med.name}</span>
                        <p className="text-xs text-slate-500">{med.dosage} • {med.frequency} ({(med.times || []).join(', ')})</p>
                      </div>
                      {status && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          status === 'taken' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* 3 Large Action Buttons */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleMarkDose(med.id, 'taken')}
                        className={`touch-target py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                          status === 'taken' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Taken ✅
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkDose(med.id, 'missed')}
                        className={`touch-target py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                          status === 'missed' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Missed ❌
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkDose(med.id, 'skipped')}
                        className={`touch-target py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                          status === 'skipped' ? 'bg-amber-600 text-white border-amber-700 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Skipped ⏭️
                      </button>
                    </div>

                    {reason && (
                      <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        Reason logged: <strong>{reason}</strong>
                      </p>
                    )}

                    {/* Inline Reason Selection if prompted */}
                    {activeReasonModalMedId === med.id && (
                      <div className="p-3 bg-white border border-slate-300 rounded-xl space-y-2 mt-2">
                        <span className="text-xs font-bold text-slate-800 block">
                          {t?.medicine?.reasonPrompt || "Why was this dose missed or skipped?"}
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {[
                            "Forgot",
                            "Medicine not available / ran out",
                            "Side effects",
                            "Felt better, thought I didn't need it",
                            "Could not afford refill",
                            "Other"
                          ].map(r => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => handleSelectReason(med.id, r)}
                              className="touch-target p-2 text-[11px] font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left"
                            >
                              • {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANALYTICS & CALENDAR */}
      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block">{t?.medicine?.adherenceRate || "Current Adherence"}</span>
              <span className={`text-3xl font-bold ${currentRate >= 80 ? 'text-emerald-700' : 'text-amber-800'}`}>
                {currentRate}%
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Target: ≥80% for clinical stability</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block">Primary Miss Reason</span>
              <span className="text-sm font-bold text-slate-800 block mt-1">
                {Object.keys(activePatient.adherenceMissReasons || {})[0] || "None"}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">From recent 8-week log</span>
            </div>
          </div>

          {/* Recharts Weekly Adherence Line Chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-sm font-bold text-slate-900">
              📊 8-Week Medication Adherence Trend (%)
            </h2>
            <div className="h-44 sm:h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="rate" name="Adherence %" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIDE EFFECTS LOG */}
      {tab === 'sideEffects' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-900">
              {t?.medicine?.sideEffectsTitle || "Side Effects Questionnaire"}
            </h2>
          </div>

          <form onSubmit={handleAddSideEffect} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Reported Side Effect
              </label>
              <select
                value={selectedEffect}
                onChange={e => setSelectedEffect(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Nausea or stomach discomfort">Nausea or stomach discomfort</option>
                <option value="Dizziness or lightheadedness">Dizziness or lightheadedness</option>
                <option value="Headache">Headache</option>
                <option value="Excessive daytime drowsiness">Excessive daytime drowsiness</option>
                <option value="Hand tremor or shakiness">Hand tremor or shakiness</option>
                <option value="Easy bruising or bleeding gums">Easy bruising or bleeding gums</option>
                <option value="Skin rash or itching">Skin rash or itching</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Severity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Mild', 'Moderate', 'Severe'].map(sev => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setEffectSeverity(sev)}
                    className={`touch-target py-2 font-bold text-xs rounded-lg border ${
                      effectSeverity === sev
                        ? sev === 'Severe' ? 'bg-red-600 text-white border-red-700' : 'bg-teal-600 text-white border-teal-700'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="touch-target w-full py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Log Side Effect
            </button>
          </form>

          {/* List of active reported side effects */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Reported Effects</h3>
            {sideEffects.map(se => (
              <div key={se.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{se.effect}</span>
                  <p className="text-slate-500">{se.medication} • {se.date}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  se.severity === 'Severe' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-800'
                }`}>
                  {se.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MY MEDICINES PROFILE */}
      {tab === 'profile' && (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-900">
              {t?.medicine?.profileTitle || "My Medications Profile"}
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="touch-target text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>{t?.medicine?.addMedBtn || "Add New"}</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddMed} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Select Common Neurological Drug or Type Name:
                </label>
                <select
                  value={newMedName}
                  onChange={e => setNewMedName(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-xl border border-slate-300 bg-white mb-2"
                >
                  <option value="">-- Choose from standard list --</option>
                  {COMMON_DRUGS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom medicine name"
                  value={newMedName}
                  onChange={e => setNewMedName(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Dosage</label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={e => setNewDosage(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Frequency</label>
                  <input
                    type="text"
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="touch-target px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="touch-target flex-1 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl"
                >
                  Save to Profile
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {medications.map(m => (
              <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-slate-900">{m.name} ({m.dosage})</span>
                  <p className="text-xs text-slate-500">{m.frequency} • Prescribed by {m.prescribingDoctor || "Doctor"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteMed(m.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600"
                  title="Remove medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
