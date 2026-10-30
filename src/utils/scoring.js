// CLINICAL THRESHOLD: Decline flagged when 3-week rolling average drops >threshold below baseline on ≥2 measures. Configurable by clinical advisor. Not clinically validated.
// CLINICAL NOTE: Finger tapping speed correlates with motor function. Asymmetry >20% may indicate lateralized deficit. Threshold configurable.
// CLINICAL NOTE: Symbol-digit modalities test (SDMT) is standard in MS monitoring. This is a simplified, non-validated adaptation.
// CLINICAL NOTE: Speech fluency changes can indicate neurological progression. Full analysis requires validated NLP — not implemented here.

/**
 * Calculates baseline (average of weeks 1-3) for a given numeric series
 */
export function calculateBaseline(assessments, extractor) {
  if (!assessments || assessments.length === 0) return 0;
  const baselineWeeks = assessments.slice(0, Math.min(3, assessments.length));
  const sum = baselineWeeks.reduce((acc, curr) => acc + extractor(curr), 0);
  return Number((sum / baselineWeeks.length).toFixed(1));
}

/**
 * Calculates rolling average of the last 3 assessments
 */
export function calculateRecentRollingAvg(assessments, extractor) {
  if (!assessments || assessments.length === 0) return 0;
  const recentWeeks = assessments.slice(Math.max(0, assessments.length - 3));
  const sum = recentWeeks.reduce((acc, curr) => acc + extractor(curr), 0);
  return Number((sum / recentWeeks.length).toFixed(1));
}

/**
 * Evaluates decline across all 4 core measures:
 * - motorLeft (left hand taps)
 * - motorRight (right hand taps)
 * - processing (correct symbol matches)
 * - symptoms (composite 1-5 rating)
 *
 * Decline rule: if rolling avg < (baseline * (1 - threshold)) on >= 2 measures -> sustained decline
 */
export function evaluatePatientDecline(assessments, threshold = 0.20) {
  if (!assessments || assessments.length < 3) {
    return {
      isDeclining: false,
      flaggedCount: 0,
      threshold,
      measures: {},
      summary: "Insufficient data for trend baseline"
    };
  }

  const measuresConfig = {
    motorLeft: {
      name: "Motor (Left Hand Taps)",
      extractor: (a) => a.motor?.leftTaps || 0,
      unit: "taps"
    },
    motorRight: {
      name: "Motor (Right Hand Taps)",
      extractor: (a) => a.motor?.rightTaps || 0,
      unit: "taps"
    },
    processing: {
      name: "Processing Speed",
      extractor: (a) => a.processing?.correct || 0,
      unit: "correct"
    },
    symptoms: {
      name: "Symptom Composite Score",
      extractor: (a) => {
        const s = a.symptoms || { fatigue: 3, balance: 3, vision: 3, mood: 3 };
        return (s.fatigue + s.balance + s.vision + s.mood) / 4;
      },
      unit: "/5"
    }
  };

  const measureResults = {};
  let flaggedCount = 0;

  for (const [key, config] of Object.entries(measuresConfig)) {
    const baseline = calculateBaseline(assessments, config.extractor);
    const recent = calculateRecentRollingAvg(assessments, config.extractor);
    
    // Percent change: negative indicates decline
    const changePct = baseline > 0 ? ((recent - baseline) / baseline) : 0;
    const dropPct = -changePct;
    const isFlagged = dropPct >= threshold;

    if (isFlagged) {
      flaggedCount += 1;
    }

    measureResults[key] = {
      name: config.name,
      baseline,
      recent,
      unit: config.unit,
      changePct: Number((changePct * 100).toFixed(1)),
      dropPct: Number((dropPct * 100).toFixed(1)),
      isFlagged
    };
  }

  // Sustained decline rule: >= 2 measures dropping > threshold
  const isDeclining = flaggedCount >= 2;

  return {
    isDeclining,
    flaggedCount,
    threshold,
    measures: measureResults
  };
}

/**
 * Calculates symptom composite average for an assessment
 */
export function getSymptomComposite(symptoms) {
  if (!symptoms) return 3;
  return Number(((symptoms.fatigue + symptoms.balance + symptoms.vision + symptoms.mood) / 4).toFixed(1));
}

/**
 * Calculates unified tapping and reaction time metrics for a patient
 * Ensures the exact same percentage is shown across results, charts, care plan, and doctor summary
 */
export function calculatePatientMetrics(assessments) {
  if (!assessments || assessments.length === 0) {
    return {
      baseTapping: 0,
      recentTapping: 0,
      tappingDropPct: 0,
      baseReactionMs: 0,
      recentReactionMs: 0,
      reactionSlowedPct: 0,
      baseProc: 0,
      recentProc: 0,
      procDropPct: 0
    };
  }

  // Tapping speed as one combined value (average of left & right hand taps)
  const baseTapping = calculateBaseline(assessments, a => ((a.motor?.leftTaps || 0) + (a.motor?.rightTaps || 0)) / 2);
  const recentTapping = calculateRecentRollingAvg(assessments, a => ((a.motor?.leftTaps || 0) + (a.motor?.rightTaps || 0)) / 2);
  const tappingDropPct = baseTapping > 0 ? Math.round(((baseTapping - recentTapping) / baseTapping) * 100) : 0;

  // Reaction time in milliseconds (slowed %)
  const baseReactionMs = calculateBaseline(assessments, a => a.processing?.avgReactionMs || 0);
  const recentReactionMs = calculateRecentRollingAvg(assessments, a => a.processing?.avgReactionMs || 0);
  const reactionSlowedPct = baseReactionMs > 0 ? Math.round(((recentReactionMs - baseReactionMs) / baseReactionMs) * 100) : 0;

  const baseProc = calculateBaseline(assessments, a => a.processing?.correct || 0);
  const recentProc = calculateRecentRollingAvg(assessments, a => a.processing?.correct || 0);
  const procDropPct = baseProc > 0 ? Math.round(((baseProc - recentProc) / baseProc) * 100) : 0;

  return {
    baseTapping,
    recentTapping,
    tappingDropPct,
    baseReactionMs,
    recentReactionMs,
    reactionSlowedPct,
    baseProc,
    recentProc,
    procDropPct
  };
}
