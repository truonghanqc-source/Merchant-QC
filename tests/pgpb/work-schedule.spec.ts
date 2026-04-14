import { WorkSchedulePage } from "../../pages/pgpb/WorkSchedulePage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("PG/PB - Work Schedule (/promoter/work-schedule)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("Navigate — URL, title, filter and table shell @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const ws = new WorkSchedulePage(page);

    await ws.goto(baseUrl);

    await expect(page).toHaveURL(/\/promoter\/work-schedule/i);
    await ws.expectListShellVisible();
    await expect(ws.pageTitleH1).toHaveText(/Work Schedule/i);
    await expect(ws.searchInput).toBeVisible();
    await expect(ws.workDateInput).toBeAttached();
    await expect(ws.vendorSelect).toBeAttached();
    await expect(ws.filterSearchButton).toBeVisible();
    await expect(ws.filterResetButton).toBeVisible();
  });

  test("Table header columns @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const ws = new WorkSchedulePage(authenticatedPage.page);
    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    const headerText = await ws.tableHeader.innerText();
    expect(headerText).toMatch(/Vendor/i);
    expect(headerText).toMatch(/Full Name/i);
    expect(headerText).toMatch(/Work Date/i);
    expect(headerText).toMatch(/Shift/i);
    expect(headerText).toMatch(/Status/i);
  });

  test("Search keeps shell visible @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const ws = new WorkSchedulePage(authenticatedPage.page);
    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    await ws.submitFilter();
    await ws.expectListShellVisible();
    await expect(ws.dataTable).toBeVisible();
  });

  test("Reset keeps shell visible @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const ws = new WorkSchedulePage(authenticatedPage.page);
    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    await ws.resetFilter();
    await ws.expectListShellVisible();
  });

  test("Change page size @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const ws = new WorkSchedulePage(authenticatedPage.page);

    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    await ws.selectPageSize("25");
    await expect(ws.changeSizePageSelect).toHaveValue("25");
  });

  test("Pagination to page 2 when available @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const ws = new WorkSchedulePage(page);

    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    const link2 = ws.pagination.getByRole("link", { name: "2", exact: true });
    if ((await link2.count()) === 0) {
      test.skip();
    }

    await ws.clickPaginationPage(2);
    expect(ws.currentPageFromUrl()).toBe(2);
    await expect(ws.dataTable).toBeVisible();
  });

  test("List has at least one schedule row @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const ws = new WorkSchedulePage(authenticatedPage.page);

    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    expect(await ws.tableBodyRows.count()).toBeGreaterThan(0);
  });
});
