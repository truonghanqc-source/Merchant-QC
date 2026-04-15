import type { Page } from "@playwright/test";

/** Double rAF — prefer over fixed sleep for layout/paint before DOM reads. */
export async function waitForNextPaint(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      }),
  );
}
