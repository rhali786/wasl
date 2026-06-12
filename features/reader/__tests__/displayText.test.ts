import { stripTashkil } from "../lib/displayText";

describe("stripTashkil (Study-mode display)", () => {
  it("removes harakāt (fatḥa, kasra, ḍamma, sukūn, shadda)", () => {
    expect(stripTashkil("بِسْمِ")).toBe("بسم");
  });

  it("preserves alif variants — display only, no identity collapsing", () => {
    expect(stripTashkil("ٱللَّهِ")).toBe("ٱلله");
  });

  it("preserves alef maksūrah — display only, no identity collapsing", () => {
    expect(stripTashkil("عَلَىٰ")).toBe("على");
  });

  it("strips tatweel", () => {
    expect(stripTashkil("بِـسْمِ")).toBe("بسم");
  });

  it("strips a trailing waqf mark and the space before it", () => {
    expect(stripTashkil("شَيْءٍ ۭ")).toBe("شيء");
  });

  it("is a no-op on already-bare text", () => {
    expect(stripTashkil("بسم")).toBe("بسم");
  });
});
