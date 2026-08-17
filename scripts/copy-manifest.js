import { copyFileSync } from "fs";
import { resolve } from "path";

const src = resolve(process.cwd(), "manifest.json");
const dest = resolve(process.cwd(), "dist/manifest.json");

copyFileSync(src, dest);
console.log("manifest.json -> dist/manifest.json 복사 완료");
