/** node scripts/dump-report-sales.mjs */
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
await page.goto(`${baseUrl}/report/sales`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(2000);

const snap = await page.evaluate(() => {
  const h1 = document.querySelector(".page-title h1")?.textContent?.trim();
  const forms = [...document.querySelectorAll("form")].map((f) => ({
    id: f.id,
    method: f.getAttribute("method"),
  }));
  const ff =
    document.querySelector("form#formFilter") ||
    document.querySelector("form#filter-form");
  const inputs = ff
    ? [...ff.querySelectorAll("input, select")].map((el) => ({
        tag: el.tagName,
        type: el.getAttribute("type"),
        id: el.id,
        name: el.getAttribute("name"),
      }))
    : [];
  const tables = [...document.querySelectorAll("table")].map((t) => ({
    id: t.id,
    cls: t.className?.slice(0, 80),
  }));
  const thead = document.querySelector("table thead")?.innerText?.slice(0, 600);
  const btn = ff
    ? [...ff.querySelectorAll("button")].map((b) => ({
        type: b.getAttribute("type"),
        text: b.textContent?.trim().slice(0, 50),
      }))
    : [];
  return {
    url: location.href,
    title: document.title,
    h1,
    filterFormId: ff?.id,
    forms,
    filterInputs: inputs,
    filterButtons: btn,
    tables,
    theadPreview: thead,
    rowCount: document.querySelectorAll("table tbody tr").length,
    pagination: !!document.querySelector("ul.pagination"),
    changeSize: !!document.querySelector("select#changeSizePage"),
    exportBtn: [...document.querySelectorAll("a, button")].filter((x) =>
      /export/i.test(x.textContent || ""),
    ).length,
  };
});
console.log(JSON.stringify(snap, null, 2));
await browser.close();
