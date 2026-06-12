import { toArabicName } from "../lib/arabicName";
import { GARDEN_GREETINGS, greetingsForMood, pickGreeting } from "../lib/greetings";

describe("garden greetings", () => {
  it("defines 15 English–Arabic pairs", () => {
    expect(GARDEN_GREETINGS).toHaveLength(15);
    for (const g of GARDEN_GREETINGS) {
      expect(g.english("Rasheed")).toContain("Rasheed");
      const arabicLine = g.arabic(toArabicName("Rasheed"));
      expect(arabicLine).toContain("رَشِيد");
      expect(arabicLine).not.toMatch(/Rasheed/i);
      expect(arabicLine).toMatch(/[\u0600-\u06FF]/);
    }
  });

  it("pickGreeting returns a stable pair when given an index", () => {
    expect(pickGreeting("morning", 0).english("A")).toBe("Good morning, A");
    expect(pickGreeting("morning", 0).arabic(toArabicName("A"))).toContain("صَبَاحُ");
    const pool = greetingsForMood("midday");
    expect(pickGreeting("midday", 99).english("B")).toBe(
      pickGreeting("midday", 99 % pool.length).english("B")
    );
  });

  it("never picks a time-of-day greeting that mismatches the mood", () => {
    const samples = 80;
    for (let i = 0; i < samples; i++) {
      const morning = pickGreeting("morning").english("X");
      expect(morning).not.toMatch(/evening/i);
      expect(morning).not.toMatch(/words are still here/i);

      const evening = pickGreeting("evening").english("X");
      expect(evening).not.toMatch(/Good morning/i);

      const night = pickGreeting("night").english("X");
      expect(night).not.toMatch(/Good morning/i);
      expect(night).not.toMatch(/Good evening/i);

      const midday = pickGreeting("midday").english("X");
      expect(midday).not.toMatch(/Good morning/i);
      expect(midday).not.toMatch(/Good evening/i);
      expect(midday).not.toMatch(/words are still here/i);
    }
  });
});
