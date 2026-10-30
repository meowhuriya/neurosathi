import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Brain, X, ArrowRight, Play, RotateCcw } from 'lucide-react';

export function DemoOverlay({ t, activePatient, setActivePatientId, setRole, setLanguage, onClose }) {
  const [isRunning, setIsRunning] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const navigate = useNavigate();

  // Walk through: Family check -> Health worker flag and care plan -> Doctor summary for Lakshmi
  const steps = [
    {
      step: 1,
      title: "1. Family Check: Lakshmi's Home Check (MS, 48y)",
      desc: "Patient/family view: simple check for Lakshmi's condition, voice note, and plain result ('Please see a doctor soon.') without confusing charts.",
      action: () => {
        setActivePatientId('NS-001'); // Lakshmi
        if (setRole) setRole('patient');
        try { localStorage.setItem('neurosathi_role', 'patient'); } catch (e) {}
        navigate('/patient/check');
      }
    },
    {
      step: 2,
      title: "2. Health Worker: Flag & Care Plan for Lakshmi",
      desc: "ASHA worker reviews flagged decline (>20% drop), 8-week trend chart, and opens Lakshmi's longitudinal care plan and triage queue.",
      action: () => {
        setActivePatientId('NS-001');
        if (setRole) setRole('health-worker');
        try { localStorage.setItem('neurosathi_role', 'health-worker'); } catch (e) {}
        navigate('/results');
      }
    },
    {
      step: 3,
      title: "3. Doctor View: Clinical Review for Lakshmi",
      desc: "Doctor reviews clean read-only summary: 8-week chart, flagged measures, suggested review action, and plays patient's recorded voice note.",
      action: () => {
        setActivePatientId('NS-001');
        if (setRole) setRole('doctor');
        try { localStorage.setItem('neurosathi_role', 'doctor'); } catch (e) {}
        navigate('/doctor');
      }
    }
  ];

  const totalSteps = steps.length;

  useEffect(() => {
    // Run initial action
    steps[0].action();
  }, []);

  const runStep = (stepNumber) => {
    if (stepNumber > totalSteps) {
      setIsRunning(false);
      setShowCompleteModal(true);
      return;
    }
    setCurrentStep(stepNumber);
    steps[stepNumber - 1].action();
  };

  const handleNext = () => {
    runStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      runStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setShowCompleteModal(false);
    setIsRunning(true);
    runStep(1);
  };

  return (
    <>
      {/* Floating Demo Controller Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 p-3 sm:p-4 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div className="truncate text-left">
              <span className="text-xs sm:text-sm font-bold block truncate">
                {steps[currentStep - 1]?.title}
              </span>
              <span className="text-[11px] text-slate-300 block truncate">
                {steps[currentStep - 1]?.desc}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Back
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
              >
                <span>Done</span>
                <CheckCircle className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              aria-label="Close demo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5 mt-2">
          {steps.map((s) => (
            <div
              key={s.step}
              className={`h-1.5 rounded-full transition-all ${
                s.step === currentStep
                  ? 'w-6 bg-teal-400'
                  : s.step < currentStep
                  ? 'w-2 bg-teal-600'
                  : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Role-Based Demo Complete
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You navigated through the three roles: Family Check &rarr; Health Worker Flag &amp; Care Plan &rarr; Doctor Summary.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="touch-target flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCompleteModal(false);
                  onClose();
                }}
                className="touch-target flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
              >
                Exit Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
