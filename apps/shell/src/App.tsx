import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { ShellProvider, useShell } from "./ShellContext";
import Sidebar from "./Sidebar";
import ContentArea from "./ContentArea";
import { NotificationContainer, GlobalLoader } from "./components";
import "./styles.css";

function AuthenticatedApp() {
  const { isAuthenticated, isLoading: authLoading, user, login, logout } = useAuth();
  const { restoreFromUrl, isLoading: shellLoading, error, selectedProfile } = useShell();

  useEffect(() => {
    if (isAuthenticated) {
      restoreFromUrl();
    }
  }, [isAuthenticated, restoreFromUrl]);

  if (authLoading) {
    return (
      <div className="shell shell--loading">
        <div className="shell__loader">
          <div className="shell__spinner" />
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="shell shell--login">
        <div className="shell__login-card">
          <h1>MFE Shell</h1>
          <p>Please login to access the application</p>
          <button className="shell__login-btn" onClick={login}>
            Login with SSO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <header className="shell__header">
        <div className="shell__header-left">
          <h1>MFE Shell</h1>
          <span className="shell__header-subtitle">Enterprise Micro Frontend Platform</span>
        </div>
        <div className="shell__header-right">
          <span className="shell__user">
            <span className="shell__user-icon">👤</span>
            {user?.DisplayName}
          </span>
          <button className="shell__logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div className="shell__body">
        {selectedProfile && <Sidebar />}
        <main className={`shell__content ${!selectedProfile ? 'shell__content--full' : ''}`}>
          {shellLoading && (
            <div className="shell__content-loader">
              <div className="shell__spinner shell__spinner--small" />
              <span>Loading...</span>
            </div>
          )}
          {error && (
            <div className="shell__error">
              <strong>Error:</strong> {error}
            </div>
          )}
          <ContentArea />
        </main>
      </div>
      <NotificationContainer />
      <GlobalLoader />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <ShellProvider>
          <AuthenticatedApp />
        </ShellProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
