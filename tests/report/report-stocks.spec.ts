import { ReportStocksPage } from "../../pages/report/ReportStocksPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("report - ReportStocksPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new ReportStocksPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/Report Stock/i, {
      timeout: 10000,
    });
  });
});
