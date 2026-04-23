import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { waitForNextPaint } from "../../utils/page-waits.ts";

export class ProductPage {
  /** Tiêu đề form tạo mới (tránh strict mode với card khác). */
  readonly addProductCardTitle: Locator;
  /** Badge trạng thái duyệt trên header workflow */
  readonly badgeWaitingApprove: Locator;
  readonly badgeApproved: Locator;
  readonly badgeRejected: Locator;
  /** Thông báo lỗi validation / SweetAlert body */
  readonly validationMessageLocator: Locator;

  // Inputs — Product Info tab
  readonly nameInput: Locator;
  readonly vendorProductNameInput: Locator;
  readonly barcodeInput: Locator;
  readonly vendorProductCodeInput: Locator;
  readonly vendorPriceInput: Locator;
  readonly marketPriceInput: Locator;
  readonly hasakiPriceInput: Locator;
  readonly lengthInput: Locator;
  readonly widthInput: Locator;
  readonly heightInput: Locator;
  readonly weightInput: Locator;

  // Buttons
  readonly saveAndNextButton: Locator;
  readonly requestToApproveButton: Locator;
  readonly approveButton: Locator;
  readonly disApproveButton: Locator;
  readonly modalRejectProductReason: Locator;
  readonly confirmDisApproveButton: Locator;

  // Elements liên quan upload ảnh sản phẩm trên tab Image
  readonly upLoadBtn: Locator;
  readonly cropModal: Locator;
  readonly cropBtn: Locator;

  readonly declarationDateInput: Locator;
  readonly expirationDateInput: Locator;
  readonly declarationCodeInput: Locator;

  constructor(public readonly page: Page) {
    this.addProductCardTitle = page
      .locator(".card-title")
      .filter({ hasText: /add new product/i })
      .first();
    this.badgeWaitingApprove = page
      .locator("span.badge.badge-warning")
      .filter({ hasText: /Waiting Approve/i });
    this.badgeApproved = page
      .locator("span.badge.badge-success")
      .filter({ hasText: /^Approved$/i });
    this.badgeRejected = page
      .locator("span.badge.badge-danger")
      .filter({ hasText: /^Rejected$/i });
    // Tránh `i.text-danger.d-none` (icon badge) — `.first()` dễ trúng phần tử ẩn.
    this.validationMessageLocator = page.locator(
      ".invalid-feedback, #swal2-html-container, .text-danger:not(.d-none)",
    );

    this.nameInput = page.locator("#name");
    this.vendorProductNameInput = page.locator("#venprod_name");
    this.barcodeInput = page.locator("#barcode");
    this.vendorProductCodeInput = page.locator("#venprod_code");
    this.vendorPriceInput = page.locator("#venprod_price");
    this.marketPriceInput = page.locator("#market_price");
    this.hasakiPriceInput = page.locator("#price");
    this.lengthInput = page.locator("#plength");
    this.widthInput = page.locator("#width");
    this.heightInput = page.locator("#height");
    this.weightInput = page.locator("#weight");

    // Elements liên quan upload ảnh sản phẩm trên tab Image
    this.upLoadBtn = page.locator("#open-image-cropper");
    this.cropModal = page.locator("#modal-image-cropper");
    this.cropBtn = page.locator("#crop-image");

    // Elements liên quan trên tab Document
    this.declarationDateInput = page.locator("#announce_date");
    this.expirationDateInput = page.locator("#expiration_date_display");
    this.declarationCodeInput = page.locator("#announce_code");

    // button "Save & Next" chung cho cả 2 tab, nên khai báo ở đây để dùng lại
    this.saveAndNextButton = page.getByRole("button", { name: "Save & Next" });
    /** Accessible name có thể có khoảng trắng đầu/cuối — dùng regex. */
    this.requestToApproveButton = page.getByRole("button", {
      name: /request to approve/i,
    });
    this.approveButton = page.locator(
      "button.btnUpdateProductDetail[value='2']",
    );
    this.disApproveButton = page.locator("button.btnDisapproveProductDetail");
    this.modalRejectProductReason = page.locator("#reject_note");
    this.confirmDisApproveButton = page.locator(
      "#modal-reject-note button.btnUpdateProductDetail",
    );
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/product/detail`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForURL(/\/product\/detail/i, { timeout: 30000 });
    await this.addProductCardTitle.waitFor({
      state: "visible",
      timeout: 20000,
    });
  }

  /** Form tạo sản phẩm (tab Product Info) đã sẵn sàng nhập liệu. */
  async expectAddProductFormReady() {
    await expect(this.page).toHaveURL(/\/product\/detail/i);
    await expect(this.addProductCardTitle).toBeVisible({ timeout: 15000 });
    await expect(this.nameInput).toBeVisible({ timeout: 10000 });
  }

  async expectFirstValidationVisible(timeout = 10000) {
    await expect(this.validationMessageLocator.first()).toBeVisible({
      timeout,
    });
  }

  async expectWaitingApproveBadge(timeout = 15000) {
    await expect(this.badgeWaitingApprove).toHaveText(/Waiting Approve/i, {
      timeout,
    });
  }

  async expectApprovedBadge(timeout = 15000) {
    await expect(this.badgeApproved).toHaveText(/^Approved$/i, { timeout });
  }

  async expectRejectedBadge(timeout = 15000) {
    await expect(this.badgeRejected).toHaveText(/^Rejected$/i, { timeout });
  }

  // ─── Select2 helper (AJAX / searchable dropdown) ────────────────────────────
  /** Mở Select2 Brand, chờ list hiện, click ngẫu nhiên một dòng trong dropdown. */
  private async pickRandomOptionFromBrandSelect2(): Promise<void> {
    const selectId = "brand_id";
    const combobox = this.page
      .locator(
        `span[aria-labelledby="select2-${selectId}-container"], ` +
          `span[aria-controls="select2-${selectId}-container"], ` +
          `span[aria-controls="select2-${selectId}-results"], ` +
          `span[aria-owns="select2-${selectId}-results"]`,
      )
      .first();
    const results = this.page.locator(`#select2-${selectId}-results`);

    const openAndPickRandom = async () => {
      await combobox.waitFor({ state: "attached", timeout: 12_000 });
      await combobox.scrollIntoViewIfNeeded().catch(() => null);
      await combobox.click({ force: true });
      await results.waitFor({ state: "visible", timeout: 12_000 });
      // Chờ trong đúng `#select2-brand_id-results` — tránh chờ `.select2-results__message` toàn trang (dễ tới 15s).
      const rowLocator = results
        .locator(".select2-results__option--selectable")
        .or(
          results.locator(
            ".select2-results__option:not(.select2-results__option--disabled)",
          ),
        );
      await rowLocator.first().waitFor({ state: "visible", timeout: 10_000 });

      const selectable = results.locator(
        ".select2-results__option--selectable",
      );
      const fallback = results.locator(
        ".select2-results__option:not(.select2-results__option--disabled)",
      );
      const rows = (await selectable.count()) > 0 ? selectable : fallback;
      const n = await rows.count();
      if (n === 0) {
        throw new Error("No brand options visible in Select2 dropdown");
      }
      const choice = rows.nth(Math.floor(Math.random() * n));
      await choice.scrollIntoViewIfNeeded().catch(() => null);
      await choice.click({ force: true });
    };

    try {
      await openAndPickRandom();
    } catch {
      await this.page.keyboard.press("Escape");
      await openAndPickRandom();
    }
  }

  private async selectSelect2WithSearch(
    selectId: string,
    searchText: string,
    pickText?: string,
  ) {
    const container = this.page
      .locator(
        `span[aria-owns="select2-${selectId}-results"], ` +
          `span[aria-controls="select2-${selectId}-results"], ` +
          `span[aria-labelledby="select2-${selectId}-container"]`,
      )
      .first();

    await container.waitFor({ state: "visible", timeout: 15000 });
    await container.click();

    const searchInput = this.page.locator(
      ".select2-dropdown .select2-search__field",
    );
    await searchInput.waitFor({ state: "visible", timeout: 10000 });
    await searchInput.fill(searchText);

    // Chờ loading biến mất
    await this.page
      .locator(".select2-results__option--disabled, .select2-results__message")
      .waitFor({ state: "hidden", timeout: 15000 })
      .catch(() => null);

    const target = pickText ?? searchText;
    const option = this.page
      .locator(".select2-results__option--selectable")
      .filter({ hasText: target });
    await option.first().waitFor({ state: "visible", timeout: 15000 });
    await option.first().click();
  }

  // ─── Public select methods ───────────────────────────────────────────────────

  /** Vendor — searchable Select2 (id="vendor_id"), sau khi chọn Brand mới load */
  async selectVendor(vendorName: string) {
    await this.selectSelect2WithSearch("vendor_id", vendorName);
  }

  /** Chọn ngẫu nhiên 1 brand: mở Select2 → chọn random trong các dòng đang hiển thị. */
  async selectRandomBrand(): Promise<string> {
    const brandSelect = this.page.locator("select#brand_id");
    await brandSelect
      .locator('option:not([value=""])')
      .first()
      .waitFor({ state: "attached", timeout: 15_000 });

    await this.pickRandomOptionFromBrandSelect2();

    await expect(brandSelect).not.toHaveValue("", { timeout: 8_000 });
    return await brandSelect.evaluate((el: HTMLSelectElement) => {
      const o = el.options[el.selectedIndex];
      return (o?.textContent ?? "").trim();
    });
  }

  /** Product Type — native select (id="product_type"), e.g. "NORMAL", "GIFT" */
  async selectProductType(type: string) {
    await this.page
      .locator("select#product_type")
      .selectOption({ label: type });
  }

  /** Product's Shelf Life — native select (id="product_shelf_life_month"), e.g. "6 Month", "12 Month" */
  async selectShelfLife(value: string) {
    await this.page
      .locator("select#product_shelf_life_month")
      .selectOption({ label: value });
  }

  /** Expiration Date Formatting — native select (id="product_expiration_date_format"), e.g. "Not-Set", "DD/MM/YY" */
  async selectExpirationDateFormatting(value: string) {
    await this.page
      .locator("select#product_expiration_date_format")
      .selectOption({ label: value });
  }

  /** % Allowed Shelf Life PO — native select (id="product_shelf_life_percent_po"), e.g. "0%", "5%", "10%" */
  async selectAllowedShelfLifePO(value: string) {
    await this.page
      .locator("select#product_shelf_life_percent_po")
      .selectOption({ label: value });
  }

  // ─── Fill helpers ────────────────────────────────────────────────────────────

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async fillVendorProductName(name: string) {
    await this.vendorProductNameInput.fill(name);
  }

  async fillBarcode(barcode: string) {
    await this.barcodeInput.fill(barcode);
  }

  async fillVendorProductCode(code: string) {
    await this.vendorProductCodeInput.fill(code);
  }

  async fillVendorPrice(price: number) {
    await this.vendorPriceInput.fill(String(price));
  }

  async fillMarketPrice(price: number) {
    await this.marketPriceInput.fill(String(price));
  }

  async fillHasakiPrice(price: number) {
    await this.hasakiPriceInput.fill(String(price));
  }

  async fillLength(value: number) {
    await this.lengthInput.fill(String(value));
  }

  async fillWidth(value: number) {
    await this.widthInput.fill(String(value));
  }

  async fillHeight(value: number) {
    await this.heightInput.fill(String(value));
  }

  async fillWeight(value: number) {
    await this.weightInput.fill(String(value));
  }

  // ─── Actions ─────────────────────────────────────────────────────────────────

  /** Click "Save & Next" và chờ chuyển sang tab Image */
  async saveAndNextToImageTab() {
    await this.saveAndNextButton.click();
  }

  /** Upload ảnh sản phẩm trên tab Image:
   * 1. Click "Upload & Crop Image" → file dialog mở
   * 2. Chọn file → modal crop hiện ra
   * 3. Click "Crop & Upload" (id="crop-image") → upload xong
   */
  async waitModalOpen(locator: Locator) {
    await locator.waitFor({ state: "visible" });
    await waitForNextPaint(this.page);
  }

  // upload có retry nếu thất bại (thường do modal crop bị lỗi JS hoặc timeout)
  async uploadProductImages(filePath: string, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.upLoadBtn.scrollIntoViewIfNeeded();
        await expect(this.upLoadBtn).toBeVisible();

        const [fileChooser] = await Promise.all([
          this.page.waitForEvent("filechooser", { timeout: 30000 }),
          this.upLoadBtn.click(),
        ]);

        await fileChooser.setFiles(filePath);

        await this.waitModalOpen(this.cropModal);
        await waitForNextPaint(this.page);

        await this.cropBtn.click();

        await this.cropModal.waitFor({ state: "hidden", timeout: 10000 });

        return; // upload thành công, thoát
      } catch (err) {
        console.warn(
          `uploadProductImages attempt ${attempt}/${maxRetries} failed: ${err}`,
        );

        // Nếu modal đang mở dở → đóng lại trước khi retry
        const isModalOpen = await this.cropModal
          .evaluate((el) => el.classList.contains("show"))
          .catch(() => false);
        if (isModalOpen) {
          await this.page
            .locator(
              "#modal-image-cropper .btn-close, #modal-image-cropper [data-bs-dismiss='modal']",
            )
            .click()
            .catch(() => null);
          await this.cropModal
            .waitFor({ state: "hidden", timeout: 5000 })
            .catch(() => null);
        }

        if (attempt === maxRetries) throw err;
      }
    }
  }

  // upload nhiều ảnh cùng lúc (nếu hệ thống cho phép chọn nhiều file trong dialog)
  async uploadMultipleProductImages(filePaths: string[]) {
    for (const file of filePaths) {
      await this.uploadProductImages(file);
    }
  }

  /** Click nút để chuyển sang tab Document */
  async saveAndNextToDocumentTab() {
    await this.saveAndNextButton.click();
    await this.page.waitForSelector(
      ".nav-link.active, .nav-item.active, li.active > a",
      { state: "visible", timeout: 20000 },
    );
  }

  async declarationDateInputFill() {
    await this.declarationDateInput.waitFor({
      state: "visible",
      timeout: 15000,
    });

    // Retry click đến khi calendar mở (flaky vì animation/timing)
    const todayCell = this.page.locator(".flatpickr-day.today");
    for (let i = 0; i < 3; i++) {
      await this.declarationDateInput.click();
      try {
        await todayCell.waitFor({ state: "visible", timeout: 3000 });
        break;
      } catch {
        // calendar chưa mở → click lại
      }
    }
    await todayCell.click();
  }

  async expirationDateInputFill() {
    const input = this.expirationDateInput;
    await input.waitFor({ state: "visible", timeout: 15_000 });
    await input.scrollIntoViewIfNeeded().catch(() => null);

    // Picker append vào `body`; thường có nhiều `.daterangepicker` trong DOM → dùng `.last()` sau khi vừa mở.
    const openPicker = () => this.page.locator(".daterangepicker").last();

    const presetLis = (picker: Locator) =>
      picker
        .locator('.ranges li:not([data-range-key="Custom Range"])')
        .filter({ hasNotText: /^\s*custom\s*range\s*$/i });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        let pickerReady = false;
        for (let i = 0; i < 5; i++) {
          await input.click({ timeout: 8_000 });
          const p = openPicker();
          try {
            await p.waitFor({ state: "visible", timeout: 4_000 });
            await p.locator(".ranges li").first().waitFor({
              state: "visible",
              timeout: 4_000,
            });
            pickerReady = true;
            break;
          } catch {
            /* picker chưa sẵn sàng */
          }
        }
        if (!pickerReady) {
          throw new Error("daterangepicker did not open with preset list");
        }

        const picker = openPicker();
        await waitForNextPaint(this.page);

        const items = presetLis(picker);
        const n = await items.count();
        if (n === 0) {
          throw new Error("No preset ranges available");
        }

        const choice = items.nth(Math.floor(Math.random() * n));
        await choice.scrollIntoViewIfNeeded().catch(() => null);
        await choice.click({ force: true });

        await openPicker()
          .waitFor({ state: "hidden", timeout: 12_000 })
          .catch(() => null);

        await expect
          .poll(async () => (await input.inputValue()).trim(), {
            timeout: 8_000,
          })
          .not.toBe("");

        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        await this.page.keyboard.press("Escape").catch(() => null);
        await this.page
          .locator(".daterangepicker")
          .last()
          .waitFor({ state: "hidden", timeout: 4_000 })
          .catch(() => null);
        await waitForNextPaint(this.page);
      }
    }

    throw (
      lastError ?? new Error("expirationDateInputFill failed after 3 attempts")
    );
  }

  /** Upload file document trên tab Document */
  async uploadDocument(filePath: string) {
    const fileInput = this.page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(filePath);

    await this.page
      .locator(".upload-progress, .uploading")
      .waitFor({ state: "hidden", timeout: 20000 })
      .catch(() => null);
  }

  async declarationCodeInputFill(code: string) {
    await this.declarationCodeInput.fill(code);
  }

  async saveAndNextToLinkTab() {
    await this.saveAndNextButton.click();
  }

  /** Click "Request to approve" trên tab Document */
  async clickRequestToApprove() {
    await this.page.waitForLoadState("load");
    // Chấp nhận native browser confirm dialog "Are you sure to request approve?"
    this.page.once("dialog", (dialog) => dialog.accept());
    await this.requestToApproveButton.click();
  }

  async clickApproveButton() {
    await this.approveButton.waitFor({
      state: "visible",
      timeout: 30000,
    });
    await this.page.waitForLoadState("load");
    // Chấp nhận native browser confirm dialog "Are you sure to request approve?"
    this.page.once("dialog", (dialog) => dialog.accept());
    await this.approveButton.click();
  }

  async disApproveButtonClick() {
    await this.disApproveButton.waitFor({
      state: "visible",
      timeout: 30000,
    });

    // Retry click đến khi modal mở (Bootstrap thêm class "show")
    for (let i = 0; i < 3; i++) {
      await this.disApproveButton.click();
      try {
        await this.page.locator("#modal-reject-note.show").waitFor({
          state: "attached",
          timeout: 3000,
        });
        break;
      } catch {
        // modal chưa mở → click lại
      }
    }
  }

  async inputDisApproveReason(reason: string) {
    // Fill trực tiếp vào textarea (không cần visible vì modal đã mở)
    await this.modalRejectProductReason.fill(reason);
    await this.confirmDisApproveButton.waitFor({
      state: "visible",
      timeout: 15000,
    });
    this.page.once("dialog", (dialog) => dialog.accept());
    await this.confirmDisApproveButton.click();
  }
}
