// src/pages/AuthPage.js
import React, { useState } from "react";
import { registerUser, loginUser } from "../utils/firebase";
import "./AuthPage.css";

export default function AuthPage({ onAuth }) {
  const [mode, setMode]         = useState("login"); // "login" | "register"
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!name.trim())            return setError("Please enter your name.");
      if (password.length < 6)     return setError("Password must be at least 6 characters.");
      if (password !== confirm)    return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await registerUser(name.trim(), email.trim(), password);
      } else {
        await loginUser(email.trim(), password);
      }
      onAuth(); // tell App.js auth succeeded
    } catch (err) {
      // Make Firebase error messages human-friendly
      const msg = err.code || err.message;
      if (msg.includes("email-already-in-use"))    setError("That email is already registered. Try logging in.");
      else if (msg.includes("user-not-found"))     setError("No account found with that email.");
      else if (msg.includes("wrong-password"))     setError("Incorrect password. Please try again.");
      else if (msg.includes("invalid-email"))      setError("Please enter a valid email address.");
      else if (msg.includes("too-many-requests"))  setError("Too many attempts. Please wait a moment and try again.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />

      <div className="auth-box">
        {/* Logo */}
        <div className="auth-logo">CLARIO</div>
        <p className="auth-tagline">AI-Powered Speech Coach</p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Log In
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="auth-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Maky Aury Okit"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === "register" && (
            <div className="auth-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>
          )}

          {error && <p className="auth-error">⚠️ {error}</p>}

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading
              ? <><span className="auth-spinner" /> {mode === "register" ? "Creating account..." : "Logging in..."}</>
              : mode === "register" ? "Create Account" : "Log In"
            }
          </button>
        </form>

        {/* Switch mode */}
        <p className="auth-switch">
          {mode === "login"
            ? <>Don't have an account? <button onClick={() => { setMode("register"); setError(""); }}>Register here</button></>
            : <>Already have an account? <button onClick={() => { setMode("login"); setError(""); }}>Log in here</button></>
          }
        </p>
      </div>
    </div>
  );
}