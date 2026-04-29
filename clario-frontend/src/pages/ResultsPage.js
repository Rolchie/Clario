// src/pages/ResultsPage.js
import React, { useEffect, useRef, useState } from "react";
import { saveSession } from "../utils/firebase";
import "./ResultsPage.css";

function HighlightedTranscript({ transcript, fillerBreakdown, lowConfidenceWords }) {
  if (!transcript) return <span>No transcript available.</span>;

  const fillerSet = new Set(
    (fillerBreakdown || []).map((f) => f.word.toLowerCase())
  );

  const lowConfSet = new Set(
    (lowConfidenceWords || []).map((w) => w.word.toLowerCase())
  );

  const tokens = transcript.split(/(\s+)/);

  return (
    <span>
      {tokens.map((token, i) => {
        const clean = token.toLowerCase().replace(/[^a-z]/g, "").trim();

        if (!clean) return <span key={i}>{token}</span>;

        if (fillerSet.has(clean)) {
          return (
            <mark key={i} className="highlight-filler" title="Filler word">
              {token}
            </mark>
          );
        }

        if (lowConfSet.has(clean)) {
          return (
            <mark key={i} className="highlight-pronunciation" title="Unclear pronunciation">
              {token}
            </mark>
          );
        }

        return <span key={i}>{token}</span>;
      })}
    </span>
  );
}

function ScoreRing({ score }) {
  const s = Number(score) || 0;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (s / 100) * circ;

  const color = s >= 80 ? "#4ecca3" : s >= 65 ? "#ffd166" : "#fc6c8f";
  const label = s >= 80 ? "Excellent" : s >= 65 ? "Good" : s >= 50 ? "Fair" : "Needs Work";

  return (
    <div className="score-ring-wrap">
      <div className="score-ring">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle className="score-ring-bg" cx="60" cy="60" r={r} />
          <circle
            className="score-ring-fill"
            cx="60"
            cy="60"
            r={r}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            stroke={color}
          />
        </svg>

        <div className="score-ring-text">
          <span className="score-num" style={{ color }}>{s}</span>
          <span className="score-label">/100</span>
        </div>
      </div>

      <span className="score-status" style={{ color, borderColor: `${color}55`, background: `${color}14` }}>
        {label}
      </span>
    </div>
  );
}

function ScoreBar({ label, value, icon }) {
  const v = Number(value) || 0;
  const color = v >= 80 ? "#4ecca3" : v >= 60 ? "#ffd166" : "#fc6c8f";

  return (
    <div className="score-bar-item">
      <div className="score-bar-top">
        <span className="score-bar-icon">{icon}</span>
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-value" style={{ color }}>{v}</span>
      </div>

      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${v}%`, background: color }} />
      </div>
    </div>
  );
}

function MetricCard({ value, unit, label, note, color = "#5b4fcf" }) {
  return (
    <div className="metric-card">
      <span className="metric-value" style={{ color }}>{value ?? "—"}</span>
      <span className="metric-unit">{unit}</span>
      <span className="metric-label">{label}</span>
      {note && <span className="metric-note">{note}</span>}
    </div>
  );
}

function RecordingBanner({ duration, audioUrl }) {
  const audioRef = useRef(null);
  const rafRef   = useRef(null);
  const [playing,  setPlaying]  = useState(false);
  const [elapsed,  setElapsed]  = useState(0);
  // Always seed from the recorder's elapsed timer — audio.duration is
  // Infinity for MediaRecorder webm blobs (no duration metadata written).
  const [total,    setTotal]    = useState(duration || 0);

  // Guard: never format Infinity or NaN — fall back to 0
  const fmt = (s) => {
    const sec = Math.max(0, Math.floor(isFinite(s) ? s : 0));
    return `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;
  };

  const fmtShort = (s) => {
    const sec = Math.max(0, Math.floor(isFinite(s) ? s : 0));
    return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;
  };

  // Keep total in sync — but ignore Infinity (webm MediaRecorder blobs
  // don't embed duration, so audio.duration === Infinity until the full
  // file is decoded, which never happens for a blob URL).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onMeta = () => {
      const d = audio.duration;
      if (isFinite(d) && d > 0) setTotal(d);
      // else: keep the duration prop value already in state
    };
    const onEnded = () => { setPlaying(false); setElapsed(0); };
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [duration]);

  // RAF loop while playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      const tick = () => {
        setElapsed(audio.currentTime);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const seekTo = (e) => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    const safeDuration = isFinite(total) && total > 0 ? total
                       : isFinite(duration) && duration > 0 ? duration : 0;
    if (!safeDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * safeDuration;
    setElapsed(audio.currentTime);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const heights = Array.from({ length: 80 }, (_, i) => 6 + 26 * Math.abs(Math.sin(i * 0.38 + 0.9)));
  const totalSec = total || duration || 1;
  const progress = Math.min(1, elapsed / totalSec);
  const filledCount = Math.round(progress * heights.length);
  const hasAudio = !!audioUrl;

  return (
    <div className="recording-banner">
      {hasAudio && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      <div className="recording-banner-top">
        <div className="recording-banner-left">
          <div className="banner-check">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="banner-title">Recording completed!</div>
            <div className="banner-date">{dateStr} • {timeStr}</div>
          </div>
        </div>

        <div className="banner-duration-wrap">
          <span className="banner-duration-label">Duration</span>
          <span className="banner-duration-value">{fmt(totalSec)}</span>
        </div>
      </div>

      <div className="banner-waveform-row">
        <button
          className="banner-play-btn"
          type="button"
          onClick={togglePlay}
          disabled={!hasAudio}
          title={hasAudio ? (playing ? "Pause" : "Play") : "No audio available"}
          style={{ opacity: hasAudio ? 1 : 0.45, cursor: hasAudio ? "pointer" : "default" }}
        >
          {playing ? (
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        {/* Clickable waveform acts as seek bar */}
        <div
          className="banner-waveform-bars"
          onClick={seekTo}
          style={{ cursor: hasAudio ? "pointer" : "default" }}
        >
          {heights.map((h, i) => (
            <div
              key={i}
              className={i < filledCount ? "banner-bar banner-bar-filled" : "banner-bar banner-bar-empty"}
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        <span className="banner-time">{fmt(elapsed || 0)}</span>
      </div>

      <div className="banner-progress-row">
        <span className="banner-progress-elapsed">{fmtShort(elapsed)}</span>
        <div
          className="banner-progress-track"
          onClick={seekTo}
          style={{ cursor: hasAudio ? "pointer" : "default" }}
        >
          <div className="banner-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="banner-progress-total">{fmtShort(totalSec)}</span>
      </div>
    </div>
  );
}

function FormattedFeedback({ feedback }) {
  if (!feedback) {
    return (
      <p className="empty-text">
        No feedback available.
      </p>
    );
  }

  const SECTIONS = [
    { key: "WHAT YOU DID WELL", icon: "🏆" },
    { key: "WHAT TO WORK ON", icon: "⭐" },
    { key: "HOW TO IMPROVE", icon: "📈" },
    { key: "YOUR CHALLENGE FOR TODAY", icon: "🎯" },
  ];

  const lines = feedback.split("\n").filter(Boolean);
  const parsed = [];
  let current = null;

  for (const line of lines) {
    const clean = line.replace(/\*\*/g, "").trim();
    const matchedSection = SECTIONS.find((s) =>
      clean.toUpperCase().includes(s.key)
    );

    if (matchedSection) {
      if (current) parsed.push(current);
      current = { ...matchedSection, text: "" };
    } else if (current) {
      current.text += (current.text ? " " : "") + clean;
    } else {
      current = { key: "FEEDBACK", icon: "🤖", text: clean };
    }
  }

  if (current) parsed.push(current);

  return (
    <div className="feedback-sections-list">
      {parsed.map((section, i) => (
        <div key={i} className="feedback-section-row">
          <div className="feedback-section-icon-wrap">
            <span>{section.icon}</span>
          </div>

          <div className="feedback-section-content">
            <div className="feedback-section-header">{section.key}</div>
            <p className="feedback-para">
              {section.text || feedback.replace(/\*\*/g, "")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PronunciationCoach({ pronunciationTips, lowConfidenceWords, avgConfidence }) {
  const [expanded, setExpanded] = useState(null);

  const hasTips = pronunciationTips && pronunciationTips.length > 0;
  const hasFlags = lowConfidenceWords && lowConfidenceWords.length > 0;
  const clarity = Number(avgConfidence) || 95;

  const getColor = (prob) =>
    prob >= 75 ? "#ffd166" : prob >= 50 ? "#fc8c4a" : "#fc6c8f";

  return (
    <div className="pronunciation-card">
      <div className="coach-card-header">
        <div className="coach-icon">🗣️</div>
        <div>
          <h3>Pronunciation Coach</h3>
          <p>Analyzed from your actual speech · Clarity: {clarity}%</p>
        </div>
      </div>

      {!hasFlags ? (
        <div className="pronunciation-clean">
          <span>✅</span>
          <p>No significant clarity issues detected. Your words came through clearly!</p>
        </div>
      ) : (
        <div className="mispronounced-section">
          <p className="mispronounced-intro">
            Words that were unclear in your recording — lower % = harder to understand:
          </p>

          <div className="mispronounced-grid">
            {lowConfidenceWords.map((w, i) => (
              <div
                key={i}
                className="mispronounced-chip"
                style={{ borderColor: getColor(w.prob) }}
              >
                <span className="mis-word">"{w.word}"</span>
                <span className="mis-prob" style={{ color: getColor(w.prob) }}>
                  {w.prob}%
                </span>
                <span className="mis-label" style={{ color: getColor(w.prob) }}>
                  {w.prob >= 75 ? "Slight issue" : w.prob >= 50 ? "Unclear" : "Hard to hear"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasTips && (
        <div className="pron-tips-section">
          <p className="tips-label">💬 Specific corrections based on what you said:</p>

          <div className="pron-tips-list">
            {pronunciationTips.map((tip, i) => (
              <div
                key={i}
                className={`pron-tip-card ${expanded === i ? "expanded" : ""}`}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="pron-tip-header">
                  <div className="pron-tip-left">
                    <span className="pron-tip-word">"{tip.word}"</span>
                    <span className="pron-tip-issue">{tip.issue}</span>
                  </div>

                  <span className="pron-tip-toggle">{expanded === i ? "▲" : "▼"}</span>
                </div>

                {expanded === i && (
                  <div className="pron-tip-body">
                    {tip.correct && (
                      <div className="pron-detail">
                        <span className="pron-detail-label">Correct pronunciation</span>
                        <span className="pron-detail-value correct">{tip.correct}</span>
                      </div>
                    )}

                    {tip.tip && (
                      <div className="pron-detail">
                        <span className="pron-detail-label">Quick fix</span>
                        <span className="pron-detail-value">{tip.tip}</span>
                      </div>
                    )}

                    {tip.example && (
                      <div className="pron-detail">
                        <span className="pron-detail-label">Example</span>
                        <span className="pron-detail-value example">"{tip.example}"</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DebugPanel({ results }) {
  const [show, setShow] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div style={{ margin: "16px 0" }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          fontSize: 12,
          opacity: 0.5,
          background: "none",
          border: "1px solid #333",
          color: "#888",
          padding: "4px 10px",
          cursor: "pointer",
          borderRadius: 4,
        }}
      >
        {show ? "Hide" : "Show"} raw data
      </button>

      {show && (
        <div className="debug-panel">
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage({ navigate, results }) {
  const saved = useRef(false);

  const transcript = results?.transcript || "";
  const metrics = results?.metrics || {};
  const fillers = results?.fillers || { total: 0, breakdown: [], ratio: 0 };
  const repetition = results?.repetition || [];
  const scores = results?.scores || {};
  const feedback = results?.feedback || "";
  const pronunciationTips = results?.pronunciationTips || [];
  const avgConfidence = results?.avgConfidence ?? 95;
  const lowConfidenceWords = results?.lowConfidenceWords || [];
  const scenario = results?.scenario || "General Speaking";

  useEffect(() => {
    // FIX: Only depend on `results` object identity (set once from server response).
    // Using transcript/metrics/etc as deps caused issues because they're derived
    // from results on every render, making the dep array unreliable.
    if (!saved.current && results?.transcript) {
      saved.current = true;

      const sessionPayload = {
        scenario,
        transcript,
        metrics: {
          ...metrics,
          score:        Number(scores?.overall)  || 0,
          totalFillers: Number(fillers?.total)   || 0,
          fillerRatio:  Number(fillers?.ratio)   || 0,
          duration:     Number(metrics?.duration) || 0,
        },
        fillers,
        scores,
        feedback,
      };

      // Await inside an async IIFE so we can log success/failure
      (async () => {
        try {
          const id = await saveSession(sessionPayload);
          if (id) {
            console.log("✅ Session saved to Firestore:", id);
          } else {
            console.warn("⚠️ saveSession returned null — check firebase.js logs");
          }
        } catch (err) {
          console.error("❌ Unexpected saveSession error:", err);
        }
      })();
    }
  // eslint-disable-next-line
  }, [results]);

  if (!results) {
    return (
      <div className="results-page center">
        <div className="results-empty-state">
          <p>No results found. Please try recording again.</p>
          <button className="btn btn-primary" onClick={() => navigate("practice")}>
            Practice Again
          </button>
        </div>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="results-page center">
        <div className="results-empty-state">
          <p>⚠️ Transcript was empty — no speech was detected.</p>
          <p>Try speaking louder or closer to your microphone.</p>
          <button className="btn btn-primary" onClick={() => navigate("practice")}>
            Try Again
          </button>
          <DebugPanel results={results} />
        </div>
      </div>
    );
  }

  const overall = Number(scores?.overall) || 0;
  const wpm = Number(metrics?.wpm) || 0;
  const wordCount = Number(metrics?.wordCount) || 0;
  const pace = metrics?.pace || "Unknown";
  const totalFillers = Number(fillers?.total) || 0;
  const fillerRatio = Number(fillers?.ratio) || 0;

  const paceColor =
    pace === "Ideal" ? "#4ecca3" : pace === "Too Fast" ? "#fc6c8f" : "#ffd166";

  const fillerColor =
    totalFillers === 0 ? "#4ecca3" : totalFillers <= 5 ? "#ffd166" : "#fc6c8f";

  const hasFillers = (fillers?.breakdown || []).length > 0;
  const hasReps = repetition.length > 0;

  return (
    <div className="results-page">
      <div className="results-inner">
        <div className="results-header">
          <button className="results-back-btn" onClick={() => navigate("practice")}>
            ← Back to Practice
          </button>

          <span className="tag tag-purple">Step 2 of 2</span>
          <h1>Feedback</h1>
          <span className="tag tag-purple">💼 {scenario}</span>
        </div>

        <DebugPanel results={results} />

        <RecordingBanner duration={metrics?.duration || 0} audioUrl={results?.audioUrl || null} />

        <div className="card transcript-section">
          <div className="transcript-header-row">
            <span className="transcript-title">📝 Your Transcript</span>

            <div className="transcript-legend">
              {hasFillers && <mark className="legend-mark filler-legend">filler word</mark>}
              {lowConfidenceWords.length > 0 && (
                <mark className="legend-mark pronunciation-legend">unclear word</mark>
              )}
            </div>
          </div>

          <div className="transcript-body-open">
            <HighlightedTranscript
              transcript={transcript}
              fillerBreakdown={fillers?.breakdown}
              lowConfidenceWords={lowConfidenceWords}
            />
          </div>
        </div>

        <div className="score-row">
          <ScoreRing score={overall} />

          <div className="score-bars">
            <ScoreBar label="Pronunciation" value={scores?.pronunciation ?? 0} icon="🎙️" />
            <ScoreBar label="Speech Pace" value={scores?.pace ?? 0} icon="⏱️" />
            <ScoreBar label="Filler Words" value={scores?.fillers ?? 0} icon="💬" />
            <ScoreBar label="Flow" value={scores?.flow ?? 0} icon="〰️" />
          </div>
        </div>

        <div className="metrics-row">
          <MetricCard label="Words" value={wordCount} unit="TOTAL" color="#5b4fcf" />
          <MetricCard label="Speech Rate" value={wpm} unit="WPM" color={paceColor} note={pace} />
          <MetricCard
            label="Fillers"
            value={totalFillers}
            unit="WORDS"
            color={fillerColor}
            note={`${fillerRatio}% of speech`}
          />
          <MetricCard
            label="Clarity"
            value={`${avgConfidence}%`}
            unit=""
            color={avgConfidence >= 85 ? "#4ecca3" : avgConfidence >= 70 ? "#ffd166" : "#fc6c8f"}
            note="pronunciation"
          />
        </div>

        <div className="feedback-card">
          <div className="feedback-top-banner">
            <div className="feedback-bot-icon">🤖</div>
            <div>
              <div className="feedback-top-title">AI Coaching Feedback</div>
              <div className="feedback-top-sub">Personalized insight powered by AI</div>
            </div>
          </div>

          <FormattedFeedback feedback={feedback} />
        </div>

        <PronunciationCoach
          pronunciationTips={pronunciationTips}
          lowConfidenceWords={lowConfidenceWords}
          avgConfidence={avgConfidence}
        />

        {hasFillers && (
          <div className="card filler-section">
            <h3 className="section-h3">🔍 Filler Word Breakdown</h3>

            <div className="filler-chips">
              {[...(fillers?.breakdown || [])]
                .sort((a, b) => b.count - a.count)
                .map(({ word, count }) => (
                  <div key={word} className="filler-chip">
                    <span className="filler-word">"{word}"</span>
                    <span className="filler-count">{count}×</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {hasReps && (
          <div className="card repetition-section">
            <h3 className="section-h3">🔁 Repeated Phrases</h3>

            <div className="repetition-chips">
              {repetition.map((r, i) => (
                <div key={i} className="repetition-chip">
                  <span className="rep-phrase">"{r.phrase}"</span>
                  <span className="rep-count">{r.count}×</span>
                </div>
              ))}
            </div>

            <p className="rep-advice">
              Try varying your language to keep your listener engaged.
            </p>
          </div>
        )}

        <div className="results-actions">
          <button className="btn btn-primary" onClick={() => navigate("practice")}>
            Practice Again
          </button>

          <button className="btn btn-outline" onClick={() => navigate("progress")}>
            View Progress
          </button>
        </div>
      </div>
    </div>
  );
}