import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Square, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

// CLINICAL NOTE: Speech fluency changes can indicate neurological progression. Full analysis requires validated NLP — not implemented here.

export function SpeechAssessment({ t, onSaveSpeech }) {
  const navigate = useNavigate();
  const [isSupported, setIsSupported] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    // Check if navigator.mediaDevices and MediaRecorder are available
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setIsSupported(false);
    }
  }, []);

  const startRecording = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setDurationSec(0);

      // Auto stop after 10s or update counter
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setDurationSec(Number(elapsed.toFixed(1)));
        if (elapsed >= 10) {
          stopRecording();
        }
      }, 100);
    } catch (err) {
      console.warn("Audio recording permission or device issue:", err);
      // If mic permission denied or error, allow skipping
      setErrorMsg("Microphone permission was not granted. You can safely skip this step.");
      setIsSupported(false);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    const finalElapsed = (Date.now() - startTimeRef.current) / 1000;
    setDurationSec(Number(finalElapsed.toFixed(1)));
    setIsRecording(false);
    setIsRecorded(true);
  };

  const handleProceed = () => {
    if (onSaveSpeech) {
      onSaveSpeech({
        recorded: isRecorded,
        durationSec: isRecorded ? durationSec : 7.0
      });
    }
    navigate('/symptoms');
  };

  const handleSkip = () => {
    if (onSaveSpeech) {
      onSaveSpeech({
        recorded: false,
        durationSec: 0
      });
    }
    navigate('/symptoms');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Standard Unified Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <Mic className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t.speech.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500">{t.speech.step} • {t.speech.subtitle}</p>
        </div>
      </div>

      {/* Screen Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-xs text-center space-y-5">

        {/* Instructions */}
        <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {t.speech.instructions}
        </p>

        {/* Prompt Sentence Card */}
        <div className="bg-teal-50/70 border-2 border-teal-200 p-5 rounded-2xl">
          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed italic">
            "{t.speech.promptSentence}"
          </p>
        </div>

        {/* Recording Controls */}
        {isSupported ? (
          <div className="py-2 space-y-4">
            {!isRecording && !isRecorded && (
              <button
                type="button"
                onClick={startRecording}
                className="touch-target w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-lg font-bold shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Mic className="w-6 h-6" />
                <span>{t.speech.startRecord}</span>
              </button>
            )}

            {isRecording && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-red-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <span>Recording in progress: {durationSec}s / 10s</span>
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="touch-target w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-lg font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>{t.speech.stopRecord}</span>
                </button>
              </div>
            )}

            {isRecorded && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 space-y-2">
                <div className="flex items-center justify-center gap-2 text-lg font-bold">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span>{t.speech.recordedSuccess}</span>
                </div>
                <p className="text-sm font-semibold">
                  {t.speech.duration}: {durationSec} seconds
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-sm space-y-3">
            <div className="flex items-center justify-center gap-2 font-bold">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>{t.speech.notSupported}</span>
            </div>
            {errorMsg && <p className="text-xs text-amber-800">{errorMsg}</p>}
          </div>
        )}

        {/* Disclaimer as required */}
        <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          ℹ️ {t.speech.disclaimer}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleSkip}
            className="touch-target px-4 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50"
          >
            {t.speech.skipBtn}
          </button>
          <button
            type="button"
            onClick={handleProceed}
            className="touch-target flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow flex items-center justify-center gap-2"
          >
            <span>{t.speech.nextStep}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
