import React from "react";
import { render } from "@testing-library/react";
import {
  Sprout,
  SPROUT_SWAY_DURATION_S,
  SPROUT_SWAY_ROTATE_DEG,
} from "../components/Sprout";

let capturedAnimate: unknown;

jest.mock("motion/react", () => ({
  useReducedMotion: () => false,
  motion: {
    g: ({ animate, children, ...rest }: any) => {
      capturedAnimate = animate;
      return (
        <g data-testid="sway-group" {...rest}>
          {children}
        </g>
      );
    },
  },
}));

describe("Sprout", () => {
  beforeEach(() => {
    capturedAnimate = undefined;
  });

  it("sways with a perceptible rotate and breathe cycle", () => {
    render(<Sprout />);
    expect(capturedAnimate).toEqual({
      rotate: [-SPROUT_SWAY_ROTATE_DEG, SPROUT_SWAY_ROTATE_DEG, -SPROUT_SWAY_ROTATE_DEG],
      scale: [0.96, 1.04, 0.96],
    });
    expect(SPROUT_SWAY_ROTATE_DEG).toBeGreaterThanOrEqual(5);
    expect(SPROUT_SWAY_DURATION_S).toBeLessThanOrEqual(7);
  });
});
