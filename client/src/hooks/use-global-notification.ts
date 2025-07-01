import { useState, useCallback, useEffect } from 'react';
import type { NotificationBannerData } from '@/components/global-notification-banner';

// Global notification state
let globalNotification: NotificationBannerData | null = null;
let listeners: Array<(notification: NotificationBannerData | null) => void> = [];
let notificationCounter = 0;

// Global functions to manage notifications
const setGlobalNotification = (notification: NotificationBannerData | null) => {
  globalNotification = notification;
  listeners.forEach(listener => listener(notification));
};

export const useGlobalNotification = () => {
  const [currentNotification, setCurrentNotification] = useState<NotificationBannerData | null>(globalNotification);

  const subscribe = useCallback((listener: (notification: NotificationBannerData | null) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  // Subscribe to global state changes
  useEffect(() => {
    const unsubscribe = subscribe(setCurrentNotification);
    return unsubscribe;
  }, [subscribe]);

  const showNotification = useCallback((notification: Omit<NotificationBannerData, 'id'>) => {
    const id = `notification-${++notificationCounter}`;
    setGlobalNotification({
      ...notification,
      id,
    });
  }, []);

  const dismissNotification = useCallback(() => {
    setGlobalNotification(null);
  }, []);

  return {
    currentNotification,
    showNotification,
    dismissNotification,
  };
};

// Convenience functions for different notification types
export const showSuccessNotification = (title: string, message: string, duration?: number) => {
  const id = `notification-${++notificationCounter}`;
  setGlobalNotification({
    type: 'success',
    title,
    message,
    duration,
    id,
  });
};

export const showErrorNotification = (title: string, message: string, duration?: number) => {
  const id = `notification-${++notificationCounter}`;
  setGlobalNotification({
    type: 'error',
    title,
    message,
    duration,
    id,
  });
};

export const showWarningNotification = (title: string, message: string, duration?: number) => {
  const id = `notification-${++notificationCounter}`;
  setGlobalNotification({
    type: 'warning',
    title,
    message,
    duration,
    id,
  });
};

export const showInfoNotification = (title: string, message: string, duration?: number) => {
  const id = `notification-${++notificationCounter}`;
  setGlobalNotification({
    type: 'info',
    title,
    message,
    duration,
    id,
  });
};