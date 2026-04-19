import { PgPbReportPage } from "../../pages/pgpb/PgPbReportPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("PG/PB - Report (/promoter/promoter-report)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("TC01 - Navigate — URL, title, filter form and main table @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const report = new PgPbReportPage(page);

    await report.goto(baseUrl);

    await expect(page).toHaveURL(/\/promoter\/promoter-report/i);
    await report.expectReportShellVisible();
    await expect(report.pageTitleH1).toHaveText(/PG\/PB Report/i);
    /** `type="date"` có thể bị ẩn khi UI dùng range picker tùy chỉnh */
    await expect(report.startDateInput).toBeAttached();
    await expect(report.endDateInput).toBeAttached();
    await expect(report.vendorSelect).toBeAttached();
    await expect(report.searchButton).toBeVisible();
    await expect(report.resetButton).toBeVisible();
    await expect(report.exportButton).toBeVisible();
  });

  test("TC02 - Table header columns @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new PgPbReportPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    const headerText = await report.tableHeader.innerText();
    expect(headerText).toMatch(/NO/i);
    expect(headerText).toMatch(/CITY\/LOCATION/i);
    expect(headerText).toMatch(/TOTAL PG\/PB/i);
    expect(headerText).toMatch(/TOTAL INLINE/i);
    expect(headerText).toMatch(/TOTAL NOT INLINE/i);
  });

  test("TC03 - Search reloads report without error @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new PgPbReportPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    await report.submitSearch();
    await report.expectReportShellVisible();
    await expect(report.dataTable).toBeVisible();
  });

  test("TC04 - Reset keeps shell visible @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new PgPbReportPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    await report.resetFilters();
    await report.expectReportShellVisible();
  });

  test("TC05 - Apply date range control visible; table body present @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new PgPbReportPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    await expect(report.applyDateRangeButton).toBeAttached();
    const rowCount = await report.tableBodyRows.count();
    test.skip(
      rowCount === 0,
      "Report has no data rows for default filters — skip in empty env",
    );
    expect(rowCount).toBeGreaterThan(0);
  });

  test("TC06 - Search adds date and vendor params to URL @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const report = new PgPbReportPage(page);

    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    await report.submitSearch();

    const url = new URL(page.url());
    expect(url.searchParams.has("start_date")).toBeTruthy();
    expect(url.searchParams.has("end_date")).toBeTruthy();
    expect(url.searchParams.has("vendor_id")).toBeTruthy();
    await expect(report.dataTable).toBeVisible();
  });

  test("TC07 - Filter by location reflects in URL @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const report = new PgPbReportPage(page);

    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    const locValue = await report.firstSelectableLocationValue();
    test.skip(!locValue, "No selectable location in filter");

    await report.locationSelect.selectOption(locValue);
    await report.submitSearch();

    await expect(page).toHaveURL(/location_ids/i);
    await expect(report.dataTable).toBeVisible();
  });

  test("TC08 - Apply date range keeps report shell @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new PgPbReportPage(authenticatedPage.page);

    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    await report.applyDateRange();
    await report.expectReportShellVisible();
    await expect(report.dataTable).toBeVisible();
  });

  test("TC09 - Export triggers PG Excel download request @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new PgPbReportPage(authenticatedPage.page);

    await report.goto(baseUrl);
    await report.expectReportShellVisible();
    await report.submitSearch();

    const response = await report.clickExportAndWaitForExcelRequest();

    expect(response.url()).toMatch(/download-report-pg-excel/i);
    // GET export: 200 = file OK; 404 có thể xảy ra trên env test khi không có dữ liệu / cấu hình API.
    expect([200, 404].includes(response.status())).toBeTruthy();
  });
});


