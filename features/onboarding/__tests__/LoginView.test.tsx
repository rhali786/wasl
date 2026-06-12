import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginView } from "../components/LoginView";
import { getSettings, signOut, signUp } from "@/features/settings/store";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

const replace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("LoginView", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("shows an error for an invalid email and does not navigate", () => {
    render(<LoginView />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "a@b" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
    expect(replace).not.toHaveBeenCalled();
  });

  it("signs the returning user back in and returns to the home screen", () => {
    signUp("rasheed@example.com");
    signOut();

    render(<LoginView />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "rasheed@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(getSettings().signedOut).toBe(false);
    expect(replace).toHaveBeenCalledWith("/");
  });
});
