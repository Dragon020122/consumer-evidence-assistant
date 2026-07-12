import { DEMO_MARK } from "@/lib/demo";
import { isConfirmedField, normalizeDetails } from "@/lib/field-state";
import { AppError } from "@/lib/errors";
import { detectMaterialGaps, type MaterialGap } from "@/lib/gaps";
import type { SessionUser } from "@/server/auth";
import { getCaseForActor } from "@/server/cases";
import { listEvidence } from "@/server/storage";
import { listExtractions } from "@/server/extraction";
import { listTimeline } from "@/server/timeline";
import { listMatrix } from "@/server/matrix";

export interface MaterialBundle { title:string;disclaimer:string;summary:string[];timeline:string[];evidenceCatalog:string[];matrix:string[];gaps:MaterialGap[];drafts:Array<{title:string;paragraphs:string[]}> }
const labels:Record<string,string>={merchantLegalName:"商家主体",storeName:"门店",serviceName:"服务",paymentAmountYuan:"支付金额",paymentDate:"支付日期",merchantResponse:"商家回复",desiredResolution:"用户诉求"};
function neutral(value:string):string{return value.replace(/诈骗|欺诈|违法|恶意/g,"[需核对的评价性表述]");}

export function buildMaterials(actor:SessionUser,caseId:string):MaterialBundle{
  const item=getCaseForActor(actor,caseId);const confirmedTimeline=listTimeline(actor,caseId).filter(x=>x.isConfirmed);if(!confirmedTimeline.length)throw new AppError("TIMELINE_NOT_CONFIRMED","至少需要一条已确认时间线才能生成草稿。请先到“确认时间线”补充或确认事件；材料类别不齐可以暂时跳过，导出会标记为材料不完整。",409);
  const details=normalizeDetails(JSON.parse(item.detailsJson));const evidence=listEvidence(actor,caseId);const extractions=listExtractions(actor,caseId);const timeline=confirmedTimeline;const matrix=listMatrix(actor,caseId);const gaps=detectMaterialGaps(evidence,extractions,timeline,details);
  const detailLines=Object.entries(labels).map(([key,label])=>`${label}：${isConfirmedField(details[key]?.state)&&details[key]?.value!==null?neutral(String(details[key].value)):"待确认"}`);
  const timelineLines=timeline.map((event,index)=>`${index+1}. ${event.eventDate??"日期待确认"}｜${neutral(event.description)}｜${event.isUserStatement?"用户陈述":`证据 ${event.evidenceIds.map(id=>evidence.findIndex(x=>x.id===id)+1).join("、")}`}`);
  const evidenceLines=evidence.map((file,index)=>`${index+1}. ${file.originalName}｜${file.category}｜文件ID ${file.id}｜对应事实请见矩阵`);
  const matrixLines=matrix.map((row,index)=>`${index+1}. ${neutral(row.claim)}｜${row.sufficiency}｜证据 ${row.evidenceIds.length?row.evidenceIds.map(id=>evidence.findIndex(x=>x.id===id)+1).join("、"):"无"}｜缺口 ${row.missingMaterials.join("、")||"无"}`);
  const disclaimer=`${item.isDemo?DEMO_MARK+"｜":""}草稿｜请逐项核对。${gaps.some(g=>g.priority==="PRIORITY")?"材料不完整｜以下结果仅为初步整理版本。":""}仅用于材料整理，不构成法律意见，不保证协商、投诉或退款结果。`;
  const resolution=isConfirmedField(details.desiredResolution?.state)?neutral(String(details.desiredResolution.value)):"待本人补充确认";
  return{title:item.title,disclaimer,summary:detailLines,timeline:timelineLines,evidenceCatalog:evidenceLines,matrix:matrixLines,gaps,drafts:[
    {title:"商家协商事实说明（草稿）",paragraphs:[`本人就“${neutral(item.title)}”相关消费服务事项整理如下事实。`,...detailLines,`现有材料及事件经过见所附证据目录与时间线。本人希望：${resolution}。`,`以上内容由本人核对后使用；如与原始材料不一致，以原始材料为准。`]},
    {title:"平台客服申诉事实说明（草稿）",paragraphs:["以下仅陈述已确认的交易和沟通过程，请平台结合原始材料自行核验。",...timelineLines,"附件目录与事实—证据矩阵列明了每项材料的对应关系。"]},
    {title:"一般消费投诉事实说明（草稿）",paragraphs:["以下为用户拟提交的事实材料草稿，不包含违法认定或结果请求之外的法律结论。",...timelineLines,`用户诉求：${resolution}。`]},
    {title:"供专业人员查看的案件摘要（草稿）",paragraphs:[...detailLines,`现有证据 ${evidence.length} 份，已确认事件 ${timeline.length} 条，材料缺口 ${gaps.length} 项。`,"请专业人员以原始文件和用户确认记录为准独立判断。"]}
  ]};
}
