import { ListVendorPage } from "../../pages/vendors/ListVendorPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Vendors — Vendor list (/vendors)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("TC01 - Navigate — URL, filters and grid shell @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ListVendorPage(authenticatedPage.page);

    await list.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/vendors(\?.*)?$/i);
    await list.expectListShellVisible();
    await expect(list.pageTitleH1).toHaveText(/Vendor List/i);
    await expect(list.filterSearchButton).toBeVisible();
    await expect(list.resetButton).toBeVisible();

    expect(await list.approveSelect.locator("option").count()).toBeGreaterThan(
      1,
    );
    expect(await list.statusSelect.locator("option").count()).toBeGreaterThan(
      1,
    );
    expect(await list.sortSelect.locator("option").count()).toBeGreaterThan(1);

    const headerText = await list.tableHeader.innerText();
    expect(headerText).toMatch(/STT|No\.?/i);
    expect(headerText).toMatch(/Contact Name/i);
    expect(headerText).toMatch(/Vendor Info/i);
    expect(headerText).toMatch(/Allow Store/i);
    expect(headerText).toMatch(/Approved/i);
    expect(headerText).toMatch(/Status/i);
    expect(headerText).toMatch(/Actions/i);
  });

  test("TC02 - Search — no matches shows empty state @negative", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ListVendorPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.companyInput.fill(`__no_vendor__${Date.now()}__`);
    await list.submitSearch();

    await expect(authenticatedPage.page).toHaveURL(/\/vendors(\?.*)?$/i);
    await expect(list.tableBody).toContainText(/No data/i);
  });

  test("TC03 - Reset — clears text filter and status @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ListVendorPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const statusSecond = await list.statusSelect
      .locator("option")
      .nth(1)
      .getAttribute("value");
    expect(statusSecond).toBeTruthy();

    await list.nameInput.fill("reset_probe_vendor_name");
    await list.statusSelect.selectOption(statusSecond!);
    await expect(list.nameInput).toHaveValue("reset_probe_vendor_name");
    await expect(list.statusSelect).toHaveValue(statusSecond!);

    await list.resetFilters();

    await expect(list.nameInput).toHaveValue("");
    await expect(list.statusSelect).toHaveValue("");
  });
});


