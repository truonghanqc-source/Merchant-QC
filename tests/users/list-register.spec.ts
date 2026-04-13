import { ListRegisterPage } from "../../pages/users/ListRegisterPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("users - ListRegisterPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new ListRegisterPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /Register Vendor List/i,
      {
        timeout: 10000,
      },
    );
  });
});
