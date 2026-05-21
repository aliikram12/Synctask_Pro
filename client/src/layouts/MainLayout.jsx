import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { LogOut, LayoutDashboard, CheckSquare, Bell, User, Settings } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
      logout();
      toast.success('Logged out');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-secondary-50 dark:bg-secondary-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-secondary-200 dark:border-secondary-700">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">SyncTask Pro</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link to="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link to="/tasks" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700">
            <CheckSquare className="mr-3 h-5 w-5" />
            My Tasks
          </Link>
          <Link to="/settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </div>
        
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between px-4 sm:px-6">
          <div className="md:hidden">
            <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400">SyncTask Pro</h1>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300 md:hidden">
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-secondary-50 dark:bg-secondary-900 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
