import React, { useState, useEffect, useRef } from 'react';
import { Mic, Type, Square, Play, Pause, RotateCcw, Trash2, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';
import { saveVoiceNote, getVoiceNote, deleteVoiceNote, saveTypedNote, getTypedNote, deleteTypedNote } from '../utils/audioStorage';

export function PatientNoteCard({ patientId, checkDate, onNoteUpdated }) {
  const date = checkDate || new Date().toISOString().split('T')[0];
  const [activeTab, setActiveTab] = useState('speak'); // 'speak' | 'type'

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micError, setMicError] = useState(null);

  // Typed note state
  const [typedText, setTypedText] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioElementRef = useRef(null);

  // Load existing notes for this patient on mount or date change
  useEffect(() => {
    let isMounted = true;

    // Load existing audio from IndexedDB
    getVoiceNote(patientId, date).then((blob) => {
      if (isMounted && blob) {
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    });

    // Load existing typed note from localStorage
    const savedText = getTypedNote(patientId, date);
    if (savedText) {
      setTypedText(savedText);
    }

    return () => {
      isMounted = false;
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [patientId, date]);

  // Handle typing change
  const handleTextChange = (e) => {
    const val = e.target.value.slice(0, 500);
    setTypedText(val);
    saveTypedNote(patientId, date, val);
    if (onNoteUpdated) {
      onNoteUpdated({ typedNote: val, hasAudio: Boolean(audioBlob) });
    }
  };

  // Start MediaRecorder (max 60 seconds)
  const handleStartRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];

    if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      setMicError('Microphone access is not supported in this browser. Please type your note.');
      setActiveTab('type');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
        else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mime = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        setAudioBlob(blob);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Store exclusively in IndexedDB (not localStorage)
        await saveVoiceNote(patientId, date, blob);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }

        if (onNoteUpdated) {
          onNoteUpdated({ typedNote: typedText, hasAudio: true });
        }
      };

      mediaRecorder.start(250); // Slice data every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      // Countdown / timer up to 60 seconds
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.warn('Microphone permission error:', err);
      setMicError('Microphone is unavailable or access was denied. You can type your note instead.');
      setActiveTab('type');
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleDeleteAudio = async () => {
    if (isPlaying && audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);
    setRecordingSeconds(0);
    await deleteVoiceNote(patientId, date);
    if (onNoteUpdated) {
      onNoteUpdated({ typedNote: typedText, hasAudio: false });
    }
  };

  const handleTogglePlay = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio playback error:', err);
      });
    }
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}:${remainingSec < 10 ? '0' : ''}${remainingSec}`;
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm text-left space-y-4">
      {/* Card Header */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Anything else bothering you?</span>
        </h3>
        <p className="text-xs text-slate-600 mt-0.5">
          Record a short voice note or type any other symptoms, discomfort, or caregiver observations.
        </p>
      </div>

      {/* Two Large Mode Buttons: Speak vs Type */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setActiveTab('speak')}
          className={`touch-target py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'speak'
              ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/20'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Mic className="w-5 h-5 shrink-0" />
          <span>Speak</span>
          {audioBlob && <span className="w-2 h-2 rounded-full bg-emerald-300 ml-1"></span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('type')}
          className={`touch-target py-3 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'type'
              ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/20'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Type className="w-5 h-5 shrink-0" />
          <span>Type</span>
          {typedText.trim().length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-300 ml-1"></span>}
        </button>
      </div>

      {/* Friendly error message if microphone was denied/unavailable */}
      {micError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{micError}</p>
          </div>
        </div>
      )}

      {/* Tab 1: Speak (MediaRecorder) */}
      {activeTab === 'speak' && (
        <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-4">
          {!isRecording && !audioBlob && (
            <div className="text-center py-2 space-y-3">
              <button
                type="button"
                onClick={handleStartRecording}
                className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording (up to 60s)</span>
              </button>
              <p className="text-xs text-slate-500">
                Tap and speak into the phone or tablet. Auto-stops at 60 seconds.
              </p>
            </div>
          )}

          {/* While recording */}
          {isRecording && (
            <div className="text-center py-3 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-red-600"></span>
                <span className="font-extrabold text-red-700 text-sm tracking-wider uppercase">
                  Recording Active
                </span>
              </div>

              <div className="text-3xl font-extrabold text-slate-800 font-mono">
                {formatTimer(recordingSeconds)} <span className="text-xs font-normal text-slate-400">/ 1:00 max</span>
              </div>

              <button
                type="button"
                onClick={handleStopRecording}
                className="touch-target w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Recording</span>
              </button>
            </div>
          )}

          {/* When audio is recorded */}
          {!isRecording && audioBlob && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold">Voice note saved ({formatTimer(recordingSeconds || 1)})</span>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Stored in IndexedDB
                </span>
              </div>

              {audioUrl && (
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="touch-target w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs"
                    aria-label={isPlaying ? "Pause note" : "Play note"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>

                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 block">Listen back to patient's voice note</span>
                    <span className="text-[11px] text-slate-400">Stored on device for doctor review</span>
                  </div>

                  <audio
                    ref={audioElementRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="touch-target py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Re-record</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAudio}
                  className="touch-target py-2.5 px-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Type (Max 500 characters) */}
      {activeTab === 'type' && (
        <div className="space-y-2">
          <textarea
            value={typedText}
            onChange={handleTextChange}
            rows={4}
            maxLength={500}
            placeholder="Type any other concerns, pain, changes, or questions here..."
            className="w-full p-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800 text-sm leading-relaxed"
          />
          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>Saved automatically</span>
            <span className={typedText.length >= 480 ? 'text-amber-600 font-bold' : ''}>
              {typedText.length} / 500
            </span>
          </div>
        </div>
      )}

      {/* Mandatory Disclaimers */}
      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          This note stays on this device in the prototype.
        </p>
        <p className="text-[11px] text-slate-400">
          Voice notes are played back for the doctor; automatic analysis is a future step.
        </p>
      </div>
    </div>
  );
}
