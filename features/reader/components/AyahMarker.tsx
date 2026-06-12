// End-of-ayah marker. A small 8-pointed rosette (khātim) — the traditional
// ornament that closes an ayah in a printed mushaf — with the ayah number
// centred inside it. Drawn as SVG so the digit is centred by geometry
// (text-anchor + dominant-baseline) rather than by inline line-height, which
// is what made the plain-span version sit low and off-centre. Sized in `em`
// so it scales with the surrounding Qur'anic text.

const POINTS = 8;
const OUTER = 19;
const INNER = 12.5;
const CENTER = 20;

// 8-pointed star: 16 vertices alternating between the outer and inner radius.
const rosette = Array.from({ length: POINTS * 2 }, (_, i) => {
  const r = i % 2 === 0 ? OUTER : INNER;
  const a = (Math.PI / POINTS) * i - Math.PI / 2;
  return `${(CENTER + r * Math.cos(a)).toFixed(2)},${(CENTER + r * Math.sin(a)).toFixed(2)}`;
}).join(" ");

export function AyahMarker({ ayah }: { ayah: number }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className="mx-0.5 inline-block shrink-0 align-middle text-ayah-marker-text"
      style={{ width: "1.6em", height: "1.6em" }}
      role="img"
      aria-label={`ayah ${ayah}`}
    >
      <polygon
        points={rosette}
        fill="none"
        stroke="var(--color-ayah-marker-ring)"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <text
        x={CENTER}
        y={CENTER}
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontSize={15}
        fontWeight={600}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {ayah}
      </text>
    </svg>
  );
}
