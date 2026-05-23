import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const createEmployeeSchema = z.object({
  full_name: z.string().min(1).max(255),
  job_title: z.string().min(1).max(255),
  department: z.string().min(1).max(255),
  country: z.string().min(1).max(100),
  salary: z.number().positive(),
  email: z.string().email().max(255),
  hired_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field required' }
);

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      next(err);
    }
  };
}
