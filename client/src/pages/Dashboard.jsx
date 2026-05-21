import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, BarChart3, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '../store/useAuthStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import { fetchTaskStats } from '../services/taskService';
import { fetchActivity } from '../services/collaborationService';

const StatCard = ({ title, value, icon: Icon, colorClass, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -2 }}
    className="glass rounded-xl p-6 flex items-center card-hover"
  >
    <div className={`p-4 rounded-xl mr-4 ${colorClass}`}>
      <Icon className="h-6 w-6" aria-hidden="true" />
    </div>
    <div>
      <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
      <h3 className="text-2xl font-bold text-surface-900 dark:text-white">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const user = useAuthStore((s) => s.user);
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspace?._id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetchTaskStats(activeWorkspace._id),
          fetchActivity(activeWorkspace._id, 1),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data.activities || []);
      } catch {
        setStats({ total: 0, completed: 0, inProgress: 0, overdue: 0, byStatus: {} });
      } finally {
        setLoading(false);
      }
    };

    load();
    const onSync = () => load();
    window.addEventListener('sync:completed', onSync);
    return () => window.removeEventListener('sync:completed', onSync);
  }, [activeWorkspace?._id]);

  if (!activeWorkspace) {
    return (
      <div className="glass rounded-xl p-12 text-center">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
          No workspace selected
        </h2>
        <p className="text-surface-500 mb-4">Create or select a workspace from the sidebar.</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Tasks', value: stats?.total ?? '—', icon: BarChart3, colorClass: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' },
    { title: 'Completed', value: stats?.completed ?? '—', icon: CheckCircle2, colorClass: 'bg-accent-500/10 text-accent-600' },
    { title: 'In Progress', value: stats?.inProgress ?? '—', icon: Clock, colorClass: 'bg-warning-50 text-warning-600' },
    { title: 'Overdue', value: stats?.overdue ?? '—', icon: AlertCircle, colorClass: 'bg-danger-50 text-danger-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-1 text-surface-500 dark:text-surface-400">
            {activeWorkspace.name} — your project overview
          </p>
        </div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New Task
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <StatCard key={stat.title} {...stat} delay={i * 0.05} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-xl p-6 min-h-[280px]">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Tasks by Status
          </h3>
          {stats?.byStatus ? (
            <div className="space-y-4">
              {Object.entries(stats.byStatus).map(([status, count]) => {
                const total = stats.total || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-surface-600 dark:text-surface-400">{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full gradient-bg rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-surface-500 text-sm">No task data yet.</p>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            {activity.length === 0 ? (
              <p className="text-sm text-surface-500 italic">No recent activity yet.</p>
            ) : (
              activity.map((a) => (
                <div key={a._id} className="flex gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs flex-shrink-0">
                    {a.userId?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-surface-700 dark:text-surface-300">{a.details}</p>
                    <p className="text-xs text-surface-400">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
