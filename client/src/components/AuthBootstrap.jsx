import React, { useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';

const AuthBootstrap = () => {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (isBootstrapping) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-surface-50 dark:bg-surface-950"
        role="status"
        aria-live="polite"
        aria-label="Loading application"
      >
        <div className="text-center">
          <div className="h-12 w-12 mx-auto rounded-xl gradient-bg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <p className="text-sm text-surface-500">Loading SyncTask Pro...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthBootstrap;
