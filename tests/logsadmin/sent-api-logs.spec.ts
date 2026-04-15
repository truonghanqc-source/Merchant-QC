import { SentApiLogsPage } from "../../pages/logsadmin/SentApiLogsPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Logs — Sent API (/logs/sent-api)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Nghiệp vụ (map UI — không có PDF trong repo):
   * - Tra cứu log API đã gửi: endpoint, METHOD, trạng thái, khoảng/ngày (`#date`); Search / Reset.
   * - Bảng: STT, ID, METHOD, ENDPOINT, STATUS, CODE, CREATED AT, ACTION.
   */

  test("TC01 - Navigate — URL, title, filters and grid @smoke", async ({ authenticatedPage, baseUrl }) => {
    const logs = new SentApiLogsPage(authenticatedPage.page);

    await logs.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/logs\/sent-api/i);
    await logs.expectLogsShellVisible();
    await expect(logs.pageTitleH1).toHaveText(/Sent API Logs/i);
    await expect(logs.endpointInput).toBeVisible();
    await expect(logs.methodSelect).toBeAttached();
    expect(await logs.methodSelect.locator("option").count()).toBeGreaterThan(0);
    await expect(logs.statusSelect).toBeAttached();
    expect(await logs.statusSelect.locator("option").count()).toBeGreaterThan(0);
    await expect(logs.dateInput).toBeAttached();
    await expect(logs.filterSearchButton).toBeVisible();
    await expect(logs.resetButton).toBeVisible();
  });

  test("TC02 - Results table lists sent-API log columns @regression", async ({ authenticatedPage, baseUrl }) => {
    const logs = new SentApiLogsPage(authenticatedPage.page);
    await logs.goto(baseUrl);
    await logs.expectLogsShellVisible();

    const headerText = await logs.tableHeader.innerText();
    expect(headerText).toMatch(/STT|No\.?/i);
    expect(headerText).toMatch(/METHOD/i);
    expect(headerText).toMatch(/ENDPOINT/i);
    expect(headerText).toMatch(/STATUS/i);
    expect(headerText).toMatch(/CODE/i);
    expect(headerText).toMatch(/CREATED AT|Created At/i);
    expect(headerText).toMatch(/ACTION/i);
  });

  test("TC03 - Search with current filters keeps shell @regression", async ({ authenticatedPage, baseUrl }) => {
    const logs = new SentApiLogsPage(authenticatedPage.page);
    await logs.goto(baseUrl);
    await logs.expectLogsShellVisible();

    await logs.submitSearch();

    await expect(authenticatedPage.page).toHaveURL(/\/logs\/sent-api/i);
    await logs.expectLogsShellVisible();
    await expect(logs.dataTable).toBeVisible();
  });

  test("TC04 - Reset keeps logs shell @edge", async ({ authenticatedPage, baseUrl }) => {
    const logs = new SentApiLogsPage(authenticatedPage.page);
    await logs.goto(baseUrl);
    await logs.expectLogsShellVisible();

    await logs.resetFilters();

    await expect(authenticatedPage.page).toHaveURL(/\/logs\/sent-api/i);
    await logs.expectLogsShellVisible();
  });
});


