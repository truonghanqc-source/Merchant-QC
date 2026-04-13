import type { Locator, Page } from "@playwright/test";

export class AddNewUserPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/user/detail`);
  }
}
