// src/pages/ProgressPage.js
import React, { useEffect, useMemo, useState } from "react";
import { getSessions } from "../utils/firebase";
import "./ProgressPage.css";

function SummaryCard({ icon, title, value, sub, color = "#6b5cff", bg = "#eeeaff" }) {
  return (
    <div className="pg-summary-card">
      <div className="pg-summary-icon" style={{ color, background: bg }}>
        {icon}
      </div>

      <div className="pg-summary-body">
        <p className="pg-summary-title">{title}</p>
        <h3 style={{ color }}>{value}</h3>
        <p className="pg-summary-sub">{sub}</p>
      </div>
    </div>
  );
}

function PerformanceBar({ icon, label, value, color }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="pg-performance-item">
      <div className="pg-performance-icon" style={{ color, background: `${color}18` }}>
        {icon}
      </div>

      <div className="pg-performance-content">
        <div className="pg-performance-top">
          <span>{label}</span>
          <b style={{ color }}>{safeValue}/100</b>
        </div>

        <div className="pg-performance-track">
          <div
            className="pg-performance-fill"
            style={{
              width: `${safeValue}%`,
              background: color,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function LineChart({ values }) {
  const chartValues = values.length ? values : [68, 72, 75, 82, 78, 90, 95];
  const width = 620;
  const height = 240;
  const paddingX = 42;
  const paddingY = 34;

  const max = 100;
  const min = 0;

  const points = chartValues.map((value, index) => {
    const x =
      paddingX +
      (index * (width - paddingX * 2)) / Math.max(chartValues.length - 1, 1);
    const y =
      height -
      paddingY -
      ((value - min) / (max - min)) * (height - paddingY * 2);

    return { x, y, value };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const labels = ["Apr 22", "Apr 23", "Apr 24", "Apr 25", "Apr 26", "Apr 27", "Apr 28"];

  return (
    <div className="pg-chart-wrap">
      <svg className="pg-chart-svg" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="pgChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c6fcd" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7c6fcd" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((tick) => {
          const y =
            height -
            paddingY -
            ((tick - min) / (max - min)) * (height - paddingY * 2);

          return (
            <g key={tick}>
              <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#f0eeff" strokeWidth="1" />
              <text x="14" y={y + 4} fill="#8d8aad" fontSize="11" fontWeight="700">
                {tick}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#pgChartGradient)" />
        <path d={linePath} fill="none" stroke="#6b5cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="5" fill="#6b5cff" stroke="#ffffff" strokeWidth="2" />
            <text x={point.x} y={point.y - 12} textAnchor="middle" fill="#1a1a2e" fontSize="11" fontWeight="900">
              {point.value}
            </text>
            <text x={point.x} y={height - 8} textAnchor="middle" fill="#8d8aad" fontSize="11" fontWeight="700">
              {labels[index] || `S${index + 1}`}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function MiniMetric({ icon, label, value, sub }) {
  return (
    <div className="pg-mini-metric">
      <div className="pg-mini-label">
        <span>{icon}</span>
        <p>{label}</p>
      </div>
      <h4>{value}</h4>
      <span>{sub}</span>
    </div>
  );
}

function ScoreBadge({ value }) {
  const score = Number(value) || 0;
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="pg-score-badge">
      <svg width="42" height="42" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={r} fill="none" stroke="#e9fbf4" strokeWidth="4" />
        <circle
          cx="21"
          cy="21"
          r={r}
          fill="none"
          stroke="#4ecca3"
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 21 21)"
        />
      </svg>
      <span>{score}</span>
    </div>
  );
}

export default function ProgressPage({ navigate, user }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessions(20).then((data) => {
      setSessions(data || []);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const totalSessions = sessions.length;

    const avg = (getter) => {
      if (!sessions.length) return 0;
      return Math.round(
        sessions.reduce((sum, session) => sum + (Number(getter(session)) || 0), 0) /
          sessions.length
      );
    };

    const totalDuration = sessions.reduce(
      (sum, session) => sum + (Number(session.metrics?.duration) || 0),
      0
    );

    const best = sessions.reduce((bestSession, current) => {
      const currentScore =
        Number(current.metrics?.score) || Number(current.scores?.overall) || 0;
      const bestScore =
        Number(bestSession?.metrics?.score) ||
        Number(bestSession?.scores?.overall) ||
        0;

      return currentScore > bestScore ? current : bestSession;
    }, null);

    const clarity = avg(
      (session) =>
        session.metrics?.pronunciation ||
        session.avgConfidence ||
        session.scores?.pronunciation ||
        session.metrics?.score ||
        session.scores?.overall
    );

    const pronunciation = avg(
      (session) => session.metrics?.pronunciation || session.scores?.pronunciation
    );

    const speechPace = avg(
      (session) => session.metrics?.speechPace || session.scores?.pace
    );

    const fillerWords = avg(
      (session) => session.metrics?.fillerScore || session.scores?.fillers
    );

    const flow = avg((session) => session.metrics?.flow || session.scores?.flow);

    return {
      totalSessions,
      totalDuration,
      best,
      bestScore: Number(best?.metrics?.score) || Number(best?.scores?.overall) || 0,
      clarity,
      pronunciation,
      speechPace,
      fillerWords,
      flow,
      avgWpm: avg((session) => session.metrics?.wpm),
      avgFillers: avg(
        (session) => session.metrics?.totalFillers || session.fillers?.total
      ),
    };
  }, [sessions]);

  const chartValues = sessions
    .slice(0, 7)
    .reverse()
    .map((session) => Number(session.metrics?.score) || Number(session.scores?.overall) || 0);

  const formatDurationLong = (seconds) => {
    const s = Number(seconds) || 0;
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDurationShort = (seconds) => {
    const s = Number(seconds) || 0;
    const minutes = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(minutes).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="pg-page">
      <main className="pg-content">
        <section className="pg-header">
          <h1>Progress</h1>
          <p>Track your improvement and see how you’re growing.</p>
        </section>

        {loading ? (
          <div className="pg-loading">
            <div className="pg-spinner" />
            <p>Loading your progress…</p>
          </div>
        ) : (
          <>
            <section className="pg-summary-grid">
              <SummaryCard
                icon="↗"
                title="Overall Clarity"
                value={`${stats.clarity || 0}%`}
                sub="↑ 12% from last week"
                color="#7c6fcd"
                bg="#ede9ff"
              />

              <SummaryCard
                icon="◎"
                title="Practice Sessions"
                value={stats.totalSessions || 0}
                sub="↑ 4 from last week"
                color="#4ecca3"
                bg="#e9fbf4"
              />

              <SummaryCard
                icon="◷"
                title="Total Practice Time"
                value={formatDurationLong(stats.totalDuration)}
                sub="↑ 36m from last week"
                color="#f4b740"
                bg="#fff7df"
              />

              <SummaryCard
                icon="🏆"
                title="Best Score"
                value={`${stats.bestScore || 0}/100`}
                sub={
                  stats.best
                    ? `${stats.best.scenario || "Practice"} • ${
                        stats.best.date
                          ? new Date(stats.best.date).toLocaleDateString("en-PH", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recent"
                      }`
                    : "No best score yet"
                }
                color="#5aa9ff"
                bg="#eaf4ff"
              />
            </section>

            <section className="pg-main-grid">
              <div className="pg-card pg-chart-card">
                <div className="pg-card-header">
                  <div>
                    <h3>Clarity Score Over Time</h3>
                    <p>Your average clarity score from each practice session.</p>
                  </div>

                  <button className="pg-select-btn">Last 7 Sessions ▾</button>
                </div>

                <LineChart values={chartValues} />
              </div>

              <div className="pg-card pg-breakdown-card">
                <div className="pg-card-header">
                  <div>
                    <h3>Performance Breakdown</h3>
                    <p>Your average scores across key areas.</p>
                  </div>
                </div>

                <div className="pg-performance-list">
                  <PerformanceBar
                    icon="🎙"
                    label="Pronunciation"
                    value={stats.pronunciation || stats.clarity || 0}
                    color="#7c6fcd"
                  />
                  <PerformanceBar
                    icon="⏱"
                    label="Speech Pace"
                    value={stats.speechPace || 0}
                    color="#4ecca3"
                  />
                  <PerformanceBar
                    icon="💬"
                    label="Filler Words"
                    value={stats.fillerWords || 0}
                    color="#f4b740"
                  />
                  <PerformanceBar
                    icon="〰"
                    label="Flow"
                    value={stats.flow || 0}
                    color="#5aa9ff"
                  />
                </div>
              </div>
            </section>

            <section className="pg-mini-grid">
              <MiniMetric icon="✦" label="WPM" value={stats.avgWpm || "—"} sub={sessions.length ? "Average" : "Calculating..."} />
              <MiniMetric icon="▣" label="Fillers" value={stats.avgFillers || "—"} sub={sessions.length ? "Average" : "Calculating..."} />
              <MiniMetric
                icon="◷"
                label="Duration"
                value={
                  sessions[0]?.metrics?.duration
                    ? formatDurationShort(sessions[0].metrics.duration)
                    : "00:00"
                }
                sub={sessions.length ? "Latest practice" : "No recording yet"}
              />
            </section>

            <section className="pg-card pg-history-card">
              <div className="pg-card-header">
                <div>
                  <h3>Recent Practice Sessions</h3>
                </div>
              </div>

              <div className="pg-table">
                <div className="pg-table-head">
                  <span>Scenario</span>
                  <span>Date</span>
                  <span>Duration</span>
                  <span>Clarity Score</span>
                  <span>WPM</span>
                  <span>Result</span>
                  <span></span>
                </div>

                {sessions.length === 0 ? (
                  <div className="pg-empty">
                    <div>🎙️</div>
                    <h3>No saved sessions yet</h3>
                    <p>Finish a practice session and view feedback to start tracking progress.</p>
                    <button onClick={() => navigate("practice")}>Start Practice</button>
                  </div>
                ) : (
                  sessions.slice(0, 8).map((session, index) => {
                    const score =
                      Number(session.metrics?.score) ||
                      Number(session.scores?.overall) ||
                      0;

                    const wpm = Number(session.metrics?.wpm) || 0;
                    const duration = Number(session.metrics?.duration) || 0;

                    return (
                      <div className="pg-table-row" key={session.id || index}>
                        <div className="pg-scenario-cell">
                          <div className="pg-scenario-icon">
                            {session.scenario?.includes("Interview")
                              ? "💼"
                              : session.scenario?.includes("Thesis")
                              ? "🎓"
                              : session.scenario?.includes("Recitation")
                              ? "📖"
                              : "🎤"}
                          </div>
                          <span>{session.scenario || "General Speaking"}</span>
                        </div>

                        <span>
                          {session.date
                            ? new Date(session.date).toLocaleString("en-PH", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : "Recent"}
                        </span>

                        <span>{duration ? formatDurationShort(duration) : "—"}</span>

                        <ScoreBadge value={score} />

                        <div className="pg-wpm-cell">
                          <b>{wpm || "—"}</b>
                          <small>{session.metrics?.pace || ""}</small>
                        </div>

                        <span className={`pg-result-pill ${score >= 80 ? "excellent" : score >= 60 ? "good" : "needs-work"}`}>
                          {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"}
                        </span>

                        <button className="pg-row-arrow">›</button>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}