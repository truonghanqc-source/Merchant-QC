/**
 * Custom Playwright fixtures
 *
 * Cách dùng:
 *   import { test, expect, type AuthProfileId } from "../../fixtures/index.ts";
 *
 * Default profile is admin (backward compatible).
 * Per test or describe:
 *   test.use({ authProfile: "merchant" });
 *   test("...", async ({ authenticatedPage }) => { ... });
 *
 * Page fixtures (listVendorPage, …) use the same authenticatedPage → follow authProfile.
 * authenticatedMerchantPage: always merchant session (ignores authProfile).
 */
import {
  test as base,
  expect,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import path from "path";
import fs from "fs";
import { CreateQuotationPage } from "../pages/quotation/QuotationPage.ts";
import { PgStaffPage } from "../pages/pgpb/PgStaffPage.ts";
import { ProductPage } from "../pages/product/ProductPage.ts";
import { LoginPage } from "../pages/auth/LoginPage.ts";
import { AddBookingPage } from "../pages/bookingservice/AddBookingPage.ts";
import { AddProductPosmPage } from "../pages/bookingservice/AddProductPosmPage.ts";
import { ListBookingPage } from "../pages/bookingservice/ListBookingPage.ts";
import { ListProductPosmPage } from "../pages/bookingservice/ListProductPosmPage.ts";
import { AddNewCoursePage } from "../pages/courses/AddNewCoursePage.ts";
import { AddNewLessonPage } from "../pages/courses/AddNewLessonPage.ts";
import { ListCoursePage } from "../pages/courses/ListCoursePage.ts";
import { ListLessonPage } from "../pages/courses/ListLessonPage.ts";
import { GenQrCodeLogsPage } from "../pages/logsadmin/GenQrCodeLogsPage.ts";
import { SentApiLogsPage } from "../pages/logsadmin/SentApiLogsPage.ts";
import { PgPbReportPage } from "../pages/pgpb/PgPbReportPage.ts";
import { ListPgPbPage } from "../pages/pgpb/PgPbListPage.ts";
import { WorkSchedulePage } from "../pages/pgpb/WorkSchedulePage.ts";
import { ProductListPage } from "../pages/product/ProductListPage.ts";
import { PurchaseOrderPage } from "../pages/purchase/PurchaseOrderPage.ts";
import { PoDeliveryPage } from "../pages/purchase/PoDeliveryPage.ts";
import { ConfirmPoImportPage } from "../pages/purchase/ConfirmPoImportPage.ts";
import { ReportBrandPage } from "../pages/report/ReportBrandPage.ts";
import { ReportSalesPage } from "../pages/report/ReportSalesPage.ts";
import { ReportStocksPage } from "../pages/report/ReportStocksPage.ts";
import { ListReturnPage } from "../pages/returnproduct/ListReturn.ts";
import { GlobalPage } from "../pages/settingadmin/GlobalPage.ts";
import { VendorConfirmPoPage } from "../pages/settingadmin/VendorComfirmPoPage.ts";
import { ListUserPage } from "../pages/users/ListUserPage.ts";
import { ListRegisterPage } from "../pages/users/ListRegisterPage.ts";
import { AddNewUserPage } from "../pages/users/AddNewUserPage.ts";
import { FastRegisterPage } from "../pages/users/FastRegisterPage.ts";
import { ListVendorPage } from "../pages/vendors/ListVendorPage.ts";
import {
  AUTH_PROFILES,
  type AuthProfileId,
  authStoragePath,
  getProfileCredentials,
  missingCredentialsErrorMessage,
} from "../playwright/auth-profiles.ts";

export type { AuthProfileId };
export {
  AUTH_PROFILE_IDS,
  AUTH_PROFILES,
  authStoragePath,
  getProfileCredentials,
} from "../playwright/auth-profiles.ts";

const DEFAULT_CONTEXT_OPTIONS = {
  viewport: { width: 1920, height: 1080 },
  ignoreHTTPSErrors: true,
} as const;

type AuthenticatedSession = {
  context: BrowserContext;
  page: Page;
};

type PageWithGoto = {
  goto(baseUrl: string): Promise<unknown>;
};

function navigatedPageFixture<T extends new (page: Page) => PageWithGoto>(
  PageClass: T,
) {
  return async (
    {
      authenticatedPage,
      baseUrl,
    }: {
      authenticatedPage: AuthenticatedSession;
      baseUrl: string;
    },
    use: (page: InstanceType<T>) => Promise<void>,
  ) => {
    const instance = new PageClass(authenticatedPage.page) as InstanceType<T>;
    await instance.goto(baseUrl);
    await use(instance);
  };
}

async function ensureAuthStorageFromLogin(
  browser: Browser,
  options: {
    authFile: string;
    baseUrl: string | undefined;
    username: string | undefined;
    password: string | undefined;
    missingEnvError: string;
    successLog: string;
  },
): Promise<void> {
  const { authFile, baseUrl, username, password, missingEnvError, successLog } =
    options;
  if (!baseUrl || !username || !password) {
    throw new Error(missingEnvError);
  }
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  const setupBrowser = await browser.browserType().launch();
  const setupContext = await setupBrowser.newContext(DEFAULT_CONTEXT_OPTIONS);
  const setupPage = await setupContext.newPage();
  const login = new LoginPage(setupPage);
  await login.goto(baseUrl);
  await login.login(username, password);
  await setupContext.storageState({ path: authFile });
  await setupBrowser.close();
  console.log(successLog);
}

async function withAuthenticatedProfile(
  browser: Browser,
  profile: AuthProfileId,
  use: (session: AuthenticatedSession) => Promise<void>,
): Promise<void> {
  const authFile = authStoragePath(profile);
  const { username, password } = getProfileCredentials(profile);
  const label = AUTH_PROFILES[profile].setupLabel;

  if (!fs.existsSync(authFile)) {
    await ensureAuthStorageFromLogin(browser, {
      authFile,
      baseUrl: process.env.BASE_URL?.trim(),
      username,
      password,
      missingEnvError: missingCredentialsErrorMessage(profile),
      successLog: `✓ [${label}] Fallback login successful — session saved`,
    });
  }

  const context = await browser.newContext({
    ...DEFAULT_CONTEXT_OPTIONS,
    storageState: authFile,
  });
  const page = await context.newPage();
  await use({ context, page });
  await context.close();
}

export { expect };

type AuthFixtures = {
  /**
   * Chọn tài khoản cho authenticatedPage và các page fixture phụ thuộc.
   * @default "admin"
   */
  authProfile: AuthProfileId;
  authenticatedPage: AuthenticatedSession;
  createQuotationPage: CreateQuotationPage;
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
  /** Luôn dùng session merchant; không phụ thuộc authProfile. */
  authenticatedMerchantPage: AuthenticatedSession;
  baseUrl: string;
};

export const test = base.extend<AuthFixtures>({
  authProfile: ["SuperAdminAuto", { option: true, scope: "test" }],

  baseUrl: async ({}, use) => {
    const url = process.env.BASE_URL?.trim();
    if (!url) throw new Error("Missing env var: BASE_URL");
    await use(url);
  },

  authenticatedPage: async ({ browser, authProfile }, use) => {
    await withAuthenticatedProfile(browser, authProfile, use);
  },

  listVendorPage: navigatedPageFixture(ListVendorPage),
  listUserPage: navigatedPageFixture(ListUserPage),
  listRegisterPage: navigatedPageFixture(ListRegisterPage),
  addNewUserPage: navigatedPageFixture(AddNewUserPage),
  fastRegisterPage: navigatedPageFixture(FastRegisterPage),
  vendorConfirmPoPage: navigatedPageFixture(VendorConfirmPoPage),
  globalPage: navigatedPageFixture(GlobalPage),
  listReturnPage: navigatedPageFixture(ListReturnPage),
  reportBrandPage: navigatedPageFixture(ReportBrandPage),
  reportSalesPage: navigatedPageFixture(ReportSalesPage),
  reportStocksPage: navigatedPageFixture(ReportStocksPage),
  purchaseOrderPage: navigatedPageFixture(PurchaseOrderPage),
  poDeliveryPage: navigatedPageFixture(PoDeliveryPage),
  confirmPoImportPage: navigatedPageFixture(ConfirmPoImportPage),
  sentApiLogsPage: navigatedPageFixture(SentApiLogsPage),
  genQrCodeLogsPage: navigatedPageFixture(GenQrCodeLogsPage),
  listLessonPage: navigatedPageFixture(ListLessonPage),
  listCoursePage: navigatedPageFixture(ListCoursePage),
  addNewLessonPage: navigatedPageFixture(AddNewLessonPage),
  addNewCoursePage: navigatedPageFixture(AddNewCoursePage),
  listProductPosmPage: navigatedPageFixture(ListProductPosmPage),
  listBookingPage: navigatedPageFixture(ListBookingPage),
  addProductPosmPage: navigatedPageFixture(AddProductPosmPage),
  addBookingPage: navigatedPageFixture(AddBookingPage),
  createQuotationPage: navigatedPageFixture(CreateQuotationPage),
  pgStaffPage: navigatedPageFixture(PgStaffPage),
  pgPbReportPage: navigatedPageFixture(PgPbReportPage),
  listPgPbPage: navigatedPageFixture(ListPgPbPage),
  workSchedulePage: navigatedPageFixture(WorkSchedulePage),
  productPage: navigatedPageFixture(ProductPage),
  productListPage: navigatedPageFixture(ProductListPage),

  authenticatedMerchantPage: async ({ browser }, use) => {
    await withAuthenticatedProfile(browser, "MerchantAuto", use);
  },
});
