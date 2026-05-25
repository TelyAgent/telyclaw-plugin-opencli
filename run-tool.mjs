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
const SNAPSHOT_TIMEOUT_MS = 45_000;

// 有适配器支持的域名映射：域名 → 适配器 site 名称
// 当 AI 试图用浏览器工具访问这些域名的 URL 时，直接拦截并引导使用 opencli_adapter_command
const ADAPTER_DOMAINS = {
  // 内容/阅读
  'zhihu.com': 'zhihu', 'zhuanlan.zhihu.com': 'zhihu',
  'medium.com': 'medium',
  'substack.com': 'substack',
  'douban.com': 'douban',
  'wikipedia.org': 'wikipedia',
  'bbc.com': 'bbc', 'bbc.co.uk': 'bbc',
  'news.ycombinator.com': 'hackernews',
  'producthunt.com': 'producthunt',
  'dev.to': 'devto',
  // 社交/社区
  'twitter.com': 'twitter', 'x.com': 'twitter',
  'weibo.com': 'weibo', 'weibo.cn': 'weibo',
  'reddit.com': 'reddit',
  'v2ex.com': 'v2ex',
  'tieba.baidu.com': 'tieba',
  'bsky.app': 'bluesky',
  'facebook.com': 'facebook',
  'instagram.com': 'instagram',
  'linkedin.com': 'linkedin',
  // 视频/娱乐
  'bilibili.com': 'bilibili',
  'youtube.com': 'youtube', 'youtu.be': 'youtube',
  'douyin.com': 'douyin',
  'tiktok.com': 'tiktok',
  'spotify.com': 'spotify',
  // 购物/电商
  'taobao.com': 'taobao',
  'jd.com': 'jd',
  'amazon.com': 'amazon', 'amazon.co.jp': 'amazon', 'amazon.co.uk': 'amazon', 'amazon.de': 'amazon',
  'goofish.com': 'xianyu', '2.taobao.com': 'xianyu',
  'smzdm.com': 'smzdm',
  'dianping.com': 'dianping',
  '1688.com': '1688',
  // 职场
  'zhipin.com': 'boss',
  '51job.com': '51job',
  // 开发
  'gitee.com': 'gitee',
  'stackoverflow.com': 'stackoverflow',
  'npmjs.com': 'npm',
  'pypi.org': 'pypi',
  'hub.docker.com': 'dockerhub',
  // 学术
  'arxiv.org': 'arxiv',
  'pubmed.ncbi.nlm.nih.gov': 'pubmed',
  'scholar.google.com': 'google-scholar',
  // AI
  'chatgpt.com': 'chatgpt',
  'claude.ai': 'claude',
  'chat.deepseek.com': 'deepseek',
  'gemini.google.com': 'gemini',
  'grok.com': 'grok',
  // 金融
  'eastmoney.com': 'eastmoney',
  'xueqiu.com': 'xueqiu',
  // 旅行
  '12306.cn': '12306',
  // 生活
  'hupu.com': 'hupu',
  'xiaohongshu.com': 'xiaohongshu',
  'rednote.com': 'xiaohongshu',
  // 新闻
  'toutiao.com': 'toutiao',
  'reuters.com': 'reuters',
};

function checkAdapterForUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    // 精确匹配或父域名匹配
    for (const [domain, site] of Object.entries(ADAPTER_DOMAINS)) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return site;
      }
    }
  } catch {}
  return null;
}

function rejectIfAdapter(url) {
  const site = checkAdapterForUrl(url);
  if (!site) return null;
  const msg = `此网站有 OpenCLI 适配器支持 (site="${site}")，请勿使用浏览器工具访问。应直接调用 opencli_adapter_command(site="${site}", command=...) 获取结构化数据。用 opencli_adapter_command(site="${site}", command="--help") 查看可用命令`;
  throw new Error(msg);
}

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
      daemonPage = await bridge.connect({
        session: SESSION_NAME,
        siteSession: 'persistent',
        idleTimeout: 300,
      });
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
  rejectIfAdapter(url);
  await daemonPage.goto(url, { waitUntil: 'load' });
  return { url: await daemonPage.getCurrentUrl() || url };
}

async function handleExec({ code }) {
  return daemonPage.evaluate(code);
}

async function handleSnapshot(opts) {
  // 检查当前页面 URL 是否匹配适配器域名
  try {
    const currentUrl = await daemonPage.getCurrentUrl();
    if (currentUrl) rejectIfAdapter(currentUrl);
  } catch {} // getCurrentUrl 失败时不阻止

  const snapshotPromise = daemonPage.snapshot({
    compact: opts.compact,
    interactive: opts.interactive,
    maxDepth: Math.min(opts.maxDepth || 50, 80),
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Snapshot timed out after ${SNAPSHOT_TIMEOUT_MS / 1000}s`)), SNAPSHOT_TIMEOUT_MS)
  );

  return Promise.race([snapshotPromise, timeoutPromise]);
}

async function handleScreenshot({ fullPage = false, format = 'png' }) {
  try {
    const currentUrl = await daemonPage.getCurrentUrl();
    if (currentUrl) rejectIfAdapter(currentUrl);
  } catch {} // getCurrentUrl 失败时不阻止

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

  // Prefer dist/src/main.js directly — more reliable than node_modules/.bin symlink
  // which may not exist if npm install didn't create bin links (e.g. in packaged apps)
  const pluginDir = dirname(fileURLToPath(import.meta.url));
  const cliPath = join(pluginDir, 'dist', 'src', 'main.js');

  // Track which key was consumed as positional so we don't also pass it as a flag
  let consumedKey = null;

  const commonPositionalKeys = ['query', 'q', 'text', 'message', 'content', 'name', 'id', 'url', 'target'];
  const positional = Array.isArray(args._) ? args._.map(String) : [];
  for (const key of commonPositionalKeys) {
    if (key in args && !positional.length) {
      positional.push(String(args[key]));
      consumedKey = key;
      break;
    }
  }

  // Flag args: everything except _ and the consumed positional key
  const flagKeys = Object.keys(args).filter(
    (k) => k !== '_' && k !== consumedKey
  );
  const flagArgs = flagKeys.flatMap((k) => {
    const v = args[k];
    return typeof v === 'boolean' ? (v ? [`--${k}`] : []) : [`--${k}`, String(v)];
  });

  const allArgs = [site, command, ...positional, ...flagArgs, '-f', 'json'];

  try {
    const result = execFileSync(process.execPath, [cliPath, ...allArgs], {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 60000,
    });
    return JSON.parse(result);
  } catch (primaryErr) {
    // Fallback 1: try opencli from PATH (works in dev with global install)
    try {
      const result = execFileSync('opencli', allArgs, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 60000,
      });
      return JSON.parse(result);
    } catch {
      throw new Error(`Failed to run opencli adapter command: ${primaryErr.message}. ` +
        `Make sure 'opencli' is installed (npm i -g @jackwener/opencli) or the plugin dist/ is built.`);
    }
  }
}

main();
