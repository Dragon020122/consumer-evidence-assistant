export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 760 }}>
      <div className="eyebrow">隐私与免责声明</div>
      <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>材料属于你，判断也属于你。</h1>
      <div className="card">
        <p className="notice">这是本地脱敏测试版。不要上传真实身份证、银行卡、详细住址或无关第三人的信息。</p>
        <h2>数据处理</h2>
        <p>测试版把文件保存在非公开本地目录，通过服务端权限检查访问。默认 Mock 模式不把材料发送给外部 OCR 或模型服务。</p>
        <h2>删除</h2>
        <p>你可以从案件页删除案件。系统会删除关联数据库记录、原文件、生成文件和中间结果，仅保留不含材料内容的操作摘要。</p>
        <h2>能力边界</h2>
        <p>输出均为待核对草稿，不构成法律意见，不保证协商、投诉或退款结果。</p>
      </div>
    </div>
  );
}

