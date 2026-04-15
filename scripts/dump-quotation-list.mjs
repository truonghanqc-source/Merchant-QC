/**
 * Một lần: đăng nhập → /quotation → in JSON cấu trúc DOM (filter/pagination/bảng).
 * Chỉ truyền mật khẩu qua env / .env.local — không hardcode; đổi mật khẩu nếu đã lộ.
 *
 *   node scripts/dump-quotation-list.mjs
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
  console.error(
    "Thiếu env: BASE_URL, LOGIN_USER_ADMIN, LOGIN_PASS_ADMIN (hoặc file .env.local)",
  );
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

  await page.goto(`${baseUrl}/quotation`, { waitUntil: "load" }).catch(() =>
    page.goto(`${baseUrl}/quotation`, { waitUntil: "load" }),
  );
  await page.waitForTimeout(2500);

  const snapshot = await page.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const html = el.outerHTML;
      return html.length > 8000 ? html.slice(0, 8000) + "\n<!-- truncated -->" : html;
    };
    const pickAll = (sel, max = 5) =>
      [...document.querySelectorAll(sel)]
        .slice(0, max)
        .map((el, i) => ({
          i,
          tag: el.tagName,
          id: el.id || null,
          class: el.className?.toString?.() || null,
          snippet: el.outerHTML.slice(0, 1200),
        }));

    const formControls = [...document.querySelectorAll("input, select, textarea")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .slice(0, 40)
      .map((el) => ({
        tag: el.tagName,
        type: el.getAttribute("type"),
        name: el.getAttribute("name"),
        id: el.id || null,
        placeholder: el.getAttribute("placeholder"),
        outer: el.outerHTML.slice(0, 400),
      }));

    return {
      url: window.location.href,
      title: document.title,
      tables: pickAll("table", 3),
      dataTablesWrapper: pick(".dataTables_wrapper"),
      dataTablesFilter: pick(".dataTables_filter"),
      dataTablesLength: pick(".dataTables_length"),
      dataTablesInfo: pick(".dataTables_info"),
      dataTablesPaginate: pick(".dataTables_paginate"),
      paginationBootstrap: pick("ul.pagination"),
      searchInputs: pickAll('input[type="search"], input[aria-controls*="DataTables"]', 5),
      selectsNearTable: pickAll(
        "table ~ select, .card-body select, .dataTables_length select",
        5,
      ),
      cardBodyFirst: pick(".card-body"),
      formAboveTable: pick("form"),
      formControls,
    };
  });

  console.log(JSON.stringify(snapshot, null, 2));
} finally {
  await browser.close();
}
