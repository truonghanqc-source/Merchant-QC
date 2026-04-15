import type { Locator, Page } from "@playwright/test";

/**
 * Danh sách sản phẩm — `/product` ([Product List](https://test-merchant.hasaki.vn/product)).
 * Bảng chính `#product_list` (tránh lẫn `#tableInventoryExpDateSolution` trong modal).
 */
export class ProductListPage {
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly vendorSelect: Locator;
  readonly searchInput: Locator;
  readonly searchSkuInput: Locator;
  readonly searchBarcodeInput: Locator;
  readonly brandSelect: Locator;
  readonly statusSelect: Locator;
  readonly productTypeSelect: Locator;
  readonly declarationStatusSelect: Locator;
  readonly returnPolicySelect: Locator;
  readonly stockFcCheckbox: Locator;
  readonly filterSearchButton: Locator;
  readonly filterResetButton: Locator;
  readonly changeSizePageSelect: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;
  readonly pagination: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.getByRole("heading", { name: "Product List", exact: true });
    this.formFilter = page.locator("form#formFilter");
    this.vendorSelect = page.locator("select#vendor");
    this.searchInput = page.locator("input#search");
    this.searchSkuInput = page.locator("input#search_sku");
    this.searchBarcodeInput = page.locator("input#search_barcode");
    this.brandSelect = page.locator("select#brand");
    this.statusSelect = page.locator("select#status");
    this.productTypeSelect = page.locator("select#product_type");
    this.declarationStatusSelect = page.locator("select#declaration_status");
    this.returnPolicySelect = page.locator("select#return_policy");
    this.stockFcCheckbox = page.locator("input#stock_fc");
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.filterResetButton = page.locator("#btnClearFormFilter");
    this.changeSizePageSelect = page.locator("select#changeSizePage");
    this.dataTable = page.locator("table#product_list");
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
    this.pagination = page.locator("ul.pagination.float-end");
  }

  async goto(baseUrl: string) {
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/product`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForURL(/\/product\/?(\?|#|$)/i, { timeout: 30000 });
    await this.page.waitForSelector("form#formFilter, table#product_list", {
      state: "visible",
      timeout: 20000,
    });
  }

  /** Filter + lưới `#product_list` (không bắt buộc phân trang — có thể ẩn khi filter trả về ít/0 dòng). */
  async expectFilterAndGridVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formFilter.waitFor({ state: "visible", timeout: 15000 });
    await this.dataTable.waitFor({ state: "visible", timeout: 20000 });
    await this.tableHeader.waitFor({ state: "visible", timeout: 10000 });
    await this.tableBody.waitFor({ state: "attached", timeout: 10000 });
  }

  /** Shell đầy đủ khi mở list mặc định (có phân trang). */
  async expectListShellVisible() {
    await this.expectFilterAndGridVisible();
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

  /** Nhập từ khóa tìm theo tên rồi Search (functional). */
  async searchByName(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.submitFilter();
  }
}
