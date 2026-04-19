import { PgPbListPage } from "../../pages/pgpb/PgPbListPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("PG/PB - List (/promoter)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("TC01 - Navigate — URL, title, notice, table shell @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const list = new PgPbListPage(page);

    await list.goto(baseUrl);

    await expect(page).toHaveURL(/\/promoter\/?(\?|#|$)/i);
    await list.expectListShellVisible();
    await expect(list.pageTitleH1).toBeVisible();
    await expect(list.inactiveNotice).toContainText(
      /PG\/PB underlined in the Full Name column are currently inactive/i,
    );
  });

  test("TC02 - Table has expected columns @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new PgPbListPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const headerText = await list.tableHeader.innerText();
    expect(headerText).toMatch(/Staff Code/i);
    expect(headerText).toMatch(/Full Name/i);
    expect(headerText).toMatch(/Status Working/i);
  });

  test("TC03 - Open PG/PB Draft list from menu @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const list = new PgPbListPage(page);

    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await expect(list.draftListLink).toBeVisible();
    await list.clickDraftList();
    await expect(page).toHaveURL(/\/promoter\/pg-draft/i);
  });

  test("TC04 - Change page size @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new PgPbListPage(authenticatedPage.page);

    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.selectPageSize("25");
    await expect(list.changeSizePageSelect).toHaveValue("25");
  });

  test("TC05 - Pagination to page 2 when available @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const list = new PgPbListPage(page);

    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const link2 = list.pagination.getByRole("link", { name: "2", exact: true });
    test.skip(
      (await link2.count()) === 0,
      "List has only one page — no link to page 2",
    );

    await list.clickPaginationPage(2);
    expect(list.currentPageFromUrl()).toBe(2);
    await expect(list.dataTable).toBeVisible();
  });

  test("TC06 - List shows at least one staff row @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new PgPbListPage(authenticatedPage.page);

    await list.goto(baseUrl);
    await list.expectListShellVisible();

    expect(await list.tableBodyRows.count()).toBeGreaterThan(0);
  });

  test("TC07 - Filter Search sends keyword in URL @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const list = new PgPbListPage(page);

    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const token = `smoke-${Date.now()}`;
    await list.keywordSearchInput.fill(token);
    await list.submitFilter();

    expect(list.keywordSearchFromUrl()).toBe(token);
    await expect(list.dataTable).toBeVisible();
  });

  test("TC08 - Filter Reset clears keyword and URL @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const list = new PgPbListPage(page);

    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const token = `reset-${Date.now()}`;
    await list.keywordSearchInput.fill(token);
    await list.submitFilter();
    expect(list.keywordSearchFromUrl()).toBe(token);

    await list.resetFilter();
    await expect(list.keywordSearchInput).toHaveValue("");
    expect(list.keywordSearchFromUrl()).toBe("");
    await expect(list.dataTable).toBeVisible();
  });

  test("TC09 - Download exports PG-PB Excel @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const list = new PgPbListPage(page);

    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
    await list.downloadButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/PG-PB.*\.xlsx$/i);
  });
});


