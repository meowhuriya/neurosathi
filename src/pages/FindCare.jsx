import React, { useState } from 'react';
import {
  ExternalLink,
  Phone,
  CheckSquare,
  Square,
  MapPin,
  Building2,
  FileText,
  Printer,
  Copy,
  ChevronDown,
  ChevronUp,
  HeartHandshake,
  MessageSquare
} from 'lucide-react';
import { SAMPLE_HOSPITALS } from '../data/governmentSchemes';
import { calculatePatientMetrics } from '../utils/scoring';
import { getTypedNote } from '../utils/audioStorage';
import { PublicHealthCard } from '../components/PublicHealthCard';
import { SmsPacketModal } from '../components/SmsPacketModal';
import { ESanjeevaniModal } from '../components/ESanjeevaniModal';

export function FindCare({ t, activePatient, onUpdateFollowUp }) {
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showESanjeevani, setShowESanjeevani] = useState(false);
  const [visitStatus, setVisitStatus] = useState(
    activePatient?.followUp?.visitConfirmed ? 'yes' : null
  );
  const [checklist, setChecklist] = useState({
    summary: true,
    medicines: false,
    aadhaar: false,
    questions: false
  });

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const assessments = activePatient?.assessments || [];
  const metrics = calculatePatientMetrics(assessments);
  const { tappingDropPct, reactionSlowedPct, baseTapping, recentTapping, baseReactionMs, recentReactionMs } = metrics;
  const typedNote = getTypedNote(activePatient.id);

  // Filter neurology centers by the selected patient's state:
  // Telangana patient -> Hyderabad; Maharashtra patient -> Mumbai; others -> nearest sample (New Delhi)
  const getRelevantHospitals = () => {
    const patientState = (activePatient?.state || '').toLowerCase();
    if (patientState.includes('telangana')) {
      return SAMPLE_HOSPITALS.filter(h => 
        h.city?.toLowerCase() === 'hyderabad' || 
        h.state?.toLowerCase() === 'telangana' ||
        h.id === 'hosp-1'
      );
    }
    if (patientState.includes('maharashtra')) {
      return SAMPLE_HOSPITALS.filter(h => 
        h.city?.toLowerCase() === 'mumbai' || 
        h.state?.toLowerCase() === 'maharashtra' ||
        h.id === 'hosp-3'
      );
    }
    // others -> nearest sample
    const nearest = SAMPLE_HOSPITALS.filter(h => 
      h.city?.toLowerCase() === 'new delhi' || 
      h.state?.toLowerCase() === 'delhi' ||
      h.id === 'hosp-2'
    );
    return nearest.length > 0 ? nearest : [SAMPLE_HOSPITALS[0]];
  };

  const displayedHospitals = getRelevantHospitals();

  const isDecline = (tappingDropPct > 20 || reactionSlowedPct > 20);
  const suggestedAction = isDecline ? "consider specialist tele-consult" : "continue monitoring";

  const summaryParagraph = `Suggested action for doctor review: ${suggestedAction} (Prompt for doctor's clinical judgment based on observed trend). Over the past 8 weeks, ${activePatient.firstName} (${activePatient.condition}, ${activePatient.age}y - ${activePatient.state}) has shown a sustained decline: tapping speed dropped about ${tappingDropPct}% and reaction time slowed about ${reactionSlowedPct}% over 3 weeks. A clinical review is recommended. Not a diagnosis.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryParagraph);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleSelectStatus = (status) => {
    setVisitStatus(status);
    if (onUpdateFollowUp) {
      onUpdateFollowUp({
        visitConfirmed: status === 'yes',
        notes: status === 'yes' ? "Consultation completed." : status === 'need-help' ? "Help requested with booking." : "Follow-up due."
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Standard Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <HeartHandshake className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            3 Connect: Free Consult & Linkage
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            ASHA worker connects {activePatient?.firstName || "Lakshmi"} to a doctor
          </p>
        </div>
      </div>

      {/* 1. LARGE CTA BUTTON: BOOK FREE DOCTOR CONSULT (e-Sanjeevani) */}
      <div className="bg-teal-50/90 border-2 border-teal-500 rounded-2xl p-5 sm:p-6 text-center space-y-3 shadow-sm">
        <div>
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">
            Government National Telemedicine Service
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
            Connect {activePatient.firstName} with an MBBS Doctor
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
            Free government video/audio consultation directly connecting rural patients and ASHA workers to government medical officers.
          </p>
        </div>

        <a
          href="https://esanjeevani.mohfw.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-extrabold text-base sm:text-lg shadow-md transition-all"
        >
          <span>Book free doctor consult</span>
          <ExternalLink className="w-5 h-5" />
        </a>

        {/* Rapid Rural Triage & e-Sanjeevani Referral Slip Generators */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => setShowESanjeevani(true)}
            className="touch-target flex-1 py-3 px-4 rounded-xl bg-white hover:bg-teal-50 text-teal-900 border border-teal-300 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <FileText className="w-4 h-4 text-teal-700" />
            <span>📄 Generate e-Sanjeevani Case Referral Slip</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSmsModal(true)}
            className="touch-target flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>📲 Generate 2G SMS Triage Packet</span>
          </button>
        </div>
      </div>

      {/* 2. DOCTOR SUMMARY FOR THE SAME PATIENT (Lakshmi) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
              1-Page OPD Clinical Parchi
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Doctor Summary: {activePatient.firstName} ({activePatient.condition}, {activePatient.age}y)
            </h3>
            <p className="text-xs text-slate-500">
              8-week monitoring history prepared for the treating doctor
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="touch-target px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-300"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="touch-target px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSummary ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Snippet / Full toggle */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2">
          {/* Top line for receiving doctor */}
          <div className="pb-2.5 mb-2 border-b border-slate-200">
            <span className="font-bold text-slate-900 block">
              Suggested action for doctor review: {suggestedAction}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Prompt for receiving doctor's clinical judgment based on observed trend. Not a diagnosis.
            </span>
          </div>

          <p className="font-semibold text-slate-900">Summary for Clinician:</p>
          <p>{summaryParagraph}</p>

          <button
            type="button"
            onClick={() => setShowFullSummary(!showFullSummary)}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 pt-1"
          >
            <span>{showFullSummary ? "Hide detail" : "View clinical numbers"}</span>
            {showFullSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showFullSummary && (
            <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-700">
              <p>• Tapping Speed: Baseline {baseTapping} taps → Recent {recentTapping} taps ({tappingDropPct}% drop)</p>
              <p>• Reaction Time: Baseline {baseReactionMs} ms → Recent {recentReactionMs} ms ({reactionSlowedPct}% slowed)</p>
              <p>• Assigned ASHA Worker: {activePatient.healthWorkerId || "ASHA-TS-04"}</p>
              <p>• Data storage: Sandbox localStorage on local device</p>
            </div>
          )}

          {/* Typed note from Step 1 Check (Parchi shows only typed note, no audio) */}
          {typedNote && (
            <div className="pt-2.5 border-t border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block text-xs">Patient / Caregiver Note:</span>
              <p className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 italic text-xs">
                "{typedNote}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. HEALTHCARE LINKS: Ayushman Bharat, Jan Aushadhi, Tele-MANAS */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider px-1">
          Affordable Care & Government Support
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Ayushman Bharat PM-JAY */}
          <a
            href="https://pmjay.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition-colors flex flex-col justify-between space-y-2"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl">🏥</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="font-bold text-sm text-slate-900 block">Ayushman Bharat</span>
              <p className="text-xs text-slate-500 mt-1">₹5 Lakh cashless hospital coverage under PM-JAY scheme.</p>
            </div>
            <span className="text-xs font-bold text-teal-700">Check Eligibility →</span>
          </a>

          {/* Jan Aushadhi */}
          <a
            href="https://janaushadhi.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition-colors flex flex-col justify-between space-y-2"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl">💊</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="font-bold text-sm text-slate-900 block">Jan Aushadhi</span>
              <p className="text-xs text-slate-500 mt-1">High-quality generic medicines at 50-80% lower cost.</p>
            </div>
            <span className="text-xs font-bold text-teal-700">Find Kendra Store →</span>
          </a>

          {/* Tele-MANAS */}
          <a
            href="tel:14416"
            className="touch-target p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition-colors flex flex-col justify-between space-y-2"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl">🧘</span>
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="font-bold text-sm text-slate-900 block">Tele-MANAS (14416)</span>
              <p className="text-xs text-slate-500 mt-1">24/7 free mental health and caregiver distress helpline.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700">Call Free 14416 →</span>
          </a>
        </div>
      </div>

      {/* Public Health Support, Zero-Literacy Pill Guide & Jan Aushadhi Generic Savings */}
      <PublicHealthCard patient={activePatient} />

      {/* 4. "BEFORE YOUR VISIT" CHECKLIST */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-teal-600" />
          <span>Before Your Visit Checklist</span>
        </h3>

        <div className="space-y-2 text-xs sm:text-sm">
          {[
            { key: 'summary', text: "Keep this Doctor Summary slip ready on your phone or printout." },
            { key: 'medicines', text: "Carry all current medicine strips/bottles to the clinic." },
            { key: 'aadhaar', text: "Carry your Aadhaar card and Ayushman Bharat PM-JAY card." },
            { key: 'questions', text: "Note down changes in walking or daily tasks over the past month." }
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleChecklist(item.key)}
              className="touch-target w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
            >
              <span className="text-teal-700 shrink-0">
                {checklist[item.key] ? (
                  <CheckSquare className="w-5 h-5 fill-teal-100" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </span>
              <span className={`font-medium ${checklist[item.key] ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {item.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. SAMPLE HOSPITAL LIST LABELLED "SAMPLE DATA" */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <span>Neurology Centers (Sample Data)</span>
          </h3>
          <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
            Sample data — illustrative government referral centers for prototype demonstration.
          </p>
        </div>

        <div className="space-y-2.5">
          {displayedHospitals.map((hosp) => (
            <div 
              key={hosp.id}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm space-y-1.5"
            >
              <p className="font-bold text-slate-800">{hosp.name}</p>
              <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="font-medium">{hosp.city || hosp.location}</span>
              </div>
              <p className="text-slate-500 text-xs">
                Confirm timings and charges locally.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. AT THE BOTTOM: "DID THE PATIENT VISIT A DOCTOR?" */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          Did the patient visit a doctor?
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleSelectStatus('yes')}
            className={`touch-target py-2.5 px-3 rounded-xl font-bold text-xs text-center transition-colors ${
              visitStatus === 'yes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            Yes ✓
          </button>
          <button
            type="button"
            onClick={() => handleSelectStatus('not-yet')}
            className={`touch-target py-2.5 px-3 rounded-xl font-bold text-xs text-center transition-colors ${
              visitStatus === 'not-yet'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            Not yet ⏳
          </button>
          <button
            type="button"
            onClick={() => handleSelectStatus('need-help')}
            className={`touch-target py-2.5 px-3 rounded-xl font-bold text-xs text-center transition-colors ${
              visitStatus === 'need-help'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            Need help 🤝
          </button>
        </div>

        {/* Short supportive message based on selection */}
        {visitStatus === 'yes' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
            ✓ Great! Follow-up completed. Routine home surveillance continues for {activePatient.firstName}.
          </div>
        )}

        {visitStatus === 'not-yet' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
            ⏳ Reminder active: Please help {activePatient.firstName} connect to an e-Sanjeevani or PHC doctor this week.
          </div>
        )}

        {visitStatus === 'need-help' && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 font-medium">
            🤝 ASHA assistance requested: ASHA worker alerted to help with PM-JAY enrollment, transport, or telemedicine booking.
          </div>
        )}
      </div>

      {/* e-Sanjeevani Referral & 2G SMS Packet Modals */}
      <ESanjeevaniModal
        isOpen={showESanjeevani}
        onClose={() => setShowESanjeevani(false)}
        patient={activePatient}
      />
      <SmsPacketModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        patient={activePatient}
      />
    </div>
  );
}
