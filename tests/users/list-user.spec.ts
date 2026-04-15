import { ListUserPage } from "../../pages/users/ListUserPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Users — User list (/user)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Business (UI map): operational directory of marketplace users — filter by keyword, activation status, role, vendor, inactive reason; Search / Reset; open row detail via `/user/{id}`.
   * No create/delete E2E here (covered on add-user / other flows). Credentials via env / storage state only.
   */

  test("TC01 - Navigate — URL, filters and grid shell @smoke", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListUserPage(authenticatedPage.page);

    await list.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/user(\?.*)?$/i);
    await list.expectListShellVisible();
    await expect(list.pageTitleH1).toHaveText(/User List/i);
    await expect(list.filterSearchButton).toBeVisible();
    await expect(list.resetButton).toBeVisible();

    expect(await list.statusSelect.locator("option").count()).toBeGreaterThan(1);
    expect(await list.roleSelect.locator("option").count()).toBeGreaterThan(1);
    expect(await list.vendorSelect.locator("option").count()).toBeGreaterThan(1);
    expect(await list.inactivedReasonSelect.locator("option").count()).toBeGreaterThan(1);

    const headerText = await list.tableHeader.innerText();
    expect(headerText).toMatch(/STT|No\.?/i);
    expect(headerText).toMatch(/User name/i);
    expect(headerText).toMatch(/Account Info/i);
    expect(headerText).toMatch(/Vendor/i);
    expect(headerText).toMatch(/Role/i);
    expect(headerText).toMatch(/Email/i);
    expect(headerText).toMatch(/Status/i);
    expect(headerText).toMatch(/Actions/i);
  });

  test("TC02 - Search — no matches shows empty state @negative", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListUserPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.searchInput.fill(`__no_user__${Date.now()}__`);
    await list.submitSearch();

    await expect(authenticatedPage.page).toHaveURL(/\/user(\?.*)?$/i);
    await expect(list.tableBody).toContainText(/No data/i);
  });

  test("TC03 - Reset — clears keyword and status @regression", async ({ authenticatedPage, baseUrl }) => {
    const list = new ListUserPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const statusSecond = await list.statusSelect.locator("option").nth(1).getAttribute("value");
    expect(statusSecond).toBeTruthy();

    await list.searchInput.fill("reset_probe_keyword");
    await list.statusSelect.selectOption(statusSecond!);
    await expect(list.searchInput).toHaveValue("reset_probe_keyword");
    await expect(list.statusSelect).toHaveValue(statusSecond!);

    await list.resetFilters();

    await expect(list.searchInput).toHaveValue("");
    await expect(list.statusSelect).toHaveValue("");
  });
});


