import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Menu from "./Menu";
import RemoteComponent from "./RemoteComponent";
import { mfeConfig } from "./mfe-config";

export default function App() {
  return (
    <BrowserRouter>
      <div className="shell">
        <header className="shell__header">
          <h1>MFE Shell</h1>
          <p>Dynamic runtime micro frontend loader</p>
        </header>

        <Menu />

        <main className="shell__content">
          <Routes>
            {mfeConfig.map((mfe) => (
              <Route key={mfe.name} path={mfe.route} element={<RemoteComponent name={mfe.name} scope={mfe.scope} />} />
            ))}
            <Route path="*" element={<Navigate to={mfeConfig[0].route} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
