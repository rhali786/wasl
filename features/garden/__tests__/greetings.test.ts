import { toArabicName } from "../lib/arabicName";
import { GARDEN_GREETINGS, pickGreeting } from "../lib/greetings";

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
    expect(pickGreeting(0).english("A")).toBe("Good morning, A");
    expect(pickGreeting(0).arabic(toArabicName("A"))).toContain("صَبَاحُ");
    expect(pickGreeting(99).english("B")).toBe(pickGreeting(99 % 15).english("B"));
  });
});
