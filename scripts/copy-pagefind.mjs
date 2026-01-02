import { cpSync, rmSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const src = resolve("dist", "pagefind");
const dest = resolve("public", "pagefind");

if (!existsSync(src)) {
  console.warn(`[copy-pagefind] Source directory "${src}" not found.`);
  process.exit(0);
}

if (existsSync(dest)) {
  rmSync(dest, { recursive: true, force: true });
}

cpSync(src, dest, { recursive: true });
