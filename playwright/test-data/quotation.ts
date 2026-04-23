import type { CreateQuotationPage } from "../../pages/quotation/QuotationPage.ts";
import { vendorLabelsQuotation } from "./vendors.ts";

function envOr(key: string, fallback: string): string {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : fallback;
}

export type QuotationScenario = {
  company: string;
  storeLabel: string;
  defaultSku: string;
  vendorForQuotation?: string;
  skuVatOppositeCase?: string;
};

/** Tên company trên form tạo quotation (select). */
export const COMPANY = {
  HASAKI_VIETNAM: envOr(
    "E2E_QUOTATION_COMPANY_HASAKI_VN",
    "HASAKI VIETNAM JOINT STOCK COMPANY",
  ),
  GLOBAL_TRADE: envOr(
    "E2E_QUOTATION_COMPANY_GLOBAL_TRADE",
    "HASAKI GLOBAL TRADE COMPANY LIMITED",
  ),
  HASAKI_LLC: envOr(
    "E2E_QUOTATION_COMPANY_LLC",
    "HASAKI LIMITED LIABILITY COMPANY",
  ),
} as const;

export const listTypeQuotation = {
  NORMAL: "Normal",
  TESTER: "Tester",
  GIFT: "Gift",
  ACTIVATION: "Activation",
  POSM: "POSM",
} as const;

/**
 * Bộ dữ liệu cố định theo từng nhánh company (store + SKU + vendor nếu cần).
 * Override bằng E2E_QUOTATION_* trong .env.local khi seed DEV đổi.
 */
export const quotationScenarios = {
  hasakiVietNam: {
    company: COMPANY.HASAKI_VIETNAM,
    storeLabel: envOr(
      "E2E_QUOTATION_STORE_HASAKI_VN",
      "SHOP - 71 HOANG HOA THAM",
    ),
    defaultSku: envOr("E2E_QUOTATION_SKU_HASAKI_VN", "100240028"),
    skuVatOppositeCase: envOr(
      "E2E_QUOTATION_SKU_HASAKI_VN_ALT_VAT",
      "205100547",
    ),
  },
  globalTrade: {
    company: COMPANY.GLOBAL_TRADE,
    storeLabel: envOr("E2E_QUOTATION_STORE_GLOBAL_TRADE", "WH -170 QUOC LO 1A"),
    defaultSku: envOr("E2E_QUOTATION_SKU_GLOBAL_TRADE", "422269311"),
    vendorForQuotation: vendorLabelsQuotation.V260064,
  },
  hasakiLlc: {
    company: COMPANY.HASAKI_LLC,
    storeLabel: envOr(
      "E2E_QUOTATION_STORE_LLC",
      "SHOP - 568 LUY BAN BICH - LLC",
    ),
    defaultSku: envOr("E2E_QUOTATION_SKU_LLC", "422269314"),
    vendorForQuotation: vendorLabelsQuotation.V260064,
  },
} satisfies Record<
  "hasakiVietNam" | "globalTrade" | "hasakiLlc",
  QuotationScenario
>;

/** Chọn vendor trước company khi scenario yêu cầu (Global Trade / LLC). */
export async function selectQuotationVendorIfNeeded(
  quotation: CreateQuotationPage,
  scenario: QuotationScenario,
): Promise<void> {
  if (scenario.vendorForQuotation) {
    await quotation.selectVendor(scenario.vendorForQuotation);
  }
}
