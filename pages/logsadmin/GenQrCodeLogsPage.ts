import type { Locator, Page } from "@playwright/test";

export class GenQrCodeLogsPage {
  constructor(public readonly page: Page) {
    //
  }
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/logs/qr-code-promoter`);
  }
}
