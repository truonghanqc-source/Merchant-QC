import type { Locator, Page } from "@playwright/test";
import { waitForNextPaint } from "../../utils/page-waits.ts";

/**
 * Add Multi Work Schedule — `/promoter/multi-work-schedule`.
 * Step 1: vendor `#vendorFilter`, PG search `#searchSelectedPG`, `button#btnAddPgPb`, `button#btnNext`.
 * Modal inline shift: `#scheduleInlineMultiShift`, `button#btnInlineMultiSave`.
 *
 * DOM cross-checked with Playwright MCP (`project-0-Web-Merchant-playwright`) on test-merchant.
 */
export class CreateScheduleMultiPage {
  /** Breadcrumb `h1` (avoids duplicate `h3.card-title` same text). */
  readonly pageTitleH1: Locator;
  readonly vendorFilterSection: Locator;
  readonly vendorSelect: Locator;
  readonly searchPgInput: Locator;
  readonly addPgPbButton: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly saveButton: Locator;
  readonly cancelWorkScheduleLink: Locator;
  /** Step 2+: table filter. */
  readonly searchTableInput: Locator;
  /** Selected PG/PB table (may be hidden on step 1; use `selectedPgSectionHeading` for visibility). */
  readonly dataTable: Locator;
  readonly selectedPgSectionHeading: Locator;
  /** Step 1 empty state copy under Selected PG/PB (MCP: “No Data” + hint). */
  readonly selectedPgEmptyHint: Locator;
  readonly multiShiftModal: Locator;
  readonly modalSaveButton: Locator;
  /** Modal “Select PG/PB”. */
  readonly selectPgModal: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.vendorFilterSection = page.locator("#vendorFilterSection");
    this.vendorSelect = page.locator("select#vendorFilter");
    this.searchPgInput = page.locator("input#searchSelectedPG");
    this.addPgPbButton = page.locator("button#btnAddPgPb");
    this.nextButton = page.locator("button#btnNext");
    this.backButton = page.locator("button#btnBack");
    this.saveButton = page.locator("button#btnSave");
    this.cancelWorkScheduleLink = page
      .locator('.card-header a[href*="/promoter/work-schedule"]')
      .filter({ hasText: /^Cancel$/i });
    this.searchTableInput = page.locator("input#searchTable");
    this.dataTable = page.locator(".card-body table.table-hover").first();
    this.selectedPgSectionHeading = page.getByRole("heading", {
      name: "Selected PG/PB",
    });
    this.selectedPgEmptyHint = page.getByText(/Click.*Add PG\/PB.*start/i);
    this.multiShiftModal = page.locator("#scheduleInlineMultiShift");
    this.modalSaveButton = page.locator("button#btnInlineMultiSave");
    this.selectPgModal = page.locator(".modal.show").filter({
      has: page.locator(".modal-title").filter({ hasText: /^Select PG\/PB$/i }),
    });
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/promoter/multi-work-schedule`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForURL(/\/promoter\/multi-work-schedule/i, {
      timeout: 30000,
    });
    await this.vendorFilterSection.waitFor({
      state: "visible",
      timeout: 20000,
    });
  }

  async expectStepOneShellVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.vendorFilterSection.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.vendorSelect.waitFor({ state: "attached", timeout: 10000 });
    await this.searchPgInput.waitFor({ state: "visible", timeout: 10000 });
    await this.addPgPbButton.waitFor({ state: "visible", timeout: 10000 });
    await this.nextButton.waitFor({ state: "visible", timeout: 10000 });
    await this.selectedPgSectionHeading.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.dataTable.waitFor({ state: "attached", timeout: 10000 });
  }

  /**
   * Vendor filter — `select#vendorFilter` + Select2 (`#select2-vendorFilter-results`).
   */
  async selectVendorByLabel(vendorLabel: string) {
    const selectId = "vendorFilter";
    const trimmed = vendorLabel.trim();
    const prefix = trimmed.slice(0, 8);
    const combobox = this.page
      .locator(
        `span[aria-labelledby="select2-${selectId}-container"], ` +
          `span[aria-controls="select2-${selectId}-container"]`,
      )
      .first();
    const results = this.page.locator(`#select2-${selectId}-results`);
    const searchBox = this.page.locator(
      ".select2-dropdown .select2-search__field",
    );

    const openAndPick = async () => {
      await combobox.waitFor({ state: "attached", timeout: 20_000 });
      await combobox.scrollIntoViewIfNeeded().catch(() => null);
      await combobox.click({ force: true });
      await searchBox.waitFor({ state: "visible", timeout: 10_000 });
      await searchBox.fill(prefix);
      await results.waitFor({ state: "visible", timeout: 15_000 });
      const option = results
        .locator(".select2-results__option")
        .filter({ hasText: trimmed });
      await option.first().waitFor({ state: "visible", timeout: 10_000 });
      await option.first().click();
    };

    try {
      await openAndPick();
    } catch {
      await this.page.keyboard.press("Escape");
      await openAndPick();
    }

    await this.addPgPbButton.waitFor({ state: "visible", timeout: 15_000 });
  }

  /** Open modal, tick first staff row, click `Add (n)`. */
  async addFirstStaffFromModal() {
    await this.addPgPbButton.click();
    const modal = this.selectPgModal;
    await modal.waitFor({ state: "visible", timeout: 15_000 });
    const firstItem = modal.locator(".staff-item").first();
    await firstItem.locator('input[type="checkbox"]').check();
    await modal
      .locator(".modal-footer")
      .getByRole("button", { name: /^Add \(\d+\)$/ })
      .click();
    await modal.waitFor({ state: "hidden", timeout: 20_000 }).catch(() => null);
    await this.page
      .locator(".modal-backdrop")
      .waitFor({ state: "hidden", timeout: 5000 })
      .catch(() => null);
  }

  /** First non-empty `location-select` value on the first inline row (staff-dependent). */
  async firstLocationValueInFirstScheduleRow(): Promise<string | null> {
    const row = this.page.locator(".schedule-row.inline-schedule").first();
    return row.locator("select.location-select").evaluate((sel) => {
      const s = sel as HTMLSelectElement;
      const o = Array.from(s.options).find((x) => x.value !== "");
      return o?.value ?? null;
    });
  }

  /** Một dòng inline: location value, shift code (e.g. HC 5), range `DD/MM/YYYY - DD/MM/YYYY`. */
  async fillFirstInlineScheduleRow(opts: {
    locationValue: string;
    shiftValue: string;
    workDateRange: string;
  }) {
    const row = this.page.locator(".schedule-row.inline-schedule").first();
    await row.waitFor({ state: "visible", timeout: 15_000 });
    await row
      .locator("select.location-select")
      .selectOption(opts.locationValue);
    await row.locator("select.shift-select").selectOption(opts.shiftValue);
    const dateInput = row.locator("input.date-range-input").first();
    await dateInput.evaluate((el, v) => {
      const inp = el as HTMLInputElement;
      inp.removeAttribute("readonly");
      inp.value = v;
      inp.dispatchEvent(new Event("input", { bubbles: true }));
      inp.dispatchEvent(new Event("change", { bubbles: true }));
    }, opts.workDateRange);
  }

  async clickNextToReview() {
    await this.nextButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async expectReviewStepVisible() {
    await this.backButton.waitFor({ state: "visible", timeout: 20_000 });
    await this.saveButton.waitFor({ state: "visible", timeout: 20_000 });
    await this.searchTableInput.waitFor({ state: "visible", timeout: 15_000 });
  }

  async saveAllSchedules() {
    await this.saveButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  /** Confirm “Click OK to create the work schedule.” (first Save confirmation). */
  async confirmCreateSchedulesSwal() {
    await this.page
      .locator(".swal2-html-container")
      .filter({ hasText: /create the work schedule/i })
      .waitFor({ state: "visible", timeout: 15_000 });
    await this.confirmSwal();
  }

  async clickNext() {
    await this.nextButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async confirmSwal() {
    const ok = this.page.locator(".swal2-confirm");
    await ok.waitFor({ state: "visible", timeout: 10000 });
    await ok.click();
    await this.page
      .locator(".swal2-container")
      .waitFor({ state: "hidden", timeout: 10000 })
      .catch(() => null);
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
