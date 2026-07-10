import { describe, expect, it } from "vitest"; import { evaluateScreening } from "@/lib/screening";
const base={disputeType:"GYM" as const,amountYuan:2999,isConsumerService:true,merchantOperating:"YES" as const,hasPaymentRecord:true,hasContractOrChat:true,desiredOutcome:"整理材料并协商",hasNegotiated:true,excludedArea:"NONE" as const};
describe("适用性预筛",()=>{it("允许一般预付服务",()=>{expect(evaluateScreening(base).eligible).toBe(true)});it("阻止医疗纠纷进入生成流程",()=>{const result=evaluateScreening({...base,excludedArea:"MEDICAL"});expect(result.eligible).toBe(false);expect(result.safetyNotice).toBeTruthy()})});

