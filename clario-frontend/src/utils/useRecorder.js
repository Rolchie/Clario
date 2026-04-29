// src/utils/useRecorder.js
import { useState, useRef, useCallback } from "react";

// Pick the best supported audio format for Groq Whisper
function getSupportedMimeType() {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return ""; // browser default
}

// Map mimeType to a file extension Groq accepts
function getExtension(mimeType) {
  if (mimeType.includes("ogg"))  return "ogg";
  if (mimeType.includes("mp4"))  return "mp4";
  return "webm"; // default — Groq accepts webm
}

export function useRecorder() {
  const [isRecording, setIsRecording]   = useState(false);
  const [audioBlob,   setAudioBlob]     = useState(null);
  const [audioMime,   setAudioMime]     = useState("audio/webm");
  const [duration,    setDuration]      = useState(0);
  const [elapsed,     setElapsed]       = useState(0);
  const [error,       setError]         = useState(null);

  const mediaRecorder = useRef(null);
  const chunks        = useRef([]);
  const startTime     = useRef(null);
  const timerRef      = useRef(null);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    chunks.current = [];

    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const options  = mimeType ? { mimeType } : {};

      mediaRecorder.current = new MediaRecorder(stream, options);
      const actualMime = mediaRecorder.current.mimeType || "audio/webm";
      setAudioMime(actualMime);

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        // Use the actual mimeType the recorder used — not a hardcoded guess
        const blob = new Blob(chunks.current, { type: actualMime });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.current.start(250);
      startTime.current = Date.now();
      setIsRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      }, 500);

    } catch (err) {
      setError("Microphone access denied. Please allow microphone permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      clearInterval(timerRef.current);
      const dur = Math.floor((Date.now() - startTime.current) / 1000);
      setDuration(dur);
      setIsRecording(false);
    }
  }, []);

  return {
    isRecording,
    audioBlob,
    audioMime,
    duration,
    elapsed,
    error,
    startRecording,
    stopRecording,
    getExtension: () => getExtension(audioMime),
  };
}