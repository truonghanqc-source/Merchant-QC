import { AddBookingPage } from "../../pages/bookingservice/AddBookingPage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Booking Service - Add Booking", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("TC01 - Navigate to add booking page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const addBooking = new AddBookingPage(page);

    await addBooking.goto(baseUrl);

    await expect(page.locator(".page-title")).toContainText(
      /Add Booking Service/i,
      { timeout: 10000 },
    );
  });
});


