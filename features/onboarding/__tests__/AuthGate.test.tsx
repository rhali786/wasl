import React from "react";
import { render } from "@testing-library/react";
import { AuthGate } from "../components/AuthGate";
import { needsLogin, needsOnboarding } from "@/features/settings/store";

jest.mock("@/features/settings/store", () => ({
  needsOnboarding: jest.fn(),
  needsLogin: jest.fn(),
}));

let pathname = "/";
const replace = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace }),
}));

describe("AuthGate", () => {
  beforeEach(() => {
    pathname = "/";
    jest.clearAllMocks();
    (needsOnboarding as jest.Mock).mockReturnValue(false);
    (needsLogin as jest.Mock).mockReturnValue(false);
  });

  it("redirects to /onboarding for a brand-new user", () => {
    (needsOnboarding as jest.Mock).mockReturnValue(true);
    render(<AuthGate>content</AuthGate>);
    expect(replace).toHaveBeenCalledWith("/onboarding");
  });

  it("redirects to /login for a signed-out user", () => {
    (needsLogin as jest.Mock).mockReturnValue(true);
    render(<AuthGate>content</AuthGate>);
    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("does not redirect when onboarded and signed in", () => {
    render(<AuthGate>content</AuthGate>);
    expect(replace).not.toHaveBeenCalled();
  });

  it.each(["/onboarding", "/login", "/prototypes/reader"])(
    "does not redirect on bypassed path %s even if onboarding/login is needed",
    (path) => {
      pathname = path;
      (needsOnboarding as jest.Mock).mockReturnValue(true);
      (needsLogin as jest.Mock).mockReturnValue(true);
      render(<AuthGate>content</AuthGate>);
      expect(replace).not.toHaveBeenCalled();
    }
  );
});
