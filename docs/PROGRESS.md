# 实施进度

## 当前状态

- 阶段 16 审计完成：记录演示数据、字段状态、上传体验、软阻断、八步导航和 E2E 覆盖缺口；确认现有服务端角色、所有权、分配、文件校验与私有下载边界应原样保留。详见 `docs/UX_AUDIT.md` 与 ADR-006 至 ADR-008。
- 阶段 16 实现完成：增加非生产双重守卫的 `DEMO_MODE_ENABLED`、可重复生成的 6 PNG/1 PDF/1 TXT、当前用户演示案件创建/恢复/隔离重置、单份/全部证据载入、字段七态与证据支持五态、基础信息自动保存、八步派生导航、最低材料清单、上传处理反馈/预览/改分类/重命名/删除替换，以及不完整草稿标记。
- 2026-07-11：完成空仓库初始审计，确认无既有代码、Git 历史、未提交变更或敏感数据。
- 阶段 1 已完成：Next.js 16.2.10 / React 19.2.7 / TypeScript 6.0.3 工程、移动端壳层、完整文档、环境变量、SQLite SQL 迁移、统一错误、日志脱敏、Vitest 与 GitHub Actions 已建立。
- 阶段 2-3 已完成：环境变量驱动的开发登录与角色会话、适用性预筛、三态案件字段、案件所有权/复核分配访问、私有本地上传、MIME/魔数/大小/数量/哈希查重/路径校验、授权下载与删除均已实现。
- 阶段 4-6 已完成：可替换提取适配器、Mock 文本提取、Zod 输出校验与重试/人工兜底、用户确认/修改/删除/无法确认审计、证据/用户陈述区分、时间线生成、补充、编辑、排序、删除、证据回链与最终确认已实现。
- 阶段 7-10 已完成：事实—证据矩阵、13 类材料缺口规则、中性表述草稿预览、6 份中文 PDF、完整材料包/精简提交版/完整留存版 ZIP、私有授权下载已实现。
- 阶段 11-12 已完成：复核员隔离队列、提取/时间线/矩阵检查入口、复核说明与标记、受限状态更新、管理员分配/系统状态/审计、四类套餐和无支付测试开通已实现。
- 阶段 13-14 已完成：案件所有权删除确认、原/生成文件清理、数据库级联、脱敏删除摘要、到期/待删除重试命令、仅演示案例重置、全局加载/错误/重试/空状态和移动端布局已实现。
- 阶段 15 已完成：虚构健身案例 E2E、IDOR/上传/路径/CSRF/XSS 数据/SQL 注入/提示注入/密钥扫描/依赖审计已覆盖；发现的中风险依赖已修复。
- 最终质量门槛已完成：全量自动化、生产构建、标准启动、HTTP 200 与安全响应头均已复验，文档已收口。

## 验证记录

- `npm run db:migrate`：通过，应用 `001_initial.sql`。
- `npm run lint`：通过。
- `npm run typecheck`：通过。
- `npm run test:unit`：通过，2 个测试文件、3 个断言。
- `npm run build`：通过，Next.js 生产构建与静态页面生成成功。
- 阶段 2-3 复验：`npm run lint`、`npm run typecheck` 通过；`npm run test` 通过（6 文件、11 测试）；`npm run build` 通过（15 条路由）。
- 集成测试曾发现随机存储键携带扩展名与严格路径片段规则冲突，已改为仅用随机 ID 存储并复验通过。
- 阶段 4-6 复验：`npm run lint`、`npm run typecheck` 通过；`npm run test` 通过（9 文件、18 测试）；`npm run build` 通过。覆盖金额/日期、Schema、提示注入隔离、确认、证据关联、时间线排序与确认。
- 阶段 7-10 复验：`npm run lint`、`npm run typecheck` 通过；`npm run test` 通过（10 文件、20 测试）；`npm run build` 通过。集成测试实际生成 6 份中文 PDF 和 3 个 ZIP，验证 PDF 签名、中文文件名和原始材料目录。
- 初次依赖安装超时留下两个不完整传递依赖，已通过 `npm ci` 按锁文件完整重建并复验通过；CI 同样使用 `npm ci`。
- 阶段 11-12 复验：`npm run lint`、`npm run typecheck` 通过；`npm run test` 通过（11 文件、22 测试）；`npm run build` 通过。覆盖未分配复核员越权、复核审计和管理员无支付测试开通。
- 阶段 13-14 复验：`npm run lint`、`npm run typecheck` 通过；`npm run test` 通过（12 文件、24 测试）；`npm run build` 通过。验证数据库子记录、原文件、生成文件删除、审计脱敏摘要和到期清理不影响未到期案件。
- 删除测试首次与导出测试并行时共享临时目录，已将测试文件改为隔离串行执行并复验，避免清理任务相互干扰。
- 阶段 15：`npm run test` 通过（14 文件、30 测试），完整 E2E 覆盖预筛→创建→3 类材料上传→提取确认→时间线→矩阵→9 个导出→模拟开通→人工复核→完整删除。
- `npm run security:check`：通过，未发现硬编码常见密钥、数据库或上传目录文件。
- `npm audit --omit=dev --audit-level=moderate`：首次发现 PostCSS 中风险；覆盖到 8.5.16 后复审为 `found 0 vulnerabilities`。
- 最新 `npm run lint`、`npm run typecheck`、`npm run security:check`：通过。
- 额度恢复后最终复验：`npm run test` 通过（14 文件、30 测试）；`npm run build` 完整通过；移除不必要的 standalone 输出后 `npm run start` 正常启动，首页 HTTP 200、标题文案、CSP 和 `X-Frame-Options: DENY` 已确认。
- Chrome 扩展已连接，但企业网络策略禁止访问 `localhost`，因此未执行截图式视觉验收；未改用其他浏览器接口绕过。交互路径由完整 E2E 覆盖。
- 开发登录修复：确认 README 的 `change-me-*` 只是 `.env.example` 示例，而当前 `.env.local` 使用 `demo-*-2026`，数据库哈希匹配本地环境但不匹配 README 示例。README 已改为以 `.env.local` 为唯一密码来源，新增 `npm run auth:doctor`，种子已幂等重建。登录专项测试 3/3、全量测试 15 文件/33 测试、最终构建均通过；真实登录接口以当前 reviewer 环境密码返回 HTTP 200、`REVIEWER` 和会话 Cookie，旧示例密码返回 401。
- 角色交互修复：新增统一角色导航、中文身份账号菜单、服务端退出与失败重试、角色默认落点、安全 return-to、受保护页面渲染前判权和复核员案件只读界面；未修改既有 API 授权范围。`npm run auth:doctor`、lint、typecheck、生产构建通过，全量测试 17 文件/45 测试通过。
- 阶段 16 阶段性复验：`npm run demo:assets` 生成 8/8 份资料并人工检查 PNG 水印；数据库迁移和幂等种子通过；lint、typecheck 通过；全量测试 19 文件/50 测试通过。新增 E2E 覆盖字段清空、八份载入、跨用户拒绝、Mock 提取默认待确认、确认、时间线、矩阵、缺口、9 个导出和仅当前用户隔离重置。
- 阶段 16 最终门禁：`npm run auth:doctor`、`npm run lint`、`npm run typecheck`、`npm run security:check`、`npm run test`、`npm run test:e2e`、`npm run build` 全部通过；全量为 19 文件/50 测试，独立 E2E 为 3 文件/5 测试，新增演示页面/API 路由已进入 Next.js 生产构建。未部署、未接入正式支付或生产服务。
- 演示入口故障修复：真实环境确认旧 `demo-case-gym` 仅有 1 份证据和 1 条提取，原按钮只创建/返回案件记录，无法区分 READY 与半成品；迁移或环境未重新加载时还会落入通用错误页。新增 `prepaid-gym-v1` 唯一模板、初始化状态、完整一键载入+提取、失败补偿清理、稳定错误码、`demo:generate-assets`/`demo:seed`/`demo:doctor` 与专项故障注入测试。
- 演示入口故障最终复验：应用 `003_demo_template_state.sql` 后，`demo:doctor` 首次准确报告 PARTIAL、证据 1/8；`demo:seed` 幂等修复为 READY、证据 8/8、提取 18 条，随后自检通过。真实 HTTP 登录、创建/恢复、案件页和提取页均为 200。专项测试 2 文件/9 测试、全量测试 20 文件/58 测试、独立 E2E 3 文件/5 测试以及 auth:doctor、lint、typecheck、security:check、build 全部通过。
- Client DTO/CSP 修复：确认 Node SQLite 查询行的 prototype 为 null，首个错误边界是案件详情 Server Component → EvidenceList Client Component，并审计提取、时间线、矩阵、下载、套餐和管理员面板的同类边界。新增严格 DTO/mappers、敏感存储字段裁剪和环境化 CSP；数据库保持 1 个 READY 演示案件、8 份唯一证据、18 条提取、0 个数据库/文件孤儿，案件处于 PENDING_USER_CONFIRMATION 是等待用户确认 Mock 提取结果的正常状态。
- DTO/CSP 最终复验：真实 Session 下 dashboard、案件详情、提取、时间线、矩阵均 HTTP 200，页面响应不再包含 plain-object 序列化错误；证据 API 仅返回 8 个前端字段且不含 storageKey/sha256。开发 CSP 含 unsafe-eval，生产策略专项测试确认不含。demo:doctor、auth:doctor、lint、typecheck、security:check、全量测试 21 文件/63 测试、独立 E2E 3 文件/5 测试和生产构建全部通过。

## 已知限制

- 当前目标是本地/脱敏测试版，不可直接作为生产系统。
- 默认使用本地 SQLite、私有本地文件存储和 Mock 提取；正式上线需替换并重新安全审查。
- Node 24 的内置 SQLite 当前仍输出实验性 API 警告；只允许用于本地测试，生产迁移 PostgreSQL 是上线前门槛。
- 不接入真实支付、短信、邮件、政府系统或生产数据。
- Mock 模式只解析 TXT 中明确模式；图片/PDF 在没有真实 OCR 适配器时进入人工处理，不会猜测内容。
- 开发登录是本地测试功能，不提供生产级 MFA、账号恢复、持久会话吊销或分布式限流。
- Chrome 扩展的企业策略禁止自动访问 localhost；需要人工浏览器视觉验收时，可在本机打开地址按最终报告的重点页面检查。

## 下一步

无代码阶段待办。建议由项目负责人按最终报告清单进行一次人工视觉验收；正式上线事项仍需单独项目。
