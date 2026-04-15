import { AddNewUserPage } from "../../pages/users/AddNewUserPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Users — Add new user (/user/detail)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Business (UI map, no PDF in repo): create account fields + Save (`#btnFormSubmit`); username required validation.
   * No full Save E2E (avoid test data / flaky CI); only field binding + validation.
   */

  test("TC01 - Navigate — URL, title and General tab fields @smoke", async ({ authenticatedPage, baseUrl }) => {
    const add = new AddNewUserPage(authenticatedPage.page);

    await add.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/user\/detail/i);
    await add.expectAddUserFormVisible();
    await expect(add.pageTitleH1).toHaveText(/Add New User/i);
    await expect(add.emailInput).toBeAttached();
    await expect(add.groupRoleSelect).toBeAttached();
    await expect(add.vendorSelect).toBeAttached();
  });

  test("TC02 - Validation — empty username on save @negative", async ({ authenticatedPage, baseUrl }) => {
    const add = new AddNewUserPage(authenticatedPage.page);
    await add.goto(baseUrl);
    await add.expectAddUserFormVisible();

    await add.usernameInput.clear();
    await add.passwordInput.clear();
    await add.fullNameInput.clear();
    await add.submitSave();

    await expect(authenticatedPage.page).toHaveURL(/\/user\/detail/i);
    await expect(add.usernameInvalidFeedback).toBeVisible();
  });

  test("TC03 - Form binds account fields before save @regression", async ({ authenticatedPage, baseUrl }) => {
    const add = new AddNewUserPage(authenticatedPage.page);
    await add.goto(baseUrl);
    await add.expectAddUserFormVisible();

    const u = `draft_user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await add.fillUserDraft({
      username: u,
      password: "DraftPass1!",
      fullName: "Draft Full Name",
      email: `draft_${Date.now()}@example.test`,
    });

    await expect(add.usernameInput).toHaveValue(u);
    await expect(add.passwordInput).toHaveValue("DraftPass1!");
    await expect(add.fullNameInput).toHaveValue("Draft Full Name");
    await expect(add.emailInput).toHaveValue(new RegExp(`^draft_\\d+@example\\.test$`));
    await expect(add.saveButton).toBeEnabled();
  });
});


