module.exports = {
  apps: [
    {
      name: 'harvics-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/Users/shahtabraiz/Desktop/HARVICS WEBSITE/Harvics/harviclocales-main',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
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
    }
  ]
};

