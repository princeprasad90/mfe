import React from "react";
import { Link, useLocation } from "react-router-dom";
import { mfeConfig } from "./mfe-config";

export default function Menu() {
  const location = useLocation();

  const isActiveRoute = (route: string) =>
    location.pathname === route || location.pathname.startsWith(`${route}/`);

  return (
    <nav className="shell__menu">
      {mfeConfig.map((mfe) => (
        <Link key={mfe.name} to={mfe.route} className={`shell__menu-item ${isActiveRoute(mfe.route) ? "is-active" : ""}`}>
          {mfe.name}
        </Link>
      ))}
    </nav>
  );
}
