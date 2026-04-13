import { GlobalPage } from "../../pages/settingadmin/GlobalPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("settingadmin - GlobalPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new GlobalPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/Global Setting/i, {
      timeout: 10000,
    });
  });
});
