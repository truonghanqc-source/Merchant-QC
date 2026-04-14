/**
 * Dump DOM purchase-order (env: BASE_URL, LOGIN_USER_ADMIN, LOGIN_PASS_ADMIN).
 *   node scripts/dump-purchase-order.mjs
 */
import { chromium } from "playwright";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../.env.local") });

const baseUrl = process.env.BASE_URL?.replace(/\/$/, "");
const user = process.env.LOGIN_USER_ADMIN?.trim();
const pass = process.env.LOGIN_PASS_ADMIN?.trim();

if (!baseUrl || !user || !pass) {
  console.error("Thiếu env: BASE_URL, LOGIN_USER_ADMIN, LOGIN_PASS_ADMIN");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

try {
  await page.goto(`${baseUrl}/login`, { waitUntil: "load", timeout: 60000 });
  await page
    .locator('input[name="username"], input[name="userName"], input#username')
    .first()
    .fill(user);
  await page.locator('input[name="password"], input#password').fill(pass);
  await page
    .locator(
      'button[type="submit"], button:has-text("Login"), button:has-text("Đăng nhập")',
    )
    .click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), {
    timeout: 60000,
  });

  await page
    .goto(`${baseUrl}/purchase-order?status=new`, { waitUntil: "networkidle" })
    .catch(() =>
      page.goto(`${baseUrl}/purchase-order?status=new`, { waitUntil: "load" }),
    );
  await page.waitForTimeout(2500);

  const snapshot = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const html = el.outerHTML;
      return html.length > 6000 ? html.slice(0, 6000) + "\n<!-- truncated -->" : html;
    };
    const pickAll = (sel, max = 5) =>
      [...document.querySelectorAll(sel)]
        .slice(0, max)
        .map((el, i) => ({
          i,
          tag: el.tagName,
          id: el.id || null,
          class: el.className?.toString?.() || null,
          snippet: el.outerHTML.slice(0, 1000),
        }));

    const formControls = [...document.querySelectorAll("input, select, textarea")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .slice(0, 35)
      .map((el) => ({
        tag: el.tagName,
        type: el.getAttribute("type"),
        name: el.getAttribute("name"),
        id: el.id || null,
        outer: el.outerHTML.slice(0, 350),
      }));

    return {
      url: window.location.href,
      title: document.title,
      pageTitle: pick(".page-title"),
      tables: pickAll("table", 4),
      formFilter: pick("form#formFilter"),
      pagination: pick("ul.pagination"),
      dataTablesWrapper: pick(".dataTables_wrapper"),
      formControls,
    };
  });

  console.log(JSON.stringify(snapshot, null, 2));
} finally {
  await browser.close();
}
