import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import {
  LogOut, LayoutDashboard, CheckSquare, Bell, Settings, Sun, Moon,
  Menu, X, ChevronDown, Plus, Users, Wifi, WifiOff
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
    }`}
  >
    <Icon className="h-5 w-5 flex-shrink-0" />
    <span>{label}</span>
  </Link>
);

const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, initTheme } = useThemeStore();
  const { activeWorkspace, workspaces, fetchWorkspaces, createWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);

  useEffect(() => { initTheme(); }, [initTheme]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    const onOn = () => setIsOnline(true);
    const onOff = () => setIsOnline(false);
    window.addEventListener('online', onOn);
    window.addEventListener('offline', onOff);
    return () => { window.removeEventListener('online', onOn); window.removeEventListener('offline', onOff); };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
    } catch {}
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const handleCreateWorkspace = async () => {
    const name = prompt('Workspace name:');
    if (!name) return;
    try {
      await createWorkspace(name);
      toast.success('Workspace created!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-5 border-b border-surface-200 dark:border-surface-800">
        <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
          <CheckSquare className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold gradient-text">SyncTask Pro</span>
      </div>

      {/* Workspace Selector */}
      <div className="px-3 pt-4 pb-2">
        <div className="relative">
          <button
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <span className="truncate font-medium text-surface-700 dark:text-surface-300">
              {activeWorkspace?.name || 'Select Workspace'}
            </span>
            <ChevronDown className="h-4 w-4 text-surface-400 ml-2 flex-shrink-0" />
          </button>

          <AnimatePresence>
            {wsDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-20 w-full mt-1 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 overflow-hidden"
              >
                {workspaces.map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => { setActiveWorkspace(ws); setWsDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-700 ${
                      activeWorkspace?._id === ws._id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium' : 'text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    {ws.name}
                  </button>
                ))}
                <button
                  onClick={() => { handleCreateWorkspace(); setWsDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 border-t border-surface-200 dark:border-surface-700"
                >
                  <Plus className="h-4 w-4" /> New Workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/dashboard'} />
        <NavItem to="/tasks" icon={CheckSquare} label="Tasks" active={location.pathname === '/tasks'} />
        <NavItem to="/team" icon={Users} label="Team" active={location.pathname === '/team'} />
        <NavItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
      </nav>

      {/* Online Status */}
      <div className="px-4 py-2">
        <div className={`flex items-center gap-2 text-xs font-medium ${isOnline ? 'text-accent-500' : 'text-warning-500'}`}>
          {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          {isOnline ? 'Online' : 'Offline — changes will sync'}
        </div>
      </div>

      {/* User Card */}
      <div className="p-3 border-t border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div className="h-9 w-9 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-surface-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-danger-600 bg-danger-50 dark:bg-danger-500/10 hover:bg-danger-500/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 bg-white dark:bg-surface-900 shadow-2xl lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 sm:px-6 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-surface-500 hover:text-surface-700 dark:text-surface-400"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              {activeWorkspace?.name || 'SyncTask Pro'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="relative p-2 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-danger-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-surface-50 dark:bg-surface-950 p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
