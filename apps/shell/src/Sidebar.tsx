import React from "react";
import { useShell } from "./ShellContext";
import type { MenuItem } from "./types";

export default function Sidebar() {
  const {
    menuItems,
    selectedMenu,
    selectedProfile,
    selectMenu,
  } = useShell();

  const handleMenuClick = (menu: MenuItem) => {
    selectMenu(menu);
  };

  if (!selectedProfile) {
    return null;
  }

  return (
    <aside className="sidebar">
      <section className="sidebar__section">
        <h3 className="sidebar__section-title">
          Menu - {selectedProfile.Name}
        </h3>
        <ul className="sidebar__list">
          {menuItems.map((menu) => (
            <li
              key={menu.Id}
              className={`sidebar__item ${selectedMenu?.Id === menu.Id ? "sidebar__item--active" : ""}`}
              onClick={() => handleMenuClick(menu)}
            >
              <span className="sidebar__item-icon">{menu.Icon || "📄"}</span>
              <span className="sidebar__item-text">{menu.Name}</span>
            </li>
          ))}
        </ul>
      </section>

      {menuItems.length === 0 && (
        <div className="sidebar__empty">
          <p>No menu items available</p>
        </div>
      )}
    </aside>
  );
}
