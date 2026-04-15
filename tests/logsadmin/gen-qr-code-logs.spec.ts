import { GenQrCodeLogsPage } from "../../pages/logsadmin/GenQrCodeLogsPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Logs — Gen QR Code promoter (/logs/qr-code-promoter)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Nghiệp vụ (map UI — không có PDF trong repo):
   * - Tra cứu log tạo QR promoter theo Vendor Staff ID (number), trạng thái, từ khóa, ngày; Search (GET).
   * - Bảng: STT, Vendor Staff ID, Path, Note, Status, Created At.
   * - Trang không có nút Reset trong form filter (chỉ Search).
   */

  test("TC01 - Navigate — URL, title, filters and grid @smoke", async ({ authenticatedPage, baseUrl }) => {
    const logs = new GenQrCodeLogsPage(authenticatedPage.page);

    await logs.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/logs\/qr-code-promoter/i);
    await logs.expectLogsShellVisible();
    await expect(logs.pageTitleH1).toHaveText(/Gen QR Code Promoter Logs/i);
    await expect(logs.vendorStaffIdInput).toBeVisible();
    await expect(logs.statusSelect).toBeAttached();
    expect(await logs.statusSelect.locator("option").count()).toBeGreaterThan(0);
    await expect(logs.searchInput).toBeVisible();
    await expect(logs.dateInput).toBeAttached();
    await expect(logs.filterSearchButton).toBeVisible();
  });

  test("TC02 - Results table lists QR log columns @regression", async ({ authenticatedPage, baseUrl }) => {
    const logs = new GenQrCodeLogsPage(authenticatedPage.page);
    await logs.goto(baseUrl);
    await logs.expectLogsShellVisible();

    const headerText = await logs.tableHeader.innerText();
    expect(headerText).toMatch(/STT|No\.?/i);
    expect(headerText).toMatch(/Vendor Staff ID/i);
    expect(headerText).toMatch(/Path/i);
    expect(headerText).toMatch(/Note/i);
    expect(headerText).toMatch(/Status/i);
    expect(headerText).toMatch(/Created At/i);
  });

  test("TC03 - Search with current filters keeps shell @regression", async ({ authenticatedPage, baseUrl }) => {
    const logs = new GenQrCodeLogsPage(authenticatedPage.page);
    await logs.goto(baseUrl);
    await logs.expectLogsShellVisible();

    await logs.submitSearch();

    await expect(authenticatedPage.page).toHaveURL(/\/logs\/qr-code-promoter/i);
    await logs.expectLogsShellVisible();
    await expect(logs.dataTable).toBeVisible();
  });
});


