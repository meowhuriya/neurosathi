import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hand,
  Brain,
  Activity,
  Zap,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2
} from 'lucide-react';
import { ListenButton } from '../components/ListenButton';
import { PatientNoteCard } from '../components/PatientNoteCard';
import { saveReadings } from '../utils/readingsStorage';

// CLINICAL NOTE: Finger tapping speed correlates with motor function. Asymmetry >20% may indicate lateralized deficit. Threshold configurable.

const ALTERNATIVE_QUESTIONS = [
  { key: 'q1', text: "New or worsening weakness, drowsiness, or confusion", isUrgent: true },
  { key: 'q2', text: "Trouble swallowing or choking", isUrgent: true },
  { key: 'q3', text: "Fever or chest infection signs", isUrgent: true },
  { key: 'q4', text: "Seizure since last visit", isUrgent: true },
  { key: 'q5', text: "Pressure sores, not eating or drinking, or missed medicines", isUrgent: false },
  { key: 'q6', text: "Caregiver struggling to cope", isUrgent: false }
];

const SYMBOLS_MAP = [
  { symbol: '★', number: 1, label: 'Star' },
  { symbol: '●', number: 2, label: 'Circle' },
  { symbol: '▲', number: 3, label: 'Triangle' },
  { symbol: '■', number: 4, label: 'Square' }
];

export function MotorAssessment({ t, currentLang = 'en', activePatient, onSaveMotor, role = 'health-worker' }) {
  const navigate = useNavigate();
  const patient = activePatient || { firstName: 'Lakshmi', condition: 'MS', id: 'NS-001' };
  const condition = patient.condition || 'MS';
  const todayStr = new Date().toISOString().split('T')[0];
  const isPatientView = role === 'patient' || (typeof window !== 'undefined' && localStorage.getItem('neurosathi_role') === 'patient');

  // Examiner: 'asha' | 'patient' | 'caregiver' | 'clinic'
  const [examiner, setExaminer] = useState(() => {
    if (role === 'patient') return 'patient';
    return localStorage.getItem('neurosathi_examiner') || 'asha';
  });
  const [showOperatorPicker, setShowOperatorPicker] = useState(false);
  const [simulatedToast, setSimulatedToast] = useState(false);

  // Toggle: "Patient cannot do the tapping/reaction tests"
  const [cannotDoTests, setCannotDoTests] = useState(() => {
    try {
      const stored = localStorage.getItem('neurosathi_yesno_assessment');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Boolean(parsed?.active);
      }
    } catch (e) {}
    return false;
  });

  // Alternative 6 Yes/No state
  const [yesNoAnswers, setYesNoAnswers] = useState(() => {
    try {
      const stored = localStorage.getItem('neurosathi_yesno_assessment');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.answers) return parsed.answers;
      }
    } catch (e) {}
    return { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null };
  });

  // Condition 1: Stroke state
  // Tapping: Left 10s, Right 10s
  const [strokePhase, setStrokePhase] = useState('idle'); // 'idle' | 'left-tapping' | 'left-done' | 'right-tapping' | 'done'
  const [strokeLeftTaps, setStrokeLeftTaps] = useState(0);
  const [strokeRightTaps, setStrokeRightTaps] = useState(0);
  const [strokeTimeLeft, setStrokeTimeLeft] = useState(10);
  const [strokeQuestions, setStrokeQuestions] = useState({
    eating: null,
    dressing: null,
    walking: null,
    speech: null,
    medicines: null,
    spasticity: null, // Stiff/locked limbs
    neglect: null,    // Ignores one side of body/plate
    bladder: null     // Urinary urgency / leakage / trouble passing
  });
  const [strokeUrgent, setStrokeUrgent] = useState(null); // 'yes' | 'no'
  const [strokeReadings, setStrokeReadings] = useState({
    systolic: '',
    diastolic: '',
    bloodSugar: '',
    bloodSugarContext: 'unknown', // 'fasting' | 'after meal' | 'unknown'
    weight: ''
  });

  // Condition 2: Epilepsy state
  const [epilepsySeizures, setEpilepsySeizures] = useState(null); // '0' | '1' | '2-3' | '4+'
  const [epilepsyMissedDoses, setEpilepsyMissedDoses] = useState(null); // 'none' | '1-2' | 'many'
  const [epilepsyTriggers, setEpilepsyTriggers] = useState(null); // 'poor-sleep' | 'fever' | 'none'
  const [epilepsyInjury, setEpilepsyInjury] = useState(null); // 'yes' | 'no'
  const [epilepsyAuras, setEpilepsyAuras] = useState(null); // 'yes' | 'no' - Focal warning signs
  const [epilepsyWeakness, setEpilepsyWeakness] = useState(null); // 'yes' | 'no' - Lingering post-seizure weakness
  const [epilepsyUrgent, setEpilepsyUrgent] = useState(null); // 'yes' | 'no'

  // Condition 3: Parkinson's state
  const [parkinsonPhase, setParkinsonPhase] = useState('idle'); // 'idle' | 'tapping' | 'done'
  const [parkinsonTimeLeft, setParkinsonTimeLeft] = useState(10);
  const [parkinsonTotalTaps, setParkinsonTotalTaps] = useState(0);
  const [parkinsonFirstHalfTaps, setParkinsonFirstHalfTaps] = useState(0);
  const [parkinsonSecondHalfTaps, setParkinsonSecondHalfTaps] = useState(0);
  const [parkinsonQuestions, setParkinsonQuestions] = useState({
    moreTremorStiffnessFalls: null,
    medicinesOnTime: null
  });

  // Condition 4: MS state
  const [msTappingPhase, setMsTappingPhase] = useState('idle'); // 'idle' | 'left-tapping' | 'left-done' | 'right-tapping' | 'done'
  const [msLeftTaps, setMsLeftTaps] = useState(0);
  const [msRightTaps, setMsRightTaps] = useState(0);
  const [msTimeLeft, setMsTimeLeft] = useState(10);
  const [msSymbolPhase, setMsSymbolPhase] = useState('idle'); // 'idle' | 'active' | 'done'
  const [msSymbolTimeLeft, setMsSymbolTimeLeft] = useState(30);
  const [msSymbolScore, setMsSymbolScore] = useState(0);
  const [msSymbolCurrentIdx, setMsSymbolCurrentIdx] = useState(0);
  const [msReactionTimes, setMsReactionTimes] = useState([]);
  const msLastPromptTime = useRef(Date.now());
  const [msFatigue, setMsFatigue] = useState(3);
  const [msWalkingWorse, setMsWalkingWorse] = useState(null);
  const [msVisionWorse, setMsVisionWorse] = useState(null);
  const [msOpticPain, setMsOpticPain] = useState(null); // 'yes' | 'no' - Eye movement pain / sudden blur
  const [msBladder, setMsBladder] = useState(null); // 'yes' | 'no' - Bladder urgency / leakage / retention

  // Global assessment timers
  const timerRef = useRef(null);

  // Examiner action text
  const getExaminerActionText = () => {
    const name = patient.firstName || "Lakshmi";
    switch (examiner) {
      case 'clinic':
        return `Clinic nurse or rural doctor checks ${name} at the health center`;
      case 'caregiver':
        return `Family member or caregiver checks ${name} at home`;
      case 'patient':
        return `Patient checks herself at home`;
      case 'asha':
      default:
        return `ASHA worker checks ${name} at her home visit`;
    }
  };

  const handleExaminerChange = (newExaminer) => {
    setExaminer(newExaminer);
    try {
      localStorage.setItem('neurosathi_examiner', newExaminer);
    } catch (e) {}
  };

  const handleToggleCannotDoTests = (checked) => {
    setCannotDoTests(checked);
    if (!checked) {
      try {
        localStorage.removeItem('neurosathi_yesno_assessment');
      } catch (e) {}
    }
  };

  // --- STROKE TIMERS & HANDLERS ---
  useEffect(() => {
    if (strokePhase === 'left-tapping' || strokePhase === 'right-tapping') {
      timerRef.current = setInterval(() => {
        setStrokeTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (strokePhase === 'left-tapping') {
              setStrokePhase('left-done');
            } else {
              setStrokePhase('done');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [strokePhase]);

  const handleStartStrokeLeft = () => {
    setStrokeLeftTaps(0);
    setStrokeTimeLeft(10);
    setStrokePhase('left-tapping');
  };

  const handleStartStrokeRight = () => {
    setStrokeRightTaps(0);
    setStrokeTimeLeft(10);
    setStrokePhase('right-tapping');
  };

  const handleStrokeTap = () => {
    if (strokePhase === 'left-tapping') setStrokeLeftTaps(p => p + 1);
    else if (strokePhase === 'right-tapping') setStrokeRightTaps(p => p + 1);
  };

  // --- PARKINSON'S TIMER & HANDLERS ---
  useEffect(() => {
    if (parkinsonPhase === 'tapping') {
      timerRef.current = setInterval(() => {
        setParkinsonTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setParkinsonPhase('done');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [parkinsonPhase]);

  const handleStartParkinsonTapping = () => {
    setParkinsonTotalTaps(0);
    setParkinsonFirstHalfTaps(0);
    setParkinsonSecondHalfTaps(0);
    setParkinsonTimeLeft(10);
    setParkinsonPhase('tapping');
  };

  const handleParkinsonTap = () => {
    if (parkinsonPhase !== 'tapping') return;
    setParkinsonTotalTaps(p => p + 1);
    // first 5 seconds (timeLeft > 5) vs last 5 seconds (timeLeft <= 5)
    if (parkinsonTimeLeft > 5) {
      setParkinsonFirstHalfTaps(p => p + 1);
    } else {
      setParkinsonSecondHalfTaps(p => p + 1);
    }
  };

  // --- MS TIMERS & HANDLERS ---
  useEffect(() => {
    if (msTappingPhase === 'left-tapping' || msTappingPhase === 'right-tapping') {
      timerRef.current = setInterval(() => {
        setMsTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (msTappingPhase === 'left-tapping') {
              setMsTappingPhase('left-done');
            } else {
              setMsTappingPhase('done');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [msTappingPhase]);

  useEffect(() => {
    if (msSymbolPhase === 'active') {
      timerRef.current = setInterval(() => {
        setMsSymbolTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setMsSymbolPhase('done');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [msSymbolPhase]);

  const handleStartMsLeft = () => {
    setMsLeftTaps(0);
    setMsTimeLeft(10);
    setMsTappingPhase('left-tapping');
  };

  const handleStartMsRight = () => {
    setMsRightTaps(0);
    setMsTimeLeft(10);
    setMsTappingPhase('right-tapping');
  };

  const handleMsTap = () => {
    if (msTappingPhase === 'left-tapping') setMsLeftTaps(p => p + 1);
    else if (msTappingPhase === 'right-tapping') setMsRightTaps(p => p + 1);
  };

  const handleStartMsSymbol = () => {
    setMsSymbolScore(0);
    setMsReactionTimes([]);
    setMsSymbolTimeLeft(30);
    setMsSymbolPhase('active');
    setMsSymbolCurrentIdx(Math.floor(Math.random() * SYMBOLS_MAP.length));
    msLastPromptTime.current = Date.now();
  };

  const handleMsSymbolChoice = (choiceNum) => {
    if (msSymbolPhase !== 'active') return;
    const rt = Date.now() - msLastPromptTime.current;
    setMsReactionTimes(prev => [...prev, rt]);
    if (choiceNum === SYMBOLS_MAP[msSymbolCurrentIdx].number) {
      setMsSymbolScore(p => p + 1);
    }
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * SYMBOLS_MAP.length);
    } while (nextIdx === msSymbolCurrentIdx && SYMBOLS_MAP.length > 1);
    setMsSymbolCurrentIdx(nextIdx);
    msLastPromptTime.current = Date.now();
  };

  // Completion check
  const isStrokeComplete = (
    strokePhase === 'done' &&
    strokeQuestions.eating !== null &&
    strokeQuestions.dressing !== null &&
    strokeQuestions.walking !== null &&
    strokeQuestions.speech !== null &&
    strokeQuestions.medicines !== null &&
    strokeQuestions.spasticity !== null &&
    strokeQuestions.neglect !== null &&
    strokeQuestions.bladder !== null &&
    strokeUrgent !== null
  );

  const isEpilepsyComplete = (
    epilepsySeizures !== null &&
    epilepsyMissedDoses !== null &&
    epilepsyTriggers !== null &&
    epilepsyInjury !== null &&
    epilepsyAuras !== null &&
    epilepsyWeakness !== null &&
    epilepsyUrgent !== null
  );

  const isParkinsonComplete = (
    parkinsonPhase === 'done' &&
    parkinsonQuestions.moreTremorStiffnessFalls !== null &&
    parkinsonQuestions.medicinesOnTime !== null
  );

  const isMsComplete = (
    msTappingPhase === 'done' &&
    msSymbolPhase === 'done' &&
    msWalkingWorse !== null &&
    msVisionWorse !== null &&
    msOpticPain !== null &&
    msBladder !== null
  );

  const isAlternativeComplete = Object.values(yesNoAnswers).every(v => v === 'yes' || v === 'no');

  const isCheckComplete = cannotDoTests
    ? isAlternativeComplete
    : condition === 'Stroke'
    ? isStrokeComplete
    : condition === 'Epilepsy'
    ? isEpilepsyComplete
    : condition === "Parkinson's"
    ? isParkinsonComplete
    : isMsComplete;

  // Hackathon Fast-Track simulation
  const handleSimulateCompletedCheck = () => {
    if (cannotDoTests) {
      setYesNoAnswers({
        q1: 'no',
        q2: 'no',
        q3: 'no',
        q4: 'no',
        q5: 'yes',
        q6: 'no'
      });
    } else if (condition === 'Stroke') {
      setStrokePhase('done');
      setStrokeLeftTaps(34);
      setStrokeRightTaps(26);
      setStrokeQuestions({
        eating: 'yes',
        dressing: 'no',
        walking: 'yes',
        speech: 'yes',
        medicines: 'yes',
        spasticity: 'no',
        neglect: 'no',
        bladder: 'no'
      });
      setStrokeUrgent('no');
      setStrokeReadings({
        systolic: '138',
        diastolic: '88',
        bloodSugar: '130',
        bloodSugarContext: 'fasting',
        weight: '64'
      });
    } else if (condition === 'Epilepsy') {
      setEpilepsySeizures('1');
      setEpilepsyMissedDoses('1-2');
      setEpilepsyTriggers('poor-sleep');
      setEpilepsyInjury('no');
      setEpilepsyAuras('yes');
      setEpilepsyWeakness('no');
      setEpilepsyUrgent('no');
    } else if (condition === "Parkinson's") {
      setParkinsonPhase('done');
      setParkinsonTotalTaps(32);
      setParkinsonFirstHalfTaps(20);
      setParkinsonSecondHalfTaps(12);
      setParkinsonQuestions({
        moreTremorStiffnessFalls: 'yes',
        medicinesOnTime: 'yes'
      });
    } else {
      // MS
      setMsTappingPhase('done');
      setMsLeftTaps(28);
      setMsRightTaps(31);
      setMsSymbolPhase('done');
      setMsSymbolScore(15);
      setMsFatigue(3);
      setMsWalkingWorse('yes');
      setMsVisionWorse('no');
      setMsOpticPain('no');
      setMsBladder('no');
    }
    setSimulatedToast(true);
    setTimeout(() => setSimulatedToast(false), 3000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-teal-400');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-teal-400');
      }, 1600);
    }
  };

  const getChecklistItems = () => {
    if (cannotDoTests) {
      const answeredCount = Object.values(yesNoAnswers).filter(v => v === 'yes' || v === 'no').length;
      return [
        {
          id: 'alt-questions-section',
          label: answeredCount === 6 ? '✓ Observational Questions (6/6)' : `○ Observational Questions (${answeredCount}/6)`,
          isComplete: answeredCount === 6
        }
      ];
    }

    if (condition === 'Stroke') {
      const functionalKeys = ['eating', 'dressing', 'walking', 'speech', 'medicines', 'spasticity', 'neglect', 'bladder'];
      const functionalAnswered = functionalKeys.filter(k => strokeQuestions[k] !== null).length;
      const isMotorComplete = strokePhase === 'done';
      const isFunctionalComplete = functionalAnswered === functionalKeys.length;
      const isUrgentComplete = strokeUrgent !== null;

      return [
        {
          id: 'stroke-tapping-section',
          label: isMotorComplete
            ? '✓ Motor Test (Both Hands)'
            : strokePhase === 'left-done'
            ? '○ Motor Test (Right Pending)'
            : '○ Motor Test (Left & Right)',
          isComplete: isMotorComplete
        },
        {
          id: 'stroke-questions-section',
          label: isFunctionalComplete
            ? '✓ Functional Questions (8/8)'
            : `○ Functional Questions (${functionalAnswered}/8)`,
          isComplete: isFunctionalComplete
        },
        {
          id: 'stroke-urgent-section',
          label: isUrgentComplete
            ? '✓ Urgent Warning Check'
            : '○ Urgent Warning Signs (Pending)',
          isComplete: isUrgentComplete
        }
      ];
    }

    if (condition === 'Epilepsy') {
      const isSeizuresDone = epilepsySeizures !== null;
      const isMedsDone = epilepsyMissedDoses !== null;
      const isTriggersDone = epilepsyTriggers !== null && epilepsyInjury !== null && epilepsyAuras !== null && epilepsyWeakness !== null;
      const isUrgentDone = epilepsyUrgent !== null;

      return [
        {
          id: 'epilepsy-seizures-section',
          label: isSeizuresDone ? '✓ Seizure Frequency' : '○ Seizure Frequency',
          isComplete: isSeizuresDone
        },
        {
          id: 'epilepsy-medicines-section',
          label: isMedsDone ? '✓ Missed Doses' : '○ Missed Doses',
          isComplete: isMedsDone
        },
        {
          id: 'epilepsy-triggers-section',
          label: isTriggersDone ? '✓ Triggers, Injury & Auras' : '○ Triggers, Injury & Auras',
          isComplete: isTriggersDone
        },
        {
          id: 'epilepsy-urgent-section',
          label: isUrgentDone ? '✓ Urgent Check (>5 min)' : '○ Urgent Check (>5 min)',
          isComplete: isUrgentDone
        }
      ];
    }

    if (condition === "Parkinson's") {
      const isTappingDone = parkinsonPhase === 'done';
      const isQuestionsDone = parkinsonQuestions.moreTremorStiffnessFalls !== null && parkinsonQuestions.medicinesOnTime !== null;

      return [
        {
          id: 'parkinson-tapping-section',
          label: isTappingDone ? '✓ Motor Tapping Test (10s)' : '○ Motor Tapping Test (10s)',
          isComplete: isTappingDone
        },
        {
          id: 'parkinson-questions-section',
          label: isQuestionsDone ? '✓ Tremor, Stiffness & Medicines' : '○ Tremor, Stiffness & Medicines',
          isComplete: isQuestionsDone
        }
      ];
    }

    // MS
    const isTappingDone = msTappingPhase === 'done';
    const isSymbolDone = msSymbolPhase === 'done';
    const isQuestionsDone = msWalkingWorse !== null && msVisionWorse !== null && msOpticPain !== null && msBladder !== null;

    return [
      {
        id: 'ms-tapping-section',
        label: isTappingDone
          ? '✓ Motor Test (Both Hands)'
          : msTappingPhase === 'left-done'
          ? '○ Motor Test (Right Pending)'
          : '○ Motor Test (Left & Right)',
        isComplete: isTappingDone
      },
      {
        id: 'ms-symbol-section',
        label: isSymbolDone
          ? '✓ Symbol Match Test'
          : '○ Symbol Match Test (Cognitive)',
        isComplete: isSymbolDone
      },
      {
        id: 'ms-questions-section',
        label: isQuestionsDone
          ? '✓ Symptom & Functional Status'
          : '○ Symptom Status (Pending)',
        isComplete: isQuestionsDone
      }
    ];
  };

  // Unified Save and Proceed to Step 2 Flag
  const handleProceedToFlag = () => {
    let sessionData = {
      patientId: patient.id,
      date: todayStr,
      examiner,
      condition,
      cannotDoTests
    };

    if (cannotDoTests) {
      const isUrgent = (
        yesNoAnswers.q1 === 'yes' ||
        yesNoAnswers.q2 === 'yes' ||
        yesNoAnswers.q3 === 'yes' ||
        yesNoAnswers.q4 === 'yes'
      );
      sessionData = {
        ...sessionData,
        active: true,
        answers: yesNoAnswers,
        isUrgent
      };
      try {
        localStorage.setItem('neurosathi_yesno_assessment', JSON.stringify(sessionData));
        localStorage.setItem('neurosathi_session_check', JSON.stringify(sessionData));
      } catch (e) {}
      if (onSaveMotor) onSaveMotor({ cannotDoTests: true, yesNoAssessment: sessionData });
      navigate(isPatientView ? '/patient/result' : '/results');
      return;
    }

    // Clean up alternative questionnaire if standard check was used
    try {
      localStorage.removeItem('neurosathi_yesno_assessment');
    } catch (e) {}

    if (condition === 'Stroke') {
      const isUrgent = strokeUrgent === 'yes';
      sessionData = {
        ...sessionData,
        strokeTapping: { leftTaps: strokeLeftTaps, rightTaps: strokeRightTaps },
        strokeQuestions,
        strokeUrgent,
        isUrgent,
        motor: { leftTaps: strokeLeftTaps, rightTaps: strokeRightTaps, lrDiff: Math.abs(strokeLeftTaps - strokeRightTaps) }
      };

      // Save user-entered readings if any field was provided
      if (
        (strokeReadings.systolic && strokeReadings.systolic.trim() !== '') ||
        (strokeReadings.diastolic && strokeReadings.diastolic.trim() !== '') ||
        (strokeReadings.bloodSugar && strokeReadings.bloodSugar.trim() !== '') ||
        (strokeReadings.weight && strokeReadings.weight.trim() !== '')
      ) {
        const readingsPayload = {
          date: todayStr,
          systolic: strokeReadings.systolic.trim(),
          diastolic: strokeReadings.diastolic.trim(),
          bloodSugar: strokeReadings.bloodSugar.trim(),
          bloodSugarContext: strokeReadings.bloodSugarContext || 'unknown',
          weight: strokeReadings.weight.trim()
        };
        sessionData.readings = readingsPayload;
        saveReadings(patient.id, readingsPayload);
      }

      if (onSaveMotor) onSaveMotor(sessionData.motor);
    } else if (condition === 'Epilepsy') {
      const isUrgent = epilepsyUrgent === 'yes';
      sessionData = {
        ...sessionData,
        epilepsyCheck: {
          seizures: epilepsySeizures,
          missedDoses: epilepsyMissedDoses,
          triggers: epilepsyTriggers,
          injury: epilepsyInjury,
          auras: epilepsyAuras,
          prolongedWeakness: epilepsyWeakness
        },
        epilepsyUrgent,
        isUrgent
      };
    } else if (condition === "Parkinson's") {
      const slowingPct = parkinsonFirstHalfTaps > 0
        ? Math.round(((parkinsonFirstHalfTaps - parkinsonSecondHalfTaps) / parkinsonFirstHalfTaps) * 100)
        : 0;
      const slowingDetected = slowingPct >= 20;
      sessionData = {
        ...sessionData,
        parkinsonTapping: {
          totalTaps: parkinsonTotalTaps,
          firstHalf: parkinsonFirstHalfTaps,
          secondHalf: parkinsonSecondHalfTaps,
          slowingPct,
          slowingDetected
        },
        parkinsonQuestions,
        isUrgent: false,
        motor: { leftTaps: Math.round(parkinsonTotalTaps * 0.48), rightTaps: Math.round(parkinsonTotalTaps * 0.52), lrDiff: 2, slowingDetected }
      };
      if (onSaveMotor) onSaveMotor(sessionData.motor);
    } else {
      // MS condition
      const avgRt = msReactionTimes.length > 0
        ? Math.round(msReactionTimes.reduce((a, b) => a + b, 0) / msReactionTimes.length)
        : 1200;
      sessionData = {
        ...sessionData,
        msTapping: { leftTaps: msLeftTaps, rightTaps: msRightTaps },
        msProcessing: { correct: msSymbolScore, avgReactionMs: avgRt },
        msQuestions: {
          fatigue: msFatigue,
          walkingWorse: msWalkingWorse,
          visionWorse: msVisionWorse,
          opticPain: msOpticPain,
          bladder: msBladder
        },
        isUrgent: false,
        motor: { leftTaps: msLeftTaps, rightTaps: msRightTaps, lrDiff: Math.abs(msLeftTaps - msRightTaps) },
        processing: { correct: msSymbolScore, avgReactionMs: avgRt }
      };
      if (onSaveMotor) onSaveMotor(sessionData.motor);
    }

    try {
      localStorage.setItem('neurosathi_session_check', JSON.stringify(sessionData));
    } catch (e) {}

    navigate(isPatientView ? '/patient/result' : '/results');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            {condition === 'Stroke' && <Activity className="w-5 h-5" />}
            {condition === 'Epilepsy' && <Zap className="w-5 h-5" />}
            {condition === "Parkinson's" && <Hand className="w-5 h-5" />}
            {condition === 'MS' && <Brain className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {cannotDoTests ? "1 Check: Observational Questions" : isPatientView ? `Brain Health Check: ${patient.firstName}` : `1 Check: ${condition} Check`}
              </h1>
              <span
                className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded cursor-help"
                title="Standardized rural neurological decision-support protocol v1.2. Designed for community frontline triage; pending formal tertiary hospital sign-off."
              >
                Clinical Protocol: Rural Neuro Triage v1.2
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {isPatientView ? `Simple home check for ${patient.firstName} (${condition})` : getExaminerActionText()}
            </p>
          </div>
        </div>

        {/* Hackathon Fast-Track Button */}
        <button
          type="button"
          onClick={handleSimulateCompletedCheck}
          className="touch-target bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 sm:self-center"
          title="Instant fast-track for hackathon judges: Populates realistic condition-specific test scores and answers without waiting for timers."
        >
          <span className="text-amber-600 text-sm">⚡</span>
          <span>Simulate Completed Check (Demo)</span>
        </button>
      </div>

      {/* Simulated notification banner */}
      {simulatedToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl text-center shadow-md animate-fadeIn flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>⚡ Realistic screening scores populated! You can now proceed to review results.</span>
        </div>
      )}

      {/* "Who is doing this check?" Selection (Collapsed into Compact Info Pill) */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs space-y-2.5 text-left">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Operator:</span>
            <span className="text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              {examiner === 'asha' ? 'ASHA worker' : examiner === 'patient' ? 'Patient alone' : examiner === 'caregiver' ? 'Family member or caregiver' : 'Clinic nurse or rural doctor'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowOperatorPicker(p => !p)}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
          >
            {showOperatorPicker ? "Hide options" : "Change operator"}
          </button>
        </div>

        {showOperatorPicker && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 animate-fadeIn">
            {[
              { id: 'asha', label: 'ASHA worker' },
              { id: 'patient', label: 'Patient alone' },
              { id: 'caregiver', label: 'Family member or caregiver' },
              { id: 'clinic', label: 'Clinic nurse or rural doctor' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  handleExaminerChange(opt.id);
                  setShowOperatorPicker(false);
                }}
                className={`touch-target p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  examiner === opt.id
                    ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold leading-tight">{opt.label}</span>
                  {examiner === opt.id && <span className="text-teal-600 font-extrabold text-xs">✓</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Toggle: Patient cannot do the tapping/reaction tests */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <label htmlFor="cannot-do-tests-toggle" className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              id="cannot-do-tests-toggle"
              type="checkbox"
              checked={cannotDoTests}
              onChange={(e) => handleToggleCannotDoTests(e.target.checked)}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer accent-teal-600 shrink-0"
            />
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              Patient cannot do the tapping/reaction tests
            </span>
          </label>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            Alternative observational questions
          </span>
        </div>
      </div>

      {cannotDoTests ? (
        /* Alternative 6 Yes/No Questions */
        <div id="alt-questions-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 text-left">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Observational Checklist
            </h2>
            <p className="text-xs text-slate-500">
              Answer the following 6 signs observed during the home visit.
            </p>
          </div>

          <div className="space-y-3">
            {ALTERNATIVE_QUESTIONS.map((q, idx) => {
              const currentAns = yesNoAnswers[q.key];
              return (
                <div
                  key={q.key}
                  className={`p-3.5 rounded-xl border transition-all ${
                    currentAns === 'yes'
                      ? (q.isUrgent ? 'bg-red-50/70 border-red-300' : 'bg-amber-50/70 border-amber-300')
                      : currentAns === 'no'
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="font-bold text-slate-900 text-sm leading-snug">
                      <span className="text-teal-700 mr-1.5">{idx + 1}.</span>
                      {q.text}
                    </span>
                    {q.isUrgent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded shrink-0">
                        Urgent flag
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setYesNoAnswers(p => ({ ...p, [q.key]: 'yes' }))}
                      className={`touch-target py-2.5 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        currentAns === 'yes'
                          ? (q.isUrgent ? 'bg-red-600 text-white shadow-xs' : 'bg-amber-600 text-white shadow-xs')
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      }`}
                    >
                      Yes {currentAns === 'yes' && '✓'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setYesNoAnswers(p => ({ ...p, [q.key]: 'no' }))}
                      className={`touch-target py-2.5 px-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        currentAns === 'no'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      }`}
                    >
                      No {currentAns === 'no' && '✓'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : condition === 'Stroke' ? (
        /* CONDITION 1: STROKE FOLLOW-UP CHECK */
        <div className="space-y-5 text-left">
          {/* Stroke Section 1: Tapping Test (each hand, 10s) */}
          <div id="stroke-tapping-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  🖐️ 1. Motor Tapping Test (10s per hand)
                </h2>
                <p className="text-xs text-slate-500">
                  Tap rapidly with index finger for 10 seconds per hand.
                </p>
              </div>
              <ListenButton text="Finger tapping test. Tap as fast as possible for 10 seconds with each hand." currentLang={currentLang} />
            </div>

            {strokePhase === 'idle' && (
              <button
                type="button"
                onClick={handleStartStrokeLeft}
                className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-base sm:text-lg font-bold shadow-md transition-all cursor-pointer"
              >
                Start Left Hand (10s)
              </button>
            )}

            {strokePhase === 'left-tapping' && (
              <div className="space-y-4 py-2 text-center">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Time: <span className="text-teal-700">{strokeTimeLeft}s</span></span>
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Left Taps: <span className="text-teal-700">{strokeLeftTaps}</span></span>
                </div>
                <button
                  type="button"
                  onPointerDown={handleStrokeTap}
                  className="no-select touch-target w-36 h-36 mx-auto rounded-full bg-teal-600 hover:bg-teal-500 active:scale-90 text-white font-bold text-2xl shadow-xl border-4 border-teal-200 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span>TAP!</span>
                  <span className="text-xs font-normal opacity-90 mt-1">Left Hand</span>
                </button>
              </div>
            )}

            {strokePhase === 'left-done' && (
              <div className="space-y-3 py-2 text-center">
                <p className="font-bold text-teal-800 text-sm">Left hand completed: {strokeLeftTaps} taps</p>
                <button
                  type="button"
                  onClick={handleStartStrokeRight}
                  className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-base sm:text-lg font-bold shadow-md transition-all cursor-pointer"
                >
                  Start Right Hand (10s)
                </button>
              </div>
            )}

            {strokePhase === 'right-tapping' && (
              <div className="space-y-4 py-2 text-center">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Time: <span className="text-teal-700">{strokeTimeLeft}s</span></span>
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Right Taps: <span className="text-teal-700">{strokeRightTaps}</span></span>
                </div>
                <button
                  type="button"
                  onPointerDown={handleStrokeTap}
                  className="no-select touch-target w-36 h-36 mx-auto rounded-full bg-teal-600 hover:bg-teal-500 active:scale-90 text-white font-bold text-2xl shadow-xl border-4 border-teal-200 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span>TAP!</span>
                  <span className="text-xs font-normal opacity-90 mt-1">Right Hand</span>
                </button>
              </div>
            )}

            {strokePhase === 'done' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs sm:text-sm text-emerald-950 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Left: {strokeLeftTaps} taps • Right: {strokeRightTaps} taps</span>
                </span>
                <button
                  type="button"
                  onClick={handleStartStrokeLeft}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Stroke Section 2: Caregiver Yes/No Questions */}
          <div id="stroke-questions-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              🏠 2. Caregiver Daily Activity Questions
            </h2>

            {[
              { key: 'eating', text: 'Eating without help?' },
              { key: 'dressing', text: 'Dressing without help?' },
              { key: 'walking', text: 'Walking without help?' },
              { key: 'speech', text: 'Speech clear?' },
              { key: 'medicines', text: 'Medicines taken regularly?' }
            ].map((item, idx) => (
              <div key={item.key} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-sm font-bold text-slate-800 block">
                  {idx + 1}. {item.text}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStrokeQuestions(p => ({ ...p, [item.key]: 'yes' }))}
                    className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                      strokeQuestions[item.key] === 'yes'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    Yes {strokeQuestions[item.key] === 'yes' && '✓'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStrokeQuestions(p => ({ ...p, [item.key]: 'no' }))}
                    className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                      strokeQuestions[item.key] === 'no'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    No {strokeQuestions[item.key] === 'no' && '✓'}
                  </button>
                </div>
              </div>
            ))}

            {/* Clinical Recovery & Caregiver Observations */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between flex-wrap gap-1 mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                  Recovery &amp; Neurological Signs
                </span>
                <span
                  className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded cursor-help"
                  title="Standardized rural neurological decision-support protocol v1.2. Designed for community frontline triage; pending formal tertiary hospital sign-off."
                >
                  Clinical Protocol: Rural Neuro Triage v1.2
                </span>
              </div>

              {[
                {
                  key: 'spasticity',
                  label: '6. Limb stiffness / spasms',
                  text: 'Are the arms or legs becoming stiff, tight, or hard to straighten out?',
                  yesLabel: 'Yes (Stiff / Spasms)',
                  noLabel: 'No (Flexible)'
                },
                {
                  key: 'neglect',
                  label: '7. One-sided attention (Caregiver observation)',
                  text: 'Does the patient ignore food on one side of the plate, or bump into things on one side?',
                  yesLabel: 'Yes (Ignores one side)',
                  noLabel: 'No (Balanced attention)'
                },
                {
                  key: 'bladder',
                  label: '8. Bladder / bowel control',
                  text: 'Any new trouble holding urine, leakage, or difficulty passing urine?',
                  yesLabel: 'Yes (Trouble / Leakage)',
                  noLabel: 'No (Normal control)'
                }
              ].map((item) => (
                <div key={item.key} className="p-3 mb-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div>
                    <span className="text-xs font-bold text-teal-800 block">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-800 block mt-0.5">{item.text}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStrokeQuestions(p => ({ ...p, [item.key]: 'yes' }))}
                      className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                        strokeQuestions[item.key] === 'yes'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item.yesLabel} {strokeQuestions[item.key] === 'yes' && '✓'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStrokeQuestions(p => ({ ...p, [item.key]: 'no' }))}
                      className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                        strokeQuestions[item.key] === 'no'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item.noLabel} {strokeQuestions[item.key] === 'no' && '✓'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stroke Section 3: Urgent Warning Check */}
          <div id="stroke-urgent-section" className="bg-red-50/80 rounded-2xl p-5 border-2 border-red-300 shadow-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-red-950">
                  🚨 Urgent Check: New weakness, speech change, or confusion since last check?
                </h3>
                <p className="text-xs text-red-800 mt-0.5">
                  If yes, flags immediate emergency assistance with 108 ambulance and e-Sanjeevani.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStrokeUrgent('yes')}
                className={`touch-target py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base cursor-pointer ${
                  strokeUrgent === 'yes'
                    ? 'bg-red-600 text-white ring-2 ring-red-400 shadow-md'
                    : 'bg-white hover:bg-red-100 text-red-900 border border-red-200'
                }`}
              >
                Yes (Urgent) {strokeUrgent === 'yes' && '✓'}
              </button>
              <button
                type="button"
                onClick={() => setStrokeUrgent('no')}
                className={`touch-target py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base cursor-pointer ${
                  strokeUrgent === 'no'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                No {strokeUrgent === 'no' && '✓'}
              </button>
            </div>
          </div>

          {/* Stroke Section 4: Optional Readings Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Readings, if available
                </h2>
                <p className="text-xs text-slate-500">
                  Optional — skip any or all fields if equipment is not available.
                </p>
              </div>
              <span
                className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded shrink-0 cursor-help"
                title="Standardized rural neurological decision-support protocol v1.2. Designed for community frontline triage; pending formal tertiary hospital sign-off."
              >
                Clinical Protocol: Rural Neuro Triage v1.2
              </span>
            </div>

            {/* Blood Pressure */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 block">
                Blood pressure (systolic / diastolic)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="stroke-bp-sys" className="text-[11px] text-slate-500 font-medium block mb-1">
                    Systolic (mmHg)
                  </label>
                  <input
                    id="stroke-bp-sys"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 120"
                    value={strokeReadings.systolic}
                    onChange={(e) => setStrokeReadings(p => ({ ...p, systolic: e.target.value }))}
                    className="touch-target w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="stroke-bp-dia" className="text-[11px] text-slate-500 font-medium block mb-1">
                    Diastolic (mmHg)
                  </label>
                  <input
                    id="stroke-bp-dia"
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 80"
                    value={strokeReadings.diastolic}
                    onChange={(e) => setStrokeReadings(p => ({ ...p, diastolic: e.target.value }))}
                    className="touch-target w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>

              {/* Live BP Range Feedback */}
              {(() => {
                const sys = Number(strokeReadings.systolic);
                const dia = Number(strokeReadings.diastolic);
                if (!sys && !dia) return (
                  <p className="text-[11px] text-slate-400">Target for secondary stroke prevention: &lt;130/80 mmHg</p>
                );
                const isElevated = (sys && sys >= 140) || (dia && dia >= 90);
                if (isElevated) {
                  return (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1.5 mt-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>⚠️ Elevated BP (Hypertensive): {sys || '—'}/{dia || '—'} mmHg (Threshold: ≥140/90 mmHg)</span>
                    </div>
                  );
                }
                if (sys && dia) {
                  return (
                    <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ Normal blood pressure reading ({sys}/{dia} mmHg)</span>
                    </p>
                  );
                }
                return null;
              })()}
            </div>

            {/* Blood Sugar */}
            <div className="space-y-1.5">
              <label htmlFor="stroke-blood-sugar" className="text-xs sm:text-sm font-bold text-slate-800 block">
                Blood sugar (number, with choice of fasting / after meal / unknown)
              </label>
              <div className="space-y-2">
                <input
                  id="stroke-blood-sugar"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 110"
                  value={strokeReadings.bloodSugar}
                  onChange={(e) => setStrokeReadings(p => ({ ...p, bloodSugar: e.target.value }))}
                  className="touch-target w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
                />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fasting', label: 'Fasting' },
                    { id: 'after meal', label: 'After meal' },
                    { id: 'unknown', label: 'Unknown' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStrokeReadings(p => ({ ...p, bloodSugarContext: opt.id }))}
                      className={`touch-target py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        strokeReadings.bloodSugarContext === opt.id
                          ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Live Blood Sugar Feedback */}
                {(() => {
                  const bs = Number(strokeReadings.bloodSugar);
                  if (!bs) return (
                    <p className="text-[11px] text-slate-400">Target: &lt;140 mg/dL fasting, &lt;200 mg/dL post-meal</p>
                  );
                  const ctx = strokeReadings.bloodSugarContext || 'unknown';
                  const isElevated = (ctx === 'fasting' && bs >= 140) || (ctx === 'after meal' && bs >= 200) || (ctx === 'unknown' && bs >= 180);
                  if (isElevated) {
                    return (
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1.5 mt-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>⚠️ Elevated Blood Sugar: {bs} mg/dL ({ctx})</span>
                      </div>
                    );
                  }
                  return (
                    <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ Normal blood sugar level ({bs} mg/dL)</span>
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Weight in kg */}
            <div className="space-y-1.5">
              <label htmlFor="stroke-weight" className="text-xs sm:text-sm font-bold text-slate-800 block">
                Weight in kg
              </label>
              <input
                id="stroke-weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="e.g. 68"
                value={strokeReadings.weight}
                onChange={(e) => setStrokeReadings(p => ({ ...p, weight: e.target.value }))}
                className="touch-target w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Advisory line under the card */}
            <p className="text-xs text-slate-600 font-medium pt-1 border-t border-slate-100">
              These numbers are for your doctor to review. If the patient feels unwell, call 108 or contact a doctor now.
            </p>
          </div>
        </div>
      ) : condition === 'Epilepsy' ? (
        /* CONDITION 2: EPILEPSY CHECK */
        <div className="space-y-5 text-left">
          {/* Seizures count */}
          <div id="epilepsy-seizures-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <label className="text-sm sm:text-base font-bold text-slate-900 block">
              1. Number of seizures since last check
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['0', '1', '2-3', '4+'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setEpilepsySeizures(opt)}
                  className={`touch-target py-3 px-3 rounded-xl font-bold text-base transition-all cursor-pointer ${
                    epilepsySeizures === opt
                      ? (opt === '0' ? 'bg-emerald-700 text-white' : 'bg-amber-600 text-white ring-2 ring-amber-400')
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {opt} {epilepsySeizures === opt && '✓'}
                </button>
              ))}
            </div>
          </div>

          {/* Missed medicine doses */}
          <div id="epilepsy-medicines-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <label className="text-sm sm:text-base font-bold text-slate-900 block">
              2. Missed medicine doses
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'none', label: 'None' },
                { id: '1-2', label: '1 - 2 doses' },
                { id: 'many', label: 'Many doses' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEpilepsyMissedDoses(opt.id)}
                  className={`touch-target py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    epilepsyMissedDoses === opt.id
                      ? (opt.id === 'none' ? 'bg-emerald-700 text-white' : 'bg-amber-600 text-white ring-2 ring-amber-400')
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {opt.label} {epilepsyMissedDoses === opt.id && '✓'}
                </button>
              ))}
            </div>
          </div>

          {/* Triggers */}
          <div id="epilepsy-triggers-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <label className="text-sm sm:text-base font-bold text-slate-900 block">
              3. Known triggers identified
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'poor-sleep', label: 'Poor sleep' },
                { id: 'fever', label: 'Fever' },
                { id: 'none', label: 'None' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEpilepsyTriggers(opt.id)}
                  className={`touch-target py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    epilepsyTriggers === opt.id
                      ? 'bg-teal-700 text-white ring-2 ring-teal-400'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {opt.label} {epilepsyTriggers === opt.id && '✓'}
                </button>
              ))}
            </div>
          </div>

          {/* Injury */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <label className="text-sm sm:text-base font-bold text-slate-900 block">
              4. Any injury from seizure?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEpilepsyInjury('yes')}
                className={`touch-target py-3 px-4 rounded-xl font-bold text-sm sm:text-base cursor-pointer ${
                  epilepsyInjury === 'yes'
                    ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                Yes (Cut/fall/burn) {epilepsyInjury === 'yes' && '✓'}
              </button>
              <button
                type="button"
                onClick={() => setEpilepsyInjury('no')}
                className={`touch-target py-3 px-4 rounded-xl font-bold text-sm sm:text-base cursor-pointer ${
                  epilepsyInjury === 'no'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                No injury {epilepsyInjury === 'no' && '✓'}
              </button>
            </div>
          </div>

          {/* Warning signs / Focal auras */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-sm sm:text-base font-bold text-slate-900 block">
                5. Warning signs / Auras before a seizure
              </label>
              <span
                className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded cursor-help"
                title="Standardized rural neurological decision-support protocol v1.2. Designed for community frontline triage; pending formal tertiary hospital sign-off."
              >
                Clinical Protocol: Rural Neuro Triage v1.2
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Any unusual warning signs before a spell—like a rising feeling in the stomach, strange smell, or sudden unexplainable fear?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEpilepsyAuras('yes')}
                className={`touch-target py-3 px-4 rounded-xl font-bold text-xs sm:text-sm cursor-pointer ${
                  epilepsyAuras === 'yes'
                    ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                Yes (Warnings present) {epilepsyAuras === 'yes' && '✓'}
              </button>
              <button
                type="button"
                onClick={() => setEpilepsyAuras('no')}
                className={`touch-target py-3 px-4 rounded-xl font-bold text-xs sm:text-sm cursor-pointer ${
                  epilepsyAuras === 'no'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                No warnings {epilepsyAuras === 'no' && '✓'}
              </button>
            </div>
          </div>

          {/* Prolonged post-seizure weakness */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-sm sm:text-base font-bold text-slate-900 block">
                6. Lingering weakness after seizure
              </label>
              <span
                className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded cursor-help"
                title="Standardized rural neurological decision-support protocol v1.2. Designed for community frontline triage; pending formal tertiary hospital sign-off."
              >
                Clinical Protocol: Rural Neuro Triage v1.2
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Did new weakness in an arm or leg last more than an hour after the seizure?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEpilepsyWeakness('yes')}
                className={`touch-target py-3 px-4 rounded-xl font-bold text-xs sm:text-sm cursor-pointer ${
                  epilepsyWeakness === 'yes'
                    ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                Yes (Weakness &gt; 1 hour) {epilepsyWeakness === 'yes' && '✓'}
              </button>
              <button
                type="button"
                onClick={() => setEpilepsyWeakness('no')}
                className={`touch-target py-3 px-4 rounded-xl font-bold text-xs sm:text-sm cursor-pointer ${
                  epilepsyWeakness === 'no'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                No lingering weakness {epilepsyWeakness === 'no' && '✓'}
              </button>
            </div>
          </div>

          {/* Urgent Epilepsy Check */}
          <div id="epilepsy-urgent-section" className="bg-red-50/80 rounded-2xl p-5 border-2 border-red-300 shadow-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-red-950">
                  🚨 Urgent Check: A seizure lasting over 5 minutes, or no recovery between seizures?
                </h3>
                <p className="text-xs text-red-800 mt-0.5">
                  Status epilepticus warning sign. Requires immediate 108 emergency response.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setEpilepsyUrgent('yes')}
                className={`touch-target py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base cursor-pointer ${
                  epilepsyUrgent === 'yes'
                    ? 'bg-red-600 text-white ring-2 ring-red-400 shadow-md'
                    : 'bg-white hover:bg-red-100 text-red-900 border border-red-200'
                }`}
              >
                Yes (&gt;5 min / no recovery) {epilepsyUrgent === 'yes' && '✓'}
              </button>
              <button
                type="button"
                onClick={() => setEpilepsyUrgent('no')}
                className={`touch-target py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base cursor-pointer ${
                  epilepsyUrgent === 'no'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                No {epilepsyUrgent === 'no' && '✓'}
              </button>
            </div>
          </div>
        </div>
      ) : condition === "Parkinson's" ? (
        /* CONDITION 3: PARKINSON'S CHECK */
        <div className="space-y-5 text-left">
          {/* Tapping speed and slowing test */}
          <div id="parkinson-tapping-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  🖐️ 1. Finger Tapping (Speed & Slowing Test, 10s)
                </h2>
                <p className="text-xs text-slate-500">
                  Evaluates motor speed and fatigue-related slowing over 10 seconds.
                </p>
              </div>
              <ListenButton text="Finger tapping test for Parkinson's. Tap continuously for 10 seconds to detect speed and motor slowing." currentLang={currentLang} />
            </div>

            {parkinsonPhase === 'idle' && (
              <button
                type="button"
                onClick={handleStartParkinsonTapping}
                className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-base sm:text-lg font-bold shadow-md transition-all cursor-pointer"
              >
                Start 10s Tapping Test
              </button>
            )}

            {parkinsonPhase === 'tapping' && (
              <div className="space-y-4 py-2 text-center">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Time: <span className="text-teal-700">{parkinsonTimeLeft}s</span></span>
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Total Taps: <span className="text-teal-700">{parkinsonTotalTaps}</span></span>
                </div>
                <button
                  type="button"
                  onPointerDown={handleParkinsonTap}
                  className="no-select touch-target w-36 h-36 mx-auto rounded-full bg-teal-600 hover:bg-teal-500 active:scale-90 text-white font-bold text-2xl shadow-xl border-4 border-teal-200 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span>TAP!</span>
                  <span className="text-xs font-normal opacity-90 mt-1">Keep Tapping</span>
                </button>
              </div>
            )}

            {parkinsonPhase === 'done' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Total Taps: {parkinsonTotalTaps} (1st half: {parkinsonFirstHalfTaps} vs 2nd half: {parkinsonSecondHalfTaps})
                  </span>
                  <button
                    type="button"
                    onClick={handleStartParkinsonTapping}
                    className="text-xs text-slate-500 hover:text-slate-800 underline"
                  >
                    Retry
                  </button>
                </div>
                {parkinsonFirstHalfTaps > 0 && parkinsonFirstHalfTaps > parkinsonSecondHalfTaps ? (
                  <p className="text-xs font-semibold text-amber-700">
                    ⚠ Speed dropped from {parkinsonFirstHalfTaps} to {parkinsonSecondHalfTaps} taps (slowing / motor fatigue detected).
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-emerald-700">
                    ✓ Rhythm remained consistent without significant slowing.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Parkinson's Questions */}
          <div id="parkinson-questions-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              📝 2. Motor Symptoms & Medication
            </h2>

            {/* Q1: Tremor, stiffness, falls */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-sm font-bold text-slate-800 block">
                1. More tremor, stiffness, or falls since last check?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setParkinsonQuestions(p => ({ ...p, moreTremorStiffnessFalls: 'yes' }))}
                  className={`touch-target py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    parkinsonQuestions.moreTremorStiffnessFalls === 'yes'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  Yes {parkinsonQuestions.moreTremorStiffnessFalls === 'yes' && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setParkinsonQuestions(p => ({ ...p, moreTremorStiffnessFalls: 'no' }))}
                  className={`touch-target py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    parkinsonQuestions.moreTremorStiffnessFalls === 'no'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  No {parkinsonQuestions.moreTremorStiffnessFalls === 'no' && '✓'}
                </button>
              </div>
            </div>

            {/* Q2: Medicines on time */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-sm font-bold text-slate-800 block">
                2. Medicines taken on time?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setParkinsonQuestions(p => ({ ...p, medicinesOnTime: 'yes' }))}
                  className={`touch-target py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    parkinsonQuestions.medicinesOnTime === 'yes'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  Yes (On time) {parkinsonQuestions.medicinesOnTime === 'yes' && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setParkinsonQuestions(p => ({ ...p, medicinesOnTime: 'no' }))}
                  className={`touch-target py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    parkinsonQuestions.medicinesOnTime === 'no'
                      ? 'bg-amber-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  No (Missed/delayed) {parkinsonQuestions.medicinesOnTime === 'no' && '✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CONDITION 4: MS MULTI-DOMAIN CHECK */
        <div className="space-y-5 text-left">
          {/* MS Tapping */}
          <div id="ms-tapping-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  🖐️ 1. Finger Tapping (10s per hand)
                </h2>
                <p className="text-xs text-slate-500">
                  Tap rapidly with index finger for 10 seconds per hand.
                </p>
              </div>
              <ListenButton text="MS finger tapping test. Tap as fast as possible for 10 seconds with each hand." currentLang={currentLang} />
            </div>

            {msTappingPhase === 'idle' && (
              <button
                type="button"
                onClick={handleStartMsLeft}
                className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-base sm:text-lg font-bold shadow-md transition-all cursor-pointer"
              >
                Start Left Hand (10s)
              </button>
            )}

            {msTappingPhase === 'left-tapping' && (
              <div className="space-y-4 py-2 text-center">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Time: <span className="text-teal-700">{msTimeLeft}s</span></span>
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Left Taps: <span className="text-teal-700">{msLeftTaps}</span></span>
                </div>
                <button
                  type="button"
                  onPointerDown={handleMsTap}
                  className="no-select touch-target w-36 h-36 mx-auto rounded-full bg-teal-600 hover:bg-teal-500 active:scale-90 text-white font-bold text-2xl shadow-xl border-4 border-teal-200 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span>TAP!</span>
                  <span className="text-xs font-normal opacity-90 mt-1">Left Hand</span>
                </button>
              </div>
            )}

            {msTappingPhase === 'left-done' && (
              <div className="space-y-3 py-2 text-center">
                <p className="font-bold text-teal-800 text-sm">Left hand: {msLeftTaps} taps</p>
                <button
                  type="button"
                  onClick={handleStartMsRight}
                  className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-base sm:text-lg font-bold shadow-md transition-all cursor-pointer"
                >
                  Start Right Hand (10s)
                </button>
              </div>
            )}

            {msTappingPhase === 'right-tapping' && (
              <div className="space-y-4 py-2 text-center">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Time: <span className="text-teal-700">{msTimeLeft}s</span></span>
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Right Taps: <span className="text-teal-700">{msRightTaps}</span></span>
                </div>
                <button
                  type="button"
                  onPointerDown={handleMsTap}
                  className="no-select touch-target w-36 h-36 mx-auto rounded-full bg-teal-600 hover:bg-teal-500 active:scale-90 text-white font-bold text-2xl shadow-xl border-4 border-teal-200 flex flex-col items-center justify-center cursor-pointer"
                >
                  <span>TAP!</span>
                  <span className="text-xs font-normal opacity-90 mt-1">Right Hand</span>
                </button>
              </div>
            )}

            {msTappingPhase === 'done' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs sm:text-sm text-emerald-950 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Left: {msLeftTaps} taps • Right: {msRightTaps} taps</span>
                </span>
                <button
                  type="button"
                  onClick={handleStartMsLeft}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* MS Symbol Match (30s) */}
          <div id="ms-symbol-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  🧠 2. Symbol Matching Test (30 seconds)
                </h2>
                <p className="text-xs text-slate-500">
                  Tap the matching number for each symbol.
                </p>
              </div>
              <ListenButton text="Symbol matching test. Tap the number matching the symbol on the screen." currentLang={currentLang} />
            </div>

            {/* Reference Key */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
              {SYMBOLS_MAP.map(s => (
                <div key={s.number} className="bg-white p-1.5 rounded-lg text-center border border-slate-200">
                  <span className="text-xl text-teal-700 block">{s.symbol}</span>
                  <span className="text-xs font-bold text-slate-700">= {s.number}</span>
                </div>
              ))}
            </div>

            {msSymbolPhase === 'idle' && (
              <button
                type="button"
                onClick={handleStartMsSymbol}
                className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-base sm:text-lg font-bold shadow-md transition-all cursor-pointer"
              >
                Start Symbol Test (30s)
              </button>
            )}

            {msSymbolPhase === 'active' && (
              <div className="space-y-3 py-2 text-center">
                <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Time: <span className="text-teal-700">{msSymbolTimeLeft}s</span></span>
                  <span className="bg-slate-100 px-3 py-1 rounded-full">Score: <span className="text-teal-700">{msSymbolScore}</span></span>
                </div>

                <div className="w-24 h-24 mx-auto bg-teal-50 border-2 border-teal-300 rounded-2xl flex items-center justify-center text-5xl text-teal-800">
                  {SYMBOLS_MAP[msSymbolCurrentIdx].symbol}
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleMsSymbolChoice(num)}
                      className="touch-target h-14 rounded-xl bg-slate-800 hover:bg-slate-900 active:bg-teal-600 text-white font-bold text-xl shadow cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msSymbolPhase === 'done' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs sm:text-sm text-emerald-950 font-bold">
                <span>Completed: {msSymbolScore} correct matches</span>
                <button
                  type="button"
                  onClick={handleStartMsSymbol}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* MS Symptoms */}
          <div id="ms-questions-section" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              📋 3. Fatigue & Daily Functional Questions
            </h2>

            {/* Fatigue 1-5 */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-800">Fatigue severity rating</span>
                <span className="text-xs font-bold text-teal-700">{msFatigue} / 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setMsFatigue(lvl)}
                    className={`touch-target py-2 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                      msFatigue === lvl
                        ? 'bg-teal-700 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 - Minimal</span>
                <span>5 - Severe</span>
              </div>
            </div>

            {/* Walking or balance worse? */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-sm font-bold text-slate-800 block">Walking or balance worse?</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMsWalkingWorse('yes')}
                  className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    msWalkingWorse === 'yes' ? 'bg-amber-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  Yes {msWalkingWorse === 'yes' && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setMsWalkingWorse('no')}
                  className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    msWalkingWorse === 'no' ? 'bg-emerald-700 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  No {msWalkingWorse === 'no' && '✓'}
                </button>
              </div>
            </div>

            {/* Vision worse? */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-sm font-bold text-slate-800 block">Vision worse?</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMsVisionWorse('yes')}
                  className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    msVisionWorse === 'yes' ? 'bg-amber-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  Yes {msVisionWorse === 'yes' && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setMsVisionWorse('no')}
                  className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    msVisionWorse === 'no' ? 'bg-emerald-700 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  No {msVisionWorse === 'no' && '✓'}
                </button>
              </div>
            </div>

            {/* Optic Neuritis Check */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-bold text-teal-800 block">Eye pain / Acute vision change (Optic check)</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded" title="Standardized screening item under clinical review">
                  Clinical Protocol: Rural Neuro Triage v1.2
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-800 block">
                Any new pain behind either eye when moving it, or sudden cloudy/dim vision?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMsOpticPain('yes')}
                  className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    msOpticPain === 'yes' ? 'bg-amber-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  Yes (Eye pain / Dim vision) {msOpticPain === 'yes' && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setMsOpticPain('no')}
                  className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    msOpticPain === 'no' ? 'bg-emerald-700 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  No {msOpticPain === 'no' && '✓'}
                </button>
              </div>
            </div>

            {/* Neurogenic Bladder / Incontinence Check */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-bold text-teal-800 block">Bladder / Bowel control</span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded" title="Standardized screening item under clinical review">
                  Clinical Protocol: Rural Neuro Triage v1.2
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-800 block">
                Any new trouble holding urine, leakage, or difficulty passing urine?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMsBladder('yes')}
                  className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    msBladder === 'yes' ? 'bg-amber-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  Yes (Trouble / Leakage) {msBladder === 'yes' && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => setMsBladder('no')}
                  className={`touch-target py-2 px-3 rounded-lg font-bold text-xs sm:text-sm cursor-pointer ${
                    msBladder === 'no' ? 'bg-emerald-700 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  No (Normal control) {msBladder === 'no' && '✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARD: "Anything else bothering you?" (Voice & Typed note) at the end of Step 1 Check for ALL conditions */}
      <PatientNoteCard
        patientId={patient.id}
        checkDate={todayStr}
      />

      {/* Proceed to Step 2: Flag Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleProceedToFlag}
          disabled={!isCheckComplete}
          className={`touch-target w-full py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isCheckComplete
              ? 'bg-teal-600 hover:bg-teal-700 text-white active:scale-[0.99]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>{isPatientView ? "See My Result" : "Proceed to Step 2: Flag"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Dynamic Missing-Items Checklist */}
        {!isCheckComplete ? (
          <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-center animate-fadeIn">
            <p className="text-xs font-bold text-amber-900">
              {isPatientView ? "Complete remaining items to see your result:" : "Complete remaining items to proceed to Step 2:"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {getChecklistItems().map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`touch-target text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    item.isComplete
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs hover:scale-105 active:scale-95'
                  }`}
                  title={item.isComplete ? 'Section complete' : 'Click to jump to this incomplete section'}
                >
                  <span>{item.label}</span>
                  {!item.isComplete && <span className="text-[10px] text-amber-600 font-normal">↓</span>}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-center text-emerald-700 mt-2 font-bold flex items-center justify-center gap-1">
            <span>✓ All items recorded. Ready to continue.</span>
          </p>
        )}
      </div>
    </div>
  );
}
