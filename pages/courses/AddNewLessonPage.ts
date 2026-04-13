import type { Locator, Page } from "@playwright/test";

export class AddNewLessonPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/courses/lession/detail`);
  }
}
