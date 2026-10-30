import React from 'react';
import { Shield, Lock, AlertTriangle, Compass, Award, Users, HeartHandshake, CheckCircle2 } from 'lucide-react';

export function About({ t }) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.about.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500">Seva First Innovation Challenge (SFIC) DTU Submission</p>
        </div>
      </div>

      {/* 1. About NeuroSathi Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-600" />
          <span>{t.about.aboutHeading}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {t.about.p1}
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {t.about.p2}
        </p>
        <ul className="text-xs sm:text-sm text-slate-700 space-y-2 pt-1">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>A monitoring and care-linkage tool — not a diagnostic device.</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Uses clinically inspired assessments guided by an MBBS doctor on our team.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>All data stays on your device in this prototype (no server, no cloud).</span>
          </li>
        </ul>
      </div>

      {/* 2. Privacy & Data Protection */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-teal-600" />
          <span>{t.about.privacyHeading}</span>
        </h2>
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs sm:text-sm text-emerald-950 space-y-2">
          <p className="font-semibold">🔒 Your data never leaves this device. No account required.</p>
          <p className="text-slate-600 leading-relaxed">
            All assessment timestamps, motor tap rates, reaction times, and reminder schedules are stored strictly in your browser's local sandbox (localStorage).
          </p>
          <p className="text-slate-600 leading-relaxed">
            Designed to keep data on the device in this prototype.
          </p>
        </div>
      </div>

      {/* 3. Known Limitations Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>{t.about.limitationsHeading}</span>
        </h2>
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 space-y-2.5">
          <p className="text-amber-900 font-bold">Transparent Scientific & Engineering Disclosures:</p>
          <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
            <li>Assessments are clinically inspired but not yet validated in a clinical trial.</li>
            <li>Clinical scales are simplified self-report adaptations — formal scoring requires neurological examination.</li>
            <li>PHQ-2 is a screening tool, not a standalone mental health assessment.</li>
            <li>Vitals readings should be confirmed with calibrated medical equipment.</li>
            <li>Nutrition advice requires consultation with a registered clinical dietitian.</li>
            <li>Speech analysis is not implemented — only duration is recorded in this prototype.</li>
            <li>Government scheme integration is simulated with verified official portal links — live API integration is a future pilot step.</li>
            <li>Hospital list is sample data — real hospital directory integration planned for PHC deployment.</li>
            <li>Decline detection threshold is a configurable starting point (default 20%), not a validated cutoff.</li>
          </ul>
        </div>
      </div>

      {/* 4. Impact & Scalability Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-teal-600" />
          <span>{t.about.impactHeading}</span>
        </h2>
        <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900 block">Target & Beneficiaries</span>
            <p className="mt-0.5">Rural and semi-urban patients with limited access to neurologists; family caregivers, ASHA/CHW grassroots workers, and Primary Health Centre (PHC) medical officers across India.</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900 block">Cost to Patient: ₹0</span>
            <p className="mt-0.5">Runs on budget Android phones (360px+ viewport) via standard web browsers. Works offline after initial load with no paid APIs, subscription barriers, or device upgrades.</p>
          </div>
          <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl">
            <span className="font-bold text-teal-900 block">Differentiator vs Commercial Apps</span>
            <p className="text-slate-700 mt-0.5">Unlike urban paid telemedicine apps, NeuroSathi is 100% free, offline-capable, multi-lingual in Indian languages (English, Hindi, Telugu, Urdu), and purpose-built for community health worker surveillance and public health pathways.</p>
          </div>
        </div>
      </div>

      {/* 5. Roadmap Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Compass className="w-5 h-5 text-teal-600" />
          <span>{t.about.roadmapHeading}</span>
        </h2>
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
            <span className="font-bold text-teal-900 block">Phase 1 (Current): TRL 3 Working Prototype</span>
            <p className="text-slate-600">{t.about.phase1}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block">Phase 2 (75 Days): Community PHC Pilot & Neurologist Scale Validation</span>
            <p className="text-slate-600">Pilot with 50 patients across 2 PHCs in Telangana & Delhi, validate simplified scales against formal EDSS/mRS with practicing neurologists, connect hospital directories.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block">Phase 3 (6 Months): Clinical Validation</span>
            <p className="text-slate-600">{t.about.phase3}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-800 block">Phase 4 (1 Year): NHM Integration</span>
            <p className="text-slate-600">{t.about.phase4}</p>
          </div>
        </div>
      </div>

      {/* 6. Team Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600" />
          <span>{t.about.teamHeading}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900 block">DTU SFIC Innovation Team</span>
            <span className="text-slate-500">Engineering & Product Development</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900 block">MBBS Medical Advisor</span>
            <span className="text-slate-500">Clinical Guidance & Neurological Surveillance Design</span>
          </div>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 text-center shadow-md space-y-1">
        <p className="text-sm font-bold tracking-wide">
          {t.about.viksitBharat}
        </p>
        <p className="text-[11px] text-slate-400">
          Seva First Innovation Challenge • Delhi Technological University (DTU)
        </p>
      </div>
    </div>
  );
}
