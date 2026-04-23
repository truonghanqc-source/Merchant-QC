/**
 * Payload mẫu cho POST `/merchant/check-rule`.
 * Override trong test nếu cần khoảng ngày / SKU khác.
 */
export const merchantCheckRuleSamplePayload = {
  from_date: "1746032400",
  to_date: "1748710800",
  stock_id: 1001,
  sku: "422503786",
} as const;
