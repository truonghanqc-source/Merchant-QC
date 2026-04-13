import type { Locator, Page } from "@playwright/test";

export class PurchaseOrderPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/purchase-order?status=new`);
  }
}
