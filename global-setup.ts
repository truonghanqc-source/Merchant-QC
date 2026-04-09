/**
 * Global Setup — chạy 1 lần trước toàn bộ test suite
 * Mục đích: Login admin 1 lần, lưu session state → tất cả test reuse session này
 * Tránh login lặp lại ở mỗi test → giảm thời gian chạy đáng kể
 * Auto re-login nếu session đã hết hạn (cookie HASAKI_MERCHANT_SID expired)
 */
import { chromium } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LoginPage } from "./pages/auth/LoginPage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, ".env.local") });

const AUTH_FILE = path.resolve(__dirname, "playwright/.auth/admin.json");

/** Trả về true nếu auth file tồn tại và session cookie chưa hết hạn */
function isSessionValid(): boolean {
  if (!fs.existsSync(AUTH_FILE)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
    const sid = (data.cookies ?? []).find(
      (c: { name: string }) => c.name === "HASAKI_MERCHANT_SID",
    );
    if (!sid) return false;
    // Để lại 5 phút buffer trước khi hết hạn
    return sid.expires * 1000 > Date.now() + 5 * 60 * 1000;
  } catch {
    return false;
  }
}

export default async function globalSetup() {
  const baseUrl = process.env.BASE_URL?.trim();
  const username = process.env.LOGIN_USER_ADMIN?.trim();
  const password = process.env.LOGIN_PASS_ADMIN?.trim();

  if (!baseUrl || !username || !password) {
    throw new Error(
      "Missing required env vars: BASE_URL, LOGIN_USER_ADMIN, LOGIN_PASS_ADMIN",
    );
  }

  if (isSessionValid()) {
    console.log("✓ Auth session haven't expired — skipping login");
    return;
  }

  console.log("↻ Session expired or not found — logging in...");

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  const login = new LoginPage(page);
  await login.goto(baseUrl);
  await login.login(username, password);

  // Lưu auth state — tất cả test sẽ reuse session này
  await context.storageState({ path: AUTH_FILE });

  await browser.close();
  console.log("✓ Login successful — session saved");
}
