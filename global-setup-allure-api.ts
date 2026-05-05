/**
 * Chỉ dọn allure-results-api trước run API (playwright.api.config.js).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanAllureResultsAtRepoRoot } from "./clean-allure-results.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function globalSetup(): Promise<void> {
  cleanAllureResultsAtRepoRoot(__dirname, "allure-results-api");
}
