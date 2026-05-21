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

**第一步：检查是否有适配器命令可用。** 优先使用 `opencli_adapter_command` —— 它直接调用目标网站的 API，速度快、结果结构化。只有在适配器不支持所需操作时，才使用通用浏览器工具。

### 通过适配器获取内容（首选）

1. 先调用对应站点的列表/搜索命令获取数据：`opencli_adapter_command(site, command, args)`
2. 如需获取详情，继续用适配器的详情命令（如 `question`, `answer-detail`, `video` 等），传入 ID 或 URL
3. **禁止**对适配器返回的 URL 使用 `opencli_browser_navigate` + `opencli_browser_snapshot` 来提取内容 —— 适配器的详情命令更高效且结构化

### 通过浏览器工具操作（适配器不支持时）

1. 用 `opencli_browser_navigate` 打开目标网站
2. 用 `opencli_browser_snapshot` 获取页面结构，找到目标元素的 ref
3. 执行操作：click / type / fill / exec
4. 返回结果给用户

## 安全约束

1. 不要未经用户同意就修改或提交表单
2. 不要访问敏感页面（银行、支付等）除非用户明确要求
3. 截图前告知用户
4. 执行 JS 前确保不会造成破坏性操作

## 网站适配器

OpenCLI 内置 150+ 网站适配器，按分类列出常用命令。**不知道某站点有什么命令时，先调用 `opencli_adapter_command(site, "--help", {})` 查看**。

### 内容/阅读
| 站点 | 常用命令 |
|------|---------|
| **知乎 (zhihu)** | hot, search, question, answer-detail, answer-comments, recommend, collection, download, like, follow, comment, answer |
| **Medium** | search, feed, tag, user |
| **Substack** | search, feed, publication |
| **豆瓣 (douban)** | search, subject, movie-hot, book-hot, top250, reviews, marks, photos, download |
| **微信读书 (weread)** | search, book, shelf, ranking, notes, highlights, notebooks, ai-outline |
| **小红书 (xiaohongshu)** | search, note, feed, user, publish, download, comments, notifications, creator-note-detail, creator-notes, creator-profile, creator-stats, delete-note |
| **Wikipedia** | search, summary, page, random, trending |
| **BBC** | news, topic |
| **HackerNews** | top, new, best, ask, show, jobs, search, read, user |
| **ProductHunt** | today, hot, browse, posts |
| **Dev.to** | top, latest, read, tag, user |

### 社交/社区
| 站点 | 常用命令 |
|------|---------|
| **Twitter/X** | search, tweets, tweet, trending, profile, post, reply, like, retweet, follow, bookmark, thread, timeline, notifications, lists, list-tweets, delete, download |
| **微博 (weibo)** | hot, search, feed, post, me, user, user-posts, comments, publish, delete, favorites |
| **Reddit** | hot, popular, search, read, home, frontpage, subreddit, subreddit-info, subscribed, user, user-posts, user-comments, comment, reply, upvote, save |
| **V2EX** | hot, latest, topic, read, node, nodes, member, user, me, notifications, replies, daily |
| **贴吧 (tieba)** | hot, search, read, posts |
| **即刻 (jike)** | feed, search, post, topic, user, create, comment, like, repost, notifications |
| **Bluesky** | search, trending, thread, profile, feeds, followers, following, user, starter-packs |
| **Facebook** | search, feed, profile, friends, groups, events, memories, notifications, marketplace-inbox, marketplace-listings, add-friend, join-group |
| **Instagram** | search, explore, profile, post, story, reel, comment, like, save, follow, user, download, saved, followers, following, collection-create, note |
| **LinkedIn** | search, timeline, people-search, inbox, profile, connect, safe-send, sent-invitations, thread-snapshot, salesnav-search, salesnav-inbox, salesnav-message, salesnav-thread |

### 视频/娱乐
| 站点 | 常用命令 |
|------|---------|
| **B站 (bilibili)** | search, hot, video, ranking, feed, dynamic, me, user-videos, comments, download, subtitle, summary, history, following, favorite, feed-detail |
| **YouTube** | search, video, channel, playlist, feed, comments, transcript, subscriptions, history, like, subscribe, watch-later |
| **抖音 (douyin)** | search, videos, profile, user-videos, feed, hashtag, location, activities, collections, publish, stats |
| **TikTok** | search, explore, profile, user, creator-videos, live, follow, like, comment, save, friends, following, notifications |
| **Spotify** | search, play, pause, next, prev, status, queue, shuffle, repeat, volume, auth |
| **小宇宙 (xiaoyuzhou)** | podcast, episode, podcast-episodes, download, transcript |
| **Apple Podcasts** | search, top, episodes |
| **Suno** | generate, list, status, download |
| **即梦 (jimeng)** | generate, new, history, workspaces |

### 购物/电商
| 站点 | 常用命令 |
|------|---------|
| **淘宝 (taobao)** | search, detail, cart, reviews, add-cart |
| **京东 (jd)** | search, detail, item, reviews, cart, add-cart |
| **Amazon** | search, product, offer, bestsellers, discussion, new-releases, movers-shakers |
| **闲鱼 (xianyu)** | search, item, inbox, messages, chat, reply, publish |
| **什么值得买 (smzdm)** | search |
| **大众点评 (dianping)** | search, shop |
| **1688** | search, item, store, assets, download |

### 职场/招聘
| 站点 | 常用命令 |
|------|---------|
| **BOSS直聘 (boss)** | search, joblist, recommend, detail, chatlist, chatmsg, greet, batchgreet, invite, exchange, send, mark, resume, stats |
| **LinkedIn** | search, people-search, inbox, timeline, connect, safe-send, sent-invitations, thread-snapshot, salesnav-search, salesnav-inbox, salesnav-message, salesnav-thread |
| **51job** | search, hot, detail, company |
| **Indeed** | search |

### 开发/技术
| 站点 | 常用命令 |
|------|---------|
| **GitHub** | search, issues, repos (通过 `gh` 外部 CLI) |
| **Gitee** | search, trending, user |
| **StackOverflow** | search, hot, read, tag, user, bounties, related, unanswered |
| **npm** | search, package, downloads |
| **PyPI** | package, downloads |
| **Docker Hub** | search, image |
| **Homebrew** | formula, cask, popular |
| **crates.io** | crate, search |
| **MDN** | search |

### 学术/论文
| 站点 | 常用命令 |
|------|---------|
| **arXiv** | search, paper, author, recent |
| **PubMed** | search, article, author, citations, related |
| **Google Scholar** | search, cite, profile |
| **百度学术** | search |
| **DBLP** | search |
| **OpenReview** | search |
| **OpenAlex** | search |

### AI 助手
| 站点 | 常用命令 |
|------|---------|
| **ChatGPT** | ask, read, send, history, detail, new, image, status |
| **Claude** | ask, read, send, history, detail, new, status |
| **DeepSeek** | ask, read, send, history, detail, new, status |
| **Gemini** | ask, new, image, deep-research, deep-research-result |
| **Grok** | ask, read, send, history, detail, new, image, status |
| **Qwen** | ask, read, send, history, detail, new, image, status |
| **豆包 (doubao)** | ask, read, send, history, detail, new, meeting-summary, meeting-transcript, status |
| **NotebookLM** | list, get, current, open, history, notes-get, note-list, source-get, source-list, source-fulltext, source-guide, summary, status |

### 金融/财经
| 站点 | 常用命令 |
|------|---------|
| **东方财富 (eastmoney)** | quote, kline, hot-rank, rank, index-board, kuaixun, announcement, longhu, money-flow, northbound, holders, sectors, etf, convertible |
| **雪球 (xueqiu)** | stock, kline, hot, hot-stock, feed, search, watchlist, earnings-date, fund-holdings, fund-snapshot, groups, comments |
| **新浪财经 (sinafinance)** | search |
| **Yahoo Finance** | search |
| **同花顺 (ths)** | search |

### 旅行/出行
| 站点 | 常用命令 |
|------|---------|
| **12306** | trains, train, stations, price, orders, passengers, me |
| **携程 (ctrip)** | search |
| **Booking** | search |

### 生活/其他
| 站点 | 常用命令 |
|------|---------|
| **虎扑 (hupu)** | hot, search, read, detail, reply, like, unlike, mentions |
| **wttr.in** | current, forecast |
| **Steam** | search |

### 关键规则

1. **优先用适配器详情命令**：获取搜索结果的详情内容时，使用适配器的详情命令（如 `question(id)`、`answer-detail(id)`、`video(id)`、`read(id)`），**禁止**对适配器返回的 URL 使用 `opencli_browser_navigate` + `opencli_browser_snapshot` 来提取内容
2. **参数传递**：从 search/hot 等命令返回的 JSON 中提取 id/URL/rank，传给对应的详情命令。适配器的主参数（如 search 的 query、question 的 id）大多为位置参数，放在 `args` 中传即可
3. **探索命令**：不知道某站点有什么命令时，**务必先调用** `opencli_adapter_command(site, "--help", {})` 查看可用命令列表和参数说明，再选择合适的命令
4. **适配器不支持时**：才使用通用浏览器工具（navigate + snapshot + click 等）
