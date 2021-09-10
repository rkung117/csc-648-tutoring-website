module.exports = {
  apps: [{
     name: 'CSC648-T3-dev',
     script: '/opt/dev/source/application/node/index.js',
      env_development: {
        PORT: 3010
      }
   }
  ],
  deploy: {
    development: {
      user: 'ubuntu',
      host: 'csc648team3.ddns.net',
      key: '~/.ssh/sshKey.pem',
      ref: 'origin/develop',
      repo: 'git@github.com:CSC-648-SFSU/csc648-03-fa21-team03.git',
      path: '/opt/dev',
      'post-deploy': 'cd /opt/dev/source/application/node && npm install && pm2 startOrRestart ecosystem_dev.config.js',
      env  : {
        PORT: 3010
      }
    }
  }
}
