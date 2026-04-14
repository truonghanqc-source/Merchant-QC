import { test, expect } from "../../fixtures/index.ts";
import { QuotationListPage } from "../../pages/quotation/QuotationListPage.ts";

test.describe("Quotation - List (/quotation)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("Navigate to quotation list — URL and table shell @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const listPage = new QuotationListPage(page);

    await listPage.goto(baseUrl);

    await expect(page).toHaveURL(/\/quotation(\/index)?\/?(\?|#|$)/i);
    await listPage.expectListShellVisible();
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Create quotation link opens detail page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const listPage = new QuotationListPage(page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    await expect(listPage.createQuotationLink).toBeVisible({ timeout: 15000 });
    await listPage.clickCreateQuotation();
    await expect(page).toHaveURL(/\/quotation\/detail\/?(\?|#|$)/i, {
      timeout: 20000,
    });
  });

  test("Import by Excel link opens import page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const listPage = new QuotationListPage(page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    await expect(listPage.importByExcelLink).toBeVisible({ timeout: 15000 });
    await listPage.clickImportByExcel();
    await expect(page).toHaveURL(/\/quotation\/import\/?(\?|#|$)/i, {
      timeout: 20000,
    });
  });

  test("Quotation table has column header row @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const listPage = new QuotationListPage(authenticatedPage.page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    const headerCells = listPage.tableHeader.locator("th, td");
    expect(await headerCells.count()).toBeGreaterThan(0);
  });

  test("Data rows or empty-state row is present @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const listPage = new QuotationListPage(authenticatedPage.page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    const rowCount = await listPage.tableBodyRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test("Filter by status then Search updates query string @regression", async ({
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
    await expect(listPage.dataTable).toBeVisible();
  });

  test("Change page size via #changeSizePage @regression", async ({
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

  test("Pagination opens page 2 @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const listPage = new QuotationListPage(page);

    await listPage.goto(baseUrl);
    await listPage.expectListShellVisible();

    const page2 = listPage.pagination.getByRole("link", {
      name: "2",
      exact: true,
    });
    if ((await page2.count()) === 0) {
      test.skip();
    }

    await listPage.clickPaginationPage(2);
    expect(listPage.currentPageFromUrl()).toBe(2);
    await expect(listPage.dataTable).toBeVisible();
  });
});
