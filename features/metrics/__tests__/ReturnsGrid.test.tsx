import { render, screen } from "@testing-library/react";
import { ReturnsGrid } from "../components/ReturnsGrid";

describe("ReturnsGrid", () => {
  it("renders 42 cells (6x7), marking cells that are true as filled", () => {
    const weeks = Array.from({ length: 6 }, () => Array(7).fill(false));
    weeks[5][6] = true; // today
    weeks[2][3] = true;

    render(<ReturnsGrid weeks={weeks} />);
    const cells = screen.getAllByTestId("return-cell");
    expect(cells).toHaveLength(42);

    const filled = cells.filter((cell) => cell.getAttribute("data-filled") === "true");
    expect(filled).toHaveLength(2);
  });

  it("renders all-empty cells for an empty history", () => {
    const weeks = Array.from({ length: 6 }, () => Array(7).fill(false));
    render(<ReturnsGrid weeks={weeks} />);
    const cells = screen.getAllByTestId("return-cell");
    expect(cells.every((cell) => cell.getAttribute("data-filled") === "false")).toBe(true);
  });
});
