import { AddNewLessonPage } from "../../pages/courses/AddNewLessonPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Courses — Add new lesson (/courses/lession/detail)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Nghiệp vụ (map UI — không có PDF trong repo):
   * - Gắn bài học vào khóa (`#course`), phân quyền/đối tượng (`#userRole`), tiêu đề, mô tả, nội dung; Save submit `form#formLessionDetail`.
   * - Validation client: thiếu title và chưa chọn course → message rõ ràng.
   * - Không E2E Save tạo bản ghi (tránh flaky + dữ liệu rác khi CI parallel); kiểm tra bind form trước Save.
   */

  test("TC01 - Navigate — URL, title, form shell @smoke", async ({ authenticatedPage, baseUrl }) => {
    const add = new AddNewLessonPage(authenticatedPage.page);

    await add.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/courses\/lession\/detail/i);
    await expect(add.pageTitleH1).toHaveText(/Add new Lesson/i);
    await add.expectAddLessonFormVisible();
  });

  test("TC02 - Validation — empty title and course show errors @negative", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const add = new AddNewLessonPage(authenticatedPage.page);
    await add.goto(baseUrl);
    await add.expectAddLessonFormVisible();

    await add.titleInput.clear();
    await add.courseSelect.selectOption({ index: 0 });
    await add.descriptionTextarea.fill("desc only");
    await add.submitSave();

    await expect(authenticatedPage.page).toHaveURL(/\/courses\/lession\/detail/i);
    await expect(add.titleInvalidFeedback).toBeVisible();
    await expect(add.courseInvalidFeedback).toBeVisible();
  });

  test("TC03 - Form binds title, course, role, description and content @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const add = new AddNewLessonPage(authenticatedPage.page);
    await add.goto(baseUrl);
    await add.expectAddLessonFormVisible();

    const title = `LessonDraft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await add.fillLessonDraft({
      title,
      courseOptionIndex: 1,
      roleValue: "admin",
      description: "Short description",
      content: "Lesson body content",
    });

    await expect(add.titleInput).toHaveValue(title);
    const courseVal = await add.courseSelect.inputValue();
    expect(courseVal.length).toBeGreaterThan(0);
    await expect(add.roleSelect).toHaveValue("admin");
    await expect(add.descriptionTextarea).toHaveValue("Short description");
    await expect(
      authenticatedPage.page.frameLocator("iframe.cke_wysiwyg_frame").first().locator("body"),
    ).toContainText("Lesson body content");
    await expect(add.saveButton).toBeEnabled();
  });
});


