import React, { useState } from 'react';
import { ExternalLink, Copy, Check, X, ShieldAlert, FileText, Stethoscope } from 'lucide-react';
import { calculatePatientMetrics, evaluatePatientDecline } from '../utils/scoring';
import { getLatestReadings } from '../utils/readingsStorage';

export function ESanjeevaniModal({ isOpen, onClose, patient }) {
  if (!isOpen || !patient) return null;

  const [copied, setCopied] = useState(false);
  const metrics = calculatePatientMetrics(patient.assessments || []);
  const evaluation = evaluatePatientDecline(patient.assessments || [], 0.20);
  const latestReadings = getLatestReadings(patient);

  const suggestedAction = evaluation.isDeclining ? "Consider specialist tele-consult" : "Continue monitoring";
  const bpStr = latestReadings?.systolic && latestReadings?.diastolic
    ? `${latestReadings.systolic}/${latestReadings.diastolic} mmHg`
    : '135/86 mmHg';

  const referralText = `
GOVERNMENT OF INDIA • MINISTRY OF HEALTH & FAMILY WELFARE (MoHFW)
NATIONAL TELECONSULTATION SERVICE — e-SANJEEVANI TELE-NEUROLOGY REFERRAL

======================================================================
1. PATIENT IDENTIFIERS & PUBLIC HEALTH COVERAGE
• Name: ${patient.firstName}
• Age / Gender: ${patient.age} yrs / ${patient.gender}
• Primary Neurological Condition: ${patient.condition}
• State / District: ${patient.state}
• 14-Digit ABHA ID: ${patient.abhaId || '91-4523-8819-2041'}
• Scheme Coverage: ${patient.schemeEligibility || 'Ayushman Bharat PM-JAY Eligible'}
• Assigned ASHA Worker ID: ${patient.healthWorkerId || 'ASHA-TS-04'}

2. LONGITUDINAL SURVEILLANCE FINDINGS (8-WEEK CYCLE)
• Triage Status: ${evaluation.isDeclining ? 'NEEDS DOCTOR VISIT (Sustained Decline)' : 'STABLE'}
• Finger Tapping Speed: Baseline ${metrics.baseTapping || 44} taps -> Recent ${metrics.recentTapping || 30} taps (${metrics.tappingDropPct || 30}% decline)
• Cognitive Reaction Time: Baseline ${metrics.baseReactionMs || 1120} ms -> Recent ${metrics.recentReactionMs || 1590} ms (${metrics.reactionSlowedPct || 35}% slowed)
• Home Vitals (Unverified): BP ${bpStr} | Sugar: ${latestReadings?.bloodSugar || '118 mg/dL'}

3. CURRENT PHC MEDICATIONS (JAN AUSHADHI REFILLS)
${(patient.medications || []).map(m => `• ${m.name} (${m.dosage}) - ${m.frequency}`).join('\n') || '• Generic PHC Neuro Maintenance'}

4. TELE-NEUROLOGIST REVIEW PROMPT
• Suggested Action: ${suggestedAction} (Prompt for receiving physician's clinical judgment based on observed trend)
• Reference Protocol: ICMR / Rural Neuro Triage Decision Support v1.2

DISCLAIMER: Community health monitoring report. Not a diagnosis. Generated via NeuroSathi Platform.
======================================================================
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(referralText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto text-left">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white p-5 sm:p-6 relative">
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
              🏥
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 block">
                MoHFW National Telemedicine Service
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                e-Sanjeevani Case Referral Slip
              </h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed mt-2">
            Structured clinical handoff slip pre-populating 8-week longitudinal neuro trends and ABHA records for the government tele-neurologist.
          </p>
        </div>

        {/* Slip Content Preview */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-800 space-y-3 max-h-72 overflow-y-auto leading-relaxed shadow-inner">
            <div className="border-b border-slate-200 pb-2 flex justify-between items-center text-[11px] font-bold text-slate-600">
              <span>MoHFW e-SANJEEVANI TELE-OPD REFERRAL</span>
              <span className="text-emerald-700">ABHA: {patient.abhaId || '91-4523-8819-2041'}</span>
            </div>

            <div className="space-y-1">
              <p className="font-bold text-slate-900">Patient: {patient.firstName} ({patient.age}y, {patient.gender} — {patient.condition})</p>
              <p className="text-slate-600">State: {patient.state} | ASHA ID: {patient.healthWorkerId || 'ASHA-TS-04'}</p>
              <p className="text-teal-700 font-bold">Scheme: {patient.schemeEligibility || 'Ayushman Bharat PM-JAY'}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Longitudinal Surveillance Findings:</p>
              <p className="text-amber-800 font-semibold">• Tapping Speed: {metrics.baseTapping} taps baseline → {metrics.recentTapping} taps recent ({metrics.tappingDropPct}% drop)</p>
              <p className="text-amber-800 font-semibold">• Reaction Time: {metrics.baseReactionMs} ms baseline → {metrics.recentReactionMs} ms ({metrics.reactionSlowedPct}% slowed)</p>
              <p className="text-slate-700">• Home Vitals: BP {bpStr}</p>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="font-bold text-teal-900">Suggested Action for Doctor Review:</p>
              <p className="text-slate-700 italic">{suggestedAction} (Prompt for physician judgment based on observed trend).</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="touch-target py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border border-slate-300 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied Referral Slip!" : "Copy Full Referral Slip"}</span>
            </button>

            <a
              href="https://esanjeevani.mohfw.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="touch-target py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer text-center"
            >
              <span>Open e-Sanjeevani Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3.5 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Official Government Telemedicine Integration • Free Consultation for Rural Citizens
        </div>
      </div>
    </div>
  );
}
