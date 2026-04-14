import { PgPbListPage } from "../../pages/pgpb/PgPbListPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("PG/PB - List (/promoter)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("Navigate — URL, title, notice, table shell @smoke", async ({
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

  test("Table has expected columns @regression", async ({
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

  test("Open PG/PB Draft list from menu @smoke", async ({
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

  test("Change page size @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new PgPbListPage(authenticatedPage.page);

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
    const list = new PgPbListPage(page);

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

  test("List shows at least one staff row @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new PgPbListPage(authenticatedPage.page);

    await list.goto(baseUrl);
    await list.expectListShellVisible();

    expect(await list.tableBodyRows.count()).toBeGreaterThan(0);
  });
});
