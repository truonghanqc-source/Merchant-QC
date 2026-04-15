import { test, expect } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { LoginPage } from "../../pages/auth/LoginPage.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, "../../.env.local") });
loadEnv();

const hasBaseUrl = Boolean(process.env.BASE_URL?.trim());
const hasAdminCreds = Boolean(
  process.env.LOGIN_USER_ADMIN?.trim() && process.env.LOGIN_PASS_ADMIN?.trim(),
);

/** Post-login landing: named routes or merchant root `/` (no `/login`). */
const successUrlMatcher =
  /.*Dashboard|.*promoter|.*home|.*pg-draft|^https?:\/\/[^/]+\/\s*$/i;

const describeLogin = hasBaseUrl ? test.describe : test.describe.skip;

describeLogin("Login page (skipped when BASE_URL is unset)", () => {
  test.beforeEach(async ({ page }) => {
    const base = process.env.BASE_URL!.trim();
    const login = new LoginPage(page);
    await login.goto(base);
  });

  test("TC01 - should login successfully with valid credentials", async ({
    page,
  }) => {
    test.skip(!hasAdminCreds, "Set LOGIN_USER_ADMIN and LOGIN_PASS_ADMIN");
    const login = new LoginPage(page);
    await login.login(
      process.env.LOGIN_USER_ADMIN!.trim(),
      process.env.LOGIN_PASS_ADMIN!.trim(),
    );
    await expect(page).toHaveURL(successUrlMatcher, { timeout: 60000 });
  });

  test("TC02 - should show validation errors when credentials are empty", async ({
    page,
  }) => {
    const login = new LoginPage(page);

    await login.usernameInput.fill("");
    await login.passwordInput.fill("");
    await login.submitButton.click();

    const errorText = page.locator(".alert.alert-danger.flashSession");
    await expect(errorText.first()).toBeVisible({ timeout: 30000 });

    await expect(page).not.toHaveURL(successUrlMatcher);
  });

  test("TC03 - should reject login with invalid credentials", async ({
    page,
  }) => {
    test.skip(!hasAdminCreds, "Set LOGIN_USER_ADMIN and LOGIN_PASS_ADMIN");
    const login = new LoginPage(page);
    await login.usernameInput.fill(process.env.LOGIN_USER_ADMIN!.trim());
    await login.passwordInput.fill("WrongPassword123!");
    await login.submitButton.click();

    await expect(page).not.toHaveURL(successUrlMatcher, { timeout: 30_000 });
    await login.expectAuthFailureBannerVisible();
  });

  test("TC04 - should reject login with a not found user", async ({ page }) => {
    const login = new LoginPage(page);
    await login.usernameInput.fill("notfound_user@test.com");
    await login.passwordInput.fill("Password123!");
    await login.submitButton.click();

    await expect(page).not.toHaveURL(successUrlMatcher, { timeout: 30_000 });
    await login.expectAuthFailureBannerVisible();
  });
});
