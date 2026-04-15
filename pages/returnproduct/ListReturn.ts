import type { Locator, Page } from "@playwright/test";
import { assertNotOnLoginPage, waitUntilLeftLogin } from "../../utils/navigation-helpers.ts";

/**
 * Danh sách trả hàng — `/return-product` ([Return Product](https://test-merchant.hasaki.vn/return-product)).
 * Lọc GET `form#formFilter`; lưới `table.table-rounded`; Search giữ nguyên path + query.
 */
export class ListReturnPage {
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly vendorSelect: Locator;
  readonly searchTypeSelect: Locator;
  readonly searchInput: Locator;
  readonly brandSelect: Locator;
  readonly statusSelect: Locator;
  readonly citySelect: Locator;
  readonly stockSelect: Locator;
  readonly filterSearchButton: Locator;
  readonly resetButton: Locator;
  readonly downloadButton: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formFilter = page.locator("form#formFilter");
    this.vendorSelect = page.locator("select#vendor");
    this.searchTypeSelect = page.locator("select#select_search_type");
    this.searchInput = page.locator('input[name="search"]');
    this.brandSelect = page.locator("select#select_brand");
    this.statusSelect = page.locator("select#status");
    this.citySelect = page.locator("select#city");
    this.stockSelect = page.locator("select#select_stock_id");
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.resetButton = page.locator("#btnClearFormFilter");
    this.downloadButton = page.locator("#download_product_ng_btn");
    this.dataTable = page.locator("table.table-rounded").first();
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
  }

  async goto(baseUrl: string) {
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/return-product`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Return Product list: still on /login after navigation. Re-run tests so global-setup refreshes session; check LOGIN_* in .env.local or menu permission for Return Products.",
    );
    await this.page.waitForSelector("form#formFilter, table.table-rounded", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectListShellVisible() {
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
