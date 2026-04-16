/**
 * Scan Playwright *.spec.ts files and write test case names to an Excel workbook
 * grouped by module (tests/<module>/...).
 * Cột cuối: mô tả tiếng Việt — code expect() đang xác nhận điều gì.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TESTS_DIR = path.join(ROOT, "tests");
const OUT_FILE = path.join(ROOT, "test-cases-by-module.xlsx");

const MAX_EXPECT_CELL_LEN = 3200;

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

function lineIndentLen(line) {
  const m = line.match(/^(\s*)/);
  return m ? m[1].length : 0;
}

function findNextTestLineIndex(lines, testLineIdx) {
  const indent = lineIndentLen(lines[testLineIdx]);
  for (let i = testLineIdx + 1; i < lines.length; i++) {
    if (!TEST_RE.test(lines[i])) continue;
    if (lineIndentLen(lines[i]) === indent) return i;
  }
  return lines.length;
}

function humanizeExpectSnippet(snippet) {
  let s = snippet.replace(/\s+/g, " ").replace(/^await\s+/, "").trim();
  s = s.replace(/^expect\.soft\s*\(/i, "expect(");
  const neg = /\.not\./.test(s);
  const say = (ok, notOk) => (neg ? notOk : ok);
  const parts = [];

  if (/\.toHaveURL\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận URL trang sau thao tác khớp đúng kịch bản (thường dùng regex).",
        "Xác nhận URL trang không rơi vào trạng thái/kịch bản không mong muốn.",
      ),
    );
  }
  if (/\.toBeVisible\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận phần tử (locator) hiển thị được trên màn hình.",
        "Xác nhận phần tử không hiển thị.",
      ),
    );
  }
  if (/\.toBeHidden\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận phần tử đang ẩn (hidden).",
        "Xác nhận phần tử không ở trạng thái ẩn.",
      ),
    );
  }
  if (/\.toContainText\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận vùng chọn chứa đúng nội dung text kỳ vọng (chuỗi hoặc regex).",
        "Xác nhận vùng chọn không chứa nội dung đó.",
      ),
    );
  }
  if (/\.toHaveText\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận toàn bộ text hiển thị của phần tử khớp kỳ vọng.",
        "Xác nhận text hiển thị không khớp kỳ vọng.",
      ),
    );
  }
  if (/\.toHaveValue\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận ô input/select có giá trị đúng như đã nhập/chọn.",
        "Xác nhận giá trị ô input/select không như kỳ vọng.",
      ),
    );
  }
  if (/\.toHaveAttribute\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận phần tử có thuộc tính HTML (attribute) đúng giá trị.",
        "Xác nhận thuộc tính không đúng hoặc không tồn tại như kỳ vọng.",
      ),
    );
  }
  if (/\.toHaveCount\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận số lượng phần tử con (ví dụ số dòng, số option) đúng con số kỳ vọng.",
        "Xác nhận số lượng phần tử không đúng kỳ vọng.",
      ),
    );
  }
  if (/\.toBeChecked\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận checkbox/radio đang được chọn.",
        "Xác nhận checkbox/radio không được chọn.",
      ),
    );
  }
  if (/\.toBeEnabled\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận phần tử có thể tương tác (enabled).",
        "Xác nhận phần tử bị vô hiệu hoặc không enabled.",
      ),
    );
  }
  if (/\.toBeDisabled\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận phần tử bị vô hiệu hóa (disabled).",
        "Xác nhận phần tử không ở trạng thái disabled.",
      ),
    );
  }
  if (/\.toBeFocused\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận phần tử đang được focus.",
        "Xác nhận phần tử không được focus.",
      ),
    );
  }
  if (/\.toHaveClass\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận phần tử có class CSS kỳ vọng.",
        "Xác nhận class CSS không như kỳ vọng.",
      ),
    );
  }
  if (/\.toMatch\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận chuỗi/giá trị khớp mẫu (regex hoặc định dạng).",
        "Xác nhận chuỗi/giá trị không khớp mẫu.",
      ),
    );
  }
  if (/\.toEqual\s*\(/.test(s) || /\.toStrictEqual\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận giá trị (hoặc object) bằng hệt giá trị kỳ vọng (so sánh sâu).",
        "Xác nhận giá trị không bằng kỳ vọng.",
      ),
    );
  }
  if (/\.toBeGreaterThan\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận số lớn hơn ngưỡng cho trước.",
        "Xác nhận số không lớn hơn ngưỡng.",
      ),
    );
  }
  if (/\.toBeLessThan\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận số nhỏ hơn ngưỡng cho trước.",
        "Xác nhận số không nhỏ hơn ngưỡng.",
      ),
    );
  }
  if (/\.toBeGreaterThanOrEqual\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận số lớn hơn hoặc bằng ngưỡng cho trước.",
        "Xác nhận số nhỏ hơn ngưỡng.",
      ),
    );
  }
  if (/\.toBeTruthy\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận biểu thức/giá trị là đúng (truthy) hoặc tồn tại.",
        "Xác nhận giá trị không truthy.",
      ),
    );
  }
  if (/\.toBeFalsy\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận giá trị là sai/rỗng (falsy) theo kỳ vọng.",
        "Xác nhận giá trị không falsy.",
      ),
    );
  }
  if (/\.toBeNull\s*\(/.test(s)) {
    parts.push(
      say("Xác nhận giá trị là null.", "Xác nhận giá trị không phải null."),
    );
  }
  if (/\.toBeUndefined\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận giá trị là undefined.",
        "Xác nhận giá trị không phải undefined.",
      ),
    );
  }
  if (/\.toContain\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận mảng/chuỗi chứa phần tử hoặc đoạn con kỳ vọng.",
        "Xác nhận không chứa phần tử/đoạn đó.",
      ),
    );
  }
  if (/\.toThrow\s*\(/.test(s)) {
    parts.push(
      say(
        "Xác nhận hàm ném lỗi (exception) như kỳ vọng.",
        "Xác nhận hàm không ném lỗi.",
      ),
    );
  }

  if (
    /\.toBe\s*\(/.test(s) &&
    !/\.toBeVisible|\.toBeHidden|\.toBeChecked|\.toBeEnabled|\.toBeDisabled|\.toBeFocused|\.toBeTruthy|\.toBeFalsy|\.toBeNull|\.toBeUndefined|\.toBeGreaterThan|\.toBeLessThan/.test(
      s,
    )
  ) {
    parts.push(
      say(
        "Xác nhận giá trị bằng đúng một giá trị cụ thể (so sánh chặt).",
        "Xác nhận giá trị không bằng giá trị đó.",
      ),
    );
  }

  if (parts.length === 0) {
    const tail = s.length > 180 ? `${s.slice(0, 177)}...` : s;
    return `[[Chưa map được matcher] Tham chiếu code:] ${tail}`;
  }

  return [...new Set(parts)].join(" ");
}

function extractExpectedFromBodyLines(lines, bodyStart, bodyEnd) {
  const snippets = [];
  for (let i = bodyStart; i < bodyEnd; i++) {
    if (!/\bexpect(?:\.soft)?\s*\(/.test(lines[i])) continue;
    let chunk = lines[i];
    let depth =
      (chunk.match(/\(/g) || []).length - (chunk.match(/\)/g) || []).length;
    let j = i;
    while (depth > 0 && j + 1 < bodyEnd) {
      j++;
      chunk += " " + lines[j].trim();
      depth +=
        (lines[j].match(/\(/g) || []).length -
        (lines[j].match(/\)/g) || []).length;
    }
    const one = chunk.replace(/\s+/g, " ").trim();
    if (one) snippets.push(one);
    i = j;
  }
  if (snippets.length === 0) return "";
  const vi = snippets.map(humanizeExpectSnippet);
  let joined = vi.join(" • ");
  if (joined.length > MAX_EXPECT_CELL_LEN) {
    joined = `${joined.slice(0, MAX_EXPECT_CELL_LEN - 3)}...`;
  }
  return joined;
}

function extractRows(absPath) {
  const text = fs.readFileSync(absPath, "utf8");
  const lines = text.split(/\r?\n/);
  let currentSuite = "";
  const rows = [];
  const relFile = path.relative(ROOT, absPath);

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const d = line.match(DESCRIBE_RE);
    if (d) {
      currentSuite = d[3].replace(/\s+/g, " ").trim();
      continue;
    }
    const t = line.match(TEST_RE);
    if (t) {
      const title = t[3].replace(/\s+/g, " ").trim();
      const nextTest = findNextTestLineIndex(lines, li);
      const bodyStart = li + 1;
      const bodyEnd = nextTest;
      const expected = extractExpectedFromBodyLines(lines, bodyStart, bodyEnd);
      rows.push({
        module: moduleFromPath(absPath),
        suite: currentSuite,
        testcase: title,
        file: relFile,
        expected,
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

  const sheetRows = [
    [
      "Module",
      "Suite (describe)",
      "Test case",
      "File",
      "Kỳ vọng (tiếng Việt)",
    ],
  ];
  let prevModule = null;
  for (const r of all) {
    if (prevModule !== null && r.module !== prevModule) {
      sheetRows.push([]);
    }
    prevModule = r.module;
    sheetRows.push([
      r.module,
      r.suite,
      r.testcase,
      r.file,
      r.expected || "(Để trống: không có expect trong spec — chỉ điều hướng hoặc kiểm tra qua page object).",
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetRows);
  ws["!cols"] = [
    { wch: 16 },
    { wch: 48 },
    { wch: 72 },
    { wch: 40 },
    { wch: 95 },
  ];

  const summary = [["Module", "Số testcase"]];
  const mods = [...byMod.keys()].sort((a, b) => a.localeCompare(b));
  for (const m of mods) {
    summary.push([m, byMod.get(m)]);
  }
  summary.push([]);
  summary.push(["Tổng cộng", all.length]);

  const wsSum = XLSX.utils.aoa_to_sheet(summary);
  wsSum["!cols"] = [{ wch: 20 }, { wch: 14 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSum, "Tổng hợp module");
  XLSX.utils.book_append_sheet(wb, ws, "Chi tiết testcase");
  XLSX.writeFile(wb, OUT_FILE);

  console.log(`Wrote ${OUT_FILE} (${all.length} test cases in ${mods.length} modules).`);
}

main();
