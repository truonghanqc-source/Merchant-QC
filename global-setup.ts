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

const ADMIN_AUTH_FILE = path.resolve(__dirname, "playwright/.auth/admin.json");
const MERCHANT_AUTH_FILE = path.resolve(
  __dirname,
  "playwright/.auth/merchant.json",
);

/** Trả về true nếu auth file tồn tại và session cookie chưa hết hạn */
function isSessionValid(authFile: string): boolean {
  if (!fs.existsSync(authFile)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(authFile, "utf-8"));
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

async function loginAndSave(
  baseUrl: string,
  username: string,
  password: string,
  authFile: string,
  label: string,
) {
  // Đảm bảo thư mục tồn tại trước khi ghi file
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

export default async function globalSetup() {
  const baseUrl = process.env.BASE_URL?.trim();
  const usernameAdmin = process.env.LOGIN_USER_ADMIN?.trim();
  const passwordAdmin = process.env.LOGIN_PASS_ADMIN?.trim();
  const usernameMerchant = process.env.LOGIN_USER_MERCHANT?.trim();
  const passwordMerchant = process.env.LOGIN_PASS_MERCHANT?.trim();

  if (!baseUrl || !usernameAdmin || !passwordAdmin) {
    throw new Error(
      "Missing required env vars: BASE_URL, LOGIN_USER_ADMIN, LOGIN_PASS_ADMIN",
    );
  }

  // Admin session
  if (isSessionValid(ADMIN_AUTH_FILE)) {
    console.log("✓ [Admin] Auth session haven't expired — skipping login");
  } else {
    console.log("↻ [Admin] Session expired or not found — logging in...");
    await loginAndSave(
      baseUrl,
      usernameAdmin,
      passwordAdmin,
      ADMIN_AUTH_FILE,
      "Admin",
    );
  }

  // Merchant session (nếu có env vars)
  if (usernameMerchant && passwordMerchant) {
    if (isSessionValid(MERCHANT_AUTH_FILE)) {
      console.log("✓ [Merchant] Auth session haven't expired — skipping login");
    } else {
      console.log("↻ [Merchant] Session expired or not found — logging in...");
      await loginAndSave(
        baseUrl,
        usernameMerchant,
        passwordMerchant,
        MERCHANT_AUTH_FILE,
        "Merchant",
      );
    }
  }
}
