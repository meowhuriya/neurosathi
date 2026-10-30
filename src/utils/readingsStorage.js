/**
 * Storage helpers for optional user-entered readings (Stroke check).
 * Saves to localStorage under neurosathi_readings_${patientId}.
 */

export function saveReadings(patientId, readings) {
  if (!patientId) return false;
  try {
    const payload = {
      ...readings,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`neurosathi_readings_${patientId}`, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.warn('Failed to save readings to localStorage:', e);
    return false;
  }
}

export function getLatestReadings(patient) {
  if (!patient) return null;
  const patientId = typeof patient === 'string' ? patient : patient.id;
  try {
    const raw = localStorage.getItem(`neurosathi_readings_${patientId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) return parsed;
    }
  } catch (e) {}

  // If patient has sample vitals in their profile (e.g. Ravi NS-002), provide initial baseline readings
  if (typeof patient === 'object' && patient.vitals && patient.vitals.length > 0) {
    const latestVital = patient.vitals[patient.vitals.length - 1];
    return {
      date: latestVital.date || "2026-10-27",
      systolic: latestVital.systolic ? String(latestVital.systolic) : "",
      diastolic: latestVital.diastolic ? String(latestVital.diastolic) : "",
      bloodSugar: latestVital.bloodSugar ? String(latestVital.bloodSugar) : "",
      bloodSugarContext: "unknown",
      weight: latestVital.weight ? String(latestVital.weight) : ""
    };
  }

  return null;
}
