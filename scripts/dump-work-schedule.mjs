/** node scripts/dump-work-schedule.mjs — BASE_URL, LOGIN_USER_ADMIN, LOGIN_PASS_ADMIN */
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
await page
  .goto(`${baseUrl}/promoter/work-schedule`, { waitUntil: "load" })
  .catch(() =>
    page.goto(`${baseUrl}/promoter/work-schedule`, { waitUntil: "load" }),
  );
await page.waitForTimeout(2500);

const snap = await page.evaluate(() => {
  const pick = (s) => document.querySelector(s)?.outerHTML?.slice(0, 4000) ?? null;
  const h1s = [...document.querySelectorAll("h1")].map((e) => ({
    text: e.textContent?.trim().slice(0, 120),
    cls: e.className,
  }));
  const tables = [...document.querySelectorAll("table")].map((t) => ({
    id: t.id,
    cls: t.className?.slice(0, 80),
  }));
  const forms = [...document.querySelectorAll("form")].map((f) => ({
    id: f.id,
    action: f.getAttribute("action")?.slice(0, 120),
    method: f.getAttribute("method"),
  }));
  const ff = document.querySelector("form#formFilter") || document.querySelector("form#filter-form");
  const filterInputs = ff
    ? [...ff.querySelectorAll("input, select, textarea")].map((el) => ({
        tag: el.tagName,
        type: el.getAttribute("type"),
        id: el.id,
        name: el.getAttribute("name"),
      }))
    : [];
  const filterButtons = ff
    ? [...ff.querySelectorAll("button")].map((b) => ({
        type: b.getAttribute("type"),
        id: b.id,
        text: b.textContent?.trim().slice(0, 60),
      }))
    : [];
  const thead = document.querySelector("table thead")?.innerText?.slice(0, 600);
  const mainTable = document.querySelector("table[id]") || document.querySelector("table.table");
  const rowCount = document.querySelectorAll("table tbody tr").length;
  return {
    url: location.href,
    title: document.title,
    pageTitle: document.querySelector(".page-title h1")?.textContent?.trim(),
    h1s,
    forms,
    filterFormId: ff?.id ?? null,
    filterInputs,
    filterButtons,
    tables,
    theadPreview: thead,
    tbodyRowCount: rowCount,
    pagination: pick("ul.pagination"),
    changeSize: pick("select#changeSizePage"),
    btnClear: pick("#btnClearFormFilter"),
  };
});
console.log(JSON.stringify(snap, null, 2));
await browser.close();
