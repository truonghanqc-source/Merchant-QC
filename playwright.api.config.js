// @ts-check
/**
 * API tests only — globalSetup chỉ dọn allure-results-api (không login Chromium).
 * @see playwright.config.js cho test UI/E2E đầy đủ.
 */
import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, ".env.local") });

export default defineConfig({
  globalSetup: "./global-setup-allure-api.ts",
  testDir: "./tests/api",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 0,
  workers: process.env.CI ? 10 : undefined,
  reporter: process.env.CI
    ? [
        ["html", { open: "never" }],
        ["junit", { outputFile: "test-results/junit-api.xml" }],
        ["github"],
        ["allure-playwright", { resultsDir: "allure-results-api" }],
        ["./reporters/auto-open-allure-reporter.ts", { resultsDir: "allure-results-api" }],
      ]
    : [
        ["html"],
        ["allure-playwright", { resultsDir: "allure-results-api" }],
        ["./reporters/auto-open-allure-reporter.ts", { resultsDir: "allure-results-api" }],
      ],
  use: {
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 15000,
    navigationTimeout: 60000,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
