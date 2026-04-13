import { ListProductPosmPage } from "../../pages/bookingservice/ListProductPosmPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("bookingservice - ListProductPosmPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new ListProductPosmPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /List Product POSM/i,
      { timeout: 10000 },
    );
  });
});
