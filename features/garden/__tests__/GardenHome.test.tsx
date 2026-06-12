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
  getTotalReturns: jest.fn(() => 5),
}));

jest.mock("@/features/reader/lib/lastPage", () => ({
  readLastPage: jest.fn(() => 7),
}));

import { GardenHome } from "../GardenHome";

describe("GardenHome", () => {
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
    render(<GardenHome name="Rasheed" />);
    expect(screen.getByRole("heading", { name: /Rasheed/ })).toBeInTheDocument();
  });

  it("offers Study and Mushaf as the mode choice", () => {
    render(<GardenHome name="Rasheed" />);
    expect(screen.getByText("Study")).toBeInTheDocument();
    expect(screen.getByText("Mushaf")).toBeInTheDocument();
  });

  it("shows the open-ended growth vine labelled by return count (never out-of-N)", () => {
    render(<GardenHome name="Rasheed" returns={3} />);
    const vine = screen.getByRole("img", { name: /3 returns/i });
    expect(vine).toBeInTheDocument();
    expect(vine.getAttribute("aria-label")).not.toMatch(/\//); // no "x / y"
  });

  it("falls back to the real return count from history when no returns prop is given", async () => {
    render(<GardenHome name="Rasheed" />);
    const vine = await screen.findByRole("img", { name: /5 returns/i });
    expect(vine).toBeInTheDocument();
  });

  it("renders the primary navigation", () => {
    render(<GardenHome name="Rasheed" />);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse" })).toBeInTheDocument();
  });

  it("Study entry links into the reader at the last-visited page in Study mode", async () => {
    render(<GardenHome name="Rasheed" />);
    const link = await screen.findByRole("link", { name: /Study/ });
    expect(link).toHaveAttribute("href", "/reader/7?mode=study");
  });

  it("Mushaf entry links into the reader at the last-visited page in Mushaf mode", async () => {
    render(<GardenHome name="Rasheed" />);
    const link = await screen.findByRole("link", { name: /Mushaf/ });
    expect(link).toHaveAttribute("href", "/reader/7?mode=mushaf");
  });
});
