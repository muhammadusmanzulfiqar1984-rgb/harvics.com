# 🔒 Security Scripts

Automated scripts to enforce Harvics security protocol.

## 📋 Available Scripts

### 1. `security-check.sh`
Runs comprehensive security checks:
- Console statements check
- Hardcoded secrets check
- SQL injection risks check
- Authentication check
- TypeScript compilation
- Error boundaries check
- Environment variables check

**Usage:**
```bash
bash scripts/security-check.sh
# OR
npm run security-check
```

### 2. `pre-commit.sh`
Runs security checks before commit (used by Git hook).

**Usage:**
```bash
bash scripts/pre-commit.sh
# OR
npm run pre-commit
```

### 3. `pre-deploy.sh`
Runs comprehensive pre-deployment checks:
- Security checks
- Environment variables check
- Build check
- Production readiness check

**Usage:**
```bash
bash scripts/pre-deploy.sh
# OR
npm run pre-deploy
```

### 4. `setup-git-hooks.sh`
Installs Git pre-commit hook to automatically run security checks.

**Usage:**
```bash
bash scripts/setup-git-hooks.sh
# OR
npm run setup-hooks
```

## 🚀 Quick Start

1. **Install Git hooks:**
   ```bash
   npm run setup-hooks
   ```

2. **Run security check manually:**
   ```bash
   npm run security-check
   ```

3. **Run pre-deployment check:**
   ```bash
   npm run pre-deploy
   ```

## 📝 What Gets Checked

### Security Checks:
- ✅ No console statements (or dev-only)
- ✅ No hardcoded secrets
- ✅ SQL queries parameterized
- ✅ Authentication on routes
- ✅ Error boundaries present
- ✅ Environment variables used

### Pre-Deployment Checks:
- ✅ Security checks pass
- ✅ Environment variables set
- ✅ JWT_SECRET strength
- ✅ Build successful
- ✅ No debug code
- ✅ No TODO/FIXME in production

## ⚠️ Exit Codes

- `0` = All checks passed
- `1` = Errors found (block commit/deploy)
- Warnings don't block but should be reviewed

## 🔧 Customization

Edit the scripts to add/remove checks:
- `security-check.sh` - Add new security checks
- `pre-deploy.sh` - Add deployment-specific checks

## 📚 Related Documentation

- `SECURITY_PROTOCOL.md` - Full security protocol
- `DEVELOPMENT_WORKFLOW.md` - Development workflow
- `QUICK_REFERENCE_PROTOCOL.md` - Quick reference

---

**Last Updated:** $(date)  
**Version:** 1.0

