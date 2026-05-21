#!/usr/bin/env node
/**
 * OpenCLI TelyClaw Plugin — run-tool.mjs
 *
 * 通过 OpenCLI CDPBridge 直连 Chrome CDP，执行浏览器操作。
 * 插件文件位于 OpenCLI 仓库根目录，通过相对路径导入同仓库的 dist/ 模块。
 *
 * 调用方式: node run-tool.mjs <toolName> '<jsonParams>'
 * 环境变量:
 *   PLUGIN_CONFIG — 插件配置 JSON (chromePath, daemonPort, cdpPort 等)
 */

import { CDPBridge } from './dist/src/browser/cdp.js';
import { getDaemonHealth } from './dist/src/browser/daemon-client.js';
import { ensureChromeAndDaemonReady } from './daemon-manager.mjs';

const toolName = process.argv[2];
const params = JSON.parse(process.argv[3] || '{}');
const config = JSON.parse(process.env.PLUGIN_CONFIG || '{}');

let cdpPage = null;

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
      await ensureChromeAndDaemonReady(config);
      cdpPage = await getOrCreatePage(config);
    }

    const result = await handler(params);
    console.log(JSON.stringify({ success: true, data: result }));
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
  }
}

async function getOrCreatePage(config) {
  const cdpPort = config.cdpPort || 19826;
  const endpoint = `http://127.0.0.1:${cdpPort}`;
  const bridge = new CDPBridge();
  return bridge.connect({ cdpEndpoint: endpoint });
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
  await cdpPage.goto(url, { waitUntil: 'load' });
  return { url: await cdpPage.getCurrentUrl() || url };
}

async function handleExec({ code }) {
  return cdpPage.evaluate(code);
}

async function handleSnapshot(opts) {
  return cdpPage.snapshot({
    compact: opts.compact,
    interactive: opts.interactive,
    maxDepth: opts.maxDepth,
  });
}

async function handleScreenshot({ fullPage = false, format = 'png' }) {
  return cdpPage.screenshot({ fullPage, format });
}

async function handleClick({ ref, nth }) {
  return cdpPage.click(ref, { nth });
}

async function handleType({ ref, text }) {
  return cdpPage.typeText(ref, text);
}

async function handleFill({ ref, text }) {
  return cdpPage.fillText(ref, text);
}

async function handleScroll({ direction = 'down', amount = 500, ref }) {
  if (ref) {
    return cdpPage.scrollTo(ref);
  }
  await cdpPage.scroll(direction, amount);
  return { scrolled: direction, amount };
}

async function handleCookies({ domain, url }) {
  return cdpPage.getCookies({ domain, url });
}

async function handleNetwork({ action, pattern }) {
  if (action === 'start') {
    await cdpPage.startNetworkCapture(pattern);
    return { capturing: true };
  }
  const entries = await cdpPage.readNetworkCapture();
  return { entries, count: entries.length };
}

async function handleUpload({ ref, files }) {
  return cdpPage.uploadFiles(ref, files);
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
