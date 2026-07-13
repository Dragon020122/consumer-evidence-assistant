import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import PDFDocument from "pdfkit";
import sharp from "sharp";
import { DEMO_MARK, demoAssets } from "../src/lib/demo";
import { registerPdfFont } from "../src/server/pdf-font";

const output = join(process.cwd(), "demo-assets", "prepaid-gym-case");
const details: Record<string, string[]> = {
  payment: ["支付日期：2026年5月15日", "实付金额：2999元", "收款方：星云健康管理有限公司（虚构）", "订单号：DEMO-2026-001", "状态：支付成功（虚构）"],
  "sales-chat": ["2026年5月12日 14:20", "销售（虚构）：年卡服务期为12个月，可使用器械区和团课预约。", "用户（虚构）：我主要想使用器械区，请介绍开放时间。", "销售（虚构）：开放安排以门店当期公示为准。", "说明：本记录不包含确定退费承诺。"],
  "refund-chat": ["2026年7月1日 10:08", "用户（虚构）：因个人安排变化，我希望终止后续健身服务。", "用户（虚构）：请协商退还尚未消费部分费用。", "状态：消息已送达（虚构）"],
  "merchant-reply": ["2026年7月1日 16:42", "门店客服（虚构）：已收到您的反馈。", "门店客服（虚构）：已办理年卡原则上不予退费。", "门店客服（虚构）：如需进一步沟通，可提交使用记录供门店核对。"],
  usage: ["会员：演示用户（虚构）", "服务：健身年卡", "开卡日期：2026年5月15日", "已使用情况：约1个半月，共到店12次（虚构）", "剩余服务：仍有剩余期限，具体以核对结果为准"],
  merchant: ["商家主体：星云健康管理有限公司（虚构）", "门店名称：星云健身天府店（虚构）", "虚构主体编号：DEMO-ENTITY-2026-001", "提示：该编号不是统一社会信用代码，不对应任何真实企业。"],
};

function escapeXml(value: string): string { return value.replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&apos;"})[char]!); }

function svg(title: string, lines: string[]): string {
  const body = lines.map((line, index) => `<text x="82" y="${245 + index * 66}" font-size="30" fill="#17211d">${escapeXml(line)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#f4f1e8"/><rect x="38" y="38" width="1124" height="724" rx="28" fill="#fff" stroke="#1b6b51" stroke-width="4"/><text x="82" y="125" font-size="24" fill="#b34d27" font-weight="700">${escapeXml(DEMO_MARK)}</text><text x="82" y="195" font-size="44" fill="#173f32" font-weight="700">${escapeXml(title)}</text>${body}<text x="82" y="720" font-size="22" fill="#5b6b65">所有人物、主体、编号和交易均为虚构，仅用于本地产品测试。</text></svg>`;
}

async function createAgreement(path: string): Promise<void> {
  const bytes = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size:"A4", margins:{top:54,bottom:54,left:54,right:54} }); const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk))); doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject);
    registerPdfFont(doc);
    doc.fillColor("#b34d27").fontSize(11).text(DEMO_MARK).moveDown();
    doc.fillColor("#173f32").fontSize(20).text("健身年卡服务协议（虚构演示）").moveDown();
    const lines = ["合同编号：DEMO-CONTRACT-001", "商家主体：星云健康管理有限公司（虚构）", "门店名称：星云健身天府店（虚构）", "服务内容：健身年卡，器械区使用及依门店规则预约团课", "支付金额：2999元", "服务期限：2026年5月15日至2027年5月14日", "一般退费说明：用户可向门店提出终止服务与退费协商申请，具体处理以双方核对材料和协商结果为准。", "本材料不构成真实合同，不包含违法认定或确定处理承诺。"];
    doc.fillColor("#17211d").fontSize(12); for (const line of lines) doc.text(line, {lineGap:8}).moveDown(.5); doc.end();
  });
  await writeFile(path, bytes);
}

async function main() {
  await mkdir(output, { recursive:true });
  for (const asset of demoAssets) {
    const target = join(output, asset.fileName);
    if (asset.id === "contract") await createAgreement(target);
    else if (asset.id === "statement") await writeFile(target, `${DEMO_MARK}\n\n商家：星云健康管理有限公司（虚构）\n门店：星云健身天府店（虚构）\n服务：健身年卡\n支付日期：2026年5月15日\n实付 2999 元\n收款方：星云健康管理有限公司（虚构）\n订单号：DEMO-2026-001\n合同号：DEMO-CONTRACT-001\n剩余期限：约10个半月\n退费请求：2026年7月1日提出终止服务并协商退还未消费部分费用\n商家回复：已办理年卡原则上不予退费\n\n以上均为虚构测试陈述，需由用户逐项确认。\n`, "utf8");
    else await sharp(Buffer.from(svg(asset.title, details[asset.id] ?? []))).png().toFile(target);
  }
  console.log(`已生成 ${demoAssets.length} 份虚构演示材料：${output}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
