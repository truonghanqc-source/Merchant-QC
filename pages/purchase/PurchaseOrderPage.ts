import type { Locator, Page } from "@playwright/test";

/**
 * Danh sách Purchase Order — `/purchase-order` (filter GET `#formFilter`, bảng Bootstrap, phân trang `ul.pagination`).
 * Ví dụ filter mặc định QA: `?status=new`.
 */
export class PurchaseOrderPage {
  readonly pageTitleBlock: Locator;
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly statusHiddenInput: Locator;
  readonly sizeHiddenInput: Locator;
  readonly vendorSelect: Locator;
  readonly poCompanySelect: Locator;
  readonly codeInput: Locator;
  readonly poTypeSelect: Locator;
  readonly deliveryInput: Locator;
  readonly skuInput: Locator;
  readonly createdDateInput: Locator;
  readonly lastModifyInput: Locator;
  readonly filterSearchButton: Locator;
  readonly filterResetButton: Locator;
  readonly openStockModalButton: Locator;
  readonly changeSizePageSelect: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;
  readonly checkAllCheckbox: Locator;
  readonly pagination: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleBlock = page.locator(".page-title");
    this.pageTitleH1 = this.pageTitleBlock.locator("h1");

    this.formFilter = page.locator("form#formFilter");
    this.statusHiddenInput = page.locator('input#status[name="status"]');
    this.sizeHiddenInput = page.locator('input#size[name="size"]');
    this.vendorSelect = page.locator("select#vendor");
    this.poCompanySelect = page.locator("select#po_company");
    this.codeInput = page.locator("input#code");
    this.poTypeSelect = page.locator("select#po_type");
    this.deliveryInput = page.locator("input#delivery");
    this.skuInput = page.locator("input#sku");
    this.createdDateInput = page.locator("input#created_date");
    this.lastModifyInput = page.locator("input#last_modify");

    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.filterResetButton = page.locator("#btnClearFormFilter");
    this.openStockModalButton = page.locator("#btnOpenStockModal");

    this.changeSizePageSelect = page.locator("select#changeSizePage");
    this.dataTable = page.locator("table.table-row-bordered").first();
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
    this.checkAllCheckbox = page.locator("input#checkAll");
    this.pagination = page.locator("ul.pagination.float-end");
  }

  /**
   * @param query — thêm vào query string (mặc định `status: "new"`).
   */
  async goto(
    baseUrl: string,
    query: Record<string, string> = { status: "new" },
  ) {
    const root = baseUrl.replace(/\/$/, "");
    const qs = new URLSearchParams(query).toString();
    await this.page.goto(`${root}/purchase-order?${qs}`, {
      waitUntil: "load",
      timeout: 60000,
    });
    await this.page.waitForURL(/\/purchase-order/i, { timeout: 30000 });
    await this.page.waitForSelector(
      "form#formFilter, table.table-row-bordered, .page-title",
      { state: "visible", timeout: 20000 },
    );
  }

  async expectListShellVisible() {
    await this.formFilter.waitFor({ state: "visible", timeout: 15000 });
    await this.dataTable.waitFor({ state: "visible", timeout: 20000 });
    await this.tableHeader.waitFor({ state: "visible", timeout: 10000 });
    await this.tableBody.waitFor({ state: "attached", timeout: 10000 });
    await this.pagination.waitFor({ state: "visible", timeout: 15000 });
  }

  async fillCodeFilter(code: string) {
    await this.codeInput.waitFor({ state: "visible", timeout: 10000 });
    await this.codeInput.fill(code);
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

  async dataRowCount(): Promise<number> {
    const n = await this.tableBodyRows.count();
    if (n === 0) return 0;
    const first = this.tableBodyRows.first();
    const colspan = await first.getAttribute("colspan");
    if (colspan && Number(colspan) > 1) return 0;
    return n;
  }
}
