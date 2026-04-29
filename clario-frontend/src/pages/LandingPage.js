// src/pages/PracticePage.js
import React, { useState, useRef, useEffect } from "react";
import { useRecorder } from "../utils/useRecorder";
import "./PracticePage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Topbar({ user }) {
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const photoURL = user?.photoURL;

  return (
    <header className="pp-topbar">
      <div />

      <div className="pp-topbar-right">
        <button className="pp-notif-btn" aria-label="Notifications">
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="pp-notif-dot" />
        </button>

        <div className="pp-user-pill">
          <div className="pp-user-avatar">
            {photoURL ? <img src={photoURL} alt={displayName} /> : initials}
          </div>

          <div className="pp-user-info">
            <span className="pp-user-name">{displayName}</span>
            <span className="pp-user-role">Student</span>
          </div>

          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "#9090b0" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </header>
  );
}

function ThesisIllustration() {
  return (
    <svg viewBox="0 0 180 160" fill="none" className="sc-illustration">
      <rect x="30" y="108" width="110" height="18" rx="5" fill="#dcd8f8" opacity="0.9" />
      <rect x="34" y="92" width="102" height="18" rx="5" fill="#e8e5fb" opacity="0.9" />
      <rect x="38" y="78" width="94" height="16" rx="4" fill="#f0eeff" opacity="0.9" />
      <polygon points="85,28 140,52 85,68 30,52" fill="#a99dff" opacity="0.9" />
      <polygon points="85,28 140,52 85,40" fill="#8b7ee0" opacity="0.7" />
      <circle cx="85" cy="28" r="5" fill="#c4baff" />
      <line x1="140" y1="52" x2="145" y2="75" stroke="#e8c874" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="145" cy="78" r="4" fill="#e8c874" opacity="0.85" />
    </svg>
  );
}

function InterviewIllustration() {
  return (
    <svg viewBox="0 0 180 160" fill="none" className="sc-illustration">
      <rect x="54" y="28" width="72" height="64" rx="14" fill="#e8e5fb" opacity="0.95" />
      <rect x="62" y="36" width="56" height="50" rx="10" fill="#f0eeff" opacity="0.8" />
      <rect x="44" y="88" width="92" height="22" rx="10" fill="#dcd8f8" opacity="0.95" />
      <rect x="84" y="110" width="12" height="24" rx="4" fill="#ccc8f0" opacity="0.85" />
      <rect x="80" y="128" width="20" height="10" rx="4" fill="#bbb7e8" opacity="0.8" />
      <ellipse cx="90" cy="144" rx="42" ry="6" fill="#dcd8f8" opacity="0.5" />
    </svg>
  );
}

function RecitationIllustration() {
  return (
    <svg viewBox="0 0 180 160" fill="none" className="sc-illustration">
      <ellipse cx="90" cy="148" rx="60" ry="7" fill="#e0dcf8" opacity="0.5" />
      <path d="M20 50 Q88 38 88 130 L20 138 Z" fill="#f0eeff" opacity="0.95" />
      <path d="M160 50 Q92 38 92 130 L160 138 Z" fill="#e8e5fb" opacity="0.95" />
      <path d="M88 38 Q90 130 92 130 Q90 38 88 38Z" fill="#c4baff" opacity="0.7" />
      <rect x="16" y="130" width="148" height="12" rx="4" fill="#dcd8f8" opacity="0.9" />
    </svg>
  );
}

function GeneralIllustration() {
  return (
    <svg viewBox="0 0 180 160" fill="none" className="sc-illustration">
      <path d="M50 68 L130 68 L145 148 L35 148 Z" fill="#e8e5fb" opacity="0.95" />
      <path d="M54 72 L126 72 L140 144 L40 144 Z" fill="#f0eeff" opacity="0.85" />
      <rect x="36" y="52" width="108" height="22" rx="6" fill="#dcd8f8" opacity="0.95" />
      <ellipse cx="90" cy="18" rx="9" ry="12" fill="#dcd8f8" opacity="0.95" />
      <ellipse cx="90" cy="150" rx="56" ry="6" fill="#e0dcf8" opacity="0.45" />
    </svg>
  );
}

const SCENARIOS = [
  {
    id: "thesis",
    label: "Thesis Defense",
    hint: "Practice defending your research clearly and confidently.",
    Illustration: ThesisIllustration,
    iconPath:
      "M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
  },
  {
    id: "interview",
    label: "Job Interview",
    hint: "Ace your next interview with confident, clear answers.",
    Illustration: InterviewIllustration,
    iconPath:
      "M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM9 12H7m4 0h2m4 0h-2",
  },
  {
    id: "recitation",
    label: "Recitation",
    hint: "Practice reciting passages or poems with good pacing.",
    Illustration: RecitationIllustration,
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    id: "general",
    label: "General Speaking",
    hint: "Free-form practice for any speaking situation.",
    Illustration: GeneralIllustration,
    iconPath:
      "M12 1a3 3 0 013 3v8a3 3 0 01-6 0V4a3 3 0 013-3zM19 10a7 7 0 01-14 0M12 19v4M8 23h8",
  },
];

const BAR_COUNT = 55;

// Live mic-driven waveform — reads real frequency/amplitude data via AnalyserNode
function LiveWaveform({ stream }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const analRef   = useRef(null);

  useEffect(() => {
    if (!stream) return;

    // Build audio graph
    const ctx      = new (window.AudioContext || window.webkitAudioContext)();
    const source   = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize          = 128;
    analyser.smoothingTimeConstant = 0.78;
    source.connect(analyser);
    analRef.current = analyser;

    const dataArr = new Uint8Array(analyser.frequencyBinCount); // 64 bins

    const canvas = canvasRef.current;

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      if (!canvas) return;

      const { width: W, height: H } = canvas.getBoundingClientRect();
      canvas.width  = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      const dpr = window.devicePixelRatio;

      const g = canvas.getContext("2d");
      g.clearRect(0, 0, canvas.width, canvas.height);

      analyser.getByteFrequencyData(dataArr);

      const barW   = (canvas.width / BAR_COUNT) * 0.55;
      const gap    = (canvas.width - barW * BAR_COUNT) / (BAR_COUNT + 1);
      const cx     = canvas.height / 2;
      const maxH   = canvas.height * 0.88;

      // Mirror the bins symmetrically: use first half of bins for left→center, mirror for center→right
      for (let i = 0; i < BAR_COUNT; i++) {
        // Map bar index to frequency bin (use lower bins for voice — more dynamic)
        const binIdx = Math.floor((i / BAR_COUNT) * (dataArr.length * 0.6));
        // Mirror: left half uses ascending index, right half descends
        const mirrorIdx = i < BAR_COUNT / 2 ? i : BAR_COUNT - 1 - i;
        const bin  = Math.floor((mirrorIdx / (BAR_COUNT / 2)) * (dataArr.length * 0.55));
        const amp  = dataArr[bin] / 255;                        // 0–1
        const barH = Math.max(3 * dpr, amp * maxH);

        const x = gap + i * (barW + gap);

        // Gradient: purple core fading to pink at peaks
        const grad = g.createLinearGradient(0, cx - barH / 2, 0, cx + barH / 2);
        grad.addColorStop(0,   `rgba(180, 160, 255, ${0.5 + amp * 0.5})`);
        grad.addColorStop(0.5, `rgba(107,  92, 255, ${0.7 + amp * 0.3})`);
        grad.addColorStop(1,   `rgba(180, 160, 255, ${0.5 + amp * 0.5})`);

        g.fillStyle   = grad;
        g.beginPath();
        g.roundRect(x, cx - barH / 2, barW, barH, barW / 2);
        g.fill();
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      source.disconnect();
      ctx.close();
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      className="pp-live-waveform"
      aria-hidden="true"
    />
  );
}

// Static decorative waveform (pre/post recording)
function WaveformBars({ count = 60 }) {
  const heights = Array.from({ length: count }, (_, i) => {
    const t = i / count;
    return 4 + 28 * Math.abs(Math.sin(t * Math.PI * 6 + 0.5)) * 0.8;
  });
  return (
    <div className="pp-waveform-static">
      {heights.map((h, i) => (
        <div key={i} className="pp-wave-bar-static" style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}

function StatsStrip({ isRecording, audioBlob, elapsed, duration }) {
  const fmt = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const durationCompleted = audioBlob && !isRecording;

  return (
    <div className="pp-stats-strip">
      <div className="pp-stat-cell">
        <div className="pp-stat-icon-label">〰️ WPM</div>
        <div className={`pp-stat-value ${isRecording ? "pp-dash" : ""}`}>
          ––
        </div>
        <div className="pp-stat-sub">
          {durationCompleted ? "Results available in feedback" : "Calculating..."}
        </div>
      </div>

      <div className="pp-stat-cell">
        <div className="pp-stat-icon-label">💬 Fillers</div>
        <div className={`pp-stat-value ${isRecording ? "pp-dash" : ""}`}>
          ––
        </div>
        <div className="pp-stat-sub">
          {durationCompleted ? "Results available in feedback" : "Calculating..."}
        </div>
      </div>

      <div className="pp-stat-cell">
        <div className="pp-stat-icon-label">⏱ Duration</div>
        <div className="pp-stat-value">{fmt(isRecording ? elapsed : duration)}</div>
        <div className={`pp-stat-sub ${durationCompleted ? "pp-green" : ""}`}>
          {isRecording
            ? "Recording in progress"
            : durationCompleted
            ? "Completed"
            : "Not started"}
        </div>
      </div>
    </div>
  );
}

function TipsAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div className="pp-tips-accordion">
      <div className="pp-tips-header" onClick={() => setOpen(!open)}>
        <div className="pp-tips-header-left">
          <div className="pp-tips-icon">💡</div>
          <div>
            <div className="pp-tips-title">Speaking Tips</div>
            <div className="pp-tips-subtitle">
              Guidance to help you speak clearly and confidently.
            </div>
          </div>
        </div>
        <span className={`pp-tips-chevron ${open ? "open" : ""}`}>⌄</span>
      </div>

      {open && (
        <div className="pp-tips-body">
          <div className="pp-tip">
            💡 Speak at a comfortable pace — 120–160 WPM is ideal for clarity.
          </div>
          <div className="pp-tip">
            🎯 Replace "uh", "um", "like" with a confident pause instead.
          </div>
          <div className="pp-tip">
            ⏱️ Aim for at least 30 seconds for a more accurate analysis.
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticePage({ navigate, user }) {
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [micStream, setMicStream] = useState(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
    } catch (e) {
      // permission denied — recorder will handle its own error
    }
    startRecording();
  };

  const handleStopRecording = () => {
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      setMicStream(null);
    }
    stopRecording();
  };

  const {
    isRecording,
    audioBlob,
    duration,
    elapsed,
    error,
    startRecording,
    stopRecording,
    getExtension,
  } = useRecorder();

  const fmt = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleAnalyze = async () => {
    if (!audioBlob || !scenario) return;

    setLoading(true);

    const messages = [
      "Uploading your recording…",
      "Transcribing with Whisper…",
      "Analyzing speech patterns…",
      "Generating AI coaching…",
    ];

    let msgIdx = 0;
    setLoadingMsg(messages[0]);

    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setLoadingMsg(messages[msgIdx]);
    }, 2200);

    try {
      const formData = new FormData();
      const ext = getExtension ? getExtension() : "webm";

      formData.append("audio", audioBlob, `recording.${ext}`);
      formData.append("scenario", scenario.label);
      formData.append("duration", duration.toString());

      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      let data;

      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned invalid response (status ${res.status})`);
      }

      if (!res.ok) throw new Error(data?.error || `Server error ${res.status}`);

      if (!data || (!data.transcript && !data.metrics)) {
        throw new Error("Analysis returned empty results. Please try again.");
      }

      clearInterval(msgInterval);
      navigate("results", data);
    } catch (err) {
      clearInterval(msgInterval);
      setLoading(false);
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="pp-root">
        <div className="pp-main">
          <Topbar user={user} />

          <div className="pp-content pp-center">
            <div className="pp-loading-box">
              <div className="pp-spinner" />
              <p className="pp-loading-msg">{loadingMsg}</p>
              <p className="pp-loading-sub">
                Hang tight — this takes about 10–20 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="pp-root">
        <div className="pp-main">
          <Topbar user={user} />

          <div className="pp-content">
            <div className="pp-top-row">
              <button className="pp-back-btn" onClick={() => navigate("dashboard")}>
                ← Back
              </button>
              <span className="pp-step-badge">STEP 1 OF 2</span>
              <div />
            </div>

            <div className="pp-heading">
              <h1>Choose a scenario</h1>
              <p>Pick the speaking situation you want to practice today.</p>
            </div>

            <div className="pp-scenario-grid">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  className="pp-sc-card"
                  onClick={() => setScenario(s)}
                >
                  <div className="pp-sc-icon-wrap">
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={s.iconPath}
                      />
                    </svg>
                  </div>

                  <div className="pp-sc-text">
                    <span className="pp-sc-label">{s.label}</span>
                    <span className="pp-sc-hint">{s.hint}</span>
                  </div>

                  <div className="pp-sc-chevron">›</div>

                  <div className="pp-sc-art">
                    <s.Illustration />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recordingDone = audioBlob && !isRecording;
  const now = new Date();

  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="pp-root">
      <div className="pp-main">
        <Topbar user={user} />

        <div className="pp-content">
          <div className="pp-top-row">
            <button className="pp-back-btn" onClick={() => setScenario(null)}>
              ← Back to Scenarios
            </button>
            <span className="pp-step-badge">STEP 2 OF 2</span>
            <div />
          </div>

          <div className="pp-heading">
            <h1>Record your speech</h1>
            <div>
              <span className="pp-scenario-chip">{scenario.label}</span>
            </div>
          </div>

          <div className="pp-record-card">
            {!recordingDone ? (
              <>
                {isRecording && (
                  <div className="pp-record-status-bar">
                    <div className="pp-record-dot-label">
                      <div className="pp-record-dot" />
                      Recording...
                    </div>
                    <div className="pp-record-time-badge">{fmt(elapsed)}</div>
                  </div>
                )}

                <div className="pp-timer">{fmt(isRecording ? elapsed : 0)}</div>

                {isRecording ? (
                  <LiveWaveform stream={micStream} />
                ) : (
                  <div style={{ height: 52, marginBottom: 20 }} />
                )}

                <p className="pp-record-status">
                  {!isRecording
                    ? "Press the button below to start recording"
                    : "Recording… speak clearly into your microphone"}
                </p>

                {error && <p className="pp-record-error">⚠️ {error}</p>}

                <button
                  className={`pp-record-btn ${
                    isRecording ? "pp-recording" : "pp-idle"
                  }`}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                >
                  {isRecording ? (
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="white">
                      <rect x="5" y="5" width="16" height="16" rx="3" />
                    </svg>
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="white">
                      <rect x="9" y="3" width="8" height="13" rx="4" />
                      <path
                        d="M4 13a9 9 0 0018 0"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                      <line
                        x1="13"
                        y1="22"
                        x2="13"
                        y2="25"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>

                <p className={`pp-record-hint ${isRecording ? "" : "pp-idle-hint"}`}>
                  {isRecording ? "Stop Recording" : "Tap to record"}
                </p>

                <div className="pp-privacy-note">
                  Your recording is private and securely processed.
                </div>
              </>
            ) : (
              <>
                <div className="pp-record-completed-header">
                  <div className="pp-record-completed-left">
                    <div className="pp-check-circle">✓</div>
                    <div>
                      <div className="pp-completed-label">Recording completed!</div>
                      <div className="pp-completed-date">
                        {dateStr} • {timeStr}
                      </div>
                    </div>
                  </div>

                  <div className="pp-duration-badge">
                    <span className="pp-duration-label">Duration</span>
                    <span className="pp-duration-value">{fmt(duration)}</span>
                  </div>
                </div>

                <div className="pp-playback-row">
                  <button className="pp-play-btn">▶</button>

                  <div className="pp-waveform-track">
                    {Array.from({ length: 70 }, (_, i) => {
                      const h = 4 + 22 * Math.abs(Math.sin(i * 0.35 + 0.7));
                      return (
                        <div
                          key={i}
                          className={
                            i < 35
                              ? "pp-waveform-bar-played"
                              : "pp-waveform-bar-unplayed"
                          }
                          style={{ height: `${h}px` }}
                        />
                      );
                    })}
                  </div>

                  <span className="pp-playback-time">{fmt(duration)}</span>
                </div>

                <div className="pp-action-btns">
                  <button className="pp-btn-outline" onClick={startRecording}>
                    Re-record
                  </button>
                  <button className="pp-btn-outline">Play Recording</button>
                  <button className="pp-btn-outline">Download</button>
                </div>
              </>
            )}
          </div>

          <StatsStrip
            isRecording={isRecording}
            audioBlob={audioBlob}
            elapsed={elapsed}
            duration={duration}
          />

          <TipsAccordion />

          <div className="pp-bottom-row">
            <button className="pp-btn-cancel" onClick={() => setScenario(null)}>
              Cancel
            </button>

            <button
              className="pp-btn-finish"
              onClick={handleAnalyze}
              disabled={!audioBlob || isRecording}
            >
              {recordingDone ? "View Feedback" : "Finish Session"} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}