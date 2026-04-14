/** node scripts/dump-product-list.mjs — BASE_URL, LOGIN_USER_ADMIN, LOGIN_PASS_ADMIN */
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
await page.goto(`${baseUrl}/product`, { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(1500);

const snap = await page.evaluate(() => {
  const pick = (s) => document.querySelector(s)?.outerHTML?.slice(0, 3500) ?? null;
  const h1s = [...document.querySelectorAll("h1")].map((e) => ({
    text: e.textContent?.trim().slice(0, 120),
  }));
  const ff =
    document.querySelector("form#formFilter") ||
    document.querySelector("form#filter-form") ||
    document.querySelector("form[method='GET']");
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
        text: b.textContent?.trim().slice(0, 50),
      }))
    : [];
  const tables = [...document.querySelectorAll("table")].map((t) => ({
    id: t.id,
    cls: t.className?.slice(0, 100),
  }));
  const thead = document.querySelector("table thead")?.innerText?.slice(0, 800);
  const rowCount = document.querySelectorAll("table tbody tr").length;
  return {
    url: location.href,
    title: document.title,
    pageTitle: document.querySelector(".page-title h1")?.textContent?.trim(),
    h1s,
    filterFormId: ff?.id ?? null,
    filterInputs,
    filterButtons,
    tables,
    theadPreview: thead,
    tbodyRowCount: rowCount,
    pagination: pick("ul.pagination"),
    changeSize: pick("select#changeSizePage"),
    createLink: [...document.querySelectorAll('a[href*="/product"]')]
      .filter((a) => /create|add|new/i.test(a.getAttribute("href") || a.textContent || ""))
      .slice(0, 5)
      .map((a) => ({ href: a.getAttribute("href"), text: a.textContent?.trim().slice(0, 40) })),
  };
});
console.log(JSON.stringify(snap, null, 2));
await browser.close();
