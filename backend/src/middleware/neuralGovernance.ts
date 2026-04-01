/**
 * HARVICS OS — Neural Governance Middleware
 * Blueprint: 5 simultaneous checks fire before ANY write (POST/PUT/PATCH/DELETE)
 * If any check fails → 403 blocked + immutable AuditLog entry
 *
 * Checks:
 *  1. Legal    — jurisdiction-banned entity / sanctioned party
 *  2. Budget   — transaction would breach approved budget
 *  3. Contract — referenced contract is active and covers this transaction type
 *  4. Security — user has the required scope for this resource + method
 *  5. Compliance — GDPR/RERA/HACCP data-handling rules not violated
 */

import { Request, Response, NextFunction } from 'express'

interface GovernanceResult {
  check: string
  passed: boolean
  reason?: string
}

// ── Immutable in-memory audit log (replace with DB write in production) ──
const AUDIT_LOG: {
  ts: Date
  userId: string
  method: string
  path: string
  blocked: boolean
  checks: GovernanceResult[]
}[] = []

export function getAuditLog() { return AUDIT_LOG }

// ── Individual check functions (wired to real data in production) ──

function checkLegal(req: Request): GovernanceResult {
  // In production: query sanctions list, jurisdiction rules
  const body = req.body || {}
  const SANCTIONED = ['SDN-001', 'OFAC-TEST', 'BLOCKED-ENTITY']
  const partyId = body.partyId || body.customerId || body.supplierId || ''
  if (SANCTIONED.includes(partyId)) {
    return { check: 'Legal', passed: false, reason: `Party ${partyId} is on sanctioned entity list.` }
  }
  return { check: 'Legal', passed: true }
}

function checkBudget(req: Request): GovernanceResult {
  // In production: query cost center remaining budget vs transaction amount
  const body = req.body || {}
  const amount = Number(body.amount || body.totalAmount || body.value || 0)
  const HARD_CAP = 5_000_000 // $5M single transaction hard cap
  if (amount > HARD_CAP) {
    return { check: 'Budget', passed: false, reason: `Transaction amount $${amount.toLocaleString()} exceeds single-transaction cap of $${HARD_CAP.toLocaleString()}.` }
  }
  return { check: 'Budget', passed: true }
}

function checkContract(req: Request): GovernanceResult {
  // In production: verify referenced contract exists, is active, and covers this transaction type
  const body = req.body || {}
  const contractId = body.contractId
  if (contractId && contractId.startsWith('EXPIRED-')) {
    return { check: 'Contract', passed: false, reason: `Contract ${contractId} is expired or inactive.` }
  }
  return { check: 'Contract', passed: true }
}

function checkSecurity(req: Request): GovernanceResult {
  // Verify the decoded token has write scope for this resource
  const user = (req as any).user
  if (!user) {
    return { check: 'Security', passed: false, reason: 'No authenticated user context found.' }
  }
  const role: string = user.role || ''
  const WRITE_BLOCKED_ROLES = ['viewer', 'read_only', 'guest']
  if (WRITE_BLOCKED_ROLES.includes(role.toLowerCase())) {
    return { check: 'Security', passed: false, reason: `Role '${role}' does not have write permission.` }
  }
  return { check: 'Security', passed: true }
}

function checkCompliance(req: Request): GovernanceResult {
  // In production: check GDPR consent, RERA, HACCP data-handling rules
  const body = req.body || {}
  // Block if PII fields are being written without consent flag
  const hasPII = body.email || body.phone || body.nationalId
  const hasConsent = body.gdprConsent === true || body.consentRecorded === true
  if (hasPII && !hasConsent && req.path.includes('/crm')) {
    return { check: 'Compliance', passed: false, reason: 'PII fields present but GDPR consent not recorded.' }
  }
  return { check: 'Compliance', passed: true }
}

// ── Main middleware — only runs on mutating methods ──
export function neuralGovernance(req: Request, res: Response, next: NextFunction) {
  const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']
  if (!WRITE_METHODS.includes(req.method)) return next()

  // Run all 5 checks simultaneously
  const checks: GovernanceResult[] = [
    checkLegal(req),
    checkBudget(req),
    checkContract(req),
    checkSecurity(req),
    checkCompliance(req),
  ]

  const failed = checks.filter(c => !c.passed)
  const userId = (req as any).user?.id || 'anonymous'

  // Always log to audit trail
  AUDIT_LOG.unshift({
    ts: new Date(),
    userId,
    method: req.method,
    path: req.path,
    blocked: failed.length > 0,
    checks,
  })
  // Cap log at 1000 entries in memory
  if (AUDIT_LOG.length > 1000) AUDIT_LOG.splice(1000)

  if (failed.length > 0) {
    return res.status(403).json({
      success: false,
      error: 'Neural Governance Block',
      blocked: true,
      violations: failed.map(f => ({ check: f.check, reason: f.reason })),
    })
  }

  next()
}
