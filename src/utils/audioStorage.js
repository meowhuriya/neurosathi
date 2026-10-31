/**
 * IndexedDB audio storage & localStorage typed note helpers for NeuroSathi
 * Stores voice notes in IndexedDB (never localStorage) linked to patientId and check date.
 * Stores typed notes (max 500 characters) safely in localStorage.
 */

const DB_NAME = 'NeuroSathiDB';
const DB_VERSION = 1;
const STORE_NAME = 'voiceNotes';

let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.target.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

export async function saveVoiceNote(patientId, date, blob) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        id: `${patientId}_${date}`,
        patientId,
        date,
        blob,
        createdAt: new Date().toISOString()
      };
      const req = store.put(record);
      req.onsuccess = () => {
        try {
          localStorage.setItem(`neurosathi_latest_note_date_${patientId}`, date);
        } catch (e) {}
        resolve(true);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save voice note in IndexedDB:', err);
    return false;
  }
}

export async function getVoiceNote(patientId, date) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(`${patientId}_${date}`);
      req.onsuccess = () => {
        resolve(req.result ? req.result.blob : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to retrieve voice note from IndexedDB:', err);
    return null;
  }
}

export async function getLatestVoiceNote(patientId) {
  const latestDate = typeof window !== 'undefined' ? localStorage.getItem(`neurosathi_latest_note_date_${patientId}`) : null;
  if (latestDate) {
    const note = await getVoiceNote(patientId, latestDate);
    if (note) return { blob: note, date: latestDate };
  }
  const today = new Date().toISOString().split('T')[0];
  const todayNote = await getVoiceNote(patientId, today);
  if (todayNote) return { blob: todayNote, date: today };

  // Fallback: check all records for this patient
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.openCursor();
      let latest = null;
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.patientId === patientId) {
            if (!latest || (cursor.value.date && cursor.value.date > latest.date)) {
              latest = cursor.value;
            }
          }
          cursor.continue();
        } else {
          resolve(latest ? { blob: latest.blob, date: latest.date } : null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

export async function deleteVoiceNote(patientId, date) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(`${patientId}_${date}`);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete voice note from IndexedDB:', err);
    return false;
  }
}

// Default condition-specific clinical notes and simulated voice recordings for pre-loaded patients
export const SAMPLE_CLINICAL_NOTES = {
  'NS-001': {
    patientName: 'Lakshmi',
    condition: 'MS',
    typedNote: "ASHA Visit (Week 8): Patient reports worsening right leg heaviness and fatigue making cooking difficult by late afternoon. Caregiver noted she needed help buttoning her blouse this morning. No acute fever or urinary retention. Advised e-Sanjeevani tele-consultation.",
    voiceNote: {
      durationSec: 24,
      durationFormatted: "0:24",
      languageTag: "Recorded in Telugu",
      speaker: "Lakshmi (Patient)",
      hindi: "दीदी, पिछले चार-पांच दिनों से दोपहर होते-होते सीधे पैर में बहुत भारीपन लगता है। रसोई में काम करने में भी हाथ कांपने लगता है और थकान बहुत जल्दी हो जाती है।",
      english: "Didi (sister), for the past 4-5 days, my right leg feels very heavy by afternoon. My hand has also started trembling while working in the kitchen, and fatigue sets in very quickly."
    }
  },
  'NS-002': {
    patientName: 'Ravi',
    condition: 'Stroke',
    typedNote: "ASHA Visit (Week 8): Mild right-hand grip weakness noticed while holding steel tumbler; morning BP elevated at 152/95. Caregiver reports compliance with generic aspirin & atorvastatin from PHC. Advised prompt PHC doctor review for secondary stroke prevention.",
    voiceNote: {
      durationSec: 24,
      durationFormatted: "0:24",
      languageTag: "Recorded in Marathi",
      speaker: "Sunita (Caregiver / Wife)",
      hindi: "हाथ में चाय का कप पकड़ने में ताकत कम लगती है, दो बार हाथ से गिर चुका है। शाम को बोलने में जुबान थोड़ी लड़खड़ाती है। आज बीपी भी 152/95 आया था।",
      english: "He has less grip strength to hold a teacup in his right hand, dropped it twice. In the evening his speech is somewhat slurred. Today his blood pressure was also 152/95 mmHg."
    }
  },
  'NS-009': {
    patientName: 'Ramesh',
    condition: "Parkinson's",
    typedNote: "ASHA Visit (Week 8): Son reports Ramesh had a near-fall while getting out of bed last Thursday. Morning stiffness takes nearly 45 minutes to ease after taking Levodopa. Resting tremor in left thumb with notable motor slowing during rapid finger tapping.",
    voiceNote: {
      durationSec: 24,
      durationFormatted: "0:24",
      languageTag: "Recorded in Kannada",
      speaker: "Kiran (Caregiver / Son)",
      hindi: "सुबह उठने के बाद चलने में बहुत समय लगता है, पैर ज़मीन से चिपक जाते हैं। गुरुवार को बिस्तर से उठते समय गिरते-गिरते बचे। दवा लेने के बाद ही कुछ राहत मिलती है।",
      english: "After waking in the morning, it takes a long time to walk; his feet freeze to the floor. On Thursday he nearly fell getting out of bed. Only after taking medicine does he get some relief."
    }
  },
  'NS-003': {
    patientName: 'Priya',
    condition: 'MS',
    typedNote: "ASHA Visit (Week 8): Routine home surveillance. Priya reports stable energy levels with Glatiramer. Balance is steady during household chores; visual acuity unaffected. Refill obtained at Jan Aushadhi Kendra.",
    voiceNote: {
      durationSec: 24,
      durationFormatted: "0:24",
      languageTag: "Recorded in Hindi",
      speaker: "Priya (Patient)",
      hindi: "इस हफ्ते सब सामान्य रहा। इंजेक्शन के बाद कोई ज्यादा परेशानी नहीं हुई और चलने-फिरने में संतुलन ठीक है।",
      english: "Everything was normal this week. No major issues after the injection and balance while walking is fine."
    }
  },
  'NS-004': {
    patientName: 'Ankit',
    condition: 'Epilepsy',
    typedNote: "ASHA Visit (Week 8): Ankit took all Levetiracetam doses on time this week. Experienced one brief 30-second aura of epigastric fullness on Tuesday night while studying late, but no loss of consciousness or convulsions.",
    voiceNote: {
      durationSec: 24,
      durationFormatted: "0:24",
      languageTag: "Recorded in Hindi",
      speaker: "Ankit (Patient)",
      hindi: "मंगलवार रात को पढ़ाई करते समय पेट में अजीब सा खिंचाव महसूस हुआ था जैसे दौरा आने वाला हो, पर मैंने आराम किया और दवा बराबर ली तो दौरा नहीं पड़ा।",
      english: "On Tuesday night while studying, I felt a strange pulling in my stomach like a seizure warning, but I rested and took my medicine, so no full seizure occurred."
    }
  },
  'NS-005': {
    patientName: 'Fatima',
    condition: 'Epilepsy',
    typedNote: "ASHA Visit (Week 8): Caregiver notes Fatima has been regular with Sodium Valproate. Mild morning drowsiness reported after evening Clobazam dose. No daytime absence spells or focal twitching noted by family.",
    voiceNote: {
      durationSec: 24,
      durationFormatted: "0:24",
      languageTag: "Recorded in Urdu",
      speaker: "Fatima's Sister (Caregiver)",
      hindi: "फातिमा अब दवाएं समय पर ले रही हैं। बस रात वाली गोली के बाद सुबह उठने में थोड़ी सुस्ती रहती है, पर दिन में कोई चक्कर या बेहोशी नहीं हुई।",
      english: "Fatima is taking medicines on time now. Just has some sluggishness waking up after the night tablet, but no daytime dizziness or fainting has occurred."
    }
  },
  'NS-006': {
    patientName: 'Suresh',
    condition: 'Stroke',
    typedNote: "ASHA Visit (Week 8): Suresh performing daily hand grip exercises with rubber ball. Left grip strength improving steadily. BP stable at 127/80 mmHg. Caregiver managing salt-restricted diet.",
    voiceNote: {
      durationSec: 24,
      durationFormatted: "0:24",
      languageTag: "Recorded in Kannada",
      speaker: "Suresh (Patient)",
      hindi: "हाथ की कसरत रोज़ कर रहा हूँ। अब चम्मच पकड़ने में पहले से बेहतर महसूस हो रहा है और बीपी भी ठीक है।",
      english: "Doing hand exercises daily. Holding a spoon feels better than before and blood pressure is also normal."
    }
  },
  'NS-007': {
    patientName: 'Meena',
    condition: 'MS',
    typedNote: "ASHA Visit (Week 8): Meena reports mild afternoon fatigue in humid weather but manages daily teaching responsibilities. No new numbness or tingling in extremities. PHC routine supply verified.",
    voiceNote: {
      durationSec: 24,
      durationFormatted: "0:24",
      languageTag: "Recorded in Tamil",
      speaker: "Meena (Patient)",
      hindi: "धूप में थोड़ी थकावट लगती है लेकिन बाकी दिनचर्या ठीक चल रही है। पैरों में कोई नई झनझनाहट नहीं है।",
      english: "Feel some tiredness in the sun but daily routine is going well. No new tingling or numbness in the legs."
    }
  },
  'NS-008': {
    patientName: 'Arjun',
    condition: 'Epilepsy',
    typedNote: "ASHA Visit (Week 8): Arjun completed 6 months seizure-free on Carbamazepine. Attends college regularly. Sleeps 8 hours nightly as advised. Refill received at Jan Aushadhi.",
    voiceNote: {
      durationSec: 24,
      durationFormatted: "0:24",
      languageTag: "Recorded in Hindi",
      speaker: "Arjun (Patient)",
      hindi: "दवा समय पर ले रहा हूँ और समय पर सोता हूँ। कोई परेशानी नहीं हुई, कॉलेज की कक्षाएं आराम से ले रहा हूँ।",
      english: "Taking medication on time and sleeping on schedule. No issues at all, attending college classes smoothly."
    }
  }
};

export function getSimulatedVoiceNote(patientId) {
  return SAMPLE_CLINICAL_NOTES[patientId]?.voiceNote || {
    durationSec: 24,
    durationFormatted: "0:24",
    languageTag: "Recorded in Regional Dialect",
    speaker: "Caregiver / Patient",
    hindi: "मरीज की स्थिति की निगरानी की गई है। आज का चेक पूरा हो चुका है।",
    english: "Patient condition monitored during frontline check. Today's routine check completed."
  };
}

export function saveTypedNote(patientId, date, text) {
  try {
    localStorage.setItem(`neurosathi_typed_note_${patientId}_${date}`, text);
    localStorage.setItem(`neurosathi_latest_note_date_${patientId}`, date);
    return true;
  } catch (err) {
    console.warn('Failed to save typed note in localStorage:', err);
    return false;
  }
}

export function getTypedNote(patientId, date) {
  try {
    if (date) {
      const val = localStorage.getItem(`neurosathi_typed_note_${patientId}_${date}`);
      if (val) return val;
    }
    const latestDate = localStorage.getItem(`neurosathi_latest_note_date_${patientId}`);
    if (latestDate) {
      const val = localStorage.getItem(`neurosathi_typed_note_${patientId}_${latestDate}`);
      if (val) return val;
    }
    const today = new Date().toISOString().split('T')[0];
    const storedToday = localStorage.getItem(`neurosathi_typed_note_${patientId}_${today}`);
    if (storedToday) return storedToday;

    // Fallback to rich condition-specific sample note if no custom note typed
    return SAMPLE_CLINICAL_NOTES[patientId]?.typedNote || '';
  } catch (err) {
    return SAMPLE_CLINICAL_NOTES[patientId]?.typedNote || '';
  }
}

export function deleteTypedNote(patientId, date) {
  try {
    localStorage.removeItem(`neurosathi_typed_note_${patientId}_${date}`);
    return true;
  } catch (err) {
    return false;
  }
}
