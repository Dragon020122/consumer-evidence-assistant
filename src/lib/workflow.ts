export type WorkflowStatus="NOT_STARTED"|"IN_PROGRESS"|"COMPLETED"|"NEEDS_INPUT"|"CONFLICT";
export interface WorkflowSnapshot{fieldCount:number;confirmedFieldCount:number;fieldConflictCount:number;evidenceCount:number;evidenceCategories:string[];extractionCount:number;pendingExtractionCount:number;timelineCount:number;timelineConfirmed:boolean;matrixCount:number;priorityGapCount:number;exportCount:number}
export interface WorkflowStep{id:number;label:string;href:string;status:WorkflowStatus;note:string}
export function deriveWorkflow(caseId:string,s:WorkflowSnapshot):WorkflowStep[]{const has=(x:string)=>s.evidenceCategories.includes(x);const recommended=[has("PAYMENT_ORDER"),has("MERCHANT_STATUS")||has("CONTRACT"),has("REFUND_COMMUNICATION")];const missing=recommended.filter(x=>!x).length;return[
  {id:1,label:"适用性检查",href:"/screening",status:"COMPLETED",note:"已通过工具适用范围检查"},
  {id:2,label:"创建案件",href:`/cases/${caseId}`,status:s.fieldConflictCount?"CONFLICT":s.confirmedFieldCount?"COMPLETED":"NEEDS_INPUT",note:`已确认 ${s.confirmedFieldCount}/${s.fieldCount} 项基础信息`},
  {id:3,label:"上传证据",href:`/cases/${caseId}`,status:missing===0?"COMPLETED":s.evidenceCount?"NEEDS_INPUT":"NOT_STARTED",note:missing?`最低建议材料还缺 ${missing} 类；可暂时继续`:`最低建议材料已齐，现有 ${s.evidenceCount} 份`},
  {id:4,label:"确认提取结果",href:`/cases/${caseId}/extractions`,status:s.extractionCount===0?"NOT_STARTED":s.pendingExtractionCount?"NEEDS_INPUT":"COMPLETED",note:s.extractionCount?`${s.extractionCount-s.pendingExtractionCount}/${s.extractionCount} 项已处理`:"尚未开始 Mock 提取"},
  {id:5,label:"确认时间线",href:`/cases/${caseId}/timeline`,status:s.timelineConfirmed?"COMPLETED":s.timelineCount?"IN_PROGRESS":"NOT_STARTED",note:s.timelineConfirmed?"时间线已由用户确认":s.timelineCount?"时间线待核对":"尚未生成时间线"},
  {id:6,label:"查看证据矩阵",href:`/cases/${caseId}/matrix`,status:s.matrixCount?"COMPLETED":"NOT_STARTED",note:s.matrixCount?`已生成 ${s.matrixCount} 项事实证据关系`:"确认时间线后生成"},
  {id:7,label:"补充材料",href:`/cases/${caseId}/gaps`,status:s.priorityGapCount?"NEEDS_INPUT":s.evidenceCount?"COMPLETED":"NOT_STARTED",note:s.priorityGapCount?`有 ${s.priorityGapCount} 项建议优先补充；不会阻止查看初步结果`:"未发现优先缺口"},
  {id:8,label:"生成和下载",href:`/cases/${caseId}/downloads`,status:s.exportCount?"COMPLETED":s.timelineConfirmed?"IN_PROGRESS":"NOT_STARTED",note:s.exportCount?`已有 ${s.exportCount} 个导出文件`:"最低技术条件：至少确认一条时间线"}
]}
