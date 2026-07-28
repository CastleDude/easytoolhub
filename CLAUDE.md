# EasyToolHub 项目运维指南

## 服务器信息

- **平台**: VPS (OpenCloudOS) + PM2
- **项目路径**: `/www/easytoolhub`
- **域名**: `easytoolhub.com`
- **PM2 进程**: `easytoolhub` (Next.js) + `daily-fetch` (每日文章生成守护进程)

## 更新代码

```bash
cd /www/easytoolhub && git pull && npm install && rm -rf .next && npm run build && pm2 restart easytoolhub && pm2 restart daily-fetch
```

> **注意**: `posts.json` 和 `blog-stats.json` 已从 git 跟踪中移除（`.gitignore`），`git pull` 不会再覆盖这些数据文件。

## 备份数据

```bash
/www/easytoolhub/scripts/backup-data.sh
```

备份文件存储在 `/www/backup/site/easytoolhub.top/`。

## 日常运维

| 任务 | 命令 |
|------|------|
| 更新代码 | `cd /www/easytoolhub && git pull && npm install && rm -rf .next && npm run build && pm2 restart easytoolhub && pm2 restart daily-fetch` |
| 备份数据 | `/www/easytoolhub/scripts/backup-data.sh` |
| 查看进程状态 | `pm2 status` |
| 查看 pipeline 日志 | `pm2 logs daily-fetch` |
| 查看应用日志 | `pm2 logs easytoolhub` |
| 修复翻译失败 | `cd /www/easytoolhub && node scripts/fix-translations.js` |
| 补生成缺失图片 | `cd /www/easytoolhub && node /tmp/gen-all-missing.js` |
| 转换 PNG → WebP | `cd /www/easytoolhub && node scripts/convert-webp.js` |

## 自动生成文章机制

- **时间**: 北京时间每晚 20:00 (12:00 UTC)
- **篇数**: 每天 2 篇
- **语言**: 8 种 (en, zh, es, fr, de, ja, ko, ru)
- **类目**: 自动规范化，不会出现 `Blog.categories.xxx` 原始 key
- **图片**: Runware API → sharp 转 WebP → 失败则 SVG 占位
- **翻译**: 失败自动重试一次，仍失败则保留带 `[XX]` 前缀的版本

## 环境变量

服务器 `/www/easytoolhub/.env.local` 需包含:
```
RUNWARE_API_KEY=xxx
ANTHROPIC_AUTH_TOKEN=xxx
ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
NEXT_PUBLIC_SITE_URL=https://easytoolhub.com
JWT_SECRET=xxx
ADMIN_PASSWORD_HASH=xxx
```
