/**
 * Scan Playwright *.spec.ts files and write test case names to an Excel workbook
 * grouped by module (tests/<module>/...).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TESTS_DIR = path.join(ROOT, "tests");
const OUT_FILE = path.join(ROOT, "test-cases-by-module.xlsx");

const DESCRIBE_RE =
  /^(\s*)test\.describe(?!\.configure)(?:\.(?:skip|only|serial|fixme))?\s*\(\s*(["'`])([\s\S]*?)\2/;
const TEST_RE =
  /^(\s*)test(?!\.describe)(?:\.(?:skip|only|fixme))?\s*\(\s*(["'`])([\s\S]*?)\2/;

function* walkSpecFiles(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walkSpecFiles(p);
    else if (ent.name.endsWith(".spec.ts")) yield p;
  }
}

function moduleFromPath(absPath) {
  const rel = path.relative(TESTS_DIR, absPath);
  const seg = rel.split(path.sep);
  return seg[0] || "(tests)";
}

function extractRows(absPath) {
  const text = fs.readFileSync(absPath, "utf8");
  const lines = text.split(/\r?\n/);
  let currentSuite = "";
  const rows = [];
  const relFile = path.relative(ROOT, absPath);

  for (const line of lines) {
    const d = line.match(DESCRIBE_RE);
    if (d) {
      currentSuite = d[3].replace(/\s+/g, " ").trim();
      continue;
    }
    const t = line.match(TEST_RE);
    if (t) {
      const title = t[3].replace(/\s+/g, " ").trim();
      rows.push({
        module: moduleFromPath(absPath),
        suite: currentSuite,
        testcase: title,
        file: relFile,
      });
    }
  }
  return rows;
}

function main() {
  const all = [];
  for (const f of walkSpecFiles(TESTS_DIR)) {
    all.push(...extractRows(f));
  }

  all.sort((a, b) => {
    const m = a.module.localeCompare(b.module);
    if (m !== 0) return m;
    const s = a.suite.localeCompare(b.suite);
    if (s !== 0) return s;
    return a.testcase.localeCompare(b.testcase);
  });

  const byMod = new Map();
  for (const r of all) {
    byMod.set(r.module, (byMod.get(r.module) ?? 0) + 1);
  }

  const sheetRows = [["Module", "Suite (describe)", "Test case", "File"]];
  let prevModule = null;
  for (const r of all) {
    if (prevModule !== null && r.module !== prevModule) {
      sheetRows.push([]);
    }
    prevModule = r.module;
    sheetRows.push([r.module, r.suite, r.testcase, r.file]);
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetRows);
  ws["!cols"] = [
    { wch: 16 },
    { wch: 48 },
    { wch: 72 },
    { wch: 40 },
  ];

  const summary = [["Module", "Số testcase"]];
  const mods = [...byMod.keys()].sort((a, b) => a.localeCompare(b));
  for (const m of mods) {
    summary.push([m, byMod.get(m)]);
  }
  summary.push([]);
  summary.push(["T\u1ED5ng c\u1ED9ng", all.length]);

  const wsSum = XLSX.utils.aoa_to_sheet(summary);
  wsSum["!cols"] = [{ wch: 20 }, { wch: 14 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSum, "T\u1ED5ng h\u1EE3p module");
  XLSX.utils.book_append_sheet(wb, ws, "Chi ti\u1EBFt testcase");
  XLSX.writeFile(wb, OUT_FILE);

  console.log(`Wrote ${OUT_FILE} (${all.length} test cases in ${mods.length} modules).`);
}

main();
