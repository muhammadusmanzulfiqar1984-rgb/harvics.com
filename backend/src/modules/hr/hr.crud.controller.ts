/**
 * HR CRUD Controller (Prisma-backed)
 * 
 * Employees:  POST/GET/PUT/DELETE /api/hr/employees
 * Payroll:    POST/GET /api/hr/payroll
 * Summary:    GET /api/hr/summary
 * 
 * LOCALIZATION: All responses are locale-aware based on req.locale
 */

import { Router, Request, Response } from 'express';
import { employeesDb, payrollDb } from '../../core/db';
import { translateDepartment, translateError, translateMessage, t } from '../../core/translate';
import '../../middleware/locale';

const router = Router();

// Helper to get locale
const getLocale = (req: Request): string => (req as any).locale || 'en';

// Helper to localize employee
const localizeEmployee = (emp: any, locale: string) => {
  if (!emp) return emp;
  return {
    ...emp,
    departmentText: translateDepartment(emp.department, locale),
  };
};

// ── SUMMARY ─────────────────────────────────────────────────────────
router.get('/summary', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const [employees, payrollCount] = await Promise.all([
    employeesDb.list({}, 1, 10000),
    payrollDb.count(),
  ]);
  const byDept: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  employees.data.forEach((e: any) => {
    byDept[e.department] = (byDept[e.department] || 0) + 1;
    byCountry[e.country] = (byCountry[e.country] || 0) + 1;
  });

  res.json({
    success: true,
    message: translateMessage('fetched', locale),
    data: {
      totalEmployees: employees.total,
      activeEmployees: employees.data.filter((e: any) => e.status === 'Active').length,
      byDepartment: byDept,
      byCountry,
      totalPayrollRuns: payrollCount
    }
  });
});

// ── EMPLOYEES ────────────────────────────────────────────────────────
router.get('/employees', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { department, country, status, page, limit } = req.query;
  const result = await employeesDb.list({ department, country, status }, Number(page) || 1, Number(limit) || 50);
  const localizedData = result.data.map((e: any) => localizeEmployee(e, locale));
  res.json({ success: true, ...result, data: localizedData });
});

router.get('/employees/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const emp = await employeesDb.get(req.params.id);
  if (!emp) return res.status(404).json({ success: false, error: t('hr.messages.employeeNotFound', locale) });
  res.json({ success: true, data: localizeEmployee(emp, locale) });
});

router.post('/employees', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const { name, department, position, country, city, salary, currency } = req.body;
  if (!name || !department) return res.status(400).json({ success: false, error: translateError('missingFields', locale) });
  const emp = await employeesDb.create({
    name, department, position: position || '', country, city,
    salary: salary || 0, currency: currency || 'USD',
    status: 'Active', joinDate: new Date().toISOString().slice(0, 10)
  }, 'hr.employee.created');
  res.status(201).json({ success: true, data: localizeEmployee(emp, locale), message: t('hr.messages.employeeCreated', locale) });
});

router.put('/employees/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const updated = await employeesDb.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: t('hr.messages.employeeNotFound', locale) });
  res.json({ success: true, data: localizeEmployee(updated, locale), message: t('hr.messages.employeeUpdated', locale) });
});

router.delete('/employees/:id', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const exists = await employeesDb.get(req.params.id);
  if (!exists) return res.status(404).json({ success: false, error: t('hr.messages.employeeNotFound', locale) });
  await employeesDb.delete(req.params.id);
  res.json({ success: true, message: t('hr.messages.employeeDeleted', locale) });
});

// ── PAYROLL ──────────────────────────────────────────────────────────
router.get('/payroll', async (req: Request, res: Response) => {
  const result = await payrollDb.list({}, Number(req.query.page) || 1, Number(req.query.limit) || 50);
  res.json({ success: true, ...result });
});

router.post('/payroll', async (req: Request, res: Response) => {
  const { period, totalAmount, currency, employeeCount } = req.body;
  if (!period) return res.status(400).json({ success: false, error: 'period is required' });
  const activeEmployees = await employeesDb.list({ status: 'Active' }, 1, 10000);
  const run = await payrollDb.create({
    period, totalAmount: totalAmount || 0, currency: currency || 'USD',
    employeeCount: employeeCount || activeEmployees.total,
    status: 'Processed', processedDate: new Date().toISOString().slice(0, 10)
  }, 'hr.payroll.run');
  res.status(201).json({ success: true, data: run });
});

// Root route — returns summary
router.get('/', async (req: Request, res: Response) => {
  const locale = getLocale(req);
  const employees = await employeesDb.list({}, 1, 5);
  res.json({ success: true, message: translateMessage('fetched', locale), data: { employees: employees.data } });
});

export default router;
