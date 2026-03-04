/**
 * HR CRUD Controller
 * 
 * Employees:  POST/GET/PUT/DELETE /api/hr/employees
 * Payroll:    POST/GET /api/hr/payroll
 * Summary:    GET /api/hr/summary
 */

import { Router, Request, Response } from 'express';
import { employeesStore } from '../../core/dataStore';
import { DomainStore } from '../../core/dataStore';

const payrollStore = new DomainStore('hr-payroll', [
  { period: 'March 2026', totalAmount: 850000, currency: 'AED', employeeCount: 45, status: 'Processed', processedDate: '2026-03-01' },
  { period: 'February 2026', totalAmount: 830000, currency: 'AED', employeeCount: 43, status: 'Processed', processedDate: '2026-02-01' },
]);

const router = Router();

// ── SUMMARY ─────────────────────────────────────────────────────────
router.get('/summary', (_req: Request, res: Response) => {
  const employees = employeesStore.list({}, 1, 10000);
  const byDept: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  employees.data.forEach(e => {
    byDept[e.department] = (byDept[e.department] || 0) + 1;
    byCountry[e.country] = (byCountry[e.country] || 0) + 1;
  });

  res.json({
    success: true,
    data: {
      totalEmployees: employees.total,
      activeEmployees: employees.data.filter(e => e.status === 'Active').length,
      byDepartment: byDept,
      byCountry,
      totalPayrollRuns: payrollStore.count()
    }
  });
});

// ── EMPLOYEES ────────────────────────────────────────────────────────
router.get('/employees', (req: Request, res: Response) => {
  const { department, country, status, page, limit } = req.query;
  const result = employeesStore.list({ department, country, status }, Number(page) || 1, Number(limit) || 50);
  res.json({ success: true, ...result });
});

router.get('/employees/:id', (req: Request, res: Response) => {
  const emp = employeesStore.get(req.params.id);
  if (!emp) return res.status(404).json({ success: false, error: 'Employee not found' });
  res.json({ success: true, data: emp });
});

router.post('/employees', (req: Request, res: Response) => {
  const { name, department, position, country, city, salary, currency } = req.body;
  if (!name || !department) return res.status(400).json({ success: false, error: 'name and department required' });
  const emp = employeesStore.create({
    name, department, position: position || '', country, city,
    salary: salary || 0, currency: currency || 'USD',
    status: 'Active', joinDate: new Date().toISOString().slice(0, 10)
  }, 'hr.employee.created');
  res.status(201).json({ success: true, data: emp });
});

router.put('/employees/:id', (req: Request, res: Response) => {
  const updated = employeesStore.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ success: false, error: 'Employee not found' });
  res.json({ success: true, data: updated });
});

router.delete('/employees/:id', (req: Request, res: Response) => {
  if (!employeesStore.get(req.params.id)) return res.status(404).json({ success: false, error: 'Employee not found' });
  employeesStore.delete(req.params.id);
  res.json({ success: true, message: 'Employee removed' });
});

// ── PAYROLL ──────────────────────────────────────────────────────────
router.get('/payroll', (req: Request, res: Response) => {
  const result = payrollStore.list({}, Number(req.query.page) || 1, Number(req.query.limit) || 50);
  res.json({ success: true, ...result });
});

router.post('/payroll', (req: Request, res: Response) => {
  const { period, totalAmount, currency, employeeCount } = req.body;
  if (!period) return res.status(400).json({ success: false, error: 'period is required' });
  const run = payrollStore.create({
    period, totalAmount: totalAmount || 0, currency: currency || 'USD',
    employeeCount: employeeCount || employeesStore.list({ status: 'Active' }, 1, 10000).total,
    status: 'Processed', processedDate: new Date().toISOString().slice(0, 10)
  }, 'hr.payroll.run');
  res.status(201).json({ success: true, data: run });
});

export default router;
