import type { Locator, Page } from "@playwright/test";
import {
  assertNotOnLoginPage,
  waitUntilLeftLogin,
} from "../../utils/navigation-helpers.ts";

/**
 * Báo cáo bán hàng — `/report/sales` ([Report Sales](https://test-merchant.hasaki.vn/report/sales)).
 * Filter GET `form#formFilter`; bảng kết quả `table.table-rounded.table-striped` (không có `#changeSizePage` / pagination trên bản dump).
 */
export class ReportSalesPage {
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly vendorSelect: Locator;
  readonly dateInput: Locator;
  readonly typeSelect: Locator;
  readonly storeSelect: Locator;
  readonly brandSelect: Locator;
  readonly viewCheckbox: Locator;
  readonly showGiftSkuCheckbox: Locator;
  readonly filterSearchButton: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formFilter = page.locator("form#formFilter");
    this.vendorSelect = page.locator("select#vendor");
    this.dateInput = page.locator("input#date");
    this.typeSelect = page.locator("select#type");
    this.storeSelect = page.locator("select#store");
    this.brandSelect = page.locator("select#brand");
    this.viewCheckbox = page.locator("input#view");
    this.showGiftSkuCheckbox = page.locator("input#swShowGiftSku");
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.dataTable = page
      .locator("table.table-rounded.table-striped.gy-3")
      .first();
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/report/sales`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Report Sales: still on /login after navigation. Re-run tests so global-setup refreshes session; if it persists, check LOGIN_* in .env.local or menu permission for Report Sales.",
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
}
