import { AddNewLessonPage } from "../../pages/courses/AddNewLessonPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("courses - AddNewLessonPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new AddNewLessonPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(/Add new Lesson/i, {
      timeout: 10000,
    });
  });
});
