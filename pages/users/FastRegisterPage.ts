import type { Locator, Page } from "@playwright/test";
import { assertNotOnLoginPage, waitUntilLeftLogin } from "../../utils/navigation-helpers.ts";

/**
 * Fast merchant register — `/user/fast-register` ([Add new User](https://test-merchant.hasaki.vn/user/fast-register)).
 * POST-style UI in `form#formFastRegister`; primary actions: vendor, company, email, username (select), access radios; Save `#btnSaveBrandDetail`.
 */
export class FastRegisterPage {
  readonly pageTitleH1: Locator;
  readonly formFastRegister: Locator;
  readonly vendorSelect: Locator;
  readonly companySelect: Locator;
  readonly emailInput: Locator;
  /** Template / account picker — server renders as `<select id="username">`. */
  readonly usernameSelect: Locator;
  readonly saveButton: Locator;
  readonly vendorInvalidFeedback: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formFastRegister = page.locator("form#formFastRegister");
    this.vendorSelect = page.locator("select#vendor");
    this.companySelect = page.locator("select#company");
    this.emailInput = page.locator("input#email");
    this.usernameSelect = page.locator("select#username");
    this.saveButton = page.locator("#btnSaveBrandDetail");
    this.vendorInvalidFeedback = this.formFastRegister
      .locator(".invalid-feedback")
      .filter({ hasText: /vendor is required/i });
  }

  async goto(baseUrl: string) {
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/user/fast-register`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Fast register: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
    );
    await this.page.waitForSelector("form#formFastRegister", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectFastRegisterFormVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formFastRegister.waitFor({ state: "visible", timeout: 15000 });
    await this.vendorSelect.waitFor({ state: "visible", timeout: 10000 });
    await this.emailInput.waitFor({ state: "attached", timeout: 10000 });
    await this.usernameSelect.waitFor({ state: "attached", timeout: 10000 });
    await this.saveButton.waitFor({ state: "visible", timeout: 10000 });
  }

  async submitSave() {
    await this.saveButton.click();
  }
}
