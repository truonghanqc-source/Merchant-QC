/** node scripts/dump-pg-draft-create.mjs — env: BASE_URL, LOGIN_USER_ADMIN, LOGIN_PASS_ADMIN */
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
await page.goto(`${baseUrl}/promoter/pg-draft/create`, {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(2000);

const out = await page.evaluate(() => {
  const fields = [
    "name",
    "email",
    "phone",
    "cmnd",
    "address",
    "note",
    "workType",
  ].map((n) => {
    const el =
      document.querySelector(`[name="${n}"]`) ||
      document.querySelector(`#${n}`);
    return {
      name: n,
      tag: el?.tagName,
      id: el?.id,
      type: el?.getAttribute("type"),
      outer: el?.outerHTML?.slice(0, 200),
    };
  });
  const h1 = document.querySelector("h1")?.textContent?.trim();
  const save = [...document.querySelectorAll("button")].find((b) =>
    /save/i.test(b.textContent || ""),
  );
  return {
    title: document.title,
    h1,
    fields,
    saveBtn: save
      ? { text: save.textContent?.trim(), class: save.className }
      : null,
    formAction: (document.querySelector("form#mainForm, form") || null)?.getAttribute(
      "action",
    ),
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
