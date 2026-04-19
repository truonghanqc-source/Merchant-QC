import type { Locator, Page } from "@playwright/test";
import {
  assertNotOnLoginPage,
  waitUntilLeftLogin,
} from "../../utils/navigation-helpers.ts";

/**
 * Log tạo QR promoter — `/logs/qr-code-promoter` ([Gen QR Code Promoter Logs](https://test-merchant.hasaki.vn/logs/qr-code-promoter)).
 * Lọc GET `form#formFilter` (vendor staff id, status, search, date); chỉ có nút **Search** (không Reset trên bản dump).
 * Guest thiếu quyền `logs::logGenQrCode` → 403.
 */
export class GenQrCodeLogsPage {
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly vendorStaffIdInput: Locator;
  readonly statusSelect: Locator;
  readonly searchInput: Locator;
  readonly dateInput: Locator;
  readonly filterSearchButton: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formFilter = page.locator("form#formFilter");
    this.vendorStaffIdInput = page.locator('input[name="vendor_staff_id"]');
    this.statusSelect = page.locator('select[name="status"]');
    this.searchInput = page.locator('input[name="search"]');
    this.dateInput = page.locator('input[name="date"]');
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.dataTable = page
      .locator("table.table-rounded.table-striped.gy-3")
      .first();
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/logs/qr-code-promoter`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Gen QR Code Promoter Logs: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
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
}
