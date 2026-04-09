import type { Locator, Page } from "@playwright/test";

export class PgStaffPage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly idNumberInput: Locator;
  readonly addressInput: Locator;
  readonly noteInput: Locator;
  readonly workTypeSelect: Locator;
  readonly avatarPencil: Locator;
  readonly frontSidePencil: Locator;
  readonly backSidePencil: Locator;
  readonly submitButton: Locator;
  readonly requestToActivateButton: Locator;
  readonly confirmActivateButton: Locator;
  readonly approveInfoStaffButton: Locator;
  readonly confirmApproveStaffButton: Locator;
  readonly rejectInfoStaffButton: Locator;
  readonly confirmRejectStaffButton: Locator;
  readonly modalInputRejectReason: Locator;

  constructor(public readonly page: Page) {
    this.nameInput = page.getByLabel("name");
    this.emailInput = page.getByLabel("email");
    this.phoneInput = page.getByLabel("phone");
    this.idNumberInput = page.getByLabel("ID Number");
    this.addressInput = page.getByLabel("address");
    this.noteInput = page.getByLabel("note");
    this.workTypeSelect = page.getByLabel("workType");
    this.avatarPencil = page.locator(".avatar_pencil");
    this.frontSidePencil = page.locator(".front_side_pencil");
    this.backSidePencil = page.locator(".back_side_pencil");

    this.submitButton = page.getByRole("button", {
      name: "Save",
    });
    this.requestToActivateButton = page
      .getByRole("button", {
        name: "Request to active",
      })
      .first();
    this.approveInfoStaffButton = page
      .getByRole("button", {
        name: "Approve",
      })
      .first();
    this.confirmActivateButton = page.locator(
      ".swal2-confirm, button.swal2-confirm",
    );
    this.confirmApproveStaffButton = page.locator(
      ".swal2-confirm, button.swal2-confirm",
    );
    this.rejectInfoStaffButton = page.getByRole("button", {
      name: "Reject",
    });
    this.confirmRejectStaffButton = page.locator("#btnConfirmReject");

    this.modalInputRejectReason = page.locator("#note_reject_textarea");
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/promoter/pg-draft/create`);
    await this.page.waitForSelector(
      'input[name="name"], input[name="email"], input[name="phone"], input[name="cmnd"], input[name="address"], select[name="workType"]',
      { state: "visible" },
    );
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async fillEmail(email: string) {
    await this.emailInput.first().fill(email);
  }

  async fillPhone(phone: string) {
    await this.phoneInput.first().fill(phone);
  }

  async fillIdNumber(idNumber: string) {
    await this.idNumberInput.scrollIntoViewIfNeeded();
    await this.idNumberInput.fill(idNumber);
  }

  async fillAddress(address: string) {
    await this.addressInput.scrollIntoViewIfNeeded();
    await this.addressInput.fill(address);
  }

  async fillNote(note: string) {
    await this.noteInput.scrollIntoViewIfNeeded();
    await this.noteInput.fill(note);
  }

  async selectVendor(vendorText: string) {
    // Click the Select2 container to open dropdown (triggers select2:select event properly)
    const vendorContainer = this.page
      .locator(".select2-container[data-select2-id] span.select2-selection")
      .first();
    await vendorContainer.waitFor({ state: "visible", timeout: 15000 });
    await vendorContainer.click();

    // Type in the search box to filter options
    const searchBox = this.page.locator(
      ".select2-dropdown .select2-search__field",
    );
    await searchBox.waitFor({ state: "visible", timeout: 10000 });
    await searchBox.fill(vendorText.substring(0, 8)); // search by code prefix e.g. "V260064"

    // Wait for results and click the matching option
    const option = this.page.locator(".select2-results__option").filter({
      hasText: vendorText,
    });
    await option.first().waitFor({ state: "visible", timeout: 10000 });
    await option.first().click();

    // Wait for brand_id AJAX to finish loading (options appear after vendor select2:select fires)
    await this.page.waitForFunction(
      () => {
        const brand = document.getElementById("brand_id") as HTMLSelectElement;
        return brand && !brand.disabled && brand.options.length > 0;
      },
      { timeout: 20000 },
    );
  }

  async chooseRandomBrands(count: number = 3) {
    const options = await this.page.locator("#brand_id option").all();
    if (options.length === 0) return;

    const values = await Promise.all(
      options.map(async (opt) => await opt.getAttribute("value")),
    ).then((vals) => vals.filter((v) => v && v !== ""));

    if (values.length < count) count = values.length;

    const shuffled = values.sort(() => 0.5 - Math.random());
    const selectedValues = shuffled.slice(0, count);

    await this.page.evaluate((selected) => {
      const select = document.getElementById("brand_id") as HTMLSelectElement;
      if (!select) return;
      Array.from(select.options).forEach((opt) => (opt.selected = false));
      selected.forEach((value) => {
        const opt = select.querySelector(
          `option[value="${value}"]`,
        ) as HTMLOptionElement;
        if (opt) opt.selected = true;
      });
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }, selectedValues);
  }

  async chooseRandomLocations(count: number = 3) {
    // Lấy tất cả <option> trong select#loc_id
    const options = await this.page.locator("#loc_id option").all();
    if (options.length === 0) return;

    // Lấy danh sách value của các option, loại bỏ option rỗng (placeholder)
    const values = await Promise.all(
      options.map(async (opt) => await opt.getAttribute("value")),
    ).then((vals) => vals.filter((v) => v && v !== ""));

    // Nếu số option ít hơn count yêu cầu thì chọn tất cả
    if (values.length < count) count = values.length;

    // Xáo trộn ngẫu nhiên rồi lấy `count` phần tử đầu
    const shuffled = values.sort(() => 0.5 - Math.random());
    const selectedValues = shuffled.slice(0, count);

    // Dùng evaluate vì loc_id là multi-select được điều khiển bởi JS thư viện,
    // không thể dùng Playwright selectOption() trực tiếp.
    // Bỏ chọn tất cả trước, sau đó chọn các value đã pick, rồi bắn event "change"
    // để trigger các listener JS phụ thuộc vào giá trị location
    await this.page.evaluate((selected) => {
      const select = document.getElementById("loc_id") as HTMLSelectElement;
      if (!select) return;
      Array.from(select.options).forEach((opt) => (opt.selected = false));
      selected.forEach((value) => {
        const opt = select.querySelector(
          `option[value="${value}"]`,
        ) as HTMLOptionElement;
        if (opt) opt.selected = true;
      });
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }, selectedValues);
  }

  async selectWorkType(typeText: string) {
    // Danh sách các value attribute hợp lệ của <option> trong select.
    // Dùng để phân biệt khi nào truyền vào là value (vd: "inline")
    // hay label hiển thị (vd: "Inline Staff") → chọn đúng overload của selectOption()
    const knownValues = [
      "inline",
      "merchandising",
      "audit",
      "audit-merchandising",
      "construction-and-repair",
      "kol-koc",
      "activation",
      "training",
    ];

    // Ưu tiên dùng Playwright API nếu select đang visible và enabled (select bình thường)
    const s = this.workTypeSelect.first();
    if (
      (await s.count()) > 0 &&
      (await s.isVisible()) &&
      (await s.isEnabled())
    ) {
      // Nếu typeText khớp với value attribute → chọn theo value
      // Ngược lại → chọn theo label text hiển thị
      if (knownValues.includes(typeText)) {
        await s.selectOption({ value: typeText });
      } else {
        await s.selectOption({ label: typeText });
      }
      return;
    }

    // Fallback: inject JS trực tiếp vào browser khi select bị ẩn hoặc
    // bị wrap bởi thư viện UI (Select2, custom dropdown...) khiến Playwright
    // không interact trực tiếp được
    await this.page.evaluate((workType) => {
      // Tìm element bằng 2 selector dự phòng (name hoặc id)
      const sel = document.querySelector(
        'select[name="workType"], select#work_type',
      );
      if (!sel) return;
      // Tìm option khớp theo value hoặc text chứa keyword (case-insensitive)
      const candidate = Array.from((sel as HTMLSelectElement).options).find(
        (opt) =>
          opt.value === workType ||
          opt.text.trim().toLowerCase().includes(workType.toLowerCase()),
      );
      if (candidate) {
        // Set giá trị và bắn event "change" để trigger các JS listener
        // (vd: load danh sách brand/location theo workType vừa chọn)
        (sel as HTMLSelectElement).value = candidate.value;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }, typeText);
  }

  private async uploadImageWithCropper(
    pencilLocator: Locator,
    filePath: string,
  ) {
    // Nếu nút bút chì không visible (hoặc element không tồn tại) thì bỏ qua.
    // .catch(() => false) để tránh throw lỗi khi element chưa xuất hiện trong DOM
    if (!(await pencilLocator.isVisible().catch(() => false))) {
      console.warn("Pencil button not visible, skipping image upload");
      return;
    }

    // Scroll button vào viewport trước để tránh bị khuất bởi element khác
    await pencilLocator.scrollIntoViewIfNeeded();

    // Phải đăng ký lắng nghe "filechooser" event TRƯỚC khi click để không bị miss event.
    // Dùng Promise.all để 2 việc chạy đồng thời: chờ event + trigger click mở file picker
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent("filechooser"),
      pencilLocator.click(),
    ]);

    // Truyền đường dẫn file thay cho việc click chọn thủ công trong dialog
    await fileChooser.setFiles(filePath);

    // Sau khi chọn file, trang mở modal crop ảnh → chờ modal xuất hiện
    await this.page
      .locator("#modal-image-cropper")
      .waitFor({ state: "visible", timeout: 20000 });

    // Xác nhận crop ảnh theo vùng mặc định
    await this.page.locator("#crop-image").click();

    // Chờ modal đóng lại để đảm bảo quá trình crop hoàn tất trước khi tiếp tục
    await this.page
      .locator("#modal-image-cropper")
      .waitFor({ state: "hidden", timeout: 15000 });

    // Sau khi crop xong, JS động thêm <input class="validate_image"> vào
    // .image-input-outline.active. Chờ "attached" (có trong DOM, dù không visible)
    // để đảm bảo ảnh đã được gắn vào form trước khi submit
    await this.page
      .locator(".image-input-outline.active input.validate_image")
      .waitFor({ state: "attached", timeout: 10000 });
  }

  async uploadAvatar(filePath: string) {
    await this.uploadImageWithCropper(this.avatarPencil, filePath);
  }

  async uploadIdNumberFront(filePath: string) {
    await this.uploadImageWithCropper(this.frontSidePencil, filePath);
  }

  async uploadIdNumberBack(filePath: string) {
    await this.uploadImageWithCropper(this.backSidePencil, filePath);
  }

  async submit() {
    await this.submitButton.first().click();
    await this.page.waitForLoadState("networkidle").catch(() => null);
  }

  async getValidationErrors() {
    // Wait a moment for errors to render after submit
    await this.page.waitForTimeout(1000);
    const errors = await this.page
      .locator(
        ".text-danger, .invalid-feedback, .ant-form-item-explain, " +
          ".alert-danger, .alert.alert-danger, " +
          ".swal2-html-container, .swal2-content, " +
          ".toast-error, .toast-message, " +
          "[class*='error'], [class*='Error']",
      )
      .allTextContents();
    return errors.map((x) => x.trim()).filter(Boolean);
  }

  async requestToActivateButtonClick() {
    await this.requestToActivateButton.waitFor({
      state: "visible",
      timeout: 60000,
    });
    // Wait for JS handlers to bind before clicking (same issue as requestToConfirm)
    await this.page.waitForLoadState("load");
    await this.requestToActivateButton.click();
    await this.confirmActivateButton.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.confirmActivateButton.click();
    await this.page
      .locator(".swal2-container")
      .waitFor({ state: "hidden", timeout: 10000 })
      .catch(() => null);
  }

  async approveInfoStaffButtonClick() {
    await this.approveInfoStaffButton.waitFor({
      state: "visible",
      timeout: 60000,
    });
    await this.page.waitForLoadState("load");
    await this.approveInfoStaffButton.click();
    await this.confirmApproveStaffButton.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.confirmApproveStaffButton.click();
    await this.page
      .locator(".swal2-container")
      .waitFor({ state: "hidden", timeout: 10000 })
      .catch(() => null);
  }

  async rejectInfoStaffButtonClick() {
    await this.rejectInfoStaffButton.waitFor({
      state: "visible",
      timeout: 30000,
    });
    await this.page.waitForLoadState("load");
    await this.rejectInfoStaffButton.click();
    // Chờ modal reject mở ra (textarea chuyển từ hidden → visible)
    await this.modalInputRejectReason.waitFor({
      state: "visible",
      timeout: 15000,
    });
  }

  async inputRejectReason(reason: string) {
    // Modal đã mở từ rejectInfoStaffButtonClick, điền thẳng vào textarea
    await this.modalInputRejectReason.fill(reason);
    await this.confirmRejectStaffButton.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.confirmRejectStaffButton.click();
  }

  async getStatusWorking(): Promise<string> {
    const select = this.page.locator("select#hr_status");
    await select.waitFor({ state: "attached", timeout: 15000 });
    const selectedText = await select.evaluate((el: HTMLSelectElement) => {
      const selected = el.options[el.selectedIndex];
      return selected ? selected.text.trim() : "";
    });
    return selectedText;
  }
}
