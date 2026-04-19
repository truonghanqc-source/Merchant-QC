import type { Locator, Page } from "@playwright/test";
import {
  assertNotOnLoginPage,
  waitUntilLeftLogin,
} from "../../utils/navigation-helpers.ts";

/**
 * Báo cáo thương hiệu — `/report/brands`.
 * Filter GET `form#formFilterBrand` (vendor Select2, date range, channel type, view checkbox).
 * Kết quả: vùng `.text-center.mt-12` (empty: "No data") hoặc bảng/list khi có dữ liệu (môi trường test thường empty).
 */
export class ReportBrandPage {
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly vendorSelect: Locator;
  readonly dateInput: Locator;
  readonly typeSelect: Locator;
  readonly viewCheckbox: Locator;
  readonly filterSearchButton: Locator;
  /** Empty state / summary area under the filter card */
  readonly resultsMessage: Locator;
  /** Present when server returns tabular brand rows */
  readonly dataTable: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formFilter = page.locator("form#formFilterBrand");
    this.vendorSelect = page.locator("select#vendor");
    this.dateInput = page.locator("input#date");
    this.typeSelect = page.locator("select#type");
    this.viewCheckbox = page.locator("input#view");
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.resultsMessage = page.locator(".text-center.mt-12");
    this.dataTable = page
      .locator("table.table-rounded.table-striped.gy-3")
      .first();
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/report/brands`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Report Brands: still on /login after navigation. Re-run tests so global-setup refreshes session; check LOGIN_* in .env.local or menu permission for Report Brands.",
    );
    await this.page.waitForSelector("form#formFilterBrand", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectReportShellVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formFilter.waitFor({ state: "visible", timeout: 15000 });
    await this.filterSearchButton.waitFor({ state: "visible", timeout: 10000 });
    await this.resultsMessage.waitFor({ state: "visible", timeout: 20000 });
  }

  async submitSearch() {
    await this.filterSearchButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }
}
