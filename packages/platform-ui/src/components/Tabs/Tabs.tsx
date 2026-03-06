import React, { useState } from "react";
import "./Tabs.styles.css";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledTab,
  onChange,
  className = "",
}) => {
  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.id ?? "");
  const activeTab = controlledTab ?? internalTab;

  const handleClick = (tabId: string) => {
    if (!controlledTab) setInternalTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={`pui-tabs ${className}`}>
      <div className="pui-tabs__list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeTab}
            className={`pui-tabs__tab ${tab.id === activeTab ? "pui-tabs__tab--active" : ""}`}
            disabled={tab.disabled}
            onClick={() => handleClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pui-tabs__panel" role="tabpanel">
        {activeContent}
      </div>
    </div>
  );
};
