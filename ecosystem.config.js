module.exports = {
  apps: [{
    name: 'Cobuilder',
    script: 'npm run dev',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',// M/G
    instances: 4,
    exec_mode: 'cluster',//cluster
    env: {
      NODE_ENV: 'development',
    },
    env_development: {
      NODE_ENV: 'development',
    },
    env_stage: {
      NODE_ENV: 'stage',
    },
    env_production: {
      NODE_ENV: 'production',
    },
  }],

  deploy: {
    production: {
      user: 'node',
      host: '212.83.163.1',
      ref: 'origin/master',
      repo: 'git@github.com:repo.git',
      path: '/var/www/production',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
    },
    development: {
      user: 'node',
      host: '212.83.163.1',
      ref: 'origin/master',
      repo: 'git@github.com:repo.git',
      path: '/var/www/development',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env development',
    },
  },
}
