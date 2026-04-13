import { WorkSchedulePage } from "../../pages/pgpb/WorkSchedulePage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("pgpb - WorkSchedulePage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new WorkSchedulePage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/Work Schedule/i, {
      timeout: 10000,
    });
  });
});
