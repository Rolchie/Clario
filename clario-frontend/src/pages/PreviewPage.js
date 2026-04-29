// src/pages/PreviewPage.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./PreviewPage.css";
import { registerUser, loginUser, loginWithGoogle } from "../utils/firebase";

// ── CLARIO LOGO ICON ──
function ClarioIcon({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="prev-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b8aefc" />
          <stop offset="100%" stopColor="#7c6fcd" />
        </linearGradient>
      </defs>
      <path
        d="M34 13.5C30.8 10.2 26.6 8 22 8C13.2 8 6 15.2 6 24C6 32.8 13.2 40 22 40C26.6 40 30.8 37.8 34 34.5"
        stroke="url(#prev-g)" strokeWidth="5" strokeLinecap="round" fill="none"
      />
      <path d="M38 14 L39.4 18 L43.5 19 L39.4 20 L38 24 L36.6 20 L32.5 19 L36.6 18 Z" fill="url(#prev-g)" />
    </svg>
  );
}

// ── ANIMATED COUNTER ──
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const FEATURES = [
  {
    icon: "🎙️",
    title: "Record & Transcribe",
    desc: "Speak naturally into your microphone. Groq's Whisper model converts your voice to accurate text in seconds — no setup needed.",
    color: "#7c6fcd",
    tag: "Core Feature",
  },
  {
    icon: "📊",
    title: "Real-Time Metrics",
    desc: "Instantly see your words-per-minute, filler word count, speech flow, and pronunciation clarity — all in one clean dashboard.",
    color: "#22c55e",
    tag: "Analytics",
  },
  {
    icon: "🤖",
    title: "AI Coaching",
    desc: "Get personalized feedback from Claude AI. Understand what you did well and get actionable steps to improve each session.",
    color: "#f59e0b",
    tag: "AI-Powered",
  },
  {
    icon: "📈",
    title: "Track Progress",
    desc: "Every session is saved to your profile. Watch your scores improve over time with detailed trend charts and history.",
    color: "#f43f5e",
    tag: "Progress",
  },
  {
    icon: "🎯",
    title: "Practice Scenarios",
    desc: "Choose from Thesis Defense, Job Interview, Recitation, or General Speaking — tailored tips for each scenario type.",
    color: "#06b6d4",
    tag: "Scenarios",
  },
  {
    icon: "🗣️",
    title: "Pronunciation Coach",
    desc: "AI identifies words you mispronounced or slurred, shows you the correct form, and links to real audio examples.",
    color: "#a855f7",
    tag: "Pronunciation",
  },
];

const SCENARIOS = [
  { emoji: "🎓", label: "Thesis Defense",   color: "#7c6fcd", desc: "Research defense prep" },
  { emoji: "💼", label: "Job Interview",    color: "#22c55e", desc: "Answer with confidence" },
  { emoji: "📖", label: "Recitation",       color: "#f59e0b", desc: "Poetry & passages" },
  { emoji: "🎤", label: "General Speaking", color: "#f43f5e", desc: "Any situation" },
];

const TESTIMONIALS = [
  {
    name: "Sofia Reyes",
    role: "BS Computer Science, CMU",
    avatar: "SR",
    text: "CLARIO helped me cut my filler words from 40 to just 3 in two weeks. My thesis defense went way smoother than expected!",
    score: 92,
    color: "#7c6fcd",
  },
  {
    name: "Marco Dela Cruz",
    role: "Job Seeker, Fresh Graduate",
    avatar: "MD",
    text: "I used to say 'um' every 5 seconds. After 10 sessions on CLARIO, I landed my first job interview feedback as 'very articulate.'",
    score: 87,
    color: "#22c55e",
  },
  {
    name: "Janna Okit",
    role: "Public Speaking Class, CMU",
    avatar: "JO",
    text: "The AI feedback is incredibly specific — it told me exactly which words I mispronounced and how to fix them. No other app does this.",
    score: 95,
    color: "#f59e0b",
  },
];

const SEARCH_SUGGESTIONS = [
  "How to reduce filler words",
  "Improve speech pace",
  "Job interview tips",
  "Pronunciation practice",
  "Thesis defense prep",
  "Boost confidence speaking",
];

// ── DEMO SCORE RING ──
function DemoRing({ score, color, label }) {
  const r = 42, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="demo-ring-wrap">
      <svg viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2defc" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 50 50)"
        />
        <text x="50" y="54" textAnchor="middle" fontSize="18" fontWeight="800"
          fill={color} fontFamily="Nunito,sans-serif">{score}</text>
      </svg>
      <span className="demo-ring-label" style={{ color }}>{label}</span>
    </div>
  );
}

// ── SEARCH BAR ──
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    if (query.trim()) {
      setFiltered(SEARCH_SUGGESTIONS.filter(s => s.toLowerCase().includes(query.toLowerCase())));
    } else {
      setFiltered([]);
    }
  }, [query]);

  return (
    <div className={`preview-search ${focused ? "focused" : ""}`}>
      <span className="search-icon">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="9" cy="9" r="6" /><path d="M15 15l3 3" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search features, tips, scenarios…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />
      {query && (
        <button className="search-clear" onClick={() => setQuery("")}>✕</button>
      )}
      {focused && filtered.length > 0 && (
        <div className="search-dropdown">
          {filtered.map((s, i) => (
            <button key={i} className="search-suggestion" onClick={() => { setQuery(s); setFocused(false); }}>
              <span className="sugg-icon">→</span>{s}
            </button>
          ))}
        </div>
      )}
      {focused && query && filtered.length === 0 && (
        <div className="search-dropdown">
          <div className="search-no-results">No results for "{query}" — try logging in to explore everything!</div>
        </div>
      )}
    </div>
  );
}

// ── AUTH MODAL (floating over PreviewPage) ──
function AuthModal({ initialMode, onClose, onAuth }) {
  const [mode, setMode]         = useState(initialMode || "login");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const switchMode = (m) => { setMode(m); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!name.trim())         return setError("Please enter your name.");
      if (password.length < 6)  return setError("Password must be at least 6 characters.");
      if (password !== confirm)  return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await registerUser(name.trim(), email.trim(), password);
      } else {
        await loginUser(email.trim(), password);
      }
      if (onAuth) onAuth();
    } catch (err) {
      const msg = err.code || err.message;
      if (msg.includes("email-already-in-use"))   setError("That email is already registered. Try logging in.");
      else if (msg.includes("user-not-found"))    setError("No account found with that email.");
      else if (msg.includes("wrong-password"))    setError("Incorrect password. Please try again.");
      else if (msg.includes("invalid-email"))     setError("Please enter a valid email address.");
      else if (msg.includes("too-many-requests")) setError("Too many attempts. Please wait a moment and try again.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      if (onAuth) onAuth();
    } catch (err) {
      const msg = err.code || err.message;
      if (msg.includes("popup-closed"))        setError("Sign-in cancelled. Please try again.");
      else if (msg.includes("popup-blocked"))  setError("Popup blocked. Please allow popups and try again.");
      else if (msg.includes("account-exists")) setError("An account already exists with this email. Try email/password login.");
      else setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="auth-modal-shell">
        {/* Left decorative panel */}
        <div className="auth-modal-left">
          <div className="auth-modal-left-logo">
            <ClarioIcon size={38} />
            <div>
              <span className="auth-modal-brand-name">CLARIO</span>
              <span className="auth-modal-brand-sub">AI SPEECH COACH</span>
            </div>
          </div>

          <div className="auth-modal-left-content">
            <h2>Practice smarter.<br />Speak with confidence.</h2>
            <p>Join students who use AI-powered coaching to eliminate filler words, improve pace, and ace every presentation.</p>

            <div className="auth-modal-features">
              {[
                { icon: "🎙️", text: "Real-time speech analysis" },
                { icon: "🤖", text: "Personalized AI coaching" },
                { icon: "📊", text: "Track your progress over time" },
              ].map(f => (
                <div className="auth-modal-feature" key={f.text}>
                  <span className="auth-modal-feature-icon">{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative mic art */}
          <div className="auth-modal-mic-art">
            <div className="auth-modal-mic">
              <div className="auth-modal-mic-head" />
              <div className="auth-modal-mic-stem" />
              <div className="auth-modal-mic-base" />
            </div>
            <div className="auth-modal-bars left">
              <span /><span /><span /><span />
            </div>
            <div className="auth-modal-bars right">
              <span /><span /><span /><span />
            </div>
          </div>

          <div className="auth-modal-wave-bg">
            <svg viewBox="0 0 600 155" preserveAspectRatio="none">
              <path d="M0,80 C150,140 300,20 450,90 C525,120 570,100 600,95 L600,155 L0,155 Z" fill="rgba(124,108,252,0.13)" />
              <path d="M0,105 C120,65 280,140 420,100 C510,75 560,115 600,110 L600,155 L0,155 Z" fill="rgba(124,108,252,0.09)" />
            </svg>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-modal-right">
          {/* Close button */}
          <button className="auth-modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="auth-modal-form-wrap">
            {/* Header */}
            <div className="auth-modal-form-header">
              <h3>{mode === "login" ? "Welcome back!" : "Create your account"}</h3>
              <p>{mode === "login" ? "Log in to continue your practice sessions." : "Start improving your speech today — it's free."}</p>
            </div>

            {/* Tabs */}
            <div className="auth-modal-tabs">
              <button className={`auth-modal-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>Log In</button>
              <button className={`auth-modal-tab ${mode === "register" ? "active" : ""}`} onClick={() => switchMode("register")}>Register</button>
            </div>

            {/* Form */}
            <form className="auth-modal-form" onSubmit={handleSubmit}>
              {mode === "register" && (
                <div className="auth-modal-field">
                  <label>Full Name</label>
                  <div className="auth-modal-input-wrap">
                    <span className="auth-modal-input-icon">👤</span>
                    <input type="text" placeholder="e.g. Maky Aury Okit" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                </div>
              )}

              <div className="auth-modal-field">
                <label>Email Address</label>
                <div className="auth-modal-input-wrap">
                  <span className="auth-modal-input-icon">✉️</span>
                  <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="auth-modal-field">
                <label>Password</label>
                <div className="auth-modal-input-wrap">
                  <span className="auth-modal-input-icon">🔒</span>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
                    value={password} onChange={e => setPassword(e.target.value)} required
                  />
                  <button type="button" className="auth-modal-pass-toggle" onClick={() => setShowPass(v => !v)}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <div className="auth-modal-field">
                  <label>Confirm Password</label>
                  <div className="auth-modal-input-wrap">
                    <span className="auth-modal-input-icon">🔒</span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirm} onChange={e => setConfirm(e.target.value)} required
                    />
                    <button type="button" className="auth-modal-pass-toggle" onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="auth-modal-error">⚠️ {error}</p>
              )}

              <button className="auth-modal-submit" type="submit" disabled={loading || googleLoading}>
                {loading ? (
                  <><span className="auth-modal-spinner" /> {mode === "register" ? "Creating account…" : "Logging in…"}</>
                ) : (
                  mode === "register" ? "Create Free Account →" : "Log In →"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-modal-divider">
              <span /><p>or continue with</p><span />
            </div>

            {/* Google button */}
            <button
              className="auth-modal-google-btn"
              onClick={handleGoogle}
              disabled={loading || googleLoading}
              type="button"
            >
              {googleLoading ? (
                <><span className="auth-modal-spinner auth-modal-spinner-dark" /> Signing in…</>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                    <path d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
                    <path d="M6.3 14.7l7 5.1C15.1 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.9 6.3 14.7z" fill="#FF3D00"/>
                    <path d="M24 45c5.8 0 10.8-1.9 14.8-5.2l-6.8-5.7C29.9 35.9 27.1 37 24 37c-5.8 0-10.7-3.9-12.4-9.3l-7 5.4C7.8 41 15.3 45 24 45z" fill="#4CAF50"/>
                    <path d="M44.5 20H24v8.5h11.8c-.9 2.9-2.8 5.3-5.4 6.9l6.8 5.7C41.4 38.1 44.5 31.6 44.5 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <p className="auth-modal-switch">
              {mode === "login"
                ? <>Don't have an account? <button onClick={() => switchMode("register")}>Register here</button></>
                : <>Already have an account? <button onClick={() => switchMode("login")}>Log in here</button></>
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function PreviewPage({ goToAuth }) {
  const [authModal, setAuthModal] = useState(null); // null | "login" | "register"
  const [scrolled, setScrolled] = useState(false);

  const openAuth = useCallback((mode) => setAuthModal(mode), []);
  const closeAuth = useCallback(() => setAuthModal(null), []);
  // Keep goToAuth prop working too (fallback for App.js navigation on real auth)
  const handleAuthSuccess = useCallback(() => {
    if (goToAuth) goToAuth("dashboard");
    setAuthModal(null);
  }, [goToAuth]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="preview-page">

      {/* ── NAVBAR ── */}
      <nav className={`preview-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="preview-nav-logo">
          <ClarioIcon size={34} />
          <div className="preview-nav-brand">
            <span className="preview-nav-name">CLARIO</span>
            <span className="preview-nav-sub">AI SPEECH COACH</span>
          </div>
        </div>
        <div className="preview-nav-links">
          <a href="#features" className="preview-nav-link">Features</a>
          <a href="#how-it-works" className="preview-nav-link">How It Works</a>
          <a href="#testimonials" className="preview-nav-link">Reviews</a>
        </div>
        <div className="preview-nav-actions">
          <button className="prev-btn-ghost" onClick={() => openAuth("login")}>Log In</button>
          <button className="prev-btn-primary" onClick={() => openAuth("register")}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="preview-hero">
        <div className="hero-bg-orb orb-1" />
        <div className="hero-bg-orb orb-2" />
        <div className="hero-bg-dots" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered · Free to Start · No Setup Required
          </div>

          <h1 className="hero-heading">
            Improve Your<br />
            <span className="hero-heading-accent">Communication</span><br />
            Skills with AI
          </h1>

          <p className="hero-subtext">
            CLARIO analyzes your speech in real-time — measuring pace, filler words,
            and clarity — then gives you personalized AI coaching so you can speak
            with confidence every time.
          </p>

          <SearchBar />

          <div className="hero-cta-row">
            <button className="prev-btn-primary prev-btn-lg" onClick={() => openAuth("register")}>
              🎙️ Start Practicing Free
            </button>
            <button className="prev-btn-ghost prev-btn-lg" onClick={() => openAuth("login")}>
              I already have an account →
            </button>
          </div>

          <div className="hero-scenarios">
            <span className="hero-scenarios-label">Practice for:</span>
            {SCENARIOS.map(s => (
              <span key={s.label} className="hero-scenario-chip" style={{ "--chip": s.color }}>
                {s.emoji} {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Demo card */}
        <div className="hero-demo">
          <div className="demo-card">
            <div className="demo-card-header">
              <span className="demo-card-title">Live Session · Job Interview</span>
              <span className="demo-rec-badge"><span className="demo-rec-dot" />Recording</span>
            </div>

            {/* Waveform */}
            <div className="demo-waveform">
              {[...Array(28)].map((_, i) => (
                <div key={i} className="demo-wave-bar"
                  style={{ "--h": `${18 + Math.abs(Math.sin(i * 0.6)) * 60}%`, "--d": `${i * 0.07}s` }} />
              ))}
            </div>

            {/* Score rings */}
            <div className="demo-rings">
              <DemoRing score={87} color="#5b4fcf" label="Score" />
              <DemoRing score={92} color="#22c55e" label="Clarity" />
              <DemoRing score={78} color="#f59e0b" label="Pace" />
            </div>

            {/* Stats */}
            <div className="demo-stats">
              <div className="demo-stat"><span className="demo-stat-val" style={{ color: "#5b4fcf" }}>142</span><span className="demo-stat-key">WPM</span></div>
              <div className="demo-stat"><span className="demo-stat-val" style={{ color: "#f43f5e" }}>3</span><span className="demo-stat-key">Fillers</span></div>
              <div className="demo-stat"><span className="demo-stat-val" style={{ color: "#22c55e" }}>1:12</span><span className="demo-stat-key">Duration</span></div>
            </div>

            <div className="demo-ai-badge">
              🤖 AI Feedback ready — <strong>log in to view</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="preview-stats">
        <div className="stats-inner">
          {[
            { value: 2400, suffix: "+", label: "Students Practicing" },
            { value: 18000, suffix: "+", label: "Sessions Completed" },
            { value: 89, suffix: "%", label: "Avg Score Improvement" },
            { value: 4, suffix: " scenarios", label: "Practice Types" },
          ].map(({ value, suffix, label }) => (
            <div className="stat-item" key={label}>
              <span className="stat-value">
                <AnimatedCounter target={value} suffix={suffix} />
              </span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="preview-features" id="features">
        <div className="section-header">
          <span className="section-eyebrow">Everything you need</span>
          <h2 className="section-title">Features built for<br />real improvement</h2>
          <p className="section-sub">Every tool in CLARIO is designed to give you precise, actionable feedback — not vague encouragement.</p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="feature-card" key={f.title} style={{ "--fc": f.color, "--delay": `${i * 0.07}s` }}>
              <div className="feature-card-icon" style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                <span>{f.icon}</span>
              </div>
              <span className="feature-tag" style={{ background: `${f.color}15`, color: f.color, border: `1px solid ${f.color}25` }}>
                {f.tag}
              </span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
              <div className="feature-card-accent" style={{ background: f.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="preview-how" id="how-it-works">
        <div className="section-header">
          <span className="section-eyebrow">Simple process</span>
          <h2 className="section-title">From recording to<br />feedback in 3 steps</h2>
        </div>

        <div className="how-steps">
          {[
            {
              step: "01",
              icon: "🎯",
              title: "Choose Your Scenario",
              desc: "Pick from Thesis Defense, Job Interview, Recitation, or General Speaking. Each scenario has tailored feedback criteria.",
              color: "#7c6fcd",
            },
            {
              step: "02",
              icon: "🎙️",
              title: "Record Your Speech",
              desc: "Hit record and speak naturally. CLARIO captures your audio and our live timer tracks your session duration.",
              color: "#22c55e",
            },
            {
              step: "03",
              icon: "✨",
              title: "Get AI Feedback",
              desc: "In seconds, receive your score, metrics, filler word breakdown, pronunciation coaching, and personalized AI tips.",
              color: "#f59e0b",
            },
          ].map((s, i) => (
            <div className="how-step" key={s.step}>
              <div className="how-step-number" style={{ color: s.color, borderColor: `${s.color}30`, background: `${s.color}0c` }}>
                {s.step}
              </div>
              <div className="how-step-icon" style={{ background: `${s.color}18` }}>{s.icon}</div>
              <h3 className="how-step-title">{s.title}</h3>
              <p className="how-step-desc">{s.desc}</p>
              {i < 2 && <div className="how-step-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── SAMPLE RESULTS PREVIEW ── */}
      <section className="preview-sample">
        <div className="sample-inner">
          <div className="sample-text">
            <span className="section-eyebrow">See what you'll get</span>
            <h2 className="section-title">Detailed results after every session</h2>
            <p className="section-sub">After each recording, you get a full breakdown of your performance — scores, metrics, highlighted transcript, and AI coaching all in one place.</p>

            <ul className="sample-checklist">
              {[
                "Overall score with pronunciation, pace, fillers & flow sub-scores",
                "Highlighted transcript showing filler words and unclear speech",
                "Word-by-word pronunciation confidence analysis",
                "Personalized AI coaching in 4 structured sections",
                "Session history and trend charts over time",
              ].map((item, i) => (
                <li key={i}><span className="check-icon">✓</span>{item}</li>
              ))}
            </ul>

            <button className="prev-btn-primary" onClick={() => openAuth("register")}>
              Try it free — no credit card →
            </button>
          </div>

          <div className="sample-preview-card">
            <div className="sample-card-header">
              <span className="sample-card-badge">📊 Your Results</span>
              <span className="sample-card-scenario">💼 Job Interview</span>
            </div>

            {/* Score row */}
            <div className="sample-score-row">
              <div className="sample-ring-wrap">
                <svg viewBox="0 0 100 100" width="90" height="90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e2defc" strokeWidth="9" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#22c55e" strokeWidth="9"
                    strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * 0.05}
                    strokeLinecap="round" transform="rotate(-90 50 50)" />
                  <text x="50" y="55" textAnchor="middle" fontSize="19" fontWeight="800" fill="#22c55e" fontFamily="Nunito,sans-serif">95</text>
                </svg>
                <span className="sample-ring-label">EXCELLENT</span>
              </div>
              <div className="sample-bars">
                {[
                  { label: "Pronunciation", val: 95, color: "#22c55e" },
                  { label: "Speech Pace",   val: 80, color: "#5b4fcf" },
                  { label: "Filler Words",  val: 100, color: "#22c55e" },
                  { label: "Flow",          val: 100, color: "#22c55e" },
                ].map(b => (
                  <div className="sample-bar-item" key={b.label}>
                    <div className="sample-bar-top">
                      <span>{b.label}</span>
                      <span style={{ color: b.color, fontWeight: 700 }}>{b.val}</span>
                    </div>
                    <div className="sample-bar-track">
                      <div className="sample-bar-fill" style={{ width: `${b.val}%`, background: b.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="sample-metrics-row">
              {[
                { val: "24", label: "Total Words" },
                { val: "97", label: "WPM" },
                { val: "0",  label: "Fillers" },
                { val: "95%", label: "Clarity" },
              ].map(m => (
                <div className="sample-metric" key={m.label}>
                  <span className="sample-metric-val">{m.val}</span>
                  <span className="sample-metric-key">{m.label}</span>
                </div>
              ))}
            </div>

            {/* Lock overlay */}
            <div className="sample-lock-overlay">
              <div className="lock-content">
                <span className="lock-icon">🔒</span>
                <p>Full results visible after login</p>
                <button className="prev-btn-primary" onClick={() => openAuth("register")}>
                  Create Free Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="preview-testimonials" id="testimonials">
        <div className="section-header">
          <span className="section-eyebrow">Real students, real results</span>
          <h2 className="section-title">What our users say</h2>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="testimonial-card" key={t.name} style={{ "--tc": t.color }}>
              <div className="tcard-top">
                <div className="tcard-avatar" style={{ background: `${t.color}20`, color: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="tcard-name">{t.name}</div>
                  <div className="tcard-role">{t.role}</div>
                </div>
                <div className="tcard-score" style={{ color: t.color }}>
                  {t.score}<span>/100</span>
                </div>
              </div>
              <p className="tcard-text">"{t.text}"</p>
              <div className="tcard-stars">{"★".repeat(5)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="preview-cta">
        <div className="cta-bg-orb" />
        <h2 className="cta-title">Ready to speak with confidence?</h2>
        <p className="cta-sub">Join students who practice smarter with CLARIO. Free to start — no credit card required.</p>
        <div className="cta-actions">
          <button className="prev-btn-primary prev-btn-lg" onClick={() => openAuth("register")}>
            🎙️ Create Free Account
          </button>
          <button className="prev-btn-outline prev-btn-lg" onClick={() => openAuth("login")}>
            Log In
          </button>
        </div>
        <div className="cta-scenarios">
          {SCENARIOS.map(s => (
            <span key={s.label} className="hero-scenario-chip" style={{ "--chip": s.color }}>
              {s.emoji} {s.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="preview-footer">
        <div className="footer-logo">
          <ClarioIcon size={28} />
          <div>
            <span className="preview-nav-name">CLARIO</span>
            <span className="preview-nav-sub" style={{ display: "block" }}>AI SPEECH COACH</span>
          </div>
        </div>
        <p className="footer-credit">
          Built with ❤️ by Rolch, Maky, Cholou, Sofia &amp; the team · CMU Technopreneurship 2026
        </p>
        <div className="footer-links">
          <button className="footer-link" onClick={() => openAuth("login")}>Log In</button>
          <button className="footer-link" onClick={() => openAuth("register")}>Register</button>
        </div>
      </footer>

      {/* ── AUTH MODAL OVERLAY ── */}
      {authModal && (
        <AuthModal
          initialMode={authModal}
          onClose={closeAuth}
          onAuth={handleAuthSuccess}
        />
      )}
    </div>
  );
}