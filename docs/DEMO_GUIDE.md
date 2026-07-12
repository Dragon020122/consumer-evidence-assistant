# 本地演示指南

## 准备

```bash
npm ci
copy .env.example .env.local
npm run db:migrate
npm run db:seed
npm run demo:generate-assets
npm run demo:seed
npm run auth:doctor
npm run demo:doctor
npm run dev
```

密码从 `.env.local` 读取，不要在公开文档、截图或录屏中展示。所有账号和材料均为虚构测试数据。

## 普通用户演示

1. 使用 `user@demo.local` 登录。
2. 在“我的案件”选择“使用演示案件体验完整流程”。
3. 打开虚构演示案件，确认可见 8 份带水印的证据。
4. 进入“确认提取结果”，检查 18 项候选值；仅在开发演示模式可使用批量确认快捷操作。
5. 生成并确认至少一条时间线事件。
6. 打开事实—证据矩阵、材料缺口和草稿预览。
7. 在下载中心生成受保护的 PDF/ZIP 材料包。

## 复核员与管理员

- `admin@demo.local`：进入管理后台，为演示案件分配复核员，查看脱敏审计。
- `reviewer@demo.local`：仅能在复核工作台查看分配给自己的案件，不能上传或创建普通案件。

退出后，刷新或访问受保护页面应返回登录路径。演示案件重置只影响当前普通用户自己的虚构数据。
