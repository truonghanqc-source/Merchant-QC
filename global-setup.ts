/**
 * Global setup — runs once before the test suite.
 * Logs in per auth profile and saves storage state for reuse.
 * Re-logins when cookies are missing/expired or the server rejects the session.
 */
import { chromium } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LoginPage } from "./pages/auth/LoginPage.ts";
import {
  AUTH_PROFILE_IDS,
  AUTH_PROFILES,
  type AuthProfileId,
  authStoragePath,
  getProfileCredentials,
} from "./playwright/auth-profiles.ts";
import { cleanAllureResultsAtRepoRoot } from "./clean-allure-results.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, ".env.local") });

/** True if auth file exists and session cookie is not expired (per file). */
function isSessionValid(authFile: string): boolean {
  if (!fs.existsSync(authFile)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(authFile, "utf-8"));
    const sid = (data.cookies ?? []).find(
      (c: { name: string }) => c.name === "HASAKI_MERCHANT_SID",
    );
    if (!sid) return false;
    if (sid.expires === -1) return true;
    if (typeof sid.expires !== "number") return false;
    return sid.expires * 1000 > Date.now() + 5 * 60 * 1000;
  } catch {
    return false;
  }
}

async function storageStateAcceptedByServer(
  baseUrl: string,
  authFile: string,
): Promise<boolean> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      storageState: authFile,
    });
    try {
      const page = await context.newPage();
      await page.goto(baseUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      return !/\/login(\/|\?|$)/i.test(page.url());
    } catch {
      return false;
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

async function loginAndSave(
  baseUrl: string,
  username: string,
  password: string,
  authFile: string,
  label: string,
) {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const login = new LoginPage(page);
  await login.goto(baseUrl);
  await login.login(username, password);
  await context.storageState({ path: authFile });
  await browser.close();
  console.log(`✓ [${label}] Login successful — session saved`);
}

async function ensureSession(
  baseUrl: string,
  username: string,
  password: string,
  authFile: string,
  label: string,
) {
  const cookieOk = isSessionValid(authFile);
  const serverOk =
    cookieOk && (await storageStateAcceptedByServer(baseUrl, authFile));

  if (serverOk) {
    console.log(
      `✓ [${label}] Auth session active (cookie + server) — skipping login`,
    );
    return;
  }

  if (cookieOk && !serverOk) {
    console.log(
      `↻ [${label}] Cookie not expired but server rejected session — re-login...`,
    );
  } else {
    console.log(`↻ [${label}] Session expired or not found — logging in...`);
  }

  await loginAndSave(baseUrl, username, password, authFile, label);

  const afterLogin = await storageStateAcceptedByServer(baseUrl, authFile);
  if (!afterLogin) {
    throw new Error(
      `[${label}] After login, storage state still not accepted (check BASE_URL, credentials, and network).`,
    );
  }
}

async function ensureProfileSession(
  baseUrl: string,
  profile: AuthProfileId,
): Promise<void> {
  const meta = AUTH_PROFILES[profile];
  const authFile = authStoragePath(profile);
  const { username, password } = getProfileCredentials(profile);

  if (meta.requireForSuite) {
    if (!username || !password) {
      throw new Error(
        `Missing required env vars for profile "${profile}": ${meta.userEnv}, ${meta.passEnv}`,
      );
    }
    await ensureSession(baseUrl, username, password, authFile, meta.setupLabel);
    return;
  }

  if (!username || !password) {
    console.log(
      `○ [${meta.setupLabel}] Skipping global setup — ${meta.userEnv} / ${meta.passEnv} not set`,
    );
    return;
  }

  await ensureSession(baseUrl, username, password, authFile, meta.setupLabel);
}

export default async function globalSetup() {
  cleanAllureResultsAtRepoRoot(__dirname, "allure-results");

  const baseUrl = process.env.BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("Missing required env var: BASE_URL");
  }

  for (const profile of AUTH_PROFILE_IDS) {
    await ensureProfileSession(baseUrl, profile);
  }
}
