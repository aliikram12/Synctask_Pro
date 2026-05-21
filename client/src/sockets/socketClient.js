import { io } from 'socket.io-client';
import useTaskStore from '../store/useTaskStore';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

let socket;

export const connectSocket = (workspaceId, user) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    if (workspaceId) {
      socket.emit('join_workspace', workspaceId);
    }
  });

  socket.on('task_created', (task) => {
    useTaskStore.getState().handleRealtimeTaskUpdate(task);
    if (task.lastModifiedBy !== user?._id) {
      toast(`New task: ${task.title}`, { icon: '📝' });
    }
  });

  socket.on('task_updated', (task) => {
    useTaskStore.getState().handleRealtimeTaskUpdate(task);
  });

  socket.on('task_deleted', (taskId) => {
    const currentTasks = useTaskStore.getState().tasks;
    useTaskStore.setState({ tasks: currentTasks.filter(t => t._id !== taskId) });
  });

  socket.on('user_typing', ({ userId, taskId }) => {
    // In a full app, we'd update a typing indicator state here
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
