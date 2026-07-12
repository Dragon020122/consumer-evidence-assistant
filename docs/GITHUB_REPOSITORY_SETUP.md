# GitHub 仓库设置建议

## 推荐元数据

- **仓库名**：`consumer-evidence-assistant`
- **备选**：`ai-consumer-dispute-evidence-organizer`
- **Description**：`AI-assisted consumer dispute evidence organizer with traceable extraction, human confirmation, RBAC review, and document export.`
- **Topics**：`ai`、`nextjs`、`typescript`、`document-processing`、`human-in-the-loop`、`llm`、`ocr`、`consumer-protection`、`portfolio-project`、`sqlite`

`prisma` 不建议作为 Topic：当前项目实际使用 Node SQLite 与 SQL 迁移，不使用 Prisma。

## 建议操作（本轮未执行）

1. 创建仓库并设置 Description、Topics 和 `docs/assets/social-preview/github-social-preview.png` 作为 Social Preview。
2. 根据维护偏好开启或关闭 Issues；若开启，在模板中提示不要提交个人材料。
3. 开启 Secret Scanning、Push Protection 和 Dependabot Alerts。
4. 推送后观察 CI 首次运行；通过后可 Pin 到 GitHub 个人主页。
5. 如需创建 `v1.0.0-mvp` Release，先决定许可证、确认没有敏感文件，再人工创建；本仓库当前未创建 Tag 或 Release。
