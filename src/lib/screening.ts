import { screeningInputSchema, screeningResultSchema, type ScreeningInput, type ScreeningResult } from "@/lib/schemas";

const supportedMaterials: Record<ScreeningInput["disputeType"], string[]> = {
  GYM: ["付款记录", "会员协议或服务约定", "剩余次数/期限记录", "退费沟通记录"],
  BEAUTY: ["付款记录", "项目/疗程约定", "消费与剩余项目记录", "退费沟通记录"],
  TRAINING: ["付款记录", "课程合同", "上课与剩余课时记录", "退费沟通记录"],
  PHOTOGRAPHY: ["付款记录", "订单与交付约定", "商家承诺", "退费沟通记录"],
  PET: ["付款记录", "服务约定", "服务使用记录", "退费沟通记录"],
  HOUSEKEEPING: ["付款记录", "服务约定", "服务使用记录", "退费沟通记录"],
  OTHER: ["付款记录", "服务约定", "商家主体信息", "退费沟通记录"]
};

export function evaluateScreening(raw: ScreeningInput): ScreeningResult {
  const input = screeningInputSchema.parse(raw);
  const reasons: string[] = [];
  if (input.excludedArea !== "NONE") reasons.push("纠纷类型超出本测试版支持范围");
  if (!input.isConsumerService) reasons.push("当前事项不是一般消费服务");
  const eligible = reasons.length === 0;
  const result: ScreeningResult = {
    eligible,
    reasons: eligible ? ["属于本工具当前支持的一般预付消费材料整理范围"] : reasons,
    suggestedMaterials: eligible ? supportedMaterials[input.disputeType] : [],
    safetyNotice: eligible
      ? null
      : "本工具不会继续自动生成材料。请根据事项类型选择合适的专业机构或正式渠道；如有紧急人身安全风险，请优先联系当地紧急服务。",
    boundary: "本工具只整理用户提供的材料，不作违法认定，不提供法律结论，也不保证协商、投诉或退款结果。"
  };
  return screeningResultSchema.parse(result);
}

