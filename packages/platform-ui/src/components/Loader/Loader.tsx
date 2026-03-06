import React from "react";
import "./Loader.styles.css";

export type LoaderSize = "sm" | "md" | "lg";

export interface LoaderProps {
  size?: LoaderSize;
  label?: string;
  overlay?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size = "md", label, overlay = false }) => {
  const spinner = (
    <span className={`pui-loader ${size !== "md" ? `pui-loader--${size}` : ""}`} />
  );

  if (overlay) {
    return (
      <div className="pui-loader-overlay">
        {spinner}
        {label && <span>{label}</span>}
      </div>
    );
  }

  return spinner;
};
