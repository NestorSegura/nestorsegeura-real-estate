module.exports = {
  apps: [
    {
      name: 'nestorsegura.com',
      script: '.next/standalone/server.js',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
    },
  ],
}
