const { spawn } = require('node:child_process');

process.env.EXPO_UNSTABLE_HEADLESS = process.env.EXPO_UNSTABLE_HEADLESS || '1';
process.env.EXPO_OFFLINE = process.env.EXPO_OFFLINE || '1';

const expoCli = require.resolve('expo/bin/cli');
const child = spawn(
  process.execPath,
  [expoCli, 'start', '--host', 'lan', '--port', '8081', '--max-workers', '1'],
  {
    env: process.env,
    stdio: 'inherit',
  },
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
