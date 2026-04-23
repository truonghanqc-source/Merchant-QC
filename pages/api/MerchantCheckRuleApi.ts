import type { APIRequestContext, APIResponse } from "@playwright/test";

/** Body POST `/merchant/check-rule` (unix time dạng chuỗi như API). */
export type MerchantCheckRuleBody = {
  from_date: string;
  to_date: string;
  stock_id: number;
  sku: string;
};

export type MerchantCheckRuleRequestOptions = {
  /**
   * Khi `false`: không đọc `MERCHANT_CHECK_RULE_*` từ env;
   * cần tự truyền `headers` (ví dụ test thiếu token).
   * @default true
   */
  useEnvAuth?: boolean;
  /**
   * Khi `false`: không gửi `MERCHANT_CHECK_RULE_COOKIE` — chỉ dùng `MERCHANT_CHECK_RULE_AUTHORIZATION`
   * (kiểm tra đúng hành vi API theo Bearer; tránh session cookie che token sai).
   * @default true (giữ tương thích: vẫn gửi cookie nếu có trong env)
   */
  useEnvCookie?: boolean;
  /** Gộp lên headers sau khi resolve (env hoặc Content-Type tối thiểu). */
  headers?: Record<string, string>;
  /**
   * `false` để không throw khi 4xx/5xx — bắt buộc cho test kiểm tra mã lỗi.
   * @default true (theo Playwright)
   */
  failOnStatusCode?: boolean;
};

/**
 * Gọi API kiểm tra rule (merchant).
 * Token (bắt buộc cho suite Bearer-only): `MERCHANT_CHECK_RULE_AUTHORIZATION`.
 * Cookie tùy chọn: `MERCHANT_CHECK_RULE_COOKIE` — chỉ gửi khi `useEnvCookie !== false`.
 */
export class MerchantCheckRuleApi {
  static readonly path = "/merchant/check-rule" as const;

  constructor(private readonly request: APIRequestContext) {}

  resolveUrl(baseUrl: string): string {
    return new URL(MerchantCheckRuleApi.path, baseUrl).href;
  }

  private headersFromEnv(
    options?: MerchantCheckRuleRequestOptions,
  ): Record<string, string> {
    const authorization = process.env.MERCHANT_CHECK_RULE_AUTHORIZATION?.trim();
    if (!authorization) {
      throw new Error(
        "Missing MERCHANT_CHECK_RULE_AUTHORIZATION (JWT hoặc Bearer …) trong .env.local",
      );
    }
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: authorization,
    };
    const sendCookie = options?.useEnvCookie !== false;
    if (sendCookie) {
      const cookie = process.env.MERCHANT_CHECK_RULE_COOKIE?.trim();
      if (cookie) headers.Cookie = cookie;
    }
    return headers;
  }

  private mergeHeaders(
    options: MerchantCheckRuleRequestOptions | undefined,
  ): Record<string, string> {
    const useEnv = options?.useEnvAuth !== false;
    if (useEnv) {
      return { ...this.headersFromEnv(options), ...options?.headers };
    }
    return {
      "Content-Type": "application/json",
      ...options?.headers,
    };
  }

  private requestOptions(
    options: MerchantCheckRuleRequestOptions | undefined,
  ): { failOnStatusCode?: boolean } {
    if (options?.failOnStatusCode === false) {
      return { failOnStatusCode: false };
    }
    return {};
  }

  async post(
    baseUrl: string,
    body: Record<string, unknown>,
    options?: MerchantCheckRuleRequestOptions,
  ): Promise<APIResponse> {
    return this.request.post(this.resolveUrl(baseUrl), {
      headers: this.mergeHeaders(options),
      data: JSON.stringify(body),
      ...this.requestOptions(options),
    });
  }

  /** Dùng khi cần kiểm tra method không được phép (ví dụ GET → 405). */
  async get(
    baseUrl: string,
    options?: MerchantCheckRuleRequestOptions,
  ): Promise<APIResponse> {
    return this.request.get(this.resolveUrl(baseUrl), {
      headers: this.mergeHeaders(options),
      ...this.requestOptions(options),
    });
  }
}
