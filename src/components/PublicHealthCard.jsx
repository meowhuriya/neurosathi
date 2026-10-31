import React, { useState } from 'react';
import { Pill, ShieldCheck, ExternalLink, FileText, MessageSquare, AlertCircle, TrendingDown, DollarSign } from 'lucide-react';
import { ESanjeevaniModal } from './ESanjeevaniModal';
import { SmsPacketModal } from './SmsPacketModal';

export function PublicHealthCard({ patient, sessionData }) {
  if (!patient) return null;

  const [showESanjeevani, setShowESanjeevani] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);

  // Condition-specific zero-literacy visual schedule & generic medicine cost comparison
  const getPublicHealthData = () => {
    switch (patient.condition) {
      case 'Stroke':
        return {
          title: 'Stroke Secondary Prevention & Cardio-Neuro Protection',
          schedule: [
            {
              time: '☀️ Morning',
              icon: '☀️',
              medName: 'Aspirin 75mg + Amlodipine 5mg',
              instructions: 'Take 1 tablet after breakfast with water. Controls blood pressure and thins blood.',
              color: 'border-amber-200 bg-amber-50/60'
            },
            {
              time: '🌤️ Afternoon',
              icon: '🌤️',
              medName: 'Hydration & Arm Exercises',
              instructions: 'Drink clean boiled water. Practice gentle hand open-close exercise.',
              color: 'border-blue-200 bg-blue-50/60'
            },
            {
              time: '🌙 Night',
              icon: '🌙',
              medName: 'Atorvastatin 20mg',
              instructions: 'Take 1 tablet after dinner before sleep. Keeps brain vessels clean of plaque.',
              color: 'border-indigo-200 bg-indigo-50/60'
            }
          ],
          pricingComparison: [
            { drug: 'Aspirin 75mg (14 tabs)', govtPhc: '₹0 (Free)', janAushadhi: '₹4', privateBrand: '₹45', savings: '91%' },
            { drug: 'Atorvastatin 20mg (10 tabs)', govtPhc: '₹0 (Free)', janAushadhi: '₹12', privateBrand: '₹110', savings: '89%' },
            { drug: 'Amlodipine 5mg (10 tabs)', govtPhc: '₹0 (Free)', janAushadhi: '₹6', privateBrand: '₹48', savings: '88%' }
          ],
          monthlySavings: '₹1,850'
        };

      case "Parkinson's":
        return {
          title: 'Parkinson’s Motor Stability & Anti-Tremor Regimen',
          schedule: [
            {
              time: '☀️ Morning (8:00 AM)',
              icon: '☀️',
              medName: 'Levodopa + Carbidopa (100/25mg) + Trihexyphenidyl 2mg',
              instructions: 'Take with warm water 30 mins before food. Reduces morning stiffness and hand tremor.',
              color: 'border-amber-200 bg-amber-50/60'
            },
            {
              time: '🌤️ Afternoon (1:30 PM)',
              icon: '🌤️',
              medName: 'Levodopa + Carbidopa (100/25mg)',
              instructions: 'Take on exact time to prevent sudden "off" freeze states and walking hesitation.',
              color: 'border-blue-200 bg-blue-50/60'
            },
            {
              time: '🌙 Night (8:00 PM)',
              icon: '🌙',
              medName: 'Levodopa + Carbidopa (100/25mg) + Trihexyphenidyl 2mg',
              instructions: 'Take after dinner. Prevents painful nocturnal muscle spasms and turning difficulty.',
              color: 'border-indigo-200 bg-indigo-50/60'
            }
          ],
          pricingComparison: [
            { drug: 'Levodopa/Carbidopa 100/25mg (10 tabs)', govtPhc: '₹0 (Free)', janAushadhi: '₹38', privateBrand: '₹240', savings: '84%' },
            { drug: 'Trihexyphenidyl 2mg (10 tabs)', govtPhc: '₹0 (Free)', janAushadhi: '₹8', privateBrand: '₹55', savings: '85%' }
          ],
          monthlySavings: '₹2,450'
        };

      case 'Epilepsy':
        return {
          title: 'Epilepsy Seizure-Free Maintenance Regimen',
          schedule: [
            {
              time: '☀️ Morning',
              icon: '☀️',
              medName: 'Levetiracetam 500mg (or Sodium Valproate 300mg)',
              instructions: 'Take right after breakfast. NEVER skip — uninterrupted blood level stops brain seizures.',
              color: 'border-amber-200 bg-amber-50/60'
            },
            {
              time: '🌤️ Afternoon',
              icon: '🌤️',
              medName: 'Avoid Midday Heat / Rest',
              instructions: 'Stay in the shade. Drink fluids. Heat exhaustion and lack of sleep trigger seizures.',
              color: 'border-blue-200 bg-blue-50/60'
            },
            {
              time: '🌙 Night (Same hour daily)',
              icon: '🌙',
              medName: 'Levetiracetam 500mg (or Sodium Valproate 300mg)',
              instructions: 'Take at fixed time before bedtime. Aim for a full 8 hours of uninterrupted sleep.',
              color: 'border-indigo-200 bg-indigo-50/60'
            }
          ],
          pricingComparison: [
            { drug: 'Levetiracetam 500mg (10 tabs)', govtPhc: '₹0 (Free)', janAushadhi: '₹32', privateBrand: '₹195', savings: '83%' },
            { drug: 'Sodium Valproate 300mg (10 tabs)', govtPhc: '₹0 (Free)', janAushadhi: '₹18', privateBrand: '₹120', savings: '85%' },
            { drug: 'Carbamazepine 200mg (10 tabs)', govtPhc: '₹0 (Free)', janAushadhi: '₹12', privateBrand: '₹68', savings: '82%' }
          ],
          monthlySavings: '₹2,100'
        };

      default: // MS
        return {
          title: 'Multiple Sclerosis Relapse Prevention & Spasticity Control',
          schedule: [
            {
              time: '☀️ Morning',
              icon: '☀️',
              medName: 'Disease Modifying Therapy (PHC/NIMS Refill)',
              instructions: 'Take as directed by neurologist. Gentle stretching to loosen leg stiffness.',
              color: 'border-amber-200 bg-amber-50/60'
            },
            {
              time: '🌤️ Afternoon',
              icon: '🌤️',
              medName: 'Cool Environment / Rest',
              instructions: 'Heat worsens MS fatigue and optic blurring (Uhthoff’s phenomenon). Rest in cool shade.',
              color: 'border-blue-200 bg-blue-50/60'
            },
            {
              time: '🌙 Night',
              icon: '🌙',
              medName: 'Baclofen 10mg',
              instructions: 'Take before sleep to relax rigid leg muscles and allow peaceful rest without cramps.',
              color: 'border-indigo-200 bg-indigo-50/60'
            }
          ],
          pricingComparison: [
            { drug: 'Baclofen 10mg (10 tabs)', govtPhc: '₹0 (Free)', janAushadhi: '₹18', privateBrand: '₹145', savings: '87%' },
            { drug: 'Generic Vitamin D3 60K (4 caps)', govtPhc: '₹0 (Free)', janAushadhi: '₹22', privateBrand: '₹160', savings: '86%' }
          ],
          monthlySavings: '₹1,950'
        };
    }
  };

  const healthData = getPublicHealthData();

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5 text-left">
      {/* Header with Public Scheme Badges */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 font-bold">
              🏛️
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                Public Health Support &amp; Affordable Care
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Government Schemes, Zero-Cost Generic Access &amp; Tele-Neurology Handoff
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>💳</span>
              <span>{patient.schemeEligibility || 'Ayushman Bharat PM-JAY'}</span>
            </span>
            <span className="text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-300 px-2.5 py-1 rounded-full">
              ABHA: {patient.abhaId || '91-4523-8819-2041'}
            </span>
          </div>
        </div>
      </div>

      {/* Zero-Literacy Visual Caregiver Medicine Schedule */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <Pill className="w-4 h-4 text-teal-600" />
            <span>Zero-Literacy Visual Medicine Schedule</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            For Patient &amp; Family Caregiver
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {healthData.schedule.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${item.color} space-y-1.5`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">{item.time}</span>
                <span className="text-lg">{item.icon}</span>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-teal-900">{item.medName}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.instructions}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Jan Aushadhi Generic vs Private Brand Subsidized Pricing */}
      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>💊 Pradhan Mantri Jan Aushadhi Generic Subsidies</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Guaranteed generic bio-equivalents saving underprivileged families up to 90%
            </p>
          </div>
          <div className="bg-emerald-100/80 border border-emerald-300 text-emerald-900 font-extrabold text-xs px-2.5 py-1 rounded-xl shrink-0">
            Saves Family ≈ {healthData.monthlySavings} / month
          </div>
        </div>

        {/* Pricing Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="pb-2 font-bold">Neurology Medication</th>
                <th className="pb-2 font-bold text-teal-800">Govt PHC</th>
                <th className="pb-2 font-bold text-emerald-800">Jan Aushadhi Kendra</th>
                <th className="pb-2 font-bold text-slate-400">Private Brand</th>
                <th className="pb-2 font-bold text-right text-emerald-700">Subsidized Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {healthData.pricingComparison.map((row, i) => (
                <tr key={i} className="hover:bg-white/80 transition-colors">
                  <td className="py-2.5 font-bold text-slate-900">{row.drug}</td>
                  <td className="py-2.5 font-extrabold text-teal-700">{row.govtPhc}</td>
                  <td className="py-2.5 font-bold text-emerald-700">{row.janAushadhi}</td>
                  <td className="py-2.5 line-through text-slate-400">{row.privateBrand}</td>
                  <td className="py-2.5 font-extrabold text-right text-emerald-600">
                    <span className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      -{row.savings}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500">
          <span>* Jan Aushadhi stores supply 1,900+ generic drugs tested by NABL laboratories.</span>
          <a
            href="https://janaushadhi.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-700 hover:text-teal-900 font-bold underline inline-flex items-center gap-1"
          >
            <span>Locate Nearest Jan Aushadhi Kendra</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Tele-Neurology & 2G SMS Action Handoffs */}
      <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={() => setShowESanjeevani(true)}
          className="touch-target flex-1 py-3 px-4 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
        >
          <FileText className="w-4 h-4 text-teal-700" />
          <span>📄 Generate e-Sanjeevani Case Referral Slip</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSmsModal(true)}
          className="touch-target flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>📲 Generate 2G SMS Triage Packet</span>
        </button>
      </div>

      {/* Modals */}
      <ESanjeevaniModal
        isOpen={showESanjeevani}
        onClose={() => setShowESanjeevani(false)}
        patient={patient}
      />
      <SmsPacketModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        patient={patient}
        sessionData={sessionData}
      />
    </div>
  );
}
