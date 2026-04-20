import type { Locator, Page } from "@playwright/test";

/**
 * Tạo quotation mới — `/quotation/detail` ([Create new Quotation](https://test-merchant.hasaki.vn/quotation/detail)).
 * Form `form#fromBrandDetail`; Select2 trên `select#quotationType`, `select#company` (trên DOM có thêm phần tử khác `id="company"` ngoài form — luôn dùng `select#company` hoặc scope form).
 */
export class CreateQuotationPage {
  readonly pageTitleH1: Locator;
  /** Form chính (MCP DOM). */
  readonly formBrandDetail: Locator;
  readonly noteInput: Locator;
  readonly saveQuotationButton: Locator;
  readonly requestToConfirmButton: Locator;
  readonly confirmSaveButtonQuotation: Locator;
  readonly quotationConfigButton: Locator;

  /** Native &lt;select&gt; (Select2 bọc ngoài) — trang /quotation/detail */
  readonly quotationTypeSelect: Locator;
  readonly companySelect: Locator;
  readonly vendorSelect: Locator;
  readonly storeSelectRow1: Locator;
  readonly productSkuSelectRow1: Locator;
  readonly lineItemsTable: Locator;
  readonly summaryTotal: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formBrandDetail = page.locator("form#fromBrandDetail");

    this.noteInput = page.locator("#quotationNote");
    this.saveQuotationButton = page.locator("#btnSaveQuotationDetail");
    this.confirmSaveButtonQuotation = page
      .getByRole("button", { name: "Ok" })
      .or(page.getByRole("button", { name: "OK" }))
      .first();
    // UI: clickable div/span + icon (not role=link/button). List row dùng title "Request To Confirm".
    this.requestToConfirmButton = page
      .getByText(/\bRequest\s+to\s+confirm\b/i)
      .or(page.getByRole("link", { name: /request to confirm/i }))
      .or(page.getByRole("button", { name: /request to confirm/i }))
      .first();
    this.quotationConfigButton = page.locator("#quotationConfig");

    this.quotationTypeSelect = this.formBrandDetail.locator(
      "select#quotationType",
    );
    this.companySelect = this.formBrandDetail.locator("select#company");
    this.vendorSelect = this.formBrandDetail.locator("select#vendor");
    this.storeSelectRow1 = this.formBrandDetail.locator("select#store_1");
    this.productSkuSelectRow1 = this.formBrandDetail.locator(
      "select#selectProductSku_1",
    );
    this.lineItemsTable = this.formBrandDetail.locator("table tbody").first();
    this.summaryTotal = page.locator(
      "#summaryTotal, #selected-product-total-price",
    );
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/quotation/detail`, {
      waitUntil: "load",
      timeout: 90_000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    try {
      await this.page.waitForURL(/\/quotation\/detail\/?(\?|#|$)/i, {
        timeout: 30_000,
      });
    } catch {
      if (/\/login(\/|\?|$)/i.test(this.page.url())) {
        throw new Error(
          "Quotation detail: still on /login. Re-run global-setup / check LOGIN_* in .env.local.",
        );
      }
      throw new Error(`Quotation detail: unexpected URL: ${this.page.url()}`);
    }
    await this.formBrandDetail.waitFor({ state: "visible", timeout: 25_000 });
  }

  /** Form tạo quotation tại /quotation/detail (control chính có trong DOM). */
  async expectQuotationDetailFormVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15_000 });
    await this.formBrandDetail.waitFor({ state: "visible", timeout: 15_000 });
    await this.quotationTypeSelect.waitFor({
      state: "attached",
      timeout: 15000,
    });
    await this.companySelect.waitFor({ state: "attached", timeout: 15000 });
    await this.vendorSelect.waitFor({ state: "attached", timeout: 15000 });
    await this.storeSelectRow1.waitFor({ state: "attached", timeout: 15000 });
    await this.productSkuSelectRow1.waitFor({
      state: "attached",
      timeout: 15000,
    });
    await this.noteInput.waitFor({ state: "visible", timeout: 15000 });
    await this.saveQuotationButton.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.quotationConfigButton.waitFor({
      state: "attached",
      timeout: 10000,
    });
    await this.lineItemsTable.waitFor({ state: "attached", timeout: 15000 });
    await this.summaryTotal
      .first()
      .waitFor({ state: "attached", timeout: 15000 });
  }

  // Helper: open Select2 then pick option by visible text (combobox often "hidden" in Playwright).
  private async selectSelect2ByText(selectId: string, optionText: string) {
    const combobox = this.formBrandDetail
      .locator(
        `span[aria-labelledby="select2-${selectId}-container"], ` +
          `span[aria-controls="select2-${selectId}-container"], ` +
          `span[aria-controls="select2-${selectId}-results"], ` +
          `span[aria-owns="select2-${selectId}-results"]`,
      )
      .first();

    const results = this.page.locator(`#select2-${selectId}-results`);

    const openAndChoose = async () => {
      await combobox.waitFor({ state: "attached", timeout: 20_000 });
      await combobox.scrollIntoViewIfNeeded().catch(() => null);
      await combobox.click({ force: true });
      await results.waitFor({ state: "visible", timeout: 15_000 });
      const option = results
        .locator(".select2-results__option")
        .filter({ hasText: optionText });
      const chosen = option.first();
      await chosen.waitFor({ state: "visible", timeout: 15_000 });
      await chosen.click();
    };

    try {
      await openAndChoose();
    } catch {
      await this.page.keyboard.press("Escape");
      await openAndChoose();
    }
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

    const container = this.formBrandDetail
      .locator(
        `span[aria-labelledby="select2-${selectId}-container"], ` +
          `span[aria-controls="select2-${selectId}-container"], ` +
          `span[aria-controls="select2-${selectId}-results"], ` +
          `span[aria-owns="select2-${selectId}-results"]`,
      )
      .first();
    await container.waitFor({ state: "attached", timeout: 20_000 });
    await container.scrollIntoViewIfNeeded().catch(() => null);
    await container.click({ force: true });

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

  async fillNote(note: string) {
    await this.noteInput.fill(note);
  }

  // Chọn store theo rowIndex (mặc định row 1): id="store_{rowIndex}"
  // Yêu cầu: phải chọn Company trước, store mới có dữ liệu
  // storeName: tên store cần chọn (partial match), không truyền thì chọn ngẫu nhiên
  async selectStore(storeName?: string, rowIndex: number = 1): Promise<string> {
    const selectId = `store_${rowIndex}`;

    // Chờ native select có options thực (bỏ placeholder "" và "multi")
    // Options được inject vào DOM sau khi Company được chọn
    await this.page.waitForFunction(
      (id) => {
        const sel = document.querySelector<HTMLSelectElement>(`select#${id}`);
        if (!sel) return false;
        return Array.from(sel.options).some(
          (o) => o.value !== "" && o.value !== "multi",
        );
      },
      selectId,
      { timeout: 30000 },
    );

    // Đọc options từ native select (đã có sẵn trong DOM)
    const options = await this.page.locator(`select#${selectId} option`).all();
    const validOptions = await Promise.all(
      options.map(async (opt) => ({
        value: await opt.getAttribute("value"),
        text: (await opt.textContent())?.trim() ?? "",
      })),
    ).then((opts) =>
      opts.filter((o) => o.value && o.value !== "" && o.value !== "multi"),
    );

    if (validOptions.length === 0) {
      throw new Error(
        `Không có store nào (row ${rowIndex}). Kiểm tra lại Company đã chọn chưa.`,
      );
    }

    let selected: { value: string | null; text: string };
    if (storeName) {
      const found = validOptions.find((o) =>
        o.text.toLowerCase().includes(storeName.toLowerCase()),
      );
      if (!found) {
        throw new Error(
          `Store "${storeName}" không tìm thấy (row ${rowIndex}). Options hiện có: ${validOptions.map((o) => o.text).join(" | ")}`,
        );
      }
      selected = found;
    } else {
      selected = validOptions[Math.floor(Math.random() * validOptions.length)]!;
    }

    // Dùng selectSelect2ByText để click đúng Select2 container và chọn option
    await this.selectSelect2ByText(selectId, selected.text);
    return selected.text;
  }

  // Chọn product theo rowIndex (mặc định row 1): id="selectProductSku_{rowIndex}"
  // Flow: click field → gõ SKU vào search input → chờ AJAX → click option
  // sku: mã SKU cần tìm, không truyền thì gõ ký tự trống để lấy danh sách rồi chọn random
  async selectProduct(sku?: string, rowIndex: number = 1): Promise<string> {
    const selectId = `selectProductSku_${rowIndex}`;

    const container = this.formBrandDetail
      .locator(
        `span[aria-labelledby="select2-${selectId}-container"], ` +
          `span[aria-controls="select2-${selectId}-container"], ` +
          `span[aria-controls="select2-${selectId}-results"], ` +
          `span[aria-owns="select2-${selectId}-results"]`,
      )
      .first();
    await container.waitFor({ state: "attached", timeout: 20_000 });
    await container.scrollIntoViewIfNeeded().catch(() => null);
    await container.click({ force: true });

    // Chờ search input xuất hiện trong dropdown
    const searchInput = this.page.locator(
      ".select2-dropdown .select2-search__field",
    );
    await searchInput.waitFor({ state: "visible", timeout: 10000 });

    // Gõ SKU vào search để trigger AJAX
    const keyword = sku ?? "";
    await searchInput.fill(keyword);

    // Chờ AJAX trả về kết quả (loading biến mất, có ít nhất 1 option selectable)
    await this.page
      .locator(".select2-results__option--disabled, .select2-results__message")
      .waitFor({ state: "hidden", timeout: 15000 })
      .catch(() => null);

    const selectableOption = this.page.locator(
      ".select2-results__option--selectable",
    );
    await selectableOption
      .first()
      .waitFor({ state: "visible", timeout: 15000 });

    // Đọc tất cả options selectable
    const allOptions = await selectableOption.all();

    if (allOptions.length === 0) {
      await this.page.keyboard.press("Escape");
      throw new Error(
        `Không tìm thấy product${sku ? ` với SKU "${sku}"` : ""} (row ${rowIndex})`,
      );
    }

    // Chọn đúng SKU hoặc random
    const target = sku
      ? allOptions[0]! // AJAX đã filter theo SKU, lấy kết quả đầu tiên
      : allOptions[Math.floor(Math.random() * allOptions.length)]!;

    await target.click();

    // Lấy text đã chọn từ Select2 container sau khi click
    const selectedText = await this.page
      .locator(
        `span[aria-labelledby="select2-${selectId}-container"] .select2-selection__rendered`,
      )
      .textContent()
      .catch(() => sku ?? "");

    return selectedText?.trim() ?? sku ?? "";
  }

  // Nhập quantity cho row theo rowIndex (mặc định row 1), giá trị phải <= 6
  async fillQuantity(quantity: number = 1, rowIndex: number = 1) {
    const qty = Math.min(quantity, 6);
    const quantityInput = this.formBrandDetail
      .locator(`input#qty_${rowIndex}`)
      .or(
        this.formBrandDetail.locator(
          `tbody tr:nth-child(${rowIndex}) input[name="qty"]`,
        ),
      )
      .first();
    await quantityInput.fill(String(qty));
  }

  async saveQuotation() {
    await this.saveQuotationButton.click();
    await this.confirmSaveButtonQuotation.waitFor({ state: "visible" });
    await this.confirmSaveButtonQuotation.click();
  }

  // Flow: click Save → SweetAlert lỗi hiện ra → đọc text → click OK đóng popup
  async saveQuotationExpectErrorVAT(): Promise<string> {
    await this.saveQuotationButton.click();
    const alert = this.page.locator("#swal2-html-container");
    await alert.waitFor({ state: "visible", timeout: 15000 });
    const text = (await alert.textContent())?.trim() ?? "";
    await this.page.locator(".swal2-confirm").click();
    return text;
  }

  async requestToConfirm() {
    await this.page.waitForURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 60_000 },
    );
    await this.page.waitForLoadState("domcontentloaded");
    await this.requestToConfirmButton.waitFor({
      state: "visible",
      timeout: 60_000,
    });

    // Wait for JS handlers to bind before clicking
    // (clicking too early causes GET request instead of POST → 403)
    await this.page.waitForLoadState("load");

    // Đăng ký handler cho native browser dialog (just in case)
    this.page.once("dialog", async (dialog) => {
      await dialog.accept();
    });

    await this.requestToConfirmButton.click();

    // Badge có thể dùng nhiều class khác nhau tuỳ version
    const badge = this.page
      .locator("span.badge-warning, span.badge-danger, span[class*='badge']")
      .filter({ hasText: /Waiting For Confirm|Waiting for Confirm/i });
    const sweetAlertConfirm = this.page.locator(".swal2-confirm");

    // Race giữa SweetAlert xuất hiện vs badge xuất hiện thẳng (không có modal)
    const result = await Promise.race([
      sweetAlertConfirm
        .waitFor({ state: "visible", timeout: 20000 })
        .then(() => "swal" as const)
        .catch(() => "timeout" as const),
      badge
        .waitFor({ state: "visible", timeout: 20000 })
        .then(() => "badge" as const)
        .catch(() => "timeout" as const),
    ]);

    if (result === "swal") {
      await sweetAlertConfirm.click();
      await this.page
        .locator(".swal2-container, .swal2-popup")
        .waitFor({ state: "hidden", timeout: 10000 })
        .catch(() => null);
    } else if (result === "timeout") {
      // Cả swal lẫn badge đều không xuất hiện → thử click lại 1 lần
      await this.page.waitForLoadState("load").catch(() => null);
      await this.requestToConfirmButton.click();
      await this.page
        .locator(".swal2-confirm")
        .waitFor({ state: "visible", timeout: 10000 })
        .then(() => this.page.locator(".swal2-confirm").click())
        .catch(() => null);
    }

    // Chờ badge "Waiting For Confirm" xuất hiện
    await badge.waitFor({ state: "visible", timeout: 30000 });
  }

  // Click vào nút cấu hình SKU sử dụng cho quotation không có VAT
  async quotationConfigCLick() {
    await this.quotationConfigButton.click();
  }

  // Lấy text hiển thị tổng tiền (Summary Total)
  // Beauty & Clinic dùng #summaryTotal, Global Trade dùng #selected-product-total-price
  async getSummaryTotal(): Promise<string> {
    const total = this.page.locator(
      "#summaryTotal, #selected-product-total-price",
    );
    await total.first().waitFor({ state: "attached", timeout: 20000 });
    const text = await total.first().textContent();
    return text?.trim() ?? "";
  }
}
