import { ProductListPage } from "../../pages/product/ProductListPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Product - List (/product)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("Navigate — URL, title, filter shell and main grid @smoke", async ({
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

  test("Table lists core commerce columns @regression", async ({
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

  test("Filter selects expose options (sanity / validation) @regression", async ({
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

  test("Search by unlikely keyword — page still usable (edge) @regression", async ({
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

  test("Reset clears interaction path without breaking layout @regression", async ({
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

  test("Change page size @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.selectPageSize("25");
    await expect(list.changeSizePageSelect).toHaveValue("25");
  });

  test("Pagination to page 2 when available @regression", async ({
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

  test("Product grid shows rows @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ProductListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    expect(await list.tableBodyRows.count()).toBeGreaterThan(0);
  });
});
