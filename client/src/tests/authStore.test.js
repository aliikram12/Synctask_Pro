import { describe, it, expect, beforeEach } from 'vitest';
import useAuthStore from '../store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isBootstrapping: false });
  });

  it('sets auth user', () => {
    const user = { _id: '1', name: 'Test', email: 't@test.com' };
    useAuthStore.getState().setAuth(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual(user);
  });

  it('clears auth on logout', async () => {
    useAuthStore.getState().setAuth({ _id: '1', name: 'Test', email: 't@test.com' });
    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
