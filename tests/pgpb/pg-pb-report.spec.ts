import { PgPbReportPage } from "../../pages/pgpb/PgPbReportPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("pgpb - PgPbReportPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new PgPbReportPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title h1")).toContainText(
      /PG\/PB Report/i,
      {
        timeout: 10000,
      },
    );
  });
});
