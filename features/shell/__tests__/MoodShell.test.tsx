import React from "react";
import { render, screen, act } from "@testing-library/react";
import { MoodShell } from "../components/MoodShell";
import { useMood } from "../components/MoodContext";

// A probe that surfaces the current mood from context for assertions.
function MoodProbe() {
  const mood = useMood();
  return <span data-testid="mood">{mood}</span>;
}

describe("MoodShell", () => {
  it("renders its children", () => {
    render(
      <MoodShell>
        <p>hello garden</p>
      </MoodShell>
    );
    expect(screen.getByText("hello garden")).toBeInTheDocument();
  });

  it("starts mood-neutral (midday) so SSR and first paint never mismatch", () => {
    // Before effects flush we still expect a defined, non-dark mood.
    render(
      <MoodShell>
        <MoodProbe />
      </MoodShell>
    );
    // After mount it resolves to the local hour; midday is the neutral default
    // and also the value for the faked daytime clock below.
    expect(screen.getByTestId("mood").textContent).toMatch(
      /morning|midday|evening|night/
    );
  });

  it("applies the night theme (dark class) after mount when it is night", () => {
    // Freeze the local clock at 22:00 → night.
    const spy = jest.spyOn(Date.prototype, "getHours").mockReturnValue(22);

    let container!: HTMLElement;
    act(() => {
      ({ container } = render(
        <MoodShell>
          <MoodProbe />
        </MoodShell>
      ));
    });

    expect(screen.getByTestId("mood").textContent).toBe("night");
    expect(container.querySelector(".dark")).not.toBeNull();

    spy.mockRestore();
  });
});
