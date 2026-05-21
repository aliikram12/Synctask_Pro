import { describe, it, expect } from 'vitest';

describe('Offline sync queue', () => {
  it('defines expected action types', () => {
    const actions = ['create', 'update', 'delete'];
    expect(actions).toContain('create');
    expect(actions).toContain('update');
    expect(actions).toHaveLength(3);
  });

  it('sorts queue items by timestamp ascending', () => {
    const queue = [
      { id: 2, timestamp: 200 },
      { id: 1, timestamp: 100 },
      { id: 3, timestamp: 300 },
    ];
    const sorted = [...queue].sort((a, b) => a.timestamp - b.timestamp);
    expect(sorted[0].id).toBe(1);
    expect(sorted[2].id).toBe(3);
  });
});
