import path from "path";
import { fileURLToPath } from "url";
import { test, expect } from "../../fixtures/index.js";
import { QuotationExcelPage } from "../../pages/quotation/QuotationExcelPage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const excelBarcodeFilePath = path.resolve(
  __dirname,
  "../resources/quotation/quotation-import-barcode-auto.xlsx",
);
const excelSkuFilePath = path.resolve(
  __dirname,
  "../resources/quotation/quotation-import-sku-auto.xlsx",
);

const listVendor = {
  V220065: "V220065 - QC Test Vendor 2",
  V260064: "GLOBAL TRADE",
};

test.describe("Quotation - Create by Excel", () => {
  test.describe.configure({ timeout: 60 * 1000 });

  test("Navigate to create quotation by excel page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotationExcel = new QuotationExcelPage(page);

    await quotationExcel.goto(baseUrl);

    await expect(page.locator(".card-header")).toContainText(
      /Create new Quotation by Excel/i,
      { timeout: 10000 },
    );
  });

  test("Upload excel file and validate happy path type barcode @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotationExcel = new QuotationExcelPage(page);

    await quotationExcel.goto(baseUrl);

    await quotationExcel.fillNote("Auto test create quotation by excel");

    // Upload file default file barcode
    await quotationExcel.uploadExcelFile(excelBarcodeFilePath);

    // Validate file
    await quotationExcel.validateFile();

    // Chờ response validate (success hoặc error message)
    await expect(
      page
        .locator(".alert, .text-success, .text-danger, #swal2-html-container")
        .first(),
    ).toBeVisible({ timeout: 15000 });

    await quotationExcel.saveQuotation();
  });

  test("Upload excel file and validate happy path type sku @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotationExcel = new QuotationExcelPage(page);

    await quotationExcel.goto(baseUrl);

    await quotationExcel.fillNote("Auto test create quotation by excel");
    await quotationExcel.selectImportType("sku");

    // Upload file default file sku
    await quotationExcel.uploadExcelFile(excelSkuFilePath);

    // Validate file
    await quotationExcel.validateFile();

    // Chờ response validate (success hoặc error message)
    await expect(
      page
        .locator(".alert, .text-success, .text-danger, #swal2-html-container")
        .first(),
    ).toBeVisible({ timeout: 15000 });

    await quotationExcel.saveQuotation();
  });
});
