import { PurchaseOrderPage } from "../../pages/purchase/PurchaseOrderPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Purchase Order - List (/purchase-order)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("TC01 - Navigate — URL, title, table shell @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const po = new PurchaseOrderPage(page);

    await po.goto(baseUrl, { status: "new" });

    await expect(page).toHaveURL(/\/purchase-order/i);
    await expect(page).toHaveURL(/[?&]status=new(?:&|$)/);
    await expect(po.pageTitleH1).toContainText(/Purchase Order List/i);
    await po.expectListShellVisible();
  });

  test("TC02 - Filter by code then Search updates query @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const po = new PurchaseOrderPage(page);

    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();

    await po.fillCodeFilter("PO-TEST-NONEXISTENT-XYZ");
    await po.submitFilter();

    await expect(page).toHaveURL(/[?&]code=/);
    await expect(po.dataTable).toBeVisible();
  });

  test("TC03 - Change page size via #changeSizePage @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);

    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();

    await po.selectPageSize("25");
    await expect(po.changeSizePageSelect).toHaveValue("25");
    await expect(po.dataTable).toBeVisible();
  });

  test("TC04 - Pagination opens page 2 when available @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const po = new PurchaseOrderPage(page);

    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();

    const link2 = po.pagination.getByRole("link", { name: "2", exact: true });
    if ((await link2.count()) === 0) {
      test.skip();
    }

    await po.clickPaginationPage(2);
    expect(po.currentPageFromUrl()).toBe(2);
    await expect(po.dataTable).toBeVisible();
  });

  test("TC05 - Table has header columns @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);

    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();

    expect(await po.tableHeader.locator("th, td").count()).toBeGreaterThan(0);
  });

  test("TC06 - Reset clears code filter @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const po = new PurchaseOrderPage(page);

    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();

    await po.fillCodeFilter("TMP-CODE-123");
    await po.submitFilter();
    await expect(page).toHaveURL(/[?&]code=/);

    await po.resetFilter();
    await expect(po.codeInput).toHaveValue("");
  });
});


