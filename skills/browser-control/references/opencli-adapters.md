# OpenCLI 适配器完整速查表

OpenCLI 内置 150+ 网站适配器。通过 `opencli_adapter_command(site, "--help", {})` 可随时查看任何站点的完整命令列表和参数说明。

## 内容/阅读

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
| 路透社 | reuters | search |
| HackerNews | hackernews | top new best ask show jobs search read user |
| ProductHunt | producthunt | today hot browse posts |
| Dev.to | devto | top latest read tag user |
| 今日头条 | toutiao | hot search |
| 虎嗅 | hupu | hot(search) read(search) reply(write) like(write) unlike(write) mentions |
| 少数派 | sspai | search |

## 社交/社区

| 站点 | site | 命令列表 |
|------|------|---------|
| Twitter/X | twitter | search tweets tweet trending profile post reply like retweet follow bookmark thread timeline notifications lists list-tweets delete download accept block(write) unblock(write) unfollow(write) unlike(write) unretweet(write) unbookmark(write) bookmark-folder bookmark-folders device-follow followers following hide-reply(write) reply-dm(write) quote(write) |
| 微博 | weibo | hot search feed post me user user-posts comments publish(write) delete(write) favorites |
| Reddit | reddit | hot popular search read home frontpage subreddit subreddit-info subscribed user user-posts user-comments comment(write) reply(write) upvote(write) upvoted save(write) saved whoami |
| V2EX | v2ex | hot latest topic read node nodes member user me notifications replies daily(write) |
| 贴吧 | tieba | hot search read posts |
| 即刻 | jike | feed search post topic user create(write) comment(write) like(write) repost(write) notifications |
| Bluesky | bluesky | search trending thread profile feeds followers following user starter-packs |
| Facebook | facebook | search feed profile friends groups events memories notifications marketplace-inbox marketplace-listings add-friend(write) join-group(write) |
| Instagram | instagram | search explore profile post story(write) reel(write) comment(write) like(write) save(write) follow(write) user download saved followers following collection-create(write) collection-delete(write) note(write) unfollow(write) unlike(write) unsave(write) |
| LinkedIn | linkedin | search timeline people-search inbox profile connect(write) safe-send(write) sent-invitations thread-snapshot salesnav-search salesnav-inbox salesnav-message(write) salesnav-thread |
| 脉脉 | maimai | search |
| 抖音 | douyin | search videos profile user-videos feed hashtag location activities collections publish(write) stats delete(write) draft(write) drafts |
| TikTok | tiktok | search explore profile user creator-videos live follow(write) like(write) comment(write) save(write) friends following notifications unfollow(write) unlike(write) unsave(write) |

## 视频/娱乐

| 站点 | site | 命令列表 |
|------|------|---------|
| B站 | bilibili | search hot video ranking feed dynamic me user-videos comments download subtitle summary history following favorite feed-detail |
| YouTube | youtube | search video channel playlist feed comments transcript subscriptions history like(write) subscribe(write) unsubscribe(write) unlike(write) watch-later |
| Spotify | spotify | search play pause next prev status queue shuffle repeat volume auth(write) |
| 小宇宙 | xiaoyuzhou | podcast episode podcast-episodes download transcript |
| Apple Podcasts | apple-podcasts | search top episodes |
| Suno | suno | generate(write) list status download(write) |
| 即梦 | jimeng | generate(write) new(write) history workspaces |
| 豆瓣 | douban | (同上，见内容/阅读) |
| 虎牙 | huya | search |
| 斗鱼 | douyu | search |
| Steam | steam | search |

## 购物/电商

| 站点 | site | 命令列表 |
|------|------|---------|
| 淘宝 | taobao | search detail cart reviews add-cart(write) |
| 京东 | jd | search detail item reviews cart add-cart(write) |
| Amazon | amazon | search product offer bestsellers discussion new-releases movers-shakers |
| 闲鱼 | xianyu | search item inbox messages chat(write) reply(write) publish(write) |
| 什么值得买 | smzdm | search |
| 大众点评 | dianping | search shop |
| 1688 | 1688 | search item store assets download |
| Coupang | coupang | search |

## 职场/招聘

| 站点 | site | 命令列表 |
|------|------|---------|
| BOSS直聘 | boss | search joblist recommend detail chatlist chatmsg greet(write) batchgreet(write) invite(write) exchange(write) send(write) mark(write) resume stats |
| 51job | 51job | search hot detail company |
| Indeed | indeed | search |
| LinkedIn | linkedin | (同上，见社交/社区) |
| 猎聘 | liepin | search |

## 开发/技术

| 站点 | site | 命令列表 |
|------|------|---------|
| Gitee | gitee | search trending user |
| StackOverflow | stackoverflow | search hot read tag user bounties related unanswered |
| npm | npm | search package downloads |
| PyPI | pypi | package downloads |
| Docker Hub | dockerhub | search image |
| Homebrew | homebrew | formula cask popular |
| crates.io | crates | crate search |
| MDN | mdn | search |
| NVD | nvd | search |
| OSV | osv | search |
| NuGet | nuget | search |
| Packagist | packagist | search |
| RubyGems | rubygems | search |
| Flathub | flathub | search |
| GoProxy | goproxy | search |
| endoflife.date | endoflife | search |

## 学术/论文

| 站点 | site | 命令列表 |
|------|------|---------|
| arXiv | arxiv | search paper author recent |
| PubMed | pubmed | search article author citations related |
| Google Scholar | google-scholar | search cite profile |
| 百度学术 | baidu-scholar | search |
| DBLP | dblp | search |
| OpenReview | openreview | search |
| OpenAlex | openalex | search |
| 知网 | cnki | search |
| 万方 | wanfang | search |
| PaperReview | paperreview | search |
| 超星 | chaoxing | search |

## AI 助手（由 AI 直接操控 AI 产品的 UI）

| 站点 | site | 命令列表 |
|------|------|---------|
| ChatGPT | chatgpt | ask(write) read send(write) history detail new image(write) status |
| Claude | claude | ask(write) read send(write) history detail new status |
| DeepSeek | deepseek | ask(write) read send(write) history detail new status |
| Gemini | gemini | ask(write) new image(write) deep-research(write) deep-research-result |
| Grok | grok | ask(write) read send(write) history detail new image(write) status |
| Qwen | qwen | ask(write) read send(write) history detail new image(write) status |
| 豆包 | doubao | ask(write) read send(write) history detail new meeting-summary meeting-transcript status |
| NotebookLM | notebooklm | list get current open history notes-get note-list source-get source-list source-fulltext source-guide summary status |
| 元宝 | yuanbao | ask |
| 秘塔 | metaso | search |

## 金融/财经

| 站点 | site | 命令列表 |
|------|------|---------|
| 东方财富 | eastmoney | quote kline hot-rank rank index-board kuaixun announcement longhu money-flow northbound holders sectors etf convertible |
| 雪球 | xueqiu | stock kline hot hot-stock feed search watchlist earnings-date fund-holdings fund-snapshot groups comments |
| 新浪财经 | sinafinance | search |
| 同花顺 | ths | search |
| Yahoo Finance | yahoo-finance | search |
| 币安 | binance | search |
| CoinGecko | coingecko | search |
| DeFiLlama | defillama | search |
| Bloomberg | bloomberg | search |
| Barchart | barchart | search |

## 旅行/出行

| 站点 | site | 命令列表 |
|------|------|---------|
| 12306 | 12306 | trains train stations price orders passengers me |
| 携程 | ctrip | search |
| Booking | booking | search |

## 搜索/词典

| 站点 | site | 命令列表 |
|------|------|---------|
| 百度 | baidu | search |
| Google | google | search |
| DuckDuckGo | duckduckgo | search |
| Yahoo | yahoo | search |
| 有道词典 | youdao | search |
| Dictionary | dictionary | search |

## 生活/其他

| 站点 | site | 命令列表 |
|------|------|---------|
| 虎扑 | hupu | hot read reply(write) like(write) unlike(write) mentions |
| 天气 | wttr | current forecast |
| 什么值得买 | smzdm | search |
| 起点中文 | qidian | search |
| Pixiv | pixiv | search |
| IMDB | imdb | search |
| Lichess | lichess | search |
| OEIS | oeis | search |
| 一亩三分地 | 1point3acres | hot latest digest search thread forum forums user notifications |
| 36氪 | 36kr | hot news search article |
| 好奇心日报 | qdaily | search |
| 网易云音乐 | netease-music | search |
| 得到 | dedao | search |
| 知识星球 | zsxq | search |
| 小鹅通 | xiaoe | search |
| 墨问便签 | mubu | search |
| Flomo | flomo | search |
| 飞书文档 | feishu-doc | search |
| 石墨文档 | shimo | search |
| Notion | ntn | search |
| 语雀 | yuque | search |
| 印象笔记 | yinxiang | search |
| Evernote | evernote | search |
| 天眼查 | tianyancha | search |
| 企查查 | qcc | search |
| 爱企查 | aiqicha | search |
| 王者荣耀 | smoba | search |

## 自适应通用站点

| 站点 | site | 说明 |
|------|------|------|
| Web (通用) | web | 任意网站通用提取、分析、监控 |

## 使用说明

### 通过 AI 调用

```
opencli_adapter_command(site, command, args)
```

例如：
```json
{"site": "zhihu", "command": "hot", "args": {"limit": 10}}
{"site": "bilibili", "command": "search", "args": {"query": "Claude Code"}}
{"site": "twitter", "command": "tweets", "args": {"id": "elonmusk"}}
```

### 探索未知站点

```
opencli_adapter_command(site, "--help", {})
```

返回该站点的所有命令、参数 schema、示例用法。

### 参数传递规则

- **位置参数**放在 `args` 中，键名如 `query`, `q`, `id`, `text`, `name` 等
- **选项参数**也放在 `args` 中，如 `limit`, `sort`, `type`, `offset` 等
- `--help` 返回的结果中 `positionals` 字段标明哪些是位置参数
