const { createTaskSchema, validate } = require('../validators/taskValidator');

describe('createTaskSchema', () => {
  const runValidate = (body) =>
    new Promise((resolve, reject) => {
      const req = { body, query: {}, params: {} };
      const res = { status: () => res };
      validate(createTaskSchema)(req, res, (err) => (err ? reject(err) : resolve()));
    });

  it('accepts valid task body', async () => {
    await expect(
      runValidate({
        workspaceId: '507f1f77bcf86cd799439011',
        title: 'My Task',
        priority: 'High',
      })
    ).resolves.toBeUndefined();
  });

  it('rejects empty title', async () => {
    await expect(
      runValidate({
        workspaceId: '507f1f77bcf86cd799439011',
        title: '',
      })
    ).rejects.toThrow();
  });
});
