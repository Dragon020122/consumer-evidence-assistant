# AI 工作流与人工确认边界

## 输入与适配层

支持付款订单、合同/服务约定、沟通记录、服务使用记录、商家主体说明和用户补充说明等材料。`ExtractionAdapter` 隔离 OCR/LLM 或 Mock Provider；当前公开演示只启用本地 Mock，不发送材料给第三方。

## 提取契约

每个 Provider 输出都先经过 Zod Schema 校验，包含字段名、值、证据 ID、页/图定位、置信度和人工确认标记。校验失败按 `MODEL_MAX_RETRIES` 重试，仍失败则写入人工处理状态，而不是猜测。

```json
{
  "evidenceId": "fictional-evidence-001",
  "classification": "PAYMENT_ORDER",
  "provider": "mock",
  "requiresManualProcessing": false,
  "fields": [
    {
      "fieldName": "amount",
      "value": 2999,
      "evidenceId": "fictional-evidence-001",
      "sourcePageOrImage": "文本文件",
      "sourceLocator": "第 2 行附近",
      "confidence": 0.88,
      "needsHumanConfirmation": true
    }
  ]
}
```

示例仅使用虚构标识和金额。真实环境中不得把原始敏感内容写入日志或公开 Issue。

## 确认与状态

提取结果可被确认、修改、删除错误项或标记无法确认。确认值、来源、置信度、确认人和时间都会保留；候选结果本身不等于最终事实。案例字段还独立记录证据支持状态：直接支持、部分支持、用户陈述、无支持或冲突。

## 下游整理

1. 已确认值生成时间线候选事件。
2. 用户确认至少一条事件后才能生成事实—证据矩阵。
3. 每条事件关联原始证据，或明确是用户陈述。
4. 缺口规则根据证据类别、已确认字段和事件支持情况提出材料整理建议。
5. 草稿和 PDF/ZIP 均标记为需核对材料，不构成法律意见。

## Prompt injection 与隐私

原始材料是数据，不是指令。模型调用前可对身份证、银行卡、手机号和详细地址做脱敏；Mock 全程本地运行。日志不记录证据原文、令牌、密码或完整个人信息。

## 为什么不生成法律结论

材料是否充分、事实是否成立及应采取何种法律行动需要人类与专业判断。系统只帮助建立可核对的材料结构，不认定违法、不预测结果、不自动提交投诉。
