import type { Locator, Page } from "@playwright/test";

/**
 * PO Delivery Registration — `/purchase-order/register-delivery`.
 * Dashboard lịch (FullCalendar `div.fc`), form kho `form#locationForm` (theo DOM).
 * Theo spec nghiệp vụ: Admin thấy cấu hình Default/Custom; Vendor không (test dùng admin fixture).
 */
export class PoDeliveryPage {
  readonly pageTitleH1: Locator;
  /** FullCalendar v5+ */
  readonly calendarRoot: Locator;
  readonly todayCalendarButton: Locator;
  readonly nextMonthCalendarButton: Locator;
  readonly newRegistrationButton: Locator;
  readonly manageLocationsButton: Locator;
  /** Trong modal/panel — có thể `attached` nhưng chưa `visible`; dùng normalize-space tránh trùng “Save Default Config”. */
  readonly defaultConfigButton: Locator;
  readonly customConfigButton: Locator;
  readonly locationForm: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.calendarRoot = page.locator("div.fc").first();
    this.todayCalendarButton = page.locator("button.fc-today-button");
    this.nextMonthCalendarButton = page.locator("button.fc-next-button").first();
    this.newRegistrationButton = page.locator("#newRegistrationBtn");
    this.manageLocationsButton = page.getByRole("button", {
      name: "Manage Locations",
    });
    this.defaultConfigButton = page.locator(
      'xpath=//button[normalize-space()="Default Config"]',
    );
    this.customConfigButton = page.locator(
      'xpath=//button[normalize-space()="Custom Config"]',
    );
    this.locationForm = page.locator("form#locationForm");
  }

  async goto(baseUrl: string) {
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/purchase-order/register-delivery`, {
      waitUntil: "load",
      timeout: 90000,
    });
    if (/\/login(\/|\?|$)/i.test(this.page.url())) {
      throw new Error(
        "PO Delivery Registration: redirected to /login (expired session or missing permission). Delete playwright/.auth/admin.json and re-run tests to refresh storage state.",
      );
    }
    await this.page.waitForSelector(".page-title h1, div.fc", {
      state: "visible",
      timeout: 25000,
    });
  }

  /** Dashboard lịch + CTA chính đã render. */
  async expectDashboardVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.calendarRoot.waitFor({ state: "visible", timeout: 20000 });
    await this.newRegistrationButton.waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.manageLocationsButton.waitFor({
      state: "visible",
      timeout: 15000,
    });
  }

  /** Quyền Admin: control cấu hình có trong DOM (thường trong panel cấu hình, chưa mở vẫn `attached`). */
  async expectAdminConfigControlsInDom() {
    await this.defaultConfigButton.waitFor({ state: "attached", timeout: 10000 });
    await this.customConfigButton.waitFor({ state: "attached", timeout: 10000 });
  }
}
