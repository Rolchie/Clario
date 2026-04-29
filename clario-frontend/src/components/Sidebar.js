// src/components/Sidebar.js
import React from "react";

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 10L12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10z" />
  </svg>
);

const PracticeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z" />
    <path d="M19 10a7 7 0 0 1-14 0M12 19v4M8 23h8" />
  </svg>
);

const ScenariosIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ProgressIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 16l4-4-4-4M21 12H9M13 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
  </svg>
);

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: <HomeIcon /> },
  { to: "/practice", label: "Practice", icon: <PracticeIcon /> },
  { to: "/progress", label: "Progress", icon: <ProgressIcon /> },
];

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar-logo" onClick={() => navigate("/dashboard")}>
        <div className="sidebar-logo-icon">C+</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">CLARIO</span>
          <span className="sidebar-logo-sub">AI SPEECH COACH</span>
        </div>
      </div>

      {/* NAV */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </NavLink>
          );
        })}

        <div className="sidebar-divider" />

        <NavLink to="/settings" className="sidebar-nav-item">
          <span className="sidebar-nav-icon">
            <SettingsIcon />
          </span>
          <span className="sidebar-nav-label">Settings</span>
        </NavLink>

        <button className="sidebar-nav-item" onClick={onLogout}>
          <span className="sidebar-nav-icon">
            <LogoutIcon />
          </span>
          <span className="sidebar-nav-label">Log out</span>
        </button>
      </nav>

      {/* PREMIUM CARD */}
      <div className="sidebar-upgrade">
        <div className="sidebar-upgrade-icon">👑</div>
        <div className="sidebar-upgrade-text">
          <strong>Go Premium</strong>
          <span>
            Unlock advanced insights, personalized tips, and unlimited practice.
          </span>
        </div>
        <button className="sidebar-upgrade-btn">Upgrade Now</button>
      </div>

      {/* WAVE */}
      <div className="sidebar-wave">
        <svg viewBox="0 0 220 80" preserveAspectRatio="none">
          <path
            d="M0 38 Q55 0 110 38 Q165 76 220 38 L220 80 L0 80 Z"
            fill="#dcd7ff"
          />
          <path
            d="M0 55 Q55 20 110 55 Q165 90 220 55 L220 80 L0 80 Z"
            fill="#c9c2ff"
          />
        </svg>
      </div>
    </aside>
  );
}