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
    return localStorage.getItem(`neurosathi_typed_note_${patientId}_${today}`) || '';
  } catch (err) {
    return '';
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
