// src/pages/LogoutPage.js
import React from "react";
import "./LogoutPage.css";

export default function LogoutPage({ navigate, onLogout }) {
  const handleLogout = async () => {
    if (onLogout) await onLogout();
    // Hard redirect — avoids the route guard instantly unmounting
    // this page when user becomes null before React Router can navigate.
    window.location.href = "/";
  };

  const handleCancel = () => {
    if (navigate) navigate("dashboard");
  };

  return (
    <div className="lo-page">
      {/* Page heading */}
      <div className="lo-heading">
        <h1>Log out</h1>
        <p>You're about to log out of your account.</p>
      </div>

      {/* Card */}
      <div className="lo-card">
        {/* Icon */}
        <div className="lo-icon-wrap">
          <div className="lo-icon-ring">
            {/* logout SVG icon */}
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b5cff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          {/* decorative sparkles */}
          <span className="lo-sparkle lo-sparkle-tl">✦</span>
          <span className="lo-sparkle lo-sparkle-tr">+</span>
          <span className="lo-sparkle lo-sparkle-bl">+</span>
          <span className="lo-sparkle lo-sparkle-br">✦</span>
        </div>

        {/* Title & subtitle */}
        <h2 className="lo-card-title">Log out of your account?</h2>
        <p className="lo-card-sub">
          You'll need to log in again to access your account
          <br />
          and continue your progress.
        </p>

        {/* Data safe notice */}
        <div className="lo-notice">
          <div className="lo-notice-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b5cff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="lo-notice-text">
            <strong>Your data is safe</strong>
            <span>
              Your progress, settings, and data will be securely saved
              and available when you log in again.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="lo-actions">
          <button className="lo-btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="lo-btn-logout" onClick={handleLogout}>
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}