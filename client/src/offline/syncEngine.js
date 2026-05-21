import { db } from './db';
import api from '../services/api';
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
          await api.post('/tasks', item.payload);
          // Assuming the backend handles the ID assignment, we could fetch tasks again after sync
        } else if (item.action === 'update') {
          await api.put(`/tasks/${item.payload.id}`, item.payload.updates);
        } else if (item.action === 'delete') {
          await api.delete(`/tasks/${item.payload.id}`);
        }
        
        // Remove from queue upon success
        await db.syncQueue.delete(item.id);
        successCount++;
      } catch (err) {
        console.error(`Failed to sync item ${item.id}`, err);
        // If conflict (409), handle it gracefully
        if (err.response?.status === 409) {
           toast.error(`Sync conflict for a task. Please refresh.`);
           await db.syncQueue.delete(item.id); // Or keep it for manual merge
        }
      }
    }

    if (successCount > 0) {
      toast.success(`Synced ${successCount} offline changes`);
      // Trigger a re-fetch of tasks if needed
      window.dispatchEvent(new Event('sync:completed'));
    }
    
  } catch (error) {
    console.error('Error during offline sync', error);
  }
};

// Start listening for online events
export const initSyncEngine = () => {
  window.addEventListener('online', () => {
    toast('Back online! Syncing changes...', { icon: '🔄' });
    syncOfflineMutations();
  });
  
  window.addEventListener('offline', () => {
    toast('You are offline. Changes will be saved locally.', { icon: '📶', duration: 4000 });
  });

  // Attempt sync on initial load if online
  if (navigator.onLine) {
    syncOfflineMutations();
  }
};
