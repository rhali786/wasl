import React from "react";
import { render, screen } from "@testing-library/react";

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

import { GrowthVine } from "../components/GrowthVine";
import { TICK_ON } from "@/features/reader/components/Ticks";

describe("GrowthVine", () => {
  it("renders one leaf per session, gradient-shaded into the reader's TICK_ON green", () => {
    const { container } = render(<GrowthVine sessions={3} />);
    const leaves = container.querySelectorAll('[data-testid="vine-leaf"]');
    expect(leaves).toHaveLength(3);
    leaves.forEach((leaf) => {
      expect(leaf.getAttribute("fill")).toMatch(/^url\(#vine-leaf-/);
    });
    const stops = container.querySelectorAll("radialGradient stop");
    expect(stops[stops.length - 1].getAttribute("stop-color")).toBe(TICK_ON);
  });

  it("labels the vine by session count, never as a fraction", () => {
    render(<GrowthVine sessions={3} />);
    const vine = screen.getByRole("img", { name: /3 sessions/i });
    expect(vine.getAttribute("aria-label")).not.toMatch(/\//);
  });

  it("renders the branch with zero leaves when sessions is 0", () => {
    const { container } = render(<GrowthVine sessions={0} />);
    expect(container.querySelectorAll('[data-testid="vine-leaf"]')).toHaveLength(0);
    expect(container.querySelector("path")).toBeInTheDocument();
  });

  it("shows a caption describing the session count", () => {
    render(<GrowthVine sessions={3} />);
    expect(screen.getByText(/3 sessions/i)).toBeInTheDocument();
  });
});
