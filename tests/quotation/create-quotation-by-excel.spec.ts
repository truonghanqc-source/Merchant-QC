import path from "path";
import { fileURLToPath } from "url";
import { test, expect } from "../../fixtures/index.ts";
import { QuotationExcelPage } from "../../pages/quotation/QuotationExcelPage.ts";
import { QuotationReviewPage } from "../../pages/quotation/QuotationReviewPage.ts";

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
  test.describe.configure({ timeout: 90 * 1000 });

  test("Navigate to create quotation by excel page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotationExcel = new QuotationExcelPage(page);

    await quotationExcel.goto(baseUrl);

    await expect(quotationExcel.pageTitle).toBeVisible();
    await quotationExcel.expectEssentialFormVisible();
  });

  test("Note field stores user input @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotationExcel = new QuotationExcelPage(page);
    const note = "Auto test — note persistence";

    await quotationExcel.goto(baseUrl);
    await quotationExcel.fillNote(note);

    await expect(quotationExcel.noteInput).toHaveValue(note);
  });

  test("Require VAT checkbox can be toggled @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const quotationExcel = new QuotationExcelPage(authenticatedPage.page);

    await quotationExcel.goto(baseUrl);

    const before = await quotationExcel.requireVatCheckbox.isChecked();
    await quotationExcel.setRequireVat(!before);
    await expect(quotationExcel.requireVatCheckbox).toBeChecked({
      checked: !before,
    });
    await quotationExcel.setRequireVat(before);
    await expect(quotationExcel.requireVatCheckbox).toBeChecked({
      checked: before,
    });
  });

  test("Switch import type between sku and barcode @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const quotationExcel = new QuotationExcelPage(authenticatedPage.page);

    await quotationExcel.goto(baseUrl);
    await quotationExcel.selectImportType("sku");
    await quotationExcel.selectImportType("barcode");
    await quotationExcel.selectImportType("sku");
  });

  test("Download quotation Excel template @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const quotationExcel = new QuotationExcelPage(authenticatedPage.page);

    await quotationExcel.goto(baseUrl);
    const download = await quotationExcel.downloadQuotationTemplate();
    const name = download.suggestedFilename().toLowerCase();

    expect(name.length).toBeGreaterThan(0);
    expect(name.endsWith(".xlsx") || name.endsWith(".xls")).toBeTruthy();
  });

  test("Validate without Excel file shows feedback @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotationExcel = new QuotationExcelPage(page);

    await quotationExcel.goto(baseUrl);
    await quotationExcel.fillNote("Validate empty file");
    const alertMessage = await quotationExcel.clickValidateExpectBrowserAlert();

    expect(alertMessage).toMatch(/please select file to upload/i);
  });

  test("Cancel navigates away from import page @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotationExcel = new QuotationExcelPage(page);

    await quotationExcel.goto(baseUrl);
    await quotationExcel.clickCancel();

    await expect(page).not.toHaveURL(/\/quotation\//);
  });

  test("Select vendor then upload and validate barcode file @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotationExcel = new QuotationExcelPage(page);

    await quotationExcel.goto(baseUrl);
    await quotationExcel.fillNote("Auto test — vendor + barcode excel");
    await quotationExcel.uploadExcelFile(excelBarcodeFilePath);
    await quotationExcel.validateFile();

    await expect(quotationExcel.validationFeedback.first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("Upload excel file and validate happy path type barcode @regression", async ({
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
    await expect(quotationExcel.validationFeedback.first()).toBeVisible({
      timeout: 15000,
    });

    await quotationExcel.saveQuotation();
  });

  test("Upload excel file and validate happy path type sku @regression", async ({
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
    await expect(quotationExcel.validationFeedback.first()).toBeVisible({
      timeout: 15000,
    });

    await quotationExcel.saveQuotation();
  });

  test("Full flow: Excel barcode → Quotation Review → request to confirm @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    test.setTimeout(120000);
    const { page } = authenticatedPage;
    const quotationExcel = new QuotationExcelPage(page);
    const note = `Auto full flow barcode ${Date.now()}`;

    await quotationExcel.goto(baseUrl);
    await quotationExcel.fillNote(note);
    await quotationExcel.uploadExcelFile(excelBarcodeFilePath);
    await quotationExcel.validateFile();
    await expect(quotationExcel.validationFeedback.first()).toBeVisible({
      timeout: 15000,
    });
    await quotationExcel.saveQuotation();

    const review = new QuotationReviewPage(page);
    await review.waitForReviewUrl();
    await expect(page).toHaveURL(
      /\/quotation\/(review|detail|edit|confirm|view)\/\d+/i,
    );
    const pathSegs = new URL(page.url()).pathname.split("/").filter(Boolean);
    expect(pathSegs[pathSegs.length - 1]).toMatch(/^\d+$/);

    await review.expectHeadingVisible();
    await expect
      .poll(
        async () =>
          (await review.getNote()) === note ||
          (await review.pageContainsNote(note)),
        {
          timeout: 30000,
          message: "Ghi chú phải khớp trong field hoặc hiển thị trên trang review",
        },
      )
      .toBe(true);

    expect(await review.lineItemCount()).toBeGreaterThanOrEqual(1);

    const summaryTotal = await review.getSummaryTotal();
    expect(summaryTotal.length).toBeGreaterThan(0);

    await review.requestToConfirm();
    await expect(review.waitingConfirmBadge).toBeVisible({ timeout: 35000 });

    const body = await page.content();
    expect(/₫|vnd|\$/i.test(body)).toBeTruthy();
  });

  test("Full flow: Excel sku → Quotation Review → request to confirm @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    test.setTimeout(120000);
    const { page } = authenticatedPage;
    const quotationExcel = new QuotationExcelPage(page);
    const note = `Auto full flow sku ${Date.now()}`;

    await quotationExcel.goto(baseUrl);
    await quotationExcel.fillNote(note);
    await quotationExcel.selectImportType("sku");
    await quotationExcel.uploadExcelFile(excelSkuFilePath);
    await quotationExcel.validateFile();
    await expect(quotationExcel.validationFeedback.first()).toBeVisible({
      timeout: 15000,
    });
    await quotationExcel.saveQuotation();

    const review = new QuotationReviewPage(page);
    await review.waitForReviewUrl();
    await expect(page).toHaveURL(
      /\/quotation\/(review|detail|edit|confirm|view)\/\d+/i,
    );
    const skuPathSegs = new URL(page.url()).pathname.split("/").filter(Boolean);
    expect(skuPathSegs[skuPathSegs.length - 1]).toMatch(/^\d+$/);

    await review.expectHeadingVisible();
    await expect
      .poll(
        async () =>
          (await review.getNote()) === note ||
          (await review.pageContainsNote(note)),
        {
          timeout: 30000,
          message: "Ghi chú phải khớp trong field hoặc hiển thị trên trang review",
        },
      )
      .toBe(true);

    expect(await review.lineItemCount()).toBeGreaterThanOrEqual(1);

    const summaryTotal = await review.getSummaryTotal();
    expect(summaryTotal.length).toBeGreaterThan(0);

    await review.requestToConfirm();
    await expect(review.waitingConfirmBadge).toBeVisible({ timeout: 35000 });

    const body = await page.content();
    expect(/₫|vnd|\$/i.test(body)).toBeTruthy();
  });
});
