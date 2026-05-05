import { ProductListPage } from "../../pages/product/ProductListPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Product - List - Tab Active", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("TC01 - Navigate — URL, title, filter shell and main grid @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const list = new ProductListPage(page);

    await list.goto(baseUrl);

    await expect(page).toHaveURL(/\/product\/?(\?|#|$)/i);
    await list.expectListShellVisible();
    await expect(list.pageTitleH1).toHaveText(/Product List/i);
    await expect(list.searchInput).toBeVisible();
    await expect(list.vendorSelect).toBeAttached();
    await expect(list.filterSearchButton).toBeVisible();
    await expect(list.filterResetButton).toBeVisible();
  });

  test("TC02 - Table lists core commerce columns @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const headerText = await list.tableHeader.innerText();
    expect(headerText).toMatch(/Thumbnail/i);
    expect(headerText).toMatch(/Name/i);
    expect(headerText).toMatch(/Hasaki Price|Price/i);
    expect(headerText).toMatch(/Brand/i);
    expect(headerText).toMatch(/Actions/i);
  });

  test("TC03 - Filter selects expose options (sanity / validation) @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    expect(await list.statusSelect.locator("option").count()).toBeGreaterThan(
      0,
    );
    expect(
      await list.productTypeSelect.locator("option").count(),
    ).toBeGreaterThan(0);
  });

  test("TC04 - Search by unlikely keyword — page still usable (edge) @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.searchByName("__playwright_no_such_product__");
    await list.expectFilterAndGridVisible();
    await expect(list.dataTable).toBeVisible();
  });

  test("TC05 - Reset clears interaction path without breaking layout @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.searchInput.fill("probe");
    await list.resetFilter();
    await list.expectListShellVisible();
  });

  test("TC06 - Change page size @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.selectPageSize("25");
    await expect(list.changeSizePageSelect).toHaveValue("25");
  });

  test("TC07 - Pagination to page 2 when available @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const list = new ProductListPage(page);

    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const link2 = list.pagination.getByRole("link", { name: "2", exact: true });
    if ((await link2.count()) === 0) {
      test.skip();
    }

    await list.clickPaginationPage(2);
    expect(list.currentPageFromUrl()).toBe(2);
    await expect(list.dataTable).toBeVisible();
  });

  test("TC08 - Product grid shows rows @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    expect(await list.tableBodyRows.count()).toBeGreaterThan(0);
  });

  test("TC09 - Search with Stock FC checkbox @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.clickStockFcCheckbox();
    expect(await list.tableBodyRows.count()).toBeGreaterThan(0);
  });

  test("TC10 - Search with Name input @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.searchByName("Auto Product ");
    expect(await list.tableBodyRows.count()).toBeGreaterThan(0);
  });

  test("TC11 - Search with SKU input @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.searchBySku("422505046");
    expect(await list.tableBodyRows.count()).toBeGreaterThan(0);
  });

  test("TC12 - Search with Barcode input @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.searchByBarcode("5132374681754");
    expect(await list.tableBodyRows.count()).toBeGreaterThan(0);
  });

  test("TC13 - Search with Brand input @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.selectRandomBrand();
    await list.submitFilter();
    expect(await list.tableBodyRows.count()).toBeGreaterThan(0);
  });

  test("TC14 - Search with Type Product input @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.selectRandomTypeProduct();
    await list.submitFilter();
    expect(await list.tableBodyRows.count()).toBeGreaterThan(0);
  });

  test("TC15 - Search with Declaration Status input @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.selectRandomDeclarationStatus();
    await list.submitFilter();
    await expect(list.dataTable).toBeVisible();
  });

  test("TC16 - Search with Return Policy input @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.selectRandomReturnPolicy();
    await list.submitFilter();
    await expect(list.dataTable).toBeVisible();
  });

  test("TC17 - Click on Wait for approve list @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.clickNavLinkWaitForApproveList();
    await list.submitFilter();
    await expect(list.dataTable).toBeVisible();
  });

  test("TC18 - Click on Not Disclosure list @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.clickNavLinkNotDisclosureList();
    await list.submitFilter();
    await expect(list.dataTable).toBeVisible();
  });

  test("TC19 - Click on Not COA list @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.clickNavLinkNotCoaList();
    await list.submitFilter();
    await expect(list.dataTable).toBeVisible();
  });

  test("TC20 - Click on Out of Stock list @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.clickNavLinkOutStockList();
    await list.submitFilter();
    await expect(list.dataTable).toBeVisible();
  });

  // test("TC21 - Click on Warning list @regression", async ({
  //   authenticatedPage,
  //   baseUrl,
  // }) => {
  //   const list = new ProductListPage(authenticatedPage.page);
  //   await list.goto(baseUrl);
  //   await list.expectListShellVisible();
  //   await list.clickNavLinkWarningList();
  //   await expect(list.tableBody).toBeVisible();
  // });

  test("TC22 - Click on Out Date list @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.clickNavLinkOutDateList();
    await list.submitFilter();
    await expect(list.dataTable).toBeVisible();
  });

  test("TC23 - Click on Near Expire list @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();
    await list.clickNavLinkNearExpireList();
    await list.submitFilter();
    await expect(list.dataTable).toBeVisible();
  });
});
