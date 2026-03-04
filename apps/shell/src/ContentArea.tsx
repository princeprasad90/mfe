import React from "react";
import { useShell } from "./ShellContext";
import type { Application, Profile } from "./types";
import MfeContainer from "./MfeContainer";

export default function ContentArea() {
  const {
    applications,
    profiles,
    selectedApplication,
    selectedProfile,
    selectedMenu,
    selectApplication,
    selectProfile,
    goBack,
  } = useShell();

  // Show MFE when menu item is selected
  if (selectedMenu) {
    return <MfeContainer />;
  }

  // Show profiles when app is selected but no profile
  if (selectedApplication && !selectedProfile) {
    return (
      <div className="content-area">
        <div className="content-area__header">
          <button className="content-area__back-btn" onClick={goBack}>
            ← Back to Applications
          </button>
          <h2>{selectedApplication.Name}</h2>
          <p>{selectedApplication.Description}</p>
        </div>
        <h3 className="content-area__subtitle">Select a Profile</h3>
        <div className="content-area__cards">
          {profiles.map((profile: Profile) => (
            <div
              key={profile.Id}
              className="content-card content-card--profile"
              onClick={() => selectProfile(profile)}
            >
              <div className="content-card__icon">👤</div>
              <h4 className="content-card__title">{profile.Name}</h4>
              <p className="content-card__desc">{profile.Description}</p>
            </div>
          ))}
        </div>
        {profiles.length === 0 && (
          <div className="content-area__empty">
            <p>No profiles available for this application</p>
          </div>
        )}
      </div>
    );
  }

  // Show profiles selected - prompt to select menu
  if (selectedProfile) {
    return (
      <div className="content-area">
        <div className="content-area__header">
          <button className="content-area__back-btn" onClick={goBack}>
            ← Back to Profiles
          </button>
          <h2>{selectedApplication?.Name} - {selectedProfile.Name}</h2>
          <p>{selectedProfile.Description}</p>
        </div>
        <div className="content-area__prompt">
          <div className="content-area__prompt-icon">👈</div>
          <h3>Select a Menu Item</h3>
          <p>Choose a menu item from the sidebar to load the corresponding micro frontend.</p>
        </div>
      </div>
    );
  }

  // Show applications (default state)
  return (
    <div className="content-area">
      <div className="content-area__header">
        <h2>Select an Application</h2>
        <p>Choose an application to get started</p>
      </div>
      <div className="content-area__cards">
        {applications.map((app: Application) => (
          <div
            key={app.Id}
            className="content-card content-card--app"
            onClick={() => selectApplication(app)}
          >
            <div className="content-card__icon">{app.Icon || "📦"}</div>
            <h4 className="content-card__title">{app.Name}</h4>
            <p className="content-card__desc">{app.Description}</p>
          </div>
        ))}
      </div>
      {applications.length === 0 && (
        <div className="content-area__empty">
          <p>No applications available</p>
        </div>
      )}
    </div>
  );
}
