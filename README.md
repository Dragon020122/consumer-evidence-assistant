# 预付式消费纠纷证据整理助手

面向脱敏、小规模用户测试的 MVP。它帮助消费者整理一般预付服务纠纷材料、确认结构化事实、建立时间线和证据目录、发现材料缺口，并生成需要用户核对的材料草稿。它不是法律服务，不判断违法，不保证投诉或退款结果。

## 本地启动

要求 Node.js 24（最低 22.5）和 npm 11。Windows 本地演示已验证；Linux CI 需安装 `fonts-noto-cjk`。

```bash
npm install
copy .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

访问 `http://localhost:3000`。开发登录仅在 `DEV_AUTH_ENABLED=true` 且非生产环境时开放；账号与密码见本地种子命令输出，密码来自环境变量，不写入前端。

### 虚构演示账号

复制示例环境变量且未修改开发密码时：

- 普通用户：`user@demo.local` / `change-me-user`
- 人工复核员：`reviewer@demo.local` / `change-me-reviewer`
- 管理员：`admin@demo.local` / `change-me-admin`

这些账号只可用于本地虚构数据。启动公开测试前必须更换三个密码和 `DEV_AUTH_SECRET`。种子同时创建 `demo-case-gym`（虚构健身年卡 2999 元案例）和四个不收款的测试套餐。

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
