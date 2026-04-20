import type { Page } from "@playwright/test";
import { CreateScheduleMultiPage } from "../../pages/pgpb/CreateScheduleMultiPage.ts";
import { test, expect } from "../../fixtures/index.ts";
import { vendorLabelsPgStaff } from "../../playwright/test-data/vendors.ts";

/** Tomorrow → last day of next month (`DD/MM/YYYY - DD/MM/YYYY`), within server “end of next month” rule. */
function workDateRangeForMultiSchedule(): string {
  const pad = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const endNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  return `${pad(start)} - ${pad(endNextMonth)}`;
}

/** Vendor → modal PG → điền 1 dòng inline → Next tới màn Review. */
async function arrangeMultiScheduleOnReviewStep(
  page: Page,
  baseUrl: string,
  vendorLabel: string,
): Promise<CreateScheduleMultiPage> {
  const multi = new CreateScheduleMultiPage(page);
  await multi.goto(baseUrl);
  await multi.expectStepOneShellVisible();
  await multi.selectVendorByLabel(vendorLabel);
  await expect(multi.addPgPbButton).toBeEnabled();
  await multi.addFirstStaffFromModal();
  await expect(multi.selectedPgEmptyHint).toBeHidden();
  const loc = await multi.firstLocationValueInFirstScheduleRow();
  if (!loc) {
    test.skip(true, "No location option on schedule row for this staff/vendor");
  }
  await multi.fillFirstInlineScheduleRow({
    locationValue: loc!,
    shiftValue: "HC 5",
    workDateRange: workDateRangeForMultiSchedule(),
  });
  await multi.clickNextToReview();
  await multi.expectReviewStepVisible();
  return multi;
}

test.describe("PG/PB - Add Multi Work Schedule (/promoter/multi-work-schedule)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("TC01 - Navigate — URL, title and step-1 shell @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const multi = new CreateScheduleMultiPage(page);

    await multi.goto(baseUrl);

    await expect(page).toHaveURL(/\/promoter\/multi-work-schedule/i);
    await multi.expectStepOneShellVisible();
    await expect(multi.pageTitleH1).toHaveText(/Add Multi Work Schedule/i);

    await expect(multi.cancelWorkScheduleLink).toBeVisible();
    await expect(multi.backButton).toBeHidden();
    await expect(multi.saveButton).toBeHidden();
    await expect(multi.searchTableInput).toBeHidden();
    await expect(multi.selectedPgEmptyHint).toBeVisible();
  });

  test("TC02 - Add PG/PB disabled until vendor is chosen @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const multi = new CreateScheduleMultiPage(authenticatedPage.page);
    await multi.goto(baseUrl);
    await multi.expectStepOneShellVisible();

    await expect(multi.addPgPbButton).toBeDisabled();
  });

  test("TC03 - Next without any PG/PB shows validation (SweetAlert) @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const multi = new CreateScheduleMultiPage(page);

    await multi.goto(baseUrl);
    await multi.expectStepOneShellVisible();

    await multi.clickNext();

    await expect(
      page.getByRole("heading", { name: "Validation Error" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.locator(".swal2-html-container")).toContainText(
      /Please add at least one PG\/PB/i,
    );

    await multi.confirmSwal();
    await expect(page).toHaveURL(/\/promoter\/multi-work-schedule/i);
  });

  test("TC04 - Cancel returns to work schedule list @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const multi = new CreateScheduleMultiPage(page);

    await multi.goto(baseUrl);
    await multi.expectStepOneShellVisible();

    await multi.cancelWorkScheduleLink.click();
    await page.waitForURL(
      (u) =>
        /\/promoter\/work-schedule/i.test(u.pathname) &&
        !/multi-work-schedule/i.test(u.pathname),
      { timeout: 30000 },
    );
    await expect(page).toHaveURL(/\/promoter\/work-schedule/i);
    expect(page.url()).not.toMatch(/multi-work-schedule/i);
  });

  test("TC05 - Full flow through Review: vendor, add PG, fill row, Next @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    test.setTimeout(180_000);
    const { page } = authenticatedPage;
    await arrangeMultiScheduleOnReviewStep(page, baseUrl, vendorLabelsPgStaff.V220065);
    await expect(
      page.getByRole("heading", { name: /Review Work Schedule/i }),
    ).toBeVisible();
    await expect(page.locator("#btnSave")).toBeVisible();
  });

  test("TC06 - Save multi schedule when store is not locked @regression", async (
    { authenticatedPage, baseUrl },
    testInfo,
  ) => {
    test.setTimeout(180_000);
    const { page } = authenticatedPage;
    const multi = await arrangeMultiScheduleOnReviewStep(page, baseUrl, vendorLabelsPgStaff.V220065);

    await multi.saveAllSchedules();
    await multi.confirmCreateSchedulesSwal();

    const outcome = await page
      .locator(".swal2-html-container")
      .innerText({ timeout: 20_000 })
      .catch(() => "");

    testInfo.skip(
      /location is locked/i.test(outcome),
      `Test vendor/store locked on env — ${outcome.slice(0, 280)}`,
    );

    await expect(outcome).toMatch(/success|thành công|created|saved|đã tạo/i);
    await multi.confirmSwal().catch(() => null);
  });
});
