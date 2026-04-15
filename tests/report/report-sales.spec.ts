import { ReportSalesPage } from "../../pages/report/ReportSalesPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Report - Sales (/report/sales)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Kịch bản (map UI — không có tài liệu PDF đính kèm trong phiên):
   * - Smoke: mở báo cáo, filter + bảng kết quả.
   * - Regression: cột bảng đúng nghiệp vụ bán hàng (SKU, SL, doanh thu, tồn).
   * - Regression: Search với filter hiện tại không làm vỡ trang.
   * - Regression: `type` có option; checkbox view / gift SKU tồn tại trong DOM.
   */

  test("TC01 - Navigate — URL, title, filter and results grid @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const report = new ReportSalesPage(page);

    await report.goto(baseUrl);

    await expect(page).toHaveURL(/\/report\/sales/i);
    await report.expectReportShellVisible();
    await expect(report.pageTitleH1).toHaveText(/Report Sales/i);
    await expect(report.dateInput).toBeVisible();
    await expect(report.vendorSelect).toBeAttached();
    await expect(report.filterSearchButton).toBeVisible();
  });

  test("TC02 - Results table lists sales columns @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportSalesPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    const headerText = await report.tableHeader.innerText();
    expect(headerText).toMatch(/SKU/i);
    expect(headerText).toMatch(/Name/i);
    expect(headerText).toMatch(/Quantity/i);
    expect(headerText).toMatch(/Revenue/i);
    expect(headerText).toMatch(/In stock/i);
  });

  test("TC03 - Search with current filters keeps shell @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportSalesPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    await report.submitSearch();
    await report.expectReportShellVisible();
    await expect(report.dataTable).toBeVisible();
  });

  test("TC04 - Filter controls — report type options and display toggles @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportSalesPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    expect(await report.typeSelect.locator("option").count()).toBeGreaterThan(0);
    await expect(report.viewCheckbox).toBeAttached();
    await expect(report.showGiftSkuCheckbox).toBeAttached();
  });
});


