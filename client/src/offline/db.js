import Dexie from 'dexie';

export const db = new Dexie('SyncTaskProDB');

db.version(1).stores({
  tasks: '_id, workspaceId, title, status, priority, dueDate, version',
  syncQueue: '++id, action, payload, timestamp', // For storing offline mutations
});
