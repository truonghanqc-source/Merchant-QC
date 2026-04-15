import type { Locator, Page } from "@playwright/test";
import { assertNotOnLoginPage, waitUntilLeftLogin } from "../../utils/navigation-helpers.ts";

/**
 * Add New User — `/user/detail` ([Add New User](https://test-merchant.hasaki.vn/user/detail)).
 * General fields are not wrapped in a `<form>` (Change Password tab uses `form#formChangePassword`). Save: `#btnFormSubmit`.
 */
export class AddNewUserPage {
  readonly pageTitleH1: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly statusSelect: Locator;
  readonly roleSelect: Locator;
  readonly groupRoleSelect: Locator;
  readonly vendorSelect: Locator;
  readonly saveButton: Locator;
  readonly usernameInvalidFeedback: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.usernameInput = page.locator("input#username");
    this.passwordInput = page.locator("input#password");
    this.fullNameInput = page.locator("input#name");
    this.emailInput = page.locator("input#email");
    this.statusSelect = page.locator("select#status");
    this.roleSelect = page.locator("select#role");
    this.groupRoleSelect = page.locator("select#group_role");
    this.vendorSelect = page.locator("select#vendor");
    this.saveButton = page.locator("#btnFormSubmit");
    this.usernameInvalidFeedback = page
      .locator(".invalid-feedback")
      .filter({ hasText: /user name is required/i });
  }

  async goto(baseUrl: string) {
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/user/detail`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Add New User: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
    );
    await this.page.waitForSelector("input#username, #btnFormSubmit", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectAddUserFormVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.usernameInput.waitFor({ state: "visible", timeout: 15000 });
    await this.passwordInput.waitFor({ state: "visible", timeout: 10000 });
    await this.fullNameInput.waitFor({ state: "visible", timeout: 10000 });
    await this.statusSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.roleSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.saveButton.waitFor({ state: "visible", timeout: 10000 });
  }

  async fillUserDraft(data: {
    username: string;
    password?: string;
    fullName?: string;
    email?: string;
  }) {
    await this.usernameInput.fill(data.username);
    if (data.password !== undefined) {
      await this.passwordInput.fill(data.password);
    }
    if (data.fullName !== undefined) {
      await this.fullNameInput.fill(data.fullName);
    }
    if (data.email !== undefined) {
      await this.emailInput.fill(data.email);
    }
  }

  async submitSave() {
    await this.saveButton.click();
  }
}
