import type { Page } from "@playwright/test";

const LOGIN_RE = /\/login(\/|\?|$)/i;

/** Wait until navigation leaves /login (e.g. after goto with storage state). */
export async function waitUntilLeftLogin(
  page: Page,
  timeoutMs = 10000,
): Promise<void> {
  try {
    await page.waitForURL(
      (url) => !LOGIN_RE.test(`${url.pathname}${url.search}`),
      { timeout: timeoutMs },
    );
  } catch {
    /* final URL checked in assertNotOnLoginPage */
  }
}

export function assertNotOnLoginPage(page: Page, errorMessage: string): void {
  if (LOGIN_RE.test(page.url())) {
    throw new Error(errorMessage);
  }
}
