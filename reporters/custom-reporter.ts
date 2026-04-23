import path from "node:path";
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

/** True when we should emit ANSI colors (TTY, or FORCE_COLOR; respect NO_COLOR). */
function colorsEnabled(): boolean {
  if (process.env.NO_COLOR != null && process.env.NO_COLOR !== "") {
    return false;
  }
  if (
    process.env.FORCE_COLOR === "1" ||
    process.env.FORCE_COLOR === "2" ||
    process.env.FORCE_COLOR === "3"
  ) {
    return true;
  }
  if (process.env.FORCE_COLOR === "0") {
    return false;
  }
  return process.stdout.isTTY === true;
}

const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
} as const;

function paint(text: string, open: string, enabled: boolean): string {
  return enabled ? `${open}${text}${C.reset}` : text;
}

/** Width for status + START so columns line up (fits INTERRUPTED). */
const PHASE_WIDTH = 12;
/** Min width for spec basename column (truncates very long names). */
const FILE_COL = 36;

function specBasename(test: TestCase): string {
  if (test.location?.file) {
    return path.basename(test.location.file);
  }
  return "?";
}

function formatFileColumn(
  name: string,
  enabled: boolean,
  width: number,
): string {
  const t =
    name.length > width ? `${name.slice(0, Math.max(0, width - 1))}…` : name;
  // Slightly de-emphasis vs status, but not dim: dim looked like “no color” in terminals.
  return paint(t.padEnd(width, " "), C.cyan, enabled);
}

function formatPhase(phase: string, width: number): string {
  if (phase.length > width) {
    return phase;
  }
  return phase + " ".repeat(width - phase.length);
}

function testStatusLine(
  status: TestResult["status"],
  enabled: boolean,
): string {
  const label = formatPhase(String(status).toUpperCase(), PHASE_WIDTH);
  switch (status) {
    case "passed":
      return paint(label, C.green + C.bold, enabled);
    case "failed":
      return paint(label, C.red + C.bold, enabled);
    case "timedOut":
      return paint(label, C.magenta + C.bold, enabled);
    case "skipped":
      return paint(label, C.yellow, enabled);
    case "interrupted":
      return paint(label, C.blue + C.bold, enabled);
    default:
      return paint(label, C.cyan, enabled);
  }
}

function runStatusLine(status: FullResult["status"], enabled: boolean): string {
  const label = formatPhase(String(status).toUpperCase(), PHASE_WIDTH);
  switch (status) {
    case "passed":
      return paint(label, C.green + C.bold, enabled);
    case "failed":
      return paint(label, C.red + C.bold, enabled);
    case "interrupted":
      return paint(label, C.blue + C.bold, enabled);
    default:
      return paint(label, C.cyan, enabled);
  }
}

/** Đã hoàn thành / tổng (vd.  10/200), căn cột theo tổng. */
function formatProgress(
  done: number,
  total: number,
  enabled: boolean,
): string {
  if (total <= 0) {
    return paint("0/0", C.magenta, enabled);
  }
  const w = String(total).length;
  const left = String(done).padStart(w, " ");
  return paint(`${left}/${total}`, C.magenta, enabled);
}

/**
 * Custom reporter: logs run progress to stdout (statuses are colorized when TTY).
 * @see https://playwright.dev/docs/test-reporters#custom-reporters
 */
class CustomReporter implements Reporter {
  private readonly color: boolean;
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private timedOut = 0;
  private interrupted = 0;
  /** Số test đã chạy xong (mỗi test một lần, sau retry xong mới tính). */
  private completed = 0;
  private totalTests = 0;

  constructor() {
    this.color = colorsEnabled();
  }

  onBegin(config: FullConfig, suite: Suite): void {
    void config;
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.timedOut = 0;
    this.interrupted = 0;
    this.completed = 0;
    this.totalTests = suite.allTests().length;
    const head = paint("[Reporter]", C.cyan + C.bold, this.color);
    console.log(`${head} 👉 Starting ${this.totalTests} test(s).`);
  }

  onTestBegin(test: TestCase, result: TestResult): void {
    void result;
    const head = paint("[Reporter]", C.cyan + C.bold, this.color);
    const progress = formatProgress(
      this.completed,
      this.totalTests,
      this.color,
    );
    const fileStr = formatFileColumn(specBasename(test), this.color, FILE_COL);
    // Blue = “running” (same brightness as PASS/FAIL badges, not dim/gray)
    const phase = paint(
      formatPhase("START", PHASE_WIDTH),
      C.blue + C.bold,
      this.color,
    );
    console.log(
      `${head} ${progress} ${fileStr} ${phase} ${test.title}`,
    );
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    switch (result.status) {
      case "passed":
        this.passed++;
        break;
      case "failed":
        this.failed++;
        break;
      case "skipped":
        this.skipped++;
        break;
      case "timedOut":
        this.timedOut++;
        break;
      case "interrupted":
        this.interrupted++;
        break;
    }
    this.completed++;
    const head = paint("[Reporter]", C.cyan + C.bold, this.color);
    const progress = formatProgress(
      this.completed,
      this.totalTests,
      this.color,
    );
    const fileStr = formatFileColumn(specBasename(test), this.color, FILE_COL);
    const badge = testStatusLine(result.status, this.color);
    console.log(
      `${head} ${progress} ${fileStr} ${badge} ${test.title}`,
    );
  }

  onEnd(result: FullResult): void {
    const head = paint("[Reporter]", C.cyan + C.bold, this.color);
    const badge = runStatusLine(result.status, this.color);
    const ok = result.status === "passed";
    const passStr = paint(`${this.passed} passed`, C.green + C.bold, this.color);
    const failStr = paint(`${this.failed} failed`, C.red + C.bold, this.color);
    const extra: string[] = [];
    if (this.timedOut > 0) {
      extra.push(
        paint(`${this.timedOut} timed out`, C.magenta + C.bold, this.color),
      );
    }
    if (this.skipped > 0) {
      extra.push(paint(`${this.skipped} skipped`, C.yellow, this.color));
    }
    if (this.interrupted > 0) {
      extra.push(
        paint(`${this.interrupted} interrupted`, C.blue + C.bold, this.color),
      );
    }
    const summaryLine = [passStr, failStr, ...extra].join(", ");
    console.log(
      `${head} Run finished: ${ok ? "✅" : "❌"} ${badge} — ${summaryLine}`,
    );
  }
}

export default CustomReporter;
