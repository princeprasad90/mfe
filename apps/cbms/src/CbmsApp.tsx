import React, { useEffect, useState } from "react";
import { notify } from "@mfe/notification-sdk";
import "./cbms.css";

type Page = "maker" | "checker";

type Profile = {
  id: string;
  name: string;
  role: string;
};

const CbmsApp = () => {
  const [page, setPage] = useState<Page>("maker");
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const response = await fetch("/api/cbms/profiles");
        if (!response.ok) {
          throw new Error("Failed to load CBMS profiles");
        }
        const data = (await response.json()) as Profile[];
        setProfiles(data);
      } catch (error) {
        setProfiles([]);
      }
    };

    loadProfiles();
  }, []);

  return (
    <div className="mfe">
      <div className="mfe__tabs">
        <button
          className={`mfe__tab ${page === "maker" ? "is-active" : ""}`}
          onClick={() => setPage("maker")}
        >
          Profile Maker
        </button>
        <button
          className={`mfe__tab ${page === "checker" ? "is-active" : ""}`}
          onClick={() => setPage("checker")}
        >
          Profile Checker
        </button>
      </div>

      {page === "maker" ? (
        <div className="mfe__panel">
          <h3>Maker Workspace</h3>
          <p>Create new customer profiles for the CBMS queue.</p>
          <label className="mfe__label">
            Full Name
            <input className="mfe__input" placeholder="Enter customer name" />
          </label>
          <label className="mfe__label">
            Risk Notes
            <textarea className="mfe__input" rows={3} placeholder="Add notes" />
          </label>
          <button
            className="mfe__button"
            onClick={() =>
              notify({
                title: "CBMS Profile Created",
                message: "Profile submitted to checker queue.",
                variant: "success"
              })
            }
          >
            Submit to Checker
          </button>
        </div>
      ) : (
        <div className="mfe__panel">
          <h3>Checker Queue</h3>
          <p>Review the latest CBMS profile submissions.</p>
          {profiles.length === 0 ? (
            <p className="mfe__empty">No profiles loaded yet.</p>
          ) : (
            <ul className="mfe__list">
              {profiles.map((profile) => (
                <li key={profile.id} className="mfe__list-item">
                  <div>
                    <strong>{profile.name}</strong>
                    <span>{profile.role}</span>
                  </div>
                  <button
                    className="mfe__ghost"
                    onClick={() =>
                      notify({
                        title: "CBMS Profile Approved",
                        message: `${profile.name} approved successfully.`,
                        variant: "info"
                      })
                    }
                  >
                    Approve
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CbmsApp;
