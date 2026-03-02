import React from "react";
import MfeHost from "../mfe/MfeHost";
import { useShellStore } from "../stores/shellStore";

type Props = {
  path: string;
};

const ShellLayout = ({ path }: Props) => {
  const {
    applications,
    profiles,
    menus,
    loading,
    selectedAppId,
    selectedProfileId,
    selectApp,
    selectProfile,
    clearSelection,
    clearProfileSelection
  } = useShellStore((state) => state);

  const showApplicationList = !selectedAppId;
  const showProfileList = Boolean(selectedAppId) && !selectedProfileId;
  const showMfe = Boolean(selectedAppId && selectedProfileId);

  return (
    <div className="shell">
      <header className="shell__header">
        <h1>MFE Shell</h1>
        <p>Choose an application, then choose Maker/Checker profile to load the MFE.</p>
      </header>

      <main className="shell__content">
        {loading && <p>Loading...</p>}

        {showApplicationList && (
          <section>
            <h2>Applications</h2>
            <div className="shell__cards">
              {applications.map((app) => (
                <button key={app.id} className="shell__card" onClick={() => selectApp(app.id)}>
                  <strong>{app.title}</strong>
                  <span>{app.description}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {showProfileList && (
          <section>
            <div className="shell__section-header">
              <h2>Profiles</h2>
              <button className="shell__link" onClick={clearSelection}>Back</button>
            </div>
            <div className="shell__cards">
              {profiles.map((profile) => (
                <button key={profile.id} className="shell__card" onClick={() => selectProfile(profile.appId, profile.id)}>
                  <strong>{profile.name}</strong>
                  <span>{profile.description}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {showMfe && (
          <>
            <nav className="shell__menu">
              {menus.map((menu) => (
                <button key={menu.Id} className="shell__menu-item" onClick={() => (window.location.hash = `#${menu.Url}`)}>
                  {menu.Title}
                </button>
              ))}
              <button className="shell__link" onClick={clearProfileSelection}>
                Change Profile
              </button>
            </nav>
            <section className="shell__mfe-wrap">
              <MfeHost path={path} />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default ShellLayout;
