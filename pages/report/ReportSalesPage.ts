import type { Locator, Page } from "@playwright/test";

export class ReportSalesPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/report/sales`);
  }
}
