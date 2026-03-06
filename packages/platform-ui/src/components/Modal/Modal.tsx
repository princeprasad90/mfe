import React, { useEffect, useCallback } from "react";
import "./Modal.styles.css";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  width,
  closeOnOverlay = true,
  closeOnEsc = true,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape") onClose();
    },
    [closeOnEsc, onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="pui-modal-overlay"
      onClick={closeOnOverlay ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="pui-modal"
        style={width ? { width } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="pui-modal__header">
            <span className="pui-modal__title">{title}</span>
            <button className="pui-modal__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        )}
        <div className="pui-modal__body">{children}</div>
        {footer && <div className="pui-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};
