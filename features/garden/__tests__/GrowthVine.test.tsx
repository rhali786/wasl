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
  it("renders one leaf per return, colored with the reader's TICK_ON green", () => {
    const { container } = render(<GrowthVine returns={3} />);
    const leaves = container.querySelectorAll("ellipse");
    expect(leaves).toHaveLength(3);
    leaves.forEach((leaf) => {
      expect(leaf.getAttribute("fill")).toBe(TICK_ON);
    });
  });

  it("labels the vine by return count, never as a fraction", () => {
    render(<GrowthVine returns={3} />);
    const vine = screen.getByRole("img", { name: /3 returns/i });
    expect(vine.getAttribute("aria-label")).not.toMatch(/\//);
  });

  it("renders the branch with zero leaves when returns is 0", () => {
    const { container } = render(<GrowthVine returns={0} />);
    expect(container.querySelectorAll("ellipse")).toHaveLength(0);
    expect(container.querySelector("path")).toBeInTheDocument();
  });
});
