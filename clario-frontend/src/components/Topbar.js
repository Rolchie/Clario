// src/components/Topbar.js
import React, { useState } from "react";
import "./Topbar.css";

export default function Topbar({ user }) {
  const [notifOpen, setNotifOpen] = useState(false);

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const photoURL = user?.photoURL;

  return (
    <header className="topbar">
      {/* Left side — page title injected via CSS custom prop or left blank */}
      <div className="topbar-left" />

      {/* Right side */}
      <div className="topbar-right">
        {/* Notification bell */}
        <button
          className="topbar-notif-btn"
          aria-label="Notifications"
          onClick={() => setNotifOpen((v) => !v)}
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="topbar-notif-dot" />
        </button>

        {/* User pill */}
        <div className="topbar-user-pill">
          <div className="topbar-avatar">
            {photoURL ? (
              <img src={photoURL} alt={displayName} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{displayName}</span>
            <span className="topbar-user-role">Student</span>
          </div>
        </div>
      </div>
    </header>
  );
}