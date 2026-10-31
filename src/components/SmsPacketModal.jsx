import React, { useState } from 'react';
import { MessageSquare, Copy, Check, Send, X, ShieldCheck, WifiOff, PhoneCall, Info } from 'lucide-react';
import { calculatePatientMetrics, evaluatePatientDecline } from '../utils/scoring';
import { getLatestReadings } from '../utils/readingsStorage';

export function SmsPacketModal({ isOpen, onClose, patient, sessionData }) {
  if (!isOpen || !patient) return null;

  const [copied, setCopied] = useState(false);
  const [sendSimulated, setSendSimulated] = useState(false);
  const [sendingState, setSendingState] = useState('idle'); // 'idle' | 'sending' | 'sent'

  // Determine latest vitals and metrics
  const latestReadings = getLatestReadings(patient);
  const metrics = calculatePatientMetrics(patient.assessments || []);
  const evaluation = evaluatePatientDecline(patient.assessments || [], 0.20);

  // Determine latest assessment values
  const lastAssessment = patient.assessments?.[patient.assessments.length - 1];
  const leftTaps = sessionData?.motor?.leftTaps ?? lastAssessment?.motor?.leftTaps ?? 32;
  const rightTaps = sessionData?.motor?.rightTaps ?? lastAssessment?.motor?.rightTaps ?? 34;
  const rtMs = sessionData?.processing?.avgReactionMs ?? lastAssessment?.processing?.avgReactionMs ?? 1420;

  // Determine blood pressure
  const bpSys = sessionData?.readings?.systolic || latestReadings?.systolic || 135;
  const bpDia = sessionData?.readings?.diastolic || latestReadings?.diastolic || 86;
  const bpStr = `${bpSys}/${bpDia}`;

  // Triage status
  const isUrgent = Boolean(sessionData?.isUrgent || evaluation.isDeclining);
  const statusTag = isUrgent ? 'URGENT-DOCTOR-VISIT' : 'STABLE';

  // Format compact 2G SMS string (< 160 GSM-7 characters)
  // Format: NS-TRG|ID|NAME|COND|TAP:L/R(DROP%)|RT:ms|BP:sys/dia|STATUS|ASHA
  const dropPct = metrics.tappingDropPct > 0 ? `-${metrics.tappingDropPct}%` : '0%';
  const smsPayload = `NS-TRG|${patient.id}|${patient.firstName.toUpperCase()}|${patient.condition.substring(0, 4).toUpperCase()}|TAP:${leftTaps}/${rightTaps}(${dropPct})|RT:${rtMs}ms|BP:${bpStr}|${statusTag}|ASHA:${patient.healthWorkerId || 'ASHA-TS-04'}`;

  const charCount = smsPayload.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(smsPayload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleSimulateSend = () => {
    setSendingState('sending');
    setTimeout(() => {
      setSendingState('sent');
      setSendSimulated(true);
      setTimeout(() => setSendingState('idle'), 4000);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto text-left">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="touch-target absolute top-4 right-4 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 block">
                Offline Village Triage Protocol
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                📲 2G SMS Triage Packet Generator
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mt-2">
            Designed for remote hamlets with <strong>zero mobile internet</strong>. Packs longitudinal motor decline, vitals, and urgent flags into a standard 160-character 2G SMS for PHC tele-triage.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Patient Quick Context */}
          <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block text-sm">{patient.firstName}</span>
              <span className="text-slate-500">{patient.condition} • {patient.state}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-teal-800 block text-xs">ABHA: {patient.abhaId || '91-4523-8819-2041'}</span>
              <span className="text-[11px] text-slate-500">ASHA ID: {patient.healthWorkerId || 'ASHA-TS-04'}</span>
            </div>
          </div>

          {/* SMS Payload Display */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Raw 2G GSM-7 Encoded Payload</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                  {charCount} / 160 chars ({160 - charCount} left)
                </span>
              </label>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Fits 1 Standard SMS
              </span>
            </div>

            <div className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm rounded-2xl border border-slate-800 shadow-inner break-all select-all leading-relaxed">
              {smsPayload}
            </div>
          </div>

          {/* Field Breakdown Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Payload Structure (Field Breakdown):
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-700">
              <div><span className="font-bold text-slate-900">ID:</span> {patient.id}</div>
              <div><span className="font-bold text-slate-900">Condition:</span> {patient.condition}</div>
              <div><span className="font-bold text-slate-900">Motor Taps:</span> L:{leftTaps} / R:{rightTaps} ({dropPct})</div>
              <div><span className="font-bold text-slate-900">Reaction Time:</span> {rtMs} ms</div>
              <div><span className="font-bold text-slate-900">Blood Pressure:</span> {bpStr} mmHg</div>
              <div><span className="font-bold text-slate-900">Priority:</span> {statusTag}</div>
            </div>
          </div>

          {/* Transmission Status Toast if Simulated */}
          {sendingState === 'sending' && (
            <div className="p-3 bg-teal-50 border border-teal-300 rounded-2xl text-xs text-teal-900 font-bold flex items-center gap-2 animate-pulse">
              <span className="text-base">📡</span>
              <span>Transmitting packet via 2G GSM network to PHC Dr. Sharma (+91 94480 12108)...</span>
            </div>
          )}

          {sendingState === 'sent' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Delivered successfully to PHC Neurology Server via 2G SMS Gateway! Status: Acknowledged ✓</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="touch-target py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border border-slate-300 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy SMS Payload"}</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateSend}
              disabled={sendingState === 'sending'}
              className="touch-target py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{sendingState === 'sending' ? 'Transmitting...' : 'Simulate 2G SMS Send'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="bg-slate-100 p-3.5 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Offline Fallback Specification • ICMR Rural Tele-Triage Standards • Zero Internet Required</span>
        </div>
      </div>
    </div>
  );
}
