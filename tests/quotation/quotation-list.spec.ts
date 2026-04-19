import { test, expect } from "../../fixtures/index.ts";
import { QuotationListPage } from "../../pages/quotation/QuotationListPage.ts";

test.describe("Quotation - List (/quotation)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Business (UI): filter quotations (status, vendor, store, …), page size, pagination `p`;
   * navigate to create `/quotation/detail` and import `/quotation/import`.
   * No fixed row-count assertions (shared data). Auth via fixtures / env.
   */

  test("TC01 - Navigate to quotation list — URL and table shell @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const listPage = new QuotationListPage(page);

    await listPage.goto(baseUrl);

    await expect(page).toHaveURL(/\/quotation(\/index)?\/?(\?|#|$)/i);
    await listPage.expectListShellVisible();
    await expect(listPage.pageTitleH1).toHaveText(/quotation|báo giá/i);
  });

  test("TC02 - Create quotation link opens detail page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const listPage = new QuotationListPage(page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    await expect(listPage.createQuotationLink).toBeVisible({ timeout: 15_000 });
    await listPage.clickCreateQuotation();
    await expect(page).toHaveURL(/\/quotation\/detail\/?(\?|#|$)/i, {
      timeout: 20_000,
    });
  });

  test("TC03 - Import by Excel link opens import page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const listPage = new QuotationListPage(page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    await expect(listPage.importByExcelLink).toBeVisible({ timeout: 15_000 });
    await listPage.clickImportByExcel();
    await expect(page).toHaveURL(/\/quotation\/import\/?(\?|#|$)/i, {
      timeout: 20_000,
    });
  });

  test("TC04 - Quotation table has column header row @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const listPage = new QuotationListPage(authenticatedPage.page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    const headerCells = listPage.tableHeader.locator("th, td");
    expect(await headerCells.count()).toBeGreaterThan(0);
    const headerText = await listPage.tableHeader.innerText();
    expect(headerText).toMatch(/STT/i);
    expect(headerText).toMatch(/Code/i);
    expect(headerText).toMatch(/Vendor/i);
    expect(headerText).toMatch(/Type/i);
    expect(headerText).toMatch(/Stock/i);
    expect(headerText).toMatch(/Products/i);
    expect(headerText).toMatch(/PO Code/i);
    expect(headerText).toMatch(/Total/i);
    expect(headerText).toMatch(/Created At/i);
    expect(headerText).toMatch(/Updated At/i);
    expect(headerText).toMatch(/Status/i);
    expect(headerText).toMatch(/Actions/i);
  });

  test("TC05 - Data rows or empty-state row is present @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const listPage = new QuotationListPage(authenticatedPage.page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    const rowCount = await listPage.tableBodyRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("TC06 - Filter by status then Search updates query string @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const listPage = new QuotationListPage(page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    await listPage.selectStatusByValue("0");
    await listPage.submitFilter();

    await expect(page).toHaveURL(/[?&]status=0(?:&|$)/);
    await expect(listPage.statusSelect).toHaveValue("0");
    await expect(listPage.dataTable).toBeVisible();
  });

  test("TC07 - Change page size via #changeSizePage @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const listPage = new QuotationListPage(authenticatedPage.page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    await listPage.selectPageSize("25");
    await expect(listPage.changeSizePageSelect).toHaveValue("25");
    await expect(listPage.dataTable).toBeVisible();
  });

  test("TC08 - Pagination opens page 2 @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const listPage = new QuotationListPage(authenticatedPage.page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    const page2 = listPage.pagination.getByRole("link", {
      name: "2",
      exact: true,
    });
    test.skip(
      (await page2.count()) === 0,
      "Need at least 2 pages of results for page-2 link — skip on low-data env.",
    );

    await listPage.clickPaginationPage(2);
    expect(listPage.currentPageFromUrl()).toBe(2);
    await expect(listPage.dataTable).toBeVisible();
  });

  test("TC09 - Reset clears status filter @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const listPage = new QuotationListPage(authenticatedPage.page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    const second = await listPage.statusSelect
      .locator("option")
      .nth(1)
      .getAttribute("value");
    expect(second).toBeTruthy();
    await listPage.selectStatusByValue(second!);
    await expect(listPage.statusSelect).toHaveValue(second!);

    await listPage.resetFilter();

    await expect(listPage.statusSelect).toHaveValue("");
  });
});
