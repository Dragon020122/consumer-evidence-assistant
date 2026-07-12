# GitHub 发布前检查清单

## 已完成的本地准备

- [x] README、案例复盘、AI、安全、测试、面试与发布文档。
- [x] `.env.local`、数据库、日志、缓存、私有文件和导出物被忽略。
- [x] 公开仓库安全审计、CI 与 Dependabot 配置。
- [x] 版本统一为 package `1.0.0`、展示标签 `v1.0.0-mvp`。
- [x] 本地质量门禁通过。

## 发布前由维护者完成

- [ ] 再次运行 `git status --ignored --short`，确认不含本地环境或私有材料。
- [x] 许可证决定：**B. 暂不添加许可证**；本仓库仅作为公开求职作品展示，默认不授予他人复制、修改或再分发权利。
- [ ] 阅读 [GitHub 仓库设置](GITHUB_REPOSITORY_SETUP.md)，在 GitHub 设置 Description、Topics、Social Preview、Secret Scanning、Push Protection、Dependabot Alerts。
- [x] 已检查并加入 6 张桌面端与 2 张移动端虚构演示截图；README 已展示核心页面。
- [ ] 如需视频，按 [录屏脚本](DEMO_RECORDING_SCRIPT.md) 人工录制，不展示密码或本地路径。
- [ ] 审阅 `SECURITY.md` 后再推送；不要在 Issue 中接收真实争议材料。

本轮不会推送、创建远程仓库、创建 Tag、创建 Release 或部署。
