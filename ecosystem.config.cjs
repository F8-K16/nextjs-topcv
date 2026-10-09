module.exports = {
  apps: [
    {
      name: "topcv-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
