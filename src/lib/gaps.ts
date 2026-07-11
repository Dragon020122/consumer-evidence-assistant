import type { EvidenceRow } from "@/server/storage";
import type { ExtractionRow } from "@/server/extraction";
import type { TimelineRow } from "@/server/timeline";
import { isConfirmedField } from "@/lib/field-state";

export interface MaterialGap { code:string;priority:"PRIORITY"|"OPTIONAL"|"UNKNOWN";title:string;recommendation:string;basis:string }

function confirmedValues(extractions:ExtractionRow[],fieldName:string):Array<string|number>{return extractions.filter(x=>x.fieldName===fieldName&&["CONFIRMED","MODIFIED","AI_CONFIRMED","USER_EDITED"].includes(x.state)&&x.confirmedValueJson!==null).map(x=>JSON.parse(x.confirmedValueJson!) as string|number);}
export function detectMaterialGaps(evidence:EvidenceRow[],extractions:ExtractionRow[],timeline:TimelineRow[],details:Record<string,{value:unknown;state:string}>):MaterialGap[]{const gaps:MaterialGap[]=[];const has=(category:string)=>evidence.some(x=>x.category===category);const add=(gap:MaterialGap)=>gaps.push(gap);
if(!has("PAYMENT_ORDER"))add({code:"PAYMENT_MISSING",priority:"PRIORITY",title:"缺少付款或订单记录",recommendation:"建议补充可显示金额、日期、付款方与收款方的付款记录或订单。",basis:"当前材料分类中没有付款与订单材料。"});
if(!has("CONTRACT"))add({code:"CONTRACT_MISSING",priority:"PRIORITY",title:"缺少合同或服务约定",recommendation:"建议补充合同、会员协议、课程约定或可核对的服务条款。",basis:"当前材料分类中没有合同与服务约定。"});
if(!has("REFUND_COMMUNICATION"))add({code:"REFUND_COMMUNICATION_MISSING",priority:"PRIORITY",title:"缺少退费沟通记录",recommendation:"建议补充显示沟通日期、对方身份和完整上下文的退费沟通记录。",basis:"当前材料分类中没有退款沟通。"});
if(!isConfirmedField(details.merchantLegalName?.state)||!details.merchantLegalName?.value)add({code:"MERCHANT_UNCLEAR",priority:"PRIORITY",title:"商家主体尚未明确",recommendation:"建议核对合同、付款收款方、发票或商家公示信息中的主体名称。",basis:"商家主体字段未确认。"});
if(isConfirmedField(details.storeName?.state)&&isConfirmedField(details.merchantLegalName?.state)&&details.storeName.value!==details.merchantLegalName.value)add({code:"STORE_ENTITY_RELATION",priority:"OPTIONAL",title:"门店名称与主体名称不同",recommendation:"建议补充能说明门店与公司主体关系的订单、合同或公示信息。",basis:"已确认的门店名称和商家主体名称不一致；这只是材料核对提示。"});
if(confirmedValues(extractions,"payee").length===0)add({code:"PAYEE_RELATION",priority:"OPTIONAL",title:"收款账户与商家关系待核对",recommendation:"建议确认付款记录中的收款方，并准备其与商家关系的说明材料。",basis:"已确认提取结果中没有收款方字段。"});
if(confirmedValues(extractions,"remainingCount").length===0)add({code:"REMAINING_PROOF",priority:"OPTIONAL",title:"剩余次数或余额缺少客观材料",recommendation:"可补充会员后台、课程记录、消费明细或余额截图。",basis:"已确认提取结果中没有剩余次数/期限字段。"});
if(has("REFUND_COMMUNICATION")&&confirmedValues(extractions,"participants").length===0)add({code:"PARTICIPANT_IDENTITY",priority:"OPTIONAL",title:"对话对方身份待确认",recommendation:"建议保留能显示联系人身份、账号或与商家关系的完整页面。",basis:"沟通材料中未确认对话人物字段。"});
const amountValues=new Set(confirmedValues(extractions,"amount").map(String));if(amountValues.size>1)add({code:"AMOUNT_CONFLICT",priority:"PRIORITY",title:"材料中的金额存在差异",recommendation:"建议逐份核对金额对应的付款、消费或退款含义，不要直接合并。",basis:`发现 ${amountValues.size} 个不同的已确认金额。`});
const dateValues=new Set(confirmedValues(extractions,"date").map(String));if(dateValues.size>1)add({code:"DATE_REVIEW",priority:"UNKNOWN",title:"材料包含多个日期",recommendation:"请确认每个日期分别对应付款、服务、沟通还是其他事件。",basis:`发现 ${dateValues.size} 个不同的已确认日期；不一定构成冲突。`});
if(timeline.length>0&&timeline.every(x=>Boolean(x.isUserStatement)))add({code:"USER_STATEMENT_ONLY",priority:"PRIORITY",title:"目前只有用户陈述",recommendation:"建议优先补充可独立核对的付款、合同、服务使用或沟通材料。",basis:"已确认时间线没有证据支持事件。"});
return gaps;}
