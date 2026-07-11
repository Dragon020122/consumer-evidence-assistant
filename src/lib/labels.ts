export const caseStatusLabels: Record<string, string> = {
  DRAFT:"待填写",PENDING_UPLOAD:"待上传",PENDING_EXTRACTION:"待提取",EXTRACTING:"提取中",PENDING_USER_CONFIRMATION:"待用户确认",
  PENDING_TIMELINE_CONFIRMATION:"待确认时间线",PENDING_GENERATION:"待生成",PENDING_MANUAL_REVIEW:"待人工复核",WAITING_MORE_MATERIALS:"等待补充材料",
  COMPLETED:"已完成",CLOSED:"已关闭",PENDING_DELETION:"待删除",DELETED:"已删除"
};
export const fieldStateLabels: Record<string, string> = { CONFIRMED:"已确认",PENDING:"待确认",UNKNOWN:"无法确认",MODIFIED:"已修改",DELETED:"已删除",MANUAL_REQUIRED:"待人工处理" };
export const evidenceCategoryLabels: Record<string, string> = { PAYMENT_ORDER:"付款与订单",CONTRACT:"合同与服务约定",PROMISE:"宣传与商家承诺",REFUND_COMMUNICATION:"退款沟通",SERVICE_USAGE:"服务使用记录",MERCHANT_STATUS:"商家经营状态",USER_STATEMENT:"用户补充说明",OTHER:"其他材料" };
export const extractionFieldLabels: Record<string, string> = { date:"日期",time:"时间",amount:"金额",merchantName:"商家名称",storeName:"门店名称",payer:"付款方",payee:"收款方",orderNumber:"订单号",contractNumber:"合同号",serviceName:"服务名称",serviceCount:"服务次数",remainingCount:"剩余次数/期限",merchantPromise:"商家承诺",refundRequest:"退费请求",merchantResponse:"商家回复",participants:"对话人物",summary:"材料摘要" };

