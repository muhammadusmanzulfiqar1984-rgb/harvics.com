module.exports = {
  apps: [
    {
      name: 'harvics-frontend',
      script: 'npm',
      args: 'start',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_DIST_DIR: process.env.NEXT_DIST_DIR || '.next-prod',
        BACKEND_URL: process.env.BACKEND_URL || 'http://127.0.0.1:4000',
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://127.0.0.1:4000',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000'
      },
      instances: 2,
      exec_mode: 'cluster',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    },
    {
      name: 'harvics-backend',
      script: 'npm',
      args: 'run backend:start',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://127.0.0.1:3000,http://localhost:3000,https://harvics.com,https://www.harvics.com'
      },
      instances: 1,
      exec_mode: 'fork',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    }
  ]
};

