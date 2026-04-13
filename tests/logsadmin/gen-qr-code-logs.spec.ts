import { GenQrCodeLogsPage } from "../../pages/logsadmin/GenQrCodeLogsPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("logsadmin - GenQrCodeLogsPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new GenQrCodeLogsPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /Gen QR Code Promoter Logs/i,
      {
        timeout: 10000,
      },
    );
  });
});
