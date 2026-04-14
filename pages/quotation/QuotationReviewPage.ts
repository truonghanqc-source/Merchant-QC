import type { Locator, Page } from "@playwright/test";
import { CreateQuotationPage } from "./QuotationPage.ts";

/**
 * Trang sau khi lưu quotation (từ Excel hoặc form detail): URL dạng
 * /quotation/review|detail|edit|confirm|view/:id
 */
export class QuotationReviewPage {
  readonly pageTitle: Locator;
  readonly noteInput: Locator;
  readonly productsTable: Locator;
  readonly waitingConfirmBadge: Locator;

  private readonly detail: CreateQuotationPage;

  constructor(public readonly page: Page) {
    this.detail = new CreateQuotationPage(page);
    this.pageTitle = page
      .locator("h1, h2")
      .filter({ hasText: /quotation.*review|review.*quotation/i })
      .first();
    this.noteInput = page.locator("#quotationNote");
    this.productsTable = page.locator("table.table, table[class*='table']").first();
    this.waitingConfirmBadge = page
      .locator("span.badge-warning, span.badge-danger, span[class*='badge']")
      .filter({ hasText: /Waiting For Confirm|Waiting for Confirm/i });
  }

  async waitForReviewUrl() {
    await this.page.waitForURL(
      /\/quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );
  }

  async expectHeadingVisible() {
    await this.pageTitle.waitFor({ state: "visible", timeout: 15000 });
  }

  /**
   * Đọc ghi chú trên màn review/detail: có thể có nhiều `#quotationNote`, một số ẩn/rỗng,
   * hoặc note chỉ nằm trong text trang (không sync vào textarea).
   */
  async getNote(): Promise<string> {
    let best = "";
    const byId = this.page.locator("#quotationNote");
    const idCount = await byId.count();
    for (let i = 0; i < idCount; i++) {
      const loc = byId.nth(i);
      let v = "";
      try {
        v = (await loc.inputValue()).trim();
      } catch {
        v = (await loc.textContent())?.trim() ?? "";
      }
      if (v.length > best.length) best = v;
    }

    if (!best) {
      const alt = this.page.locator(
        'textarea[name="quotationNote"], textarea[name*="note" i], input[name*="quotationNote" i]',
      );
      const altCount = await alt.count();
      for (let i = 0; i < altCount; i++) {
        let v = "";
        try {
          v = (await alt.nth(i).inputValue()).trim();
        } catch {
          v = (await alt.nth(i).textContent())?.trim() ?? "";
        }
        if (v.length > best.length) best = v;
      }
    }

    return best;
  }

  /** Ghi chú có xuất hiện trong nội dung trang (kể cả khi không đọc được từ field). */
  async pageContainsNote(note: string): Promise<boolean> {
    const body = await this.page.locator("body").innerText();
    return body.includes(note);
  }

  async lineItemCount(): Promise<number> {
    return this.page.locator("table tbody tr").count();
  }

  async requestToConfirm() {
    await this.detail.requestToConfirm();
  }

  async getSummaryTotal(): Promise<string> {
    return this.detail.getSummaryTotal();
  }
}
