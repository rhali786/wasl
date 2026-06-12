import { render, screen } from "@testing-library/react";
import { Ticks } from "../components/Ticks";

const TICK_ON = "rgb(63, 143, 92)"; // #3f8f5c

describe("Ticks (undermark)", () => {
  it("fills zero ticks at level 0 (Unknown)", () => {
    render(<Ticks level={0} />);
    const ticks = screen.getAllByTestId("tick");
    expect(ticks).toHaveLength(4);
    expect(ticks.filter((t) => t.style.background === TICK_ON)).toHaveLength(0);
  });

  it("fills two ticks at level 2 (Familiar)", () => {
    render(<Ticks level={2} />);
    const ticks = screen.getAllByTestId("tick");
    expect(ticks.filter((t) => t.style.background === TICK_ON)).toHaveLength(2);
  });

  it("fills all four ticks at level 4 (Known)", () => {
    render(<Ticks level={4} />);
    const ticks = screen.getAllByTestId("tick");
    expect(ticks.filter((t) => t.style.background === TICK_ON)).toHaveLength(4);
  });
});
