import type { Locator, Page } from "@playwright/test";
import { assertNotOnLoginPage, waitUntilLeftLogin } from "../../utils/navigation-helpers.ts";

/**
 * Register vendor list — `/user/register-vendor-list` ([Register Vendor List](https://test-merchant.hasaki.vn/user/register-vendor-list)).
 * Filter `form#formFilter`: keyword `#search`, status `#status`; Search / Reset. Grid lists registration workflow (statuses: Waiting Approve → Feedback → Approved / Rejected).
 */
export class ListRegisterPage {
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly searchInput: Locator;
  readonly statusSelect: Locator;
  readonly filterSearchButton: Locator;
  readonly resetButton: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formFilter = page.locator("form#formFilter");
    this.searchInput = page.locator("input#search");
    this.statusSelect = page.locator("select#status");
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
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/user/register-vendor-list`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Register vendor list: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
    );
    await this.page.waitForSelector("form#formFilter", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectListShellVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formFilter.waitFor({ state: "visible", timeout: 15000 });
    await this.searchInput.waitFor({ state: "visible", timeout: 10000 });
    await this.statusSelect.waitFor({ state: "visible", timeout: 10000 });
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
  }
}
