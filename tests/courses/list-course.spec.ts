import { ListCoursePage } from "../../pages/courses/ListCoursePage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("courses - ListCoursePage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new ListCoursePage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/Courses List/i, {
      timeout: 10000,
    });
  });
});
