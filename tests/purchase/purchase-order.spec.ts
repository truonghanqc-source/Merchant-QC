import { PurchaseOrderPage } from "../../pages/purchase/PurchaseOrderPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("purchase - PurchaseOrderPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new PurchaseOrderPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/Purchase Order/i, {
      timeout: 10000,
    });
  });
});
