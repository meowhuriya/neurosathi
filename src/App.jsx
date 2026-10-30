import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import translations from './i18n/translations.json';
import { SAMPLE_PATIENTS } from './data/sampleData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Layout } from './components/Layout';

// Screen components
import { RoleSelection } from './pages/RoleSelection';
import { Home } from './pages/Home';
import { MotorAssessment } from './pages/MotorAssessment';
import { ProcessingSpeed } from './pages/ProcessingSpeed';
import { SpeechAssessment } from './pages/SpeechAssessment';
import { SymptomQuestions } from './pages/SymptomQuestions';
import { Results } from './pages/Results';
import { DoctorSummary } from './pages/DoctorSummary';
import { DoctorView } from './pages/DoctorView';
import { PatientResult } from './pages/PatientResult';
import { FindCare } from './pages/FindCare';
import { FollowUp } from './pages/FollowUp';
import { HealthWorkerDashboard } from './pages/HealthWorkerDashboard';
import { About } from './pages/About';
import { EmergencyRedFlags } from './pages/EmergencyRedFlags';
import { SeizureDiary } from './pages/SeizureDiary';
import { ClinicalScales } from './pages/ClinicalScales';
import { CaregiverGuide } from './pages/CaregiverGuide';
import { MedicineAdherence } from './pages/MedicineAdherence';
import { VitalsLog } from './pages/VitalsLog';

export function App() {
  const [patients, setPatients] = useLocalStorage('neurosathi_patients', SAMPLE_PATIENTS);
  const [activePatientId, setActivePatientId] = useLocalStorage('neurosathi_active_patient_id', 'NS-001');
  const [currentLang, setCurrentLang] = useLocalStorage('neurosathi_lang', 'en');
  const [role, setRole] = useLocalStorage('neurosathi_role', 'patient');
  const [threshold, setThreshold] = useLocalStorage('neurosathi_clinical_threshold', 0.20);

  // Active temporary session assessment buffer
  const [currentSessionAssessment, setCurrentSessionAssessment] = useState({
    motor: null,
    processing: null,
    speech: null,
    symptoms: null
  });

  // Current translation strings with fallback
  const t = translations[currentLang] || translations.en;

  // Ensure newly added sample patients (like NS-009) are available even if localStorage had an older snapshot
  useEffect(() => {
    setPatients(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const missing = SAMPLE_PATIENTS.filter(p => !existingIds.has(p.id));
      if (missing.length > 0) {
        return [...prev, ...missing];
      }
      return prev;
    });
  }, []);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  // Callback to append completed session to patient assessments
  const handleSaveMotor = (motorData) => {
    setCurrentSessionAssessment(prev => ({ ...prev, motor: motorData }));
  };

  const handleSaveProcessing = (procData) => {
    const finalSession = {
      motor: currentSessionAssessment.motor || { leftTaps: 42, rightTaps: 44, lrDiff: 2 },
      processing: procData,
      speech: { recorded: true, durationSec: 7.2 },
      symptoms: { fatigue: 3, balance: 3, vision: 3, mood: 3 },
      date: new Date().toISOString().split('T')[0]
    };

    setPatients(prevPatients => {
      return prevPatients.map(p => {
        if (p.id === activePatientId) {
          return {
            ...p,
            assessments: [...p.assessments, finalSession]
          };
        }
        return p;
      });
    });

    setCurrentSessionAssessment({
      motor: null,
      processing: null,
      speech: null,
      symptoms: null
    });
  };

  const handleSaveSpeech = (speechData) => {
    setCurrentSessionAssessment(prev => ({ ...prev, speech: speechData }));
  };

  const handleSaveSymptoms = (symptomData) => {
    const finalSession = {
      ...currentSessionAssessment,
      symptoms: symptomData,
      date: new Date().toISOString().split('T')[0]
    };

    // If motor/processing weren't completed in this session, provide baseline values
    if (!finalSession.motor) {
      finalSession.motor = { leftTaps: 42, rightTaps: 44, lrDiff: 2 };
    }
    if (!finalSession.processing) {
      finalSession.processing = { correct: 22, avgReactionMs: 1150 };
    }
    if (!finalSession.speech) {
      finalSession.speech = { recorded: true, durationSec: 7.2 };
    }

    setPatients(prevPatients => {
      return prevPatients.map(p => {
        if (p.id === activePatientId) {
          return {
            ...p,
            assessments: [...p.assessments, finalSession]
          };
        }
        return p;
      });
    });

    // Reset buffer
    setCurrentSessionAssessment({
      motor: null,
      processing: null,
      speech: null,
      symptoms: null
    });
  };

  const handleUpdateFollowUp = (followUpData) => {
    setPatients(prevPatients => {
      return prevPatients.map(p => {
        if (p.id === activePatientId) {
          return {
            ...p,
            followUp: {
              ...p.followUp,
              ...followUpData
            }
          };
        }
        return p;
      });
    });
  };

  const handleUpdatePatient = (patientId, updates) => {
    setPatients(prevPatients => {
      return prevPatients.map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            ...updates
          };
        }
        return p;
      });
    });
  };

  const handleSaveScales = (newScaleRecord) => {
    setPatients(prevPatients => {
      return prevPatients.map(p => {
        if (p.id === activePatientId) {
          const currentScales = p.clinicalScales || [];
          return {
            ...p,
            clinicalScales: [...currentScales, newScaleRecord]
          };
        }
        return p;
      });
    });
  };

  const handleSaveVitals = (newVitalRecord) => {
    setPatients(prevPatients => {
      return prevPatients.map(p => {
        if (p.id === activePatientId) {
          const currentVitals = p.vitals || [];
          return {
            ...p,
            vitals: [...currentVitals, newVitalRecord]
          };
        }
        return p;
      });
    });
  };

  const handleResetData = () => {
    setPatients(SAMPLE_PATIENTS);
    setActivePatientId('NS-001');
    localStorage.removeItem('neurosathi_patients');
    localStorage.removeItem('neurosathi_active_patient_id');
  };

  return (
    <HashRouter>
      <Layout
        t={t}
        currentLang={currentLang}
        setLanguage={setCurrentLang}
        patients={patients}
        activePatientId={activePatientId}
        setActivePatientId={setActivePatientId}
        role={role}
        setRole={setRole}
        onResetData={handleResetData}
      >
        <Routes>
          {/* 1. First Screen: "Who are you?" Role Selection */}
          <Route
            path="/"
            element={
              <RoleSelection
                t={t}
                setRole={setRole}
                currentLang={currentLang}
                setLanguage={setCurrentLang}
              />
            }
          />
          <Route
            path="/roles"
            element={
              <RoleSelection
                t={t}
                setRole={setRole}
                currentLang={currentLang}
                setLanguage={setCurrentLang}
              />
            }
          />

          {/* 2. Patient / Family Role Views */}
          <Route
            path="/patient"
            element={<Navigate to="/patient/check" replace />}
          />
          <Route
            path="/patient/check"
            element={
              <MotorAssessment
                t={t}
                currentLang={currentLang}
                activePatient={activePatient}
                onSaveMotor={handleSaveMotor}
                role="patient"
              />
            }
          />
          <Route
            path="/patient/result"
            element={
              <PatientResult
                currentLang={currentLang}
                activePatient={activePatient}
                threshold={threshold}
              />
            }
          />

          {/* 3. Health Worker Role Views (Existing 1 Check -> 2 Flag -> 3 Connect Flow) */}
          <Route
            path="/home"
            element={
              <Home
                t={t}
                currentLang={currentLang}
                setLanguage={setCurrentLang}
                activePatient={activePatient}
                patients={patients}
                setActivePatientId={setActivePatientId}
                setPatients={setPatients}
              />
            }
          />
          <Route
            path="/motor"
            element={
              <MotorAssessment
                t={t}
                currentLang={currentLang}
                activePatient={activePatient}
                onSaveMotor={handleSaveMotor}
                role="health-worker"
              />
            }
          />
          <Route
            path="/processing"
            element={
              <ProcessingSpeed
                t={t}
                currentLang={currentLang}
                activePatient={activePatient}
                onSaveProcessing={handleSaveProcessing}
              />
            }
          />
          <Route
            path="/results"
            element={
              <Results
                t={t}
                currentLang={currentLang}
                activePatient={activePatient}
                threshold={threshold}
                setThreshold={setThreshold}
              />
            }
          />
          <Route
            path="/connect"
            element={
              <FindCare
                t={t}
                activePatient={activePatient}
                onUpdateFollowUp={handleUpdateFollowUp}
              />
            }
          />

          {/* 4. Doctor Role View (Clean Read-Only Page) */}
          <Route
            path="/doctor"
            element={
              <DoctorView
                t={t}
                currentLang={currentLang}
                activePatient={activePatient}
                patients={patients}
                setActivePatientId={setActivePatientId}
                threshold={threshold}
              />
            }
          />
          <Route
            path="/doctor-summary"
            element={
              <DoctorView
                t={t}
                currentLang={currentLang}
                activePatient={activePatient}
                patients={patients}
                setActivePatientId={setActivePatientId}
                threshold={threshold}
              />
            }
          />
          <Route
            path="/followup"
            element={
              <FollowUp
                t={t}
                activePatient={activePatient}
                onUpdateFollowUp={handleUpdateFollowUp}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <HealthWorkerDashboard
                t={t}
                patients={patients}
                activePatientId={activePatientId}
                setActivePatientId={setActivePatientId}
                threshold={threshold}
                onUpdateFollowUp={handleUpdateFollowUp}
              />
            }
          />
          <Route
            path="/about"
            element={<About t={t} />}
          />
          <Route
            path="/emergency"
            element={<EmergencyRedFlags t={t} />}
          />
          <Route
            path="/seizure-diary"
            element={
              <SeizureDiary
                t={t}
                activePatient={activePatient}
                onUpdatePatient={handleUpdatePatient}
              />
            }
          />
          <Route
            path="/clinical-scales"
            element={
              <ClinicalScales
                t={t}
                activePatient={activePatient}
                onSaveScales={handleSaveScales}
              />
            }
          />
          <Route
            path="/caregiver-guide"
            element={
              <CaregiverGuide
                t={t}
                activePatient={activePatient}
              />
            }
          />
          <Route
            path="/medicine-tracker"
            element={
              <MedicineAdherence
                t={t}
                activePatient={activePatient}
                onUpdatePatient={handleUpdatePatient}
              />
            }
          />
          <Route
            path="/vitals"
            element={
              <VitalsLog
                t={t}
                activePatient={activePatient}
                onSaveVitals={handleSaveVitals}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
export default App;
