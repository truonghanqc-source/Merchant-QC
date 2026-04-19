import type { Locator, Page } from "@playwright/test";
import {
  assertNotOnLoginPage,
  waitUntilLeftLogin,
} from "../../utils/navigation-helpers.ts";

/**
 * Log gọi API đã gửi — `/logs/sent-api` ([Sent API Logs](https://test-merchant.hasaki.vn/logs/sent-api)).
 * Lọc GET `form#formFilter`: endpoint, HTTP method, status, date; Search + Reset.
 * Guest thiếu quyền `logs::sentApi` → 403.
 */
export class SentApiLogsPage {
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly endpointInput: Locator;
  readonly methodSelect: Locator;
  readonly statusSelect: Locator;
  readonly dateInput: Locator;
  readonly filterSearchButton: Locator;
  readonly resetButton: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formFilter = page.locator("form#formFilter");
    this.endpointInput = page.locator("input#endpoint");
    this.methodSelect = page.locator("select#method");
    this.statusSelect = page.locator("select#status");
    this.dateInput = page.locator("input#date");
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.resetButton = page.locator("#btnClearFormFilter");
    this.dataTable = page
      .locator("table.table-rounded.table-striped.gy-3")
      .first();
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/logs/sent-api`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Sent API Logs: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
    );
    await this.page.waitForSelector("form#formFilter, table.table-striped", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectLogsShellVisible() {
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
