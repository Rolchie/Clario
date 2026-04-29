// src/pages/DashboardPage.js
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getSessions } from "../utils/firebase";
import "./DashboardPage.css";

// ── Donut Chart ────────────────────────────────────────────────────────────
function DonutChart({ percent }) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  const r     = 44;
  const circ  = 2 * Math.PI * r;
  const dash  = (value / 100) * circ;
  const color = value >= 80 ? "#4ecca3" : value >= 50 ? "#6b5cff" : "#fc6c8f";
  return (
    <div className="db-donut">
      <svg width="116" height="116" viewBox="0 0 116 116">
        <circle cx="58" cy="58" r={r} fill="none" stroke="#ece7ff" strokeWidth="12" />
        <circle
          cx="58" cy="58" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 58 58)"
          style={{ transition: "stroke-dasharray 1.2s ease" }}
        />
      </svg>
      <div className="db-donut-text"><span>{value}%</span></div>
    </div>
  );
}

// ── Streak dot ─────────────────────────────────────────────────────────────
function StreakDot({ done }) {
  return (
    <div className={`db-streak-dot ${done ? "done" : "empty"}`}>
      {done && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// ── Score bar ──────────────────────────────────────────────────────────────
function ScoreBar({ label, value, color }) {
  return (
    <div className="db-score-bar-item">
      <div className="db-score-bar-top">
        <span className="db-score-bar-label">{label}</span>
        <span className="db-score-bar-value" style={{ color }}>{value ?? "—"}</span>
      </div>
      <div className="db-score-bar-track">
        <div
          className="db-score-bar-fill"
          style={{
            width: value != null ? `${Math.min(value, 100)}%` : "0%",
            background: color,
          }}
        />
      </div>
    </div>
  );
}

// ── Date helpers ──────────────────────────────────────────────────────────
function getSessionDate(session) {
  const raw =
    session?.createdAt ??
    session?.date ??
    session?.timestamp ??
    session?.recordedAt ??
    null;
  if (!raw) return null;
  if (typeof raw?.toDate === "function") return raw.toDate();
  if (typeof raw === "object" && typeof raw.seconds === "number")
    return new Date(raw.seconds * 1000);
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function toDateKey(d) {
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeeklyStreak(sessions) {
  const today     = new Date();
  const dayOfWeek = today.getDay();                       // 0 = Sun
  const monOff    = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday    = new Date(today);
  monday.setDate(today.getDate() + monOff);
  monday.setHours(0, 0, 0, 0);

  const keys = new Set(
    sessions.map(getSessionDate).filter(Boolean).map(toDateKey)
  );

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return keys.has(toDateKey(d));
  });
}

// ── Metric extractors ─────────────────────────────────────────────────────
function getScore(s) {
  const n = Number(s?.scores?.overall ?? s?.metrics?.score ?? s?.score ?? null);
  return isNaN(n) ? null : n;
}
function getWPM(s) {
  const n = Number(s?.metrics?.wpm ?? s?.wpm ?? null);
  return isNaN(n) ? null : n;
}
function getFillers(s) {
  const n = Number(s?.metrics?.totalFillers ?? s?.fillerCount ?? s?.fillers ?? null);
  return isNaN(n) ? null : n;
}
function getDurationLabel(s) {
  const secs = s?.metrics?.duration ?? s?.duration ?? null;
  if (secs == null) return null;
  const m = Math.floor(Number(secs) / 60);
  const sec = Math.round(Number(secs) % 60);
  return m > 0 ? `${m}m${sec > 0 ? ` ${sec}s` : ""}` : `${sec}s`;
}
function getScenarioIcon(scenario) {
  if (!scenario) return "🎤";
  const s = scenario.toLowerCase();
  if (s.includes("thesis"))     return "🎓";
  if (s.includes("interview"))  return "💼";
  if (s.includes("recitation")) return "📖";
  return "🎤";
}

// ── Tips data ─────────────────────────────────────────────────────────────
const ALL_TIPS = [
  { id: 1,  category: "Pacing",     icon: "⏸️",  title: "Pause for effect",        body: "Short pauses help your ideas land and keep your listeners engaged. Aim for 1–2 second pauses after key points." },
  { id: 2,  category: "Pacing",     icon: "🐢",  title: "Slow down",               body: "Most speakers talk too fast when nervous. Consciously slow your pace by 20% — it sounds deliberate, not slow." },
  { id: 3,  category: "Pacing",     icon: "🎵",  title: "Vary your rhythm",        body: "Alternating fast and slow delivery keeps audiences alert. Speed up for excitement, slow down for emphasis." },
  { id: 4,  category: "Clarity",    icon: "🔤",  title: "Enunciate clearly",       body: "Open your mouth wider than feels natural. Crisp consonants at word endings make a huge difference in clarity." },
  { id: 5,  category: "Clarity",    icon: "🧩",  title: "One idea per sentence",   body: "Break complex thoughts into short sentences. Listeners can't rewind — make each sentence stand on its own." },
  { id: 6,  category: "Clarity",    icon: "🗂️",  title: "Use signposting",         body: "Signal structure with phrases like 'First…', 'Most importantly…', 'To summarize…'. Signposts guide listeners through your talk." },
  { id: 7,  category: "Confidence", icon: "🧍",  title: "Plant your feet",         body: "Stand with feet shoulder-width apart. A stable base projects confidence and prevents nervous swaying." },
  { id: 8,  category: "Confidence", icon: "👁️",  title: "Make eye contact",        body: "Hold eye contact for 3–5 seconds per person. It builds trust and makes every listener feel personally addressed." },
  { id: 9,  category: "Confidence", icon: "💪",  title: "Power pose before speaking", body: "Stand tall with hands on hips for 2 minutes before your talk. Studies show this reduces cortisol and boosts confidence." },
  { id: 10, category: "Fillers",    icon: "🤫",  title: "Replace fillers with silence", body: "Every time you feel an 'um' or 'uh' coming, just pause instead. Silence sounds far more authoritative than fillers." },
  { id: 11, category: "Fillers",    icon: "🎯",  title: "Identify your filler words", body: "Record yourself and count your top filler words. Awareness alone reduces them by up to 40% in follow-up recordings." },
  { id: 12, category: "Fillers",    icon: "🔄",  title: "Practice filler-free transitions", body: "Rehearse transitions like 'Which brings me to…' or 'Building on that…' to replace filler-heavy bridges between ideas." },
  { id: 13, category: "Voice",      icon: "🔊",  title: "Project from your diaphragm", body: "Place a hand on your belly — it should push out when you speak. Diaphragm breathing gives you power and prevents vocal fatigue." },
  { id: 14, category: "Voice",      icon: "🎭",  title: "Use vocal variety",       body: "Change your pitch, volume, and speed deliberately. A monotone voice loses audiences within 30 seconds." },
  { id: 15, category: "Voice",      icon: "💧",  title: "Stay hydrated",           body: "Drink water at room temperature before speaking. Cold water constricts vocal cords — warm water keeps them loose and resonant." },
];

const TIP_CATEGORIES = ["All", ...Array.from(new Set(ALL_TIPS.map(t => t.category)))];

// ── Tips Drawer ───────────────────────────────────────────────────────────
function TipsDrawer({ open, onClose, activeTipId }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedId, setExpandedId]         = useState(activeTipId ?? null);

  // Sync expanded tip when drawer opens from a specific tip
  useEffect(() => {
    if (open) setExpandedId(activeTipId ?? null);
  }, [open, activeTipId]);

  const filtered = activeCategory === "All"
    ? ALL_TIPS
    : ALL_TIPS.filter(t => t.category === activeCategory);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`db-drawer-backdrop ${open ? "db-drawer-backdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`db-drawer ${open ? "db-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Speaking tips"
      >
        {/* Header */}
        <div className="db-drawer-header">
          <div className="db-drawer-title-row">
            <span className="db-drawer-title-icon">💡</span>
            <div>
              <h2 className="db-drawer-title">Speaking Tips</h2>
              <p className="db-drawer-subtitle">{ALL_TIPS.length} tips to elevate your speech</p>
            </div>
          </div>
          <button className="db-drawer-close" onClick={onClose} aria-label="Close tips">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Category pills */}
        <div className="db-drawer-cats">
          {TIP_CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`db-cat-pill ${activeCategory === cat ? "db-cat-pill--active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tips list */}
        <div className="db-drawer-list">
          {filtered.map((tip) => {
            const isOpen = expandedId === tip.id;
            return (
              <div
                key={tip.id}
                className={`db-tip-item ${isOpen ? "db-tip-item--open" : ""}`}
              >
                <button
                  className="db-tip-item-header"
                  onClick={() => setExpandedId(isOpen ? null : tip.id)}
                  aria-expanded={isOpen}
                >
                  <span className="db-tip-item-icon">{tip.icon}</span>
                  <span className="db-tip-item-title">{tip.title}</span>
                  <span className="db-tip-item-cat">{tip.category}</span>
                  <span className="db-tip-item-chevron">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="db-tip-item-body">
                    <p>{tip.body}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>,
    document.body
  );
}

// ── Component ─────────────────────────────────────────────────────────────
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function DashboardPage({ navigate, user, onLogout }) {
  const [sessions,       setSessions]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [tipsOpen,       setTipsOpen]       = useState(false);
  const [activeTipId,    setActiveTipId]    = useState(null);
  const [currentTipIdx,  setCurrentTipIdx]  = useState(0);

  // Rotate tip of the day every 10 seconds while drawer is closed
  useEffect(() => {
    if (tipsOpen) return;
    const id = setInterval(() => {
      setCurrentTipIdx(i => (i + 1) % ALL_TIPS.length);
    }, 10000);
    return () => clearInterval(id);
  }, [tipsOpen]);

  const currentTip = ALL_TIPS[currentTipIdx];

  useEffect(() => {
    getSessions(50)
      .then(data => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Computed values ──────────────────────────────────────────────────────
  const scores = useMemo(() =>
    sessions.map(getScore).filter(n => n !== null), [sessions]);

  const averageScore = useMemo(() =>
    scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0,
  [scores]);

  const bestScore = useMemo(() =>
    scores.length ? Math.max(...scores) : 0, [scores]);

  const avgWPM = useMemo(() => {
    const vals = sessions.map(getWPM).filter(n => n !== null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }, [sessions]);

  const avgFillers = useMemo(() => {
    const vals = sessions.map(getFillers).filter(n => n !== null);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }, [sessions]);

  const streakDays  = useMemo(() => getWeeklyStreak(sessions), [sessions]);
  const streakCount = streakDays.filter(Boolean).length;

  // ── User info ─────────────────────────────────────────────────────────────
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Student";
  const firstName   = displayName.split(" ")[0];
  const initials    = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const photoURL    = user?.photoURL;

  const progressLabel =
    !sessions.length   ? "Start practicing!"  :
    averageScore >= 80 ? "Excellent work!"     :
    averageScore >= 60 ? "You're doing great!" :
                         "Keep practicing!";

  const streakLabel =
    streakCount >= 5 ? "Great consistency!"     :
    streakCount >= 1 ? "Keep the streak going!" :
                       "Start practicing today!";

  return (
    <div className="db-root">
      {/* ── MAIN ── */}
      <main className="db-content">
        {loading ? (
          <div className="dash-loading">
            <div className="spinner" /><p>Loading your dashboard…</p>
          </div>
        ) : (
          <div className="db-layout">

            {/* ════ LEFT ════ */}
            <div className="db-left-column">

              <div className="db-greeting">
                <h1>Hello, {firstName}! 👋</h1>
                <p>Ready to speak with confidence today?</p>
              </div>

              {/* Hero banner */}
              <section className="db-hero-banner">
                <div className="db-hero-text">
                  <h2>Start a Practice Session</h2>
                  <p>Choose a scenario, record your speech, and get AI-powered feedback to improve.</p>
                  <button className="db-hero-btn" onClick={() => navigate("practice")}>
                    Start Practice <span>→</span>
                  </button>
                </div>
                <div className="db-hero-art">
                  <div className="db-audio-card">
                    <div className="db-audio-bars">
                      <span /><span /><span /><span /><span />
                    </div>
                    <div className="db-audio-play">▶</div>
                  </div>
                  <div className="db-float-chip db-float-blue">≡</div>
                  <div className="db-float-chip db-float-pink">✦</div>
                  <div className="db-star db-star-one">✦</div>
                  <div className="db-star db-star-two">✦</div>
                </div>
                <div className="db-hero-wave">
                  <svg viewBox="0 0 600 120" preserveAspectRatio="none">
                    <path d="M0 78 C95 38 160 110 270 78 C385 45 475 48 600 78 L600 120 L0 120 Z"
                      fill="rgba(255,255,255,0.08)" />
                    <path d="M0 98 C100 66 180 126 300 100 C420 76 510 82 600 102 L600 120 L0 120 Z"
                      fill="rgba(255,255,255,0.06)" />
                  </svg>
                </div>
              </section>

              {/* Continue your practice */}
              {sessions.length > 0 ? (
                <section className="db-continue-section">
                  <div className="db-section-header">
                    <h3>Continue your practice</h3>
                    <button className="db-tip-link" type="button">View all history →</button>
                  </div>

                  <div className="db-session-list">
                    {sessions.slice(0, 3).map((s, i) => {
                      const score   = getScore(s);
                      const wpm     = getWPM(s);
                      const fillers = getFillers(s);
                      const dur     = getDurationLabel(s);
                      const icon    = getScenarioIcon(s.scenario);
                      const date    = getSessionDate(s);
                      const dateStr = date
                        ? date.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
                        : "—";
                      const pct = score ?? 0;

                      return (
                        <div key={s.id || i} className="db-session-card">
                          <div className="db-session-icon">{icon}</div>

                          <div className="db-session-info">
                            <p className="db-session-title">{s.scenario || "General Speaking"}</p>
                            <p className="db-session-sub">Last practiced {dateStr}</p>
                            <div className="db-session-track">
                              <div className="db-session-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="db-session-pct">{pct}% completed</p>
                          </div>

                          <div className="db-session-metrics">
                            {dur      != null && <div className="db-sm-item"><span>🕐</span><b>{dur}</b><span>Duration</span></div>}
                            {wpm      != null && <div className="db-sm-item"><span>〰️</span><b>{wpm}</b><span>WPM</span></div>}
                            {fillers  != null && <div className="db-sm-item"><span>💬</span><b>{fillers}</b><span>Fillers</span></div>}
                            {score    != null && <div className="db-sm-item"><span>⭐</span><b>{score}/100</b><span>Score</span></div>}
                          </div>

                          <button className="db-continue-btn" onClick={() => navigate("practice")}>
                            Continue
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {/* Tip of the day */}
              <section className="db-tip-card">
                <div className="db-tip-left">
                  <div className="db-tip-icon">{currentTip.icon}</div>
                  <div className="db-tip-content">
                    <h3>
                      Tip of the day
                      <span className="db-tip-category-badge">{currentTip.category}</span>
                    </h3>
                    <p><strong>{currentTip.title}.</strong> {currentTip.body}</p>
                  </div>
                </div>
                <div className="db-tip-actions">
                  <div className="db-tip-nav">
                    <button
                      className="db-tip-nav-btn"
                      aria-label="Previous tip"
                      onClick={() => setCurrentTipIdx(i => (i - 1 + ALL_TIPS.length) % ALL_TIPS.length)}
                    >‹</button>
                    <span className="db-tip-counter">{currentTipIdx + 1}/{ALL_TIPS.length}</span>
                    <button
                      className="db-tip-nav-btn"
                      aria-label="Next tip"
                      onClick={() => setCurrentTipIdx(i => (i + 1) % ALL_TIPS.length)}
                    >›</button>
                  </div>
                  <button
                    className="db-tip-link"
                    type="button"
                    onClick={() => { setActiveTipId(currentTip.id); setTipsOpen(true); }}
                  >
                    View all tips →
                  </button>
                </div>
              </section>

              {/* Tips Drawer */}
              <TipsDrawer
                open={tipsOpen}
                onClose={() => setTipsOpen(false)}
                activeTipId={activeTipId}
              />
            </div>

            {/* ════ RIGHT ════ */}
            <aside className="db-right-column">

              {/* Overall Progress */}
              <section className="db-widget-card db-progress-card">
                <h3>Overall Progress</h3>
                <div className="db-progress-body">
                  <DonutChart percent={averageScore} />
                  <div className="db-progress-copy">
                    <h4>{progressLabel}</h4>
                    <p>
                      {sessions.length === 0
                        ? "Complete a session to see your score."
                        : `Based on ${sessions.length} session${sessions.length !== 1 ? "s" : ""}. Keep practicing to reach your goal.`}
                    </p>
                  </div>
                </div>

                {sessions.length > 0 && (
                  <div className="db-score-bars">
                    <ScoreBar label="Avg Score"  value={averageScore} color="#6b5cff" />
                    <ScoreBar label="Best Score" value={bestScore}    color="#4ecca3" />
                    <ScoreBar label="Avg WPM"    value={avgWPM}       color="#ffd166" />
                  </div>
                )}

                <button className="db-widget-link" type="button" onClick={() => navigate("progress")}>
                  View detailed progress →
                </button>
              </section>

              {/* Weekly Streak */}
              <section className="db-widget-card db-streak-card">
                <h3>Weekly Streak</h3>
                <div className="db-streak-main">
                  <span className="db-fire">🔥</span>
                  <div>
                    <h4>{streakCount} day{streakCount !== 1 ? "s" : ""}</h4>
                    <p>{streakLabel}</p>
                  </div>
                </div>
                <div className="db-streak-days">
                  {DAYS.map((day, i) => (
                    <div className="db-streak-day" key={i}>
                      <StreakDot done={streakDays[i]} />
                      <span>{day}</span>
                    </div>
                  ))}
                </div>
                <p className="db-streak-insight">
                  {streakCount === 7
                    ? "🏆 Perfect week! Amazing!"
                    : streakCount === 0
                    ? "Practice today to start your streak!"
                    : `${7 - streakCount} day${7 - streakCount !== 1 ? "s" : ""} left for a perfect week.`}
                </p>
              </section>

              {/* Quick stats */}
              {sessions.length > 0 && (
                <section className="db-widget-card">
                  <h3>Your Averages</h3>
                  <div className="db-quick-stats">
                    <div className="db-qs-item">
                      <span className="db-qs-val" style={{ color: "#6b5cff" }}>{sessions.length}</span>
                      <span className="db-qs-label">Sessions</span>
                    </div>
                    <div className="db-qs-item">
                      <span className="db-qs-val" style={{ color: "#4ecca3" }}>{averageScore}</span>
                      <span className="db-qs-label">Avg Score</span>
                    </div>
                    <div className="db-qs-item">
                      <span className="db-qs-val" style={{ color: "#ffd166" }}>{avgWPM}</span>
                      <span className="db-qs-label">Avg WPM</span>
                    </div>
                    <div className="db-qs-item">
                      <span className="db-qs-val" style={{ color: "#fc6c8f" }}>{avgFillers}</span>
                      <span className="db-qs-label">Avg Fillers</span>
                    </div>
                  </div>
                </section>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}