import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, User, HeartPulse, Stethoscope, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';

export function RoleSelection({ t, setRole, currentLang, setLanguage }) {
  const navigate = useNavigate();

  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
    try {
      localStorage.setItem('neurosathi_role', selectedRole);
    } catch (e) {}

    if (selectedRole === 'patient') {
      navigate('/patient/check');
    } else if (selectedRole === 'doctor') {
      navigate('/doctor');
    } else {
      // health-worker
      navigate('/home');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-3">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 text-center space-y-6">
        {/* Brand Logo & Wordmark */}
        <div className="space-y-3">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Brain className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <div>
            <span className="text-xs font-bold text-teal-700 tracking-wider uppercase block">
              NeuroSathi Platform
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Who are you?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Select your role to open your tailored portal.
            </p>
          </div>
        </div>

        {/* Prototype Demo Note */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold">
            Role switching is a prototype demo. A real version needs login and consent.
          </span>
        </div>

        {/* THREE LARGE ROLE BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
          {/* Button 1: Patient or family */}
          <button
            type="button"
            onClick={() => handleSelectRole('patient')}
            className="touch-target group relative p-5 bg-white hover:bg-teal-50/50 rounded-2xl border-2 border-slate-200 hover:border-teal-600 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[200px] text-left cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <span className="font-bold text-base sm:text-lg text-slate-900 block group-hover:text-teal-900 leading-snug">
                Patient or family
              </span>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Simple home check for your condition, voice note, and doctor card. Minimal text, large buttons.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal-700">
              <span>Start Home View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Button 2: Health worker (ASHA / nurse) */}
          <button
            type="button"
            onClick={() => handleSelectRole('health-worker')}
            className="touch-target group relative p-5 bg-white hover:bg-teal-50/50 rounded-2xl border-2 border-slate-200 hover:border-teal-600 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[200px] text-left cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="font-bold text-base sm:text-lg text-slate-900 block group-hover:text-teal-900 leading-snug">
                Health worker (ASHA / nurse)
              </span>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                ASHA guided flow: Patient registry, 1 Check, 2 Flag with trend chart, and 3 Connect to doctor.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal-700">
              <span>Open ASHA View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Button 3: Doctor */}
          <button
            type="button"
            onClick={() => handleSelectRole('doctor')}
            className="touch-target group relative p-5 bg-white hover:bg-slate-50 rounded-2xl border-2 border-slate-200 hover:border-slate-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[200px] text-left cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="font-bold text-base sm:text-lg text-slate-900 block group-hover:text-slate-900 leading-snug">
                Doctor
              </span>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Clean read-only summary: 8-week trend chart, flagged measures, voice note, and suggested review action.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span>Open Doctor View</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Language selector & About Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">Language:</span>
            <LanguageSelector currentLang={currentLang} onSelectLang={setLanguage} compact={true} />
          </div>

          <Link
            to="/about"
            className="hover:text-teal-700 underline font-medium flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>About NeuroSathi &amp; Safety</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
