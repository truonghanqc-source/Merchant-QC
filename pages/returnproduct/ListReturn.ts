import type { Locator, Page } from "@playwright/test";

export class ListReturnPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/return-product`);
  }
}
