import { VendorConfirmPoPage } from "../../pages/settingadmin/VendorComfirmPoPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Settings — Vendor confirm PO pending (/setting/confirm-po-pending)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Nghiệp vụ (map UI — không có PDF trong repo):
   * - Xem danh sách vendor (tên, mã) được cấu hình cho xác nhận PO pending; lọc theo vendor.
   * - **Modify Permission** mở luồng phân quyền — không tự động hóa trong smoke/regression ở đây.
   */

  test("TC01 - Navigate — URL, title, filter, table and modify entrypoint @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new VendorConfirmPoPage(authenticatedPage.page);

    await po.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/setting\/confirm-po-pending/i);
    await po.expectConfirmPoShellVisible();
    await expect(po.pageTitleH1).toHaveText(/Vendor Confirm PO Pending/i);
    await expect(po.vendorSelect).toBeAttached();
    expect(await po.vendorSelect.locator("option").count()).toBeGreaterThan(0);
    await expect(po.modifyPermissionButton).toBeVisible();
  });

  test("TC02 - Results table lists vendor columns @regression", async ({ authenticatedPage, baseUrl }) => {
    const po = new VendorConfirmPoPage(authenticatedPage.page);
    await po.goto(baseUrl);
    await po.expectConfirmPoShellVisible();

    const headerText = await po.tableHeader.innerText();
    expect(headerText).toMatch(/STT|No\.?/i);
    expect(headerText).toMatch(/Vendor Name/i);
    expect(headerText).toMatch(/Vendor Code/i);
  });

  test("TC03 - Vendor filter — select option keeps shell @edge", async ({ authenticatedPage, baseUrl }) => {
    const po = new VendorConfirmPoPage(authenticatedPage.page);
    await po.goto(baseUrl);
    await po.expectConfirmPoShellVisible();

    const firstValue = await po.vendorSelect.locator("option").nth(1).getAttribute("value");
    expect(firstValue).toBeTruthy();
    await po.selectVendor(firstValue!);

    await expect(authenticatedPage.page).toHaveURL(/\/setting\/confirm-po-pending/i);
    await po.expectConfirmPoShellVisible();
    await expect(po.dataTable).toBeVisible();
  });
});


