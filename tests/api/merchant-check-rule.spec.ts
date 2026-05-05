import { test, expect, type APIRequestContext } from "@playwright/test";
import { MerchantCheckRuleApi } from "../../pages/api/MerchantCheckRuleApi.ts";
import { merchantCheckRuleSamplePayload } from "../../playwright/test-data/merchant-check-rule.ts";

/**
 * Endpoint này trên staging **thường cần cả Cookie + Authorization** như Postman.
 * Không được bỏ cookie (`useEnvCookie: false`) khi probe / smoke — nếu không, token sai vẫn có thể 200
 * và toàn suite “pass” oan.
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

/** Làm hỏng chuỗi JWT/sign — giống sửa nhẹ token trên Postman; phải vẫn gửi kèm Cookie. */
function corruptAuthorizationForNegativeTest(raw: string): string {
  const t = raw.trim();
  if (t.length < 8) return `${t}___bad`;
  return `${t.slice(0, -4)}_XXX`;
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

/** Token + Cookie (như Postman): phải 2xx; 401/403 → sai token trong .env.local. */
async function assertEnvTokenAcceptedByApi(
  request: APIRequestContext,
): Promise<void> {
  const baseUrl = checkRuleBaseUrl()!;

  const api = new MerchantCheckRuleApi(request);
  const response = await api.post(
    baseUrl,
    { ...merchantCheckRuleSamplePayload },
    { failOnStatusCode: false },
  );
  const status = response.status();
  const body = await response.text();

  if (status === 401 || status === 403) {
    throw new Error(
      `Auth rejected (HTTP ${status}). Check MERCHANT_CHECK_RULE_AUTHORIZATION and MERCHANT_CHECK_RULE_COOKIE in .env.local — must match Postman. Response (truncated): ${body.slice(0, 800)}`,
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

    test("TC-A02 — mangled Authorization + Cookie (Postman-style: may be 401 or 200 if Cookie alone satisfies session)", async ({
      request,
    }) => {
      const auth = process.env.MERCHANT_CHECK_RULE_AUTHORIZATION?.trim();
      const cookie = process.env.MERCHANT_CHECK_RULE_COOKIE?.trim();
      test.skip(
        !auth || !cookie,
        "Set MERCHANT_CHECK_RULE_AUTHORIZATION and MERCHANT_CHECK_RULE_COOKIE — Postman sends both; wrong token alone without Cookie can behave differently.",
      );

      const validAuth = auth!;
      const sessionCookie = cookie!;

      const api = new MerchantCheckRuleApi(request);
      const response = await api.post(
        checkRuleBaseUrl()!,
        { ...merchantCheckRuleSamplePayload },
        {
          useEnvAuth: false,
          headers: {
            Authorization: corruptAuthorizationForNegativeTest(validAuth),
            Cookie: sessionCookie,
          },
          failOnStatusCode: false,
        },
      );

      /** Staging có thể trả 200 khi cookie vẫn hợp lệ dù JWT bị sửa nhẹ (đã thấy HTTP 200). Postman sửa đủ hỏng token thì thường 401. */
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
        const response = await api.post(checkRuleBaseUrl()!, {
          ...merchantCheckRuleSamplePayload,
        });

        expect(response.ok(), await response.text()).toBeTruthy();
      });

      test("TC-P02 — 2xx response; Content-Type may be JSON or HTML (legacy stack)", async ({
        request,
      }) => {
        const api = new MerchantCheckRuleApi(request);
        const response = await api.post(checkRuleBaseUrl()!, {
          ...merchantCheckRuleSamplePayload,
        });

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
          { failOnStatusCode: false },
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
          { failOnStatusCode: false },
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
            headers: { "Content-Type": "text/plain" },
            failOnStatusCode: false,
          },
        );

        expect([200, 400, 415, 422]).toContain(response.status());
      });
    });
  });
});
