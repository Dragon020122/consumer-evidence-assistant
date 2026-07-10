import{describe,expect,it}from"vitest";import{sortTimeline,timelineEventInputSchema}from"@/lib/timeline";
describe("时间线规则",()=>{it("日期升序且未知日期最后",()=>{expect(sortTimeline([{eventDate:null,id:"c"},{eventDate:"2026-05-01",id:"b"},{eventDate:"2026-01-01",id:"a"}]).map(x=>x.id)).toEqual(["a","b","c"])});it("证据事件必须有关联材料",()=>{expect(()=>timelineEventInputSchema.parse({eventDate:"2026-01-01",dateEnd:null,description:"支付 2999 元",eventType:"PAYMENT",amountYuan:2999,sourceType:"EVIDENCE",evidenceIds:[],isUserStatement:false})).toThrow("证据支持事件必须关联原始证据")})});

