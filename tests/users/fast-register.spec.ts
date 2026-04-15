import { FastRegisterPage } from "../../pages/users/FastRegisterPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Users — Fast merchant register (/user/fast-register)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Business (UI map, no PDF): pick vendor, company, email, username template, access; Save.
   * Validation: vendor required on Save (email step stays hidden in DOM until flow advances). No full Save E2E.
   */

  test("TC01 - Navigate — URL, title and form shell @smoke", async ({ authenticatedPage, baseUrl }) => {
    const fast = new FastRegisterPage(authenticatedPage.page);

    await fast.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/user\/fast-register/i);
    await fast.expectFastRegisterFormVisible();
    await expect(fast.pageTitleH1).toHaveText(/Add new User/i);
    await expect(fast.companySelect).toBeAttached();
    expect(await fast.vendorSelect.locator("option").count()).toBeGreaterThan(0);
  });

  test("TC02 - Validation — vendor required on save @negative", async ({ authenticatedPage, baseUrl }) => {
    const fast = new FastRegisterPage(authenticatedPage.page);
    await fast.goto(baseUrl);
    await fast.expectFastRegisterFormVisible();

    await fast.vendorSelect.selectOption({ index: 0 });
    await fast.submitSave();

    await expect(authenticatedPage.page).toHaveURL(/\/user\/fast-register/i);
    await expect(fast.vendorInvalidFeedback).toBeVisible();
  });

  test("TC03 - Vendor selection updates form state @regression", async ({ authenticatedPage, baseUrl }) => {
    const fast = new FastRegisterPage(authenticatedPage.page);
    await fast.goto(baseUrl);
    await fast.expectFastRegisterFormVisible();

    const vendorVal = await fast.vendorSelect.locator("option").nth(1).getAttribute("value");
    expect(vendorVal).toBeTruthy();
    await fast.vendorSelect.selectOption(vendorVal!);

    await expect(fast.vendorSelect).toHaveValue(vendorVal!);
    await expect(fast.companySelect).toBeAttached();
    await expect(fast.saveButton).toBeEnabled();
  });
});


