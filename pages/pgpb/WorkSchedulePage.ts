import type { Locator, Page } from "@playwright/test";

/**
 * Lịch làm việc PG/PB — `/promoter/work-schedule`.
 * Filter GET `form#formFilter`: `select#vendor`, `input#search`, `select#location`, `select#status`,
 * `select#workType` (name `work_type`), `input#work_date`, `select#created_by`; phân trang `ul.pagination.float-end`.
 * Bảng `table#table_staff_pg`.
 */
export class WorkSchedulePage {
  /** Tránh trùng `h1` modal Change Password */
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly vendorSelect: Locator;
  readonly searchInput: Locator;
  readonly locationSelect: Locator;
  readonly statusSelect: Locator;
  readonly workTypeSelect: Locator;
  readonly workDateInput: Locator;
  readonly createdBySelect: Locator;
  readonly filterSearchButton: Locator;
  readonly filterResetButton: Locator;
  readonly changeSizePageSelect: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;
  readonly pagination: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.getByRole("heading", {
      name: "Work Schedule",
      exact: true,
    });
    this.formFilter = page.locator("form#formFilter");
    this.vendorSelect = page.locator("select#vendor");
    this.searchInput = page.locator("input#search");
    this.locationSelect = page.locator("select#location");
    this.statusSelect = page.locator("select#status");
    this.workTypeSelect = page.locator("select#workType");
    this.workDateInput = page.locator("input#work_date");
    this.createdBySelect = page.locator("select#created_by");
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.filterResetButton = page.locator("#btnClearFormFilter");
    this.changeSizePageSelect = page.locator("select#changeSizePage");
    this.dataTable = page.locator("table#table_staff_pg");
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
    this.pagination = page.locator("ul.pagination.float-end");
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/promoter/work-schedule`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForURL(/\/promoter\/work-schedule/i, {
      timeout: 30000,
    });
    await this.page.waitForSelector(
      "form#formFilter, table#table_staff_pg, .page-title",
      { state: "visible", timeout: 20000 },
    );
  }

  async expectListShellVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formFilter.waitFor({ state: "visible", timeout: 15000 });
    await this.dataTable.waitFor({ state: "visible", timeout: 20000 });
    await this.tableHeader.waitFor({ state: "visible", timeout: 10000 });
    await this.tableBody.waitFor({ state: "attached", timeout: 10000 });
  }

  async submitFilter() {
    await this.filterSearchButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async resetFilter() {
    await this.filterResetButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async selectPageSize(size: string) {
    await this.changeSizePageSelect.waitFor({
      state: "visible",
      timeout: 10000,
    });
    await this.changeSizePageSelect.selectOption(size);
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async clickPaginationPage(pageNumber: number) {
    await this.pagination
      .getByRole("link", { name: String(pageNumber), exact: true })
      .click();
    await this.page.waitForURL(
      (url) => url.searchParams.get("p") === String(pageNumber),
      { timeout: 20000 },
    );
  }

  currentPageFromUrl(): number {
    const url = new URL(this.page.url());
    const p = url.searchParams.get("p");
    return p ? Number(p) : 1;
  }

  /** First `status` option with a real value, skipping All-status rows. */
  async firstSelectableStatusValue(): Promise<string | null> {
    return this.statusSelect.evaluate((el) => {
      const opts = Array.from((el as HTMLSelectElement).options).filter(
        (o) => o.value !== "" && !/^all\b/i.test(o.textContent?.trim() ?? ""),
      );
      return opts[0]?.value ?? null;
    });
  }

  /** First `created_by` option with a real value, skipping placeholder / All rows. */
  async firstSelectableCreatedByValue(): Promise<string | null> {
    return this.createdBySelect.evaluate((el) => {
      const opts = Array.from((el as HTMLSelectElement).options).filter(
        (o) =>
          o.value !== "" &&
          !/^all\b/i.test(o.textContent?.trim() ?? "") &&
          !/^created\s+by\b/i.test(o.textContent?.trim() ?? ""),
      );
      return opts[0]?.value ?? null;
    });
  }
}
