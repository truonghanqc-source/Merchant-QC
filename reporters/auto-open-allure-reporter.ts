import path from "node:path";
import { spawn } from "node:child_process";
import type {
  FullConfig,
  FullResult,
  Reporter,
} from "@playwright/test/reporter";

/** Chỉ lấy tên thư mục cuối (allure-results / allure-results-api), tránh path lặp nếu options lạ. */
function safeResultsDirName(raw: string | undefined): string {
  if (!raw || typeof raw !== "string") return "allure-results";
  const parts = raw.replace(/\\/g, "/").split("/").filter((p) => p && p !== "." && p !== "..");
  return parts.length > 0 ? (parts[parts.length - 1] ?? "allure-results") : "allure-results";
}

function projectRootFromConfig(config: FullConfig): string {
  const cf = config.configFile;
  if (!cf) return process.cwd();
  const abs = path.isAbsolute(cf) ? cf : path.resolve(process.cwd(), cf);
  return path.dirname(abs);
}

/**
 * Local (không CI):
 * - Mặc định: chỉ tự mở Allure khi run không hoàn toàn passed.
 * - ALLURE_AUTO_OPEN=always: tự mở cả khi pass (xem case passed).
 * - ALLURE_AUTO_OPEN=0: không tự mở.
 */
export default class AutoOpenAllureReporter implements Reporter {
  private readonly resultsDirName: string;
  /** Gốc repo (nơi allure ghi allure-results). */
  private projectRoot = "";

  constructor(options: { resultsDir: string }) {
    this.resultsDirName = safeResultsDirName(options.resultsDir);
  }

  onBegin(config: FullConfig): void {
    this.projectRoot = projectRootFromConfig(config);
  }

  onEnd(result: FullResult): void {
    if (process.env.CI) return;
    if (process.env.ALLURE_AUTO_OPEN === "0") return;

    const openAlways =
      process.env.ALLURE_AUTO_OPEN?.toLowerCase() === "always";
    const openOnFailure = result.status !== "passed";
    if (!openAlways && !openOnFailure) return;

    const resultsAbs = path.join(this.projectRoot, this.resultsDirName);
    const reason =
      result.status === "passed"
        ? "ALLURE_AUTO_OPEN=always"
        : `run status: ${result.status}`;
    console.log(`\n[Allure] Đang mở report (${reason}): ${resultsAbs}\n`);

    const child = spawn("npx", ["allure", "open", this.resultsDirName], {
      cwd: this.projectRoot,
      stdio: "inherit",
      shell: false,
      detached: true,
    });
    child.unref();
  }
}
