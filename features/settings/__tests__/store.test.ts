import {
  getSettings,
  needsLogin,
  needsOnboarding,
  signIn,
  signOut,
  signUp,
} from "../store";
import { DEFAULT_SETTINGS } from "../lib/types";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

describe("settings store — account (sign-up / sign-in / sign-out)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  describe("needsOnboarding", () => {
    it("is true for a brand-new user with no data", () => {
      expect(needsOnboarding()).toBe(true);
    });

    it("is false once onboarding has been completed", () => {
      signUp("new.user@example.com");
      expect(needsOnboarding()).toBe(false);
    });

    it("grandfathers existing local users who already have progress data", () => {
      window.localStorage.setItem("wird:wordStatuses", "{}");
      expect(needsOnboarding()).toBe(false);
    });
  });

  describe("signUp", () => {
    it("stores a normalized email, derives a display name, and completes onboarding", () => {
      const result = signUp("  Rasheed.Ali@Example.com ");
      expect(result.email).toBe("rasheed.ali@example.com");
      expect(result.name).toBe("Rasheed Ali");
      expect(result.onboardingComplete).toBe(true);
      expect(result.signedOut).toBe(false);
      expect(getSettings().email).toBe("rasheed.ali@example.com");
    });

    it("rejects an invalid email and leaves settings unchanged", () => {
      expect(() => signUp("not-an-email")).toThrow();
      expect(getSettings()).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe("signOut / needsLogin / signIn", () => {
    it("clears the local email identity and requires login again", () => {
      signUp("rasheed@example.com");
      signOut();

      const after = getSettings();
      expect(after.email).toBeUndefined();
      expect(after.name).toBeUndefined();
      expect(after.signedOut).toBe(true);
      expect(needsLogin()).toBe(true);
    });

    it("keeps reading progress (memorized/memorizing) across sign-out", () => {
      signUp("rasheed@example.com");
      window.localStorage.setItem(
        "wird:settings",
        JSON.stringify({ ...getSettings(), memorized: [114] })
      );
      signOut();
      expect(getSettings().memorized).toEqual([114]);
    });

    it("needsOnboarding stays false after sign-out (onboarding already completed)", () => {
      signUp("rasheed@example.com");
      signOut();
      expect(needsOnboarding()).toBe(false);
    });

    it("signIn restores the email identity and clears the sign-out flag", () => {
      signUp("rasheed@example.com");
      signOut();

      const result = signIn("rasheed@example.com");
      expect(result.email).toBe("rasheed@example.com");
      expect(result.signedOut).toBe(false);
      expect(needsLogin()).toBe(false);
    });

    it("signIn rejects an invalid email", () => {
      expect(() => signIn("nope")).toThrow();
    });
  });
});
