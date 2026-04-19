import type { Locator, Page } from "@playwright/test";
import { waitForNextPaint } from "../../utils/page-waits.ts";

/**
 * Tạo lịch làm việc PG/PB — `/promoter/work-schedule/create`.
 * Form chính `form#formSubmit` (không dùng `form#formChangePassword`, `form#modalFormScheduleInline`).
 */
export class CreateSchedulePage {
  /** Tiêu đề trang (breadcrumb) — cùng module Work Schedule. */
  readonly pageTitleH1: Locator;
  readonly mainForm: Locator;
  readonly vendorSelect: Locator;
  /** Checkbox inline vs merchandising (`name="workType"`). */
  readonly workTypeCheckbox: Locator;
  readonly staffSelect: Locator;
  readonly locationSelect: Locator;
  readonly workDateHidden: Locator;
  /** Visible date field (Flatpickr); hidden `input#work_date` shares the same placeholder. */
  readonly workDateInput: Locator;
  readonly shiftSelect: Locator;
  readonly ptInInput: Locator;
  readonly ptOutInput: Locator;
  readonly noteTextarea: Locator;
  readonly saveButton: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.getByRole("heading", {
      name: "Work Schedule",
      exact: true,
    });
    this.mainForm = page.locator("form#formSubmit");
    this.vendorSelect = this.mainForm.locator("select#vendor_id");
    this.workTypeCheckbox = this.mainForm.locator(
      'input#workType[type="checkbox"]',
    );
    this.staffSelect = this.mainForm.locator("select#staff_id");
    this.locationSelect = this.mainForm.locator("select#loc_id");
    this.workDateHidden = this.mainForm.locator("input#work_date");
    this.workDateInput = this.mainForm.locator(
      'input:not([type="hidden"])[placeholder="Working Date"]',
    );
    this.shiftSelect = this.mainForm.locator("select#shift_id");
    this.ptInInput = this.mainForm.locator("#pt_in");
    this.ptOutInput = this.mainForm.locator("#pt_out");
    this.noteTextarea = this.mainForm.locator("textarea#note");
    this.saveButton = this.mainForm.locator('button[type="submit"]');
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/promoter/work-schedule/create`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForURL(/\/promoter\/work-schedule\/create/i, {
      timeout: 30000,
    });
    await this.mainForm.waitFor({ state: "visible", timeout: 20000 });
  }

  async expectCreateFormVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.mainForm.waitFor({ state: "visible", timeout: 15000 });
    await this.vendorSelect.waitFor({ state: "attached", timeout: 10000 });
    await this.saveButton.waitFor({ state: "visible", timeout: 10000 });
  }

  async submit() {
    await this.saveButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async getValidationErrors() {
    await waitForNextPaint(this.page);
    const errorLoc = this.page.locator(
      ".text-danger, .invalid-feedback, .alert-danger, " +
        ".swal2-html-container, .swal2-content, " +
        "[role='alert'], [role='status']",
    );
    const errors = await errorLoc.allTextContents();
    return [...new Set(errors.map((x) => x.trim()).filter(Boolean))];
  }
}
