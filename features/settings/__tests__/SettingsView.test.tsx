import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsView } from "../components/SettingsView";
import { getSettings, signUp } from "../store";
import type { SurahIndexEntry } from "@/features/corpus/lib/types";

jest.mock("@/features/lib/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

const replace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const SURAHS: SurahIndexEntry[] = [
  { number: 112, name: "Al-Ikhlas", arabic: "الإخلاص", page: 604, juz: 30 },
  { number: 113, name: "Al-Falaq", arabic: "الفلق", page: 604, juz: 30 },
];

describe("SettingsView", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("lists the sūrahs it is given", () => {
    render(<SettingsView surahs={SURAHS} />);
    expect(screen.getByText("Al-Ikhlas")).toBeInTheDocument();
    expect(screen.getByText("Al-Falaq")).toBeInTheDocument();
  });

  it("explains the difference between memorizing and memorized", () => {
    render(<SettingsView surahs={SURAHS} />);
    expect(screen.getByText(/still learning it/i)).toBeInTheDocument();
    expect(screen.getByText(/know it by heart/i)).toBeInTheDocument();
  });

  it("persists a sūrah when marked memorized", () => {
    render(<SettingsView surahs={SURAHS} />);
    fireEvent.click(screen.getByRole("button", { name: "Memorized: Al-Ikhlas" }));
    expect(getSettings().memorized).toContain(112);
  });

  it("disables the memorizing toggle for a sūrah once it is memorized", () => {
    render(<SettingsView surahs={SURAHS} />);
    fireEvent.click(screen.getByRole("button", { name: "Memorized: Al-Ikhlas" }));
    expect(
      screen.getByRole("button", { name: "Memorizing: Al-Ikhlas" })
    ).toBeDisabled();
  });

  it("shows the signed-in email and logs out to /login", () => {
    signUp("rasheed@example.com");
    render(<SettingsView surahs={SURAHS} />);

    expect(screen.getByText("rasheed@example.com")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(getSettings().email).toBeUndefined();
    expect(getSettings().signedOut).toBe(true);
    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("deletes all local data and account after a confirm, then routes to onboarding", () => {
    signUp("rasheed@example.com");
    window.localStorage.setItem("wird:wordStatuses", "{\"x\":1}");
    render(<SettingsView surahs={SURAHS} />);

    // First click only arms the confirm — nothing is destroyed yet.
    fireEvent.click(screen.getByRole("button", { name: /delete data & account/i }));
    expect(window.localStorage.length).toBeGreaterThan(0);
    expect(replace).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /delete everything/i }));
    expect(window.localStorage.length).toBe(0);
    expect(replace).toHaveBeenCalledWith("/onboarding");
  });

  it("can cancel the delete confirm, leaving data intact", () => {
    signUp("rasheed@example.com");
    render(<SettingsView surahs={SURAHS} />);

    fireEvent.click(screen.getByRole("button", { name: /delete data & account/i }));
    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(screen.queryByRole("button", { name: /delete everything/i })).not.toBeInTheDocument();
    expect(getSettings().email).toBe("rasheed@example.com");
    expect(replace).not.toHaveBeenCalled();
  });

  it("places the account controls (name + log out) above session length", () => {
    signUp("rasheed@example.com");
    render(<SettingsView surahs={SURAHS} />);

    const logOutBtn = screen.getByRole("button", { name: /log out/i });
    const sessionHeading = screen.getByText("Session length");
    expect(
      logOutBtn.compareDocumentPosition(sessionHeading) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("lets the user set a display name", () => {
    signUp("rasheed@example.com");
    render(<SettingsView surahs={SURAHS} />);

    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: "Rashy" } });

    expect(getSettings().name).toBe("Rashy");
    expect(nameInput).toHaveValue("Rashy");
  });

  it("steps the session length by 5 minutes and never below the floor", () => {
    render(<SettingsView surahs={SURAHS} />);
    expect(screen.getByTestId("session-minutes").textContent).toMatch(/5/);
    fireEvent.click(screen.getByRole("button", { name: /increase session length/i }));
    expect(screen.getByTestId("session-minutes").textContent).toMatch(/10/);
    expect(getSettings().sessionMinutes).toBe(10);
    fireEvent.click(screen.getByRole("button", { name: /decrease session length/i }));
    fireEvent.click(screen.getByRole("button", { name: /decrease session length/i }));
    expect(screen.getByTestId("session-minutes").textContent).toMatch(/5/);
  });
});
