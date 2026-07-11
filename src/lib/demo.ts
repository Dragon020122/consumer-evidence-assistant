import { join } from "node:path";
import type { AppEnv } from "@/lib/env";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";
import type { EvidenceCategory } from "@/lib/schemas";

export const DEMO_MARK = "虚构测试材料｜仅用于产品演示｜不可用于真实投诉";
export const DEMO_CASE_TITLE = "虚构测试案件｜星云健身天府店年卡材料整理";
export const DEMO_TEMPLATE_KEY = "prepaid-gym-v1";

export interface DemoAsset {
  id: string;
  fileName: string;
  category: EvidenceCategory;
  mimeType: string;
  title: string;
  reason: string;
}

export const demoAssets: DemoAsset[] = [
  { id:"payment", fileName:"01_付款订单.png", category:"PAYMENT_ORDER", mimeType:"image/png", title:"付款订单", reason:"核对付款日期、金额、收款方和订单号" },
  { id:"contract", fileName:"02_健身年卡服务协议.pdf", category:"CONTRACT", mimeType:"application/pdf", title:"健身年卡服务协议", reason:"核对服务期限、内容、金额和一般退费说明" },
  { id:"sales-chat", fileName:"03_销售沟通记录.png", category:"PROMISE", mimeType:"image/png", title:"销售沟通记录", reason:"说明购买前介绍的服务内容，不推定法律承诺" },
  { id:"refund-chat", fileName:"04_首次提出退费聊天记录.png", category:"REFUND_COMMUNICATION", mimeType:"image/png", title:"首次提出退费聊天记录", reason:"核对用户提出终止服务及退费的时间和内容" },
  { id:"merchant-reply", fileName:"05_商家回复聊天记录.png", category:"REFUND_COMMUNICATION", mimeType:"image/png", title:"商家回复聊天记录", reason:"保留商家的实际中性回复" },
  { id:"usage", fileName:"06_服务使用记录.png", category:"SERVICE_USAGE", mimeType:"image/png", title:"服务使用记录", reason:"说明已使用期间及仍有剩余服务" },
  { id:"merchant", fileName:"07_商家主体说明.png", category:"MERCHANT_STATUS", mimeType:"image/png", title:"商家主体说明", reason:"区分门店名称和虚构商家主体" },
  { id:"statement", fileName:"08_用户补充说明.txt", category:"USER_STATEMENT", mimeType:"text/plain", title:"用户补充说明", reason:"记录只能由用户确认的购买、使用和退费经过" },
];

export function demoModeEnabled(env: AppEnv = getEnv()): boolean {
  return env.NODE_ENV !== "production" && env.DEMO_MODE_ENABLED === "true";
}

export function assertDemoMode(env: AppEnv = getEnv()): void {
  if (!demoModeEnabled(env)) throw new AppError("DEMO_MODE_DISABLED", "演示测试功能未启用", 404);
}

export function demoAssetPath(fileName: string): string {
  return join(process.cwd(), "demo-assets", "prepaid-gym-case", fileName);
}
