/** node scripts/dump-promoter-list.mjs — BASE_URL, LOGIN_USER_ADMIN, LOGIN_PASS_ADMIN */
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
await page.goto(`${baseUrl}/promoter`, { waitUntil: "networkidle" }).catch(() =>
  page.goto(`${baseUrl}/promoter`, { waitUntil: "load" }),
);
await page.waitForTimeout(2000);

const snap = await page.evaluate(() => {
  const pick = (s) => document.querySelector(s)?.outerHTML?.slice(0, 4000) ?? null;
  const h1 = [...document.querySelectorAll("h1")].map((e) => e.textContent?.trim());
  const notice = document.querySelector("p.w-100.fs-6.mb-2")?.outerHTML;
  return {
    url: location.href,
    title: document.title,
    h1s: h1,
    noticeP: notice,
    formFilter: pick("form#formFilter"),
    table: pick("table.table-row-bordered") || pick("table"),
    pagination: pick("ul.pagination"),
    createLink: [...document.querySelectorAll('a[href*="pg-draft/create"]')]
      .slice(0, 2)
      .map((a) => a.getAttribute("href")),
  };
});
console.log(JSON.stringify(snap, null, 2));
await browser.close();
