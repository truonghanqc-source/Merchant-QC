import type { Locator, Page } from "@playwright/test";
import {
  assertNotOnLoginPage,
  waitUntilLeftLogin,
} from "../../utils/navigation-helpers.ts";

/**
 * Cài đặt toàn cục marketplace — `/setting` ([Global Setting](https://test-merchant.hasaki.vn/setting)).
 * Form POST `form#formSetting`: nhóm quyền trang, draft vendor staff, user/permission, v.v.
 * Guest chưa đăng nhập thường thấy `/login` ([Sign In](https://test-merchant.hasaki.vn/setting)).
 */
export class GlobalPage {
  readonly pageTitleH1: Locator;
  readonly formSetting: Locator;
  readonly marketplaceCardTitle: Locator;
  readonly draftStatusActiveRadio: Locator;
  readonly draftStatusInactiveRadio: Locator;
  /** Nằm trong panel thu gọn — thường `hidden` nhưng vẫn `attached`. */
  readonly saveVendorStaffDraftStatusButton: Locator;
  readonly saveInactiveAccountConfigButton: Locator;
  readonly userSelect: Locator;
  readonly permissionSelect: Locator;
  readonly addPermissionButton: Locator;
  readonly customUserSelect: Locator;
  readonly customPermissionSelect: Locator;
  readonly addCustomPermissionButton: Locator;
  /** Hai lưới permission trong form (thứ tự DOM cố định trên bản dump). */
  readonly permissionTable: Locator;
  readonly customUserPermissionTable: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formSetting = page.locator("form#formSetting");
    this.marketplaceCardTitle = this.formSetting
      .getByText(/Marketplace global setting/i)
      .first();
    this.draftStatusActiveRadio = page.locator("input#status_active");
    this.draftStatusInactiveRadio = page.locator("input#status_inactive");
    this.saveVendorStaffDraftStatusButton = page.locator(
      "#saveVendorStaffDraftStatus",
    );
    this.saveInactiveAccountConfigButton = page.locator(
      "#saveInactiveAccountConfig",
    );
    this.userSelect = page.locator("select#userSelect");
    this.permissionSelect = page.locator("select#permissionSelect");
    this.addPermissionButton = page.locator("#addPermissionBtn");
    this.customUserSelect = page.locator("select#customUserSelect");
    this.customPermissionSelect = page.locator("select#customPermissionSelect");
    this.addCustomPermissionButton = page.locator("#addCustomPermissionBtn");
    this.permissionTable = this.formSetting.locator("table").nth(0);
    this.customUserPermissionTable = this.formSetting.locator("table").nth(1);
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/setting`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Global Setting: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
    );
    await this.page.waitForSelector("form#formSetting", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectGlobalSettingShellVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formSetting.waitFor({ state: "visible", timeout: 15000 });
    await this.marketplaceCardTitle.waitFor({
      state: "visible",
      timeout: 15000,
    });
  }
}
