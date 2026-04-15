import { ListRegisterPage } from "../../pages/users/ListRegisterPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Users — Register vendor list (/user/register-vendor-list)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Business (UI map): review vendor self-registrations; filter by keyword + status (All / Waiting Approve / Feedback / Approved / Rejected); Search / Reset; grid columns for account, company, contact, registration no., dates, feedback, status.
   * No approve/reject E2E (side effects + shared data). Credentials via LOGIN_* / storage state only.
   */

  test("TC01 - Navigate — URL, filters and grid shell @smoke", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListRegisterPage(authenticatedPage.page);

    await list.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/user\/register-vendor-list/i);
    await list.expectListShellVisible();
    await expect(list.pageTitleH1).toHaveText(/Register Vendor List/i);
    await expect(list.filterSearchButton).toBeVisible();
    await expect(list.resetButton).toBeVisible();
    expect(await list.statusSelect.locator("option").count()).toBeGreaterThan(1);

    const headerText = await list.tableHeader.innerText();
    expect(headerText).toMatch(/STT|No\.?/i);
    expect(headerText).toMatch(/Account/i);
    expect(headerText).toMatch(/Company Name/i);
    expect(headerText).toMatch(/Contact Name/i);
    expect(headerText).toMatch(/Registration No\.?/i);
    expect(headerText).toMatch(/Status/i);
    expect(headerText).toMatch(/Created at|Created At/i);
  });

  test("TC02 - Search — no matches shows empty state @negative", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListRegisterPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.searchInput.fill(`__no_such_vendor_${Date.now()}__`);
    await list.submitSearch();

    await expect(authenticatedPage.page).toHaveURL(/\/user\/register-vendor-list/i);
    await expect(list.tableBody).toContainText(/No data/i);
  });

  test("TC03 - Reset — clears keyword and status @regression", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListRegisterPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.searchInput.fill("filter_reset_probe");
    await list.statusSelect.selectOption("3");
    await expect(list.searchInput).toHaveValue("filter_reset_probe");
    await expect(list.statusSelect).toHaveValue("3");

    await list.resetFilters();

    await expect(list.searchInput).toHaveValue("");
    await expect(list.statusSelect).toHaveValue("");
  });
});


