# 作品集截图指南

自动截图需要可用的本地浏览器控制环境。若当前环境无法可靠生成，请按本指南在本机完成；所有页面均使用虚构数据，不展示密码、终端或本地绝对路径。

## 公共设置

- 窗口：桌面 `1440 × 960`；移动端 `390 × 844`。
- 启动后使用普通用户虚构演示案件，确保有 8 份材料、18 项提取、至少一条确认时间线、矩阵与导出记录。
- 截图前关闭开发错误浮层和浏览器下载栏；保留“虚构测试材料”标记可见。

| 文件名 | 页面 | 状态与范围 |
| --- | --- | --- |
| `01_cases-dashboard.jpg` | `/dashboard` | USER；显示演示案件卡片和八步入口 |
| `02_evidence-upload.jpg` | `/cases/{caseId}` | 显示证据列表、材料检查清单与虚构水印 |
| `03_extraction-confirmation.jpg` | `/cases/{caseId}/extractions` | 显示 18 项汇总和来源定位 |
| `04_timeline.jpg` | `/cases/{caseId}/timeline` | 至少一条已确认事件和证据回链 |
| `05_evidence-matrix.jpg` | `/cases/{caseId}/matrix` | 显示事实—证据关系 |
| `06_download-center.jpg` | `/cases/{caseId}/downloads` | 显示生成文件，不点开真实下载内容 |
| `07_mobile-workflow.jpg` | `/cases/{caseId}/timeline` | 390px 宽，八步导航与提示 |
| `08_mobile-evidence.jpg` | `/cases/{caseId}` | 390px 宽，证据卡片与上传区域 |

保存到 `docs/assets/screenshots/`，以经过压缩的 PNG 或 JPEG 提交。不要截取登录时的密码输入框。
