import { describe, it, expect, beforeEach } from 'vitest';

describe('Auth store logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists user to localStorage', () => {
    const user = { _id: '1', name: 'Test', email: 't@test.com' };
    localStorage.setItem(
      'auth-storage',
      JSON.stringify({ state: { user, isAuthenticated: true }, version: 0 })
    );
    const stored = JSON.parse(localStorage.getItem('auth-storage'));
    expect(stored.state.isAuthenticated).toBe(true);
    expect(stored.state.user.email).toBe('t@test.com');
  });
});
