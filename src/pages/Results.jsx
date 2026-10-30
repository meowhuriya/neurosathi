import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { Sliders, AlertTriangle, CheckCircle2, ArrowRight, Phone, ExternalLink } from 'lucide-react';
import { calculatePatientMetrics, calculateBaseline } from '../utils/scoring';
import { useDeclineDetection } from '../hooks/useDeclineDetection';
import { ListenButton } from '../components/ListenButton';
import { TakeAMomentCard } from '../components/TakeAMomentCard';

// CLINICAL THRESHOLD: Decline flagged when 3-week rolling average drops >threshold below baseline on ≥2 measures. Configurable by clinical advisor. Not clinically validated.

const QUESTIONS_DISPLAY = [
  { key: 'q1', text: "New or worsening weakness, drowsiness, or confusion", isUrgent: true },
  { key: 'q2', text: "Trouble swallowing or choking", isUrgent: true },
  { key: 'q3', text: "Fever or chest infection signs", isUrgent: true },
  { key: 'q4', text: "Seizure since last visit", isUrgent: true },
  { key: 'q5', text: "Pressure sores, not eating or drinking, or missed medicines", isUrgent: false },
  { key: 'q6', text: "Caregiver struggling to cope", isUrgent: false }
];

export function Results({ t, currentLang = 'en', activePatient, threshold = 0.20, setThreshold }) {
  const navigate = useNavigate();
  const currentThreshold = typeof threshold === 'number' && !isNaN(threshold) ? threshold : 0.20;
  const patient = activePatient || { firstName: 'Lakshmi', condition: 'MS' };
  const condition = patient.condition || 'MS';
  const assessments = patient.assessments || [];
  const detectionResult = useDeclineDetection(assessments, currentThreshold);

  // Check if session assessment was completed
  const sessionCheck = (() => {
    try {
      const stored = localStorage.getItem('neurosathi_session_check');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  })();

  // Check if alternative observational questionnaire was used
  const yesNoAssessment = (() => {
    try {
      const stored = localStorage.getItem('neurosathi_yesno_assessment');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.active) return parsed;
      }
    } catch (e) {}
    return null;
  })();

  const isUrgentYesNo = Boolean(
    yesNoAssessment?.answers?.q1 === 'yes' ||
    yesNoAssessment?.answers?.q2 === 'yes' ||
    yesNoAssessment?.answers?.q3 === 'yes' ||
    yesNoAssessment?.answers?.q4 === 'yes'
  );

  // Unified calculated metrics ensuring the SAME percentages across the app
  const metrics = calculatePatientMetrics(assessments);
  const { tappingDropPct, reactionSlowedPct, baseTapping, recentTapping } = metrics;

  const baseLeft = calculateBaseline(assessments, (a) => a.motor?.leftTaps || 0);
  const baseRight = calculateBaseline(assessments, (a) => a.motor?.rightTaps || 0);
  const baseProc = calculateBaseline(assessments, (a) => a.processing?.correct || 0);

  // 8-week trend data
  const chartData = assessments.map((a, idx) => ({
    week: `Wk ${idx + 1}`,
    date: a.date,
    leftTaps: a.motor?.leftTaps || 0,
    rightTaps: a.motor?.rightTaps || 0,
    reactionMatches: a.processing?.correct || 0,
    combinedTaps: Math.round(((a.motor?.leftTaps || 0) + (a.motor?.rightTaps || 0)) / 2)
  }));

  // Determine Urgent vs Decline vs Stable per condition
  let statusType = 'stable'; // 'urgent' | 'needs-visit' | 'stable'
  let flagReason = '';
  let flagRecommendation = '';

  if (yesNoAssessment) {
    if (isUrgentYesNo) {
      statusType = 'urgent';
    } else {
      statusType = 'stable';
    }
  } else if (condition === 'Stroke') {
    const isUrgentStroke = sessionCheck?.strokeUrgent === 'yes';
    if (isUrgentStroke) {
      statusType = 'urgent';
    } else {
      const isCaregiverFlagged = sessionCheck?.strokeQuestions && (
        sessionCheck.strokeQuestions.eating === 'no' ||
        sessionCheck.strokeQuestions.dressing === 'no' ||
        sessionCheck.strokeQuestions.walking === 'no' ||
        sessionCheck.strokeQuestions.speech === 'no' ||
        sessionCheck.strokeQuestions.medicines === 'no' ||
        sessionCheck.strokeQuestions.spasticity === 'yes' ||
        sessionCheck.strokeQuestions.neglect === 'yes' ||
        sessionCheck.strokeQuestions.bladder === 'yes'
      );
      const isMotorDeclining = tappingDropPct >= Math.round(currentThreshold * 100);
      if (isMotorDeclining || isCaregiverFlagged || detectionResult.isDeclining) {
        statusType = 'needs-visit';
      } else {
        statusType = 'stable';
      }
    }
  } else if (condition === 'Epilepsy') {
    const isUrgentEpilepsy = sessionCheck?.epilepsyUrgent === 'yes';
    if (isUrgentEpilepsy) {
      statusType = 'urgent';
    } else {
      const seizures = sessionCheck?.epilepsyCheck?.seizures;
      const missed = sessionCheck?.epilepsyCheck?.missedDoses;
      const injury = sessionCheck?.epilepsyCheck?.injury;
      const auras = sessionCheck?.epilepsyCheck?.auras;
      const prolongedWeakness = sessionCheck?.epilepsyCheck?.prolongedWeakness;
      const hasRecentSeizures = seizures && seizures !== '0';
      const hasMissed = missed && missed !== 'none';
      const hasInjury = injury === 'yes';
      const hasAuras = auras === 'yes';
      const hasWeakness = prolongedWeakness === 'yes';

      if (hasRecentSeizures || hasMissed || hasInjury || hasAuras || hasWeakness) {
        statusType = 'needs-visit';
      } else {
        statusType = 'stable';
      }
    }
  } else if (condition === "Parkinson's") {
    const slowingDetected = sessionCheck?.parkinsonTapping?.slowingDetected;
    const tremorOrFalls = sessionCheck?.parkinsonQuestions?.moreTremorStiffnessFalls === 'yes';
    const missedMeds = sessionCheck?.parkinsonQuestions?.medicinesOnTime === 'no';
    const isMotorDeclining = tappingDropPct >= Math.round(currentThreshold * 100);

    if (isMotorDeclining || slowingDetected || tremorOrFalls || missedMeds || detectionResult.isDeclining) {
      statusType = 'needs-visit';
    } else {
      statusType = 'stable';
    }
  } else {
    // MS condition
    const msOptic = sessionCheck?.msQuestions?.opticPain === 'yes';
    const msBladder = sessionCheck?.msQuestions?.bladder === 'yes';
    const msWalking = sessionCheck?.msQuestions?.walkingWorse === 'yes';
    const msVision = sessionCheck?.msQuestions?.visionWorse === 'yes';

    if (detectionResult.isDeclining || tappingDropPct >= Math.round(currentThreshold * 100) || msOptic || msBladder || msWalking || msVision) {
      statusType = 'needs-visit';
    } else {
      statusType = 'stable';
    }
  }

  // Generate plain sentences (calculated values only, no typed-in numbers, no forbidden words)
  const getFlagExplanation = () => {
    if (statusType === 'urgent') {
      if (condition === 'Stroke') {
        switch (currentLang) {
          case 'hi':
            return {
              result: "तत्काल चिकित्सीय सलाह की आवश्यकता है: पिछली जांच के बाद से नई कमजोरी, बोलने में बदलाव या भ्रम देखा गया है।",
              recommendation: "सलाह: तुरंत 108 एम्बुलेंस पर कॉल करें या आपातकालीन ई-संजीवनी परामर्श लें।"
            };
          case 'te':
            return {
              result: "తక్షణ వైద్య సలహా అవసరం: చివరి తనిఖీ తర్వాత కొత్త బలహీనత, మాటలో మార్పు లేదా గందరగోళం గుర్తించబడింది.",
              recommendation: "సలహా: వెంటనే 108 అంబులెన్స్‌కు కాల్ చేయండి లేదా అత్యవసర ఈ-సంజీవని సంప్రదింపులను పొందండి."
            };
          case 'ur':
            return {
              result: "فوری طبی مشورے کی ضرورت ہے: پچھلی جانچ کے بعد سے نئی کمزوری، بولنے میں تبدیلی یا الجھن دیکھی گئی ہے۔",
              recommendation: "مشورہ: فوری طور پر 108 ایمبولینس پر کال کریں یا ہنگامی ای-سنجیوانی مشورہ لیں۔"
            };
          case 'en':
          default:
            return {
              result: "New weakness, speech change, or confusion reported since last check.",
              recommendation: "Recommendation: Connect to 108 emergency ambulance or arrange an urgent medical consultation on e-Sanjeevani."
            };
        }
      } else if (condition === 'Epilepsy') {
        switch (currentLang) {
          case 'hi':
            return {
              result: "तत्काल चिकित्सीय सलाह की आवश्यकता है: 5 मिनट से अधिक समय तक दौरा पड़ने या दौरों के बीच होश न आने की सूचना मिली है।",
              recommendation: "सलाह: तुरंत 108 आपातकालीन एम्बुलेंस पर कॉल करें।"
            };
          case 'te':
            return {
              result: "తక్షణ వైద్య సలహా అవసరం: 5 నిమిషాల కంటే ఎక్కువ సమయం పాటు మూర్ఛ లేదా మూర్ఛల మధ్య కోలుకోకపోవడం నమోదైంది.",
              recommendation: "సలహా: వెంటనే 108 అత్యవసర అంబులెన్స్‌కు కాల్ చేయండి."
            };
          case 'ur':
            return {
              result: "فوری طبی مشورے کی ضرورت ہے: 5 منٹ سے زیادہ دورہ یا دوروں کے درمیان ہوش نہ آنے کی اطلاع ملی ہے۔",
              recommendation: "مشورہ: فوری طور پر 108 ایمرجنسی ایمبولینس پر رابطہ کریں۔"
            };
          case 'en':
          default:
            return {
              result: "Reported a seizure lasting over 5 minutes or lack of recovery between seizures.",
              recommendation: "Recommendation: Call 108 emergency ambulance immediately for urgent evaluation."
            };
        }
      } else {
        // Alternative observational checklist urgent
        switch (currentLang) {
          case 'hi':
            return {
              result: "तत्काल चिकित्सीय सलाह की आवश्यकता है: अवलोकन जांच में गंभीर चेतावनी संकेत दर्ज किए गए हैं।",
              recommendation: "सलाह: 108 आपातकालीन सेवा पर कॉल करें या तुरंत ई-संजीवनी डॉक्टर से संपर्क करें।"
            };
          case 'te':
            return {
              result: "తక్షణ వైద్య సలహా అవసరం: పరిశీలనలో అత్యవసర హెచ్చరిక సంకేతాలు గుర్తించబడ్డాయి.",
              recommendation: "సలహా: 108 అత్యవసర సేవలకు కాల్ చేయండి లేదా ఈ-సంజీవని ద్వారా వెంటనే వైద్యుడిని సంప్రదించండి."
            };
          case 'ur':
            return {
              result: "فوری طبی مشورے کی ضرورت ہے: مشاہداتی جانچ میں اہم انتباہی علامات نوٹ کی گئی ہیں۔",
              recommendation: "مشورہ: 108 ایمرجنسی پر رابطہ کریں یا فوری ای-سنجیوانی ڈاکٹر سے مشورہ لیں۔"
            };
          case 'en':
          default:
            return {
              result: "One or more acute red flag signs reported on the observational checklist (weakness/drowsiness, swallowing trouble, fever signs, or seizure).",
              recommendation: "Recommendation: Connect to 108 emergency ambulance or arrange an urgent medical consultation on e-Sanjeevani."
            };
        }
      }
    }

    if (statusType === 'needs-visit') {
      if (condition === 'Stroke') {
        switch (currentLang) {
          case 'hi':
            return {
              result: `3 सप्ताह में टैपिंग की गति में लगभग ${tappingDropPct}% की गिरावट आई और दैनिक कार्यों में सहायता की आवश्यकता दर्ज की गई।`,
              recommendation: "सलाह: इस सप्ताह मरीज़ को ई-संजीवनी या स्थानीय पीएचसी डॉक्टर से संपर्क कराएं।"
            };
          case 'te':
            return {
              result: `3 వారాల్లో ట్యాపింగ్ వేగం దాదాపు ${tappingDropPct}% తగ్గింది మరియు రోజువారీ కార్యకలాపాలలో సహాయం అవసరమని నమోదైంది.`,
              recommendation: "సలహా: ఈ వారం రోగిని ఈ-సంజీవని లేదా స్థానిక పీహెచ్‌సీ వైద్యుడికి సంప్రదింపజేయండి."
            };
          case 'ur':
            return {
              result: `3 ہفتوں میں ٹیپنگ کی رفتار میں تقریباً ${tappingDropPct} فیصد گراوٹ آئی اور روزمرہ کے کاموں میں مدد کی ضرورت دیکھی گئی۔`,
              recommendation: "مشورہ: اس ہفتے مریض کو ای-سنجیوانی یا مقامی پی ایچ سی ڈاکٹر سے رجوع کرائیں۔"
            };
          case 'en':
          default:
            return {
              result: `Tapping speed dropped about ${tappingDropPct}% over 3 weeks with caregiver assistance required in daily activities.`,
              recommendation: "Recommendation: Connect patient to medical consultation on e-Sanjeevani or local PHC this week."
            };
        }
      } else if (condition === 'Epilepsy') {
        const seizureTxt = sessionCheck?.epilepsyCheck?.seizures || '1 or more';
        switch (currentLang) {
          case 'hi':
            return {
              result: `पिछली जांच के बाद से ${seizureTxt} दौरे और छूटी हुई दवा की खुराक दर्ज की गई है।`,
              recommendation: "सलाह: इस सप्ताह नियमित दवा समीक्षा के लिए ई-संजीवनी या डॉक्टर से परामर्श करें।"
            };
          case 'te':
            return {
              result: `చివరి తనిఖీ తర్వాత ${seizureTxt} మూర్ఛలు మరియు తప్పిపోయిన ఔషధ మోతాదులు నమోదయ్యాయి.`,
              recommendation: "సలహా: ఈ వారం మందుల సమీక్ష కోసం ఈ-సంజీవని లేదా వైద్యుడిని సంప్రదించండి."
            };
          case 'ur':
            return {
              result: `پچھلی جانچ کے بعد سے ${seizureTxt} دورے اور چھوٹی ہوئی ادویات کی خوراکیں رپورٹ ہوئیں۔`,
              recommendation: "مشورہ: اس ہفتے ادویات کے جائزے کے لیے ای-سنجیوانی یا ڈاکٹر سے رجوع کریں۔"
            };
          case 'en':
          default:
            return {
              result: `${seizureTxt} seizure(s) and missed medication doses reported since last check.`,
              recommendation: "Recommendation: Schedule a medical review on e-Sanjeevani or local hospital OPD this week."
            };
        }
      } else if (condition === "Parkinson's") {
        switch (currentLang) {
          case 'hi':
            return {
              result: `3 सप्ताह में टैपिंग की गति में लगभग ${tappingDropPct}% की कमी आई और अकड़न या गिरने का खतरा बढ़ा है।`,
              recommendation: "सलाह: इस सप्ताह दवा समायोजन के लिए न्यूरोलॉजिस्ट या मेडिकल ऑफिसर से परामर्श करें।"
            };
          case 'te':
            return {
              result: `3 వారాల్లో ట్యాపింగ్ వేగం దాదాపు ${tappingDropPct}% తగ్గింది మరియు బిగుతు లేదా పడిపోయే ప్రమాదం పెరిగింది.`,
              recommendation: "సలహా: ఈ వారం ఔషధ సమీక్ష కోసం వైద్యుడిని సంప్రదించండి."
            };
          case 'ur':
            return {
              result: `3 ہفتوں میں ٹیپنگ کی رفتار تقریباً ${tappingDropPct} فیصد سست ہوئی اور سختی یا گرنے کا خطرہ دیکھا گیا۔`,
              recommendation: "مشورہ: اس ہفتے دوا کے جائزے کے لیے ڈاکٹر سے مشورہ لیں۔"
            };
          case 'en':
          default:
            return {
              result: `Tapping speed slowed about ${tappingDropPct}% with increased stiffness or fall risk reported since last check.`,
              recommendation: "Recommendation: Schedule medical review for dose timing titration this week."
            };
        }
      } else {
        // MS condition
        switch (currentLang) {
          case 'hi':
            return {
              result: `3 सप्ताह में टैपिंग की गति में लगभग ${tappingDropPct}% की गिरावट आई और प्रतिक्रिया समय ${reactionSlowedPct}% धीमा हुआ।`,
              recommendation: "सलाह: इस सप्ताह मरीज़ को ई-संजीवनी या स्थानीय पीएचसी डॉक्टर से संपर्क कराएं।"
            };
          case 'te':
            return {
              result: `3 వారాల్లో ట్యాపింగ్ వేగం దాదాపు ${tappingDropPct}% తగ్గింది మరియు ప్రతిస్పందన సమయం ${reactionSlowedPct}% నెమ్మదించింది.` ,
              recommendation: "సలహా: ఈ వారం రోగిని ఈ-సంజీవని లేదా స్థానిక పీహెచ్‌సీ వైద్యుడికి సంప్రదింపజేయండి."
            };
          case 'ur':
            return {
              result: `3 ہفتوں میں ٹیپنگ کی رفتار میں تقریباً ${tappingDropPct} فیصد گراوٹ آئی اور ردعمل کا وقت ${reactionSlowedPct} فیصد سست ہوا۔`,
              recommendation: "مشورہ: اس ہفتے مریض کو ای-سنجیوانی یا مقامی پی ایچ سی ڈاکٹر سے رجوع کرائیں۔"
            };
          case 'en':
          default:
            return {
              result: `Tapping speed dropped about ${tappingDropPct}% and reaction time slowed about ${reactionSlowedPct}% over 3 weeks.`,
              recommendation: "Recommendation: Connect patient to medical consultation on e-Sanjeevani or local PHC this week."
            };
        }
      }
    }

    // Stable
    if (condition === 'Stroke') {
      return {
        result: "Tapping speed and daily functional independence remain stable on current treatment.",
        recommendation: ""
      };
    } else if (condition === 'Epilepsy') {
      return {
        result: "No seizures or missed medication doses reported since last check.",
        recommendation: ""
      };
    } else if (condition === "Parkinson's") {
      return {
        result: "Tapping speed and motor symptoms remain stable on scheduled medication.",
        recommendation: ""
      };
    } else {
      return {
        result: "Tapping speed and reaction time remain stable within expected normal variation (±5-10%).",
        recommendation: ""
      };
    }
  };

  const flagInfo = getFlagExplanation();
  const spokenText = `${flagInfo.result} ${flagInfo.recommendation}`.trim();

  const isUrgent = statusType === 'urgent';
  const isNeedsVisit = statusType === 'needs-visit';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            2 Flag: Assessment Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            App flags decline for the ASHA worker
          </p>
        </div>
      </div>

      {yesNoAssessment ? (
        /* Alternative Observational Assessment View */
        <div className="space-y-6">
          {/* ONE CLEAR RESULT CARD FOR YES/NO CHECKLIST */}
          <div
            className={`rounded-2xl p-5 sm:p-6 border-2 shadow-sm space-y-4 ${
              isUrgent
                ? 'bg-red-50/90 border-red-300 text-red-950'
                : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                {isUrgent ? (
                  <AlertTriangle className="w-7 h-7 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
                    Surveillance Flag
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight block">
                    {isUrgent ? "Needs urgent medical advice" : "Stable"}
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isUrgent ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isUrgent ? "Urgent Action Required" : "Routine Surveillance"}
              </span>
            </div>

            {/* ONE plain sentence explaining why */}
            <p className="text-sm sm:text-base font-semibold leading-relaxed pt-1">
              {flagInfo.result}
            </p>

            {flagInfo.recommendation && (
              <p className="text-xs font-medium opacity-90">
                {flagInfo.recommendation}
              </p>
            )}

            {/* Urgent Actions */}
            {isUrgent && (
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:108"
                  className="touch-target inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-sm transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call 108 (Ambulance)</span>
                </a>
                <a
                  href="https://esanjeevani.mohfw.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-sm transition-all"
                >
                  <span>Book e-Sanjeevani Consult</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Listen Button */}
            <div className="pt-2">
              <ListenButton text={spokenText} currentLang={currentLang} />
            </div>
          </div>

          {/* Optional Card: "Take a moment" with Skip button */}
          <TakeAMomentCard
            resultType={statusType}
            isUrgent={isUrgent}
            currentLang={currentLang}
          />

          {/* Checklist Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-left">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Observation &amp; Symptom Checklist Record
              </h2>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded">
                Draft - clinical advisor to finalize
              </span>
            </div>

            <div className="divide-y divide-slate-100 pt-1">
              {QUESTIONS_DISPLAY.map((q, idx) => {
                const ans = yesNoAssessment.answers?.[q.key];
                const isYes = ans === 'yes';
                return (
                  <div key={q.key} className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <span className="text-slate-800 font-medium flex-1">
                      <span className="text-teal-700 font-bold mr-1.5">{idx + 1}.</span>
                      {q.text}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-xs shrink-0 ${
                      isYes
                        ? (q.isUrgent ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800')
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isYes ? 'Yes' : 'No'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/connect')}
              className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-base sm:text-lg font-bold shadow-lg shadow-teal-700/20 flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <span>Proceed to Step 3: Connect</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>
      ) : (
        /* Standard Quantitative Assessment View */
        <div className="space-y-6">
          {/* ONE CLEAR RESULT CARD */}
          <div
            className={`rounded-2xl p-5 sm:p-6 border-2 shadow-sm space-y-3 ${
              isUrgent
                ? 'bg-red-50/90 border-red-300 text-red-950'
                : isNeedsVisit
                ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                {isUrgent ? (
                  <AlertTriangle className="w-7 h-7 text-red-600 shrink-0" />
                ) : isNeedsVisit ? (
                  <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
                    Surveillance Flag
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight block">
                    {isUrgent
                      ? "Needs urgent medical advice"
                      : isNeedsVisit
                      ? "Needs doctor visit"
                      : "Stable"}
                  </span>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isUrgent
                    ? 'bg-red-600 text-white'
                    : isNeedsVisit
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isUrgent ? "Urgent Action Required" : isNeedsVisit ? "Action Required" : "Routine Care"}
              </span>
            </div>

            {/* ONE plain sentence explaining why */}
            <p className="text-sm sm:text-base font-semibold leading-relaxed pt-1">
              {flagInfo.result}
            </p>

            {flagInfo.recommendation && (
              <p className="text-xs font-medium opacity-90">
                {flagInfo.recommendation}
              </p>
            )}

            {/* Urgent buttons if urgent */}
            {isUrgent && (
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="tel:108"
                  className="touch-target inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-sm transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call 108 (Ambulance)</span>
                </a>
                <a
                  href="https://esanjeevani.mohfw.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="touch-target inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-sm transition-all"
                >
                  <span>Book e-Sanjeevani Consult</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Listen Button for the one-sentence result and recommendation */}
            <div className="pt-2">
              <ListenButton text={spokenText} currentLang={currentLang} />
            </div>
          </div>

          {/* Optional Card: "Take a moment" with Skip button */}
          <TakeAMomentCard
            resultType={statusType}
            isUrgent={isUrgent}
            currentLang={currentLang}
          />

          {/* Threshold Slider (Default 20% everywhere) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                <label htmlFor="threshold-slider" className="text-xs sm:text-sm font-bold text-slate-800">
                  Threshold (set by clinical advisor): <span className="text-teal-700">{Math.round(currentThreshold * 100)}%</span>
                </label>
              </div>
              <span className="text-xs text-slate-400 font-medium">Flag if 3-week drop &gt; {Math.round(currentThreshold * 100)}%</span>
            </div>

            <input
              id="threshold-slider"
              type="range"
              min="0.10"
              max="0.40"
              step="0.05"
              value={currentThreshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>10% (Sensitive)</span>
              <span className="font-bold text-teal-700">20% (Default)</span>
              <span>40% (Conservative)</span>
            </div>
          </div>

          {/* Condition-Appropriate Chart(s) with 8 Weeks of VARIED Data */}
          {condition !== 'Epilepsy' ? (
            /* Motor Tapping Speed Chart */
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  🖐️ Finger Tapping Speed ({tappingDropPct}% drop)
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Baseline: {baseTapping} taps (10s/hand)
                </span>
              </div>

              <div className="h-56 sm:h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
                    <ReferenceLine y={baseLeft} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Base', fill: '#64748b', fontSize: 10 }} />
                    <Line type="monotone" dataKey="leftTaps" name="Left Hand Taps" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="rightTaps" name="Right Hand Taps" stroke="#475569" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* Epilepsy Medication Adherence & Stability Trend */
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  ⚡ 8-Week Stability &amp; Adherence Trend
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {patient.firstName} (Epilepsy)
                </span>
              </div>

              <div className="h-56 sm:h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
                    <Line type="monotone" dataKey="combinedTaps" name="Motor Consistency (taps)" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Second Chart for MS: Reaction Time */}
          {condition === 'MS' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  🧠 Reaction Time ({reactionSlowedPct}% slowed)
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Baseline: {baseProc} matches (30s test)
                </span>
              </div>

              <div className="h-56 sm:h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                    <ReferenceLine y={baseProc} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Base', fill: '#64748b', fontSize: 10 }} />
                    <Line type="monotone" dataKey="reactionMatches" name="Correct Matches" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Button to Proceed to Step 3 Connect */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/connect')}
              className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-base sm:text-lg font-bold shadow-lg shadow-teal-700/20 flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <span>Proceed to Step 3: Connect</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
