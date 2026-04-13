import type { Locator, Page } from "@playwright/test";

export class ListRegisterPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/user/register-vendor-list`);
  }
}
