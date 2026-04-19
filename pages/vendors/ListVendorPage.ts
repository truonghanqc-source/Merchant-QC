import type { Locator, Page } from "@playwright/test";
import {
  assertNotOnLoginPage,
  waitUntilLeftLogin,
} from "../../utils/navigation-helpers.ts";

/**
 * Vendor list — `/vendors` ([Vendor List](https://test-merchant.hasaki.vn/vendors)).
 * Filter `form#formFilter`: company, name, email, phone, vendor_code; approve / status / sort; optional checkboxes `have_public_member`, `existed_allow_store`; Search / Reset. Grid: vendor directory and approval workflow.
 */
export class ListVendorPage {
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly companyInput: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly vendorCodeInput: Locator;
  readonly approveSelect: Locator;
  readonly statusSelect: Locator;
  readonly sortSelect: Locator;
  readonly havePublicMemberCheckbox: Locator;
  readonly existedAllowStoreCheckbox: Locator;
  readonly filterSearchButton: Locator;
  readonly resetButton: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formFilter = page.locator("form#formFilter");
    this.companyInput = page.locator("input#company");
    this.nameInput = page.locator("input#name");
    this.emailInput = page.locator("input#email");
    this.phoneInput = page.locator("input#phone");
    this.vendorCodeInput = page.locator("input#vendor_code");
    this.approveSelect = page.locator("select#approve");
    this.statusSelect = page.locator("select#status");
    this.sortSelect = page.locator("select#sort");
    this.havePublicMemberCheckbox = page.locator("input#have_public_member");
    this.existedAllowStoreCheckbox = page.locator("input#existed_allow_store");
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
    await this.page.goto(`${baseUrl}/vendors`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Vendor list: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
    );
    await this.page.waitForSelector("form#formFilter", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectListShellVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formFilter.waitFor({ state: "visible", timeout: 15000 });
    await this.companyInput.waitFor({ state: "visible", timeout: 10000 });
    await this.nameInput.waitFor({ state: "visible", timeout: 10000 });
    await this.emailInput.waitFor({ state: "visible", timeout: 10000 });
    await this.phoneInput.waitFor({ state: "visible", timeout: 10000 });
    await this.vendorCodeInput.waitFor({ state: "visible", timeout: 10000 });
    await this.approveSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.statusSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.sortSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.havePublicMemberCheckbox.waitFor({
      state: "attached",
      timeout: 5000,
    });
    await this.existedAllowStoreCheckbox.waitFor({
      state: "attached",
      timeout: 5000,
    });
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
