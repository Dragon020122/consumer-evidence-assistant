# GitHub 发布前检查清单

## 已完成的本地准备

- [x] README、案例复盘、AI、安全、测试、面试与发布文档。
- [x] `.env.local`、数据库、日志、缓存、私有文件和导出物被忽略。
- [x] 公开仓库安全审计、CI 与 Dependabot 配置。
- [x] 版本统一为 package `1.0.0`、展示标签 `v1.0.0-mvp`。
- [x] 本地质量门禁通过。

## 发布前由维护者完成

- [ ] 再次运行 `git status --ignored --short`，确认不含本地环境或私有材料。
- [ ] 决定许可证：**A. MIT License**（允许使用、修改与分发）或 **B. 暂不添加许可证**（公开查看但默认不授予复用权）。
- [ ] 阅读 [GitHub 仓库设置](GITHUB_REPOSITORY_SETUP.md)，在 GitHub 设置 Description、Topics、Social Preview、Secret Scanning、Push Protection、Dependabot Alerts。
- [ ] 按 [截图指南](SCREENSHOT_GUIDE.md) 检查或补拍展示素材。
- [ ] 如需视频，按 [录屏脚本](DEMO_RECORDING_SCRIPT.md) 人工录制，不展示密码或本地路径。
- [ ] 审阅 `SECURITY.md` 后再推送；不要在 Issue 中接收真实争议材料。

本轮不会推送、创建远程仓库、创建 Tag、创建 Release 或部署。
