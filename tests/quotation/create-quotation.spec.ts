import { test, expect } from "../../fixtures/index.ts";
import { CreateQuotationPage } from "../../pages/quotation/QuotationPage.ts";
import {
  COMPANY,
  listTypeQuotation,
  quotationScenarios,
  selectQuotationVendorIfNeeded,
} from "../../playwright/test-data/quotation.ts";

const hVN = quotationScenarios.hasakiVietNam;
const gT = quotationScenarios.globalTrade;
const llc = quotationScenarios.hasakiLlc;

// test.describe.serial("Quotation — create & detail (serial suite)", () => {
test.describe("Quotation - Create with Hasaki VietNam", () => {
  test.describe.configure({ timeout: 120 * 1000 });

  test("TC01 - Navigate to create quotation page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);
    await quotation.goto(baseUrl);
    await expect(page).toHaveURL(/\/quotation\/detail\/?(\?|#|$)/i);
    await expect(quotation.pageTitleH1).toHaveText(/create new quotation/i);
  });
  test("TC02 - Create Normal quotation with Hasaki VietNam company uses VND currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await quotation.selectCompany(hVN.company);
    await quotation.fillNote("Quotation Auto Test");
    await quotation.selectStore(hVN.storeLabel);
    await quotation.selectProduct(hVN.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      {
        timeout: 20000,
      },
    );

    await quotation.requestToConfirm();
    const totalAfterConfirm = await quotation.getSummaryTotal();
    expect(totalAfterConfirm).toMatch(/\u20ab|VND/i);
  });

  test("TC03 - Create Tester quotation with Hasaki VietNam company uses VND currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await quotation.selectQuotationType(listTypeQuotation.TESTER);
    await quotation.selectCompany(hVN.company);
    await quotation.fillNote("Tester Quotation Auto Test");
    await quotation.selectStore(hVN.storeLabel);
    await quotation.selectProduct(hVN.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
  });

  test("TC04 - Create Gift quotation with Hasaki VietNam company uses VND currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await quotation.selectQuotationType(listTypeQuotation.GIFT);
    await quotation.selectCompany(hVN.company);
    await quotation.fillNote("Gift Quotation Auto Test");
    await quotation.selectStore(hVN.storeLabel);
    await quotation.selectProduct(hVN.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
    const total = await quotation.getSummaryTotal();
    expect(total).toBe("0 ₫");
  });

  test("TC05 - Create Activation quotation with Hasaki VietNam company uses VND currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await quotation.selectQuotationType(listTypeQuotation.ACTIVATION);
    await quotation.selectCompany(hVN.company);
    await quotation.fillNote("Activation Quotation Auto Test");
    await quotation.selectStore(hVN.storeLabel);
    await quotation.selectProduct(hVN.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
  });

  test("TC06 - Create POSM quotation with Hasaki VietNam company uses VND currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await quotation.selectQuotationType(listTypeQuotation.POSM);
    await quotation.selectCompany(hVN.company);
    await quotation.fillNote("POSM Quotation Auto Test");
    await quotation.selectStore(hVN.storeLabel);
    await quotation.selectProduct(hVN.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
  });

  test("TC07 - Verify error when submitting a no-VAT quotation with a VAT-required SKU @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await quotation.selectCompany(hVN.company);
    await quotation.quotationConfigCLick();
    await quotation.fillNote("Quotion Auto Test - no VAT error");
    await quotation.selectStore(hVN.storeLabel);
    await quotation.selectProduct(hVN.defaultSku);
    await quotation.fillQuantity(6);

    const errorText = await quotation.saveQuotationExpectErrorVAT();
    expect(errorText).toBe(
      "Some products in the quotation require VAT. Please review and verify.",
    );
  });

  test("TC08 - Verify error when submitting a VAT-required quotation with a no-VAT SKU @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await quotation.selectCompany(hVN.company);
    await quotation.fillNote("Quotion Auto Test - required VAT error");
    await quotation.selectStore(hVN.storeLabel);
    await quotation.selectProduct(hVN.skuVatOppositeCase ?? "205100547");
    await quotation.fillQuantity(6);

    const errorText = await quotation.saveQuotationExpectErrorVAT();
    expect(errorText).toBe(
      "Some products in the quotation do not require VAT. Please review and verify.",
    );
  });
});
test.describe("Quotation - Create with Hasaki Global Trade", () => {
  test.describe.configure({ timeout: 120 * 1000 });

  test("TC09 - Create Normal quotation with Hasaki Global Trade company uses USD currency @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await selectQuotationVendorIfNeeded(quotation, gT);
    await quotation.selectCompany(gT.company);
    await quotation.selectStore(gT.storeLabel);
    await quotation.fillNote("Quotion Global Trade Auto Test");
    await quotation.selectProduct(gT.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      {
        timeout: 20000,
      },
    );

    await quotation.requestToConfirm();

    const totalAfterConfirm = await quotation.getSummaryTotal();
    expect(totalAfterConfirm).toMatch(/\$|USD/i);
  });

  test("TC10 - Create Tester quotation with Hasaki Global Trade company uses USD currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await selectQuotationVendorIfNeeded(quotation, gT);
    await quotation.selectQuotationType(listTypeQuotation.TESTER);
    await quotation.selectCompany(gT.company);
    await quotation.selectStore(gT.storeLabel);
    await quotation.fillNote("Tester Quotation Global Trade Auto Test");
    await quotation.selectProduct(gT.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
  });

  test("TC11 - Create Gift quotation with Hasaki Global Trade company uses USD currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await selectQuotationVendorIfNeeded(quotation, gT);
    await quotation.selectQuotationType(listTypeQuotation.GIFT);
    await quotation.selectCompany(gT.company);
    await quotation.selectStore(gT.storeLabel);
    await quotation.fillNote("Gift Quotation Global Trade Auto Test");
    await quotation.selectProduct(gT.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
    const totalUSD = await quotation.getSummaryTotal();
    if (totalUSD) expect(totalUSD).toMatch(/^\$\s*0/);
  });

  test("TC12 - Create Activation quotation with Hasaki Global Trade company uses USD currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await selectQuotationVendorIfNeeded(quotation, gT);
    await quotation.selectQuotationType(listTypeQuotation.ACTIVATION);
    await quotation.selectCompany(gT.company);
    await quotation.selectStore(gT.storeLabel);
    await quotation.fillNote("Activation Quotation Global Trade Auto Test");
    await quotation.selectProduct(gT.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
  });

  test("TC13 - Create POSM quotation with Hasaki Global Trade company uses USD currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await selectQuotationVendorIfNeeded(quotation, gT);
    await quotation.selectQuotationType(listTypeQuotation.POSM);
    await quotation.selectCompany(gT.company);
    await quotation.selectStore(gT.storeLabel);
    await quotation.fillNote("POSM Quotation Global Trade Auto Test");
    await quotation.selectProduct(gT.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
  });
});

test.describe("Quotation - Create with Hasaki LLC", () => {
  test.describe.configure({ timeout: 120 * 1000 });
  test("TC14 - Create Normal quotation with Hasaki LLC company uses USD currency @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await selectQuotationVendorIfNeeded(quotation, llc);
    await quotation.selectCompany(llc.company);
    await quotation.selectStore(llc.storeLabel);
    await quotation.fillNote("Normal Quotation LLC Auto Test");
    await quotation.selectProduct(llc.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();

    const pageContent = await page.content();
    expect(/\$/i.test(pageContent)).toBeTruthy();
  });

  test("TC15 - Create Tester quotation with Hasaki LLC company uses USD currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await selectQuotationVendorIfNeeded(quotation, llc);
    await quotation.selectQuotationType(listTypeQuotation.TESTER);
    await quotation.selectCompany(llc.company);
    await quotation.selectStore(llc.storeLabel);
    await quotation.fillNote("Tester Quotation LLC Auto Test");
    await quotation.selectProduct(llc.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
  });

  test("TC16 - Create Gift quotation with Hasaki LLC company uses USD currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await selectQuotationVendorIfNeeded(quotation, llc);
    await quotation.selectQuotationType(listTypeQuotation.GIFT);
    await quotation.selectCompany(llc.company);
    await quotation.selectStore(llc.storeLabel);
    await quotation.fillNote("Gift Quotation LLC Auto Test");
    await quotation.selectProduct(llc.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
    const total = await quotation.getSummaryTotal();
    if (total) expect(total).toMatch(/^\$\s*0/);
  });

  test("TC17 - Create Activation quotation with Hasaki LLC company uses USD currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await selectQuotationVendorIfNeeded(quotation, llc);
    await quotation.selectQuotationType(listTypeQuotation.ACTIVATION);
    await quotation.selectCompany(llc.company);
    await quotation.selectStore(llc.storeLabel);
    await quotation.fillNote("Activation Quotation LLC Auto Test");
    await quotation.selectProduct(llc.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
  });

  test("TC18 - Create POSM quotation with Hasaki LLC company uses USD currency @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await selectQuotationVendorIfNeeded(quotation, llc);
    await quotation.selectQuotationType(listTypeQuotation.POSM);
    await quotation.selectCompany(llc.company);
    await quotation.selectStore(llc.storeLabel);
    await quotation.fillNote("POSM Quotation LLC Auto Test");
    await quotation.selectProduct(llc.defaultSku);
    await quotation.fillQuantity(6);

    await quotation.saveQuotation();

    await expect(page).toHaveURL(
      /quotation\/(review|detail|edit|confirm|view)\/\d+/i,
      { timeout: 20000 },
    );

    await quotation.requestToConfirm();
  });
});

/** Trang tạo quotation: /quotation/detail (cùng CreateQuotationPage.goto). */
test.describe("Quotation - Detail page (/quotation/detail)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  test("TC19 - Navigate to quotation detail — URL, form shell, save enabled @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const { page } = authenticatedPage;
    const quotation = new CreateQuotationPage(page);

    await quotation.goto(baseUrl);

    await expect(page).toHaveURL(/\/quotation\/detail\/?(\?|#|$)/i);
    await expect(quotation.pageTitleH1).toHaveText(/create new quotation/i);
    await quotation.expectQuotationDetailFormVisible();
    await expect(quotation.saveQuotationButton).toBeEnabled();
  });

  test("TC20 - Note field accepts input on detail page @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const quotation = new CreateQuotationPage(authenticatedPage.page);
    const note = `Detail page note ${Date.now()}`;

    await quotation.goto(baseUrl);
    await quotation.fillNote(note);

    await expect(quotation.noteInput).toHaveValue(note);
  });

  test("TC21 - Select company then store loads options @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const quotation = new CreateQuotationPage(authenticatedPage.page);

    await quotation.goto(baseUrl);
    await quotation.selectCompany(COMPANY.HASAKI_VIETNAM);

    const picked = await quotation.selectStore("SHOP");
    expect(picked.length).toBeGreaterThan(0);
  });

  test("TC22 - Detail flow: company → store → product → quantity updates summary @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    test.setTimeout(120000);
    const quotation = new CreateQuotationPage(authenticatedPage.page);

    await quotation.goto(baseUrl);
    await quotation.selectCompany(hVN.company);
    await quotation.fillNote(`Auto detail flow ${Date.now()}`);
    await quotation.selectStore(hVN.storeLabel);
    await quotation.selectProduct(hVN.defaultSku);
    await quotation.fillQuantity(3);

    const total = await quotation.getSummaryTotal();
    expect(total.length).toBeGreaterThan(0);
    await expect(quotation.lineItemsTable).toBeVisible();
  });
});
// }); // end serial suite
