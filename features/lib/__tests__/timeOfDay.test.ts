import { moodForHour, MOOD_THEME, type Mood } from "../timeOfDay";

describe("moodForHour", () => {
  it.each<[number, Mood]>([
    [5, "morning"],
    [8, "morning"],
    [10, "morning"],
    [11, "midday"],
    [14, "midday"],
    [16, "midday"],
    [17, "evening"],
    [19, "evening"],
    [20, "night"],
    [23, "night"],
    [0, "night"],
    [4, "night"],
  ])("hour %i → %s", (hour, expected) => {
    expect(moodForHour(hour)).toBe(expected);
  });

  it("tolerates out-of-range and fractional hours", () => {
    expect(moodForHour(24)).toBe("night"); // wraps to 0
    expect(moodForHour(13.9)).toBe("midday");
    expect(moodForHour(-2)).toBe("night"); // wraps to 22
  });
});

describe("MOOD_THEME", () => {
  it("has an entry for every mood and only night is dark", () => {
    const moods: Mood[] = ["morning", "midday", "evening", "night"];
    for (const m of moods) {
      expect(MOOD_THEME[m]).toBeDefined();
      expect(MOOD_THEME[m].bg).toMatch(/^bg-/);
    }
    expect(MOOD_THEME.night.dark).toBe(true);
    expect(MOOD_THEME.morning.dark).toBe(false);
    expect(MOOD_THEME.midday.dark).toBe(false);
    expect(MOOD_THEME.evening.dark).toBe(false);
  });

  it("greeting includes the name and is repair-toned at night", () => {
    expect(MOOD_THEME.morning.greeting("Rasheed")).toContain("Rasheed");
    expect(MOOD_THEME.night.greeting("Rasheed")).toBe(
      "The words are still here, Rasheed"
    );
  });
});
