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
  readonly navLinkWaitForApproveList: Locator;
  readonly navLinkNotDisclosureList: Locator;
  readonly navLinkNotCoaList: Locator;
  readonly navLinkOutStockList: Locator;
  readonly navLinkWarningList: Locator;
  readonly navLinkOutDateList: Locator;
  readonly navLinkNearExpireList: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.getByRole("heading", {
      name: "Product List",
      exact: true,
    });
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
    this.navLinkWaitForApproveList = page
      .locator("li.nav-item")
      .getByRole("link", { name: /Wait for approve/i });

    this.navLinkNotDisclosureList = page
      .locator("li.nav-item")
      .getByRole("link", { name: /Not Disclosure/i });

    this.navLinkNotCoaList = page
      .locator("li.nav-item")
      .getByRole("link", { name: /Not COA/i });

    this.navLinkOutStockList = page
      .locator("li.nav-item")
      .getByRole("link", { name: /Out of Stock/i });

    this.navLinkWarningList = page
      .locator("li.nav-item")
      .getByRole("link", { name: /Warning/i });

    this.navLinkOutDateList = page
      .locator("li.nav-item")
      .getByRole("link", { name: /Out Date/i });

    this.navLinkNearExpireList = page
      .locator("li.nav-item")
      .getByRole("link", { name: /Near Expiration Date/i });
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/product`, {
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
    if (this.page.isClosed()) {
      throw new Error(
        "Page is already closed (test timeout, browser closed, or context disposed). " +
          "This is not a missing locator on /product — raise suite timeout or run with --workers=1.",
      );
    }
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
    await this.page.waitForLoadState("domcontentloaded").catch(() => null);
    await this.page.waitForURL(/\/product\/?/i, { timeout: 30_000 });
    await this.formFilter.waitFor({ state: "visible", timeout: 20_000 });
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

  /** Nhập từ khóa tìm theo tên rồi Search (functional). */
  async searchByName(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.submitFilter();
  }

  async searchBySku(sku: string) {
    await this.searchSkuInput.fill(sku);
    await this.submitFilter();
  }

  async searchByBarcode(barcode: string) {
    await this.searchBarcodeInput.fill(barcode);
    await this.submitFilter();
  }

  /**
   * Chọn ngẫu nhiên một brand (bỏ qua option đầu "All brand" `value=""`).
   * `select#brand` bị Select2 ẩn — Playwright `selectOption` vẫn gán được và đồng bộ UI.
   */
  async selectRandomBrand() {
    const n = await this.brandSelect
      .locator("option[value]:not([value=''])")
      .count();
    if (n === 0) {
      throw new Error(
        'select#brand has no option with value (only "All brand"?)',
      );
    }
    await this.brandSelect.selectOption({
      index: 1 + Math.floor(Math.random() * n),
    });
    await this.submitFilter();
  }

  /**
   * Chọn ngẫu nhiên một loại sản phẩm (bỏ qua "All Type", `value="all"`).
   * `select#product_type` là native `<select>` (không Select2) — `selectOption` trực tiếp.
   */
  async selectRandomTypeProduct() {
    const n = await this.productTypeSelect
      .locator('option[value]:not([value="all"])')
      .count();
    if (n === 0) {
      throw new Error(
        'select#product_type has no option besides All Type (value="all")',
      );
    }
    await this.productTypeSelect.selectOption({
      index: 1 + Math.floor(Math.random() * n),
    });
    await this.submitFilter();
  }

  /**
   * Chọn ngẫu nhiên một declaration status (bỏ qua dòng đầu `value=""` — label "Declaration Status").
   * `select#declaration_status` có Select2 — `selectOption` trên `<select>` vẫn hợp lệ như `select#brand`.
   */
  async selectRandomDeclarationStatus() {
    const n = await this.declarationStatusSelect
      .locator("option[value]:not([value=''])")
      .count();
    if (n === 0) {
      throw new Error(
        "select#declaration_status has no option with value (only placeholder row?)",
      );
    }
    await this.declarationStatusSelect.selectOption({
      index: 1 + Math.floor(Math.random() * n),
    });
    await this.submitFilter();
  }

  /**
   * Chọn ngẫu nhiên return policy (bỏ qua placeholder `value=""` — label "Return Policy").
   * `select#return_policy` có Select2 — `selectOption` trên `<select>` giống `brand` / `declaration_status`.
   */
  async selectRandomReturnPolicy() {
    const n = await this.returnPolicySelect
      .locator("option[value]:not([value=''])")
      .count();
    if (n === 0) {
      throw new Error(
        "select#return_policy has no option with value (only placeholder row?)",
      );
    }
    await this.returnPolicySelect.selectOption({
      index: 1 + Math.floor(Math.random() * n),
    });
    await this.submitFilter();
  }

  async clickStockFcCheckbox() {
    await this.stockFcCheckbox.click();
  }

  async clickNavLinkWaitForApproveList() {
    await this.navLinkWaitForApproveList.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async clickNavLinkNotDisclosureList() {
    await this.navLinkNotDisclosureList.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async clickNavLinkNotCoaList() {
    await this.navLinkNotCoaList.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async clickNavLinkOutStockList() {
    await this.navLinkOutStockList.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async clickNavLinkWarningList() {
    await this.navLinkWarningList.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async clickNavLinkOutDateList() {
    await this.navLinkOutDateList.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async clickNavLinkNearExpireList() {
    await this.navLinkNearExpireList.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }
}
