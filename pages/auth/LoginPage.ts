import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  /** Server flash / validation banner after failed login (same family as empty-field errors). */
  readonly authFailureBanner: Locator;

  constructor(public readonly page: Page) {
    this.usernameInput = page.locator(
      'input[name="username"], input[name="userName"], input#username',
    );
    this.passwordInput = page.locator('input[name="password"], input#password');
    this.submitButton = page.locator(
      'button[type="submit"], button:has-text("Login"), button:has-text("Đăng nhập")',
    );
    this.authFailureBanner = page
      .locator(".alert.alert-danger.flashSession")
      .or(page.locator(".alert.alert-danger"));
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/login`, {
      waitUntil: "load",
      timeout: 120000,
    });
    await this.usernameInput
      .first()
      .waitFor({ state: "visible", timeout: 60000 });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    // Wait until navigated away from login page (works for any redirect URL)
    await this.page.waitForURL((url) => !url.pathname.startsWith("/login"), {
      timeout: 60000,
    });
  }

  async expectAuthFailureBannerVisible(timeout = 20_000) {
    await this.authFailureBanner.first().waitFor({ state: "visible", timeout });
  }
}
