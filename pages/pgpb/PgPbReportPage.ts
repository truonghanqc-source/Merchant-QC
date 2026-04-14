import type { Locator, Page } from "@playwright/test";

/**
 * Báo cáo PG/PB — `/promoter/promoter-report`.
 * Filter `form#filter-form`, bảng `table#main-table.data-table`.
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
    this.applyDateRangeButton = this.filterForm.locator("button.apply-range-btn");
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
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/promoter/promoter-report`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForURL(/\/promoter\/promoter-report/i, { timeout: 30000 });
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
    await this.page.waitForLoadState("networkidle").catch(() => null);
  }

  async resetFilters() {
    await this.resetButton.click();
    await this.page.waitForLoadState("networkidle").catch(() => null);
  }
}
