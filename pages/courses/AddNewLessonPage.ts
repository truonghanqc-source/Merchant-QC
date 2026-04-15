import type { Locator, Page } from "@playwright/test";
import { assertNotOnLoginPage, waitUntilLeftLogin } from "../../utils/navigation-helpers.ts";

/**
 * Tạo bài học mới — `/courses/lession/detail` (URL dùng typo `lession` theo app).
 * Form `form#formLessionDetail`; cần quyền `courses::createLession` — guest thường 403 ([ví dụ](https://test-merchant.hasaki.vn/courses/lession/detail)).
 */
export class AddNewLessonPage {
  readonly pageTitleH1: Locator;
  readonly formLessonDetail: Locator;
  readonly titleInput: Locator;
  readonly courseSelect: Locator;
  readonly roleSelect: Locator;
  readonly descriptionTextarea: Locator;
  /** Textarea gốc bị ẩn khi CKEditor mount — dùng `contentEditorFrame` để tương tác. */
  readonly contentTextarea: Locator;
  readonly contentEditorFrame: Locator;
  readonly saveButton: Locator;
  readonly titleInvalidFeedback: Locator;
  readonly courseInvalidFeedback: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formLessonDetail = page.locator("form#formLessionDetail");
    this.titleInput = page.locator("input#title");
    this.courseSelect = page.locator("select#course");
    this.roleSelect = page.locator("select#userRole");
    this.descriptionTextarea = page.locator("textarea#description");
    this.contentTextarea = page.locator("textarea#content");
    this.contentEditorFrame = page.locator("iframe.cke_wysiwyg_frame").first();
    this.saveButton = page.locator("#btnSaveLessionDetail");
    this.titleInvalidFeedback = this.formLessonDetail
      .locator(".invalid-feedback")
      .filter({ hasText: /Title is required/i });
    this.courseInvalidFeedback = this.formLessonDetail
      .locator(".invalid-feedback")
      .filter({ hasText: /Select course is required/i });
  }

  async goto(baseUrl: string) {
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/courses/lession/detail`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Add new Lesson: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
    );
    await this.page.waitForSelector("form#formLessionDetail", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectAddLessonFormVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formLessonDetail.waitFor({ state: "visible", timeout: 15000 });
    await this.titleInput.waitFor({ state: "visible", timeout: 10000 });
    await this.courseSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.roleSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.descriptionTextarea.waitFor({ state: "visible", timeout: 10000 });
    await this.contentTextarea.waitFor({ state: "attached", timeout: 10000 });
    await this.contentEditorFrame.waitFor({ state: "visible", timeout: 15000 });
    await this.saveButton.waitFor({ state: "visible", timeout: 10000 });
  }

  async fillLessonDraft(data: {
    title: string;
    courseOptionIndex?: number;
    roleValue?: string;
    description?: string;
    content?: string;
  }) {
    await this.titleInput.fill(data.title);
    const idx = data.courseOptionIndex ?? 1;
    await this.courseSelect.selectOption({ index: idx });
    if (data.roleValue !== undefined) {
      await this.roleSelect.selectOption(data.roleValue);
    }
    if (data.description !== undefined) {
      await this.descriptionTextarea.fill(data.description);
    }
    if (data.content !== undefined) {
      await this.typeInContentEditor(data.content);
    }
  }

  /** Gõ vào body CKEditor (textarea `#content` display:none). */
  async typeInContentEditor(text: string) {
    const body = this.page.frameLocator("iframe.cke_wysiwyg_frame").first().locator("body");
    await body.click();
    await body.pressSequentially(text, { delay: 5 });
  }

  async submitSave() {
    await this.saveButton.click();
  }
}
