import type { Locator, Page } from "@playwright/test";

export class ConfirmPoImportPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/purchase-order/confirm-import`);
  }
}
