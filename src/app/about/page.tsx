export default function AboutPage() {
  return (
    <div style={{ maxWidth: 760 }}>
      <div className="eyebrow">服务说明</div>
      <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>我们整理材料，不替你作结论。</h1>
      <div className="card">
        <h2>适用范围</h2>
        <p>健身、美容美发、培训、摄影、宠物、家政等一般预付服务退费材料整理。</p>
        <h2>暂不支持</h2>
        <p className="muted">医疗、金融、借贷、劳动、刑事、严重人身伤害、婚姻家庭和房屋买卖纠纷；也不提供自动诉讼、举报、律师函或律师撮合。</p>
        <h2>你始终需要做什么</h2>
        <p>确认材料真实、逐项核对提取结果和最终草稿，自行选择是否以及向谁提交。</p>
      </div>
    </div>
  );
}

