import type { Locator, Page } from "@playwright/test";
import { assertNotOnLoginPage, waitUntilLeftLogin } from "../../utils/navigation-helpers.ts";

/**
 * Tạo khóa học mới — `/courses/detail` ([Add new Course](https://test-merchant.hasaki.vn/courses/detail)).
 * Form `form#formCourseDetail` (POST về cùng path); cần quyền `courses::create` — guest thường 403.
 */
export class AddNewCoursePage {
  readonly pageTitleH1: Locator;
  readonly formCourseDetail: Locator;
  readonly titleInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly priorityInput: Locator;
  readonly imageDropzone: Locator;
  readonly saveButton: Locator;
  /** FormValidation / Bootstrap — hiện khi Save mà thiếu title */
  readonly titleInvalidFeedback: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formCourseDetail = page.locator("form#formCourseDetail");
    this.titleInput = page.locator("input#title");
    this.descriptionTextarea = page.locator("textarea#description");
    this.priorityInput = page.locator("input#priority");
    this.imageDropzone = this.formCourseDetail.locator(".dropzone.dz-clickable");
    this.saveButton = page.locator("#btnSaveCourseDetail");
    this.titleInvalidFeedback = this.formCourseDetail
      .locator(".invalid-feedback")
      .filter({ hasText: /Title is required/i });
  }

  async goto(baseUrl: string) {
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/courses/detail`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Add new Course: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
    );
    await this.page.waitForSelector("form#formCourseDetail", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectAddCourseFormVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formCourseDetail.waitFor({ state: "visible", timeout: 15000 });
    await this.titleInput.waitFor({ state: "visible", timeout: 10000 });
    await this.descriptionTextarea.waitFor({ state: "visible", timeout: 10000 });
    await this.priorityInput.waitFor({ state: "visible", timeout: 10000 });
    await this.saveButton.waitFor({ state: "visible", timeout: 10000 });
  }

  async fillCourseDetails(data: { title: string; description?: string; priority?: string }) {
    await this.titleInput.fill(data.title);
    if (data.description !== undefined) {
      await this.descriptionTextarea.fill(data.description);
    }
    if (data.priority !== undefined) {
      await this.priorityInput.fill(data.priority);
    }
  }

  async submitSave() {
    await this.saveButton.click();
  }
}
