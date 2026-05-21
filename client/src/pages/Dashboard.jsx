import React from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import { CheckCircle2, Clock, AlertCircle, BarChart3 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6 flex items-center"
  >
    <div className={`p-4 rounded-full mr-4 ${colorClass}`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{title}</p>
      <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);

  // Mock data for the dashboard UI
  const stats = [
    { title: 'Total Tasks', value: '24', icon: BarChart3, colorClass: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' },
    { title: 'Completed', value: '12', icon: CheckCircle2, colorClass: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
    { title: 'In Progress', value: '8', icon: Clock, colorClass: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' },
    { title: 'Overdue', value: '4', icon: AlertCircle, colorClass: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="mt-1 text-secondary-500 dark:text-secondary-400">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
            + New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6 h-96 flex items-center justify-center">
          <p className="text-secondary-500 dark:text-secondary-400">Productivity Chart Placeholder</p>
        </div>
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <p className="text-sm text-secondary-500 dark:text-secondary-400 italic">No recent activity yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
