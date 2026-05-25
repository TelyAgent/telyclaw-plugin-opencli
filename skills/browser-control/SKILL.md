---
name: browser-control
description: 通过 OpenCLI 操控 Chrome 浏览器完成网页任务，包括导航、数据提取、表单填写、截图、adapter 命令等
---

# Browser Control Skill

你拥有操控 Chrome 浏览器的能力。浏览器由 TelyClaw 管理，登录态持久化在隔离的 Chrome Profile 中。

## 调用流程（必须严格遵守，禁止跳过任何步骤）

每次接收到浏览器相关任务时，按以下顺序执行，**未完成前一步不得进入下一步**：

### 第 0 步：检查健康状态

**任何操作前**，必须先调用 `opencli_daemon_status` 确认 daemon 和 Chrome 浏览器连接正常：

```
opencli_daemon_status()
```

- 如果 `state !== 'connected'` 或 `extensionConnected !== true`，**立即报告用户**："OpenCLI 浏览器未就绪，请检查 Chrome 是否已启动并被 TelyClaw 管理"。
- 不要尝试在未就绪状态下调用其他浏览器/adapter 工具。
- 如果状态正常，继续下一步。

### 第 1 步：识别站点并查看可用命令

**在调用任何 adapter 命令前**，必须先查看该站点的可用命令列表：

```
opencli_adapter_command(site="<site>", command="--help")
```

- `site` 值参考下方 [站点速查表](#站点速查表)，使用表格中的 site 名称（小写英文）。
- 如果用户提到的网站不在速查表中，先尝试用域名推测 site 名（如 `example.com` → `example`），再用 `--help` 验证。
- **严禁**在未执行 `--help` 的情况下猜测命令名。每个站点的命令名各不相同，猜测会失败。

### 第 2 步：匹配命令

根据 `--help` 返回的命令列表，匹配用户意图：

- 用户说"热搜/热榜/排行" → 选择 `hot`/`trending`/`ranking`/`top` 等列表类命令
- 用户说"搜索/查一下" → 选择 `search` 命令
- 用户说"看详情/打开/阅读" → 选择 `question`/`video`/`read`/`detail`/`note` 等详情类命令
- 用户说"发帖/回复/点赞" → 选择带 `(write)` 标记的命令

如果 `--help` 返回的命令与用户意图无法精确匹配，选择最接近的命令并向用户确认。

### 第 3 步：执行命令

用匹配到的命令和参数调用：

```
opencli_adapter_command(site="<site>", command="<command>", args={...})
```

参数传递规则：
- **位置参数**（如 query、id、url）：放在 `args` 对象中，可以直接作为 key 传入
- **选项参数**（如 limit、sort）：同样放在 `args` 中
- 从搜索/列表结果中获取详情时，用返回的 `url` 或 `id` 字段传给详情命令

**关键规则：**
- 获取详情内容时，使用适配器的详情命令，**严禁**对适配器返回的 URL 使用 `opencli_browser_navigate` + `opencli_browser_snapshot`
- 只有适配器**明确不支持**的操作，才使用通用浏览器工具

---

## 可用工具

| 工具 | 用途 |
|------|------|
| `opencli_daemon_status` | **第 0 步：检查连接状态** |
| `opencli_adapter_command` | **第 1-3 步：适配器命令（--help / 搜索 / 详情）** |
| `opencli_browser_navigate` | 仅适配器不支持时：导航到 URL |
| `opencli_browser_snapshot` | 仅适配器不支持时：提取页面 DOM |
| `opencli_browser_screenshot` | 页面截图 |
| `opencli_browser_click` | 点击元素 |
| `opencli_browser_type` | 逐字符输入文本 |
| `opencli_browser_fill` | 填充输入框 |
| `opencli_browser_scroll` | 滚动页面 |
| `opencli_browser_exec` | 执行 JavaScript |
| `opencli_browser_cookies` | 读取 Cookie |
| `opencli_browser_network` | 网络请求捕获 |
| `opencli_browser_upload` | 上传文件 |

---

## 站点速查表

以下列出常用站点及其命令。**但这只是速查参考，实际调用前仍需执行 `--help` 确认**，因为命令可能随版本更新而变化。

### 内容/阅读
| 站点 | site | 命令列表 |
|------|------|---------|
| 知乎 | zhihu | hot(search) recommend(search) question(answer-detail) answer-comments answer collection collections download comment(write) answer(write) like(write) follow(write) favorite(write) |
| Medium | medium | search feed tag user |
| Substack | substack | search feed publication |
| 豆瓣 | douban | search subject movie-hot book-hot top250 reviews marks photos download |
| 微信读书 | weread | search book shelf ranking notes highlights notebooks ai-outline |
| 小红书 | xiaohongshu | search note feed user publish download comments notifications creator-note-detail creator-notes creator-profile creator-stats delete-note(write) |
| Wikipedia | wikipedia | search summary page random trending |
| BBC | bbc | news topic |
| HackerNews | hackernews | top new best ask show jobs search read user |
| ProductHunt | producthunt | today hot browse posts |
| Dev.to | devto | top latest read tag user |
| 今日头条 | toutiao | hot search |

### 社交/社区
| 站点 | site | 命令列表 |
|------|------|---------|
| Twitter/X | twitter | search tweets tweet trending profile post reply like retweet follow bookmark thread timeline notifications lists list-tweets delete download |
| 微博 | weibo | hot search feed post me user user-posts comments publish(write) delete(write) favorites |
| Reddit | reddit | hot popular search read home frontpage subreddit subreddit-info subscribed user user-posts user-comments comment(write) reply(write) upvote(write) save(write) |
| V2EX | v2ex | hot latest topic read node nodes member user me notifications replies daily(write) |
| 贴吧 | tieba | hot search read posts |
| Bluesky | bluesky | search trending thread profile feeds followers following user starter-packs |
| Facebook | facebook | search feed profile friends groups events memories notifications marketplace-inbox marketplace-listings add-friend(write) join-group(write) |
| Instagram | instagram | search explore profile post story(write) reel(write) comment(write) like(write) save(write) follow(write) user download saved followers following |
| LinkedIn | linkedin | search timeline people-search inbox profile connect(write) safe-send(write) sent-invitations thread-snapshot salesnav-search salesnav-inbox salesnav-message(write) salesnav-thread |

### 视频/娱乐
| 站点 | site | 命令列表 |
|------|------|---------|
| B站 | bilibili | search hot video ranking feed dynamic me user-videos comments download subtitle summary history following favorite feed-detail |
| YouTube | youtube | search video channel playlist feed comments transcript subscriptions history like(write) subscribe(write) watch-later |
| 抖音 | douyin | search videos profile user-videos feed hashtag location activities collections publish(write) stats |
| TikTok | tiktok | search explore profile user creator-videos live follow(write) like(write) comment(write) save(write) friends following notifications |
| Spotify | spotify | search play pause next prev status queue shuffle repeat volume auth(write) |
| 小宇宙 | xiaoyuzhou | podcast episode podcast-episodes download transcript |

### 购物/电商
| 站点 | site | 命令列表 |
|------|------|---------|
| 淘宝 | taobao | search detail cart reviews add-cart |
| 京东 | jd | search detail item reviews cart add-cart |
| Amazon | amazon | search product offer bestsellers discussion new-releases movers-shakers |
| 闲鱼 | xianyu | search item inbox messages chat reply(write) publish(write) |
| 什么值得买 | smzdm | search |
| 大众点评 | dianping | search shop |
| 1688 | 1688 | search item store assets download |

### 职场/招聘
| 站点 | site | 命令列表 |
|------|------|---------|
| BOSS直聘 | boss | search joblist recommend detail chatlist chatmsg greet batchgreet invite exchange send mark resume stats |
| 51job | 51job | search hot detail company |

### 开发/技术
| 站点 | site | 命令列表 |
|------|------|---------|
| GitHub | github | search issues repos |
| Gitee | gitee | search trending user |
| StackOverflow | stackoverflow | search hot read tag user bounties related unanswered |
| npm | npm | search package downloads |
| PyPI | pypi | package downloads |
| Docker Hub | dockerhub | search image |

### 学术/论文
| 站点 | site | 命令列表 |
|------|------|---------|
| arXiv | arxiv | search paper author recent |
| PubMed | pubmed | search article author citations related |
| Google Scholar | google-scholar | search cite profile |

### AI 助手
| 站点 | site | 命令列表 |
|------|------|---------|
| ChatGPT | chatgpt | ask read send history detail new image status |
| Claude | claude | ask read send history detail new status |
| DeepSeek | deepseek | ask read send history detail new status |
| Gemini | gemini | ask new image deep-research deep-research-result |
| Grok | grok | ask read send history detail new image status |

### 金融/财经
| 站点 | site | 命令列表 |
|------|------|---------|
| 东方财富 | eastmoney | quote kline hot-rank rank index-board kuaixun announcement longhu money-flow northbound holders sectors etf convertible |
| 雪球 | xueqiu | stock kline hot hot-stock feed search watchlist earnings-date fund-holdings fund-snapshot groups comments |

### 旅行/出行
| 站点 | site | 命令列表 |
|------|------|---------|
| 12306 | 12306 | trains train stations price orders passengers me |

### 生活/其他
| 站点 | site | 命令列表 |
|------|------|---------|
| 虎扑 | hupu | hot(search) read(search) detail reply(write) like(write) unlike(write) mentions |
| wttr.in | wttr | current forecast |

---

## 安全约束

1. 不要未经用户同意就修改或提交表单
2. 不要访问敏感页面（银行、支付等）除非用户明确要求
3. 截图前告知用户
4. 执行 JS 前确保不会造成破坏性操作
