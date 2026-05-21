import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import useTaskStore from '../store/useTaskStore';

const ConflictModal = () => {
  const conflict = useTaskStore((s) => s.conflict);
  const resolveConflict = useTaskStore((s) => s.resolveConflict);
  const clearConflict = useTaskStore((s) => s.clearConflict);

  if (!conflict) return null;

  return (
    <Modal
      isOpen={!!conflict}
      onClose={clearConflict}
      title="Sync Conflict Detected"
    >
      <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
        This task was modified by another collaborator while you were offline or editing.
        Choose which version to keep.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div className="p-3 rounded-lg border border-surface-200 dark:border-surface-700">
          <p className="text-xs font-semibold text-primary-600 mb-2">Your version</p>
          <p className="text-sm font-medium">{conflict.localTask?.title}</p>
          <p className="text-xs text-surface-500 mt-1">Status: {conflict.localTask?.status}</p>
        </div>
        <div className="p-3 rounded-lg border border-surface-200 dark:border-surface-700">
          <p className="text-xs font-semibold text-accent-500 mb-2">Server version</p>
          <p className="text-sm font-medium">{conflict.serverTask?.title}</p>
          <p className="text-xs text-surface-500 mt-1">Status: {conflict.serverTask?.status}</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => resolveConflict(false)}>
          Keep mine
        </Button>
        <Button onClick={() => resolveConflict(true)}>Use server version</Button>
      </div>
    </Modal>
  );
};

export default ConflictModal;
