/** node scripts/dump-promoter-report.mjs — BASE_URL, LOGIN_USER_ADMIN, LOGIN_PASS_ADMIN */
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
  .goto(`${baseUrl}/promoter/promoter-report`, { waitUntil: "load" })
  .catch(() =>
    page.goto(`${baseUrl}/promoter/promoter-report`, { waitUntil: "load" }),
  );
await page.waitForTimeout(2500);

const snap = await page.evaluate(() => {
  const pick = (s) => document.querySelector(s)?.outerHTML?.slice(0, 5000) ?? null;
  const h1s = [...document.querySelectorAll("h1")].map((e) => ({
    text: e.textContent?.trim().slice(0, 120),
    cls: e.className,
  }));
  const tables = [...document.querySelectorAll("table")].map((t) => ({
    id: t.id,
    cls: t.className,
  }));
  const forms = [...document.querySelectorAll("form")].map((f) => ({
    id: f.id,
    action: f.getAttribute("action"),
    method: f.getAttribute("method"),
  }));
  const btnSubmit = [...document.querySelectorAll('form button[type="submit"]')].map(
    (b) => b.textContent?.trim().slice(0, 80),
  );
  const ff = document.querySelector("form#filter-form");
  const filterButtons = ff
    ? [...ff.querySelectorAll("button")].map((b) => ({
        type: b.getAttribute("type"),
        text: b.textContent?.trim().slice(0, 60),
        cls: b.className?.slice(0, 80),
      }))
    : [];
  const inputs = ff
    ? [...ff.querySelectorAll("input, select, textarea")].map((el) => ({
        tag: el.tagName,
        type: el.getAttribute("type"),
        id: el.id,
        name: el.getAttribute("name"),
        placeholder: el.getAttribute("placeholder"),
      }))
    : [];
  const thead = document.querySelector("table#main-table thead")?.innerText?.slice(0, 800);
  const rowCount = document.querySelectorAll("table#main-table tbody tr").length;
  return {
    url: location.href,
    title: document.title,
    h1s,
    pageTitle: document.querySelector(".page-title h1")?.textContent?.trim(),
    forms,
    btnSubmitTexts: btnSubmit,
    filterFormInputs: inputs,
    filterFormButtons: filterButtons,
    tables,
    theadPreview: thead,
    tbodyRowCount: rowCount,
    pagination: pick("ul.pagination"),
    anyExport: [...document.querySelectorAll('a[href*="export"], button')].map((el) =>
      `${el.tagName} ${el.textContent?.trim().slice(0, 40)}`,
    ).slice(0, 15),
  };
});
console.log(JSON.stringify(snap, null, 2));
await browser.close();
