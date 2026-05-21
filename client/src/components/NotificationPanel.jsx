import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck } from 'lucide-react';
import useNotificationStore from '../store/useNotificationStore';
import Button from './ui/Button';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead, isLoading } =
    useNotificationStore();

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 glass rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 overflow-hidden"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary-600" />
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  aria-label="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> All read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-6 text-center text-sm text-surface-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-surface-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    className={`w-full text-left px-4 py-3 border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors ${
                      !n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <p className="text-sm text-surface-800 dark:text-surface-200">{n.message}</p>
                    <p className="text-xs text-surface-400 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
