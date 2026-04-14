import { PgPbReportPage } from "../../pages/pgpb/PgPbReportPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("PG/PB - Report (/promoter/promoter-report)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("Navigate — URL, title, filter form and main table @smoke", async ({
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

  test("Table header columns @regression", async ({
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

  test("Search reloads report without error @regression", async ({
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

  test("Reset keeps shell visible @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new PgPbReportPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    await report.resetFilters();
    await report.expectReportShellVisible();
  });

  test("Apply date range control visible; table body present @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const report = new PgPbReportPage(authenticatedPage.page);
    await report.goto(baseUrl);
    await report.expectReportShellVisible();

    await expect(report.applyDateRangeButton).toBeAttached();
    expect(await report.tableBodyRows.count()).toBeGreaterThan(0);
  });
});
