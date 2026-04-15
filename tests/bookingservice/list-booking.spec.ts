import { ListBookingPage } from "../../pages/bookingservice/ListBookingPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("bookingservice - ListBookingPage Navigate", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("TC01 - Navigate @smoke", async ({ authenticatedPage, baseUrl }) => {
    const { page } = authenticatedPage;
    const listBooking = new ListBookingPage(page);

    await listBooking.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /List Booking Service/i,
      { timeout: 10000 },
    );
  });
});


