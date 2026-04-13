import { ListBookingPage } from "../../pages/bookingservice/ListBookingPage.js";
import { test, expect } from "../../fixtures/index.js";

test.describe("bookingservice - ListBookingPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const pageObject = new ListBookingPage(page);

    await pageObject.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /List Booking Service/i,
      { timeout: 10000 },
    );
  });
});
