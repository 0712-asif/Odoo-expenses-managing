import React, { createContext, useContext, useReducer } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload 
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    default:
      return state;
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Also show toast
    if (notification.type === 'success') {
      toast.success(notification.message);
    } else if (notification.type === 'error') {
      toast.error(notification.message);
    } else if (notification.type === 'warning') {
      toast.warning(notification.message);
    } else {
      toast.info(notification.message);
    }
  };

  const markAsRead = (notificationId) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const showSuccess = (message) => {
    addNotification({ type: 'success', message });
  };

  const showError = (message) => {
    addNotification({ type: 'error', message });
  };

  const showWarning = (message) => {
    addNotification({ type: 'warning', message });
  };

  const showInfo = (message) => {
    addNotification({ type: 'info', message });
  };

  const value = {
    ...state,
    addNotification,
    markAsRead,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;