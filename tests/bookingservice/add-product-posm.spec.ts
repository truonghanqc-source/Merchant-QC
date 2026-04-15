import { AddProductPosmPage } from "../../pages/bookingservice/AddProductPosmPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("bookingservice - AddProductPosmPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("TC01 - Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const addProductPosm = new AddProductPosmPage(page);

    await addProductPosm.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /Add new Product POSM/i,
      { timeout: 10000 },
    );
  });
});


