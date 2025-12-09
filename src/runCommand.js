import { spawn } from 'child_process';
import readline from 'readline';

export function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });

    child.on('error', reject);
  });
}

export function runCommandLogged(cmd, args, cwd, onLine) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: process.platform === 'win32'
    });

    const forward = (stream) => {
      if (!stream) return;
      const rl = readline.createInterface({ input: stream });
      rl.on('line', (line) => onLine(line));
      rl.on('error', () => {});
    };

    forward(child.stdout);
    forward(child.stderr);

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });

    child.on('error', reject);
  });
}
