import { ReportStocksPage } from "../../pages/report/ReportStocksPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Report - Stock (/report/stocks)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Nghiệp vụ (map UI — không có tài liệu PDF trong repo):
   * - Lọc tồn kho: SKU/tên (`search`), vendor, brand, cửa hàng, sắp xếp (`sort`), chỉ xem hết hàng (`out_stock`).
   * - Search (GET) → `/report/stocks/details` + bảng; Reset làm mới filter; Export / Export By Store (không bấm trong E2E để tránh download).
   *
   * Kịch bản:
   * - Smoke: vào `/report/stocks`, filter + lưới.
   * - Regression: tiêu đề cột bảng đúng báo cáo tồn.
   * - Regression: Search chuyển details, shell + bảng còn nguyên.
   * - Regression: điều khiển filter (sort, out of stock, export buttons).
   * - Edge: Reset không làm vỡ shell.
   */

  test("TC01 - Navigate — URL, title, filter and results grid @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportStocksPage(authenticatedPage.page);

    await report.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/report\/stocks$/i);
    await report.expectReportShellVisible();
    await expect(report.pageTitleH1).toHaveText(/Report Stock/i);
    await expect(report.searchInput).toBeVisible();
    await expect(report.vendorSelect).toBeAttached();
    await expect(report.filterSearchButton).toBeVisible();
  });

  test("TC02 - Results table lists stock columns @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportStocksPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    const headerText = await report.tableHeader.innerText();
    expect(headerText).toMatch(/SKU/i);
    expect(headerText).toMatch(/Barcode/i);
    expect(headerText).toMatch(/Product Name/i);
    expect(headerText).toMatch(/Brand/i);
    expect(headerText).toMatch(/In-Stock/i);
    expect(headerText).toMatch(/Price/i);
    expect(headerText).toMatch(/Amount/i);
  });

  test("TC03 - Search navigates to details and keeps grid @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportStocksPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    await report.submitSearch();

    await expect(authenticatedPage.page).toHaveURL(/\/report\/stocks\/details/i);
    await report.expectReportShellVisible();
    await expect(report.dataTable).toBeVisible();
  });

  test("TC04 - Filter controls — sort, out-of-stock toggle, export actions @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new ReportStocksPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    expect(await report.sortSelect.locator("option").count()).toBeGreaterThan(0);
    await expect(report.outOfStockCheckbox).toBeAttached();
    await expect(report.exportButton).toBeVisible();
    await expect(report.exportByStoreButton).toBeVisible();
  });

  test("TC05 - Reset keeps report shell @edge", async ({ authenticatedPage, baseUrl }) => {
    const report = new ReportStocksPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    await report.resetFilters();

    await expect(authenticatedPage.page).toHaveURL(/\/report\/stocks/i);
    await report.expectReportShellVisible();
  });
});


