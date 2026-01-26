import React, { useState } from "react";
import { notify } from "@mfe/notification-sdk";
import "./cdts.css";

const tasks = [
  { id: "cd-514", name: "Case Review", owner: "K. Patel" },
  { id: "cd-633", name: "Doc Verification", owner: "R. Chen" }
];

const CdtsApp = () => {
  const [page, setPage] = useState("maker");

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
          <h3>Maker Studio</h3>
          <p>Draft customer profiles for CDTS onboarding.</p>
          <label className="mfe__label">
            Client ID
            <input className="mfe__input" placeholder="Enter client ID" />
          </label>
          <label className="mfe__label">
            Verification Level
            <select className="mfe__input">
              <option>Standard</option>
              <option>Enhanced</option>
              <option>Expedited</option>
            </select>
          </label>
          <button
            className="mfe__button"
            onClick={() =>
              notify({
                title: "CDTS Draft Saved",
                message: "Profile sent for checker review.",
                variant: "success"
              })
            }
          >
            Send to Checker
          </button>
        </div>
      ) : (
        <div className="mfe__panel">
          <h3>Checker Desk</h3>
          <p>Validate CDTS submissions awaiting approval.</p>
          <ul className="mfe__list">
            {tasks.map((task) => (
              <li key={task.id} className="mfe__list-item">
                <div>
                  <strong>{task.name}</strong>
                  <span>{task.owner}</span>
                </div>
                <button
                  className="mfe__ghost"
                  onClick={() =>
                    notify({
                      title: "CDTS Case Verified",
                      message: `${task.name} verified.`,
                      variant: "warning"
                    })
                  }
                >
                  Verify
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CdtsApp;
