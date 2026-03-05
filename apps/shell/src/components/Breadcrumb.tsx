import React from "react";
import { useShell } from "../ShellContext";

export default function Breadcrumb() {
  const {
    selectedApplication,
    selectedProfile,
    selectedMenu,
    goBack,
    selectApplication,
    selectProfile,
  } = useShell();

  // Don't show if nothing is selected
  if (!selectedApplication) {
    return null;
  }

  const handleAppClick = () => {
    if (selectedProfile || selectedMenu) {
      // Go back to app selection (shows profiles)
      selectApplication(selectedApplication);
    }
  };

  const handleProfileClick = () => {
    if (selectedMenu && selectedProfile) {
      // Go back to profile selection (shows menu selection prompt)
      selectProfile(selectedProfile);
    }
  };

  return (
    <nav className="breadcrumb">
      <div className="breadcrumb__container">
        {/* Home */}
        <button className="breadcrumb__item breadcrumb__home" onClick={goBack} title="Back to Applications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        </button>

        {/* Application */}
        <span className="breadcrumb__separator">/</span>
        <button
          className={`breadcrumb__item ${!selectedProfile ? 'breadcrumb__item--active' : ''}`}
          onClick={handleAppClick}
          disabled={!selectedProfile && !selectedMenu}
        >
          {selectedApplication.LogoUrl ? (
            <img
              src={selectedApplication.LogoUrl}
              alt={selectedApplication.Name}
              className="breadcrumb__logo"
            />
          ) : (
            <>
              <span className="breadcrumb__icon">{selectedApplication.Icon || "📦"}</span>
              <span className="breadcrumb__text">{selectedApplication.Name}</span>
            </>
          )}
        </button>

        {/* Profile */}
        {selectedProfile && (
          <>
            <span className="breadcrumb__separator">/</span>
            <button
              className={`breadcrumb__item ${!selectedMenu ? 'breadcrumb__item--active' : ''}`}
              onClick={handleProfileClick}
              disabled={!selectedMenu}
            >
              <span className="breadcrumb__icon">👤</span>
              <span className="breadcrumb__text">{selectedProfile.Name}</span>
            </button>
          </>
        )}

        {/* Menu/Page */}
        {selectedMenu && (
          <>
            <span className="breadcrumb__separator">/</span>
            <span className="breadcrumb__item breadcrumb__item--active breadcrumb__item--current">
              <span className="breadcrumb__icon">{selectedMenu.Icon || "📄"}</span>
              <span className="breadcrumb__text">{selectedMenu.Name}</span>
            </span>
          </>
        )}
      </div>
    </nav>
  );
}
