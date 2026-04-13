import { faker } from "@faker-js/faker";
import { fileURLToPath } from "url";
import path from "path";
import { test, expect } from "../../fixtures/index.js";
import { PgStaffPage } from "../../pages/pgpb/PgStaffPage.js";

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

const listVendor = {
  V220065: "V220065 - QC Test Vendor 2",
  V260064: "V260064 - CÔNG TY TNHH HASAKI GLOBAL TRADE",
  V190064: "V190064 - Thương Mại Song Hằng",
  V250066: "V250066 - Sông Hồng",
};

test.describe("PG Staff - Create", () => {
  test.describe.configure({ timeout: 120 * 1000 });

  test("Navigate to create PG staff page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);
  });

  test("Create new PG staff with valid data @regression", async ({
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
      note: "Create PG Auto",
      workType: "inline",
    };

    await pgStaff.selectVendor(listVendor.V190064);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType(testData.workType);
    await pgStaff.fillName(testData.name);
    await pgStaff.fillEmail(testData.email);
    await pgStaff.fillIdNumber(testData.idNumber);
    await pgStaff.fillPhone(testData.phone);
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(testData.address);
    await pgStaff.fillNote(testData.note);
    await pgStaff.uploadAvatar(avatarFilePath);
    await pgStaff.uploadIdNumberFront(avatarFilePath);
    await pgStaff.uploadIdNumberBack(avatarFilePath);

    await pgStaff.submit();

    await expect(page).toHaveURL(/.*pg-draft\/edit\/\d+/i, { timeout: 30000 });
  });

  test("Show required field validation errors when mandatory fields are empty @regression", async ({
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

  test("Reject duplicate ID number when there is a staff with the same ID number Active @regression", async ({
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
    const sharedIdNumber = faker.helpers.arrayElement([
      faker.string.numeric(9),
      faker.string.numeric(12),
    ]);

    // First create a staff with a specific ID number
    await pgStaff.selectVendor(listVendor.V260064);
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
    await pgStaff.fillNote("Create PG Auto");
    await pgStaff.uploadAvatar(avatarFilePath);
    await pgStaff.uploadIdNumberFront(avatarFilePath);
    await pgStaff.uploadIdNumberBack(avatarFilePath);
    await pgStaff.submit();
    await pgStaff.requestToActivateButtonClick();
    await pgStaff.approveInfoStaffButtonClick();

    // Create another staff with the same ID number
    await pgStaff.goto(baseUrl);
    await pgStaff.selectVendor(listVendor.V260064);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType("merchandising");
    await pgStaff.fillName(fakeName());
    await pgStaff.fillEmail(sharedEmail);
    await pgStaff.fillIdNumber(sharedIdNumber);
    await pgStaff.fillPhone(`09${faker.string.numeric(8)}`);
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(
      `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
    );
    await pgStaff.fillNote("Create PG Auto");
    await pgStaff.uploadAvatar(avatarFilePath);
    await pgStaff.uploadIdNumberFront(avatarFilePath);
    await pgStaff.uploadIdNumberBack(avatarFilePath);
    await pgStaff.submit();

    const duplicateErrors = await pgStaff.getValidationErrors();
    expect(
      duplicateErrors.some((error: string) =>
        /The ID number already existed on another staff info/i.test(error),
      ),
    ).toBeTruthy();
  });

  test("Create PG staff with inline worktype have external sync @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(listVendor.V250066);
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
    await pgStaff.fillNote("Create PG Auto");
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
    console.log("Created PG staff with Staff ID:", staffIdValue);
  });

  test("Create PG staff with non-inline worktype no external sync @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(listVendor.V250066);
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
    await pgStaff.fillNote("Create PG Auto");
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

  test("Reject invalid email format @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(listVendor.V260064);
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
    await pgStaff.fillNote("Create PG Auto");
    await pgStaff.submit();

    const errors = await pgStaff.getValidationErrors();
    expect(
      errors.some((e: string) => /email|invalid|không hợp lệ/i.test(e)),
    ).toBeTruthy();
  });

  test("Reject invalid phone format @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(listVendor.V250066);
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
    await pgStaff.fillNote("Create PG Auto");
    await pgStaff.submit();

    const errors = await pgStaff.getValidationErrors();
    expect(
      errors.some((e: string) =>
        /phone|điện thoại|invalid|không hợp lệ/i.test(e),
      ),
    ).toBeTruthy();
  });

  test("Reject invalid CMND format wrong length @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(listVendor.V250066);
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
    await pgStaff.fillNote("Create PG Auto");
    await pgStaff.submit();

    const errors = await pgStaff.getValidationErrors();
    expect(
      errors.some((e: string) =>
        /cmnd|id|cccd|căn cước|invalid|không hợp lệ|format/i.test(e),
      ),
    ).toBeTruthy();
  });

  test("Status becomes In-Active after rejecting PG staff info @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const pgStaff = new PgStaffPage(page);
    await pgStaff.goto(baseUrl);

    await pgStaff.selectVendor(listVendor.V250066);
    await pgStaff.chooseRandomBrands(3);
    await pgStaff.selectWorkType("inline");
    await pgStaff.fillName(fakeName());
    await pgStaff.fillEmail(
      faker.internet.email({ provider: "hasaki.vn" }).toLowerCase(),
    );
    await pgStaff.fillIdNumber(faker.string.numeric(12)); // too short
    await pgStaff.fillPhone(`09${faker.string.numeric(8)}`);
    await pgStaff.chooseRandomLocations(3);
    await pgStaff.fillAddress(
      `${faker.location.streetAddress()}, ${faker.location.city()}, Việt Nam`,
    );
    await pgStaff.fillNote("Create PG Auto");

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
