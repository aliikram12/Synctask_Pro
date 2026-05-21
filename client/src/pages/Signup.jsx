import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../store/useAuthStore';
import { signup } from '../services/authService';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Signup = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated, isBootstrapping } = useAuthStore();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, isBootstrapping, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data) => {
    try {
      const response = await signup(data);
      setAuth(response.data);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  if (isBootstrapping) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-2xl p-8 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="h-12 w-12 mx-auto rounded-xl gradient-bg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white">Create account</h1>
          <p className="mt-2 text-sm text-surface-500">Join SyncTask Pro</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Full Name" autoComplete="name" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
