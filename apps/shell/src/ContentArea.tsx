import React, { useState, useMemo } from "react";
import { useShell } from "./ShellContext";
import type { Application, Profile } from "./types";
import MfeContainer from "./MfeContainer";
import { SkeletonCards } from "./components";

export default function ContentArea() {
  const {
    applications,
    profiles,
    selectedApplication,
    selectedProfile,
    selectedMenu,
    isLoading,
    selectApplication,
    selectProfile,
    goBack,
  } = useShell();

  const [searchQuery, setSearchQuery] = useState("");

  // Filter applications based on search query
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const query = searchQuery.toLowerCase();
    return applications.filter(
      (app) =>
        app.Name.toLowerCase().includes(query) ||
        app.Description.toLowerCase().includes(query)
    );
  }, [applications, searchQuery]);

  // Show MFE when menu item is selected
  if (selectedMenu) {
    return <MfeContainer />;
  }

  // Show profiles when app is selected but no profile
  if (selectedApplication && !selectedProfile) {
    return (
      <div className="content-area">
        <div className="content-area__header">
          <div className="content-area__app-header">
            {selectedApplication.LogoUrl ? (
              <img
                src={selectedApplication.LogoUrl}
                alt={selectedApplication.Name}
                className="content-area__app-logo"
              />
            ) : (
              <span className="content-area__app-icon">{selectedApplication.Icon || "📦"}</span>
            )}
            <div>
              <h2>{selectedApplication.Name}</h2>
              <p>{selectedApplication.Description}</p>
            </div>
          </div>
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
          <div className="content-area__app-header">
            {selectedApplication?.LogoUrl ? (
              <img
                src={selectedApplication.LogoUrl}
                alt={selectedApplication.Name}
                className="content-area__app-logo"
              />
            ) : (
              <span className="content-area__app-icon">{selectedApplication?.Icon || "📦"}</span>
            )}
            <div>
              <h2>{selectedProfile.Name}</h2>
              <p>{selectedProfile.Description}</p>
            </div>
          </div>
        </div>
        <div className="content-area__prompt">
          <div className="content-area__prompt-icon">👈</div>
          <h3>Select a Menu Item</h3>
          <p>Choose a menu item from the sidebar to load the corresponding micro frontend.</p>
        </div>
      </div>
    );
  }

  // Show applications (default state) with search
  return (
    <div className="content-area">
      <div className="content-area__header">
        <h2>Select an Application</h2>
        <p>Choose an application to get started ({applications.length} available)</p>
      </div>

      {/* Search Box */}
      <div className="content-area__search">
        <div className="search-box">
          <svg className="search-box__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-box__input"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              className="search-box__clear"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="search-box__results">
            Found {filteredApplications.length} of {applications.length} applications
          </p>
        )}
      </div>

      {/* Applications Grid — skeleton while loading, cards when ready */}
      {isLoading ? (
        <SkeletonCards count={8} />
      ) : (
        <div className="content-area__cards">
          {filteredApplications.map((app: Application) => (
            <div
              key={app.Id}
              className="content-card content-card--app"
              onClick={() => selectApplication(app)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && selectApplication(app)}
            >
              {app.LogoUrl ? (
                <img
                  src={app.LogoUrl}
                  alt={app.Name}
                  className="content-card__logo"
                />
              ) : (
                <div className="content-card__icon">{app.Icon || "📦"}</div>
              )}
              <h4 className="content-card__title">{app.Name}</h4>
              <p className="content-card__desc">{app.Description}</p>
            </div>
          ))}
        </div>
      )}

      {filteredApplications.length === 0 && applications.length > 0 && (
        <div className="content-area__empty">
          <p>No applications match "{searchQuery}"</p>
          <button className="content-area__clear-btn" onClick={() => setSearchQuery("")}>
            Clear search
          </button>
        </div>
      )}

      {applications.length === 0 && (
        <div className="content-area__empty">
          <p>No applications available</p>
        </div>
      )}
    </div>
  );
}
