// Latin display names → Arabic script for the bilingual Garden greeting line.
// Known names use curated spellings; others get a light phonetic transliteration.

const KNOWN_NAMES: Record<string, string> = {
  rasheed: "رَشِيد",
  rashid: "رَشِيد",
  taha: "طَه",
  john: "جُون",
  muhammad: "مُحَمَّد",
  mohammad: "مُحَمَّد",
  mohammed: "مُحَمَّد",
  ahmed: "أَحْمَد",
  ahmad: "أَحْمَد",
  ali: "عَلِي",
  omar: "عُمَر",
  umar: "عُمَر",
  yusuf: "يُوسُف",
  joseph: "يُوسُف",
  ibrahim: "إِبْرَاهِيم",
  abraham: "إِبْرَاهِيم",
  maryam: "مَرْيَم",
  mary: "مَرْيَم",
  sarah: "سَارَة",
  fatima: "فَاطِمَة",
  hassan: "حَسَن",
  hussein: "حُسَيْن",
  husayn: "حُسَيْن",
  khalid: "خَالِد",
  abdullah: "عَبْدُ اللَّه",
  amin: "أَمِين",
  ameen: "أَمِين",
  noor: "نُور",
  nur: "نُور",
  layla: "لَيْلَى",
  leila: "لَيْلَى",
  zainab: "زَيْنَب",
  zeinab: "زَيْنَب",
  david: "دَاوُد",
  daniel: "دَانِيَال",
  michael: "مِيكَائِيل",
  james: "جَيْمْس",
  robert: "رُوبِرْت",
  william: "وِيلْيَام",
  elizabeth: "إِلِيزَابِيث",
  emily: "إِمِيلِي",
  sophia: "صُوفِيَا",
  alex: "أَلِكْس",
  alexander: "إِسْكَنْدَر",
  chris: "كْرِيس",
  christopher: "كْرِيسْتُوفَر",
  sam: "سَام",
  samantha: "سَامَانْثَا",
  mark: "مَارْك",
  matt: "مَات",
  matthew: "مَتَّى",
  peter: "بُطْرُس",
  paul: "بُولُس",
  anna: "آنَا",
  hannah: "حَنَّة",
  grace: "غْرَيْس",
  rachel: "رَاحِيل",
  rebecca: "رِفْقَة",
  adam: "آدَم",
  eve: "حَوَّاء",
  noah: "نُوح",
  jonah: "يُونُس",
  solomon: "سُلَيْمَان",
  moses: "مُوسَى",
  aaron: "هَارُون",
  ismail: "إِسْمَاعِيل",
  ishmael: "إِسْمَاعِيل",
};

const DIGRAPHS: readonly [string, string][] = [
  ["sh", "ش"],
  ["kh", "خ"],
  ["gh", "غ"],
  ["th", "ث"],
  ["ch", "تش"],
  ["ph", "ف"],
  ["qu", "ك"],
  ["oo", "و"],
  ["ee", "ي"],
  ["ea", "ي"],
  ["ai", "اي"],
  ["au", "او"],
  ["ou", "و"],
  ["ay", "اي"],
  ["aw", "او"],
];

const CHARS: Record<string, string> = {
  a: "ا",
  b: "ب",
  c: "ك",
  d: "د",
  e: "",
  f: "ف",
  g: "ج",
  h: "ه",
  i: "ي",
  j: "ج",
  k: "ك",
  l: "ل",
  m: "م",
  n: "ن",
  o: "و",
  p: "ب",
  q: "ق",
  r: "ر",
  s: "س",
  t: "ت",
  u: "و",
  v: "ف",
  w: "و",
  x: "كس",
  y: "ي",
  z: "ز",
  "'": "ء",
  "-": " ",
};

function lookupName(part: string): string | undefined {
  const key = part.trim().toLowerCase();
  return KNOWN_NAMES[key];
}

function transliteratePart(part: string): string {
  let latin = part.trim().toLowerCase();
  if (!latin) return part;

  let arabic = "";
  while (latin.length > 0) {
    let matched = false;
    for (const [seq, value] of DIGRAPHS) {
      if (latin.startsWith(seq)) {
        arabic += value;
        latin = latin.slice(seq.length);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const ch = latin[0]!;
    latin = latin.slice(1);
    arabic += CHARS[ch] ?? ch;
  }

  return arabic || part;
}

/** Render a Latin-script display name in Arabic for the home greeting line. */
export function toArabicName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  return trimmed
    .split(/\s+/)
    .map((part) => lookupName(part) ?? transliteratePart(part))
    .join(" ");
}
