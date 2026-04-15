/** node scripts/dump-po-delivery.mjs */
import { chromium } from "playwright";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../.env.local") });
const baseUrl = process.env.BASE_URL?.replace(/\/$/, "");
const user = process.env.LOGIN_USER_ADMIN?.trim();
const pass = process.env.LOGIN_PASS_ADMIN?.trim();
if (!baseUrl || !user || !pass) process.exit(1);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`${baseUrl}/login`, { waitUntil: "load", timeout: 60000 });
await page.locator('input[name="username"], input#username').first().fill(user);
await page.locator("input#password").fill(pass);
await page.locator('button[type="submit"]').click();
await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 60000 });
await page.goto(`${baseUrl}/purchase-order/register-delivery`, {
  waitUntil: "load",
  timeout: 60000,
});
await page.waitForTimeout(2000);

const snap = await page.evaluate(() => {
  const h1 = document.querySelector(".page-title h1")?.textContent?.trim();
  const btns = [...document.querySelectorAll("button, a.btn")].map((b) => ({
    tag: b.tagName,
    text: b.textContent?.trim().slice(0, 60),
    id: b.id,
    href: b.getAttribute("href")?.slice(0, 80),
  })).slice(0, 40);
  const forms = [...document.querySelectorAll("form")].map((f) => ({
    id: f.id,
    action: f.getAttribute("action")?.slice(0, 100),
  }));
  const tables = [...document.querySelectorAll("table")].map((t) => ({
    id: t.id,
    cls: t.className?.slice(0, 80),
  }));
  const cal = document.querySelector("[class*='calendar'], .fc, #calendar, .flatpickr-calendar")
    ? "calendar-like found"
    : null;
  return { url: location.href, title: document.title, h1, forms, tables, cal, btns };
});
console.log(JSON.stringify(snap, null, 2));
await browser.close();
