import React from "react";
import { render, screen } from "@testing-library/react";

// motion and lucide-react are ESM-only; ts-jest only transforms .tsx? files,
// so mock them at the boundary to keep this a focused render test.
jest.mock("motion/react", () => {
  const passthrough = (tag: string) =>
    React.forwardRef(function M(
      { children, animate, initial, transition, whileHover, style, ...rest }: any,
      ref: any
    ) {
      return React.createElement(tag, { ...rest, style, ref }, children);
    });
  return {
    motion: new Proxy({}, { get: (_t, tag: string) => passthrough(tag) }),
    useReducedMotion: () => true,
  };
});

jest.mock("lucide-react", () =>
  new Proxy(
    {},
    {
      get: () =>
        function Icon(props: any) {
          return React.createElement("svg", props);
        },
    }
  )
);

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("@/features/history/store", () => ({
  getTotalSessions: jest.fn(() => 5),
}));

import { GardenHome } from "../GardenHome";

describe("GardenHome", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the waiting ayah as the hero, with its meaning and reference", () => {
    render(<GardenHome name="Rasheed" />);
    expect(
      screen.getByText("إِذَا زُلْزِلَتِ ٱلْأَرْضُ زِلْزَالَهَا")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/When the earth is shaken/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Az-Zalzalah")).toBeInTheDocument();
  });

  it("greets the user by name", () => {
    render(<GardenHome name="Rasheed" greetingIndex={0} />);
    expect(screen.getByRole("heading", { name: /Good morning, Rasheed/ })).toBeInTheDocument();
  });

  it("shows the Arabic translation beneath the English greeting", () => {
    render(<GardenHome name="Rasheed" greetingIndex={0} />);
    expect(screen.getByText(/صَبَاحُ الخَيْرِ، يا Rasheed/)).toBeInTheDocument();
  });

  it("offers Study and Mushaf as the mode choice", () => {
    render(<GardenHome name="Rasheed" />);
    expect(screen.getByText("Study")).toBeInTheDocument();
    expect(screen.getByText("Mushaf")).toBeInTheDocument();
  });

  it("shows the open-ended growth vine labelled by session count (never out-of-N)", () => {
    render(<GardenHome name="Rasheed" sessions={3} />);
    const vine = screen.getByRole("img", { name: /3 sessions/i });
    expect(vine).toBeInTheDocument();
    expect(vine.getAttribute("aria-label")).not.toMatch(/\//); // no "x / y"
  });

  it("falls back to the real session count from history when no sessions prop is given", async () => {
    render(<GardenHome name="Rasheed" />);
    const vine = await screen.findByRole("img", { name: /5 sessions/i });
    expect(vine).toBeInTheDocument();
  });

  it("renders the primary navigation", () => {
    render(<GardenHome name="Rasheed" />);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse" })).toBeInTheDocument();
  });

  it("Study entry links into the reader at the page Home recommends, in Study mode", async () => {
    window.localStorage.setItem(
      "wird:settings",
      JSON.stringify({ memorized: [], memorizing: [112], sessionMinutes: 5 })
    );
    render(<GardenHome name="Rasheed" />);
    const link = await screen.findByRole("link", { name: /Study/ });
    expect(link).toHaveAttribute("href", "/reader/604?mode=study"); // Al-Ikhlas
  });

  it("Mushaf entry links into the reader at the page Home recommends, in Mushaf mode", async () => {
    window.localStorage.setItem(
      "wird:settings",
      JSON.stringify({ memorized: [], memorizing: [112], sessionMinutes: 5 })
    );
    render(<GardenHome name="Rasheed" />);
    const link = await screen.findByRole("link", { name: /Mushaf/ });
    expect(link).toHaveAttribute("href", "/reader/604?mode=mushaf"); // Al-Ikhlas
  });

  it("entry cards default to page 1 when no sūrahs are set up", async () => {
    render(<GardenHome name="Rasheed" />);
    const link = await screen.findByRole("link", { name: /Study/ });
    expect(link).toHaveAttribute("href", "/reader/1?mode=study");
  });

  it("points to Settings when no sūrahs are chosen yet", () => {
    render(<GardenHome name="Rasheed" />);
    expect(screen.getByText(/Set your sūrahs/)).toBeInTheDocument();
  });

  it("derives the hero ayah from the sūrah being memorized", async () => {
    window.localStorage.setItem(
      "wird:settings",
      JSON.stringify({ memorized: [], memorizing: [112], sessionMinutes: 5 })
    );
    render(<GardenHome name="Rasheed" />);
    // Al-Ikhlās opening replaces the default Az-Zalzalah hero (assert on the
    // ASCII meaning — exact Arabic diacritic matching is brittle).
    expect(await screen.findByText(/Say He .*Allah the One/i)).toBeInTheDocument();
    expect(screen.queryByText(/When the earth is shaken/i)).not.toBeInTheDocument();
  });

  it("shows the session path hint built from the plan", async () => {
    window.localStorage.setItem(
      "wird:settings",
      JSON.stringify({ memorized: [], memorizing: [112], sessionMinutes: 5 })
    );
    render(<GardenHome name="Rasheed" />);
    expect(await screen.findByText(/Today’s path/)).toBeInTheDocument();
  });
});
