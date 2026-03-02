import React from "react";
import MfeHost from "../mfe/MfeHost";
import { useShellStore } from "../stores/shellStore";

type Props = {
  path: string;
};

const ShellLayout = ({ path }: Props) => {
  const menus = useShellStore((state) => state.menus);
  const loading = useShellStore((state) => state.loading);

  return (
    <div className="shell">
      <header className="shell__header">
        <h1>MFE Shell</h1>
      </header>
      <nav className="shell__menu">
        {menus.map((menu) => (
          <button key={menu.Id} className="shell__menu-item" onClick={() => (window.location.hash = `#${menu.Url}`)}>
            {menu.Title}
          </button>
        ))}
      </nav>
      <main className="shell__content">{loading ? <p>Loading menus...</p> : <MfeHost path={path} />}</main>
    </div>
  );
};

export default ShellLayout;
