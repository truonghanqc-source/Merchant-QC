import type { Locator, Page } from "@playwright/test";
import {
  assertNotOnLoginPage,
  waitUntilLeftLogin,
} from "../../utils/navigation-helpers.ts";

/**
 * Báo cáo tồn kho — `/report/stocks` ([Report Stock](https://test-merchant.hasaki.vn/report/stocks)).
 * Filter GET `form#formFilter` (action trỏ tới `/report/stocks/details`); nút Search chuyển sang trang chi tiết có lưới dữ liệu.
 */
export class ReportStocksPage {
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly searchInput: Locator;
  readonly vendorSelect: Locator;
  readonly brandSelect: Locator;
  readonly sortSelect: Locator;
  readonly storeSelect: Locator;
  readonly outOfStockCheckbox: Locator;
  readonly filterSearchButton: Locator;
  readonly resetButton: Locator;
  readonly exportButton: Locator;
  readonly exportByStoreButton: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formFilter = page.locator("form#formFilter");
    this.searchInput = page.locator("input#search");
    this.vendorSelect = page.locator("select#vendor");
    this.brandSelect = page.locator("select#brand");
    this.sortSelect = page.locator("select#sort");
    this.storeSelect = page.locator("select#store");
    this.outOfStockCheckbox = page.locator("input#cb_out_stock");
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.resetButton = this.formFilter.locator('button[type="reset"]');
    /** Tooltip/title làm accessible name khác plain "Export" — dùng id server. */
    this.exportButton = page.locator("#btnDownloadExcel");
    this.exportByStoreButton = page.locator("#btnDownloadExcelStore");
    this.dataTable = page
      .locator("table.table-rounded.table-striped.gy-3")
      .first();
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/report/stocks`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Report Stock: still on /login after navigation. Re-run tests so global-setup refreshes session; check LOGIN_* in .env.local or menu permission for Report Stocks.",
    );
    await this.page.waitForSelector("form#formFilter, table.table-striped", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectReportShellVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formFilter.waitFor({ state: "visible", timeout: 15000 });
    await this.dataTable.waitFor({ state: "visible", timeout: 20000 });
    await this.tableHeader.waitFor({ state: "visible", timeout: 10000 });
    await this.tableBody.waitFor({ state: "attached", timeout: 10000 });
  }

  async submitSearch() {
    await this.filterSearchButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async resetFilters() {
    await this.resetButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }
}
