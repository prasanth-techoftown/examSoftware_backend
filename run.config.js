module.exports = {
    apps: [
        {
            name: 'viloraTech-exam',
            script: 'pnpm',
            args: 'dev',
            watch: false,
            autorestart: true,
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
}
