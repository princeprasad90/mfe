import React, { Suspense } from "react";
import { notify } from "@mfe/notification-sdk";

const CbmsApp = React.lazy(() => import("cbmsApp/CbmsApp"));
const CdtsApp = React.lazy(() => import("cdtsApp/CdtsApp"));

const App = () => {
  return (
    <div className="shell">
      <header className="shell__header">
        <div>
          <p className="shell__eyebrow">MFE Shell</p>
          <h1>Operations Console</h1>
          <p className="shell__subtitle">
            The shell sets the application style while CBMS and CDTS load in
            dedicated tiles below.
          </p>
        </div>
        <button
          className="shell__notify"
          onClick={() =>
            notify({
              title: "Shell Notification",
              message: "Shell-triggered notification from the SDK.",
              variant: "success"
            })
          }
        >
          Trigger Notification
        </button>
      </header>

      <main className="shell__grid">
        <section className="shell__tile">
          <div className="shell__tile-header">
            <h2>CBMS</h2>
            <span className="shell__tile-tag">Customer Banking</span>
          </div>
          <Suspense fallback={<p>Loading CBMS...</p>}>
            <CbmsApp />
          </Suspense>
        </section>
        <section className="shell__tile">
          <div className="shell__tile-header">
            <h2>CDTS</h2>
            <span className="shell__tile-tag">Data Tracking</span>
          </div>
          <Suspense fallback={<p>Loading CDTS...</p>}>
            <CdtsApp />
          </Suspense>
        </section>
      </main>
    </div>
  );
};

export default App;
