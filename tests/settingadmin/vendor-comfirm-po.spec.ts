import { VendorConfirmPoPage } from "../../pages/settingadmin/VendorComfirmPoPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("settingadmin - VendorConfirmPoPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new VendorConfirmPoPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /Vendor Confirm PO Pending/i,
      {
        timeout: 10000,
      },
    );
  });
});
