import type { Locator, Page } from "@playwright/test";

export class VendorConfirmPoPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/setting/confirm-po-pending`, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });
  }
}
