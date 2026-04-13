import type { Locator, Page } from "@playwright/test";

export class GlobalPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/setting`);
  }
}
