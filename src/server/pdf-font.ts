import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, extname, resolve } from "node:path";
import type * as PDFKit from "pdfkit";

import { AppError } from "@/lib/errors";

export const PDF_FONT_ALIAS = "NotoSansSC";
export const PDF_FONT_FILE = "NotoSansSC-Regular.otf";

const projectFontPath = resolve(process.cwd(), "assets", "fonts", PDF_FONT_FILE);
const supportedExtensions = new Set([".ttf", ".otf", ".woff", ".woff2"]);

type FontkitFont = { createSubset?: () => unknown };
type FontkitModule = { openSync: (path: string) => FontkitFont };
const fontkit = createRequire(import.meta.url)("fontkit") as FontkitModule;

export interface PdfFontInfo {
  alias: string;
  fileName: string;
  extension: string;
  source: "project-bundled";
  supportsSubset: boolean;
}

export function inspectPdfFont(fontPath = projectFontPath): PdfFontInfo {
  const fileName = basename(fontPath);
  const extension = extname(fontPath).toLowerCase();
  if (!existsSync(fontPath)) {
    throw new AppError("PDF_FONT_MISSING", `项目内 PDF 字体“${fileName}”不存在。请恢复 assets/fonts/${PDF_FONT_FILE}。`, 503);
  }
  if (!supportedExtensions.has(extension)) {
    throw new AppError("PDF_FONT_INVALID", `PDF 字体“${fileName}”必须是单字体 .ttf、.otf、.woff 或 .woff2 文件。`, 503);
  }
  try {
    const font = fontkit.openSync(fontPath);
    if (typeof font.createSubset !== "function") {
      throw new AppError("PDF_FONT_INVALID", `PDF 字体“${fileName}”不支持嵌入子集；请使用单字体文件而非字体集合。`, 503);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("PDF_FONT_INVALID", `无法加载项目内 PDF 字体“${fileName}”。`, 503);
  }
  return { alias: PDF_FONT_ALIAS, fileName, extension, source: "project-bundled", supportsSubset: true };
}

export function registerPdfFont(doc: PDFKit.PDFDocument): PdfFontInfo {
  const info = inspectPdfFont();
  doc.registerFont(info.alias, projectFontPath);
  doc.font(info.alias);
  return info;
}
