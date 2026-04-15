import { ListProductPosmPage } from "../../pages/bookingservice/ListProductPosmPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("bookingservice - ListProductPosmPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("TC01 - Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const listProductPosm = new ListProductPosmPage(page);

    await listProductPosm.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /List Product POSM/i,
      { timeout: 10000 },
    );
  });
});


