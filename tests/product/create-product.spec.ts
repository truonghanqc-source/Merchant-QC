import path from "path";
import { fileURLToPath } from "url";
import { faker } from "@faker-js/faker";
import { test, expect } from "../../fixtures/index.ts";
import { ProductPage } from "../../pages/product/ProductPage.ts";
import { productFormDropdownValues } from "../../playwright/test-data/product.ts";
import type { Page } from "@playwright/test";
import { vendorLabelsProduct } from "../../playwright/test-data/vendors.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productFilePath = path.resolve(
  __dirname,
  "../resources/product/avatar-black.png",
);
const pdfFilePath = path.resolve(__dirname, "../resources/product/sample.pdf");

// ─── Helper: điền đầy đủ thông tin và request approval ───────────────────────
async function createAndRequestApproval(
  product: ProductPage,
  page: Page,
  baseUrl: string,
) {
  const timestamp = Date.now();
  const name = `Auto Product ${faker.commerce.productName()} ${timestamp}`;
  const vendorProductName = `VPN-${faker.string.alphanumeric(8).toUpperCase()}`;
  const barcode = faker.string.numeric(13);
  const vendorProductCode = `VPC-${faker.string.alphanumeric(8).toUpperCase()}`;
  const vendorPrice = faker.number.int({ min: 1000, max: 5000 });
  const marketPrice = Math.round(vendorPrice * 1.3);
  const hasakiPrice = Math.round(vendorPrice * 1.2);
  const declarationCode = `DC-${faker.string.alphanumeric(8).toUpperCase()}`;

  await product.goto(baseUrl);

  // Tab 1: Product Info
  await product.fillName(name);
  await product.fillVendorProductName(vendorProductName);
  await product.fillBarcode(barcode);
  await product.selectRandomBrand();
  await product.fillVendorProductCode(vendorProductCode);
  await product.fillVendorPrice(vendorPrice);
  await product.fillMarketPrice(marketPrice);
  await product.fillHasakiPrice(hasakiPrice);
  await product.fillLength(faker.number.int({ min: 10, max: 30 }));
  await product.fillWidth(faker.number.int({ min: 10, max: 30 }));
  await product.fillHeight(faker.number.int({ min: 10, max: 30 }));
  await product.fillWeight(faker.number.int({ min: 10, max: 30 }));
  await product.selectShelfLife(productFormDropdownValues.shelfLife36Months);
  await product.selectExpirationDateFormatting(
    productFormDropdownValues.expirationDateFormatDDMMYY,
  );
  await product.selectAllowedShelfLifePO(
    productFormDropdownValues.allowedShelfLifePo60Percent,
  );
  await product.saveAndNextToImageTab();

  // Tab 2: Images
  await product.uploadMultipleProductImages([productFilePath, productFilePath]);
  await product.saveAndNextToDocumentTab();

  // Tab 3: Documents
  await product.declarationDateInputFill();
  await product.expirationDateInputFill();
  await product.declarationCodeInputFill(declarationCode);
  await product.uploadDocument(pdfFilePath);
  await product.saveAndNextToLinkTab();

  // Tab 4: Link Reference → Request to approve
  await expect(page).toHaveURL(/tab=link_ref/, { timeout: 15000 });
  await product.clickRequestToApprove();

  await product.expectWaitingApproveBadge();
}

// ─── Tests ────────────────────────────────────────────────────────────────────
test.describe("Product - Create new product", () => {
  test.describe.configure({ timeout: 180 * 1000 });

  test("TC01 - Navigate to create product page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const product = new ProductPage(page);
    await product.goto(baseUrl);
    await product.expectAddProductFormReady();
  });

  test("TC02 - Create product successfully happy path @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const product = new ProductPage(page);
    await createAndRequestApproval(product, page, baseUrl);
  });

  test("TC03 - Approve product @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const product = new ProductPage(page);

    // Tạo product và request approval trước
    await createAndRequestApproval(product, page, baseUrl);

    // Admin approve
    await product.clickApproveButton();

    await product.expectApprovedBadge();
  });

  test("TC04 - Disapprove product with reason @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const product = new ProductPage(page);

    // Tạo product và request approval trước
    await createAndRequestApproval(product, page, baseUrl);

    // Admin disapprove với lý do
    await product.disApproveButtonClick();
    const reason = `Auto reject reason ${faker.lorem.sentence()}`;
    await product.inputDisApproveReason(reason);

    await product.expectRejectedBadge();
  });

  test("TC05 - Validate required fields on Product Info tab @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const product = new ProductPage(page);

    await product.goto(baseUrl);

    // Click Save & Next mà không điền gì → phải ở lại tab Product Info
    await product.saveAndNextToImageTab();

    // URL không được chuyển sang tab images
    await expect(page).not.toHaveURL(/tab=images/, { timeout: 5000 });

    await product.expectFirstValidationVisible();
  });

  test("TC06 - Create product with product type gift @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const product = new ProductPage(page);

    await product.goto(baseUrl);
    const timestamp = Date.now();
    await product.fillName(
      `Auto Gift Product ${faker.commerce.productName()} ${timestamp}`,
    );
    await product.fillVendorProductName(
      `Gift-${faker.string.alphanumeric(8).toUpperCase()}`,
    );
    await product.fillBarcode(faker.string.numeric(13));
    await product.selectRandomBrand();
    await product.fillVendorProductCode(
      `VPC-${faker.string.alphanumeric(8).toUpperCase()}`,
    );
    await product.selectProductType(productFormDropdownValues.productTypeGift);
    await product.fillVendorPrice(faker.number.int({ min: 1000, max: 5000 }));
    await product.fillMarketPrice(
      Math.round(faker.number.int({ min: 1000, max: 5000 })),
    );
    await product.fillLength(faker.number.int({ min: 10, max: 30 }));
    await product.fillWidth(faker.number.int({ min: 10, max: 30 }));
    await product.fillHeight(faker.number.int({ min: 10, max: 30 }));
    await product.fillWeight(faker.number.int({ min: 10, max: 30 }));
    await product.selectShelfLife(productFormDropdownValues.shelfLife36Months);
    await product.selectExpirationDateFormatting(
      productFormDropdownValues.expirationDateFormatDDMMYY,
    );
    await product.selectAllowedShelfLifePO(
      productFormDropdownValues.allowedShelfLifePo60Percent,
    );
    await product.saveAndNextToImageTab();
    await product.uploadMultipleProductImages([
      productFilePath,
      productFilePath,
    ]);
    await product.saveAndNextToDocumentTab();
    await product.declarationDateInputFill();
    await product.expirationDateInputFill();
    await product.declarationCodeInputFill(
      `DC-${faker.string.alphanumeric(8).toUpperCase()}`,
    );
    await product.uploadDocument(pdfFilePath);
    await product.saveAndNextToLinkTab();
    await product.clickRequestToApprove();
    await product.expectWaitingApproveBadge();
    await product.clickApproveButton();
    await product.expectApprovedBadge();
  });

  test("TC07 - Create product with product type Normal Global Trade @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const product = new ProductPage(page);

    await product.goto(baseUrl);
    const timestamp = Date.now();
    await product.selectVendor(vendorLabelsProduct.GLOBAL_TRADE);
    await product.fillName(
      `Auto Normal Product ${faker.commerce.productName()} ${timestamp}`,
    );
    await product.fillVendorProductName(
      `Normal-${faker.string.alphanumeric(8).toUpperCase()}`,
    );
    await product.fillBarcode(faker.string.numeric(13));
    await product.selectRandomBrand();
    await product.fillVendorProductCode(
      `VPC-${faker.string.alphanumeric(8).toUpperCase()}`,
    );
    await product.fillVendorPrice(faker.number.int({ min: 1000, max: 5000 }));
    await product.fillMarketPrice(
      Math.round(faker.number.int({ min: 1000, max: 5000 })),
    );
    await product.fillLength(faker.number.int({ min: 10, max: 30 }));
    await product.fillWidth(faker.number.int({ min: 10, max: 30 }));
    await product.fillHeight(faker.number.int({ min: 10, max: 30 }));
    await product.fillWeight(faker.number.int({ min: 10, max: 30 }));
    await product.selectShelfLife(productFormDropdownValues.shelfLife36Months);
    await product.selectExpirationDateFormatting(
      productFormDropdownValues.expirationDateFormatDDMMYY,
    );
    await product.selectAllowedShelfLifePO(
      productFormDropdownValues.allowedShelfLifePo60Percent,
    );
    await product.saveAndNextToImageTab();
    await product.uploadMultipleProductImages([
      productFilePath,
      productFilePath,
    ]);
    await product.saveAndNextToDocumentTab();
    await product.declarationDateInputFill();
    await product.expirationDateInputFill();
    await product.declarationCodeInputFill(
      `DC-${faker.string.alphanumeric(8).toUpperCase()}`,
    );
    await product.uploadDocument(pdfFilePath);
    await product.saveAndNextToLinkTab();
    await product.clickRequestToApprove();
    await product.expectWaitingApproveBadge();
    await product.clickApproveButton();
    await product.expectApprovedBadge();
  });
});
