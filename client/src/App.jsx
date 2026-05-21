import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Signup from './pages/Signup';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthBootstrap from './components/AuthBootstrap';
import ErrorBoundary from './components/ErrorBoundary';
import ConflictModal from './components/ConflictModal';
import { initSyncEngine } from './offline/syncEngine';
import { connectSocket, disconnectSocket } from './sockets/socketClient';
import useAuthStore from './store/useAuthStore';
import useWorkspaceStore from './store/useWorkspaceStore';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Team = lazy(() => import('./pages/Team'));
const Settings = lazy(() => import('./pages/Settings'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64" role="status" aria-label="Loading">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
  </div>
);

function App() {
  const user = useAuthStore((state) => state.user);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  React.useEffect(() => {
    initSyncEngine();
  }, []);

  React.useEffect(() => {
    if (user && activeWorkspace?._id) {
      window.__activeWorkspaceId = activeWorkspace._id;
      connectSocket(activeWorkspace._id, user);
    } else {
      disconnectSocket();
    }
    return () => {};
  }, [user, activeWorkspace?._id]);

  return (
    <ErrorBoundary>
      <Router>
        <AuthBootstrap />
        <div className="min-h-screen">
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-surface-800 dark:text-white',
            }}
          />
          <ConflictModal />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
