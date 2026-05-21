import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { initSyncEngine } from './offline/syncEngine';
import { connectSocket, disconnectSocket } from './sockets/socketClient';
import useAuthStore from './store/useAuthStore';

function App() {
  const user = useAuthStore((state) => state.user);

  React.useEffect(() => {
    initSyncEngine();
  }, []);

  React.useEffect(() => {
    if (user) {
      connectSocket('64f1b2b3c4d5e6f7a8b9c0d1', user); // Using mock workspaceId for now
    } else {
      disconnectSocket();
    }
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/settings" element={<div className="p-4">Settings placeholder</div>} />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
