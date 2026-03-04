import React, { useEffect } from 'react';
import { useNotificationStore, Notification, NotificationType } from '../stores';

const SHELL_EVENTS = {
  NOTIFICATION: 'mfe:notification',
};

interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

const iconMap: Record<NotificationType, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

function NotificationItem({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  useEffect(() => {
    const duration = notification.duration || 4000;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [notification.duration, onClose]);

  return (
    <div className={`shell-notification shell-notification--${notification.type}`}>
      <span className="shell-notification__icon">{iconMap[notification.type]}</span>
      <div className="shell-notification__content">
        <div className="shell-notification__title">{notification.title}</div>
        <div className="shell-notification__message">{notification.message}</div>
      </div>
      <button className="shell-notification__close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
}

export function NotificationContainer() {
  const { notifications, add, remove } = useNotificationStore();

  useEffect(() => {
    const handler = (e: CustomEvent<NotificationPayload>) => {
      add(e.detail);
    };

    window.addEventListener(SHELL_EVENTS.NOTIFICATION, handler as EventListener);
    return () => window.removeEventListener(SHELL_EVENTS.NOTIFICATION, handler as EventListener);
  }, [add]);

  if (notifications.length === 0) return null;

  return (
    <div className="shell-notification-container">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => remove(notification.id)}
        />
      ))}
    </div>
  );
}
