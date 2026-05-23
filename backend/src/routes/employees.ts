import { Router } from 'express';
import { validateBody } from '../middleware/validate';
import { createEmployeeSchema, updateEmployeeSchema } from '../middleware/validate';
import {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/employeeService';

export const employeesRouter = Router();

employeesRouter.get('/', async (req, res, next) => {
  try {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = parseInt(String(req.query.limit ?? '20'), 10);
    const search = req.query.search ? String(req.query.search) : undefined;
    const country = req.query.country ? String(req.query.country) : undefined;
    const jobTitle = req.query.jobTitle ? String(req.query.jobTitle) : undefined;
    const result = await listEmployees({ page, limit, search, country, jobTitle });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

employeesRouter.get('/:id', async (req, res, next) => {
  try {
    const employee = await getEmployeeById(Number(req.params.id));
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    next(err);
  }
});

employeesRouter.post('/', validateBody(createEmployeeSchema), async (req, res, next) => {
  try {
    const employee = await createEmployee(req.body);
    res.status(201).json(employee);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('unique constraint')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(err);
  }
});

employeesRouter.put('/:id', validateBody(updateEmployeeSchema), async (req, res, next) => {
  try {
    const employee = await updateEmployee(Number(req.params.id), req.body);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('unique constraint')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(err);
  }
});

employeesRouter.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await deleteEmployee(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Employee not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
