/**
 * Custom Playwright fixtures
 * Thay thế hàm createAuthenticatedPage() lặp lại trong mỗi test file
 *
 * Cách dùng:
 *   import { test, expect } from "../../fixtures/index.js";
 *   test("my test", async ({ authenticatedPage }) => { ... });
 */
import { test as base, expect, type Browser } from "@playwright/test";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { CreateQuotationPage } from "../pages/quotation/QuotationPage.js";
import { PgStaffPage } from "../pages/pgpb/PgStaffPage.js";
import { ProductPage } from "../pages/product/ProductPage.js";
import { LoginPage } from "../pages/auth/LoginPage.js";
import { AddBookingPage } from "../pages/bookingservice/AddBookingPage.js";
import { AddProductPosmPage } from "../pages/bookingservice/AddProductPosmPage.js";
import { ListBookingPage } from "../pages/bookingservice/ListBookingPage.js";
import { ListProductPosmPage } from "../pages/bookingservice/ListProductPosmPage.js";
import { AddNewCoursePage } from "../pages/courses/AddNewCoursePage.js";
import { AddNewLessonPage } from "../pages/courses/AddNewLessonPage.js";
import { ListCoursePage } from "../pages/courses/ListCoursePage.js";
import { ListLessonPage } from "../pages/courses/ListLessonPage.js";
import { GenQrCodeLogsPage } from "../pages/logsadmin/GenQrCodeLogsPage.js";
import { SentApiLogsPage } from "../pages/logsadmin/SentApiLogsPage.js";
import { PgPbReportPage } from "../pages/pgpb/PgPbReportPage.js";
import { ListPgPbPage } from "../pages/pgpb/PgPbListPage.js";
import { WorkSchedulePage } from "../pages/pgpb/WorkSchedulePage.js";
import { ProductListPage } from "../pages/product/ProductListPage.js";
import { PurchaseOrderPage } from "../pages/purchase/PurchaseOrderPage.js";
import { PoDeliveryPage } from "../pages/purchase/PoDeliveryPage.js";
import { ConfirmPoImportPage } from "../pages/purchase/ConfirmPoImportPage.js";
import { ReportBrandPage } from "../pages/report/ReportBrandPage.js";
import { ReportSalesPage } from "../pages/report/ReportSalesPage.js";
import { ReportStocksPage } from "../pages/report/ReportStocksPage.js";
import { ListReturnPage } from "../pages/returnproduct/ListReturn.js";
import { GlobalPage } from "../pages/settingadmin/GlobalPage.js";
import { VendorConfirmPoPage } from "../pages/settingadmin/VendorComfirmPoPage.js";
import { ListUserPage } from "../pages/users/ListUserPage.js";
import { ListRegisterPage } from "../pages/users/ListRegisterPage.js";
import { AddNewUserPage } from "../pages/users/AddNewUserPage.js";
import { FastRegisterPage } from "../pages/users/FastRegisterPage.js";
import { ListVendorPage } from "../pages/vendors/ListVendorPage.js";

//
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.resolve(__dirname, "../playwright/.auth/admin.json");
const MERCHANT_AUTH_FILE = path.resolve(
  __dirname,
  "../playwright/.auth/merchant.json",
);

export { expect };

type AuthFixtures = {
  /** Tạo browser context mới với viewport 1920x1080, ignoreHTTPSErrors */
  authenticatedPage: {
    context: Awaited<ReturnType<Browser["newContext"]>>;
    page: Awaited<
      ReturnType<Awaited<ReturnType<Browser["newContext"]>>["newPage"]>
    >;
  };
  quotationPage: CreateQuotationPage;
  pgStaffPage: PgStaffPage;
  productPage: ProductPage;
  addBookingPage: AddBookingPage;
  addProductPosmPage: AddProductPosmPage;
  listBookingPage: ListBookingPage;
  listProductPosmPage: ListProductPosmPage;
  addNewCoursePage: AddNewCoursePage;
  addNewLessonPage: AddNewLessonPage;
  listCoursePage: ListCoursePage;
  listLessonPage: ListLessonPage;
  genQrCodeLogsPage: GenQrCodeLogsPage;
  sentApiLogsPage: SentApiLogsPage;
  pgPbReportPage: PgPbReportPage;
  listPgPbPage: ListPgPbPage;
  workSchedulePage: WorkSchedulePage;
  productListPage: ProductListPage;
  purchaseOrderPage: PurchaseOrderPage;
  poDeliveryPage: PoDeliveryPage;
  confirmPoImportPage: ConfirmPoImportPage;
  reportBrandPage: ReportBrandPage;
  reportSalesPage: ReportSalesPage;
  reportStocksPage: ReportStocksPage;
  listReturnPage: ListReturnPage;
  vendorConfirmPoPage: VendorConfirmPoPage;
  globalPage: GlobalPage;
  listUserPage: ListUserPage;
  listRegisterPage: ListRegisterPage;
  addNewUserPage: AddNewUserPage;
  fastRegisterPage: FastRegisterPage;
  listVendorPage: ListVendorPage;

  /** Tạo browser context mới với session của userMerchant (cookie HASAKI_MERCHANT_SID) */

  /** Context dùng session của userMerchant (LOGIN_USER_MERCHANT) */
  authenticatedMerchantPage: {
    context: Awaited<ReturnType<Browser["newContext"]>>;
    page: Awaited<
      ReturnType<Awaited<ReturnType<Browser["newContext"]>>["newPage"]>
    >;
  };
  baseUrl: string;
};

export const test = base.extend<AuthFixtures>({
  baseUrl: async ({}, use) => {
    const url = process.env.BASE_URL?.trim();
    if (!url) throw new Error("Missing env var: BASE_URL");
    await use(url);
  },

  authenticatedPage: async ({ browser }, use) => {
    // Nếu admin.json chưa tồn tại → tự login
    if (!fs.existsSync(AUTH_FILE)) {
      const baseUrl = process.env.BASE_URL?.trim();
      const username = process.env.LOGIN_USER_ADMIN?.trim();
      const password = process.env.LOGIN_PASS_ADMIN?.trim();
      if (!baseUrl || !username || !password) {
        throw new Error(
          "Missing env vars: BASE_URL, LOGIN_USER_ADMIN, LOGIN_PASS_ADMIN",
        );
      }
      fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
      const setupBrowser = await browser.browserType().launch();
      const setupContext = await setupBrowser.newContext({
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
      });
      const setupPage = await setupContext.newPage();
      const login = new LoginPage(setupPage);
      await login.goto(baseUrl);
      await login.login(username, password);
      await setupContext.storageState({ path: AUTH_FILE });
      await setupBrowser.close();
      console.log("✓ [Admin] Fallback login successful — session saved");
    }

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      storageState: AUTH_FILE,
    });
    const page = await context.newPage();
    await use({ context, page });
    await context.close();
  },

  //--------------------------------------------------------------------------------//

  // Vendors Index Page
  listVendorPage: async ({ authenticatedPage, baseUrl }, use) => {
    const listVendor = new ListVendorPage(authenticatedPage.page);
    await listVendor.goto(baseUrl);
    await use(listVendor);
  },

  // Users Index Page
  listUserPage: async ({ authenticatedPage, baseUrl }, use) => {
    const listUser = new ListUserPage(authenticatedPage.page);
    await listUser.goto(baseUrl);
    await use(listUser);
  },

  listRegisterPage: async ({ authenticatedPage, baseUrl }, use) => {
    const listRegister = new ListRegisterPage(authenticatedPage.page);
    await listRegister.goto(baseUrl);
    await use(listRegister);
  },

  addNewUserPage: async ({ authenticatedPage, baseUrl }, use) => {
    const addNewUser = new AddNewUserPage(authenticatedPage.page);
    await addNewUser.goto(baseUrl);
    await use(addNewUser);
  },

  fastRegisterPage: async ({ authenticatedPage, baseUrl }, use) => {
    const fastRegister = new FastRegisterPage(authenticatedPage.page);
    await fastRegister.goto(baseUrl);
    await use(fastRegister);
  },

  // Setting Admin Index Page
  vendorConfirmPoPage: async ({ authenticatedPage, baseUrl }, use) => {
    const vendorConfirmPo = new VendorConfirmPoPage(authenticatedPage.page);
    await vendorConfirmPo.goto(baseUrl);
    await use(vendorConfirmPo);
  },

  globalPage: async ({ authenticatedPage, baseUrl }, use) => {
    const globalPage = new GlobalPage(authenticatedPage.page);
    await globalPage.goto(baseUrl);
    await use(globalPage);
  },

  //Return Product Index Page
  listReturnPage: async ({ authenticatedPage, baseUrl }, use) => {
    const listReturn = new ListReturnPage(authenticatedPage.page);
    await listReturn.goto(baseUrl);
    await use(listReturn);
  },

  // Report Index Page
  reportBrandPage: async ({ authenticatedPage, baseUrl }, use) => {
    const reportBrand = new ReportBrandPage(authenticatedPage.page);
    await reportBrand.goto(baseUrl);
    await use(reportBrand);
  },

  reportSalesPage: async ({ authenticatedPage, baseUrl }, use) => {
    const reportSales = new ReportSalesPage(authenticatedPage.page);
    await reportSales.goto(baseUrl);
    await use(reportSales);
  },

  reportStocksPage: async ({ authenticatedPage, baseUrl }, use) => {
    const reportStocks = new ReportStocksPage(authenticatedPage.page);
    await reportStocks.goto(baseUrl);
    await use(reportStocks);
  },

  // Purchase Order Index Page
  purchaseOrderPage: async ({ authenticatedPage, baseUrl }, use) => {
    const purchaseOrder = new PurchaseOrderPage(authenticatedPage.page);
    await purchaseOrder.goto(baseUrl);
    await use(purchaseOrder);
  },

  poDeliveryPage: async ({ authenticatedPage, baseUrl }, use) => {
    const poDelivery = new PoDeliveryPage(authenticatedPage.page);
    await poDelivery.goto(baseUrl);
    await use(poDelivery);
  },

  confirmPoImportPage: async ({ authenticatedPage, baseUrl }, use) => {
    const confirmPoImport = new ConfirmPoImportPage(authenticatedPage.page);
    await confirmPoImport.goto(baseUrl);
    await use(confirmPoImport);
  },

  // Logs Admin Index Page
  sentApiLogsPage: async ({ authenticatedPage, baseUrl }, use) => {
    const sentApiLogs = new SentApiLogsPage(authenticatedPage.page);
    await sentApiLogs.goto(baseUrl);
    await use(sentApiLogs);
  },

  genQrCodeLogsPage: async ({ authenticatedPage, baseUrl }, use) => {
    const genQrCodeLogs = new GenQrCodeLogsPage(authenticatedPage.page);
    await genQrCodeLogs.goto(baseUrl);
    await use(genQrCodeLogs);
  },

  // Course Index Page
  listLessonPage: async ({ authenticatedPage, baseUrl }, use) => {
    const listLesson = new ListLessonPage(authenticatedPage.page);
    await listLesson.goto(baseUrl);
    await use(listLesson);
  },

  listCoursePage: async ({ authenticatedPage, baseUrl }, use) => {
    const listCourse = new ListCoursePage(authenticatedPage.page);
    await listCourse.goto(baseUrl);
    await use(listCourse);
  },

  addNewLessonPage: async ({ authenticatedPage, baseUrl }, use) => {
    const addNewLesson = new AddNewLessonPage(authenticatedPage.page);
    await addNewLesson.goto(baseUrl);
    await use(addNewLesson);
  },

  addNewCoursePage: async ({ authenticatedPage, baseUrl }, use) => {
    const addNewCourse = new AddNewCoursePage(authenticatedPage.page);
    await addNewCourse.goto(baseUrl);
    await use(addNewCourse);
  },

  // Booking Services - Product Posm Index Page
  listProductPosmPage: async ({ authenticatedPage, baseUrl }, use) => {
    const listProductPosm = new ListProductPosmPage(authenticatedPage.page);
    await listProductPosm.goto(baseUrl);
    await use(listProductPosm);
  },

  listBookingPage: async ({ authenticatedPage, baseUrl }, use) => {
    const listBooking = new ListBookingPage(authenticatedPage.page);
    await listBooking.goto(baseUrl);
    await use(listBooking);
  },

  addProductPosmPage: async ({ authenticatedPage, baseUrl }, use) => {
    const addProductPosm = new AddProductPosmPage(authenticatedPage.page);
    await addProductPosm.goto(baseUrl);
    await use(addProductPosm);
  },

  addBookingPage: async ({ authenticatedPage, baseUrl }, use) => {
    const addBooking = new AddBookingPage(authenticatedPage.page);
    await addBooking.goto(baseUrl);
    await use(addBooking);
  },

  // Quotation Index Page
  quotationPage: async ({ authenticatedPage, baseUrl }, use) => {
    const quotation = new CreateQuotationPage(authenticatedPage.page);
    await quotation.goto(baseUrl);
    await use(quotation);
  },

  // PgPb Index Page
  pgStaffPage: async ({ authenticatedPage, baseUrl }, use) => {
    const pgStaff = new PgStaffPage(authenticatedPage.page);
    await pgStaff.goto(baseUrl);
    await use(pgStaff);
  },

  pgPbReportPage: async ({ authenticatedPage, baseUrl }, use) => {
    const pgPbReport = new PgPbReportPage(authenticatedPage.page);
    await pgPbReport.goto(baseUrl);
    await use(pgPbReport);
  },

  listPgPbPage: async ({ authenticatedPage, baseUrl }, use) => {
    const listPgPb = new ListPgPbPage(authenticatedPage.page);
    await listPgPb.goto(baseUrl);
    await use(listPgPb);
  },

  workSchedulePage: async ({ authenticatedPage, baseUrl }, use) => {
    const workSchedule = new WorkSchedulePage(authenticatedPage.page);
    await workSchedule.goto(baseUrl);
    await use(workSchedule);
  },

  //Product Index Page
  productPage: async ({ authenticatedPage, baseUrl }, use) => {
    const product = new ProductPage(authenticatedPage.page);
    await product.goto(baseUrl);
    await use(product);
  },

  productListPage: async ({ authenticatedPage, baseUrl }, use) => {
    const productList = new ProductListPage(authenticatedPage.page);
    await productList.goto(baseUrl);
    await use(productList);
  },

  authenticatedMerchantPage: async ({ browser }, use) => {
    // Nếu merchant.json chưa tồn tại (global-setup chưa tạo) → tự login
    if (!fs.existsSync(MERCHANT_AUTH_FILE)) {
      const baseUrl = process.env.BASE_URL?.trim();
      const username = process.env.LOGIN_USER_MERCHANT?.trim();
      const password = process.env.LOGIN_PASS_MERCHANT?.trim();
      if (!baseUrl || !username || !password) {
        throw new Error(
          "Missing env vars: BASE_URL, LOGIN_USER_MERCHANT, LOGIN_PASS_MERCHANT",
        );
      }
      fs.mkdirSync(path.dirname(MERCHANT_AUTH_FILE), { recursive: true });
      const setupBrowser = await browser.browserType().launch();
      const setupContext = await setupBrowser.newContext({
        viewport: { width: 1920, height: 1080 },
        ignoreHTTPSErrors: true,
      });
      const setupPage = await setupContext.newPage();
      const login = new LoginPage(setupPage);
      await login.goto(baseUrl);
      await login.login(username, password);
      await setupContext.storageState({ path: MERCHANT_AUTH_FILE });
      await setupBrowser.close();
      console.log("✓ [Merchant] Fallback login successful — session saved");
    }

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      storageState: MERCHANT_AUTH_FILE,
    });
    const page = await context.newPage();
    await use({ context, page });
    await context.close();
  },
});
