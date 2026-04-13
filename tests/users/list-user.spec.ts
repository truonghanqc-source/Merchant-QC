import { ListUserPage } from "../../pages/users/ListUserPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("users - ListUserPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new ListUserPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/User List/i, {
      timeout: 10000,
    });
  });
});
