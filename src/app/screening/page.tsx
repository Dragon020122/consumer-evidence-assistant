import Link from "next/link";

export default function ScreeningPlaceholderPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <div className="eyebrow">步骤 1 / 9</div>
      <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>案件适用性预筛</h1>
      <div className="card">
        <p>预筛表单将在下一阶段启用。它会先识别工具范围，命中医疗、金融、劳动、刑事或严重人身伤害等排除项时，不会进入自动材料生成。</p>
        <Link className="button secondary" href="/">返回首页</Link>
      </div>
    </div>
  );
}

