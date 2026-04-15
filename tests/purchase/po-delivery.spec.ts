import { PoDeliveryPage } from "../../pages/purchase/PoDeliveryPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Purchase - PO Delivery Registration", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("TC01 - Navigate — URL, title, calendar dashboard and primary CTAs @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const po = new PoDeliveryPage(page);

    await po.goto(baseUrl);

    await expect(page).toHaveURL(/\/purchase-order\/register-delivery/i);
    await po.expectDashboardVisible();
    await expect(po.pageTitleH1).toHaveText(/PO Delivery Registration/i);
    await expect(po.todayCalendarButton).toBeAttached();
  });

  test("TC02 - Admin — Default / Custom config controls exist in DOM @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PoDeliveryPage(authenticatedPage.page);
    await po.goto(baseUrl);
    await po.expectDashboardVisible();
    await po.expectAdminConfigControlsInDom();
  });

  test("TC03 - Calendar next month navigation keeps dashboard @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const po = new PoDeliveryPage(authenticatedPage.page);
    await po.goto(baseUrl);
    await po.expectDashboardVisible();

    await po.nextMonthCalendarButton.click();
    await expect(po.calendarRoot).toBeVisible();
    await expect(po.newRegistrationButton).toBeVisible();
  });
});


