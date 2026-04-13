import { ListPgPbPage } from "../../pages/pgpb/PgPbListPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("pgpb - PgPbListPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new ListPgPbPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator("//p[@class='w-100 fs-6 mb-2']")).toContainText(
      / PG\/PB underlined in the Full Name column are currently inactive./i,
      {
        timeout: 10000,
      },
    );
  });
});
