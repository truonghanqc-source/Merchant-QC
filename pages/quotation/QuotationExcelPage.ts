import type { Locator, Page } from "@playwright/test";

export class QuotationExcelPage {
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
  readonly validateFileButton: Locator;
  readonly saveQuotationButton: Locator;
  readonly cancelButton: Locator;
  readonly downloadTemplateButton: Locator;

  constructor(public readonly page: Page) {
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
    this.importByBarcodeRadio = page.locator("input#toggle-off");
    this.excelFileInput = page.locator("input#excelFile");
    this.validateFileButton = page.locator("a#btnUploadQuotationTemplate");
    this.saveQuotationButton = page.locator("a#saveQuotation");
    this.cancelButton = page.locator("a.btn.btn-secondary");
    this.downloadTemplateButton = page.locator(
      "button#btnDownloadQuotationTemplate",
    );
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/quotation/import`);
    await this.page
      .locator("//h1[normalize-space()='Create new Quotation by Excel']", {
        hasText: "Create new Quotation by Excel",
      })
      .waitFor({
        state: "visible",
        timeout: 15000,
      });
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

  // Chọn Company: id="company", options: Cty Hasaki Beauty & Clinic(2), Global Trade(512)...
  async selectCompany(companyName: string) {
    await this.selectSelect2ByText("company", companyName);
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

  async saveQuotation() {
    await this.saveQuotationButton.click();
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
