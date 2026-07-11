import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const ignored = new Set([".git", ".next", ".npm-cache", "node_modules", "coverage", "storage", "generated", ".data"]);
const findings = [];
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /(?:api[_-]?key|client[_-]?secret)\s*[:=]\s*["'][^"']{12,}["']/i
];

function scan(directory) {
  for (const name of readdirSync(directory)) {
    if (ignored.has(name)) continue;
    const path = join(directory, name); const stat = statSync(path);
    if (stat.isDirectory()) { scan(path); continue; }
    const rel = relative(root, path).replaceAll("\\", "/");
    if (rel === ".env" || rel.endsWith(".db") || rel.startsWith("storage/") || rel.startsWith("generated/")) findings.push(`${rel}: 不应提交的数据文件`);
    if (stat.size > 2_000_000) continue;
    const content = readFileSync(path, "utf8");
    for (const pattern of secretPatterns) if (pattern.test(content)) findings.push(`${rel}: 命中疑似密钥模式 ${pattern}`);
  }
}

scan(root);
if (findings.length) { console.error(findings.join("\n")); process.exitCode = 1; }
else console.log("安全扫描通过：未发现硬编码私钥、常见 API 密钥、数据库或上传目录文件。");
