import { FastRegisterPage } from "../../pages/users/FastRegisterPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("users - FastRegisterPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new FastRegisterPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/Add new User/i, {
      timeout: 10000,
    });
  });
});
