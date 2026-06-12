import { getUserScope, migrateLegacyKey, scopedKey } from "../userScope";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

describe("userScope", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("getUserScope", () => {
    it("is 'guest' when no account is signed in", () => {
      expect(getUserScope()).toBe("guest");
    });

    it("is the signed-in account's email", () => {
      window.localStorage.setItem(
        "wird:settings",
        JSON.stringify({ email: "rasheed@example.com" })
      );
      expect(getUserScope()).toBe("rasheed@example.com");
    });
  });

  describe("scopedKey", () => {
    it("namespaces a base key under the current scope", () => {
      expect(scopedKey("wordStatuses")).toBe("wird:guest:wordStatuses");

      window.localStorage.setItem(
        "wird:settings",
        JSON.stringify({ email: "rasheed@example.com" })
      );
      expect(scopedKey("wordStatuses")).toBe("wird:rasheed@example.com:wordStatuses");
    });
  });

  describe("migrateLegacyKey", () => {
    it("copies a legacy unscoped key into the current scope and removes the legacy key", () => {
      window.localStorage.setItem("wird:wordStatuses", '{"a":1}');

      migrateLegacyKey("wird:wordStatuses", "wordStatuses");

      expect(window.localStorage.getItem("wird:guest:wordStatuses")).toBe('{"a":1}');
      expect(window.localStorage.getItem("wird:wordStatuses")).toBeNull();
    });

    it("is a no-op when the legacy key is absent", () => {
      migrateLegacyKey("wird:wordStatuses", "wordStatuses");

      expect(window.localStorage.getItem("wird:guest:wordStatuses")).toBeNull();
    });

    it("does not overwrite a scoped key that already has data", () => {
      window.localStorage.setItem("wird:guest:wordStatuses", '{"existing":true}');
      window.localStorage.setItem("wird:wordStatuses", '{"legacy":true}');

      migrateLegacyKey("wird:wordStatuses", "wordStatuses");

      expect(window.localStorage.getItem("wird:guest:wordStatuses")).toBe('{"existing":true}');
      expect(window.localStorage.getItem("wird:wordStatuses")).toBe('{"legacy":true}');
    });
  });
});
