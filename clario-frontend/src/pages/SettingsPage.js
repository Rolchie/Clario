// src/pages/SettingsPage.js
import React, { useState } from "react";
import "./SettingsPage.css";

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      className={`sp-toggle ${checked ? "on" : "off"}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      role="switch"
    >
      <span className="sp-toggle-knob" />
    </button>
  );
}

// ── Select Dropdown ───────────────────────────────────────────────────────────
function Select({ value, onChange, options }) {
  return (
    <div className="sp-select-wrap">
      <select className="sp-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="sp-select-arrow" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  );
}

// ── Radio Option ──────────────────────────────────────────────────────────────
function RadioOption({ name, value, checked, onChange, label, sub }) {
  return (
    <label className={`sp-radio-option ${checked ? "checked" : ""}`}>
      <div className={`sp-radio-dot ${checked ? "checked" : ""}`}>
        {checked && <div className="sp-radio-inner" />}
      </div>
      <div className="sp-radio-text">
        <span className="sp-radio-label">{label}</span>
        <span className="sp-radio-sub">{sub}</span>
      </div>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} hidden />
    </label>
  );
}

// ── Link Row ──────────────────────────────────────────────────────────────────
function LinkRow({ label, sub, onClick }) {
  return (
    <button className="sp-link-row" onClick={onClick}>
      <div>
        <div className="sp-link-row-label">{label}</div>
        <div className="sp-link-row-sub">{sub}</div>
      </div>
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SettingsPage({ user }) {
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const email = user?.email || "user@email.com";

  // ── Account state ──────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(displayName);
  const [emailVal, setEmailVal] = useState(email);
  const [savedName, setSavedName] = useState(displayName);
  const [savedEmail, setSavedEmail] = useState(email);

  // ── Preferences state ──────────────────────────────────────────────────────
  const [speechLanguage, setSpeechLanguage] = useState("en-US");
  const [feedbackDetail, setFeedbackDetail] = useState("detailed");
  const [dailyReminder, setDailyReminder] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

  // ── Practice state ─────────────────────────────────────────────────────────
  const [practiceGoal, setPracticeGoal] = useState("30");
  const [autoPlay, setAutoPlay] = useState(true);
  const [saveRec, setSaveRec] = useState(true);

  // ── Appearance state ───────────────────────────────────────────────────────
  const [appearance, setAppearance] = useState("system");

  // ── Toast state ────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = () => {
    setSavedName(fullName);
    setSavedEmail(emailVal);
    setEditing(false);
    showToast("Profile updated successfully!");
  };

  const handleCancelEdit = () => {
    setFullName(savedName);
    setEmailVal(savedEmail);
    setEditing(false);
  };

  const memberSince = "Apr 10, 2025";

  return (
    <div className="sp-root">
      {/* ── Toast ── */}
      {toast && (
        <div className={`sp-toast ${toast.type}`}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            {toast.type === "success"
              ? <polyline points="20 6 9 17 4 12"/>
              : <line x1="12" y1="8" x2="12" y2="16"/>}
          </svg>
          {toast.msg}
        </div>
      )}

      {/* ── Page title ── */}
      <div className="sp-page-header">
        <h1 className="sp-page-title">Settings</h1>
        <p className="sp-page-sub">Manage your account, preferences, and app settings.</p>
      </div>

      {/* ══════════════════════════════════════
          ACCOUNT INFORMATION
      ══════════════════════════════════════ */}
      <div className="sp-card">
        <div className="sp-card-header">
          <div className="sp-card-header-left">
            <div className="sp-card-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <div className="sp-card-title">Account Information</div>
              <div className="sp-card-sub">Update your personal information and account details.</div>
            </div>
          </div>
          {!editing ? (
            <button className="sp-btn-outline" onClick={() => setEditing(true)}>Edit Profile</button>
          ) : (
            <div className="sp-edit-btns">
              <button className="sp-btn-ghost" onClick={handleCancelEdit}>Cancel</button>
              <button className="sp-btn-primary" onClick={handleSaveProfile}>Save Changes</button>
            </div>
          )}
        </div>

        <div className="sp-card-divider" />

        <div className="sp-account-grid">
          <div className="sp-account-field">
            <span className="sp-field-label">Full Name</span>
            {editing ? (
              <input
                className="sp-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            ) : (
              <span className="sp-field-value">{savedName}</span>
            )}
          </div>

          <div className="sp-account-field">
            <span className="sp-field-label">Account Type</span>
            <span className="sp-field-value sp-badge-purple">Student</span>
          </div>

          <div className="sp-account-field">
            <span className="sp-field-label">Email Address</span>
            {editing ? (
              <input
                className="sp-input"
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                placeholder="Your email address"
                type="email"
              />
            ) : (
              <span className="sp-field-value">{savedEmail}</span>
            )}
          </div>

          <div className="sp-account-field">
            <span className="sp-field-label">Member Since</span>
            <span className="sp-field-value">{memberSince}</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          TWO-COLUMN SECTION
      ══════════════════════════════════════ */}
      <div className="sp-two-col">

        {/* ── LEFT: Preferences ── */}
        <div className="sp-col">
          {/* Preferences card */}
          <div className="sp-card">
            <div className="sp-card-header sp-card-header-simple">
              <div className="sp-card-header-left">
                <div className="sp-card-icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6"/>
                    <line x1="4" y1="12" x2="14" y2="12"/>
                    <line x1="4" y1="18" x2="18" y2="18"/>
                  </svg>
                </div>
                <div>
                  <div className="sp-card-title">Preferences</div>
                  <div className="sp-card-sub">Customize your experience and app preferences.</div>
                </div>
              </div>
            </div>

            <div className="sp-pref-list">
              {/* Speech Language */}
              <div className="sp-pref-row">
                <div className="sp-pref-info">
                  <div className="sp-pref-label">Speech Language</div>
                  <div className="sp-pref-sub">Select the language for feedback and coaching</div>
                </div>
                <Select
                  value={speechLanguage}
                  onChange={setSpeechLanguage}
                  options={[
                    { value: "en-US", label: "English (US)" },
                    { value: "en-GB", label: "English (UK)" },
                    { value: "fil", label: "Filipino" },
                    { value: "es", label: "Spanish" },
                  ]}
                />
              </div>

              {/* Feedback Detail Level */}
              <div className="sp-pref-row">
                <div className="sp-pref-info">
                  <div className="sp-pref-label">Feedback Detail Level</div>
                  <div className="sp-pref-sub">Choose how detailed you want the AI feedback to be</div>
                </div>
                <Select
                  value={feedbackDetail}
                  onChange={setFeedbackDetail}
                  options={[
                    { value: "brief", label: "Brief" },
                    { value: "standard", label: "Standard" },
                    { value: "detailed", label: "Detailed" },
                  ]}
                />
              </div>

              {/* Daily Practice Reminder */}
              <div className="sp-pref-row sp-pref-row-toggle">
                <div className="sp-pref-info">
                  <div className="sp-pref-label">Daily Practice Reminder</div>
                  <div className="sp-pref-sub">Receive daily reminders to keep your practice streak going</div>
                </div>
                <Toggle checked={dailyReminder} onChange={(v) => { setDailyReminder(v); showToast(v ? "Daily reminders enabled" : "Daily reminders disabled"); }} />
              </div>

              {/* Email Notifications */}
              <div className="sp-pref-row sp-pref-row-toggle sp-pref-row-last">
                <div className="sp-pref-info">
                  <div className="sp-pref-label">Email Notifications</div>
                  <div className="sp-pref-sub">Receive updates about your progress and new features</div>
                </div>
                <Toggle checked={emailNotifs} onChange={(v) => { setEmailNotifs(v); showToast(v ? "Email notifications enabled" : "Email notifications disabled"); }} />
              </div>
            </div>
          </div>

          {/* Practice Settings card */}
          <div className="sp-card" style={{ marginTop: 20 }}>
            <div className="sp-card-header sp-card-header-simple">
              <div className="sp-card-header-left">
                <div className="sp-card-icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <div className="sp-card-title">Practice Settings</div>
                  <div className="sp-card-sub">Set your goals and practice preferences.</div>
                </div>
              </div>
            </div>

            <div className="sp-pref-list">
              {/* Daily Practice Goal */}
              <div className="sp-pref-row">
                <div className="sp-pref-info">
                  <div className="sp-pref-label">Daily Practice Goal</div>
                  <div className="sp-pref-sub">Set your daily practice time goal</div>
                </div>
                <Select
                  value={practiceGoal}
                  onChange={setPracticeGoal}
                  options={[
                    { value: "10", label: "10 minutes" },
                    { value: "15", label: "15 minutes" },
                    { value: "30", label: "30 minutes" },
                    { value: "60", label: "60 minutes" },
                  ]}
                />
              </div>

              {/* Auto-play Feedback */}
              <div className="sp-pref-row sp-pref-row-toggle">
                <div className="sp-pref-info">
                  <div className="sp-pref-label">Auto-play Feedback</div>
                  <div className="sp-pref-sub">Automatically play feedback after each recording</div>
                </div>
                <Toggle checked={autoPlay} onChange={(v) => { setAutoPlay(v); showToast(v ? "Auto-play enabled" : "Auto-play disabled"); }} />
              </div>

              {/* Save Recordings */}
              <div className="sp-pref-row sp-pref-row-toggle sp-pref-row-last">
                <div className="sp-pref-info">
                  <div className="sp-pref-label">Save Recordings</div>
                  <div className="sp-pref-sub">Save your recordings for review and improvement</div>
                </div>
                <Toggle checked={saveRec} onChange={(v) => { setSaveRec(v); showToast(v ? "Recordings will be saved" : "Recordings will not be saved"); }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Appearance + Privacy + Support ── */}
        <div className="sp-col">
          {/* Appearance */}
          <div className="sp-card">
            <div className="sp-card-header sp-card-header-simple">
              <div className="sp-card-header-left">
                <div className="sp-card-icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                </div>
                <div>
                  <div className="sp-card-title">Appearance</div>
                  <div className="sp-card-sub">Customize the look and feel of the app.</div>
                </div>
              </div>
            </div>

            <div className="sp-radio-list">
              <RadioOption
                name="appearance"
                value="system"
                checked={appearance === "system"}
                onChange={setAppearance}
                label="System Default"
                sub="Use your device's default theme"
              />
              <RadioOption
                name="appearance"
                value="light"
                checked={appearance === "light"}
                onChange={setAppearance}
                label="Light Mode"
                sub="Always use light theme"
              />
              <RadioOption
                name="appearance"
                value="dark"
                checked={appearance === "dark"}
                onChange={setAppearance}
                label="Dark Mode"
                sub="Always use dark theme"
              />
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="sp-card" style={{ marginTop: 20 }}>
            <div className="sp-card-header sp-card-header-simple">
              <div className="sp-card-header-left">
                <div className="sp-card-icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <div className="sp-card-title">Privacy &amp; Security</div>
                  <div className="sp-card-sub">Manage your privacy and data settings.</div>
                </div>
              </div>
            </div>

            <div className="sp-link-list">
              <LinkRow
                label="Privacy Policy"
                sub="Read our privacy policy"
                onClick={() => showToast("Opening Privacy Policy…", "info")}
              />
              <LinkRow
                label="Data &amp; Security"
                sub="Learn how we protect your data"
                onClick={() => showToast("Opening Data & Security…", "info")}
              />
            </div>
          </div>

          {/* Support */}
          <div className="sp-card" style={{ marginTop: 20 }}>
            <div className="sp-card-header sp-card-header-simple">
              <div className="sp-card-header-left">
                <div className="sp-card-icon">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div>
                  <div className="sp-card-title">Support</div>
                  <div className="sp-card-sub">Get help and support when you need it.</div>
                </div>
              </div>
            </div>

            <div className="sp-link-list">
              <LinkRow
                label="Help Center"
                sub="Browse articles and guides"
                onClick={() => showToast("Opening Help Center…", "info")}
              />
              <LinkRow
                label="Contact Support"
                sub="Get in touch with our team"
                onClick={() => showToast("Opening Contact Support…", "info")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── App version ── */}
      <div className="sp-version">App Version 1.2.0</div>
    </div>
  );
}