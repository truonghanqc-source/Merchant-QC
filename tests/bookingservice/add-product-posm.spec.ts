import { AddProductPosmPage } from "../../pages/bookingservice/AddProductPosmPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("bookingservice - AddProductPosmPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new AddProductPosmPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /Add new Product POSM/i,
      { timeout: 10000 },
    );
  });
});
