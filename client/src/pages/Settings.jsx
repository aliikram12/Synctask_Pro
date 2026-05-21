import React from 'react';
import { useForm } from 'react-hook-form';
import { User, Bell, Palette } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const Settings = () => {
  const user = useAuthStore((s) => s.user);
  const { theme, toggleTheme } = useThemeStore();
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const onSubmit = (data) => {
    toast.success('Profile updates require backend endpoint — display saved locally for demo.');
    console.log('Profile update:', data);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-surface-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <section className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Profile</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" {...register('name')} />
          <Input label="Email" type="email" disabled {...register('email')} />
          <p className="text-xs text-surface-400">Email cannot be changed</p>
          <Button type="submit" size="sm">Save Profile</Button>
        </form>
      </section>

      <section className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-surface-900 dark:text-white">Theme</p>
            <p className="text-sm text-surface-500">Currently using {theme} mode</p>
          </div>
          <Button variant="outline" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
        </div>
      </section>

      <section className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Notifications</h2>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-surface-700 dark:text-surface-300">Task assignment alerts</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer mt-3">
          <input type="checkbox" defaultChecked className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-surface-700 dark:text-surface-300">Due date reminders</span>
        </label>
      </section>
    </div>
  );
};

export default Settings;
