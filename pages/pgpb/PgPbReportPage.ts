import type { Locator, Page } from "@playwright/test";

export class PgPbReportPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/promoter/promoter-report`, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });
  }
}
