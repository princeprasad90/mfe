import React from "react";
import "./Button.styles.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...rest
}) => {
  const cls = [
    "pui-btn",
    `pui-btn--${variant}`,
    size !== "md" ? `pui-btn--${size}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className="pui-loader pui-loader--sm" />}
      {children}
    </button>
  );
};
