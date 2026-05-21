import { io } from 'socket.io-client';
import useTaskStore from '../store/useTaskStore';
import useNotificationStore from '../store/useNotificationStore';
import toast from 'react-hot-toast';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000');

let socket = null;
let currentWorkspaceId = null;

export const connectSocket = (workspaceId, user) => {
  if (!workspaceId || !user) return null;

  if (socket && currentWorkspaceId === workspaceId) return socket;

  if (socket) {
    if (currentWorkspaceId) {
      socket.emit('leave_workspace', currentWorkspaceId);
    }
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, { withCredentials: true, transports: ['websocket', 'polling'] });
  currentWorkspaceId = workspaceId;

  socket.on('connect', () => {
    socket.emit('join_workspace', {
      workspaceId,
      userId: user._id,
      userName: user.name,
    });
  });

  socket.on('task_created', (task) => {
    useTaskStore.getState().handleRealtimeTaskUpdate(task);
    if (task.lastModifiedBy?.toString?.() !== user._id?.toString?.()) {
      toast(`New task: ${task.title}`, { icon: '📝' });
    }
  });

  socket.on('task_updated', (task) => {
    useTaskStore.getState().handleRealtimeTaskUpdate(task);
  });

  socket.on('task_deleted', (taskId) => {
    useTaskStore.getState().removeTask(taskId);
  });

  socket.on('notification', (notification) => {
    useNotificationStore.getState().addNotification(notification);
    toast(notification.message, { icon: '🔔' });
  });

  socket.on('user_typing', ({ userName, taskId }) => {
    window.dispatchEvent(
      new CustomEvent('typing', { detail: { userName, taskId, active: true } })
    );
  });

  socket.on('user_stopped_typing', ({ userId, taskId }) => {
    window.dispatchEvent(
      new CustomEvent('typing', { detail: { userId, taskId, active: false } })
    );
  });

  socket.on('presence_update', ({ online }) => {
    window.dispatchEvent(new CustomEvent('presence', { detail: { online } }));
  });

  return socket;
};

export const getSocket = () => socket;

export const emitTyping = (workspaceId, user, taskId) => {
  socket?.emit('typing', {
    workspaceId,
    userId: user._id,
    userName: user.name,
    taskId,
  });
};

export const emitStopTyping = (workspaceId, user, taskId) => {
  socket?.emit('stop_typing', { workspaceId, userId: user._id, taskId });
};

export const disconnectSocket = () => {
  if (socket) {
    if (currentWorkspaceId) socket.emit('leave_workspace', currentWorkspaceId);
    socket.disconnect();
    socket = null;
    currentWorkspaceId = null;
  }
};
