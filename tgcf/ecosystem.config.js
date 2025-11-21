module.exports = {
  apps: [{
    name: 'tgcf-web',
    script: 'node-backend/app.js',
     mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
