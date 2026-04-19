import type { Locator, Page } from "@playwright/test";

/**
 * Báo cáo PG/PB — `/promoter/promoter-report`.
 * Filter GET `form#filter-form`: `#start-date`, `#end-date`, `select#vendor`, `select#location_ids`,
 * nút Apply `#apply-range` (`.apply-range-btn`), Search (submit), Reset, Export `#export`.
 * Bảng `table#main-table.data-table`.
 */
export class PgPbReportPage {
  /** Trong `.page-title` để không trùng `h1` modal Change Password. */
  readonly pageTitleH1: Locator;
  readonly filterForm: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly vendorSelect: Locator;
  readonly locationSelect: Locator;
  readonly applyDateRangeButton: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly exportButton: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.filterForm = page.locator("form#filter-form");
    this.startDateInput = page.locator("input#start-date");
    this.endDateInput = page.locator("input#end-date");
    this.vendorSelect = page.locator("select#vendor");
    this.locationSelect = page.locator("select#location_ids");
    this.applyDateRangeButton = this.filterForm.locator(
      "#apply-range, button.apply-range-btn",
    );
    this.searchButton = this.filterForm.locator('button[type="submit"]');
    this.resetButton = this.filterForm.locator('button[type="reset"]');
    /** Có `id="export"` trên test-merchant; `getByRole` có thể không resolve khi UI phức tạp. */
    this.exportButton = this.filterForm.locator("button#export");
    this.dataTable = page.locator("table#main-table.data-table");
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/promoter/promoter-report`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForURL(/\/promoter\/promoter-report/i, {
      timeout: 30000,
    });
    await this.page.waitForSelector("form#filter-form, table#main-table", {
      state: "visible",
      timeout: 20000,
    });
  }

  async expectReportShellVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.filterForm.waitFor({ state: "visible", timeout: 15000 });
    await this.dataTable.waitFor({ state: "visible", timeout: 20000 });
    await this.tableHeader.waitFor({ state: "visible", timeout: 10000 });
    await this.tableBody.waitFor({ state: "attached", timeout: 10000 });
  }

  async submitSearch() {
    await this.searchButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async resetFilters() {
    await this.resetButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  /**
   * Apply is often `display:none` until the range picker opens — trigger via DOM click.
   */
  async applyDateRange() {
    await this.applyDateRangeButton.evaluate((el: HTMLButtonElement) =>
      el.click(),
    );
    await this.page.waitForLoadState("load").catch(() => null);
  }

  /** First location_ids option with a value, skipping All-location rows. */
  async firstSelectableLocationValue(): Promise<string | null> {
    return this.locationSelect.evaluate((el) => {
      const opts = Array.from((el as HTMLSelectElement).options).filter(
        (o) => o.value && !/^all\b/i.test(o.textContent?.trim() ?? ""),
      );
      return opts[0]?.value ?? null;
    });
  }

  async clickExportAndWaitForExcelRequest() {
    const responsePromise = this.page.waitForResponse(
      (r) =>
        r.url().includes("download-report-pg-excel") &&
        r.request().method() === "GET",
      { timeout: 30_000 },
    );
    await this.exportButton.click({ force: true });
    return responsePromise;
  }
}
