#!/usr/bin/env node
/**
 * Mở Allure cho lần chạy gần nhất: tìm allure-results / allure-results-api trên nhiều “gốc”
 * (cwd, thư mục chứa script, các thư mục cha của cwd) để khớp với chỗ Playwright thực sự ghi file.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Các thư mục gốc có thể chứa allure-results (tránh lệch cwd vs vị trí script). */
function candidateRoots() {
  const roots = [];
  const seen = new Set();

  const add = (p) => {
    const abs = path.resolve(p);
    if (seen.has(abs)) return;
    seen.add(abs);
    roots.push(abs);
  };

  add(process.cwd());
  add(path.join(__dirname, ".."));

  let d = path.resolve(process.cwd());
  const fsRoot = path.parse(d).root;
  for (let i = 0; i < 14 && d !== fsRoot; i++) {
    add(d);
    d = path.dirname(d);
  }
  return roots;
}

/** Thời sửa mới nhất trong thư mục (file trực tiếp); không có file → -1 */
function dirLatestMtime(absDir) {
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) return -1;
  let max = -1;
  for (const name of fs.readdirSync(absDir)) {
    try {
      const st = fs.statSync(path.join(absDir, name));
      if (st.isFile() && st.mtimeMs > max) max = st.mtimeMs;
    } catch {
      /* bỏ qua */
    }
  }
  return max;
}

/** Thư mục results tốt nhất cho một tên (mtime mới nhất giữa mọi ứng viên). */
function bestResultsDir(resultsFolderName) {
  let bestPath = null;
  let bestTime = -1;
  for (const r of candidateRoots()) {
    const p = path.join(r, resultsFolderName);
    const t = dirLatestMtime(p);
    if (t > bestTime) {
      bestTime = t;
      bestPath = p;
    }
  }
  return bestTime >= 0 ? { path: bestPath, mtime: bestTime } : null;
}

const e2e = bestResultsDir("allure-results");
const api = bestResultsDir("allure-results-api");

let chosen;
if (!e2e && !api) {
  console.error(
    "Chưa có Allure results. Chạy test trước (npm test hoặc npm run test:api).",
  );
  console.error("Đã thử các gốc:", candidateRoots().join("; "));
  process.exit(1);
}
if (!e2e) chosen = api.path;
else if (!api) chosen = e2e.path;
else chosen = api.mtime > e2e.mtime ? api.path : e2e.path;

/* Allure 3: đường dẫn tuyệt đối bị nối sai với cwd — phải dùng tên thư mục + cwd = project root. */
const projectRoot = path.dirname(chosen);
const resultsFolderName = path.basename(chosen);

const r = spawnSync("npx", ["allure", "open", resultsFolderName], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: false,
});
process.exit(r.status ?? 1);
