import { ReportBrandPage } from "../../pages/report/ReportBrandPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Report - Brands (/report/brands)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Nghiệp vụ (map UI — không có tài liệu PDF trong repo):
   * - Xem báo cáo theo vendor, khoảng ngày, kênh (Online / Offline / cả hai), tùy chọn hiển thị (view).
   * - Submit filter (GET) → server trả vùng kết quả: có dữ liệu (bảng) hoặc empty ("No data").
   *
   * Kịch bản:
   * - Smoke: URL, title, filter + vùng kết quả (empty hoặc bảng).
   * - Regression: Search không làm vỡ shell; URL vẫn báo cáo brands.
   * - Regression: `type` có option kênh; checkbox view gắn form.
   * - Edge: chọn vendor + Search vẫn ổn định (Select2 — dùng select native `#vendor`).
   */

  test("TC01 - Navigate — URL, title, filter and results area @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportBrandPage(authenticatedPage.page);

    await report.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/report\/brands/i);
    await report.expectReportShellVisible();
    await expect(report.pageTitleH1).toHaveText(/Report Brands/i);
    await expect(report.dateInput).toBeVisible();
    await expect(report.vendorSelect).toBeAttached();
    await expect(report.filterSearchButton).toBeVisible();
  });

  test("TC02 - Search with current filters keeps shell @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportBrandPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    await report.submitSearch();
    await expect(authenticatedPage.page).toHaveURL(/\/report\/brands/i);
    await report.expectReportShellVisible();
  });

  test("TC03 - Filter controls — channel type options and view toggle @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportBrandPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    expect(await report.typeSelect.locator("option").count()).toBeGreaterThan(0);
    await expect(report.typeSelect.locator("option").nth(0)).toHaveText(/online/i);
    await expect(report.viewCheckbox).toBeAttached();
  });

  test("TC04 - Vendor filter — select option and search @edge", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportBrandPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    const firstValue = await report.vendorSelect.locator("option").nth(1).getAttribute("value");
    expect(firstValue).toBeTruthy();
    await report.vendorSelect.selectOption(firstValue!);

    await report.submitSearch();
    await expect(authenticatedPage.page).toHaveURL(/\/report\/brands/i);
    await report.expectReportShellVisible();
  });

  test("TC05 - Empty or tabular outcome — No data or table @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportBrandPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();
    await report.submitSearch();

    const noData = report.resultsMessage.locator("h4.text-danger");
    const hasNoData = await noData.isVisible().catch(() => false);
    const hasTable = await report.dataTable.isVisible().catch(() => false);

    expect(hasNoData || hasTable).toBe(true);
    if (hasNoData) {
      await expect(noData).toContainText(/no data/i);
    }
    if (hasTable) {
      await expect(report.dataTable.locator("thead")).toBeVisible();
    }
  });
});


