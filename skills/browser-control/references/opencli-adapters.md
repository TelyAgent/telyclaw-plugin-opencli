# OpenCLI 适配器速查表

OpenCLI 内置 100+ 网站适配器（clis/ 目录）。以下为常用适配器速查。

## 社交平台

| 站点 | site | 常用命令 |
|------|------|---------|
| 知乎 | zhihu | hot, search, question, answer |
| 微博 | weibo | hot, search, user |
| 小红书 | xiaohongshu | search, notes, user |
| Twitter/X | twitter | tweets, search, me, user |
| 豆瓣 | douban | search, movie, book |
| 贴吧 | tieba | search, posts |

## 视频平台

| 站点 | site | 常用命令 |
|------|------|---------|
| B站 | bilibili | hot, search, video, user |
| YouTube | youtube | search, video, channel |

## 购物出行

| 站点 | site | 常用命令 |
|------|------|---------|
| 12306 | 12306 | orders, tickets, search |
| 淘宝 | taobao | search, item |
| 京东 | jd | search, item |

## 开发平台

| 站点 | site | 常用命令 |
|------|------|---------|
| GitHub | github | issues, repos, search, user |
| NPM | npm | search, package |
| Stack Overflow | stackoverflow | search, questions |

## 新闻资讯

| 站点 | site | 常用命令 |
|------|------|---------|
| 百度 | baidu | search, news |
| 今日头条 | toutiao | hot, search |
| Hacker News | hackernews | top, new, search |

## 使用示例

```bash
# 知乎热榜
opencli zhihu hot -f json

# B站搜索
opencli bilibili search --q "Claude Code" -f json

# 12306 查订单（需先登录）
opencli 12306 orders -f json

# GitHub issues
opencli github issues --repo anthropics/claude-code -f json
```

## 通过 AI 调用

使用 `opencli_adapter_command` 工具：

```json
{
  "site": "zhihu",
  "command": "hot",
  "args": {}
}
```

AI 会根据用户意图自动选择合适的 site 和 command。
