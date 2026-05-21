/**
 * Daemon + Chrome 生命周期管理
 *
 * 负责在工具调用前确保 Chrome 和 daemon 就绪：
 * 1. 检测系统 Chrome 路径
 * 2. 启动 OpenCLI daemon（Node.js 子进程）
 * 3. 启动 Chrome（带 CDP 端口和隔离 Profile）
 * 4. 轮询等待 CDP 就绪
 */

import { spawn, execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { statSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { getDaemonHealth } from './dist/src/browser/daemon-client.js';
import { resolveDaemonLaunchSpec } from './dist/src/browser/daemon-lifecycle.js';

const STARTUP_TIMEOUT = 30_000;
const POLL_INTERVAL = 500;

const DARWIN_CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Arc.app/Contents/MacOS/Arc',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
];

const LINUX_CHROME_BINARIES = ['google-chrome', 'chromium', 'chromium-browser', 'microsoft-edge'];

function detectChromePath() {
  if (process.platform === 'darwin') {
    for (const c of DARWIN_CHROME_CANDIDATES) {
      try {
        if (statSync(c).isFile()) return c;
      } catch { /* continue */ }
    }
  }
  for (const name of LINUX_CHROME_BINARIES) {
    try {
      const path = execFileSync('which', [name], { encoding: 'utf-8' }).trim();
      if (path) return path;
    } catch { /* continue */ }
  }
  return undefined;
}

function spawnDaemonProcess(config) {
  const launch = resolveDaemonLaunchSpec();
  const proc = spawn(launch.binary, launch.args, {
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      OPENCLI_DAEMON_PORT: String(config.daemonPort || 19825),
    },
  });
  proc.unref();
  return proc;
}

function getUserDataDir() {
  if (process.platform === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', 'org.telegram.TelegramAirBeta', 'opencli-chrome-profile');
  }
  return join(homedir(), '.telyclaw', 'opencli-chrome-profile');
}

function spawnChrome(config) {
  const chromePath = config.chromePath || detectChromePath();
  if (!chromePath) {
    throw new Error(
      '未找到 Chrome/Chromium 浏览器。请安装 Chrome 或 Chromium，\n' +
      '或在插件配置中设置 chromePath 指向浏览器可执行文件'
    );
  }

  const cdpPort = config.cdpPort || 19826;
  const userDataDir = config.userDataDir || getUserDataDir();

  const args = [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-default-apps',
    'about:blank',
  ];

  if (config.headless) {
    args.unshift('--headless=new');
  }

  const proc = spawn(chromePath, args, {
    detached: true,
    stdio: 'ignore',
  });
  proc.unref();
  return { pid: proc.pid, cdpPort };
}

function probeCDP(port) {
  return new Promise((resolve) => {
    const req = httpRequest(
      { hostname: '127.0.0.1', port, path: '/json', method: 'GET', timeout: 2000 },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const targets = JSON.parse(body);
            resolve(Array.isArray(targets) ? targets : []);
          } catch {
            resolve([]);
          }
        });
      },
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

function createBlankPage(port) {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      { hostname: '127.0.0.1', port, path: '/json/new?url=about:blank', method: 'PUT', timeout: 5000 },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(undefined);
          }
        });
      },
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('createBlankPage timeout')); });
    req.end();
  });
}

export async function ensureChromeAndDaemonReady(config) {
  const health = await getDaemonHealth();
  const cdpPort = config.cdpPort || 19826;

  if (health.state === 'ready') {
    const targets = await probeCDP(cdpPort);
    if (targets && targets.length > 0) return;
    if (targets && targets.length === 0) {
      try {
        await createBlankPage(cdpPort);
        return;
      } catch {
        // Fall through — restart Chrome
      }
    }
  }

  if (health.state === 'stopped') {
    spawnDaemonProcess(config);
    await new Promise((r) => setTimeout(r, 1500));
  }

  const cdpAlive = await probeCDP(cdpPort);
  if (!cdpAlive) {
    spawnChrome(config);
  }

  const deadline = Date.now() + STARTUP_TIMEOUT;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
    const targets = await probeCDP(cdpPort);
    if (targets && targets.length > 0) return;
    // CDP is up but no pages yet — create one
    if (targets && targets.length === 0) {
      try {
        await createBlankPage(cdpPort);
        return;
      } catch {
        // Keep polling
      }
    }
  }

  throw new Error(
    `Chrome CDP 端口 ${cdpPort} 连接超时。请确认 Chrome 已成功启动`
  );
}
