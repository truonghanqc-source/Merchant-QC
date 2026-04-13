import { ListVendorPage } from "../../pages/vendors/ListVendorPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("vendors - ListVendorPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new ListVendorPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/Vendor List/i, {
      timeout: 10000,
    });
  });
});
