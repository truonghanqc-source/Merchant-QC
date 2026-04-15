import type { Locator, Page } from "@playwright/test";
import { assertNotOnLoginPage, waitUntilLeftLogin } from "../../utils/navigation-helpers.ts";

/**
 * Cấu hình vendor được phép xác nhận PO đang pending — `/setting/confirm-po-pending`
 * ([Vendor Confirm PO Pending](https://test-merchant.hasaki.vn/setting/confirm-po-pending)).
 * `form#formFilter`: lọc `#vendor` (Select2, vẫn select native `#vendor`); nút **Modify Permission** `#add_permission`.
 * Chưa đăng nhập thường về `/login` ([Sign In](https://test-merchant.hasaki.vn/setting/confirm-po-pending)).
 */
export class VendorConfirmPoPage {
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly vendorSelect: Locator;
  readonly modifyPermissionButton: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formFilter = page.locator("form#formFilter");
    this.vendorSelect = page.locator("select#vendor");
    this.modifyPermissionButton = page.locator("#add_permission");
    this.dataTable = page.locator("table.table-rounded.table-striped.gy-3").first();
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
  }

  async goto(baseUrl: string) {
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/setting/confirm-po-pending`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Vendor Confirm PO Pending: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
    );
    await this.page.waitForSelector("form#formFilter, table.table-striped", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectConfirmPoShellVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formFilter.waitFor({ state: "visible", timeout: 15000 });
    await this.dataTable.waitFor({ state: "visible", timeout: 20000 });
    await this.tableHeader.waitFor({ state: "visible", timeout: 10000 });
    await this.tableBody.waitFor({ state: "attached", timeout: 10000 });
  }

  /** Chọn vendor (native `select#vendor`); không bấm Modify Permission (tránh modal / quyền). */
  async selectVendor(value: string) {
    await this.vendorSelect.selectOption(value);
    await this.page.waitForLoadState("load").catch(() => null);
  }
}
