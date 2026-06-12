import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingView } from "../components/OnboardingView";
import { getSettings } from "@/features/settings/store";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

const replace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("OnboardingView", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("shows an error for an invalid email and does not navigate", () => {
    render(<OnboardingView />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "a@b" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
    expect(replace).not.toHaveBeenCalled();
  });

  it("signs the user up and returns to the home screen on a valid email", () => {
    render(<OnboardingView />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "rasheed@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(getSettings().email).toBe("rasheed@example.com");
    expect(getSettings().onboardingComplete).toBe(true);
    expect(replace).toHaveBeenCalledWith("/");
  });
});
