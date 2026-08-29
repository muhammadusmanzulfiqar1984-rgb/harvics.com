# Scripts Directory

This directory contains utility scripts for the Harvics website project.

## Available Scripts

### Server Management
- **START_SERVERS.sh** - Start both backend and frontend servers
- **STOP_SERVERS.sh** - Stop all running servers
- **START_FIXED.sh** - Start servers with fixed configuration

### Development & Testing
- **test-all.sh** - Run all tests and checks
- **ACTIVATE_LOCALIZATION.sh** - Activate localization features

### Deployment
- **deploy-to-harvics-com.sh** - Deploy to Harvics.com domain

## Usage

All scripts can be run from the project root:

```bash
# Start servers
./scripts/START_SERVERS.sh

# Run tests
./scripts/test-all.sh

# Deploy
./scripts/deploy-to-harvics-com.sh
```

## Note

If scripts are moved here, update package.json scripts to reference the new paths:
- `npm run dev` - Starts frontend (Next.js)
- `npm run backend` - Starts backend (Express)

