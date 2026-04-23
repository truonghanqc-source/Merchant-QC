// @ts-check
import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local on local machine; on CI env vars are injected directly
loadEnv({ path: path.resolve(__dirname, ".env.local") });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  globalSetup: "./global-setup.ts",
  testDir: "./tests",
  fullyParallel: true,
  /* Fail the build on CI if test.only is accidentally left in */
  forbidOnly: !!process.env.CI,
  /* Retry failed tests on CI */
  retries: process.env.CI ? 3 : 0,
  /* More workers on CI since tests are independent */
  workers: process.env.CI ? 10 : undefined,
  /* Reporters: HTML always, JUnit for Jenkins CI, custom log reporter */
  reporter: process.env.CI
    ? [
        ["html", { open: "never" }],
        ["junit", { outputFile: "test-results/junit.xml" }],
        ["github"],
        ["./reporters/custom-reporter.ts"],
      ]
    : [["html"], ["./reporters/custom-reporter.ts"]],
  use: {
    /* Fixed viewport — works both locally and headless on Linux CI */
    viewport: { width: 1920, height: 1080 },
    /* Global timeout for each action (click, fill, waitFor...) */
    actionTimeout: 15000,
    /* Global timeout for navigation */
    navigationTimeout: 60000,
    /* Collect trace on first retry to help debug failures */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
    /* Video on retry */
    video: "on-first-retry",
    // Playwright defaults to headless. Pass --headed flag to show browser.
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
      },
    },
    // Firefox and WebKit disabled by default — enable as needed
    // { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1920, height: 1080 } } },
    // { name: "webkit",  use: { ...devices["Desktop Safari"],  viewport: { width: 1920, height: 1080 } } },
  ],
});
