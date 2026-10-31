import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronDown, ChevronUp, Mic, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { getSimulatedVoiceNote } from '../utils/audioStorage';

export function VoiceNotePlayer({ patientId, voiceNoteBlob, voiceNoteUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  const simulated = getSimulatedVoiceNote(patientId);
  const duration = simulated.durationSec || 18;

  // Real audio handlers
  const handleRealPlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.warn('Audio play error:', err));
    }
  };

  // Simulated Web Audio synth tone for realistic demo playback
  const startSynthSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, ctx.currentTime);
      // Gentle voice-like pitch inflection
      osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(175, ctx.currentTime + 0.7);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      // AudioContext unavailable or blocked by policy
    }
  };

  const stopSynthSound = () => {
    try {
      if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.05);
        setTimeout(() => {
          if (oscRef.current) {
            try { oscRef.current.stop(); } catch (e) {}
            oscRef.current.disconnect();
            oscRef.current = null;
          }
        }, 60);
      }
    } catch (e) {}
  };

  // Simulated playback toggle
  const handleSimulatedPlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopSynthSound();
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsPlaying(true);
      startSynthSound();
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration - 1) {
            clearInterval(timerRef.current);
            stopSynthSound();
            setIsPlaying(false);
            return 0;
          }
          // Modulate pitch gently to mimic speech
          if (oscRef.current && audioCtxRef.current) {
            const freq = 180 + Math.sin(prev * 2) * 35;
            oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSynthSound();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  // Reset when patient changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    stopSynthSound();
  }, [patientId]);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Waveform bar heights (18 bars)
  const barHeights = [25, 45, 60, 35, 75, 55, 90, 65, 40, 80, 50, 70, 85, 30, 60, 45, 75, 35];

  if (voiceNoteUrl) {
    // REAL LIVE RECORDED AUDIO
    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-slate-800 text-xs">Live Recorded Voice Note</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
            On-device audio
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRealPlayPause}
            className="touch-target w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
            aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </button>
          <div className="flex-1">
            <span className="font-bold text-slate-800 text-xs block">Patient's Audio Recording</span>
            <span className="text-[11px] text-slate-500">Recorded during frontline Step 1 Check</span>
          </div>
          <audio
            ref={audioRef}
            src={voiceNoteUrl}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // SIMULATED VOICE NOTE WITH AI TRANSCRIPT
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-xs block leading-tight">
              Frontline Voice Note ({simulated.speaker})
            </span>
            <span className="text-[10px] text-slate-500">
              Recorded at community home visit • Duration {simulated.durationFormatted}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
            {simulated.languageTag || "Recorded in Hindi"}
          </span>
          <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-teal-600" />
            Simulated Audio
          </span>
        </div>
      </div>

      {/* Audio player controls & waveform */}
      <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSimulatedPlayPause}
            className="touch-target w-10 h-10 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
            aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </button>

          {/* Waveform Bars */}
          <div className="flex-1 flex items-center gap-1 h-8 px-2 overflow-hidden">
            {barHeights.map((h, i) => {
              const isPassed = (i / barHeights.length) * duration <= currentTime;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    isPassed
                      ? 'bg-teal-600'
                      : 'bg-slate-300'
                  } ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (h + Math.sin(currentTime + i) * 20))}%` : `${h}%`,
                    minWidth: '2px',
                    maxWidth: '6px'
                  }}
                />
              );
            })}
          </div>

          {/* Timer */}
          <div className="text-right shrink-0">
            <span className="text-xs font-mono font-bold text-slate-700 block">
              {formatTime(currentTime)} / {simulated.durationFormatted}
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
          />
        </div>
      </div>

      {/* Expandable AI Transcript Toggle */}
      <div className="border-t border-slate-100 pt-2.5">
        <button
          type="button"
          onClick={() => setShowTranscript(prev => !prev)}
          className="touch-target w-full flex items-center justify-between text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>✨ View AI Clinical Transcript (English)</span>
          </span>
          {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTranscript && (
          <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5 animate-fadeIn">
            {/* Hindi original */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                  Original Audio (Hindi):
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-medium">
                  Spoken
                </span>
              </div>
              <p className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 leading-relaxed italic">
                "{simulated.hindi}"
              </p>
            </div>

            {/* English translation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-teal-900 text-[11px] uppercase tracking-wider">
                  AI Clinical Translation (English):
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-teal-700" />
                  Translated
                </span>
              </div>
              <p className="bg-white p-2.5 rounded-lg border border-teal-200 text-slate-900 leading-relaxed font-medium">
                "{simulated.english}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-500">
              <span>AI Speech-to-Text • Frontline Tele-triage</span>
              <span>Audio clarity: High</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
