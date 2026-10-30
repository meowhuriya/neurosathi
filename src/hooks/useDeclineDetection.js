import { useMemo } from 'react';
import { evaluatePatientDecline } from '../utils/scoring';

// CLINICAL THRESHOLD: Decline flagged when 3-week rolling average drops >threshold below baseline on ≥2 measures. Configurable by clinical advisor. Not clinically validated.

export function useDeclineDetection(assessments, threshold = 0.20) {
  return useMemo(() => {
    return evaluatePatientDecline(assessments, threshold);
  }, [assessments, threshold]);
}
