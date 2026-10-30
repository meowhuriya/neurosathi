import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Brain,
  Home,
  LineChart,
  Pill,
  HeartPulse,
  Award,
  BookOpen,
  HeartHandshake,
  Calendar,
  Users,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  FileText,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  RefreshCw,
  X
} from 'lucide-react';

export function Sidebar({
  t,
  role,
  setRole,
  activePatient,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onRunDemo
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isEpilepsy = activePatient?.condition === 'Epilepsy';
  const isDoctor = role === 'doctor';

  const handleLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const handleSwitchRole = () => {
    const nextRole = isDoctor ? 'patient' : 'doctor';
    setRole(nextRole);
    if (nextRole === 'patient') {
      navigate('/home');
    } else {
      navigate('/dashboard');
    }
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const navItemClass = ({ isActive }) =>
    `touch-target flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-teal-50 text-teal-800 font-bold border-l-4 border-teal-600 shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    } ${isCollapsed ? 'justify-center px-2' : ''}`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}
      >
        {/* Top Header: Logo + Collapse Button */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-3 shrink-0">
          <div
            onClick={() => {
              navigate(isDoctor ? '/dashboard' : '/home');
              if (isMobileOpen) setIsMobileOpen(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-extrabold text-base text-teal-800 tracking-tight block leading-tight">
                  NeuroSathi
                </span>
                <span className="text-[10px] text-slate-400 font-medium block leading-none">
                  Brain Health Companion
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 items-center justify-center transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Nav Items - Strictly separated by Role */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {isDoctor ? (
            /* =================================================== */
            /* DOCTOR & ASHA WORKER CLINICAL PORTAL                */
            /* Pure Clinical Triage & Case Summary — ZERO checks/games */
            /* =================================================== */
            <div className="space-y-1">
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-extrabold text-teal-800 tracking-wider uppercase block">
                  {t?.roles?.clinicalDashboard || "Clinician Workspace"}
                </span>
              )}
              
              {/* 1. Patient Registry & Triage */}
              <NavLink
                to="/dashboard"
                onClick={handleLinkClick}
                className={navItemClass}
                title="Patient Registry & Triage"
              >
                <Stethoscope className="w-4 h-4 shrink-0 text-teal-600" />
                {!isCollapsed && <span>{t?.nav?.patientRegistry || "Patient Registry & Triage"}</span>}
              </NavLink>

              {/* 2. 60-Second Clinical Case Summary */}
              <NavLink
                to="/doctor-summary"
                onClick={handleLinkClick}
                className={navItemClass}
                title="60-Second Clinical Case Summary"
              >
                <FileText className="w-4 h-4 shrink-0 text-blue-600" />
                {!isCollapsed && <span>{t?.nav?.doctorSummary || "60-Sec Clinical Summary"}</span>}
              </NavLink>
            </div>
          ) : (
            /* =================================================== */
            /* PATIENT & RURAL FAMILY PORTAL                       */
            /* =================================================== */
            <>
              {/* SECTION: DAILY HEALTH & CARE */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <span className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    {t?.roles?.patientTools || "Daily Health & Care"}
                  </span>
                )}

                {/* 1. Today's Care */}
                <NavLink to="/home" onClick={handleLinkClick} className={navItemClass} title="Today's Care">
                  <Home className="w-4 h-4 shrink-0 text-teal-600" />
                  {!isCollapsed && <span>{t?.nav?.home || "Today's Care"}</span>}
                </NavLink>

                {/* 2. Daily Ability Check */}
                <NavLink to="/motor" onClick={handleLinkClick} className={navItemClass} title="Daily Ability Check">
                  <Brain className="w-4 h-4 shrink-0 text-teal-600" />
                  {!isCollapsed && <span>{t?.nav?.assess || "Daily Ability Check"}</span>}
                </NavLink>

                {/* 3. Doctor Visit Slip (OPD Parchi) */}
                <NavLink to="/results" onClick={handleLinkClick} className={navItemClass} title="Doctor Visit Slip">
                  <LineChart className="w-4 h-4 shrink-0 text-teal-600" />
                  {!isCollapsed && <span>{t?.nav?.results || "Doctor Visit Slip"}</span>}
                </NavLink>

                {/* 4. Medicine Tracker */}
                <NavLink to="/medicine-tracker" onClick={handleLinkClick} className={navItemClass} title="Medicine Tracker">
                  <Pill className="w-4 h-4 shrink-0 text-blue-600" />
                  {!isCollapsed && <span>{t?.nav?.medicine || "Medicine Tracker"}</span>}
                </NavLink>

                {/* 5. Seizure Diary (Conditional for Epilepsy) */}
                {isEpilepsy && (
                  <NavLink to="/seizure-diary" onClick={handleLinkClick} className={navItemClass} title="Seizure Diary">
                    <BookOpen className="w-4 h-4 shrink-0 text-purple-600" />
                    {!isCollapsed && <span>{t?.nav?.seizures || "Seizure Diary"}</span>}
                  </NavLink>
                )}

                {/* 6. My Vitals */}
                <NavLink to="/vitals" onClick={handleLinkClick} className={navItemClass} title="My Vitals">
                  <HeartPulse className="w-4 h-4 shrink-0 text-rose-600" />
                  {!isCollapsed && <span>{t?.nav?.vitals || "My Vitals"}</span>}
                </NavLink>
              </div>

              {/* SECTION: SUPPORT & SERVICES */}
              <div className="space-y-1">
                {!isCollapsed && (
                  <span className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    {t?.roles?.careSupport || "Support & Services"}
                  </span>
                )}

                {/* 7. Affordable Care & Jan Aushadhi */}
                <NavLink to="/connect" onClick={handleLinkClick} className={navItemClass} title="Affordable Care & Jan Aushadhi">
                  <HeartHandshake className="w-4 h-4 shrink-0 text-teal-600" />
                  {!isCollapsed && <span>{t?.nav?.connect || "Jan Aushadhi & Schemes"}</span>}
                </NavLink>

                {/* 8. Caregiver Guide */}
                <NavLink to="/caregiver-guide" onClick={handleLinkClick} className={navItemClass} title="Caregiver Guide">
                  <Users className="w-4 h-4 shrink-0 text-teal-600" />
                  {!isCollapsed && <span>{t?.nav?.caregiver || "Caregiver Guide"}</span>}
                </NavLink>

                {/* 9. About & Safety */}
                <NavLink to="/about" onClick={handleLinkClick} className={navItemClass} title="About & Safety">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-slate-500" />
                  {!isCollapsed && <span>{t?.nav?.about || "About & Safety"}</span>}
                </NavLink>
              </div>

              {/* SECTION: EMERGENCY SOS */}
              <div className="pt-1">
                <NavLink
                  to="/emergency"
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `touch-target flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-red-50/80 hover:bg-red-100/90 text-red-700 border border-red-200/60 ${
                      isActive ? 'ring-2 ring-red-400' : ''
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                  }
                  title="Emergency SOS"
                >
                  <div className="relative shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600" />
                  </div>
                  {!isCollapsed && (
                    <span className="text-red-700 font-extrabold">
                      {t?.nav?.emergency || "Emergency SOS (108)"}
                    </span>
                  )}
                </NavLink>
              </div>
            </>
          )}
        </div>

        {/* Bottom Pinned Footer */}
        <div className="p-3 border-t border-slate-200 bg-white space-y-2 shrink-0">
          {/* Demo Tour Trigger */}
          <button
            type="button"
            onClick={() => {
              if (onRunDemo) onRunDemo();
              if (isMobileOpen) setIsMobileOpen(false);
            }}
            className={`touch-target w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-50 transition-colors ${
              isCollapsed ? 'justify-center px-1' : ''
            }`}
            title="Run Guided Demo Tour"
          >
            <PlayCircle className="w-4 h-4 text-teal-600 shrink-0" />
            {!isCollapsed && <span>{t?.roles?.runDemo || "▶ Run Demo Tour"}</span>}
          </button>

          {/* Role Switcher Link */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={handleSwitchRole}
              className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-500 hover:text-teal-700 hover:bg-slate-50 transition-colors block"
            >
              {isDoctor
                ? (t?.roles?.switchToPatient || "Switch to Patient View →")
                : (t?.roles?.switchToDoctor || "Switch to Health Worker View →")}
            </button>
          )}

          {/* Works Offline Badge */}
          <div
            className={`flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-2 py-1 text-[11px] font-semibold ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Works completely offline"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {!isCollapsed && <span>{t?.app?.worksOffline || "Works offline"}</span>}
          </div>

          {/* Version Note */}
          {!isCollapsed && (
            <p className="text-[10px] text-slate-400 text-center font-medium">
              v2.0 • SFIC DTU Challenge
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
