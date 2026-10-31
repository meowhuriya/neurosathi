import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, PlayCircle, AlertTriangle, User, HeartPulse, Stethoscope, Phone } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { DemoOverlay } from './DemoOverlay';

export function Layout({
  children,
  t,
  currentLang,
  setLanguage,
  patients,
  activePatientId,
  setActivePatientId,
  role = 'patient',
  setRole
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(() => {
    try {
      return localStorage.getItem('neurosathi_offline_mode') === 'true';
    } catch {
      return false;
    }
  });
  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  const isRoleSelectionPage = location.pathname === '/' || location.pathname === '/roles';
  const isPatientRole = role === 'patient' || location.pathname.startsWith('/patient');
  const isDoctorRole = role === 'doctor' || location.pathname.startsWith('/doctor');
  const isHealthWorkerRole = !isRoleSelectionPage && !isPatientRole && !isDoctorRole;

  const isStep1Active = location.pathname === '/motor' || location.pathname === '/processing' || location.pathname === '/patient/check';

  const navLinkClass = ({ isActive }) =>
    `touch-target px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
      isActive
        ? 'bg-teal-700 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  // Role title & subtitle for brand logo
  const getRoleHeaderInfo = () => {
    if (isPatientRole) {
      return { title: 'NeuroSathi', badge: 'Patient & Family View', homePath: '/patient/check' };
    }
    if (isDoctorRole) {
      return { title: 'NeuroSathi', badge: 'Doctor Clinical Portal', homePath: '/doctor' };
    }
    return { title: 'NeuroSathi', badge: 'ASHA Guided Flow', homePath: '/home' };
  };

  const roleInfo = getRoleHeaderInfo();

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col font-sans">
      {/* Universal Amber Sample Data Banner - Always Visible at the top */}
      <div 
        className="sample-data-banner bg-amber-50 border-b border-amber-200 text-amber-800 text-xs sm:text-sm font-semibold px-3 py-1.5 text-center flex items-center justify-center gap-1.5 shadow-xs shrink-0 z-40"
        role="alert"
      >
        <span aria-hidden="true">⚕️</span>
        <span>{t?.app?.sampleBanner || "⚕️ SAMPLE DATA — Not for clinical use"}</span>
      </div>

      {/* Offline Village Mode Comforting Banner */}
      {isOfflineMode && (
        <div 
          className="bg-amber-100/95 border-b border-amber-300 text-amber-950 text-xs sm:text-sm font-semibold px-3 py-2 text-center flex items-center justify-center gap-2 shadow-xs shrink-0 z-40 animate-fadeIn"
          role="status"
        >
          <span className="text-base" aria-hidden="true">📴</span>
          <span>
            <strong>Offline Village Mode Active:</strong> All checks, voice notes, and vitals are saved locally on this device and will auto-sync at the PHC.
          </span>
          <button
            type="button"
            onClick={() => {
              setIsOfflineMode(false);
              localStorage.setItem('neurosathi_offline_mode', 'false');
            }}
            className="touch-target text-[11px] font-bold underline ml-1 text-amber-900 hover:text-black cursor-pointer"
          >
            Switch to Online
          </button>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="app-header bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
            {/* Brand Logo & Wordmark */}
            <Link to={roleInfo.homePath} className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                {isPatientRole ? (
                  <User className="w-5 h-5" />
                ) : isDoctorRole ? (
                  <Stethoscope className="w-5 h-5" />
                ) : (
                  <Brain className="w-5 h-5" />
                )}
              </div>
              <div className="hidden xs:block text-left">
                <span className="font-extrabold text-base text-teal-800 tracking-tight block leading-tight">
                  {roleInfo.title}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block leading-none">
                  {roleInfo.badge}
                </span>
              </div>
            </Link>

            {/* Central Navigation Links based on Role */}
            {!isRoleSelectionPage && (
              <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
                {isPatientRole ? (
                  /* PATIENT / FAMILY NAVIGATION: simple, minimal text */
                  <>
                    <NavLink to="/patient/check" className={navLinkClass}>
                      <span>Check</span>
                    </NavLink>
                    <NavLink to="/patient/result" className={navLinkClass}>
                      <span>My Result</span>
                    </NavLink>
                  </>
                ) : isDoctorRole ? (
                  /* DOCTOR NAVIGATION: clean read-only summary */
                  <>
                    <NavLink to="/doctor" className={navLinkClass}>
                      <span>Summary &amp; Trends</span>
                    </NavLink>
                    <NavLink to="/about" className={navLinkClass}>
                      <span>About &amp; Safety</span>
                    </NavLink>
                  </>
                ) : (
                  /* HEALTH WORKER (ASHA) NAVIGATION: 1 Check -> 2 Flag -> 3 Connect */
                  <>
                    <NavLink to="/home" className={navLinkClass}>
                      <span>Patients</span>
                    </NavLink>
                    <NavLink
                      to="/motor"
                      className={({ isActive }) =>
                        `touch-target px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          isActive || isStep1Active
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={(isActive || isStep1Active) ? "text-white font-extrabold" : "text-teal-600 font-extrabold"}>1</span>
                          <span>Check</span>
                        </>
                      )}
                    </NavLink>
                    <NavLink to="/results" className={navLinkClass}>
                      {({ isActive }) => (
                        <>
                          <span className={isActive ? "text-white font-extrabold" : "text-amber-600 font-extrabold"}>2</span>
                          <span>Flag</span>
                        </>
                      )}
                    </NavLink>
                    <NavLink to="/connect" className={navLinkClass}>
                      {({ isActive }) => (
                        <>
                          <span className={isActive ? "text-white font-extrabold" : "text-blue-600 font-extrabold"}>3</span>
                          <span>Connect</span>
                        </>
                      )}
                    </NavLink>
                    <NavLink to="/about" className={navLinkClass}>
                      <span className="hidden sm:inline">About &amp; Safety</span>
                      <span className="sm:hidden">About</span>
                    </NavLink>
                  </>
                )}
              </nav>
            )}

            {/* Right Actions: Small "Switch role" link, Demo Tour, Language Selector, SOS 108 */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Small "Switch role" link in top bar of EVERY view */}
              {!isRoleSelectionPage && (
                <Link
                  to="/roles"
                  className="touch-target px-2.5 py-1.5 rounded-lg text-xs font-bold text-teal-700 hover:text-teal-900 hover:bg-teal-50 border border-teal-200 transition-colors"
                  title="Switch between Patient, Health Worker, and Doctor views"
                >
                  <span>Switch role</span>
                </Link>
              )}

              {/* Demo Tour Button (Health worker & Doctor views) */}
              {!isPatientRole && !isRoleSelectionPage && (
                <button
                  type="button"
                  onClick={() => setIsDemoActive(true)}
                  className="touch-target hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors border border-teal-200 cursor-pointer"
                  title="Run Guided Demo Tour across all three roles"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Demo Tour</span>
                </button>
              )}

              {/* Network Status Toggle Pill: Online / Village Offline Mode */}
              <button
                type="button"
                onClick={() => {
                  const next = !isOfflineMode;
                  setIsOfflineMode(next);
                  try {
                    localStorage.setItem('neurosathi_offline_mode', String(next));
                  } catch {}
                }}
                className={`touch-target px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  isOfflineMode
                    ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
                title={isOfflineMode ? "Village Offline Mode active. Click to switch to Online." : "Online. Click to simulate Village Offline Mode."}
              >
                <span className={`w-2 h-2 rounded-full ${isOfflineMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="hidden sm:inline">{isOfflineMode ? 'Village Offline Mode' : 'Online'}</span>
                <span className="sm:hidden">{isOfflineMode ? 'Offline' : 'Online'}</span>
              </button>

              {/* Language Selector */}
              <LanguageSelector
                currentLang={currentLang}
                onSelectLang={setLanguage}
                compact={true}
              />

              {/* Emergency 108 Button: Always Visible on Every Screen */}
              <Link
                to="/emergency"
                className="touch-target inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
                title="Emergency Red Flags & 108 Ambulance Call"
                aria-label="Emergency 108 SOS"
              >
                <span>🚨</span>
                <span className="font-extrabold">108</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-6 pb-12">
        {children}
      </main>

      {/* Guided Demo Tour Overlay */}
      {isDemoActive && (
        <DemoOverlay
          t={t}
          activePatient={activePatient}
          setActivePatientId={setActivePatientId}
          setRole={setRole}
          setLanguage={setLanguage}
          onClose={() => setIsDemoActive(false)}
        />
      )}
    </div>
  );
}
