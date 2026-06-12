import { render, screen } from "@testing-library/react";
import { StatusSpread } from "../components/StatusSpread";

describe("StatusSpread", () => {
  it("renders all 5 status segments and labels with their counts", () => {
    render(<StatusSpread counts={[10, 20, 30, 40, 50]} />);
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("Known")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("formats large counts compactly", () => {
    render(<StatusSpread counts={[14697, 0, 0, 0, 0]} />);
    expect(screen.getByText("14.7k")).toBeInTheDocument();
  });

  it("renders without dividing by zero when all counts are 0", () => {
    render(<StatusSpread counts={[0, 0, 0, 0, 0]} />);
    expect(screen.getAllByText("0")).toHaveLength(5);
  });
});
