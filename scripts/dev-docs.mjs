import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
const tscPath = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));
const nextPath = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));
const children = new Set();

function run(command, args) {
  const child = spawn(command, args, { stdio: 'inherit' });
  children.add(child);
  child.once('exit', () => children.delete(child));
  return child;
}

function runNpm(args) {
  return run(npmCommand, isWindows ? ['/d', '/s', '/c', ['npm', ...args].join(' ')] : args);
}

function stop(exitCode = 0) {
  for (const child of children) child.kill();
  process.exit(exitCode);
}

const build = runNpm(['run', 'build']);
build.once('exit', (code) => {
  if (code !== 0) stop(code ?? 1);

  const compiler = run(process.execPath, [tscPath, '-p', 'tsconfig.json', '--watch', '--preserveWatchOutput']);
  const docs = run(process.execPath, [nextPath, 'dev', 'docs-site']);

  compiler.once('exit', (compilerCode) => stop(compilerCode ?? 1));
  docs.once('exit', (docsCode) => stop(docsCode ?? 0));
});

process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());

