import type { Locator, Page } from "@playwright/test";

/**
 * Danh sách quotation — `/quotation` ([Quotation](https://test-merchant.hasaki.vn/quotation)).
 * Filter GET `form#formFilter` (status, vendor, store, …), bảng `#table_products`, phân trang `ul.pagination`, page size `#changeSizePage`.
 * Primary nav: sidebar links **Create Quotation** → `/quotation/detail`, **Create Quotation by Excel** → `/quotation/import` (URLs are absolute in DOM). Table: `#table_products` + classes `table-rounded table-striped gy-3`.
 */
export class QuotationListPage {
  readonly pageTitleH1: Locator;
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
  /** Native select (may be wrapped by Select2 — prefer selectOption). */
  readonly vendorSelect: Locator;
  readonly storeSelect: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");

    this.formFilter = page.locator("form#formFilter");
    this.statusSelect = page.locator("select#status");
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.filterResetButton = page.locator("#btnClearFormFilter");
    this.changeSizePageSelect = page.locator("select#changeSizePage");

    this.dataTable = page.locator("table#table_products");
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
    this.pagination = page
      .locator("ul.pagination.float-end")
      .or(page.locator("ul.pagination"))
      .first();

    this.createQuotationLink = page
      .getByRole("link", { name: "Create Quotation" })
      .first();
    this.importByExcelLink = page
      .getByRole("link", { name: "Create Quotation by Excel" })
      .first();

    this.vendorSelect = page.locator("select#vendor");
    this.storeSelect = page.locator("select#store");
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/quotation`, {
      waitUntil: "load",
      timeout: 90_000,
    });
    try {
      await this.page.waitForURL(/\/quotation(\/index)?\/?(\?|#|$)/i, {
        timeout: 30_000,
      });
    } catch {
      if (/\/login(\/|\?|$)/i.test(this.page.url())) {
        throw new Error(
          "Quotation list: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
        );
      }
      throw new Error(`Quotation list: unexpected URL: ${this.page.url()}`);
    }
    await this.page.waitForSelector("form#formFilter", {
      state: "visible",
      timeout: 25_000,
    });
  }

  async expectListShellVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15_000 });
    await this.formFilter.waitFor({ state: "visible", timeout: 15_000 });
    await this.dataTable.waitFor({ state: "visible", timeout: 20_000 });
    await this.tableHeader.waitFor({ state: "visible", timeout: 10_000 });
    await this.tableBody.waitFor({ state: "attached", timeout: 10_000 });
    await this.pagination.waitFor({ state: "visible", timeout: 15_000 });
  }

  /** Giá trị option: "", "0" (New), "1" (Waiting For Confirm), … */
  async selectStatusByValue(value: string) {
    await this.statusSelect.waitFor({ state: "visible", timeout: 10_000 });
    await this.statusSelect.selectOption(value);
  }

  async submitFilter() {
    await this.filterSearchButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
    await this.dataTable.waitFor({ state: "visible", timeout: 20_000 });
  }

  async resetFilter() {
    await this.filterResetButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
    await this.dataTable.waitFor({ state: "visible", timeout: 20_000 });
  }

  async selectPageSize(size: string) {
    await this.changeSizePageSelect.waitFor({
      state: "visible",
      timeout: 10_000,
    });
    await this.changeSizePageSelect.selectOption(size);
    await this.page.waitForLoadState("load").catch(() => null);
    await this.dataTable.waitFor({ state: "visible", timeout: 20_000 });
  }

  /** Trang 1-based theo link `?p=n`. */
  async clickPaginationPage(pageNumber: number) {
    await this.pagination
      .getByRole("link", { name: String(pageNumber), exact: true })
      .click();
    await this.page.waitForURL(
      (url) => url.searchParams.get("p") === String(pageNumber),
      { timeout: 20_000 },
    );
  }

  async clickNextPaginationPage() {
    await this.pagination.locator("li.page-item.next a.page-link").click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async clickCreateQuotation() {
    await this.createQuotationLink.waitFor({
      state: "visible",
      timeout: 15_000,
    });
    await this.createQuotationLink.click();
  }

  async clickImportByExcel() {
    await this.importByExcelLink.waitFor({ state: "visible", timeout: 15_000 });
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
