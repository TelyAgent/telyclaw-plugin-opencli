#!/usr/bin/env node
/**
 * OpenCLI TelyClaw Plugin — run-tool.mjs
 *
 * 通过 BrowserBridge (daemon + Chrome 扩展) 执行浏览器操作。
 * daemon 管理 Chrome 生命周期和扩展连接，Page 通过 HTTP → WebSocket 发送命令。
 *
 * 调用方式: node run-tool.mjs <toolName> '<jsonParams>'
 */

import { BrowserBridge } from './dist/src/browser/bridge.js';
import { getDaemonHealth } from './dist/src/browser/daemon-client.js';

const SESSION_NAME = 'telyclaw';

const toolName = process.argv[2];
const params = JSON.parse(process.argv[3] || '{}');
const config = JSON.parse(process.env.PLUGIN_CONFIG || '{}');

let bridge = null;
let daemonPage = null;

const TOOL_HANDLERS = {
  opencli_daemon_status: handleDaemonStatus,
  opencli_browser_navigate: handleNavigate,
  opencli_browser_exec: handleExec,
  opencli_browser_snapshot: handleSnapshot,
  opencli_browser_screenshot: handleScreenshot,
  opencli_browser_click: handleClick,
  opencli_browser_type: handleType,
  opencli_browser_fill: handleFill,
  opencli_browser_scroll: handleScroll,
  opencli_browser_cookies: handleCookies,
  opencli_browser_network: handleNetwork,
  opencli_browser_upload: handleUpload,
  opencli_adapter_command: handleAdapterCommand,
};

async function main() {
  const handler = TOOL_HANDLERS[toolName];
  if (!handler) {
    console.log(JSON.stringify({ success: false, error: `Unknown tool: ${toolName}` }));
    process.exit(1);
  }

  try {
    if (toolName !== 'opencli_daemon_status') {
      bridge = new BrowserBridge();
      daemonPage = await bridge.connect({ session: SESSION_NAME });
    }

    const result = await handler(params);
    console.log(JSON.stringify({ success: true, data: result }));
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
  }
}

async function handleDaemonStatus() {
  const health = await getDaemonHealth();
  return {
    state: health.state,
    daemonVersion: health.status?.daemonVersion,
    pending: health.status?.pending,
    extensionConnected: health.status?.extensionConnected,
    pid: health.status?.pid,
    uptime: health.status?.uptime,
  };
}

async function handleNavigate({ url }) {
  await daemonPage.goto(url, { waitUntil: 'load' });
  return { url: await daemonPage.getCurrentUrl() || url };
}

async function handleExec({ code }) {
  return daemonPage.evaluate(code);
}

async function handleSnapshot(opts) {
  return daemonPage.snapshot({
    compact: opts.compact,
    interactive: opts.interactive,
    maxDepth: opts.maxDepth,
  });
}

async function handleScreenshot({ fullPage = false, format = 'png' }) {
  return daemonPage.screenshot({ fullPage, format });
}

async function handleClick({ ref, nth }) {
  return daemonPage.click(ref, { nth });
}

async function handleType({ ref, text }) {
  return daemonPage.typeText(ref, text);
}

async function handleFill({ ref, text }) {
  return daemonPage.fillText(ref, text);
}

async function handleScroll({ direction = 'down', amount = 500, ref }) {
  if (ref) {
    return daemonPage.scrollTo(ref);
  }
  await daemonPage.scroll(direction, amount);
  return { scrolled: direction, amount };
}

async function handleCookies({ domain, url }) {
  return daemonPage.getCookies({ domain, url });
}

async function handleNetwork({ action, pattern }) {
  if (action === 'start') {
    await daemonPage.startNetworkCapture(pattern);
    return { capturing: true };
  }
  const entries = await daemonPage.readNetworkCapture();
  return { entries, count: entries.length };
}

async function handleUpload({ ref, files }) {
  return daemonPage.uploadFiles(ref, files);
}

async function handleAdapterCommand({ site, command, args = {} }) {
  const { execFileSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');

  const cliPath = join(dirname(fileURLToPath(import.meta.url)), 'node_modules', '.bin', 'opencli');
  const argsList = Object.entries(args).flatMap(([k, v]) =>
    typeof v === 'boolean' ? (v ? [`--${k}`] : []) : [`--${k}`, String(v)]
  );

  try {
    const result = execFileSync(process.execPath, [cliPath, site, command, ...argsList, '-f', 'json'], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000,
    });
    return JSON.parse(result);
  } catch {
    const result = execFileSync('opencli', [site, command, ...argsList, '-f', 'json'], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000,
    });
    return JSON.parse(result);
  }
}

main();
