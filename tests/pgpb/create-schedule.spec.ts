import { CreateSchedulePage } from "../../pages/pgpb/CreateSchedulePage.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("PG/PB - Create Work Schedule (/promoter/work-schedule/create)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("TC01 - Navigate — URL, title and main form shell @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const create = new CreateSchedulePage(page);

    await create.goto(baseUrl);

    await expect(page).toHaveURL(/\/promoter\/work-schedule\/create/i);
    await create.expectCreateFormVisible();
    await expect(create.pageTitleH1).toHaveText(/Work Schedule/i);

    await expect(create.vendorSelect).toBeAttached();
    await expect(create.workTypeCheckbox).toBeAttached();
    await expect(create.staffSelect).toBeAttached();
    await expect(create.locationSelect).toBeAttached();
    await expect(create.workDateHidden).toBeAttached();
    await expect(create.workDateInput).toBeVisible();
    await expect(create.shiftSelect).toBeAttached();
    await expect(create.ptInInput).toBeVisible();
    await expect(create.ptOutInput).toBeVisible();
    await expect(create.noteTextarea).toBeAttached();
    await expect(create.saveButton).toBeVisible();
  });

  test("TC02 - Work type checkbox toggles checked state @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const create = new CreateSchedulePage(authenticatedPage.page);
    await create.goto(baseUrl);
    await create.expectCreateFormVisible();

    const initial = await create.workTypeCheckbox.isChecked();
    if (initial) {
      await create.workTypeCheckbox.uncheck();
      await expect(create.workTypeCheckbox).not.toBeChecked();
      await create.workTypeCheckbox.check();
      await expect(create.workTypeCheckbox).toBeChecked();
    } else {
      await create.workTypeCheckbox.check();
      await expect(create.workTypeCheckbox).toBeChecked();
      await create.workTypeCheckbox.uncheck();
      await expect(create.workTypeCheckbox).not.toBeChecked();
    }
  });

  test("TC03 - Save without required fields shows validation feedback @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const create = new CreateSchedulePage(page);

    await create.goto(baseUrl);
    await create.expectCreateFormVisible();

    await create.submit();

    await expect(page).toHaveURL(/\/promoter\/work-schedule\/create/i);

    const errors = await create.getValidationErrors();
    expect(errors.length).toBeGreaterThanOrEqual(1);
    const joined = errors.join(" ");
    expect(joined).toMatch(/required|empty|Please check your input/i);
  });
});
