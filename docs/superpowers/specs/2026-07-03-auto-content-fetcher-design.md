# Auto Content Fetcher: Daily 5 Articles with AI Generation & Translation

## Overview

每天自动采集/创作 5 篇测评文章，翻译为 8 种语言，生成配图，写入 `posts.json`。

## Architecture

```
┌──────────┐    ┌──────────────┐    ┌─────────┐    ┌────────┐    ┌────────┐
│ Cron     │───▶│ Topic Finder │───▶│ AI      │───▶│ Trans- │───▶│ Image  │
│ Trigger  │    │ (WebSearch)  │    │ Creator │    │ lation │    │ Gen    │
└──────────┘    └──────────────┘    └─────────┘    └────────┘    └────────┘
     │                                                            │
     └────────────────────── posts.json ◀─────────────────────────┘
```

## Modules

### 1. Cron Scheduler (`scripts/daily-fetch.js`)
- 使用 `node-cron`，每天北京时间 8:00 运行
- 调用话题发现 → AI创作 → 翻译 → 生图 → 写入数据
- 失败有日志，不重复创建

### 2. Topic Finder
- 使用 Web Search API 搜索 5 个科技话题关键词
- 关键词轮换池：AI tools, best software, gadget reviews, productivity, cybersecurity, cloud, smart home, headphones, laptops, apps
- 每天随机选 5 个，避免与前一天重复

### 3. AI Creator
- 调用 DeepSeek/Claude API，基于搜索摘要生成原创文章
- 输出：title, excerpt, content (350+ words), category
- 分类自动判断：Software / Equipment / Guide / Comparison / General

### 4. Translator
- 调用 AI 翻译为 zh, es, fr, de, ja, ko, ru
- 保留 Markdown 格式

### 5. Image Generator
- 调用 Runware MCP 或百炼 API
- 每篇生成 1024×1024 配图
- 保存到 `public/images/blog/`

## Data Flow

1. 搜索 5 个话题 → 获取摘要+关键词
2. 每个话题：AI 生成英文文章（title, excerpt, content, category）
3. 翻译为 7 种语言（zh, es, fr, de, ja, ko, ru）
4. 生成配图（1 张/篇）
5. 写入 `src/data/posts.json`（5 × 8 = 40 条记录）
6. 写入执行日志 `src/data/fetch-log.json`

## Error Handling

- 每步有 try-catch，失败记录日志
- 部分成功（如生图失败）仍写入文章
- 完全失败（如 API 不可用）跳过当天，不影响系统

## Files

| File | Purpose |
|------|---------|
| `scripts/daily-fetch.js` | 主调度脚本 |
| `scripts/lib/topic-finder.js` | 话题搜索 |
| `scripts/lib/ai-writer.js` | AI 文章生成 |
| `scripts/lib/translator.js` | 多语言翻译 |
| `scripts/lib/content-pipeline.js` | 编排逻辑 |
| `src/data/fetch-log.json` | 执行日志 |
