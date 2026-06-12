import { Frame } from "../_components/Frame";
import { Reader } from "../_components/Reader";

// READER — Study / Mushaf, real Madani page data (snapshotted), real tappable
// words, tap → reveal gloss (+ Engine-B demote), faithful 15-line layout.
// Toggle the S/M badge in-page to feel the ambient (accent glow) difference.
export default function ReaderPrototype() {
  return (
    <Frame
      title="Reader · Study / Mushaf"
      tags={["Real words", "Tap to reveal"]}
      time="3:27"
      hideNav
      screenClassName="bg-[#f5efe1]"
    >
      <Reader initialMode="study" reveal="ribbon" />
    </Frame>
  );
}
