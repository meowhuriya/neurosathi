/**
 * Enhanced Sample Patient Longitudinal Dataset for NeuroSathi V2
 * SFIC DTU Innovation Challenge Prototype
 * All data pre-loaded into localStorage for instant offline demo functionality.
 */

// CLINICAL NOTE: Finger tapping speed correlates with motor function. Asymmetry >20% may indicate lateralized deficit. Threshold configurable.
// CLINICAL NOTE: WHO defines medication adherence <80% as sub-therapeutic for chronic neurological conditions. Non-adherence is the leading modifiable cause of seizure recurrence (ILAE) and secondary stroke events (AHA/ASA).
// CLINICAL NOTE: Uncontrolled hypertension is the single largest modifiable risk factor for stroke recurrence (INTERSTROKE study). BP target for secondary stroke prevention: <130/80 mmHg (AHA/ASA 2021). Regular home BP monitoring reduces stroke recurrence by 20%.
// CLINICAL NOTE: Seizure diary is the gold standard for epilepsy monitoring per ILAE guidelines. Frequency, duration, and triggers directly inform anti-seizure medication titration. >5 min = status epilepticus.

export const SAMPLE_PATIENTS = [
  {
    id: "NS-001",
    firstName: "Lakshmi",
    age: 48,
    gender: "Female",
    condition: "MS",
    state: "Telangana",
    language: "Telugu",
    registeredDate: "2026-09-01",
    healthWorkerId: "ASHA-TS-04",
    abhaId: "91-4523-8819-2041",
    pmjayId: "PMJAY-TS-2024-8192",
    schemeEligibility: "Ayushman Bharat PM-JAY & Aarogyasri (Telangana)",
    bplStatus: "BPL Cardholder (Priority Household - PHH)",
    followUp: {
      visitConfirmed: false,
      reminderDate: "2026-11-05",
      notes: "Pending consultation. Needs assistance booking e-Sanjeevani or Aarogyasri clinic."
    },
    assessments: [
      { date: "2026-09-07", motor: { leftTaps: 44, rightTaps: 46, lrDiff: 2 }, processing: { correct: 25, avgReactionMs: 1120 }, speech: { recorded: true, durationSec: 7.4 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-09-14", motor: { leftTaps: 45, rightTaps: 47, lrDiff: 2 }, processing: { correct: 24, avgReactionMs: 1140 }, speech: { recorded: true, durationSec: 7.2 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-09-21", motor: { leftTaps: 43, rightTaps: 46, lrDiff: 3 }, processing: { correct: 24, avgReactionMs: 1160 }, speech: { recorded: true, durationSec: 7.5 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 3 } },
      { date: "2026-09-28", motor: { leftTaps: 40, rightTaps: 42, lrDiff: 2 }, processing: { correct: 22, avgReactionMs: 1250 }, speech: { recorded: true, durationSec: 8.0 }, symptoms: { fatigue: 3, balance: 3, vision: 4, mood: 3 } },
      { date: "2026-10-05", motor: { leftTaps: 37, rightTaps: 39, lrDiff: 2 }, processing: { correct: 20, avgReactionMs: 1340 }, speech: { recorded: true, durationSec: 8.4 }, symptoms: { fatigue: 3, balance: 3, vision: 3, mood: 3 } },
      { date: "2026-10-12", motor: { leftTaps: 32, rightTaps: 34, lrDiff: 2 }, processing: { correct: 17, avgReactionMs: 1480 }, speech: { recorded: true, durationSec: 9.1 }, symptoms: { fatigue: 2, balance: 2, vision: 3, mood: 2 } },
      { date: "2026-10-19", motor: { leftTaps: 30, rightTaps: 33, lrDiff: 3 }, processing: { correct: 16, avgReactionMs: 1530 }, speech: { recorded: true, durationSec: 9.5 }, symptoms: { fatigue: 2, balance: 2, vision: 3, mood: 2 } },
      { date: "2026-10-26", motor: { leftTaps: 30, rightTaps: 32, lrDiff: 2 }, processing: { correct: 15, avgReactionMs: 1590 }, speech: { recorded: true, durationSec: 9.8 }, symptoms: { fatigue: 2, balance: 2, vision: 2, mood: 2 } }
    ],
    // V2 Enhancements: Functional scale decline, declining adherence (92% -> 71%), side effects
    clinicalScales: [
      { date: "2026-09-07", edssScore: 4.5, edssDomains: { walking: 5, hand: 5, vision: 4, bladder: 5, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-09-14", edssScore: 4.5, edssDomains: { walking: 5, hand: 5, vision: 4, bladder: 5, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-09-21", edssScore: 4.3, edssDomains: { walking: 4, hand: 5, vision: 4, bladder: 5, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-09-28", edssScore: 4.0, edssDomains: { walking: 4, hand: 4, vision: 4, bladder: 4, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-10-05", edssScore: 3.5, edssDomains: { walking: 3, hand: 4, vision: 3, bladder: 4, fatigue: 4, cognition: 3 }, adlScore: 7 },
      { date: "2026-10-12", edssScore: 3.0, edssDomains: { walking: 3, hand: 3, vision: 3, bladder: 3, fatigue: 3, cognition: 3 }, adlScore: 6 },
      { date: "2026-10-19", edssScore: 2.7, edssDomains: { walking: 2, hand: 3, vision: 3, bladder: 3, fatigue: 3, cognition: 2 }, adlScore: 5 },
      { date: "2026-10-26", edssScore: 2.5, edssDomains: { walking: 2, hand: 2, vision: 2, bladder: 3, fatigue: 3, cognition: 3 }, adlScore: 5 }
    ],
    vitals: [
      { date: "2026-09-07", systolic: 122, diastolic: 78, heartRate: 72, weight: 61, temperature: 98.4, bloodSugar: 104, spo2: 98 },
      { date: "2026-09-14", systolic: 120, diastolic: 80, heartRate: 74, weight: 61, temperature: 98.6, bloodSugar: 102, spo2: 98 },
      { date: "2026-09-21", systolic: 124, diastolic: 82, heartRate: 76, weight: 60.5, temperature: 98.4, bloodSugar: 108, spo2: 97 },
      { date: "2026-09-28", systolic: 122, diastolic: 79, heartRate: 75, weight: 60, temperature: 98.5, bloodSugar: 105, spo2: 98 },
      { date: "2026-10-05", systolic: 126, diastolic: 84, heartRate: 78, weight: 59.8, temperature: 98.7, bloodSugar: 110, spo2: 97 },
      { date: "2026-10-12", systolic: 128, diastolic: 85, heartRate: 80, weight: 59.2, temperature: 99.0, bloodSugar: 112, spo2: 97 },
      { date: "2026-10-19", systolic: 130, diastolic: 86, heartRate: 82, weight: 58.6, temperature: 99.1, bloodSugar: 115, spo2: 96 },
      { date: "2026-10-26", systolic: 132, diastolic: 88, heartRate: 84, weight: 58.0, temperature: 98.9, bloodSugar: 118, spo2: 97 }
    ],
    medications: [
      { id: "m1", name: "Dimethyl Fumarate", dosage: "240mg", frequency: "Twice daily", times: ["Morning", "Night"], prescribingDoctor: "Dr. Rao (NIMS Hyderabad)" },
      { id: "m2", name: "Baclofen", dosage: "10mg", frequency: "Once daily", times: ["Night"], prescribingDoctor: "PHC Officer" }
    ],
    adherenceWeekly: [92, 90, 88, 85, 79, 75, 73, 71],
    adherenceMissReasons: { "Side effects": 5, "Could not afford refill": 4, "Forgot": 2 },
    sideEffects: [
      { id: "se1", date: "2026-10-15", effect: "Stomach cramping & flushing", severity: "Moderate", medication: "Dimethyl Fumarate" },
      { id: "se2", date: "2026-10-24", effect: "Severe nausea and fatigue", severity: "Severe", medication: "Dimethyl Fumarate" }
    ],
    phq2: { date: "2026-10-24", q1: 2, q2: 2, total: 4 } // >= 3 positive screen
  },
  {
    id: "NS-002",
    firstName: "Ravi",
    age: 56,
    gender: "Male",
    condition: "Stroke",
    state: "Maharashtra",
    language: "Hindi",
    registeredDate: "2026-09-02",
    healthWorkerId: "ASHA-MH-12",
    abhaId: "91-6284-9102-5532",
    pmjayId: "PMJAY-MH-2024-9841",
    schemeEligibility: "Ayushman Bharat PM-JAY & Mahatma Jyotirao Phule (MJPJAY)",
    bplStatus: "BPL Yellow Ration Card (Antyodaya Anna)",
    followUp: {
      visitConfirmed: false,
      reminderDate: "2026-11-03",
      notes: "Follow-up due. ASHA worker notified regarding recent motor decline."
    },
    assessments: [
      { date: "2026-09-08", motor: { leftTaps: 38, rightTaps: 48, lrDiff: 10 }, processing: { correct: 21, avgReactionMs: 1220 }, speech: { recorded: true, durationSec: 8.5 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-09-15", motor: { leftTaps: 39, rightTaps: 49, lrDiff: 10 }, processing: { correct: 20, avgReactionMs: 1240 }, speech: { recorded: true, durationSec: 8.6 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-09-22", motor: { leftTaps: 37, rightTaps: 47, lrDiff: 10 }, processing: { correct: 21, avgReactionMs: 1230 }, speech: { recorded: true, durationSec: 8.4 }, symptoms: { fatigue: 4, balance: 3, vision: 4, mood: 4 } },
      { date: "2026-09-29", motor: { leftTaps: 34, rightTaps: 43, lrDiff: 9 }, processing: { correct: 18, avgReactionMs: 1350 }, speech: { recorded: true, durationSec: 8.9 }, symptoms: { fatigue: 3, balance: 3, vision: 4, mood: 3 } },
      { date: "2026-10-06", motor: { leftTaps: 31, rightTaps: 40, lrDiff: 9 }, processing: { correct: 17, avgReactionMs: 1420 }, speech: { recorded: true, durationSec: 9.3 }, symptoms: { fatigue: 3, balance: 3, vision: 3, mood: 3 } },
      { date: "2026-10-13", motor: { leftTaps: 27, rightTaps: 35, lrDiff: 8 }, processing: { correct: 15, avgReactionMs: 1540 }, speech: { recorded: true, durationSec: 9.7 }, symptoms: { fatigue: 2, balance: 2, vision: 3, mood: 2 } },
      { date: "2026-10-20", motor: { leftTaps: 26, rightTaps: 34, lrDiff: 8 }, processing: { correct: 14, avgReactionMs: 1590 }, speech: { recorded: true, durationSec: 10.0 }, symptoms: { fatigue: 2, balance: 2, vision: 3, mood: 2 } },
      { date: "2026-10-27", motor: { leftTaps: 25, rightTaps: 33, lrDiff: 8 }, processing: { correct: 14, avgReactionMs: 1610 }, speech: { recorded: true, durationSec: 10.2 }, symptoms: { fatigue: 2, balance: 2, vision: 2, mood: 2 } }
    ],
    // V2 Enhancements: Worsening mRS (1 -> 4), rising uncontrolled BP (130/85 -> 152/95), falling adherence (91% -> 70%)
    clinicalScales: [
      { date: "2026-09-08", mrsScore: 1, adlScore: 8 },
      { date: "2026-09-15", mrsScore: 1, adlScore: 8 },
      { date: "2026-09-22", mrsScore: 2, adlScore: 7 },
      { date: "2026-09-29", mrsScore: 2, adlScore: 7 },
      { date: "2026-10-06", mrsScore: 3, adlScore: 6 },
      { date: "2026-10-13", mrsScore: 3, adlScore: 5 },
      { date: "2026-10-20", mrsScore: 4, adlScore: 4 },
      { date: "2026-10-27", mrsScore: 4, adlScore: 4 }
    ],
    vitals: [
      { date: "2026-09-08", systolic: 130, diastolic: 85, heartRate: 74, weight: 68, temperature: 98.4, bloodSugar: 128, spo2: 97 },
      { date: "2026-09-15", systolic: 132, diastolic: 86, heartRate: 76, weight: 68.2, temperature: 98.6, bloodSugar: 130, spo2: 97 },
      { date: "2026-09-22", systolic: 135, diastolic: 88, heartRate: 75, weight: 68.5, temperature: 98.4, bloodSugar: 134, spo2: 96 },
      { date: "2026-09-29", systolic: 138, diastolic: 90, heartRate: 78, weight: 69, temperature: 98.5, bloodSugar: 138, spo2: 96 },
      { date: "2026-10-06", systolic: 142, diastolic: 91, heartRate: 80, weight: 69.4, temperature: 98.6, bloodSugar: 142, spo2: 96 },
      { date: "2026-10-13", systolic: 146, diastolic: 93, heartRate: 82, weight: 69.8, temperature: 98.7, bloodSugar: 146, spo2: 95 },
      { date: "2026-10-20", systolic: 149, diastolic: 94, heartRate: 84, weight: 70.2, temperature: 98.8, bloodSugar: 150, spo2: 95 },
      { date: "2026-10-27", systolic: 152, diastolic: 95, heartRate: 86, weight: 70.6, temperature: 98.6, bloodSugar: 154, spo2: 95 }
    ],
    medications: [
      { id: "m3", name: "Aspirin", dosage: "75mg", frequency: "Once daily", times: ["Morning"], prescribingDoctor: "KEM OPD" },
      { id: "m4", name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", times: ["Night"], prescribingDoctor: "KEM OPD" },
      { id: "m5", name: "Amlodipine", dosage: "5mg", frequency: "Once daily", times: ["Morning"], prescribingDoctor: "PHC Doctor" }
    ],
    adherenceWeekly: [91, 89, 87, 82, 78, 74, 71, 70],
    adherenceMissReasons: { "Medicine not available / ran out": 6, "Forgot": 4, "Could not afford refill": 3 },
    sideEffects: [
      { id: "se3", date: "2026-10-18", effect: "Easy bruising on arms", severity: "Mild", medication: "Aspirin" }
    ],
    phq2: { date: "2026-10-25", q1: 2, q2: 1, total: 3 } // >= 3 positive screen
  },
  {
    id: "NS-003",
    firstName: "Priya",
    age: 32,
    gender: "Female",
    condition: "MS",
    state: "Delhi",
    language: "Hindi",
    registeredDate: "2026-09-01",
    healthWorkerId: "ASHA-DL-02",
    abhaId: "91-3829-1094-7721",
    pmjayId: "PMJAY-DL-2024-4412",
    schemeEligibility: "Ayushman Bharat PM-JAY Eligible (Delhi)",
    bplStatus: "BPL Eligible (PHH Category)",
    followUp: {
      visitConfirmed: true,
      reminderDate: "2026-11-18",
      notes: "Visited Safdarjung OPD on Oct 22. Stable on current treatment."
    },
    assessments: [
      { date: "2026-09-07", motor: { leftTaps: 45, rightTaps: 47, lrDiff: 2 }, processing: { correct: 24, avgReactionMs: 1080 }, speech: { recorded: true, durationSec: 6.8 }, symptoms: { fatigue: 4, balance: 4, vision: 5, mood: 4 } },
      { date: "2026-09-14", motor: { leftTaps: 46, rightTaps: 48, lrDiff: 2 }, processing: { correct: 25, avgReactionMs: 1060 }, speech: { recorded: true, durationSec: 6.7 }, symptoms: { fatigue: 4, balance: 5, vision: 5, mood: 4 } },
      { date: "2026-09-21", motor: { leftTaps: 44, rightTaps: 46, lrDiff: 2 }, processing: { correct: 24, avgReactionMs: 1100 }, speech: { recorded: true, durationSec: 7.0 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-09-28", motor: { leftTaps: 45, rightTaps: 47, lrDiff: 2 }, processing: { correct: 23, avgReactionMs: 1110 }, speech: { recorded: true, durationSec: 6.9 }, symptoms: { fatigue: 4, balance: 4, vision: 5, mood: 4 } },
      { date: "2026-10-05", motor: { leftTaps: 46, rightTaps: 48, lrDiff: 2 }, processing: { correct: 25, avgReactionMs: 1070 }, speech: { recorded: true, durationSec: 6.8 }, symptoms: { fatigue: 4, balance: 4, vision: 5, mood: 5 } },
      { date: "2026-10-12", motor: { leftTaps: 44, rightTaps: 46, lrDiff: 2 }, processing: { correct: 24, avgReactionMs: 1090 }, speech: { recorded: true, durationSec: 7.1 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-19", motor: { leftTaps: 45, rightTaps: 47, lrDiff: 2 }, processing: { correct: 24, avgReactionMs: 1080 }, speech: { recorded: true, durationSec: 6.9 }, symptoms: { fatigue: 4, balance: 4, vision: 5, mood: 4 } },
      { date: "2026-10-26", motor: { leftTaps: 46, rightTaps: 48, lrDiff: 2 }, processing: { correct: 25, avgReactionMs: 1060 }, speech: { recorded: true, durationSec: 6.8 }, symptoms: { fatigue: 4, balance: 5, vision: 5, mood: 5 } }
    ],
    clinicalScales: [
      { date: "2026-09-07", edssScore: 4.6, edssDomains: { walking: 5, hand: 5, vision: 5, bladder: 5, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-09-14", edssScore: 4.7, edssDomains: { walking: 5, hand: 5, vision: 5, bladder: 5, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-09-21", edssScore: 4.6, edssDomains: { walking: 5, hand: 5, vision: 4, bladder: 5, fatigue: 4, cognition: 5 }, adlScore: 8 },
      { date: "2026-09-28", edssScore: 4.6, edssDomains: { walking: 5, hand: 5, vision: 5, bladder: 5, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-10-05", edssScore: 4.8, edssDomains: { walking: 5, hand: 5, vision: 5, bladder: 5, fatigue: 4, cognition: 5 }, adlScore: 8 },
      { date: "2026-10-12", edssScore: 4.7, edssDomains: { walking: 5, hand: 5, vision: 5, bladder: 5, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-10-19", edssScore: 4.6, edssDomains: { walking: 5, hand: 5, vision: 5, bladder: 5, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-10-26", edssScore: 4.8, edssDomains: { walking: 5, hand: 5, vision: 5, bladder: 5, fatigue: 5, cognition: 4 }, adlScore: 8 }
    ],
    vitals: [
      { date: "2026-09-07", systolic: 116, diastolic: 74, heartRate: 68, weight: 54, temperature: 98.4, bloodSugar: 92, spo2: 99 },
      { date: "2026-09-14", systolic: 118, diastolic: 76, heartRate: 70, weight: 54, temperature: 98.2, bloodSugar: 94, spo2: 99 },
      { date: "2026-09-21", systolic: 115, diastolic: 75, heartRate: 68, weight: 54.2, temperature: 98.4, bloodSugar: 90, spo2: 98 },
      { date: "2026-09-28", systolic: 117, diastolic: 74, heartRate: 72, weight: 54.1, temperature: 98.3, bloodSugar: 93, spo2: 99 },
      { date: "2026-10-05", systolic: 116, diastolic: 76, heartRate: 70, weight: 54.3, temperature: 98.5, bloodSugar: 91, spo2: 99 },
      { date: "2026-10-12", systolic: 118, diastolic: 75, heartRate: 69, weight: 54.2, temperature: 98.4, bloodSugar: 95, spo2: 99 },
      { date: "2026-10-19", systolic: 117, diastolic: 74, heartRate: 71, weight: 54.4, temperature: 98.3, bloodSugar: 92, spo2: 98 },
      { date: "2026-10-26", systolic: 116, diastolic: 76, heartRate: 70, weight: 54.5, temperature: 98.4, bloodSugar: 94, spo2: 99 }
    ],
    medications: [
      { id: "m6", name: "Glatiramer Acetate", dosage: "20mg", frequency: "Once daily", times: ["Morning"], prescribingDoctor: "Safdarjung Neuro Dept" }
    ],
    adherenceWeekly: [95, 96, 94, 95, 95, 94, 96, 95],
    adherenceMissReasons: { "Forgot": 2 },
    sideEffects: [],
    phq2: { date: "2026-10-26", q1: 0, q2: 1, total: 1 }
  },
  {
    id: "NS-004",
    firstName: "Ankit",
    age: 27,
    gender: "Male",
    condition: "Epilepsy",
    state: "Uttar Pradesh",
    language: "Hindi",
    registeredDate: "2026-09-03",
    healthWorkerId: "ASHA-UP-08",
    abhaId: "91-7291-3482-1904",
    pmjayId: "PMJAY-UP-2024-3329",
    schemeEligibility: "Ayushman Bharat PM-JAY (BPL Cardholder)",
    bplStatus: "BPL Cardholder (Uttar Pradesh Antyodaya)",
    followUp: {
      visitConfirmed: true,
      reminderDate: "2026-11-12",
      notes: "Regular anti-seizure medication adherence confirmed. No events reported."
    },
    assessments: [
      { date: "2026-09-09", motor: { leftTaps: 48, rightTaps: 50, lrDiff: 2 }, processing: { correct: 26, avgReactionMs: 1020 }, speech: { recorded: true, durationSec: 6.5 }, symptoms: { fatigue: 4, balance: 5, vision: 5, mood: 4 } },
      { date: "2026-09-16", motor: { leftTaps: 47, rightTaps: 51, lrDiff: 4 }, processing: { correct: 26, avgReactionMs: 1010 }, speech: { recorded: true, durationSec: 6.4 }, symptoms: { fatigue: 4, balance: 5, vision: 5, mood: 4 } },
      { date: "2026-09-23", motor: { leftTaps: 48, rightTaps: 49, lrDiff: 1 }, processing: { correct: 25, avgReactionMs: 1030 }, speech: { recorded: true, durationSec: 6.6 }, symptoms: { fatigue: 4, balance: 4, vision: 5, mood: 4 } },
      { date: "2026-09-30", motor: { leftTaps: 49, rightTaps: 50, lrDiff: 1 }, processing: { correct: 27, avgReactionMs: 990 }, speech: { recorded: true, durationSec: 6.3 }, symptoms: { fatigue: 5, balance: 5, vision: 5, mood: 5 } },
      { date: "2026-10-07", motor: { leftTaps: 48, rightTaps: 51, lrDiff: 3 }, processing: { correct: 26, avgReactionMs: 1010 }, speech: { recorded: true, durationSec: 6.5 }, symptoms: { fatigue: 4, balance: 5, vision: 5, mood: 4 } },
      { date: "2026-10-14", motor: { leftTaps: 47, rightTaps: 49, lrDiff: 2 }, processing: { correct: 25, avgReactionMs: 1040 }, speech: { recorded: true, durationSec: 6.6 }, symptoms: { fatigue: 4, balance: 4, vision: 5, mood: 4 } },
      { date: "2026-10-21", motor: { leftTaps: 49, rightTaps: 52, lrDiff: 3 }, processing: { correct: 26, avgReactionMs: 1020 }, speech: { recorded: true, durationSec: 6.4 }, symptoms: { fatigue: 4, balance: 5, vision: 5, mood: 5 } },
      { date: "2026-10-28", motor: { leftTaps: 48, rightTaps: 50, lrDiff: 2 }, processing: { correct: 26, avgReactionMs: 1010 }, speech: { recorded: true, durationSec: 6.5 }, symptoms: { fatigue: 4, balance: 5, vision: 5, mood: 4 } }
    ],
    clinicalScales: [
      { date: "2026-09-09", seizureImpact: 4.2, adlScore: 8 },
      { date: "2026-09-16", seizureImpact: 4.4, adlScore: 8 },
      { date: "2026-09-23", seizureImpact: 4.2, adlScore: 8 },
      { date: "2026-09-30", seizureImpact: 4.6, adlScore: 8 },
      { date: "2026-10-07", seizureImpact: 4.4, adlScore: 8 },
      { date: "2026-10-14", seizureImpact: 4.2, adlScore: 8 },
      { date: "2026-10-21", seizureImpact: 4.6, adlScore: 8 },
      { date: "2026-10-28", seizureImpact: 4.4, adlScore: 8 }
    ],
    vitals: [
      { date: "2026-09-09", systolic: 118, diastolic: 76, heartRate: 72, weight: 64, temperature: 98.4, bloodSugar: 96, spo2: 99 },
      { date: "2026-09-16", systolic: 120, diastolic: 78, heartRate: 70, weight: 64.2, temperature: 98.3, bloodSugar: 98, spo2: 99 },
      { date: "2026-09-23", systolic: 118, diastolic: 76, heartRate: 74, weight: 64.5, temperature: 98.5, bloodSugar: 95, spo2: 98 },
      { date: "2026-09-30", systolic: 121, diastolic: 77, heartRate: 72, weight: 64.3, temperature: 98.4, bloodSugar: 97, spo2: 99 },
      { date: "2026-10-07", systolic: 119, diastolic: 75, heartRate: 71, weight: 64.6, temperature: 98.2, bloodSugar: 94, spo2: 99 },
      { date: "2026-10-14", systolic: 120, diastolic: 78, heartRate: 73, weight: 64.4, temperature: 98.4, bloodSugar: 99, spo2: 98 },
      { date: "2026-10-21", systolic: 118, diastolic: 76, heartRate: 70, weight: 64.7, temperature: 98.5, bloodSugar: 96, spo2: 99 },
      { date: "2026-10-28", systolic: 120, diastolic: 77, heartRate: 72, weight: 64.5, temperature: 98.3, bloodSugar: 98, spo2: 99 }
    ],
    medications: [
      { id: "m7", name: "Levetiracetam", dosage: "500mg", frequency: "Twice daily", times: ["Morning", "Night"], prescribingDoctor: "District Hospital Gorakhpur" }
    ],
    adherenceWeekly: [96, 95, 96, 97, 95, 94, 96, 96],
    adherenceMissReasons: { "Forgot": 1 },
    sideEffects: [],
    phq2: { date: "2026-10-28", q1: 0, q2: 0, total: 0 },
    // Preloaded seizure diary: well-controlled, 2 events over 8 weeks
    seizureDiary: [
      { id: "sz1", date: "2026-09-18", timeOfDay: "Night", duration: "1-3 minutes", type: "Whole body shaking (tonic-clonic/grand mal)", consciousnessLost: "Yes", triggers: ["Poor sleep / sleep deprivation"], recoveryTime: "10-30 min", injured: "No", notes: "Occurred during late exam study" },
      { id: "sz2", date: "2026-10-15", timeOfDay: "Morning", duration: "Less than 1 minute", type: "Brief staring/blank spell (absence)", consciousnessLost: "Not sure", triggers: ["Missed medication"], recoveryTime: "Less than 10 min", injured: "No", notes: "Missed previous night dose" }
    ]
  },
  {
    id: "NS-005",
    firstName: "Fatima",
    age: 41,
    gender: "Female",
    condition: "Epilepsy",
    state: "Telangana",
    language: "Urdu",
    registeredDate: "2026-09-04",
    healthWorkerId: "ASHA-TS-04",
    abhaId: "91-5582-9912-3401",
    pmjayId: "PMJAY-TS-2024-7714",
    schemeEligibility: "Aarogyasri Health Care Trust & PM-JAY",
    bplStatus: "BPL Cardholder (Telangana White Card)",
    followUp: {
      visitConfirmed: true,
      reminderDate: "2026-11-20",
      notes: "Blood levels reviewed at Osmania General Hospital. Stable."
    },
    assessments: [
      { date: "2026-09-10", motor: { leftTaps: 42, rightTaps: 44, lrDiff: 2 }, processing: { correct: 22, avgReactionMs: 1150 }, speech: { recorded: true, durationSec: 7.0 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-09-17", motor: { leftTaps: 41, rightTaps: 43, lrDiff: 2 }, processing: { correct: 23, avgReactionMs: 1130 }, speech: { recorded: true, durationSec: 7.1 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-09-24", motor: { leftTaps: 43, rightTaps: 45, lrDiff: 2 }, processing: { correct: 22, avgReactionMs: 1160 }, speech: { recorded: true, durationSec: 7.0 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 3 } },
      { date: "2026-10-01", motor: { leftTaps: 42, rightTaps: 44, lrDiff: 2 }, processing: { correct: 21, avgReactionMs: 1170 }, speech: { recorded: true, durationSec: 7.2 }, symptoms: { fatigue: 3, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-08", motor: { leftTaps: 43, rightTaps: 45, lrDiff: 2 }, processing: { correct: 23, avgReactionMs: 1140 }, speech: { recorded: true, durationSec: 6.9 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-15", motor: { leftTaps: 41, rightTaps: 44, lrDiff: 3 }, processing: { correct: 22, avgReactionMs: 1160 }, speech: { recorded: true, durationSec: 7.1 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-22", motor: { leftTaps: 42, rightTaps: 44, lrDiff: 2 }, processing: { correct: 22, avgReactionMs: 1150 }, speech: { recorded: true, durationSec: 7.0 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-29", motor: { leftTaps: 43, rightTaps: 45, lrDiff: 2 }, processing: { correct: 23, avgReactionMs: 1130 }, speech: { recorded: true, durationSec: 6.9 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } }
    ],
    clinicalScales: [
      { date: "2026-09-10", seizureImpact: 3.8, adlScore: 8 },
      { date: "2026-09-17", seizureImpact: 3.9, adlScore: 8 },
      { date: "2026-09-24", seizureImpact: 3.7, adlScore: 8 },
      { date: "2026-10-01", seizureImpact: 3.8, adlScore: 8 },
      { date: "2026-10-08", seizureImpact: 3.9, adlScore: 8 },
      { date: "2026-10-15", seizureImpact: 3.8, adlScore: 8 },
      { date: "2026-10-22", seizureImpact: 3.8, adlScore: 8 },
      { date: "2026-10-29", seizureImpact: 3.9, adlScore: 8 }
    ],
    vitals: [
      { date: "2026-09-10", systolic: 124, diastolic: 80, heartRate: 74, weight: 58, temperature: 98.4, bloodSugar: 104, spo2: 98 },
      { date: "2026-09-17", systolic: 122, diastolic: 79, heartRate: 76, weight: 58.1, temperature: 98.3, bloodSugar: 106, spo2: 98 },
      { date: "2026-09-24", systolic: 125, diastolic: 81, heartRate: 75, weight: 58.3, temperature: 98.5, bloodSugar: 108, spo2: 97 },
      { date: "2026-10-01", systolic: 123, diastolic: 80, heartRate: 73, weight: 58.2, temperature: 98.4, bloodSugar: 105, spo2: 98 },
      { date: "2026-10-08", systolic: 124, diastolic: 82, heartRate: 77, weight: 58.4, temperature: 98.6, bloodSugar: 107, spo2: 98 },
      { date: "2026-10-15", systolic: 122, diastolic: 79, heartRate: 74, weight: 58.3, temperature: 98.5, bloodSugar: 104, spo2: 98 },
      { date: "2026-10-22", systolic: 125, diastolic: 81, heartRate: 76, weight: 58.5, temperature: 98.4, bloodSugar: 109, spo2: 97 },
      { date: "2026-10-29", systolic: 123, diastolic: 80, heartRate: 75, weight: 58.4, temperature: 98.3, bloodSugar: 106, spo2: 98 }
    ],
    medications: [
      { id: "m8", name: "Sodium Valproate", dosage: "300mg", frequency: "Twice daily", times: ["Morning", "Night"], prescribingDoctor: "Osmania Neuro OPD" },
      { id: "m9", name: "Clobazam", dosage: "5mg", frequency: "Once daily", times: ["Night"], prescribingDoctor: "Osmania Neuro OPD" }
    ],
    adherenceWeekly: [90, 89, 91, 88, 90, 89, 91, 90],
    adherenceMissReasons: { "Forgot": 3, "Ran out": 1 },
    sideEffects: [
      { id: "se4", date: "2026-10-02", effect: "Mild drowsiness in morning", severity: "Mild", medication: "Clobazam" }
    ],
    phq2: { date: "2026-10-29", q1: 1, q2: 0, total: 1 },
    // Preloaded seizure diary: 4 events over 8 weeks
    seizureDiary: [
      { id: "sz3", date: "2026-09-12", timeOfDay: "Afternoon", duration: "1-3 minutes", type: "Whole body shaking (tonic-clonic/grand mal)", consciousnessLost: "Yes", triggers: ["Stress / emotional upset"], recoveryTime: "30-60 min", injured: "No", notes: "Recovered at home" },
      { id: "sz4", date: "2026-09-27", timeOfDay: "Morning", duration: "Less than 1 minute", type: "One side of body jerking (focal)", consciousnessLost: "No", triggers: ["Menstrual period"], recoveryTime: "Less than 10 min", injured: "No", notes: "Catamenial exacerbation noted" },
      { id: "sz5", date: "2026-10-10", timeOfDay: "Night", duration: "1-3 minutes", type: "Whole body shaking (tonic-clonic/grand mal)", consciousnessLost: "Yes", triggers: ["Poor sleep / sleep deprivation"], recoveryTime: "10-30 min", injured: "No", notes: "Woke family during sleep" },
      { id: "sz6", date: "2026-10-24", timeOfDay: "Evening", duration: "Less than 1 minute", type: "Strange sensation/aura only", consciousnessLost: "No", triggers: ["Stress / emotional upset"], recoveryTime: "Less than 10 min", injured: "No", notes: "Felt epigastric rising sensation" }
    ]
  },
  {
    id: "NS-006",
    firstName: "Suresh",
    age: 63,
    gender: "Male",
    condition: "Stroke",
    state: "Karnataka",
    language: "English",
    registeredDate: "2026-09-05",
    healthWorkerId: "ASHA-KA-07",
    abhaId: "91-8841-2093-6712",
    pmjayId: "PMJAY-KA-2024-5510",
    schemeEligibility: "Ayushman Bharat-Arogya Karnataka (AB-ArK)",
    bplStatus: "BPL BPL-PHH Category Card",
    followUp: {
      visitConfirmed: false,
      reminderDate: "2026-11-04",
      notes: "Post-rehabilitation review pending with community physiotherapist."
    },
    assessments: [
      { date: "2026-09-11", motor: { leftTaps: 36, rightTaps: 44, lrDiff: 8 }, processing: { correct: 19, avgReactionMs: 1280 }, speech: { recorded: true, durationSec: 8.2 }, symptoms: { fatigue: 3, balance: 3, vision: 4, mood: 4 } },
      { date: "2026-09-18", motor: { leftTaps: 37, rightTaps: 45, lrDiff: 8 }, processing: { correct: 20, avgReactionMs: 1260 }, speech: { recorded: true, durationSec: 8.0 }, symptoms: { fatigue: 3, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-09-25", motor: { leftTaps: 36, rightTaps: 44, lrDiff: 8 }, processing: { correct: 19, avgReactionMs: 1290 }, speech: { recorded: true, durationSec: 8.3 }, symptoms: { fatigue: 3, balance: 3, vision: 4, mood: 3 } },
      { date: "2026-10-02", motor: { leftTaps: 37, rightTaps: 46, lrDiff: 9 }, processing: { correct: 20, avgReactionMs: 1250 }, speech: { recorded: true, durationSec: 8.1 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-09", motor: { leftTaps: 38, rightTaps: 46, lrDiff: 8 }, processing: { correct: 20, avgReactionMs: 1240 }, speech: { recorded: true, durationSec: 8.0 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-16", motor: { leftTaps: 36, rightTaps: 45, lrDiff: 9 }, processing: { correct: 19, avgReactionMs: 1270 }, speech: { recorded: true, durationSec: 8.2 }, symptoms: { fatigue: 3, balance: 3, vision: 4, mood: 4 } },
      { date: "2026-10-23", motor: { leftTaps: 37, rightTaps: 45, lrDiff: 8 }, processing: { correct: 19, avgReactionMs: 1270 }, speech: { recorded: true, durationSec: 8.1 }, symptoms: { fatigue: 3, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-30", motor: { leftTaps: 37, rightTaps: 46, lrDiff: 9 }, processing: { correct: 20, avgReactionMs: 1260 }, speech: { recorded: true, durationSec: 8.0 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } }
    ],
    clinicalScales: [
      { date: "2026-09-11", mrsScore: 2, adlScore: 7 },
      { date: "2026-09-18", mrsScore: 2, adlScore: 7 },
      { date: "2026-09-25", mrsScore: 2, adlScore: 7 },
      { date: "2026-10-02", mrsScore: 2, adlScore: 7 },
      { date: "2026-10-09", mrsScore: 2, adlScore: 7 },
      { date: "2026-10-16", mrsScore: 2, adlScore: 7 },
      { date: "2026-10-23", mrsScore: 2, adlScore: 7 },
      { date: "2026-10-30", mrsScore: 2, adlScore: 7 }
    ],
    vitals: [
      { date: "2026-09-11", systolic: 128, diastolic: 82, heartRate: 70, weight: 72, temperature: 98.4, bloodSugar: 116, spo2: 97 },
      { date: "2026-09-18", systolic: 126, diastolic: 80, heartRate: 72, weight: 72.1, temperature: 98.3, bloodSugar: 114, spo2: 98 },
      { date: "2026-09-25", systolic: 127, diastolic: 81, heartRate: 71, weight: 72.3, temperature: 98.5, bloodSugar: 118, spo2: 97 },
      { date: "2026-10-02", systolic: 129, diastolic: 82, heartRate: 73, weight: 72.2, temperature: 98.4, bloodSugar: 115, spo2: 97 },
      { date: "2026-10-09", systolic: 128, diastolic: 80, heartRate: 70, weight: 72.4, temperature: 98.5, bloodSugar: 116, spo2: 98 },
      { date: "2026-10-16", systolic: 126, diastolic: 82, heartRate: 72, weight: 72.3, temperature: 98.3, bloodSugar: 114, spo2: 97 },
      { date: "2026-10-23", systolic: 128, diastolic: 81, heartRate: 71, weight: 72.5, temperature: 98.4, bloodSugar: 117, spo2: 97 },
      { date: "2026-10-30", systolic: 127, diastolic: 80, heartRate: 72, weight: 72.4, temperature: 98.5, bloodSugar: 115, spo2: 98 }
    ],
    medications: [
      { id: "m10", name: "Clopidogrel", dosage: "75mg", frequency: "Once daily", times: ["Morning"], prescribingDoctor: "Victoria Hospital Bengaluru" },
      { id: "m11", name: "Atorvastatin", dosage: "10mg", frequency: "Once daily", times: ["Night"], prescribingDoctor: "Victoria Hospital" }
    ],
    adherenceWeekly: [92, 90, 91, 93, 91, 90, 92, 91],
    adherenceMissReasons: { "Forgot": 2 },
    sideEffects: [],
    phq2: { date: "2026-10-30", q1: 1, q2: 0, total: 1 }
  },
  {
    id: "NS-007",
    firstName: "Meena",
    age: 39,
    gender: "Female",
    condition: "MS",
    state: "Tamil Nadu",
    language: "English",
    registeredDate: "2026-09-06",
    healthWorkerId: "ASHA-TN-03",
    abhaId: "91-2948-5510-9923",
    pmjayId: "PMJAY-TN-2024-1184",
    schemeEligibility: "Chief Minister's Comprehensive Health Insurance (CMCHIS)",
    bplStatus: "BPL Eligible (Rice Card)",
    followUp: {
      visitConfirmed: true,
      reminderDate: "2026-11-25",
      notes: "Annual MRI scheduled at Rajiv Gandhi Government General Hospital."
    },
    assessments: [
      { date: "2026-09-12", motor: { leftTaps: 43, rightTaps: 45, lrDiff: 2 }, processing: { correct: 23, avgReactionMs: 1110 }, speech: { recorded: true, durationSec: 7.1 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-09-19", motor: { leftTaps: 44, rightTaps: 46, lrDiff: 2 }, processing: { correct: 24, avgReactionMs: 1090 }, speech: { recorded: true, durationSec: 7.0 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-09-26", motor: { leftTaps: 42, rightTaps: 44, lrDiff: 2 }, processing: { correct: 23, avgReactionMs: 1120 }, speech: { recorded: true, durationSec: 7.2 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-03", motor: { leftTaps: 44, rightTaps: 45, lrDiff: 1 }, processing: { correct: 24, avgReactionMs: 1100 }, speech: { recorded: true, durationSec: 7.0 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-10", motor: { leftTaps: 43, rightTaps: 46, lrDiff: 3 }, processing: { correct: 23, avgReactionMs: 1110 }, speech: { recorded: true, durationSec: 7.1 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-17", motor: { leftTaps: 43, rightTaps: 45, lrDiff: 2 }, processing: { correct: 24, avgReactionMs: 1100 }, speech: { recorded: true, durationSec: 7.0 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-24", motor: { leftTaps: 44, rightTaps: 46, lrDiff: 2 }, processing: { correct: 23, avgReactionMs: 1110 }, speech: { recorded: true, durationSec: 7.1 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } },
      { date: "2026-10-31", motor: { leftTaps: 43, rightTaps: 45, lrDiff: 2 }, processing: { correct: 24, avgReactionMs: 1090 }, speech: { recorded: true, durationSec: 7.0 }, symptoms: { fatigue: 4, balance: 4, vision: 4, mood: 4 } }
    ],
    clinicalScales: [
      { date: "2026-09-12", edssScore: 4.4, edssDomains: { walking: 4, hand: 5, vision: 5, bladder: 4, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-09-19", edssScore: 4.5, edssDomains: { walking: 5, hand: 5, vision: 5, bladder: 4, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-09-26", edssScore: 4.3, edssDomains: { walking: 4, hand: 5, vision: 4, bladder: 4, fatigue: 4, cognition: 5 }, adlScore: 8 },
      { date: "2026-10-03", edssScore: 4.5, edssDomains: { walking: 5, hand: 5, vision: 5, bladder: 4, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-10-10", edssScore: 4.4, edssDomains: { walking: 4, hand: 5, vision: 5, bladder: 4, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-10-17", edssScore: 4.5, edssDomains: { walking: 5, hand: 5, vision: 5, bladder: 4, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-10-24", edssScore: 4.4, edssDomains: { walking: 4, hand: 5, vision: 5, bladder: 4, fatigue: 4, cognition: 4 }, adlScore: 8 },
      { date: "2026-10-31", edssScore: 4.5, edssDomains: { walking: 5, hand: 5, vision: 5, bladder: 4, fatigue: 4, cognition: 5 }, adlScore: 8 }
    ],
    vitals: [
      { date: "2026-09-12", systolic: 114, diastolic: 72, heartRate: 68, weight: 52, temperature: 98.4, bloodSugar: 90, spo2: 99 },
      { date: "2026-09-19", systolic: 116, diastolic: 74, heartRate: 70, weight: 52.2, temperature: 98.2, bloodSugar: 92, spo2: 99 },
      { date: "2026-09-26", systolic: 115, diastolic: 73, heartRate: 69, weight: 52.1, temperature: 98.5, bloodSugar: 89, spo2: 98 },
      { date: "2026-10-03", systolic: 116, diastolic: 74, heartRate: 71, weight: 52.3, temperature: 98.3, bloodSugar: 91, spo2: 99 },
      { date: "2026-10-10", systolic: 115, diastolic: 72, heartRate: 70, weight: 52.2, temperature: 98.4, bloodSugar: 93, spo2: 99 },
      { date: "2026-10-17", systolic: 117, diastolic: 75, heartRate: 69, weight: 52.4, temperature: 98.5, bloodSugar: 90, spo2: 98 },
      { date: "2026-10-24", systolic: 116, diastolic: 73, heartRate: 71, weight: 52.3, temperature: 98.4, bloodSugar: 92, spo2: 99 },
      { date: "2026-10-31", systolic: 115, diastolic: 74, heartRate: 70, weight: 52.5, temperature: 98.3, bloodSugar: 91, spo2: 99 }
    ],
    medications: [
      { id: "m12", name: "Fingolimod", dosage: "0.5mg", frequency: "Once daily", times: ["Morning"], prescribingDoctor: "Madras Medical College" }
    ],
    adherenceWeekly: [94, 93, 95, 96, 94, 95, 93, 95],
    adherenceMissReasons: { "Forgot": 2 },
    sideEffects: [],
    phq2: { date: "2026-10-31", q1: 0, q2: 0, total: 0 }
  },
  {
    id: "NS-008",
    firstName: "Arjun",
    age: 22,
    gender: "Male",
    condition: "Epilepsy",
    state: "Delhi",
    language: "Hindi",
    registeredDate: "2026-09-07",
    healthWorkerId: "ASHA-DL-02",
    abhaId: "91-1029-4821-6634",
    pmjayId: "PMJAY-DL-2024-9021",
    schemeEligibility: "Ayushman Bharat PM-JAY Eligible (Delhi)",
    bplStatus: "BPL Eligible",
    followUp: {
      visitConfirmed: true,
      reminderDate: "2026-11-15",
      notes: "Follow-up at AIIMS neuro clinic completed. Medication refilled via Jan Aushadhi."
    },
    assessments: [
      { date: "2026-09-13", motor: { leftTaps: 51, rightTaps: 53, lrDiff: 2 }, processing: { correct: 27, avgReactionMs: 960 }, speech: { recorded: true, durationSec: 6.2 }, symptoms: { fatigue: 5, balance: 5, vision: 5, mood: 5 } },
      { date: "2026-09-20", motor: { leftTaps: 50, rightTaps: 52, lrDiff: 2 }, processing: { correct: 28, avgReactionMs: 950 }, speech: { recorded: true, durationSec: 6.1 }, symptoms: { fatigue: 5, balance: 5, vision: 5, mood: 5 } },
      { date: "2026-09-27", motor: { leftTaps: 52, rightTaps: 54, lrDiff: 2 }, processing: { correct: 27, avgReactionMs: 970 }, speech: { recorded: true, durationSec: 6.3 }, symptoms: { fatigue: 4, balance: 5, vision: 5, mood: 4 } },
      { date: "2026-10-04", motor: { leftTaps: 51, rightTaps: 53, lrDiff: 2 }, processing: { correct: 28, avgReactionMs: 950 }, speech: { recorded: true, durationSec: 6.2 }, symptoms: { fatigue: 5, balance: 5, vision: 5, mood: 5 } },
      { date: "2026-10-11", motor: { leftTaps: 50, rightTaps: 52, lrDiff: 2 }, processing: { correct: 27, avgReactionMs: 960 }, speech: { recorded: true, durationSec: 6.2 }, symptoms: { fatigue: 4, balance: 5, vision: 5, mood: 4 } },
      { date: "2026-10-18", motor: { leftTaps: 51, rightTaps: 53, lrDiff: 2 }, processing: { correct: 28, avgReactionMs: 940 }, speech: { recorded: true, durationSec: 6.1 }, symptoms: { fatigue: 5, balance: 5, vision: 5, mood: 5 } },
      { date: "2026-10-25", motor: { leftTaps: 52, rightTaps: 54, lrDiff: 2 }, processing: { correct: 27, avgReactionMs: 960 }, speech: { recorded: true, durationSec: 6.3 }, symptoms: { fatigue: 4, balance: 5, vision: 5, mood: 5 } },
      { date: "2026-11-01", motor: { leftTaps: 51, rightTaps: 53, lrDiff: 2 }, processing: { correct: 28, avgReactionMs: 950 }, speech: { recorded: true, durationSec: 6.2 }, symptoms: { fatigue: 5, balance: 5, vision: 5, mood: 5 } }
    ],
    clinicalScales: [
      { date: "2026-09-13", seizureImpact: 4.8, adlScore: 8 },
      { date: "2026-09-20", seizureImpact: 4.9, adlScore: 8 },
      { date: "2026-09-27", seizureImpact: 4.7, adlScore: 8 },
      { date: "2026-10-04", seizureImpact: 4.8, adlScore: 8 },
      { date: "2026-10-11", seizureImpact: 4.9, adlScore: 8 },
      { date: "2026-10-18", seizureImpact: 4.8, adlScore: 8 },
      { date: "2026-10-25", seizureImpact: 4.9, adlScore: 8 },
      { date: "2026-11-01", seizureImpact: 4.8, adlScore: 8 }
    ],
    vitals: [
      { date: "2026-09-13", systolic: 118, diastolic: 76, heartRate: 68, weight: 66, temperature: 98.4, bloodSugar: 92, spo2: 99 },
      { date: "2026-09-20", systolic: 120, diastolic: 78, heartRate: 70, weight: 66.2, temperature: 98.3, bloodSugar: 94, spo2: 99 },
      { date: "2026-09-27", systolic: 119, diastolic: 77, heartRate: 69, weight: 66.1, temperature: 98.5, bloodSugar: 93, spo2: 99 },
      { date: "2026-10-04", systolic: 121, diastolic: 78, heartRate: 71, weight: 66.3, temperature: 98.4, bloodSugar: 95, spo2: 99 },
      { date: "2026-10-11", systolic: 118, diastolic: 76, heartRate: 70, weight: 66.2, temperature: 98.2, bloodSugar: 92, spo2: 99 },
      { date: "2026-10-18", systolic: 120, diastolic: 78, heartRate: 72, weight: 66.4, temperature: 98.5, bloodSugar: 94, spo2: 99 },
      { date: "2026-10-25", systolic: 119, diastolic: 77, heartRate: 70, weight: 66.3, temperature: 98.4, bloodSugar: 93, spo2: 99 },
      { date: "2026-11-01", systolic: 120, diastolic: 78, heartRate: 71, weight: 66.5, temperature: 98.3, bloodSugar: 95, spo2: 99 }
    ],
    medications: [
      { id: "m13", name: "Carbamazepine", dosage: "200mg", frequency: "Twice daily", times: ["Morning", "Night"], prescribingDoctor: "AIIMS New Delhi" }
    ],
    adherenceWeekly: [97, 98, 96, 97, 98, 97, 98, 98],
    adherenceMissReasons: { "Forgot": 1 },
    sideEffects: [],
    phq2: { date: "2026-11-01", q1: 0, q2: 0, total: 0 },
    // Preloaded seizure diary: 1 event over 8 weeks
    seizureDiary: [
      { id: "sz7", date: "2026-09-25", timeOfDay: "Night", duration: "1-3 minutes", type: "Whole body shaking (tonic-clonic/grand mal)", consciousnessLost: "Yes", triggers: ["Illness / fever"], recoveryTime: "10-30 min", injured: "No", notes: "Mild viral fever precipitating episode" }
    ]
  },
  {
    id: "NS-009",
    firstName: "Ramesh",
    age: 62,
    gender: "Male",
    condition: "Parkinson's",
    state: "Karnataka",
    language: "English",
    registeredDate: "2026-09-08",
    healthWorkerId: "ASHA-KA-07",
    abhaId: "91-7739-1204-8845",
    pmjayId: "PMJAY-KA-2024-8832",
    schemeEligibility: "Ayushman Bharat-Arogya Karnataka (BPL Eligible)",
    bplStatus: "BPL Antyodaya Cardholder",
    followUp: {
      visitConfirmed: false,
      reminderDate: "2026-11-06",
      notes: "Follow-up due. ASHA worker notified regarding recent motor slowing and stiffness."
    },
    assessments: [
      { date: "2026-09-14", motor: { leftTaps: 36, rightTaps: 40, lrDiff: 4, slowingDetected: false }, processing: { correct: 20, avgReactionMs: 1250 }, speech: { recorded: true, durationSec: 7.8 }, symptoms: { fatigue: 3, balance: 3, vision: 4, mood: 4 } },
      { date: "2026-09-21", motor: { leftTaps: 35, rightTaps: 39, lrDiff: 4, slowingDetected: false }, processing: { correct: 20, avgReactionMs: 1260 }, speech: { recorded: true, durationSec: 7.9 }, symptoms: { fatigue: 3, balance: 3, vision: 4, mood: 4 } },
      { date: "2026-09-28", motor: { leftTaps: 36, rightTaps: 40, lrDiff: 4, slowingDetected: false }, processing: { correct: 19, avgReactionMs: 1280 }, speech: { recorded: true, durationSec: 8.0 }, symptoms: { fatigue: 3, balance: 3, vision: 4, mood: 3 } },
      { date: "2026-10-05", motor: { leftTaps: 33, rightTaps: 37, lrDiff: 4, slowingDetected: false }, processing: { correct: 18, avgReactionMs: 1320 }, speech: { recorded: true, durationSec: 8.2 }, symptoms: { fatigue: 3, balance: 2, vision: 4, mood: 3 } },
      { date: "2026-10-12", motor: { leftTaps: 30, rightTaps: 34, lrDiff: 4, slowingDetected: true }, processing: { correct: 17, avgReactionMs: 1380 }, speech: { recorded: true, durationSec: 8.5 }, symptoms: { fatigue: 2, balance: 2, vision: 3, mood: 3 } },
      { date: "2026-10-19", motor: { leftTaps: 26, rightTaps: 29, lrDiff: 3, slowingDetected: true }, processing: { correct: 15, avgReactionMs: 1460 }, speech: { recorded: true, durationSec: 9.0 }, symptoms: { fatigue: 2, balance: 2, vision: 3, mood: 2 } },
      { date: "2026-10-26", motor: { leftTaps: 24, rightTaps: 27, lrDiff: 3, slowingDetected: true }, processing: { correct: 14, avgReactionMs: 1520 }, speech: { recorded: true, durationSec: 9.3 }, symptoms: { fatigue: 2, balance: 1, vision: 3, mood: 2 } },
      { date: "2026-11-02", motor: { leftTaps: 23, rightTaps: 26, lrDiff: 3, slowingDetected: true }, processing: { correct: 14, avgReactionMs: 1540 }, speech: { recorded: true, durationSec: 9.5 }, symptoms: { fatigue: 2, balance: 1, vision: 3, mood: 2 } }
    ],
    clinicalScales: [
      { date: "2026-09-14", updrsMotor: 2.2, adlScore: 8 },
      { date: "2026-09-21", updrsMotor: 2.3, adlScore: 8 },
      { date: "2026-09-28", updrsMotor: 2.3, adlScore: 7 },
      { date: "2026-10-05", updrsMotor: 2.6, adlScore: 7 },
      { date: "2026-10-12", updrsMotor: 2.9, adlScore: 6 },
      { date: "2026-10-19", updrsMotor: 3.3, adlScore: 5 },
      { date: "2026-10-26", updrsMotor: 3.6, adlScore: 5 },
      { date: "2026-11-02", updrsMotor: 3.8, adlScore: 4 }
    ],
    vitals: [
      { date: "2026-09-14", systolic: 124, diastolic: 80, heartRate: 72, weight: 62, temperature: 98.4, bloodSugar: 108, spo2: 98 },
      { date: "2026-09-21", systolic: 122, diastolic: 78, heartRate: 74, weight: 61.8, temperature: 98.2, bloodSugar: 110, spo2: 98 },
      { date: "2026-09-28", systolic: 126, diastolic: 82, heartRate: 76, weight: 61.5, temperature: 98.5, bloodSugar: 112, spo2: 97 },
      { date: "2026-10-05", systolic: 125, diastolic: 80, heartRate: 75, weight: 61.2, temperature: 98.3, bloodSugar: 114, spo2: 98 },
      { date: "2026-10-12", systolic: 128, diastolic: 82, heartRate: 78, weight: 60.8, temperature: 98.6, bloodSugar: 118, spo2: 97 },
      { date: "2026-10-19", systolic: 126, diastolic: 80, heartRate: 76, weight: 60.4, temperature: 98.4, bloodSugar: 116, spo2: 97 },
      { date: "2026-10-26", systolic: 130, diastolic: 84, heartRate: 80, weight: 59.9, temperature: 98.5, bloodSugar: 120, spo2: 96 },
      { date: "2026-11-02", systolic: 128, diastolic: 82, heartRate: 78, weight: 59.5, temperature: 98.4, bloodSugar: 122, spo2: 97 }
    ],
    medications: [
      { id: "m14", name: "Levodopa / Carbidopa", dosage: "100/25mg", frequency: "Three times daily", times: ["Morning", "Afternoon", "Night"], prescribingDoctor: "NIMHANS Bengaluru" },
      { id: "m15", name: "Trihexyphenidyl", dosage: "2mg", frequency: "Twice daily", times: ["Morning", "Night"], prescribingDoctor: "NIMHANS Bengaluru" }
    ],
    adherenceWeekly: [94, 92, 90, 86, 82, 78, 75, 72],
    adherenceMissReasons: { "Forgot timing / on-off motor difficulty": 5, "Nausea": 2 },
    sideEffects: [
      { id: "se5", date: "2026-10-20", effect: "Postural dizziness / lightheadedness", severity: "Moderate", medication: "Levodopa / Carbidopa" }
    ],
    phq2: { date: "2026-11-02", q1: 1, q2: 1, total: 2 }
  }
];
