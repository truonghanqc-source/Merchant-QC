import { AddNewCoursePage } from "../../pages/courses/AddNewCoursePage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Courses — Add new course (/courses/detail)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Nghiệp vụ (map UI — không có PDF trong repo):
   * - Nhập title (bắt buộc), mô tả, độ ưu tiên, ảnh (Dropzone); Save tạo khóa học → thường redirect `/courses` + thông báo thành công.
   * - Guest / thiếu quyền `courses::create` → 403 ([ví dụ](https://test-merchant.hasaki.vn/courses/detail)).
   *
   * Kịch bản:
   * - Smoke: form tạo course hiển thị đầy đủ (không 403).
   * - Negative: Save khi thiếu title → vẫn ở form + lỗi "Title is required".
   * - Regression: điền title / mô tả / priority — giữ nguyên trên form (không Save) để tránh flaky/ghi rác khi CI chạy parallel nhiều worker trên cùng env.
   *   (E2E Save → redirect `/courses` đã xác minh thủ công trên env; nếu cần tự động hóa tạo course, chạy file này với `--workers=1`.)
   */

  test("TC01 - Navigate — URL, title, form and media slot @smoke", async ({ authenticatedPage, baseUrl }) => {
    const add = new AddNewCoursePage(authenticatedPage.page);

    await add.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/courses\/detail/i);
    await expect(authenticatedPage.page.locator("body")).not.toContainText(/403/i);
    await expect(add.pageTitleH1).toHaveText(/Add new Course/i);
    await add.expectAddCourseFormVisible();
    await expect(add.imageDropzone).toBeVisible();
  });

  test("TC02 - Validation — empty title blocks save @negative", async ({ authenticatedPage, baseUrl }) => {
    const add = new AddNewCoursePage(authenticatedPage.page);
    await add.goto(baseUrl);
    await add.expectAddCourseFormVisible();

    await add.titleInput.clear();
    await add.descriptionTextarea.fill("only description");
    await add.submitSave();

    await expect(authenticatedPage.page).toHaveURL(/\/courses\/detail/i);
    await expect(add.titleInvalidFeedback).toBeVisible();
  });

  test("TC03 - Form accepts title, description and priority before save @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const add = new AddNewCoursePage(authenticatedPage.page);
    await add.goto(baseUrl);
    await add.expectAddCourseFormVisible();

    const title = `Draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await add.fillCourseDetails({
      title,
      description: "Draft description for E2E",
      priority: "2",
    });

    await expect(add.titleInput).toHaveValue(title);
    await expect(add.descriptionTextarea).toHaveValue("Draft description for E2E");
    await expect(add.priorityInput).toHaveValue("2");
    await expect(add.saveButton).toBeEnabled();
  });
});


