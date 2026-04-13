import { ConfirmPoImportPage } from "../../pages/purchase/ConfirmPoImportPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("purchase - ConfirmPoImportPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new ConfirmPoImportPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /Verify Purchase Order/i,
      {
        timeout: 10000,
      },
    );
  });
});
