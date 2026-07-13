import { describe, expect, it } from "vitest";

import { createChinesePdf } from "@/server/export";
import { inspectPdfFont, PDF_FONT_FILE } from "@/server/pdf-font";

describe("跨平台 PDF 中文字体", () => {
  it("始终使用仓库内的单字体 OTF，而不探测操作系统字体", () => {
    const font = inspectPdfFont();

    expect(font).toEqual({
      alias: "NotoSansSC",
      fileName: PDF_FONT_FILE,
      extension: ".otf",
      source: "project-bundled",
      supportsSubset: true
    });
  });

  it("字体缺失时给出稳定的应用错误", () => {
    expect(() => inspectPdfFont("assets/fonts/missing-font.otf")).toThrow("项目内 PDF 字体“missing-font.otf”不存在");
  });

  it.each(["中文案件摘要", "中文事件时间线", "事实—证据矩阵"])("可真实生成 %s PDF", async (title) => {
    const bytes = await createChinesePdf(title, [{ heading: "虚构测试材料", lines: ["该内容仅用于产品测试，不构成法律意见。"] }]);

    expect(bytes.subarray(0, 4).toString()).toBe("%PDF");
    expect(bytes.byteLength).toBeGreaterThan(1_000);
  });
});
