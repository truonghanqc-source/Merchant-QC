import { ConfirmPoImportPage } from "../../pages/purchase/ConfirmPoImportPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("purchase - ConfirmPoImportPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("TC01 - Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const confirmPoImport = new ConfirmPoImportPage(page);

    await confirmPoImport.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /Verify Purchase Order/i,
      {
        timeout: 10000,
      },
    );
  });
});


