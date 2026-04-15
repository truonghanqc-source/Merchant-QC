/**
 * Central auth profile config for E2E.
 * To add a profile: extend AuthProfileId, add AUTH_PROFILES entry; global-setup writes playwright/.auth/<id>.json.
 */
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const AUTH_DIR = path.resolve(__dirname, ".auth");

/** First two profiles keep compatibility with existing admin.json and merchant.json. */
export type AuthProfileId = "SuperAdminAuto" | "MerchantAuto";

export const AUTH_PROFILE_IDS: readonly AuthProfileId[] = [
  "SuperAdminAuto",
  "MerchantAuto",
];

export type AuthProfileConfig = {
  userEnv: string;
  passEnv: string;
  /** Log label (global-setup / fixture fallback login) */
  setupLabel: string;
  /** If true, global-setup fails when credentials are missing */
  requireForSuite: boolean;
};

export const AUTH_PROFILES: Record<AuthProfileId, AuthProfileConfig> = {
  SuperAdminAuto: {
    userEnv: "LOGIN_USER_ADMIN",
    passEnv: "LOGIN_PASS_ADMIN",
    setupLabel: "Admin",
    requireForSuite: true,
  },
  MerchantAuto: {
    userEnv: "LOGIN_USER_MERCHANT",
    passEnv: "LOGIN_PASS_MERCHANT",
    setupLabel: "Merchant",
    requireForSuite: false,
  },
};

export function authStoragePath(profile: AuthProfileId): string {
  return path.join(AUTH_DIR, `${profile}.json`);
}

export function getProfileCredentials(profile: AuthProfileId): {
  username: string | undefined;
  password: string | undefined;
} {
  const p = AUTH_PROFILES[profile];
  return {
    username: process.env[p.userEnv]?.trim(),
    password: process.env[p.passEnv]?.trim(),
  };
}

export function missingCredentialsErrorMessage(profile: AuthProfileId): string {
  const p = AUTH_PROFILES[profile];
  return `Missing env vars: BASE_URL, ${p.userEnv}, ${p.passEnv}`;
}
