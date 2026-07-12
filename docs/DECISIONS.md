# 技术决策记录

## ADR-001：Next.js App Router + TypeScript

选择维护活跃、全栈同仓且适合响应式 UI 的 Next.js；服务端 Route Handlers 统一执行权限与数据校验。使用严格 TypeScript 和 Zod 降低结构化数据漂移风险。

## ADR-002：测试版使用 Node SQLite

空仓库且目标要求无外部密钥即可启动。Node 24 内置 `node:sqlite` 可减少本地依赖与服务成本，SQL 迁移可执行，满足单机脱敏测试。数据访问集中在仓储层。代价是并发、备份和生产运维能力有限，正式上线前必须迁移 PostgreSQL 并回归事务语义。

## ADR-003：适配器优先

文件存储、OCR、模型提取和导出均通过接口隔离。默认 Mock 提取和私有本地存储，不绑定付费供应商；生产适配器必须经过单独的数据处理与安全评估。

## ADR-004：开发认证

测试版提供仅在非生产环境且 `DEV_AUTH_ENABLED=true` 时可用的密码登录。密码与签名密钥来自服务端环境变量，前端不包含默认密码；生产环境代码路径强制禁用。

## ADR-005：不接入正式支付

只实现套餐/订单状态结构和管理员测试开通，不采集银行卡或真实支付信息。

## ADR-006：演示模式采用服务端双重守卫

演示功能只有在 `DEMO_MODE_ENABLED=true` 且 `NODE_ENV` 不是 `production` 时可用。页面可见性只是体验层，所有创建、载入、重置和模拟处理接口必须再次执行同一服务端守卫及案件所有权校验。演示资料由仓库脚本重复生成，全部使用虚构信息和醒目标记。

## ADR-007：字段确认与证据支持正交存储

案件详情字段使用 `EMPTY/USER_CONFIRMED/AI_PENDING/AI_CONFIRMED/USER_EDITED/UNABLE_TO_CONFIRM/CONFLICT` 表达内容确认来源，并使用独立 `DIRECT/PARTIAL/USER_STATEMENT/NONE/CONFLICT` 表达证据支持。旧 `CONFIRMED/PENDING/UNKNOWN` 在读取与迁移时分别兼容映射，避免历史测试数据失效。AI 提取仍保留逐条来源和人工确认审计。

## ADR-008：派生工作流而非复制状态机

数据库 `cases.status` 继续表达后台处理阶段；普通用户八步导航由案件字段、证据类别、提取、时间线、矩阵和导出实时派生。这样避免两套状态机漂移，并能同时显示“进行中、已完成、需补充、存在冲突”。材料缺口默认软提醒，只有缺少技术上无法继续的输入时才硬阻断。

## ADR-009：演示模板幂等初始化与补偿清理

演示案件以 `owner_id + demo_template_key` 唯一标识，并记录 `demo_setup_state`。只有案件、8 份通过普通上传校验的证据和 Mock 提取结果全部完成后才标为 `READY`；重复请求直接恢复 READY 案件。发现旧版 PARTIAL/FAILED 案件时只重建当前用户该模板。文件或提取中途失败时删除本次案件、数据库子记录和已写私有文件；环境、迁移、资产、存储和初始化错误使用稳定代码，不返回堆栈、绝对路径或敏感配置。

## ADR-010：显式 Client DTO 边界

Node SQLite 查询行使用 null prototype，不能直接作为 React Client Component props。所有案件、证据、提取、时间线、矩阵、缺口和生成文档必须经过 Zod 严格 DTO mapper；套餐、订单、复核员选项和管理员案件列表同样处理。DTO 显式转换日期、BigInt 和 Decimal，拒绝 Buffer，并移除 `storageKey`、摘要哈希等客户端不需要的内部字段。受保护文件继续只通过鉴权接口访问，不采用 `JSON.parse(JSON.stringify(...))` 规避类型问题。

## ADR-011：开发 CSP 与生产 CSP 分离

React/Next 开发调试需要 eval source map，因此仅 `NODE_ENV=development` 的 `script-src` 加入 `'unsafe-eval'`。生产和测试策略不包含该指令；原有同源、对象禁用、frame ancestors、表单和资源限制保持不变。修改 Next 配置后必须重启开发服务。

## ADR-012：八步进度由服务端单一派生并以确认事件解锁后续材料

案件数据库状态继续用于后台处理和审计，不能直接作为 UI 进度。`src/server/workflow.ts` 统一汇总字段、证据、提取结果、时间线、矩阵、缺口和导出文件，生成固定八步状态，避免导航和各页面独立推测导致漂移。未处理的提取结果是“需确认”，不是“未开始”；第 5 步未生成时间线时明确引导回第 4 步；至少一条经用户确认的时间线事件才能生成矩阵和草稿。开发演示的批量确认/重生成功能保持在同一服务端权限、演示开关、所有权和审计边界内，不能用于正式环境或普通案件。
