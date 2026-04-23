import type { Download, Locator, Page } from "@playwright/test";

export class QuotationExcelPage {
  readonly pageTitle: Locator;
  readonly vendorSelect: Locator;
  readonly companySelect: Locator;
  readonly receivingTimeInput: Locator;
  readonly quotationTypeSelect: Locator;
  readonly activationEndTimeInput: Locator;
  readonly requireVatCheckbox: Locator;
  readonly noteInput: Locator;
  readonly importBySkuRadio: Locator;
  readonly importByBarcodeRadio: Locator;
  readonly excelFileInput: Locator;

  /** Thông báo sau validate / lưu (Bootstrap alert, SweetAlert2, v.v.) */
  readonly validationFeedback: Locator;

  //buttons
  readonly validateFileButton: Locator;
  readonly saveQuotationButton: Locator;
  readonly confirmCreateSuccessButton: Locator;
  readonly cancelButton: Locator;
  readonly downloadTemplateButton: Locator;

  /** Card chứa form import (dùng scope nút Cancel / actions). */
  private readonly importFormCard: Locator;

  constructor(public readonly page: Page) {
    this.pageTitle = page
      .locator("h1")
      .filter({ hasText: /Create new Quotation by Excel/i });
    this.vendorSelect = page.locator("select#vendor");
    this.companySelect = page.locator("select#quotation_company");
    this.receivingTimeInput = page.locator("input#receivingTime");
    this.quotationTypeSelect = page.locator("select#quotationType");
    this.activationEndTimeInput = page.locator("input#activationEndTime");
    this.requireVatCheckbox = page.locator("input#quotationConfig");
    this.noteInput = page.locator("textarea#quotationNote");
    this.importBySkuRadio = page.locator(
      "//label[normalize-space()='Import by sku']",
    );
    // Radio #toggle-off bị ẩn (toggle UI) — click label giống phía SKU
    this.importByBarcodeRadio = page
      .locator('label[for="toggle-off"]')
      .or(page.locator("label").filter({ hasText: /import by barcode/i }));

    this.excelFileInput = page.locator("input#excelFile");

    // Tránh `i.text-danger.d-none` (badge) — `.first()` dễ trúng phần tử hidden.
    this.validationFeedback = page.locator(
      ".alert, #swal2-html-container, .text-success:not(.d-none), .text-danger:not(.d-none)",
    );

    //buttons
    this.validateFileButton = page.locator("a#btnUploadQuotationTemplate");
    this.saveQuotationButton = page.locator("a#saveQuotation");
    this.confirmCreateSuccessButton = page.getByRole("button", {
      name: "OK",
    });
    this.importFormCard = page
      .locator(".card, section, article, .content, .main-content")
      .filter({
        has: page
          .locator("h1")
          .filter({ hasText: /Create new Quotation by Excel/i }),
      })
      .first();
    // Cancel: thường cùng form với #saveQuotation; fallback trong card có tiêu đề trang
    const cancelInSaveForm = page
      .locator("form:has(#saveQuotation)")
      .locator("a, button")
      .filter({ hasText: /cancel|huỷ|hủy/i })
      .first();
    const cancelInCard = this.importFormCard
      .getByRole("button", { name: /cancel|huỷ|hủy/i })
      .or(this.importFormCard.getByRole("link", { name: /cancel|huỷ|hủy/i }))
      .or(
        this.importFormCard
          .locator(
            "a.btn-secondary, button.btn-secondary, a.btn.btn-secondary, button.btn.btn-secondary",
          )
          .filter({ hasText: /cancel|huỷ|hủy/i }),
      )
      .first();
    this.cancelButton = cancelInSaveForm.or(cancelInCard);

    this.downloadTemplateButton = page.locator(
      "button#btnDownloadQuotationTemplate",
    );
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/quotation/import`);
    await this.pageTitle.waitFor({ state: "visible", timeout: 15000 });
  }

  /** Các control chính của form import (dùng cho smoke UI). */
  async expectEssentialFormVisible() {
    await this.pageTitle.waitFor({ state: "visible" });
    await this.vendorSelect.waitFor({ state: "attached" });
    await this.companySelect.waitFor({ state: "attached" });
    await this.receivingTimeInput.waitFor({ state: "attached" });
    await this.quotationTypeSelect.waitFor({ state: "attached" });
    await this.noteInput.waitFor({ state: "visible" });
    await this.excelFileInput.waitFor({ state: "attached" });
    await this.importBySkuRadio.waitFor({ state: "visible" });
    await this.importByBarcodeRadio.waitFor({ state: "visible" });
    await this.downloadTemplateButton.waitFor({ state: "visible" });
    await this.validateFileButton.waitFor({ state: "visible" });
    await this.saveQuotationButton.waitFor({ state: "visible" });
    await this.cancelButton.waitFor({ state: "visible", timeout: 15000 });
  }

  private async selectSelect2ByText(selectId: string, optionText: string) {
    // Click vào container Select2 để mở dropdown (không click vào native select vì bị ẩn)
    const container = this.page
      .locator(
        `.select2-container[data-select2-id="select2-data-${selectId}"], ` +
          `span.select2-selection[aria-labelledby*="${selectId}"], ` +
          `span.select2-container + span, ` +
          // Fallback: tìm container ngay trước/sau native select
          `select#${selectId} + .select2-container span.select2-selection`,
      )
      .first();

    // Cách chắc chắn hơn: tìm container bằng aria nối với select id
    // Một số Select2 dùng aria-owns/aria-controls -> "-results", một số dùng aria-labelledby -> "-container"
    const containerByAriaOwns = this.page
      .locator(
        `span[aria-owns="select2-${selectId}-results"], ` +
          `span[aria-controls="select2-${selectId}-results"], ` +
          `span[aria-labelledby="select2-${selectId}-container"]`,
      )
      .first();

    if ((await containerByAriaOwns.count()) > 0) {
      await containerByAriaOwns.waitFor({ state: "visible", timeout: 15000 });
      await containerByAriaOwns.click();
    } else {
      await container.waitFor({ state: "visible", timeout: 15000 });
      await container.click();
    }

    // Chờ dropdown mở và tìm option khớp text
    const option = this.page.locator(".select2-results__option").filter({
      hasText: optionText,
    });
    await option.first().waitFor({ state: "visible", timeout: 10000 });
    await option.first().click();
  }

  // Chọn Quotation Type: id="quotationType", options: Normal(0), Tester(1), Gift(2), Activation(3), POSM(4)
  async selectQuotationType(type: string) {
    await this.selectSelect2ByText("quotationType", type);
  }

  // Chọn Company: native select#quotation_company (Select2 id tương ứng)
  async selectCompany(companyName: string) {
    await this.selectSelect2ByText("quotation_company", companyName);
  }

  // Chọn Vendor: id="vendor" — click → gõ tên vendor vào search → chọn kết quả
  async selectVendor(vendorName: string) {
    const selectId = "vendor";

    // Click vào Select2 container để mở dropdown
    const container = this.page
      .locator(
        `span[aria-owns="select2-${selectId}-results"], ` +
          `span[aria-controls="select2-${selectId}-results"], ` +
          `span[aria-labelledby="select2-${selectId}-container"]`,
      )
      .first();
    await container.waitFor({ state: "visible", timeout: 15000 });
    await container.click();

    // Chờ search input xuất hiện và gõ tên vendor
    const searchInput = this.page.locator(
      ".select2-dropdown .select2-search__field",
    );
    await searchInput.waitFor({ state: "visible", timeout: 10000 });
    await searchInput.fill(vendorName);

    // Chờ loading biến mất
    await this.page
      .locator(".select2-results__option--disabled, .select2-results__message")
      .waitFor({ state: "hidden", timeout: 15000 })
      .catch(() => null);

    // Chờ và click option khớp
    const option = this.page
      .locator(".select2-results__option--selectable")
      .filter({ hasText: vendorName });
    await option.first().waitFor({ state: "visible", timeout: 15000 });
    await option.first().click();
  }

  async selectImportType(type: "sku" | "barcode") {
    if (type === "sku") {
      await this.importBySkuRadio.waitFor({ state: "visible", timeout: 5000 });
      await this.importBySkuRadio.click();
    } else {
      await this.importByBarcodeRadio.waitFor({
        state: "visible",
        timeout: 5000,
      });
      await this.importByBarcodeRadio.click();
    }
  }

  async uploadExcelFile(filePath: string) {
    await this.excelFileInput.setInputFiles(filePath);
  }

  async validateFile() {
    this.page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await this.validateFileButton.click();
  }

  /**
   * Click Validate khi kỳ vọng `alert`/`confirm` (vd. chưa chọn file).
   * Phải chờ dialog và click **song song**: `alert()` chặn main thread nên `await click()` trước
   * khi dismiss dialog sẽ bị treo vô hạn.
   */
  async clickValidateExpectBrowserAlert(): Promise<string> {
    const dialogPromise = this.page.waitForEvent("dialog", {
      timeout: 15000,
    });
    const clickPromise = this.validateFileButton.click();
    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();
    await clickPromise;
    return message;
  }

  /** Tải file mẫu Excel; trả về object Download của Playwright. */
  async downloadQuotationTemplate(): Promise<Download> {
    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.downloadTemplateButton.click(),
    ]);
    return download;
  }

  async clickCancel() {
    await this.saveQuotationButton.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.cancelButton.scrollIntoViewIfNeeded();
    await this.cancelButton.waitFor({ state: "visible", timeout: 15000 });
    await this.cancelButton.click();
  }

  async saveQuotation() {
    await this.saveQuotationButton.click();
    await this.confirmCreateSuccessButton.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.confirmCreateSuccessButton.click();
  }

  async fillNote(note: string) {
    await this.noteInput.fill(note);
  }

  async setRequireVat(checked: boolean) {
    const isChecked = await this.requireVatCheckbox.isChecked();
    if (isChecked !== checked) {
      await this.requireVatCheckbox.click();
    }
  }
}
