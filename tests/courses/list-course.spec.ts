import { ListCoursePage } from "../../pages/courses/ListCoursePage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Courses — list (/courses)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Nghiệp vụ (map UI — không có PDF trong repo):
   * - Xem danh sách khóa học; tìm theo từ khóa (`#search`); Search / Reset trên `form#formFilter`.
   * - Bảng: STT, Title, Description, Priority, Actions.
   *
   * Lưu ý: URL đúng của list là `/courses`, không phải `/courses/lession/detail` (đó là form thêm bài học).
   */

  test("TC01 - Navigate — URL, title, search and grid @smoke", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListCoursePage(authenticatedPage.page);

    await list.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/courses(\?|$)/i);
    await list.expectListShellVisible();
    await expect(list.pageTitleH1).toHaveText(/Courses List/i);
    await expect(list.searchInput).toBeVisible();
    await expect(list.filterSearchButton).toBeVisible();
  });

  test("TC02 - Results table lists course columns @regression", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListCoursePage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const headerText = await list.tableHeader.innerText();
    expect(headerText).toMatch(/STT|No\.?/i);
    expect(headerText).toMatch(/Title/i);
    expect(headerText).toMatch(/Description/i);
    expect(headerText).toMatch(/Priority/i);
    expect(headerText).toMatch(/Actions/i);
  });

  test("TC03 - Search with current filters keeps shell @regression", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListCoursePage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.submitSearch();

    await expect(authenticatedPage.page).toHaveURL(/\/courses/i);
    await list.expectListShellVisible();
    await expect(list.dataTable).toBeVisible();
  });

  test("TC04 - Reset keeps list shell @edge", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListCoursePage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.resetFilters();

    await expect(authenticatedPage.page).toHaveURL(/\/courses/i);
    await list.expectListShellVisible();
  });
});


