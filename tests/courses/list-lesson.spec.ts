import { ListLessonPage } from "../../pages/courses/ListLessonPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Courses — lesson list (/courses/lession)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Nghiệp vụ (map UI — không có PDF trong repo):
   * - Xem danh sách bài học; lọc theo từ khóa và theo khóa học (`#course`); Search / Reset.
   * - Bảng: STT, Title, Course, Description, Actions.
   */

  test("TC01 - Navigate — URL, title, filters and grid @smoke", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListLessonPage(authenticatedPage.page);

    await list.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/courses\/lession(\?|$)/i);
    await list.expectListShellVisible();
    await expect(list.pageTitleH1).toHaveText(/Lesson List/i);
    await expect(list.searchInput).toBeVisible();
    await expect(list.courseSelect).toBeAttached();
    expect(await list.courseSelect.locator("option").count()).toBeGreaterThan(0);
    await expect(list.filterSearchButton).toBeVisible();
  });

  test("TC02 - Results table lists lesson columns @regression", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListLessonPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const headerText = await list.tableHeader.innerText();
    expect(headerText).toMatch(/STT|No\.?/i);
    expect(headerText).toMatch(/Title/i);
    expect(headerText).toMatch(/Course/i);
    expect(headerText).toMatch(/Description/i);
    expect(headerText).toMatch(/Actions/i);
  });

  test("TC03 - Search with current filters keeps shell @regression", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListLessonPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.submitSearch();

    await expect(authenticatedPage.page).toHaveURL(/\/courses\/lession/i);
    await list.expectListShellVisible();
    await expect(list.dataTable).toBeVisible();
  });

  test("TC04 - Reset keeps list shell @edge", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListLessonPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.resetFilters();

    await expect(authenticatedPage.page).toHaveURL(/\/courses\/lession/i);
    await list.expectListShellVisible();
  });
});


