import { GlobalPage } from "../../pages/settingadmin/GlobalPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Settings — Global (/setting)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Nghiệp vụ (map UI — không có PDF trong repo):
   * - Cấu hình marketplace: nhóm quyền trang, thêm quyền user, custom user permission, draft vendor staff, inactive account, v.v.
   * - Không submit Save trong E2E (tránh đổi cấu hình production/shared env); chỉ assert shell và control chính.
   */

  test("TC01 - Navigate — URL, title and main form shell @smoke", async ({ authenticatedPage, baseUrl }) => {
    const global = new GlobalPage(authenticatedPage.page);

    await global.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/setting(\?|$)/i);
    await global.expectGlobalSettingShellVisible();
    await expect(global.pageTitleH1).toHaveText(/Global Setting/i);
    await expect(global.draftStatusActiveRadio).toBeAttached();
    await expect(global.draftStatusInactiveRadio).toBeAttached();
    await expect(global.saveVendorStaffDraftStatusButton).toBeAttached();
    await expect(global.userSelect).toBeAttached();
    await expect(global.permissionSelect).toBeAttached();
    await expect(global.addPermissionButton).toBeAttached();
  });

  test("TC02 - Permission grids expose column headers @regression", async ({ authenticatedPage, baseUrl }) => {
    const global = new GlobalPage(authenticatedPage.page);
    await global.goto(baseUrl);
    await global.expectGlobalSettingShellVisible();

    await expect(global.permissionTable.locator("thead")).toContainText(/Email/i);
    await expect(global.permissionTable.locator("thead")).toContainText(/Full name|Full Name/i);
    await expect(global.customUserPermissionTable.locator("thead")).toContainText(/Email/i);
    await expect(global.customUserPermissionTable.locator("thead")).toContainText(/Full Name/i);
  });

  test("TC03 - Key configuration actions are present @regression", async ({ authenticatedPage, baseUrl }) => {
    const global = new GlobalPage(authenticatedPage.page);
    await global.goto(baseUrl);
    await global.expectGlobalSettingShellVisible();

    await expect(global.formSetting).toContainText(/Pages Access Permission Group/i);
    await expect(global.formSetting).toContainText(/Vendor Staff Draft Status Configuration/i);
    await expect(global.formSetting).toContainText(/Inactive account Config/i);
    await expect(global.saveInactiveAccountConfigButton).toBeAttached();
    await expect(global.customUserSelect).toBeAttached();
    await expect(global.customPermissionSelect).toBeAttached();
    await expect(global.addCustomPermissionButton).toBeAttached();
  });
});


