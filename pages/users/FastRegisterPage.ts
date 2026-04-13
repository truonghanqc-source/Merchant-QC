import type { Locator, Page } from "@playwright/test";

export class FastRegisterPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/user/fast-register`);
  }
}
