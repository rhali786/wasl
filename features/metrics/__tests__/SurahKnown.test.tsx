import { render, screen } from "@testing-library/react";
import { SurahKnown } from "../components/SurahKnown";

describe("SurahKnown", () => {
  it("renders each surah's name and rounded percent", () => {
    render(
      <SurahKnown
        items={[
          { number: 1, name: "Al-Fatihah", arabic: "الفاتحة", pct: 1 },
          { number: 2, name: "Al-Baqarah", arabic: "البقرة", pct: 0 },
        ]}
      />
    );
    expect(screen.getByText("Al-Fatihah")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
