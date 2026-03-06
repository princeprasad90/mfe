import React, { useState } from "react";
import { useShell } from "./ShellContext";
import type { MenuItem } from "./types";

export default function Sidebar() {
  const {
    menuItems,
    selectedMenu,
    selectedProfile,
    selectMenu,
  } = useShell();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleMenuClick = (menu: MenuItem) => {
    selectMenu(menu);
  };

  if (!selectedProfile) {
    return null;
  }

  return (
    <aside className={`sidebar ${isCollapsed ? "sidebar--collapsed" : ""}`}>
      {/* Collapse toggle */}
      <div className="sidebar__toggle">
        <button
          className="sidebar__toggle-btn"
          onClick={() => setIsCollapsed((v) => !v)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "›" : "‹"}
        </button>
      </div>

      <section className="sidebar__section">
        <h3 className="sidebar__section-title">
          Menu - {selectedProfile.Name}
        </h3>
        <ul className="sidebar__list">
          {menuItems.map((menu) => (
            <li
              key={menu.Id}
              data-label={menu.Name}
              className={`sidebar__item ${selectedMenu?.Id === menu.Id ? "sidebar__item--active" : ""}`}
              onClick={() => handleMenuClick(menu)}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleMenuClick(menu)}
              aria-current={selectedMenu?.Id === menu.Id ? "page" : undefined}
            >
              <span className="sidebar__item-icon">{menu.Icon || "📄"}</span>
              <span className="sidebar__item-text">{menu.Name}</span>
            </li>
          ))}
        </ul>
      </section>

      {menuItems.length === 0 && (
        <div className="sidebar__empty">
          {!isCollapsed && <p>No menu items available</p>}
        </div>
      )}
    </aside>
  );
}
