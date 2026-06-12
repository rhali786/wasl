import { toArabicName } from "../lib/arabicName";

describe("toArabicName", () => {
  it("transliterates curated names", () => {
    expect(toArabicName("Rasheed")).toBe("رَشِيد");
    expect(toArabicName("Taha")).toBe("طَه");
    expect(toArabicName("John")).toBe("جُون");
  });

  it("is case-insensitive", () => {
    expect(toArabicName("RASHEED")).toBe("رَشِيد");
    expect(toArabicName("taha")).toBe("طَه");
  });

  it("transliterates each word in a full name", () => {
    expect(toArabicName("Rasheed Ali")).toBe("رَشِيد عَلِي");
  });

  it("phonetically transliterates unknown single names", () => {
    expect(toArabicName("Zoe")).toMatch(/[\u0600-\u06FF]/);
    expect(toArabicName("Zoe")).not.toMatch(/[A-Za-z]/);
  });
});
