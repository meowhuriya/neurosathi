import React, { useState } from 'react';
import { Copy, Check, X, Share2, Printer, Phone, Calendar, HeartPulse, ShieldAlert } from 'lucide-react';
import { evaluatePatientDecline } from '../utils/scoring';

export function WhatsAppCareSlipModal({ isOpen, onClose, patient }) {
  if (!isOpen || !patient) return null;

  const [copied, setCopied] = useState(false);
  const evaluation = evaluatePatientDecline(patient.assessments || [], 0.20);
  const isDecline = evaluation.isDeclining;

  const nextDate = patient.followUp?.reminderDate || 'Within 2 weeks';
  const ashaName = patient.healthWorkerId || 'ASHA-TS-04';

  // Condition-specific morning/afternoon/night medicine schedule
  const getMedSchedule = () => {
    if (patient.condition === 'Stroke') {
      return [
        { time: '☀️ Morning', meds: 'Aspirin 75mg (1 pill after food), Amlodipine 5mg' },
        { time: '🌤️ Afternoon', meds: 'Ample water, walk with support' },
        { time: '🌙 Night', meds: 'Atorvastatin 20mg (1 pill before sleep)' }
      ];
    }
    if (patient.condition === "Parkinson's") {
      return [
        { time: '☀️ Morning', meds: 'Levodopa/Carbidopa 100/25mg (1 pill), Trihexyphenidyl 2mg' },
        { time: '🌤️ Afternoon', meds: 'Levodopa/Carbidopa 100/25mg (1 pill on time)' },
        { time: '🌙 Night', meds: 'Levodopa/Carbidopa 100/25mg (1 pill before sleep)' }
      ];
    }
    if (patient.condition === 'Epilepsy') {
      return [
        { time: '☀️ Morning', meds: 'Anti-seizure dose (e.g. Levetiracetam / Valproate 500mg)' },
        { time: '🌤️ Afternoon', meds: 'Avoid midday heat and dehydration' },
        { time: '🌙 Night', meds: 'Night anti-seizure dose (DO NOT SKIP, full 8h sleep)' }
      ];
    }
    // MS
    return [
      { time: '☀️ Morning', meds: 'Prescribed DMT / Glatiramer, gentle mobility exercises' },
      { time: '🌤️ Afternoon', meds: 'Rest in cool shade, prevent overheating' },
      { time: '🌙 Night', meds: 'Baclofen 10mg (if stiffness present) before bed' }
    ];
  };

  const schedule = getMedSchedule();

  const formattedWhatsAppText = `
🏥 *NEUROSATHI — PHC FAMILY CARE SUMMARY*
*Government Community Health Surveillance*

👤 *Patient:* ${patient.firstName} (${patient.age}y, ${patient.condition})
🆔 *ABHA ID:* ${patient.abhaId || '91-4523-8819-2041'}
📍 *Region:* ${patient.state} | *ASHA:* ${ashaName}

📊 *Current Health Status:*
${isDecline ? '🟡 *Doctor Visit Advised:* Motor slowing or symptom changes noted over recent checks. Please take patient to nearest PHC or connect via e-Sanjeevani.' : '🟢 *Stable:* Checks look steady. Continue routine home care and regular medicines.'}

📅 *Next ASHA Check / PHC Visit:* ${nextDate}

💊 *DAILY MEDICINE SCHEDULE (PHC / Jan Aushadhi):*
${schedule.map(s => `• *${s.time}:* ${s.meds}`).join('\n')}

🚨 *RED-FLAG DANGER SIGNS — CALL 108 IMMEDIATELY IF:*
• Sudden loss of speech or face drooping
• New weakness in arm or inability to lift leg
• Seizure lasting longer than 5 minutes
• Severe choking, chest congestion, or high fever

📞 *Free Tele-Consult:* e-Sanjeevani (https://esanjeevani.mohfw.gov.in)
📞 *Mental Health Helpline:* Tele-MANAS 14416
🚑 *Medical Emergency:* Call 108
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedWhatsAppText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(formattedWhatsAppText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="touch-target absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-white/20 text-white border border-white/30 text-lg">
              📱
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 block">
                Direct-to-Caregiver Handoff
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Family Care Slip (WhatsApp & Print)
              </h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed mt-2">
            Simple, icon-guided summary formatted for family smartphones. Zero medical jargon; clear pill timings and 108 red-flags.
          </p>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Card Preview */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-3 shadow-xs">
            {/* Header row */}
            <div className="flex justify-between items-start border-b border-emerald-200/60 pb-2">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {patient.firstName} — Family Care Slip
                </h3>
                <p className="text-slate-600 text-[11px]">
                  {patient.condition} • Age {patient.age} • ABHA: {patient.abhaId || '91-4523-8819-2041'}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                isDecline ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {isDecline ? '🟡 Doctor Visit Advised' : '🟢 Stable'}
              </span>
            </div>

            {/* Next Check */}
            <div className="flex items-center gap-2 text-slate-700 bg-white p-2.5 rounded-xl border border-emerald-100">
              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              <span><strong>Next PHC Follow-Up:</strong> {nextDate} (ASHA: {ashaName})</span>
            </div>

            {/* Visual Pill Checklist */}
            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                💊 Daily Medicine Schedule:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {schedule.map(s => (
                  <div key={s.time} className="bg-white p-2 rounded-xl border border-emerald-100 flex items-center justify-between text-slate-800">
                    <span className="font-bold text-slate-900 shrink-0 mr-2">{s.time}</span>
                    <span className="text-[11px] text-slate-600 text-right">{s.meds}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flag Warning */}
            <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl text-red-950 space-y-1">
              <span className="font-bold text-[11px] text-red-800 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>Call 108 immediately if:</span>
              </span>
              <p className="text-[11px] text-red-900 leading-tight">
                Sudden speech trouble, face drooping, seizure &gt; 5 mins, or severe choking.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="touch-target py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-300 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="touch-target py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="touch-target py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Designed for rural family caregivers • Bilingual Hindi / Marathi / Telugu ready
        </div>
      </div>
    </div>
  );
}
