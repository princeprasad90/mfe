import React from "react";
import "../_shared/form.styles.css";
import "./Form.styles.css";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

/** Thin wrapper — prevents default submit and applies pui-form styling. */
export const Form: React.FC<FormProps> = ({ children, onSubmit, className = "", ...rest }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form className={`pui-form ${className}`} onSubmit={handleSubmit} {...rest}>
      {children}
    </form>
  );
};

export const FormGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`pui-form__group ${className}`}>{children}</div>;

export const FormRow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`pui-form__row ${className}`}>{children}</div>;

export const FormActions: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`pui-form__actions ${className}`}>{children}</div>;
