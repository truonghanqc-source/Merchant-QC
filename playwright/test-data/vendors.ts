/**
 * Chuỗi vendor hiển thị trên Select2 / dropdown — **khác nhau theo màn hình**.
 * Override bằng biến môi trường E2E_VENDOR_* khi DEV đổi label.
 */

function envOr(key: string, fallback: string): string {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : fallback;
}

/** Label dùng trên màn quotation / import Excel (create flow). */
export const vendorLabelsQuotation = {
  V220065: envOr(
    "E2E_VENDOR_V220065_QUOTATION_LABEL",
    "V220065 - QC Test Vendor 2",
  ),
  V260064: envOr("E2E_VENDOR_V260064_QUOTATION_LABEL", "GLOBAL TRADE"),
} as const;

/** Label dùng trên màn PG Staff (promoter). */
export const vendorLabelsPgStaff = {
  V220065: envOr("E2E_VENDOR_V220065_PG_LABEL", "V220065 - QC Test Vendor 2"),
  V260064: envOr(
    "E2E_VENDOR_V260064_PG_LABEL",
    "V260064 - CÔNG TY TNHH HASAKI GLOBAL TRADE",
  ),
  V190064: envOr(
    "E2E_VENDOR_V190064_PG_LABEL",
    "V190064 - Thương Mại Song Hằng",
  ),
  V250066: envOr("E2E_VENDOR_V250066_PG_LABEL", "V250066 - Sông Hồng"),
} as const;
