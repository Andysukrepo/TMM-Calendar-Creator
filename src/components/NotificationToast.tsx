import React from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  return (
    <div className={`tmm-toast ${toast.type}`}>
      <span>{toast.text}</span>
      <button type="button" onClick={onDismiss} aria-label="Close notification">
        &times;
      </button>
    </div>
  );
};
