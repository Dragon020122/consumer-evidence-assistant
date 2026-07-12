import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const source = resolve("docs/assets/social-preview/github-social-preview.svg");
const output = resolve("docs/assets/social-preview/github-social-preview.png");
await mkdir(dirname(output), { recursive: true });
await sharp(source).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(output);
console.log("Generated docs/assets/social-preview/github-social-preview.png");
