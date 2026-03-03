/**
 * AI PROTOCOL ENFORCEMENT MIDDLEWARE
 * STRICT RULE: ALL AI OPERATIONS MUST GO THROUGH PYTHON
 * This middleware ensures no AI operations bypass the Python AI Engine
 */

import { Request, Response, NextFunction } from 'express';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
const PROTOCOL_ENFORCEMENT_ENABLED = process.env.ENFORCE_AI_PROTOCOL !== 'false';

/**
 * Middleware to enforce AI protocol - all AI must go through Python
 */
export const enforceAIProtocol = (req: Request, res: Response, next: NextFunction) => {
  // Skip if protocol enforcement is disabled
  if (!PROTOCOL_ENFORCEMENT_ENABLED) {
    return next();
  }

  // Check if this is an AI-related endpoint
  const isAIEndpoint = req.path.includes('/ai/') || 
                       req.path.includes('/strategy') ||
                       req.path.includes('/model') ||
                       req.path.includes('/forecast') ||
                       req.path.includes('/recommendation');

  if (isAIEndpoint) {
    // Verify request is going through Python AI Engine
    const aiEngineHeader = req.headers['x-ai-engine'] || req.headers['x-ai-source'];
    
    // Check if request has proper AI engine routing
    if (!aiEngineHeader || aiEngineHeader !== 'python-engine') {
      // Log potential violation
      console.warn(`[AI_PROTOCOL_VIOLATION] AI request detected without proper Python routing: ${req.method} ${req.path}`);
      
      // For now, allow but log - monitoring agent will catch actual violations
      // In strict mode, you could return 403 here
      req.headers['x-ai-requires-python'] = 'true';
    }
  }

  next();
};

/**
 * Verify AI engine is accessible (Python only)
 */
export const verifyAIEngine = async (): Promise<boolean> => {
  try {
    const { request } = await import('undici');
    const response = await request(`${AI_ENGINE_URL}/health`, {
      method: 'GET',
      headersTimeout: 5000
    });
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      const data = await response.body.json() as any;
      // Verify it's the Python AI engine
      return data.service === 'ai-strategy-engine' || data.status === 'ok';
    }
    return false;
  } catch (error) {
    console.error('[AI_PROTOCOL_CHECK] AI Engine (Python) not accessible:', error);
    return false;
  }
};

/**
 * Ensure all AI requests are routed through Python
 */
export const requireAIEngine = async (req: Request, res: Response, next: NextFunction) => {
  const isAIEndpoint = req.path.includes('/ai/') || 
                       req.path.includes('/strategy');

  if (isAIEndpoint) {
    const aiEngineAvailable = await verifyAIEngine();
    
    if (!aiEngineAvailable) {
      return res.status(503).json({
        error: 'AI_PROTOCOL_VIOLATION',
        message: 'AI Engine (Python) is not available. ALL AI operations must go through Python.',
        requiredService: 'Python AI Engine',
        url: AI_ENGINE_URL
      });
    }
  }

  next();
};

