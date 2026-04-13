import { ReportBrandPage } from "../../pages/report/ReportBrandPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("report - ReportBrandPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new ReportBrandPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/Report Brands/i, {
      timeout: 10000,
    });
  });
});
