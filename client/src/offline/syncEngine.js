import { db } from './db';
import * as taskService from '../services/taskService';
import toast from 'react-hot-toast';

export const syncOfflineMutations = async () => {
  if (!navigator.onLine) return;

  try {
    const queue = await db.syncQueue.orderBy('timestamp').toArray();
    if (queue.length === 0) return;

    let successCount = 0;

    for (const item of queue) {
      try {
        if (item.action === 'create') {
          const res = await taskService.createTask(item.payload);
          if (item.tempId) {
            await db.tasks.delete(item.tempId);
            await db.tasks.put(res.data);
          }
        } else if (item.action === 'update') {
          await taskService.updateTask(item.payload.id, item.payload.updates);
        } else if (item.action === 'delete') {
          await taskService.deleteTask(item.payload.id);
        }

        await db.syncQueue.delete(item.id);
        successCount++;
      } catch (err) {
        if (err.response?.status === 409) {
          toast.error('Sync conflict — open the task board to resolve.');
          window.dispatchEvent(
            new CustomEvent('sync:conflict', { detail: err.response.data })
          );
        }
        console.error(`Failed to sync item ${item.id}`, err);
      }
    }

    if (successCount > 0) {
      toast.success(`Synced ${successCount} offline change${successCount > 1 ? 's' : ''}`);
      window.dispatchEvent(new Event('sync:completed'));
    }
  } catch (error) {
    console.error('Error during offline sync', error);
  }
};

export const initSyncEngine = () => {
  window.addEventListener('online', () => {
    toast('Back online! Syncing changes...', { icon: '🔄' });
    syncOfflineMutations();
  });

  window.addEventListener('offline', () => {
    toast('You are offline. Changes will be saved locally.', { icon: '📶', duration: 4000 });
  });

  if (navigator.onLine) {
    syncOfflineMutations();
  }
};
