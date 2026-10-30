import React, { useState } from 'react';
import { CalendarCheck, Bell, Plus, Check, Trash2, HeartHandshake, ShieldAlert } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function FollowUp({ t, activePatient, onUpdateFollowUp }) {
  const [visitedStatus, setVisitedStatus] = useState(
    activePatient?.followUp?.visitConfirmed ? 'yes' : 'not-yet'
  );

  // Reminders list stored in localStorage
  const [reminders, setReminders] = useLocalStorage(
    `neurosathi_reminders_${activePatient?.id || 'default'}`,
    [
      { id: 1, name: "Morning Anti-seizure / Disease Modifying Therapy", time: "08:00 AM", date: "Daily", active: true },
      { id: 2, name: "Community PHC Tele-consultation Review", time: "11:30 AM", date: "2026-11-05", active: true }
    ]
  );

  const [newMedName, setNewMedName] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newDate, setNewDate] = useState('Daily');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSelectStatus = (status) => {
    setVisitedStatus(status);
    const isConfirmed = status === 'yes';
    const notes = status === 'yes'
      ? "Patient confirmed clinical consultation completed."
      : status === 'need-help'
      ? "Patient requested assistance booking tele-consultation or PHC appointment."
      : "Patient has not yet visited. Follow-up reminder active.";

    if (onUpdateFollowUp) {
      onUpdateFollowUp({
        visitConfirmed: isConfirmed,
        reminderDate: "2026-11-05",
        notes
      });
    }
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newReminder = {
      id: Date.now(),
      name: newMedName.trim(),
      time: newTime,
      date: newDate,
      active: true
    };

    setReminders([...reminders, newReminder]);
    setNewMedName('');
    setShowAddForm(false);
  };

  const handleDeleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <CalendarCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.followup.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500">{t.followup.subtitle}</p>
        </div>
      </div>

      {/* Main Follow-up Question Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 text-center">
          {t.followup.visitedQuestion}
        </h2>

        {/* 3 Large Tap Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleSelectStatus('yes')}
            className={`touch-target p-3.5 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              visitedStatus === 'yes'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>{t.followup.yesVisited}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectStatus('not-yet')}
            className={`touch-target p-3.5 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              visitedStatus === 'not-yet'
                ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>{t.followup.notYet}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectStatus('need-help')}
            className={`touch-target p-3.5 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              visitedStatus === 'need-help'
                ? 'bg-red-50 border-red-600 text-red-900 shadow-sm'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span>{t.followup.needHelp}</span>
          </button>
        </div>

        {/* Supportive Feedback Message */}
        <div className="pt-2">
          {visitedStatus === 'yes' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm font-medium">
              ✅ {t.followup.msgYes}
            </div>
          )}

          {visitedStatus === 'not-yet' && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm font-medium space-y-1">
              <p>⏳ {t.followup.msgNotYet}</p>
              <p className="text-xs text-amber-800 font-normal">
                A reminder has been logged in your local schedule and flagged for your ASHA community worker.
              </p>
            </div>
          )}

          {visitedStatus === 'need-help' && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs sm:text-sm font-medium space-y-1">
              <p>🆘 {t.followup.msgNeedHelp}</p>
              <p className="text-xs text-red-800 font-normal">
                Your ASHA health worker (ID: {activePatient?.healthWorkerId}) has been alerted to provide guidance with e-Sanjeevani.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Editable Medicine & Appointment Reminders */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <span>{t.followup.remindersTitle}</span>
          </h2>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="touch-target text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>{t.followup.addReminder}</span>
          </button>
        </div>

        {/* Add Reminder Form */}
        {showAddForm && (
          <form onSubmit={handleAddReminder} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {t.followup.medicineName}
              </label>
              <input
                type="text"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="e.g. Carbamazepine / PHC Follow-up"
                className="w-full text-xs sm:text-sm p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  {t.followup.time}
                </label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="08:00 AM"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  {t.followup.frequency}
                </label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="Daily / Weekly"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="touch-target px-3 py-1.5 text-xs text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="touch-target flex-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm"
              >
                Save Reminder
              </button>
            </div>
          </form>
        )}

        {/* Reminders List */}
        <div className="space-y-2">
          {reminders.map((r) => (
            <div
              key={r.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-xs sm:text-sm"
            >
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500">{r.time} • {r.date}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteReminder(r.id)}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                title="Delete reminder"
                aria-label={`Delete ${r.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Encouraging Supportive Message as required */}
      <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl flex items-center gap-3">
        <HeartHandshake className="w-8 h-8 text-teal-700 shrink-0" />
        <p className="text-xs sm:text-sm text-teal-900 font-medium">
          {t.followup.encouraging}
        </p>
      </div>
    </div>
  );
}
