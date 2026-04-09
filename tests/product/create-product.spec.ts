import path from "path";
import { fileURLToPath } from "url";
import { faker } from "@faker-js/faker";
import { test, expect } from "../../fixtures/index.js";
import { ProductPage } from "../../pages/product/ProductPage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productFilePath = path.resolve(
  __dirname,
  "../resources/avatar-black.png",
);

// ─── Shared test data (vendor & brand must exist in the system) ───────────────
const listVendor = {
  V220065: "V220065 - QC Test Vendor 2",
  V260064: "GLOBAL TRADE",
};
test.describe("Product - Create new product", () => {
  test.describe.configure({ timeout: 180 * 1000 });

  test("Create product successfully (happy path) @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const product = new ProductPage(page);

    // ─── Generate unique test data ──────────────────────────────────────────
    const timestamp = Date.now();
    const name = `Auto Product ${faker.commerce.productName()} ${timestamp}`;
    const vendorProductName = `VPN-${faker.string.alphanumeric(8).toUpperCase()}-${timestamp}`;
    const barcode = faker.string.numeric(13);
    const vendorProductCode = `VPC-${faker.string.alphanumeric(8).toUpperCase()}`;
    const vendorPrice = faker.number.int({ min: 10000, max: 500000 });
    const marketPrice = Math.round(vendorPrice * 1.3);
    const hasakiPrice = Math.round(vendorPrice * 1.2);
    const length = faker.number.int({ min: 10, max: 99 });
    const width = faker.number.int({ min: 10, max: 99 });
    const height = faker.number.int({ min: 10, max: 99 });
    const weight = faker.number.int({ min: 10, max: 99 });

    // ─── Navigate ───────────────────────────────────────────────────────────
    await product.goto(baseUrl);

    // ─── Tab 1: Product Info ────────────────────────────────────────────────
    // await product.selectVendor(listVendor.V220065);
    await product.fillName(name);
    await product.fillVendorProductName(vendorProductName);
    await product.fillBarcode(barcode);
    await product.selectRandomBrand();
    await product.fillVendorProductCode(vendorProductCode);
    await product.selectProductType("NORMAL");
    await product.fillVendorPrice(vendorPrice);
    await product.fillMarketPrice(marketPrice);
    await product.fillHasakiPrice(hasakiPrice);
    await product.fillLength(length);
    await product.fillWidth(width);
    await product.fillHeight(height);
    await product.fillWeight(weight);
    await product.selectShelfLife("36 Month");
    await product.selectExpirationDateFormatting("DD/MM/YY");
    await product.selectAllowedShelfLifePO("60%");

    // Click Save & Next → expect navigate to Image tab
    await product.saveAndNextToImageTab();

    // Verify chuyển sang tab Image
    await expect(page.locator(".nav-link.active, li.active > a")).toContainText(
      /image/i,
      { timeout: 15000 },
    );

    // ─── Tab 2: Images ──────────────────────────────────────────────────────
    await product.uploadProductImages(productFilePath);
  });
});
