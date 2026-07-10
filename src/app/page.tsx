import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">脱敏测试版 · Evidence workspace</div>
          <h1>把散落的材料，整理成可以逐项核对的事实脉络。</h1>
          <p className="lead">
            面向健身、美容、培训等一般预付服务纠纷。建立时间线、证据目录和材料缺口清单，再生成清楚标记的草稿。
          </p>
          <div className="actions">
            <Link className="button" href="/screening">先做 2 分钟适用性预筛</Link>
            <Link className="button secondary" href="/about">了解工具边界</Link>
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">整理过程</div>
          <div className="steps">
            {["确认是否适用", "上传并分类材料", "逐项确认提取结果", "核对时间线与证据", "下载草稿材料包"].map((item, index) => (
              <div className="step" key={item}>
                <span className="step-number">{index + 1}</span><span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="grid" aria-label="产品原则">
        <article className="card"><h3>事实可追溯</h3><p className="muted">每个事件回到原始证据；无证据内容明确标为用户陈述。</p></article>
        <article className="card"><h3>由你确认</h3><p className="muted">关键字段、时间线和材料草稿都需要用户核对后才能交付。</p></article>
        <article className="card"><h3>不作法律判断</h3><p className="muted">不认定违法，不预测成功率，不计算惩罚性赔偿。</p></article>
      </section>
    </>
  );
}

