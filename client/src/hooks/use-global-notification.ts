import { create } from 'zustand';
import type { NotificationBannerData } from '@/components/global-notification-banner';

interface NotificationStore {
  currentNotification: NotificationBannerData | null;
  showNotification: (notification: Omit<NotificationBannerData, 'id'>) => void;
  dismissNotification: () => void;
}

let notificationCounter = 0;

const useNotificationStore = create<NotificationStore>((set) => ({
  currentNotification: null,
  
  showNotification: (notification) => {
    const id = `notification-${++notificationCounter}`;
    set({
      currentNotification: {
        ...notification,
        id,
      }
    });
  },
  
  dismissNotification: () => {
    set({ currentNotification: null });
  },
}));

export const useGlobalNotification = () => {
  const { currentNotification, showNotification, dismissNotification } = useNotificationStore();
  
  return {
    currentNotification,
    showNotification,
    dismissNotification,
  };
};

// Convenience functions for different notification types
export const showSuccessNotification = (title: string, message: string, duration?: number) => {
  useNotificationStore.getState().showNotification({
    type: 'success',
    title,
    message,
    duration,
  });
};

export const showErrorNotification = (title: string, message: string, duration?: number) => {
  useNotificationStore.getState().showNotification({
    type: 'error',
    title,
    message,
    duration,
  });
};

export const showWarningNotification = (title: string, message: string, duration?: number) => {
  useNotificationStore.getState().showNotification({
    type: 'warning',
    title,
    message,
    duration,
  });
};

export const showInfoNotification = (title: string, message: string, duration?: number) => {
  useNotificationStore.getState().showNotification({
    type: 'info',
    title,
    message,
    duration,
  });
};