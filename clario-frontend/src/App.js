// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { onAuthChange, logoutUser } from "./utils/firebase";

import Sidebar from "./components/Sidebar";
import Topbar  from "./components/Topbar";

import PreviewPage   from "./pages/PreviewPage";   // ← public landing
import AuthPage      from "./pages/AuthPage";       // ← login / register
import LandingPage   from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import PracticePage  from "./pages/PracticePage";
import SettingsPage from "./pages/SettingsPage";
import ResultsPage   from "./pages/ResultsPage";
import ProgressPage  from "./pages/ProgressPage";
import LogoutPage    from "./pages/LogoutPage";

import "./App.css";

function AppShell({ user, onLogout }) {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);

  // Legacy navigate() helper — keeps all child pages working as-is
  const legacyNavigate = (page, data = null) => {
    if (data) setAnalysisData(data);

    const routeMap = {
      preview:   "/",
      landing:   "/",
      dashboard: "/dashboard",
      home:      "/dashboard",
      practice:  "/practice",
      scenarios: "/scenarios",
      results:   "/results",
      progress:  "/progress",
      settings:  "/settings",
      logout:    "/logout",
    };

    navigate(routeMap[page] ?? "/dashboard");
  };

  // Called from PreviewPage / AuthPage nav buttons
  const goToAuth = (mode = "login") => {
    navigate(mode === "register" ? "/register" : "/login");
  };

  // Whether to show sidebar + topbar (authenticated inner pages only)
  const showShell = !!user;

  return (
    <div className="app-shell">

      {/* ── Persistent sidebar (authenticated only) ── */}
      {showShell && (
        <Sidebar user={user} onLogout={() => navigate("/logout")} />
      )}

      {/* ── Main content column ── */}
      <div className={`app-content${showShell ? " with-sidebar" : ""}`}>

        {/* Shared topbar — authenticated only */}
        {showShell && <Topbar user={user} />}

        {/* Scrollable page area */}
        <div className="app-page-area">
          <Routes>

            {/* ── ROOT: public preview or dashboard redirect ── */}
            <Route
              path="/"
              element={
                user
                  ? <Navigate to="/dashboard" replace />
                  : <PreviewPage goToAuth={goToAuth} />
              }
            />

            {/* ── AUTH ROUTES ── */}
            <Route
              path="/login"
              element={
                user
                  ? <Navigate to="/dashboard" replace />
                  : <AuthPage
                      initialMode="login"
                      navigate={legacyNavigate}
                      onSuccess={() => navigate("/dashboard")}
                    />
              }
            />

            <Route
              path="/register"
              element={
                user
                  ? <Navigate to="/dashboard" replace />
                  : <AuthPage
                      initialMode="register"
                      navigate={legacyNavigate}
                      onSuccess={() => navigate("/dashboard")}
                    />
              }
            />

            {/* ── PROTECTED ROUTES ── */}
            <Route
              path="/dashboard"
              element={
                user
                  ? <DashboardPage navigate={legacyNavigate} user={user} onLogout={onLogout} />
                  : <Navigate to="/" replace />
              }
            />

            <Route
              path="/practice"
              element={
                user
                  ? <PracticePage navigate={legacyNavigate} user={user} onLogout={onLogout} />
                  : <Navigate to="/" replace />
              }
            />

            <Route
              path="/scenarios"
              element={
                user
                  ? <PracticePage navigate={legacyNavigate} user={user} onLogout={onLogout} />
                  : <Navigate to="/" replace />
              }
            />

            <Route
              path="/results"
              element={
                user
                  ? <ResultsPage results={analysisData} navigate={legacyNavigate} user={user} onLogout={onLogout} />
                  : <Navigate to="/" replace />
              }
            />

            <Route
              path="/progress"
              element={
                user
                  ? <ProgressPage navigate={legacyNavigate} user={user} onLogout={onLogout} />
                  : <Navigate to="/" replace />
              }
            />

            <Route 
              path="/settings" 
              element={user ? <SettingsPage 
                user={user} /> : <Navigate to="/" replace />} />

            <Route
              path="/logout"
              element={
                user
                  ? <LogoutPage navigate={legacyNavigate} onLogout={onLogout} />
                  : <Navigate to="/" replace />
              }
            />

            {/* ── CATCH-ALL ── */}
            <Route
              path="*"
              element={<Navigate to={user ? "/dashboard" : "/"} replace />}
            />

          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Auth state still loading
  if (user === undefined) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppShell user={user} onLogout={handleLogout} />
    </BrowserRouter>
  );
}