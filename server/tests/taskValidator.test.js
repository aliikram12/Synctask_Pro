const { z } = require('zod');

const createTaskSchema = z.object({
  body: z.object({
    workspaceId: z.string({ required_error: 'Workspace ID is required' }),
    title: z.string({ required_error: 'Title is required' }).min(1, 'Title cannot be empty'),
    description: z.string().optional(),
    status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Urgent']).optional(),
    assignees: z.array(z.string()).optional(),
    dueDate: z.union([z.string(), z.date()]).optional(),
    labels: z.array(z.string()).optional(),
  }),
});

describe('createTaskSchema', () => {
  it('accepts valid task payload', () => {
    const result = createTaskSchema.safeParse({
      body: {
        workspaceId: '507f1f77bcf86cd799439011',
        title: 'New task',
        priority: 'High',
        labels: ['bug'],
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createTaskSchema.safeParse({
      body: { workspaceId: '507f1f77bcf86cd799439011', title: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing workspaceId', () => {
    const result = createTaskSchema.safeParse({
      body: { title: 'Task' },
    });
    expect(result.success).toBe(false);
  });
});
