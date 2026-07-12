# 公开仓库安全审计

审计日期：2026-07-12。范围为当前工作区、已跟踪文件、可达 Git 历史与不可达对象的只读检查；没有改写 Git 历史，也没有读取或输出本地环境变量的值。

## 结果

| 项目 | 结果 |
| --- | --- |
| 已跟踪环境文件 | 仅 `.env.example` |
| 本地 `.env.local`、SQLite、日志、缓存、私有存储 | 均由 `.gitignore` 排除 |
| 示例配置 | 仅包含 `change-me-*` 和随机密钥占位文本，不是生产凭据 |
| Git 历史与不可达对象 | 未命中常见云密钥、GitHub token、OpenAI 类密钥或私钥模式 |
| 项目安全脚本 | 通过 |
| `npm audit --omit=dev --audit-level=moderate` | `found 0 vulnerabilities` |
| 本地 secret scanner | 未安装；未以安装新工具替代审计 |

本地目录可见 `.data/`、`.npm-cache/`、`.next/`、`node_modules/` 和 `.env.local` 等开发产物；它们未被 Git 跟踪，且不应纳入任何提交。

## 发布前复查

1. 运行 `git status --ignored --short`，确认 `.env.local`、数据库、日志、私有文件与导出物仍被忽略。
2. 不要将本机密码或 `DEV_AUTH_SECRET` 从 `.env.local` 复制到 README、Issue、截图或 Actions 配置。
3. 仅提交仓库提供的八份虚构演示资料；它们含有“虚构测试材料｜仅用于产品演示｜不可用于真实投诉”标记。
4. 推送后在 GitHub 开启 Secret Scanning、Push Protection 与 Dependabot Alerts。

此审计降低公开仓库泄露风险，但不构成对任何未来分支、Fork 或部署环境的持续安全保证。
