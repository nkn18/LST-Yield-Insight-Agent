module.exports = {
  apps: [
    {
      name: "LSTAgent",
      script: "pnpm",
      args: "cleanstart --characters=characters/LST.character.json",
      exec_mode: "fork",
      instances : "1",
      autorestart: true,
      watch: false
    }
  ]
};
