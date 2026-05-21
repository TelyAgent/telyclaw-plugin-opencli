---
name: browser-control
description: 通过 OpenCLI 操控 Chrome 浏览器完成网页任务，包括导航、数据提取、表单填写、截图、adapter 命令等
---

# Browser Control Skill

你拥有操控 Chrome 浏览器的能力。浏览器由 TelyClaw 管理，登录态持久化在隔离的 Chrome Profile 中。

## 可用工具

| 工具 | 能力 |
|------|------|
| `opencli_daemon_status` | 检查连接状态 |
| `opencli_browser_navigate` | 导航到 URL |
| `opencli_browser_exec` | 执行 JavaScript |
| `opencli_browser_snapshot` | 提取页面内容 |
| `opencli_browser_screenshot` | 页面截图 |
| `opencli_browser_click` | 点击元素 |
| `opencli_browser_type` | 逐字符输入文本 |
| `opencli_browser_fill` | 填充输入框 |
| `opencli_browser_scroll` | 滚动页面 |
| `opencli_browser_cookies` | 读取 Cookie |
| `opencli_browser_network` | 网络请求捕获 |
| `opencli_browser_upload` | 上传文件 |
| `opencli_adapter_command` | 100+ 网站快捷命令 |

## 工作流程

1. 先用 `opencli_browser_navigate` 打开目标网站
2. 用 `opencli_browser_snapshot` 获取页面结构，找到目标元素的 ref
3. 执行操作：click / type / fill / exec
4. 返回结果给用户

## 安全约束

1. 不要未经用户同意就修改或提交表单
2. 不要访问敏感页面（银行、支付等）除非用户明确要求
3. 截图前告知用户
4. 执行 JS 前确保不会造成破坏性操作

## 网站适配器

OpenCLI 内置 100+ 网站适配器，常见命令：

- **12306**: orders, tickets
- **知乎 (zhihu)**: hot, search
- **B站 (bilibili)**: hot, search, video
- **微博 (weibo)**: hot, search
- **小红书 (xiaohongshu)**: search, notes
- **Twitter/X**: tweets, search, me
- **GitHub**: issues, repos, search
- 更多: 参见 references/opencli-adapters.md

优先使用 `opencli_adapter_command` 执行 adapter 命令，当 adapter 不支持某操作时再用通用浏览器工具。
