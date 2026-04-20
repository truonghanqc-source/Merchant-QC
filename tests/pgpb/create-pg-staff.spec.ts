import { faker } from "@faker-js/faker";
import { fileURLToPath } from "url";
import path from "path";
import { test, expect } from "../../fixtures/index.ts";
import { PgStaffPage } from "../../pages/pgpb/PgStaffPage.ts";
import { vendorLabelsPgStaff } from "../../playwright/test-data/vendors.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const avatarFilePath = path.resolve(
  __dirname,
  "../resources/pgpb/avatar-black.png",
);

// Field "name" does not accept " - " or hyphen characters
const fakeName = () =>
  `${faker.person.firstName()} ${faker.person.lastName()}`
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const fakeNote = () => `${faker.lorem.sentence()} ${String(Date.now())}`;

test.describe("PG Staff - Create", () => {
  test.describe.configure({ timeout: 120 * 1000 });

  test("TC01 - Navigate to create PG staff page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await expect(page).toHaveURL(/\/promoter\/pg-draft\/create/i);
    await pgStaff.expectCreateFormVisible();
    await expect(pgStaff.pageTitleH1).toContainText(/Add PG/i);
  });

  test("TC02 - Work type select includes inline and merchandising @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const pgStaff = new PgStaffPage(authenticatedPage.page);
    await pgStaff.goto(baseUrl);
    await pgStaff.expectCreateFormVisible();

    const values = await pgStaff.workTypeSelect
      .locator("option")
      .evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value));
    expect(values).toContain("inline");
    expect(values).toContain("merchandising");
  });

  test("TC03 - Personal email field stores input @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const pgStaff = new PgStaffPage(authenticatedPage.page);
    await pgStaff.goto(baseUrl);
    await pgStaff.expectCreateFormVisible();

    const email = `pg.auto.${Date.now()}@hasaki.vn`;
    await pgStaff.fillEmail(email);
    await expect(pgStaff.emailInput).toHaveValue(email);
  });

  test("TC04 - Create new PG staff with valid data @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    const testData = {
      name: fakeName(),
      email: faker.internet.email({ provider: "hasaki.vn" }).toLowerCase(),
      phone: `09${faker.string.numeric(8)}`,
      idNumber: faker.string.numeric(12),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
      workType: "inline",
    };

    await pgStaff.selectVendor(vendorLabelsPgStaff.V190064);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType(testData.workType);
    await pgStaff.fillName(testData.name);
    await pgStaff.fillEmail(testData.email);
    await pgStaff.fillIdNumber(testData.idNumber);
    await pgStaff.fillPhone(testData.phone);
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(testData.address);
    await pgStaff.fillNote(fakeNote());
    await pgStaff.uploadAvatar(avatarFilePath);
    await pgStaff.uploadIdNumberFront(avatarFilePath);
    await pgStaff.uploadIdNumberBack(avatarFilePath);

    await pgStaff.submit();

    await expect(page).toHaveURL(/.*pg-draft\/edit\/\d+/i, { timeout: 30000 });
  });

  test("TC05 - Show required field validation errors when mandatory fields are empty @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.submit();

    const errors = await pgStaff.getValidationErrors();
    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(
      errors.some((e: string) => /is required|bắt buộc/i.test(e)),
    ).toBeTruthy();
  });

  test("TC06 - Reject duplicate ID number when there is a staff with the same ID number Active @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    const sharedEmail = faker.internet
      .email({ provider: "hasaki.vn" })
      .toLowerCase();
    const sharedPhone = `09${faker.string.numeric(8)}`;
    //12 chữ số — khớp rule CMND/CCCD;9 số có thể không bị check trùng giống 12 số.
    const sharedIdNumber = faker.string.numeric(12);

    // First create a staff with a specific ID number
    await pgStaff.selectVendor(vendorLabelsPgStaff.V260064);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType("inline");
    await pgStaff.fillName(fakeName());
    await pgStaff.fillEmail(sharedEmail);
    await pgStaff.fillIdNumber(sharedIdNumber);
    await pgStaff.fillPhone(sharedPhone);
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(
      `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
    );
    await pgStaff.fillNote(fakeNote());
    await pgStaff.uploadAvatar(avatarFilePath);
    await pgStaff.uploadIdNumberFront(avatarFilePath);
    await pgStaff.uploadIdNumberBack(avatarFilePath);
    await pgStaff.submit();
    await expect(page).toHaveURL(/pg-draft\/edit\/\d+/i, { timeout: 60000 });
    await pgStaff.requestToActivateButtonClick();
    await pgStaff.approveInfoStaffButtonClick();

    // Create another staff with the same ID number
    await pgStaff.goto(baseUrl);
    await pgStaff.selectVendor(vendorLabelsPgStaff.V260064);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType("merchandising");
    await pgStaff.fillName(fakeName());
    // Fresh email so duplicate-ID validation is not masked by duplicate-email errors.
    await pgStaff.fillEmail(
      faker.internet.email({ provider: "hasaki.vn" }).toLowerCase(),
    );
    await pgStaff.fillIdNumber(sharedIdNumber);
    await pgStaff.fillPhone(`09${faker.string.numeric(8)}`);
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(
      `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
    );
    await pgStaff.fillNote(fakeNote());
    await pgStaff.uploadAvatar(avatarFilePath);
    await pgStaff.uploadIdNumberFront(avatarFilePath);
    await pgStaff.uploadIdNumberBack(avatarFilePath);
    await pgStaff.submit();

    const duplicateIdPattern =
      /ID number already|already existed|another staff|staff info|trùng|duplicate.*(id|CMND|CCCD)/i;
    await expect
      .poll(
        async () => {
          const errs = await pgStaff.getValidationErrors();
          return errs.some((e) => duplicateIdPattern.test(e));
        },
        { timeout: 25_000 },
      )
      .toBeTruthy();
  });

  test("TC07 - Create PG staff with inline worktype have external sync @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(vendorLabelsPgStaff.V250066);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType("inline");
    await pgStaff.fillName(fakeName());
    await pgStaff.fillEmail(
      faker.internet.email({ provider: "hasaki.vn" }).toLowerCase(),
    );
    await pgStaff.fillIdNumber(faker.string.numeric(12));
    await pgStaff.fillPhone(`09${faker.string.numeric(8)}`);
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(
      `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
    );
    await pgStaff.fillNote(fakeNote());
    await pgStaff.uploadAvatar(avatarFilePath);
    await pgStaff.uploadIdNumberFront(avatarFilePath);
    await pgStaff.uploadIdNumberBack(avatarFilePath);
    await pgStaff.submit();
    await pgStaff.requestToActivateButtonClick();
    await pgStaff.approveInfoStaffButtonClick();

    // After inline approval, external system returns a Staff ID (may take time)
    const staffIdInput = page.locator("input#staff_id");
    await expect(staffIdInput).toBeVisible({ timeout: 60000 });
    await expect(staffIdInput).not.toHaveValue("", { timeout: 60000 });
    const staffIdValue = await staffIdInput.getAttribute("value");
    expect(staffIdValue).toMatch(/^\d+$/);
  });

  test("TC08 - Create PG staff with non-inline worktype no external sync @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(vendorLabelsPgStaff.V250066);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType("Training (Training / Internship)");
    await pgStaff.fillName(fakeName());
    await pgStaff.fillEmail(
      faker.internet.email({ provider: "hasaki.vn" }).toLowerCase(),
    );
    await pgStaff.fillIdNumber(faker.string.numeric(12));
    await pgStaff.fillPhone(`09${faker.string.numeric(8)}`);
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(
      `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
    );
    await pgStaff.fillNote(fakeNote());
    await pgStaff.uploadAvatar(avatarFilePath);
    await pgStaff.uploadIdNumberFront(avatarFilePath);
    await pgStaff.uploadIdNumberBack(avatarFilePath);
    await pgStaff.submit();
    await pgStaff.requestToActivateButtonClick();
    await pgStaff.approveInfoStaffButtonClick();

    // Non-inline worktype does NOT sync to external system → staff_id must be empty
    const staffIdInput = page.locator("input#staff_id");
    await expect(staffIdInput).toBeVisible({ timeout: 30000 });
    await expect(staffIdInput).toHaveValue("", { timeout: 10000 });
  });

  test("TC09 - Reject invalid email format @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(vendorLabelsPgStaff.V260064);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType("inline");
    await pgStaff.fillName(fakeName());
    await pgStaff.fillEmail("not-an-email");
    await pgStaff.fillIdNumber(faker.string.numeric(12));
    await pgStaff.fillPhone(`09${faker.string.numeric(8)}`);
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(
      `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
    );
    await pgStaff.fillNote(fakeNote());
    await pgStaff.submit();

    const errors = await pgStaff.getValidationErrors();
    expect(
      errors.some((e: string) => /email|invalid|không hợp lệ/i.test(e)),
    ).toBeTruthy();
  });

  test("TC10 - Reject invalid phone format @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(vendorLabelsPgStaff.V250066);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType("inline");
    await pgStaff.fillName(fakeName());
    await pgStaff.fillEmail(
      faker.internet.email({ provider: "hasaki.vn" }).toLowerCase(),
    );
    await pgStaff.fillIdNumber(faker.string.numeric(12));
    await pgStaff.fillPhone("abc12345");
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(
      `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
    );
    await pgStaff.fillNote(fakeNote());
    await pgStaff.submit();

    const errors = await pgStaff.getValidationErrors();
    expect(
      errors.some((e: string) =>
        /phone|điện thoại|invalid|không hợp lệ/i.test(e),
      ),
    ).toBeTruthy();
  });

  test("TC11 - Reject invalid CMND format wrong length @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(vendorLabelsPgStaff.V250066);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType("inline");
    await pgStaff.fillName(fakeName());
    await pgStaff.fillEmail(
      faker.internet.email({ provider: "hasaki.vn" }).toLowerCase(),
    );
    await pgStaff.fillIdNumber("123"); // too short
    await pgStaff.fillPhone(`09${faker.string.numeric(8)}`);
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(
      `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
    );
    await pgStaff.fillNote(fakeNote());
    await pgStaff.submit();

    const errors = await pgStaff.getValidationErrors();
    expect(
      errors.some((e: string) =>
        /cmnd|id|cccd|căn cước|invalid|không hợp lệ|format/i.test(e),
      ),
    ).toBeTruthy();
  });

  test("TC12 - Status becomes In-Active after rejecting PG staff info @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(vendorLabelsPgStaff.V250066);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType("inline");
    await pgStaff.fillName(fakeName());
    await pgStaff.fillEmail(
      faker.internet.email({ provider: "hasaki.vn" }).toLowerCase(),
    );
    await pgStaff.fillIdNumber(faker.string.numeric(12));
    await pgStaff.fillPhone(`09${faker.string.numeric(8)}`);
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(
      `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
    );
    await pgStaff.fillNote(fakeNote());

    await pgStaff.uploadAvatar(avatarFilePath);
    await pgStaff.uploadIdNumberFront(avatarFilePath);
    await pgStaff.uploadIdNumberBack(avatarFilePath);

    await pgStaff.submit();

    await pgStaff.requestToActivateButtonClick();
    await pgStaff.rejectInfoStaffButtonClick();
    await pgStaff.inputRejectReason("Auto reject in test");

    const status = await pgStaff.getStatusWorking();
    expect(status).toBe("In-Active");
  });
});
