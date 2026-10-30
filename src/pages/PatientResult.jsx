import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  Phone,
  ExternalLink,
  QrCode,
  FileText,
  X,
  Printer,
  HeartHandshake
} from 'lucide-react';
import { ListenButton } from '../components/ListenButton';
import { TakeAMomentCard } from '../components/TakeAMomentCard';
import { calculatePatientMetrics } from '../utils/scoring';
import { useDeclineDetection } from '../hooks/useDeclineDetection';
import { getTypedNote } from '../utils/audioStorage';

export function PatientResult({ currentLang = 'en', activePatient, threshold = 0.20 }) {
  const navigate = useNavigate();
  const patient = activePatient || { firstName: 'Lakshmi', condition: 'MS', id: 'NS-001' };
  const assessments = patient.assessments || [];
  const detectionResult = useDeclineDetection(assessments, threshold);
  const metrics = calculatePatientMetrics(assessments);
  const typedNote = getTypedNote(patient.id);

  // Check if session assessment had an urgent or decline flag
  const sessionCheck = (() => {
    try {
      const stored = localStorage.getItem('neurosathi_session_check');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  })();

  const isUrgent = Boolean(sessionCheck?.isUrgent || sessionCheck?.strokeUrgent === 'yes' || sessionCheck?.epilepsyUrgent === 'yes');
  const isDeclining = Boolean(detectionResult.isDeclining || metrics.tappingDropPct >= 20 || sessionCheck?.isFlagged);
  const needsDoctor = isUrgent || isDeclining;

  // Single plain language sentence (Strictly: "Looks stable. Next check in 2 weeks." OR "Please see a doctor soon.")
  const getPlainSentence = () => {
    if (needsDoctor) {
      switch (currentLang) {
        case 'hi':
          return "कृपया जल्द ही डॉक्टर से मिलें।";
        case 'te':
          return "దయచేసి త్వరలో వైద్యుడిని సంప్రదించండి.";
        case 'ur':
          return "براہ کرم جلد ہی ڈاکٹر سے رجوع کریں۔";
        case 'en':
        default:
          return "Please see a doctor soon.";
      }
    } else {
      switch (currentLang) {
        case 'hi':
          return "स्थिति स्थिर दिख रही है। अगली जांच 2 सप्ताह में करें।";
        case 'te':
          return "పరిస్థితి స్థిరంగా కనిపిస్తోంది. తదుపరి తనిఖీ 2 వారాల్లో.";
        case 'ur':
          return "حالت مستحکم لگ رہی ہے۔ اگلی جانچ 2 ہفتوں میں۔";
        case 'en':
        default:
          return "Looks stable. Next check in 2 weeks.";
      }
    }
  };

  const plainSentence = getPlainSentence();
  const [showDoctorCard, setShowDoctorCard] = useState(false);

  return (
    <div className="space-y-6 max-w-lg mx-auto text-center py-2">
      {/* Patient Greeting & Status Badge */}
      <div className="space-y-1">
        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Home Brain Health Result
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 pt-1">
          {patient.firstName}
        </h1>
      </div>

      {/* ONE Main Result Card - High visual clarity, large icon, minimal text, NO CHARTS, NO SCORES, NO PERCENTAGES */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border-2 shadow-sm space-y-5 ${
          needsDoctor
            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
            : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
        }`}
      >
        {/* Large Status Icon */}
        <div className="flex justify-center">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-md ${
              needsDoctor ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {needsDoctor ? (
              <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.2]" />
            ) : (
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 stroke-[2.2]" />
            )}
          </div>
        </div>

        {/* ONE plain sentence */}
        <div className="space-y-2">
          <p className="text-xl sm:text-2xl font-extrabold leading-snug">
            {plainSentence}
          </p>
        </div>

        {/* Listen Button (Always present on every screen) */}
        <div className="pt-1 flex justify-center">
          <ListenButton text={plainSentence} currentLang={currentLang} />
        </div>
      </div>

      {/* Optional Card: "Take a moment" with Skip button */}
      <TakeAMomentCard
        resultType={isUrgent ? 'urgent' : needsDoctor ? 'needs-visit' : 'stable'}
        isUrgent={isUrgent}
        currentLang={currentLang}
      />

      {/* Action Buttons: ONE Big Call/Consult Button + Show My Doctor Card */}
      <div className="space-y-3 pt-1">
        {/* ONE BIG ACTION BUTTON: Call for help / Book free doctor consult */}
        <a
          href="https://esanjeevani.mohfw.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target w-full py-4 sm:py-5 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-extrabold text-base sm:text-lg shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <HeartHandshake className="w-6 h-6 shrink-0" />
          <span>Call for help / Book free doctor consult</span>
          <ExternalLink className="w-4 h-4 shrink-0" />
        </a>

        {/* Show my doctor card button */}
        <button
          type="button"
          onClick={() => setShowDoctorCard(true)}
          className="touch-target w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border-2 border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <QrCode className="w-5 h-5 text-teal-700" />
          <span>Show my doctor card (Parchi with QR)</span>
        </button>
      </div>

      {/* Emergency 108 button: ALWAYS VISIBLE */}
      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-left space-y-2 shadow-xs">
        <div className="flex items-center gap-2 text-red-900 font-bold text-sm sm:text-base">
          <span className="text-xl">🚨</span>
          <span>Emergency Medical Help</span>
        </div>
        <p className="text-xs text-red-800">
          If the patient has sudden trouble breathing, speech loss, seizures over 5 minutes, or acute weakness, call immediate emergency response.
        </p>
        <a
          href="tel:108"
          className="touch-target inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-sm transition-all cursor-pointer"
        >
          <Phone className="w-4 h-4" />
          <span>Call 108 Ambulance (Free 24x7)</span>
        </a>
      </div>

      {/* DOCTOR CARD MODAL / PARCHI WITH QR CODE */}
      {showDoctorCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-left space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
                  OPD Clinical Parchi
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {patient.firstName}'s Doctor Card
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDoctorCard(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated QR Code for Doctor/Hospital */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
              {/* Scalable SVG QR Code */}
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-xs flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="26" height="26" rx="4" />
                  <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="13" width="10" height="10" fill="currentColor" />

                  <rect x="69" y="5" width="26" height="26" rx="4" />
                  <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                  <rect x="77" y="13" width="10" height="10" fill="currentColor" />

                  <rect x="5" y="69" width="26" height="26" rx="4" />
                  <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                  <rect x="13" y="77" width="10" height="10" fill="currentColor" />

                  {/* Internal matrix dots */}
                  <rect x="36" y="8" width="6" height="6" />
                  <rect x="48" y="14" width="6" height="6" />
                  <rect x="56" y="8" width="6" height="6" />
                  <rect x="38" y="24" width="6" height="6" />
                  <rect x="48" y="28" width="6" height="6" />

                  <rect x="8" y="38" width="6" height="6" />
                  <rect x="20" y="44" width="6" height="6" />
                  <rect x="36" y="40" width="8" height="8" />
                  <rect x="50" y="44" width="6" height="6" />
                  <rect x="64" y="38" width="6" height="6" />
                  <rect x="78" y="44" width="6" height="6" />

                  <rect x="14" y="54" width="6" height="6" />
                  <rect x="26" y="50" width="6" height="6" />
                  <rect x="38" y="58" width="6" height="6" />
                  <rect x="52" y="54" width="8" height="8" />
                  <rect x="68" y="58" width="6" height="6" />
                  <rect x="82" y="52" width="6" height="6" />

                  <rect x="38" y="74" width="6" height="6" />
                  <rect x="48" y="82" width="6" height="6" />
                  <rect x="62" y="72" width="6" height="6" />
                  <rect x="76" y="78" width="6" height="6" />
                  <rect x="84" y="86" width="6" height="6" />
                </svg>
              </div>
              <p className="text-[11px] font-semibold text-slate-600">
                Show this QR to the hospital OPD doctor or PHC nurse to link records.
              </p>
            </div>

            {/* Patient Parchi Details */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{patient.firstName} ({patient.gender}, {patient.age}y)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Condition:</span>
                <span className="font-bold text-slate-900">{patient.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned ASHA:</span>
                <span className="font-bold text-slate-900">{patient.healthWorkerId || "ASHA-TS-04"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Flag:</span>
                <span className="font-bold text-slate-900">{needsDoctor ? "Needs doctor consult" : "Stable surveillance"}</span>
              </div>
              {typedNote && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block">Patient Note:</span>
                  <p className="italic text-slate-800 bg-white p-2 rounded border border-slate-200 mt-0.5">
                    "{typedNote}"
                  </p>
                </div>
              )}
            </div>

            {/* Print and Close buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="touch-target flex-1 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDoctorCard(false)}
                className="touch-target flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
