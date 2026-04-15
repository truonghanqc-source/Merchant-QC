import type { Locator, Page } from "@playwright/test";

/**
 * Danh sách PG/PB — `/promoter` (title: List PG/PB).
 * Bảng `#table_staff_pg`, filter `#formFilter`, phân trang `ul.pagination.float-end`.
 */
export class PgPbListPage {
  readonly pageTitleH1: Locator;
  readonly inactiveNotice: Locator;
  readonly formFilter: Locator;
  readonly vendorSelect: Locator;
  readonly filterSearchButton: Locator;
  readonly filterResetButton: Locator;
  readonly changeSizePageSelect: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;
  readonly pagination: Locator;
  /** Menu: danh sách draft (không có link trực tiếp “create” trên trang list). */
  readonly draftListLink: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.getByRole("heading", { name: "List PG/PB", exact: true });
    this.inactiveNotice = page.locator("p.w-100.fs-6.mb-2");
    this.formFilter = page.locator("form#formFilter");
    this.vendorSelect = page.locator("select#vendor");
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.filterResetButton = page.locator("#btnClearFormFilter");
    this.changeSizePageSelect = page.locator("select#changeSizePage");
    this.dataTable = page.locator("table#table_staff_pg");
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
    this.pagination = page.locator("ul.pagination.float-end");
    this.draftListLink = page.locator('a[href*="/promoter/pg-draft"]').first();
  }

  async goto(baseUrl: string) {
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/promoter`, {
      waitUntil: "load",
      timeout: 60000,
    });
    await this.page.waitForURL(/\/promoter\/?(\?|#|$)/i, { timeout: 30000 });
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
    await this.pagination.waitFor({ state: "visible", timeout: 15000 });
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
    await this.changeSizePageSelect.waitFor({ state: "visible", timeout: 10000 });
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

  async clickDraftList() {
    await this.draftListLink.waitFor({ state: "visible", timeout: 15000 });
    await this.draftListLink.click();
    await this.page.waitForURL(/\/promoter\/pg-draft/i, { timeout: 20000 });
  }
}

/** @deprecated Dùng `PgPbListPage` */
export { PgPbListPage as ListPgPbPage };
