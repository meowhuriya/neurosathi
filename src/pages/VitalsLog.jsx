import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { HeartPulse, AlertTriangle, ShieldAlert, Check, Plus, Scale, Thermometer, Droplet, Activity } from 'lucide-react';
import { formatDate } from '../utils/formatters';

// CLINICAL NOTE: Uncontrolled hypertension is the single largest modifiable risk factor for stroke recurrence (INTERSTROKE study). BP target for secondary stroke prevention: <130/80 mmHg (AHA/ASA 2021). Regular home BP monitoring reduces stroke recurrence by 20%.

export function VitalsLog({ t, activePatient, onSaveVitals }) {
  const [tab, setTab] = useState('trends'); // 'trends' | 'log'
  const history = activePatient.vitals || [];

  // Form inputs
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [heartRate, setHeartRate] = useState('72');
  const [weight, setWeight] = useState(activePatient.vitals?.[activePatient.vitals.length - 1]?.weight?.toString() || '65');
  const [temp, setTemp] = useState('98.4');
  const [tempUnit, setTempUnit] = useState('F');
  const [bloodSugar, setBloodSugar] = useState('100');
  const [sugarType, setSugarType] = useState('Fasting');
  const [spo2, setSpo2] = useState('98');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Parse numbers
  const sysNum = parseInt(systolic, 10) || 120;
  const diaNum = parseInt(diastolic, 10) || 80;
  const hrNum = parseInt(heartRate, 10) || 72;
  const tempNum = parseFloat(temp) || 98.4;
  const sugarNum = parseInt(bloodSugar, 10) || 100;
  const spo2Num = parseInt(spo2, 10) || 98;

  // Instant BP Feedback Category
  let bpCategory = 'normal';
  let bpLabel = t?.vitals?.bpNormal || 'Normal Blood Pressure (<120/80 mmHg)';
  let bpStyle = 'bg-emerald-50 text-emerald-900 border-emerald-300';

  if (sysNum >= 180 || diaNum >= 120) {
    bpCategory = 'crisis';
    bpLabel = t?.vitals?.bpCrisis || '🚨 HYPERTENSIVE CRISIS (≥180/120 mmHg) — Seek emergency medical care immediately!';
    bpStyle = 'bg-red-100 text-red-950 border-red-500 font-bold';
  } else if (sysNum >= 140 || diaNum >= 90) {
    bpCategory = 'high';
    bpLabel = t?.vitals?.bpHigh || 'High Blood Pressure (Stage 1/2, ≥140/90 mmHg) — clinical review recommended';
    bpStyle = 'bg-red-50 text-red-900 border-red-300 font-bold';
  } else if (sysNum >= 120 || diaNum >= 80) {
    bpCategory = 'elevated';
    bpLabel = t?.vitals?.bpElevated || 'Elevated Blood Pressure (120-139 / 80-89 mmHg) — monitor closely';
    bpStyle = 'bg-amber-50 text-amber-900 border-amber-300';
  }

  // Calculate Average of last 4 readings
  const recent4 = history.slice(-4);
  const avgSys = recent4.length > 0 ? Math.round(recent4.reduce((acc, c) => acc + c.systolic, 0) / recent4.length) : 120;
  const avgDia = recent4.length > 0 ? Math.round(recent4.reduce((acc, c) => acc + c.diastolic, 0) / recent4.length) : 80;

  const bpStatus = avgSys < 130 && avgDia < 80 ? 'Controlled' : avgSys < 140 && avgDia < 90 ? 'Borderline' : 'Uncontrolled';

  const handleSave = (e) => {
    e.preventDefault();
    const newVital = {
      date,
      systolic: sysNum,
      diastolic: diaNum,
      heartRate: hrNum,
      weight: parseFloat(weight) || 60,
      temperature: tempNum,
      bloodSugar: sugarNum,
      spo2: spo2Num
    };

    if (onSaveVitals) {
      onSaveVitals(newVital);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setTab('trends');
    }, 1200);
  };

  // Recharts Data
  const chartData = history.map((v, i) => ({
    week: `Wk ${i + 1}`,
    date: v.date,
    systolic: v.systolic,
    diastolic: v.diastolic,
    heartRate: v.heartRate,
    weight: v.weight
  }));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t?.vitals?.title || "Vitals & Blood Pressure Log"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {activePatient?.firstName} • {t?.vitals?.subtitle || "Regular cardiovascular and vital signs tracking"}
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('trends')}
            className={`touch-target px-3 py-1.5 rounded-lg transition-all ${
              tab === 'trends' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Trends
          </button>
          <button
            type="button"
            onClick={() => setTab('log')}
            className={`touch-target px-3 py-1.5 rounded-lg transition-all ${
              tab === 'log' ? 'bg-teal-600 text-white shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            + Log Reading
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">{t?.vitals?.avgBpLast4 || "Average BP (Recent)"}</span>
          <span className={`text-2xl font-bold ${avgSys >= 140 ? 'text-red-700' : 'text-slate-900'}`}>
            {avgSys}/{avgDia}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">mmHg (last 4 readings)</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">{t?.vitals?.bpStatusLabel || "BP Control Status"}</span>
          <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded-full ${
            bpStatus === 'Controlled' ? 'bg-emerald-100 text-emerald-800' : bpStatus === 'Borderline' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
          }`}>
            {bpStatus}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Target: &lt;130/80 mmHg</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-500 font-semibold block">Latest Weight & HR</span>
          <span className="text-lg font-bold text-slate-900">
            {history[history.length - 1]?.weight || 65} kg • {history[history.length - 1]?.heartRate || 72} BPM
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Logged by ASHA/Self</span>
        </div>
      </div>

      {/* TAB 1: TRENDS */}
      {tab === 'trends' && (
        <div className="space-y-4">
          {/* BP Chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                📊 Blood Pressure Trend (Systolic & Diastolic)
              </h2>
              <span className="text-xs text-slate-500">Target Line: 130/80</span>
            </div>

            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis domain={[60, 180]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  <ReferenceLine y={130} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Target Sys 130', fill: '#d97706', fontSize: 10 }} />
                  <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target Dia 80', fill: '#059669', fontSize: 10 }} />
                  <Line type="monotone" dataKey="systolic" name="Systolic BP" stroke="#DC2626" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Heart Rate & Weight Chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-sm font-bold text-slate-900">
              💓 Heart Rate (BPM) & Weight (kg) Trend
            </h2>
            <div className="h-44 sm:h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="heartRate" name="Heart Rate (BPM)" stroke="#D97706" strokeWidth={2} />
                  <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#0D9488" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOG FORM */}
      {tab === 'log' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            {t?.vitals?.logTitle || "Log Today Vitals"}
          </h2>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Vitals reading saved successfully!</span>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-xs sm:text-sm p-2 rounded-xl border border-slate-300"
              required
            />
          </div>

          {/* Blood Pressure Inputs */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              {t?.vitals?.bpLabel || "Blood Pressure (mmHg)"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">{t?.vitals?.systolic || "Systolic (upper)"}</span>
                <input
                  type="number"
                  value={systolic}
                  onChange={e => setSystolic(e.target.value)}
                  placeholder="120"
                  className="w-full text-base font-bold p-2.5 rounded-xl border border-slate-300"
                  required
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">{t?.vitals?.diastolic || "Diastolic (lower)"}</span>
                <input
                  type="number"
                  value={diastolic}
                  onChange={e => setDiastolic(e.target.value)}
                  placeholder="80"
                  className="w-full text-base font-bold p-2.5 rounded-xl border border-slate-300"
                  required
                />
              </div>
            </div>

            {/* Instant Color-Coded BP Feedback */}
            <div className={`p-3 rounded-xl border mt-2 text-xs transition-all ${bpStyle}`}>
              <span>{bpLabel}</span>
            </div>
          </div>

          {/* Heart Rate and Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {t?.vitals?.heartRate || "Heart Rate (BPM)"}
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={e => setHeartRate(e.target.value)}
                placeholder="72"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Normal: 60 - 100</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {t?.vitals?.weight || "Weight (kg)"}
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="65"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300"
              />
            </div>
          </div>

          {/* Temperature & Fever Check */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">
                {t?.vitals?.temperature || "Temperature"}
              </label>
              <button
                type="button"
                onClick={() => setTempUnit(tempUnit === 'F' ? 'C' : 'F')}
                className="text-[10px] text-teal-700 font-bold"
              >
                Switch to °{tempUnit === 'F' ? 'C' : 'F'}
              </button>
            </div>
            <input
              type="number"
              step="0.1"
              value={temp}
              onChange={e => setTemp(e.target.value)}
              placeholder="98.4"
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300"
            />
            {tempNum > 100.4 && (
              <p className="text-xs text-red-700 font-bold bg-red-50 p-2 rounded-lg border border-red-200 mt-1">
                ⚠ Fever detected — in neurological conditions, fever can trigger seizures or pseudo-relapses. Keep hydrated and consult a doctor.
              </p>
            )}
          </div>

          {/* Blood Sugar (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {t?.vitals?.bloodSugar || "Blood Sugar (mg/dL)"}
              </label>
              <input
                type="number"
                value={bloodSugar}
                onChange={e => setBloodSugar(e.target.value)}
                placeholder="100"
                className="w-full text-sm p-2.5 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Type</label>
              <select
                value={sugarType}
                onChange={e => setSugarType(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Fasting">Fasting</option>
                <option value="Random">Random / Post-Meal</option>
              </select>
            </div>
          </div>

          {/* SpO2 Oxygen */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              {t?.vitals?.spo2 || "Oxygen Saturation SpO2 (%)"}
            </label>
            <input
              type="number"
              value={spo2}
              onChange={e => setSpo2(e.target.value)}
              placeholder="98"
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300"
            />
            {spo2Num < 94 && (
              <p className="text-xs text-red-700 font-bold bg-red-50 p-2 rounded-lg border border-red-200 mt-1">
                ⚠ Low oxygen detected (&lt;94%). If breathless, seek medical assistance.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="touch-target w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md text-sm mt-2"
          >
            {t?.vitals?.saveVitalsBtn || "Save Vitals Reading"}
          </button>
        </form>
      )}
    </div>
  );
}
