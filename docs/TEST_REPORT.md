# 测试报告

执行日期与时间：2026-07-12 23:01（Asia/Shanghai）；环境：Windows 本地、Node.js 24、npm 11、Node SQLite、Mock OCR/提取、虚构演示数据。

| 命令 | 结果 | 通过数量 / 说明 |
| --- | --- | --- |
| `npm run auth:doctor` | 通过 | USER、REVIEWER、ADMIN 账号、角色与密码哈希一致；未输出密码 |
| `npm run demo:doctor` | 通过 | 开发模式、迁移、8/8 资产、8 份证据、18 项提取、私有存储与 Mock 配置正常 |
| `npm run lint` | 通过 | ESLint 无错误 |
| `npm run typecheck` | 通过 | `tsc --noEmit` 无错误 |
| `npm run test` | 通过 | 21 文件 / 64 测试 |
| `npm run test:integration` | 通过 | 7 文件 / 23 测试 |
| `npm run test:e2e` | 通过 | 3 文件 / 6 测试 |
| `npm run build` | 通过 | Next.js 生产构建完成 |
| `npm run security:check` | 通过 | 未发现常见硬编码密钥或已跟踪私有目录 |
| `npm audit --omit=dev --audit-level=moderate` | 通过 | `found 0 vulnerabilities` |

## 覆盖重点

单元测试覆盖输入解析、状态派生、DTO/CSP、权限、日志脱敏、上传和缺口规则。集成测试覆盖认证、案件、存储、提取、时间线、后台和删除。E2E 覆盖完整虚构材料流程、演示幂等恢复、跨用户拒绝、角色导航与退出。

## 已知警告

Node 24 的 `node:sqlite` 仍输出实验性 API 警告；它是本地测试版的已知限制，不是测试失败。正式环境必须使用经过评审的生产数据库方案。

## 干净启动验证

使用当前提交创建全新系统临时目录与隔离 npm 缓存，复制 `.env.example` 为 `.env.local` 后，依次运行 `npm ci`、`db:migrate`、`db:seed`、`demo:generate-assets`、`demo:seed`、`auth:doctor`、`demo:doctor` 和 `build`，全部通过。该验证未读取或改动当前开发数据库。首次验证尝试受 Windows PowerShell 的二进制 tar 管道编码影响而失败，改用 ZIP 归档后成功；这不是项目启动缺陷。
