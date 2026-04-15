/**
 * Prefix each Playwright test() title in all tests/*.spec.ts files with TC01, TC02, ...
 * independently per file (each file restarts at TC01, top-to-bottom).
 *
 * Re-run safe: strips an existing "TCxx - " prefix before re-numbering.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TESTS_DIR = path.join(ROOT, "tests");

/** Full line: indent, test[.skip|...], opening paren, quoted title, rest */
const LINE_TEST_RE =
  /^(\s*)(test(?:\.(?:skip|only|fixme))?)\s*\(\s*(["'`])([\s\S]*?)\3(.*)$/;

function* walkSpecFiles(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walkSpecFiles(p);
    else if (ent.name.endsWith(".spec.ts")) yield p;
  }
}

function stripExistingTc(title) {
  return title.replace(/^\s*TC\d+\s*-\s*/i, "").trim();
}

function countTestsInFile(text) {
  let n = 0;
  for (const line of text.split(/\r?\n/)) {
    if (LINE_TEST_RE.test(line)) n += 1;
  }
  return n;
}

function main() {
  const files = [...walkSpecFiles(TESTS_DIR)].sort((a, b) => a.localeCompare(b));
  let changedFiles = 0;
  let totalTests = 0;

  for (const absPath of files) {
    const raw = fs.readFileSync(absPath, "utf8");
    const lines = raw.split(/\r?\n/);
    const totalInFile = countTestsInFile(raw);
    if (totalInFile === 0) continue;

    const pad = Math.max(2, String(totalInFile).length);
    let idx = 0;
    let fileChanged = false;

    const out = lines.map((line) => {
      const m = line.match(LINE_TEST_RE);
      if (!m) return line;
      const [, indent, kw, quote, title, post] = m;
      const base = stripExistingTc(title);
      idx += 1;
      const code = `TC${String(idx).padStart(pad, "0")}`;
      const newTitle = `${code} - ${base}`;
      fileChanged = true;
      return `${indent}${kw}(${quote}${newTitle}${quote}${post}`;
    });

    if (fileChanged) {
      fs.writeFileSync(absPath, out.join("\n") + "\n", "utf8");
      changedFiles += 1;
      totalTests += totalInFile;
    }
  }

  console.log(
    `Updated ${changedFiles} files; ${totalTests} test titles (${files.length} spec files scanned).`,
  );
}

main();
