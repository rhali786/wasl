import { normalize } from "../lib/normalize";

describe("normalize", () => {
  it("strips tashkīl (harakāt) from a word", () => {
    expect(normalize("قُلْ")).toBe("قل");
  });

  it("collapses قُلْ to the same id across surahs (Ikhlāṣ, Falaq, Kāfirūn)", () => {
    const ikhlas = normalize("قُلْ"); // 112:1
    const falaq = normalize("قُلْ"); // 113:1
    const kafirun = normalize("قُلْ"); // 109:1
    expect(ikhlas).toBe("قل");
    expect(falaq).toBe("قل");
    expect(kafirun).toBe("قل");
  });

  it("unifies alif-with-hamza/madda and alif waṣla forms to plain alif", () => {
    expect(normalize("ٱللَّهُ")).toBe("الله");
    expect(normalize("اللَّهُ")).toBe("الله");
    expect(normalize("أَنتُمْ").startsWith("ا")).toBe(true);
    expect(normalize("إِنَّ")).toBe("ان");
    expect(normalize("آمَنُوا۟")).toBe("امنوا");
  });

  it("unifies alef maksūrah (ى) with yāʾ (ي)", () => {
    expect(normalize("عَلَىٰ")).toBe("علي");
  });

  it("strips trailing waqf marks and the space before them", () => {
    expect(normalize("كَثُرَ ۚ")).toBe("كثر");
    expect(normalize("نَارًۭا ۖ")).toBe("نارا");
  });

  it("strips a leading rubʿ-el-ḥizb mark and following space", () => {
    expect(normalize("۞ وَلَكُمْ")).toBe("ولكم");
  });

  it("strips tatweel", () => {
    expect(normalize("ٱلْيَتَـٰمَىٰ")).toBe(normalize("ٱلْيَتَٰمَىٰ"));
  });

  it("is idempotent", () => {
    const once = normalize("وَٱلْأَقْرَبُونَ");
    expect(normalize(once)).toBe(once);
  });

  it("keeps distinct words distinct", () => {
    expect(normalize("كَثُرَ")).not.toBe(normalize("قَلَّ"));
    expect(normalize("نَصِيبٌۭ")).not.toBe(normalize("نَصِيبًۭا"));
  });

  it("leaves end-of-ayah numeral markers unchanged", () => {
    expect(normalize("٧")).toBe("٧");
  });
});
