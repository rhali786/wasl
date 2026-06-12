import { render, screen } from "@testing-library/react";
import { UnknownHaze } from "../components/UnknownHaze";

describe("UnknownHaze", () => {
  it("renders the haze for a truly Unknown word (level 0)", () => {
    render(<UnknownHaze level={0} />);
    expect(screen.getByTestId("unknown-haze")).toBeInTheDocument();
  });

  it.each([1, 2, 3, 4] as const)("renders nothing once a word has any progress (level %i)", (level) => {
    render(<UnknownHaze level={level} />);
    expect(screen.queryByTestId("unknown-haze")).not.toBeInTheDocument();
  });
});
