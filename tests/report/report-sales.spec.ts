import { ReportSalesPage } from "../../pages/report/ReportSalesPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("report - ReportSalesPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new ReportSalesPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/Report Sales/i, {
      timeout: 10000,
    });
  });
});
