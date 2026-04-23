import { test, expect, type APIRequestContext } from "@playwright/test";
import { MerchantCheckRuleApi } from "../../pages/api/MerchantCheckRuleApi.ts";
import { merchantCheckRuleSamplePayload } from "../../playwright/test-data/merchant-check-rule.ts";

/** Không gửi `MERCHANT_CHECK_RULE_COOKIE` — chỉ kiểm tra `MERCHANT_CHECK_RULE_AUTHORIZATION`. */
const authBearerOnly = { useEnvCookie: false as const };

/**
 * Staging thường trả 200 + HTML hoặc JSON trong body; nhiều case “REST chuẩn” (401, 415…)
 * có thể không khớp — assert ghi nhận hành vi thực tế.
 *
 * Nhóm "With valid env token" gọi API **chỉ với Bearer** (`useEnvCookie: false`) để token sai
 * không bị session cookie che; probe + TC-P/TC-V/TC-H đều dùng cùng cách.
 */

/** Prefers `BASE_URL_CHECK_RULE`, falls back to `BASE_URL`. */
function checkRuleBaseUrl(): string | undefined {
  return (
    process.env.BASE_URL_CHECK_RULE?.trim() || process.env.BASE_URL?.trim()
  );
}

function hasCheckRuleAuth(): boolean {
  return Boolean(process.env.MERCHANT_CHECK_RULE_AUTHORIZATION?.trim());
}

function failMissingBaseUrl(): void {
  throw new Error(
    "Missing BASE_URL_CHECK_RULE or BASE_URL — set one in .env.local",
  );
}

function failMissingToken(): void {
  throw new Error(
    "Missing MERCHANT_CHECK_RULE_AUTHORIZATION — set in .env.local",
  );
}

/** Token phải được server chấp nhận (không 401/403) trước các case cần auth. */
async function assertEnvTokenAcceptedByApi(
  request: APIRequestContext,
): Promise<void> {
  const baseUrl = checkRuleBaseUrl()!;

  const api = new MerchantCheckRuleApi(request);
  const response = await api.post(
    baseUrl,
    { ...merchantCheckRuleSamplePayload },
    { ...authBearerOnly, failOnStatusCode: false },
  );
  const status = response.status();
  const body = await response.text();

  if (status === 401 || status === 403) {
    throw new Error(
      `MERCHANT_CHECK_RULE_AUTHORIZATION was rejected (Bearer-only, no env cookie; HTTP ${status}). ` +
        `Update the token. Response (truncated): ${body.slice(0, 800)}`,
    );
  }
  if (status >= 500) {
    throw new Error(
      `Server error during auth probe (HTTP ${status}). Response (truncated): ${body.slice(0, 800)}`,
    );
  }
}

test.describe("Merchant API — check-rule", () => {
  // Case chỉ cần URL: thiếu URL → fail ngay (không skip).
  test.describe("Authentication", () => {
    test.beforeEach(() => {
      if (!checkRuleBaseUrl()) failMissingBaseUrl();
    });

    test("TC-A01 — no Authorization header: records status (often 200 if session/cookie elsewhere)", async ({
      request,
    }) => {
      const api = new MerchantCheckRuleApi(request);
      const response = await api.post(
        checkRuleBaseUrl()!,
        { ...merchantCheckRuleSamplePayload },
        {
          useEnvAuth: false,
          headers: {},
          failOnStatusCode: false,
        },
      );

      expect([200, 401, 403]).toContain(response.status());
    });

    test("TC-A02 — invalid Bearer token: records status (server may still return 200)", async ({
      request,
    }) => {
      const api = new MerchantCheckRuleApi(request);
      const response = await api.post(
        checkRuleBaseUrl()!,
        { ...merchantCheckRuleSamplePayload },
        {
          useEnvAuth: false,
          headers: { Authorization: "Bearer invalid-token-for-test" },
          failOnStatusCode: false,
        },
      );

      expect([200, 401, 403]).toContain(response.status());
    });
  });

  // Mọi case bên dưới: thiếu URL / thiếu token / token sai → fail ngay với message rõ.
  test.describe("With valid env token", () => {
    test.beforeEach(async ({ request }) => {
      if (!checkRuleBaseUrl()) failMissingBaseUrl();
      if (!hasCheckRuleAuth()) failMissingToken();
      await assertEnvTokenAcceptedByApi(request);
    });

    // ─── Group 1: Success path & happy data ───────────────────────────────
    test.describe("Positive / smoke", () => {
      test("TC-P01 — valid POST payload returns 2xx with valid token", async ({
        request,
      }) => {
        const api = new MerchantCheckRuleApi(request);
        const response = await api.post(
          checkRuleBaseUrl()!,
          {
            ...merchantCheckRuleSamplePayload,
          },
          authBearerOnly,
        );

        expect(response.ok(), await response.text()).toBeTruthy();
      });

      test("TC-P02 — 2xx response; Content-Type may be JSON or HTML (legacy stack)", async ({
        request,
      }) => {
        const api = new MerchantCheckRuleApi(request);
        const response = await api.post(
          checkRuleBaseUrl()!,
          {
            ...merchantCheckRuleSamplePayload,
          },
          authBearerOnly,
        );

        expect(response.ok(), await response.text()).toBeTruthy();
        const ct = (response.headers()["content-type"] ?? "").toLowerCase();
        expect(ct).toMatch(/json|html/);
      });
    });

    // ─── Group 3: Body validation ───────────────────────────────────────────
    test.describe("Request body validation", () => {
      test("TC-V01 — missing `sku` field: may return 200 or 4xx depending on server validation", async ({
        request,
      }) => {
        const { sku: _omit, ...rest } = merchantCheckRuleSamplePayload;
        const api = new MerchantCheckRuleApi(request);
        const response = await api.post(checkRuleBaseUrl()!, rest, {
          ...authBearerOnly,
          failOnStatusCode: false,
        });

        expect([200, 400, 422, 404]).toContain(response.status());
      });

      test("TC-V02 — missing `from_date`: may return 200 or 4xx", async ({
        request,
      }) => {
        const { from_date: _f, ...rest } = merchantCheckRuleSamplePayload;
        const api = new MerchantCheckRuleApi(request);
        const response = await api.post(checkRuleBaseUrl()!, rest, {
          ...authBearerOnly,
          failOnStatusCode: false,
        });

        expect([200, 400, 422, 404]).toContain(response.status());
      });

      test("TC-V03 — empty body `{}`: may return 200 or 4xx", async ({
        request,
      }) => {
        const api = new MerchantCheckRuleApi(request);
        const response = await api.post(
          checkRuleBaseUrl()!,
          {},
          {
            ...authBearerOnly,
            failOnStatusCode: false,
          },
        );

        expect([200, 400, 422, 404]).toContain(response.status());
      });

      test("TC-V04 — `from_date` after `to_date` (if validated) → 4xx or 2xx business", async ({
        request,
      }) => {
        const badRange = {
          ...merchantCheckRuleSamplePayload,
          from_date: merchantCheckRuleSamplePayload.to_date,
          to_date: merchantCheckRuleSamplePayload.from_date,
        } satisfies Record<string, unknown>;
        const api = new MerchantCheckRuleApi(request);
        const response = await api.post(
          checkRuleBaseUrl()!,
          { ...badRange },
          {
            ...authBearerOnly,
            failOnStatusCode: false,
          },
        );

        expect([200, 400, 422]).toContain(response.status());
      });

      test("TC-V05 — `stock_id` = 0 (edge case) — assert status", async ({
        request,
      }) => {
        const api = new MerchantCheckRuleApi(request);
        const response = await api.post(
          checkRuleBaseUrl()!,
          {
            ...merchantCheckRuleSamplePayload,
            stock_id: 0,
          },
          { ...authBearerOnly, failOnStatusCode: false },
        );

        expect([200, 400, 422, 404]).toContain(response.status());
      });

      test("TC-V06 — non-existent or invalid `sku` — business response (2xx/400/404/422)", async ({
        request,
      }) => {
        const api = new MerchantCheckRuleApi(request);
        const response = await api.post(
          checkRuleBaseUrl()!,
          {
            ...merchantCheckRuleSamplePayload,
            sku: "NON_EXISTENT_SKU_000000000",
          },
          { ...authBearerOnly, failOnStatusCode: false },
        );

        expect([200, 400, 404, 422]).toContain(response.status());
      });
    });

    // ─── Group 4: HTTP method & headers ─────────────────────────────────────
    test.describe("HTTP method & headers", () => {
      test("TC-H01 — GET same path: SPA/stack may return 200 HTML or 404/405", async ({
        request,
      }) => {
        const api = new MerchantCheckRuleApi(request);
        const response = await api.get(checkRuleBaseUrl()!, {
          ...authBearerOnly,
          failOnStatusCode: false,
        });

        expect([200, 400, 404, 405]).toContain(response.status());
      });

      test("TC-H02 — Content-Type text/plain but JSON body: server may ignore and return 200", async ({
        request,
      }) => {
        const api = new MerchantCheckRuleApi(request);
        const response = await api.post(
          checkRuleBaseUrl()!,
          { ...merchantCheckRuleSamplePayload },
          {
            ...authBearerOnly,
            headers: { "Content-Type": "text/plain" },
            failOnStatusCode: false,
          },
        );

        expect([200, 400, 415, 422]).toContain(response.status());
      });
    });
  });
});
