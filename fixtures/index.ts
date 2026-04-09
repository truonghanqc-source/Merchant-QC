/**
 * Custom Playwright fixtures
 * Thay thế hàm createAuthenticatedPage() lặp lại trong mỗi test file
 *
 * Cách dùng:
 *   import { test, expect } from "../../fixtures/index.js";
 *   test("my test", async ({ authenticatedPage }) => { ... });
 */
import { test as base, expect, type Browser } from "@playwright/test";
import { fileURLToPath } from "url";
import path from "path";
import { QuotationPage } from "../pages/quotation/quotationPage.js";
import { PgStaffPage } from "../pages/pgpb/PgStaffPage.js";
import { ProductPage } from "../pages/product/ProductPage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.resolve(__dirname, "../playwright/.auth/admin.json");

export { expect };

type AuthFixtures = {
  /** Tạo browser context mới với viewport 1920x1080, ignoreHTTPSErrors */
  authenticatedPage: {
    context: Awaited<ReturnType<Browser["newContext"]>>;
    page: Awaited<
      ReturnType<Awaited<ReturnType<Browser["newContext"]>>["newPage"]>
    >;
  };
  quotationPage: QuotationPage;
  pgStaffPage: PgStaffPage;
  productPage: ProductPage;
  baseUrl: string;
};

export const test = base.extend<AuthFixtures>({
  baseUrl: async ({}, use) => {
    const url = process.env.BASE_URL?.trim();
    if (!url) throw new Error("Missing env var: BASE_URL");
    await use(url);
  },

  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      // Reuse auth state saved by globalSetup — avoids logging in per-test
      storageState: AUTH_FILE,
    });
    const page = await context.newPage();
    await use({ context, page });
    await context.close();
  },

  quotationPage: async ({ authenticatedPage, baseUrl }, use) => {
    const quotation = new QuotationPage(authenticatedPage.page);
    await quotation.goto(baseUrl);
    await use(quotation);
  },

  pgStaffPage: async ({ authenticatedPage, baseUrl }, use) => {
    const pgStaff = new PgStaffPage(authenticatedPage.page);
    await pgStaff.goto(baseUrl);
    await use(pgStaff);
  },

  productPage: async ({ authenticatedPage, baseUrl }, use) => {
    const product = new ProductPage(authenticatedPage.page);
    await product.goto(baseUrl);
    await use(product);
  },
});
