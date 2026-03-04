const containerId = "mfe-notification-container";

type NotifyPayload = {
  title: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  duration?: number;
};

// Event names for cross-MFE communication
export const SHELL_EVENTS = {
  NOTIFICATION: "mfe:notification",
  LOADING_START: "mfe:loading:start",
  LOADING_STOP: "mfe:loading:stop",
} as const;

// Shell-integrated notification (preferred)
export const shellNotify = ({
  title,
  message,
  variant = "info",
  duration = 4000,
}: NotifyPayload) => {
  window.dispatchEvent(
    new CustomEvent(SHELL_EVENTS.NOTIFICATION, {
      detail: { type: variant, title, message, duration },
    }),
  );
};

// Shell-integrated loading controls
export const showLoader = (key: string = "default") => {
  window.dispatchEvent(
    new CustomEvent(SHELL_EVENTS.LOADING_START, { detail: { key } }),
  );
};

export const hideLoader = (key: string = "default") => {
  window.dispatchEvent(
    new CustomEvent(SHELL_EVENTS.LOADING_STOP, { detail: { key } }),
  );
};

const ensureContainer = () => {
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.style.position = "fixed";
    container.style.top = "16px";
    container.style.right = "16px";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }
  return container;
};

export const notify = ({ title, message, variant = "info" }: NotifyPayload) => {
  const container = ensureContainer();
  const toast = document.createElement("div");

  const colors: Record<NonNullable<NotifyPayload["variant"]>, string> = {
    info: "#2563eb",
    success: "#16a34a",
    warning: "#f97316",
    error: "#dc2626",
  };

  toast.style.minWidth = "220px";
  toast.style.padding = "12px 14px";
  toast.style.borderRadius = "10px";
  toast.style.background = "#0f172a";
  toast.style.color = "#f8fafc";
  toast.style.border = `1px solid ${colors[variant]}`;
  toast.style.boxShadow = "0 6px 20px rgba(15, 23, 42, 0.3)";
  toast.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px; color: ${
      colors[variant]
    }">${title}</div>
    <div style="font-size: 13px; line-height: 1.4;">${message}</div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 240ms ease";
    setTimeout(() => toast.remove(), 260);
  }, 2400);
};
