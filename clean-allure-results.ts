import fs from "node:fs";
import path from "node:path";

/** Xóa và tạo lại thư mục results để mỗi lần chạy test Allure chỉ chứa run hiện tại. */
export function cleanAllureResultsAtRepoRoot(
  repoRoot: string,
  dirName: string,
): void {
  const dir = path.join(repoRoot, dirName);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}
