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

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    res.status(400);
    next(new Error(error.errors.map(e => e.message).join(', ')));
  }
};

module.exports = {
  createTaskSchema,
  validate,
};
