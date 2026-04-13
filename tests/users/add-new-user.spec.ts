import { AddNewUserPage } from "../../pages/users/AddNewUserPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("users - AddNewUserPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new AddNewUserPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/Add New User/i, {
      timeout: 10000,
    });
  });
});
