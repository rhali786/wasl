import { render, screen } from "@testing-library/react";
import { DailyMovement } from "../components/DailyMovement";

describe("DailyMovement", () => {
  it("renders one bar group per day", () => {
    const days = Array.from({ length: 14 }, (_, i) => ({ up: i, down: 0 }));
    render(<DailyMovement days={days} />);
    expect(screen.getAllByTestId("movement-day")).toHaveLength(14);
    expect(screen.getByText(/Last 14 days/)).toBeInTheDocument();
  });

  it("does not divide by zero when all days are empty", () => {
    const days = Array.from({ length: 14 }, () => ({ up: 0, down: 0 }));
    render(<DailyMovement days={days} />);
    expect(screen.getAllByTestId("movement-day")).toHaveLength(14);
  });
});
