/**
 * Giá trị option dropdown màn tạo sản phẩm (tab Product Info).
 * Chuỗi phải khớp đúng text trên UI. Override bằng E2E_PRODUCT_* trong .env.local.
 */

function envOr(key: string, fallback: string): string {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : fallback;
}

/** Các lựa chọn shelf life thường gặp — dùng khi test cần đổi khác default. */
export const productShelfLifeOption = {
  MONTHS_6: "6 Month",
  MONTHS_12: "12 Month",
  MONTHS_36: "36 Month",
} as const;

export const productExpirationDateFormatOption = {
  DDMMYY: "DD/MM/YY",
  MMDDYY: "MM/DD/YY",
  YYMMDD: "YY/MM/DD",
} as const;

export const productAllowedShelfLifePoOption = {
  PERCENT_60: "60%",
  PERCENT_70: "70%",
  PERCENT_80: "80%",
  PERCENT_90: "90%",
} as const;

export const productFormDropdownValues = {
  productTypeNormal: envOr("E2E_PRODUCT_TYPE_NORMAL", "NORMAL"),
  productTypeGift: envOr("E2E_PRODUCT_TYPE_GIFT", "GIFT"),
  shelfLife36Months: envOr(
    "E2E_PRODUCT_SHELF_LIFE_36_MONTHS",
    productShelfLifeOption.MONTHS_36,
  ),
  shelfLife12Months: envOr(
    "E2E_PRODUCT_SHELF_LIFE_12_MONTHS",
    productShelfLifeOption.MONTHS_12,
  ),
  shelfLife6Months: envOr(
    "E2E_PRODUCT_SHELF_LIFE_6_MONTHS",
    productShelfLifeOption.MONTHS_6,
  ),
  /**
   * Format ngày mặc định (happy path). Chỉ key này đọc E2E_PRODUCT_EXPIRATION_FORMAT.
   * Hai key dưới luôn khớp `productExpirationDateFormatOption` — test khác format thì dùng trực tiếp option đó hoặc env riêng nếu sau này thêm.
   */
  expirationDateFormatDDMMYY: envOr(
    "E2E_PRODUCT_EXPIRATION_FORMAT",
    productExpirationDateFormatOption.DDMMYY,
  ),
  expirationDateFormatMMDDYY: productExpirationDateFormatOption.MMDDYY,
  expirationDateFormatYYMMDD: productExpirationDateFormatOption.YYMMDD,

  // % Allowed Shelf Life PO
  allowedShelfLifePo60Percent: productAllowedShelfLifePoOption.PERCENT_60,
  allowedShelfLifePo70Percent: productAllowedShelfLifePoOption.PERCENT_70,
  allowedShelfLifePo80Percent: productAllowedShelfLifePoOption.PERCENT_80,
  allowedShelfLifePo90Percent: productAllowedShelfLifePoOption.PERCENT_90,
};
