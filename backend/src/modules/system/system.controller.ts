import { Router } from 'express';

const systemRouter = Router();

// Health check endpoint
systemRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'harvics-backend-system',
    timestamp: new Date().toISOString()
  });
});

// Lightweight health / monitoring snapshot for AutoBugDetector & Executive tab
systemRouter.get('/monitor-status', (_req, res) => {
  const now = new Date().toISOString();

  // For now we return a static-but-useful snapshot; this can be wired
  // to real metrics (DB, queues, etc.) later.
  const runtime = {
    backend: {
      healthy: true,
      url: '/api/health',
      lastCheck: now,
    },
    frontend: {
      healthy: true,
      url: '/',
      lastCheck: now,
    },
    lastCheck: now,
  };

  return res.json({
    status: 'ok',
    runtime,
    monitorIssues: [],
  });
});

export default systemRouter;


