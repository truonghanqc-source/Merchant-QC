import type { Locator, Page } from "@playwright/test";

/**
 * Danh sách quotation — /quotation
 * (Hasaki Marketplace: bảng `#table_products`, filter `#formFilter`, phân trang `ul.pagination`, không dùng DataTables.)
 */
export class QuotationListPage {
  readonly pageHeading: Locator;
  readonly formFilter: Locator;
  readonly statusSelect: Locator;
  readonly filterSearchButton: Locator;
  readonly filterResetButton: Locator;
  readonly changeSizePageSelect: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;
  readonly pagination: Locator;
  readonly createQuotationLink: Locator;
  readonly importByExcelLink: Locator;
  /** Native select vendor (Select2 — dùng selectOption hoặc UI Select2). */
  readonly vendorSelect: Locator;
  readonly storeSelect: Locator;

  constructor(public readonly page: Page) {
    this.pageHeading = page
      .locator("h1, h2")
      .filter({ hasText: /quotation|báo giá/i })
      .first();

    this.formFilter = page.locator("form#formFilter");
    this.statusSelect = page.locator("select#status");
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.filterResetButton = page.locator("#btnClearFormFilter");
    this.changeSizePageSelect = page.locator("select#changeSizePage");

    this.dataTable = page.locator("table#table_products");
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
    this.pagination = page.locator("ul.pagination.float-end");

    this.createQuotationLink = page.locator('a[href*="/quotation/detail"]').first();
    this.importByExcelLink = page.locator('a[href*="/quotation/import"]').first();

    this.vendorSelect = page.locator("select#vendor");
    this.storeSelect = page.locator("select#store");
  }

  async goto(baseUrl: string) {
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/quotation`);
    await this.page.waitForURL(/\/quotation(\/index)?\/?(\?|#|$)/i, {
      timeout: 30000,
    });
    await this.page.waitForSelector(
      "main, .content-wrapper, .content, .card, table#table_products, h1, h2",
      { state: "visible", timeout: 20000 },
    );
  }

  async expectListShellVisible() {
    await this.formFilter.waitFor({ state: "visible", timeout: 15000 });
    await this.dataTable.waitFor({ state: "visible", timeout: 20000 });
    await this.tableHeader.waitFor({ state: "visible", timeout: 10000 });
    await this.tableBody.waitFor({ state: "attached", timeout: 10000 });
    await this.pagination.waitFor({ state: "visible", timeout: 10000 });
  }

  /** Giá trị option: "", "0" (New), "1" (Waiting For Confirm), … */
  async selectStatusByValue(value: string) {
    await this.statusSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.statusSelect.selectOption(value);
  }

  async submitFilter() {
    await this.filterSearchButton.click();
    await this.page.waitForLoadState("networkidle").catch(() => null);
  }

  async resetFilter() {
    await this.filterResetButton.click();
    await this.page.waitForLoadState("networkidle").catch(() => null);
  }

  async selectPageSize(size: string) {
    await this.changeSizePageSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.changeSizePageSelect.selectOption(size);
    await this.page.waitForLoadState("networkidle").catch(() => null);
  }

  /** Trang 1-based theo link `?p=n`. */
  async clickPaginationPage(pageNumber: number) {
    await this.pagination
      .getByRole("link", { name: String(pageNumber), exact: true })
      .click();
    await this.page.waitForURL(
      (url) => url.searchParams.get("p") === String(pageNumber),
      { timeout: 20000 },
    );
  }

  async clickNextPaginationPage() {
    await this.pagination.locator("li.page-item.next a.page-link").click();
    await this.page.waitForLoadState("networkidle").catch(() => null);
  }

  async clickCreateQuotation() {
    await this.createQuotationLink.waitFor({ state: "visible", timeout: 15000 });
    await this.createQuotationLink.click();
  }

  async clickImportByExcel() {
    await this.importByExcelLink.waitFor({ state: "visible", timeout: 15000 });
    await this.importByExcelLink.click();
  }

  async dataRowCount(): Promise<number> {
    const rows = this.tableBodyRows;
    const n = await rows.count();
    if (n === 0) return 0;
    const first = rows.first();
    const colspan = await first.getAttribute("colspan");
    if (colspan && Number(colspan) > 1) return 0;
    return n;
  }

  currentPageFromUrl(): number {
    const url = new URL(this.page.url());
    const p = url.searchParams.get("p");
    return p ? Number(p) : 1;
  }
}
