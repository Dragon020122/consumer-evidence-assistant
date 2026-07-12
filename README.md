# 预付式消费纠纷证据整理助手

面向脱敏、小规模用户测试的 MVP。它帮助消费者整理一般预付服务纠纷材料、确认结构化事实、建立时间线和证据目录、发现材料缺口，并生成需要用户核对的材料草稿。它不是法律服务，不判断违法，不保证投诉或退款结果。

## 本地启动

要求 Node.js 24（最低 22.5）和 npm 11。Windows 本地演示已验证；Linux CI 需安装 `fonts-noto-cjk`。

```bash
npm install
copy .env.example .env.local
npm run db:migrate
npm run db:seed
npm run demo:generate-assets
npm run demo:seed
npm run auth:doctor
npm run demo:doctor
npm run dev
```

访问 `http://localhost:3000`。开发登录仅在 `DEV_AUTH_ENABLED=true` 且非生产环境时开放；密码来自服务端环境变量，不写入前端。

### 虚构演示账号

密码的唯一真实来源是当前机器的 `.env.local`，README 不覆盖本地环境变量。账号与变量对应关系：

- 普通用户：`user@demo.local` ← `DEV_USER_PASSWORD`
- 人工复核员：`reviewer@demo.local` ← `DEV_REVIEWER_PASSWORD`
- 管理员：`admin@demo.local` ← `DEV_ADMIN_PASSWORD`

如果 `.env.local` 是刚从 `.env.example` 原样复制的，示例密码依次为 `change-me-user`、`change-me-reviewer`、`change-me-admin`；若本地文件已修改，必须使用修改后的值。每次变更密码环境变量后都要执行 `npm run db:seed`，使数据库 scrypt 哈希与当前环境一致。可运行 `npm run auth:doctor` 检查环境、账号、角色和密码哈希是否一致，该命令不会输出密码值。

这些账号只可用于本地虚构数据。启动公开测试前必须更换三个密码和 `DEV_AUTH_SECRET`。种子同时创建 `demo-case-gym`（虚构健身年卡 2999 元案例）和四个不收款的测试套餐。

登录后会按服务端 Session 中的角色进入不同首页：普通用户进入“我的案件”，人工复核员进入“复核工作台”，管理员进入“管理后台”。右上角账号菜单显示邮箱和中文角色名称，并通过服务端退出接口销毁 Session Cookie。角色无权访问的页面会在渲染表单前重定向到对应首页。

`DEMO_MODE_ENABLED=true` 且非生产环境时，普通用户“我的案件”会显示折叠式演示测试工具。点击“使用演示案件体验完整流程”会创建或恢复当前用户的完整演示案件：仓库脚本生成的 8 份虚构 PNG/PDF/TXT 与 18 项待确认 Mock 提取结果会一起载入。案件页仍提供单份材料演示和开发快捷检查；“重新生成提取结果”“一键确认全部”仅在该开关开启、当前用户拥有虚构演示案件时可用。演示接口仍执行服务端环境、角色、所有权、文件签名、大小和摘要去重检查；生产环境强制拒绝开启。

修改 `.env.local`、执行新数据库迁移或重新生成演示资料后，必须停止并重新运行 `npm run dev`，使服务端进程重新加载环境与路由。`npm run demo:doctor` 只检查环境、迁移、账号、存储、8 份资料和 Mock 配置，不输出密码或密钥；`npm run demo:seed` 幂等创建或修复 `prepaid-gym-v1` 模板，只处理普通演示账号自己的演示案件。

建议演示材料可新建 TXT 文件，内容全部使用虚构信息，例如：

```text
付款记录
2026年1月15日
实付 2999 元
收款方：星云健康管理有限公司（虚构）
订单号：DEMO-2026-001
```

## 无外部服务模式

默认 `OCR_PROVIDER=mock`、`EXTRACTION_PROVIDER=mock`，无需 OCR、模型、对象存储或支付密钥。上传文件仅保存在 `PRIVATE_STORAGE_PATH` 指向的非公开本地目录。本地存储只用于测试，不可直接用于生产。

## 常用命令

```bash
npm run lint
npm run typecheck
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
npm run security:check
npm run auth:doctor
npm run check
npm run cleanup
```

`npm run db:reset` 只删除固定 ID 的虚构演示案件，不会清理其他案件；随后执行 `npm run db:seed` 可恢复演示案例。

## 数据删除

案件详情提供一键删除。删除流程清理案件全部数据库子记录、上传文件和生成文件，只留下不含商户名称、证据原文和个人信息的审计摘要。`npm run cleanup` 会清理到期或处于待删除状态的案例。

## 文档

- [产品需求](docs/PRD.md)
- [架构](docs/ARCHITECTURE.md)
- [实施计划](docs/IMPLEMENTATION_PLAN.md)
- [数据安全](docs/DATA_SECURITY.md)
- [测试计划](docs/TEST_PLAN.md)
- [部署说明](docs/DEPLOYMENT.md)
- [人工复核边界](docs/MANUAL_REVIEW.md)
- [安全审查](docs/SECURITY_REVIEW.md)
- [进度与已知限制](docs/PROGRESS.md)
- [最终交付报告](docs/FINAL_REPORT.md)
