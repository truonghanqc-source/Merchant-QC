import { WorkSchedulePage } from "../../pages/pgpb/WorkSchedulePage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("PG/PB - Work Schedule (/promoter/work-schedule)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("TC01 - Navigate — URL, title, filter and table shell @smoke", async ({
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
    await expect(ws.locationSelect).toBeAttached();
    await expect(ws.workTypeSelect).toBeAttached();
    await expect(ws.statusSelect).toBeAttached();
    await expect(ws.createdBySelect).toBeAttached();
    await expect(ws.filterSearchButton).toBeVisible();
    await expect(ws.filterResetButton).toBeVisible();
  });

  test("TC02 - Table header columns @regression", async ({
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

  test("TC03 - Search keeps shell visible @regression", async ({
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

  test("TC04 - Reset keeps shell visible @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const ws = new WorkSchedulePage(authenticatedPage.page);
    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    await ws.resetFilter();
    await ws.expectListShellVisible();
  });

  test("TC05 - Change page size @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const ws = new WorkSchedulePage(authenticatedPage.page);

    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    await ws.selectPageSize("25");
    await expect(ws.changeSizePageSelect).toHaveValue("25");
  });

  test("TC06 - Pagination to page 2 when available @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const ws = new WorkSchedulePage(page);

    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    const link2 = ws.pagination.getByRole("link", { name: "2", exact: true });
    test.skip(
      (await link2.count()) === 0,
      "Work schedule list has only one page — no link to page 2",
    );

    await ws.clickPaginationPage(2);
    expect(ws.currentPageFromUrl()).toBe(2);
    await expect(ws.dataTable).toBeVisible();
  });

  test("TC07 - List has at least one schedule row @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const ws = new WorkSchedulePage(authenticatedPage.page);

    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    const rowCount = await ws.tableBodyRows.count();
    test.skip(
      rowCount === 0,
      "No schedule rows for default filters — skip in empty env",
    );
    expect(rowCount).toBeGreaterThan(0);
  });

  test("TC08 - Search adds vendor and work_date to URL @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const ws = new WorkSchedulePage(page);

    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    await ws.submitFilter();

    const url = new URL(page.url());
    expect(url.searchParams.has("vendor")).toBeTruthy();
    expect(url.searchParams.has("work_date")).toBeTruthy();
    expect(url.searchParams.get("work_date")?.length).toBeGreaterThan(0);
    await expect(ws.dataTable).toBeVisible();
  });

  test("TC09 - Filter by status reflects in URL @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const ws = new WorkSchedulePage(page);

    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    const statusValue = await ws.firstSelectableStatusValue();
    test.skip(!statusValue, "No selectable status in filter");

    await ws.statusSelect.selectOption(statusValue);
    await ws.submitFilter();

    const url = new URL(page.url());
    expect(url.searchParams.get("status")).toBe(statusValue);
    await expect(ws.dataTable).toBeVisible();
  });

  test("TC10 - Filter by created_by reflects in URL @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const ws = new WorkSchedulePage(page);

    await ws.goto(baseUrl);
    await ws.expectListShellVisible();

    const createdByValue = await ws.firstSelectableCreatedByValue();
    test.skip(!createdByValue, "No selectable created_by in filter");

    await ws.createdBySelect.selectOption(createdByValue);
    await ws.submitFilter();

    const url = new URL(page.url());
    expect(url.searchParams.get("created_by")).toBe(createdByValue);
    await expect(ws.dataTable).toBeVisible();
  });
});


