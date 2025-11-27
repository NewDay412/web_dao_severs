module.exports = {
  apps : [{
    name: 'mysql-service',
    script: '/usr/sbin/mysqld',
    args: '--daemonize=false',
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    user: 'mysql',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
