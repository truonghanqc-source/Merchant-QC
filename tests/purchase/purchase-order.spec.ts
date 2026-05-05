import { PurchaseOrderPage } from "../../pages/purchase/PurchaseOrderPage.ts";
import { test, expect } from "../../fixtures/index.ts";
import { faker } from "@faker-js/faker";

test.describe("Purchase Order - List", () => {
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

    await po.fillCodeInput("PO-TEST-NONEXISTENT-XYZ");
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

    await po.fillCodeInput("TMP-CODE-123");
    await po.submitFilter();
    await expect(page).toHaveURL(/[?&]code=/);

    await po.resetFilter();
    await expect(po.codeInput).toHaveValue("");
  });

  test("TC07 - Search with Company select @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    await po.selectRandomCompany();
    await po.submitFilter();
    await expect(po.dataTable).toBeVisible();
  });

  test("TC08 - Search with code input @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    const code = `${faker.string.numeric(14).toUpperCase()}`;
    await po.fillCodeInput(code);
    debugger;
    await po.submitFilter();
    await expect(po.dataTable).toBeVisible();
  });

  test("TC09 - Search with PO Type select @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    await po.selectRandomPoType();
    await po.submitFilter();
    await expect(po.dataTable).toBeVisible();
  });

  test("TC10 - Search with SKU input @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    const sku = `${faker.string.numeric(9).toUpperCase()}`;
    await po.fillSkuInput(sku);
    await po.submitFilter();
    await expect(po.dataTable).toBeVisible();
  });

  test("TC11 - Search with unchecked checkbox PO Pending @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    await po.clickCheckboxPoPending();
    await po.submitFilter();
    debugger;
    await expect(po.dataTable).toBeVisible();
  });

  test("TC12 - Search with unchecked checkbox PO Verified @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    await po.clickCheckboxPoVerified();
    await po.submitFilter();
    await expect(po.dataTable).toBeVisible();
  });

  test("TC13 - Search with nav link All List @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    await po.clickNavLinkAllList();
    await po.submitFilter();
    await expect(po.dataTable).toBeVisible();
  });

  test("TC14 - Search with nav link Confirmed List @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    await po.clickNavLinkConfirmedList();
    await po.submitFilter();
    await expect(po.dataTable).toBeVisible();
  });

  test("TC15 - Search with nav link Approved List @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    await po.clickNavLinkApprovedList();
    await po.submitFilter();
    await expect(po.dataTable).toBeVisible();
  });

  test("TC16 - Search with nav link Receiving List @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    await po.clickNavLinkReceivingList();
    await po.submitFilter();
    await expect(po.dataTable).toBeVisible();
  });

  test("TC17 - Search with nav link Received List @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    await po.clickNavLinkReceivedList();
    await po.submitFilter();
    await expect(po.dataTable).toBeVisible();
  });

  test("TC18 - Search with nav link Request Cancel List @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PurchaseOrderPage(authenticatedPage.page);
    await po.goto(baseUrl, { status: "new" });
    await po.expectListShellVisible();
    await po.clickNavLinkRequestCancelList();
    await po.submitFilter();
    await expect(po.dataTable).toBeVisible();
  });
});
