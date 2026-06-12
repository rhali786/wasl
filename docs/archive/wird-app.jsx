import { useState, useRef, useEffect } from "react";
import { Home, BookOpen, TrendingUp, ChevronRight } from "lucide-react";

// ─── Garden palette ──────────────────────────────────────────────────────────
const G = {
  bg:         "#F0F5EE",
  surface:    "#E4EDE1",
  border:     "#C8D9C3",
  text:       "#1C2B1A",
  textSoft:   "#5A7055",
  textDim:    "#96AE90",
  green:      "#3D7A52",
  greenLight: "#6BAF7E",
  gold:       "#B8922A",
};

// ─── Study palette ───────────────────────────────────────────────────────────
const S = {
  bg:       "#15110B",
  surface:  "#1E1810",
  text:     "#F1E8D6",
  textSoft: "#D8C9AE",
  textDim:  "#6E6149",
  gold:     "#C9A24B",
  goldSoft: "#A98B45",
  border:   "rgba(241,232,214,0.08)",
};

// ─── Fog per status level (0–5) ───────────────────────────────────────────────
const FOG = [
  "rgba(201,140,60,0.19)",
  "rgba(201,140,60,0.13)",
  "rgba(201,140,60,0.08)",
  "rgba(201,140,60,0.04)",
  "transparent",
  "transparent",
];

const STATUS_NAMES = ["Unknown","Seen","Familiar","Recognized","Known","Solid"];

// ─── Al-Ikhlas corpus ────────────────────────────────────────────────────────
const SURAH = [
  { num:"١", words:[
    { id:"w1",  ar:"قُلْ",       mean:"Say",                     s:4 },
    { id:"w2",  ar:"هُوَ",       mean:"He is",                   s:5 },
    { id:"w3",  ar:"ٱللَّهُ",    mean:"Allah",                   s:4 },
    { id:"w4",  ar:"أَحَدٌ",     mean:"The One",                 s:2 },
  ]},
  { num:"٢", words:[
    { id:"w5",  ar:"ٱللَّهُ",    mean:"Allah",                   s:4 },
    { id:"w6",  ar:"ٱلصَّمَدُ",  mean:"The Eternal, Absolute",   s:0 },
  ]},
  { num:"٣", words:[
    { id:"w7",  ar:"لَمْ",       mean:"Not",                     s:3 },
    { id:"w8",  ar:"يَلِدْ",     mean:"He begets",               s:1 },
    { id:"w9",  ar:"وَلَمْ",     mean:"And not",                 s:3 },
    { id:"w10", ar:"يُولَدْ",    mean:"He is begotten",          s:0 },
  ]},
  { num:"٤", words:[
    { id:"w11", ar:"وَلَمْ",     mean:"And not",                 s:3 },
    { id:"w12", ar:"يَكُن",      mean:"There is",                s:2 },
    { id:"w13", ar:"لَّهُۥ",     mean:"To Him",                  s:4 },
    { id:"w14", ar:"كُفُوًا",    mean:"An equal",                s:0 },
    { id:"w15", ar:"أَحَدُۢ",    mean:"Any",                     s:2 },
  ]},
];

const INIT_STATUSES = Object.fromEntries(SURAH.flatMap(a => a.words.map(w => [w.id, w.s])));
const WEEKLY = [1923,1945,1962,1978,1990,2005,2021,2038,2050,2062,2075,2089];

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,   setScreen]   = useState("home");
  const [statuses, setStatuses] = useState(INIT_STATUSES);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel   = "stylesheet";
    link.href  = "https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Cormorant+Garamond:ital,wght@1,500&family=Hanken+Grotesk:wght@400;500;600&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes breathe { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-3px) scale(1.012)} }
      @keyframes fadeIn   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
    `;
    document.head.appendChild(style);
  }, []);

  const knownCount = Object.values(statuses).filter(s => s >= 4).length;
  const totalWords = Object.keys(statuses).length;
  const knownPct   = knownCount / totalWords;
  const isStudy    = screen === "reader";

  return (
    <div style={{
      maxWidth:390, margin:"0 auto",
      height:"100vh", minHeight:640,
      display:"flex", flexDirection:"column",
      overflow:"hidden", position:"relative",
      background: isStudy ? S.bg : G.bg,
      fontFamily:"'Hanken Grotesk',sans-serif",
      transition:"background 0.35s ease",
    }}>
      <div style={{ flex:1, overflow:"hidden", position:"relative" }}>
        {screen === "home"    && <HomeScreen    {...{knownCount,totalWords,knownPct,setScreen}} />}
        {screen === "reader"  && <ReaderScreen  {...{statuses,setStatuses,knownCount,totalWords,setScreen}} />}
        {screen === "metrics" && <MetricsScreen {...{knownCount,totalWords,knownPct}} />}
      </div>
      <BottomNav {...{screen,setScreen,isStudy}} />
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeScreen({ knownCount, totalWords, knownPct, setScreen }) {
  const weakCount = totalWords - knownCount;
  const h = new Date().getHours();
  const tod = h < 12 ? "after Fajr" : h < 15 ? "after Ẓuhr" : h < 18 ? "after ʿAṣr" : "after Maghrib";

  return (
    <div style={{ height:"100%", overflowY:"auto" }}>
      {/* Greeting */}
      <div style={{ padding:"22px 24px 0" }}>
        <p style={{ margin:0, fontSize:11, letterSpacing:"0.22em", textTransform:"uppercase", color:G.textDim }}>{tod}</p>
        <p style={{ margin:"4px 0 0", fontSize:22, fontWeight:600, color:G.text }}>السلام عليكم</p>
      </div>

      {/* Tree */}
      <div style={{ textAlign:"center", padding:"18px 0 10px" }}>
        <TreeSVG knownPct={knownPct} />
        <div style={{ marginTop:8, display:"flex", alignItems:"baseline", justifyContent:"center", gap:6 }}>
          <span style={{ fontSize:30, fontWeight:600, color:G.green, fontVariantNumeric:"tabular-nums" }}>
            {knownCount}
          </span>
          <span style={{ fontSize:14, color:G.textSoft }}>words known</span>
        </div>
        <p style={{ margin:"2px 0 0", fontSize:12, color:G.textDim }}>
          of {totalWords} in Al-Ikhlas ·{" "}
          <span style={{ color:G.green, fontWeight:500 }}>growing</span>
        </p>
      </div>

      {/* CTA card */}
      <div style={{ padding:"0 20px 14px" }}>
        <div onClick={() => setScreen("reader")} style={{
          background:G.green, borderRadius:20, padding:"18px 20px 20px", cursor:"pointer",
        }}>
          <p style={{ margin:0, fontSize:10, letterSpacing:"0.26em", textTransform:"uppercase", color:"rgba(255,255,255,0.6)" }}>
            NEXT · 5 MIN REVIEW
          </p>
          <p style={{ margin:"6px 0 2px", fontSize:21, fontWeight:600, color:"#fff" }}>Al-Ikhlas</p>
          <p style={{ margin:"0 0 14px", fontSize:13, color:"rgba(255,255,255,0.7)" }}>
            {weakCount} words with fog · memorized surah
          </p>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.7)" }}>Tap to begin</span>
            <div style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.18)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <ChevronRight size={16} color="#fff" />
            </div>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ padding:"0 20px 14px", display:"flex", gap:8 }}>
        {["Memorized","Current","Long Hike"].map((cat,i) => (
          <div key={cat} style={{
            padding:"7px 15px", borderRadius:30, whiteSpace:"nowrap", cursor:"pointer",
            border:`1px solid ${i===0 ? G.green : G.border}`,
            background: i===0 ? `${G.green}20` : "transparent",
            fontSize:13, fontWeight:500,
            color: i===0 ? G.green : G.textSoft,
          }}>{cat}</div>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ padding:"0 20px 14px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <StatMini label="Today's sessions" value="4" unit="visits" />
        <StatMini label="Last review" value="54" unit="min ago" />
      </div>

      {/* Surah list */}
      <div style={{ padding:"0 20px 24px" }}>
        <p style={{ margin:"0 0 10px", fontSize:10, letterSpacing:"0.22em",
          textTransform:"uppercase", color:G.textDim }}>MEMORIZED</p>
        {[
          { name:"Al-Ikhlas",   ar:"الإخلاص", pct:Math.round(knownPct*100), weak:weakCount },
          { name:"Az-Zalzalah", ar:"الزلزلة",  pct:84, weak:7 },
          { name:"Al-Fātiha",   ar:"الفاتحة", pct:91, weak:3 },
        ].map(s => <SurahRow key={s.name} {...s} onTap={() => setScreen("reader")} />)}
      </div>
    </div>
  );
}

// ─── Tree SVG ─────────────────────────────────────────────────────────────────
function TreeSVG({ knownPct }) {
  const lv = (a,b) => Math.max(0, Math.min(1, (knownPct - a) / (b - a)));
  const l = [lv(0,0.28), lv(0.2,0.45), lv(0.38,0.6), lv(0.52,0.75), lv(0.7,0.92)];
  const lc = ["#3D7A52","#4A8A5F","#558F68","#6BAF7E","#7DC08E"];
  return (
    <svg width="130" height="148" viewBox="0 0 130 148"
      style={{ animation:"breathe 6s ease-in-out infinite", transformOrigin:"65px 145px", overflow:"visible" }}>
      <ellipse cx="65" cy="144" rx="18" ry="3" fill={G.border} opacity="0.8"/>
      <path d="M65,143 C64,128 63,112 65,96 C66,86 65,76 65,65"
        stroke={G.green} strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M65,115 C54,108 40,102 28,94" stroke={G.green} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M65,115 C76,108 90,102 102,94" stroke={G.green} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M65,100 C56,92 46,86 38,79" stroke={G.green} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M65,100 C74,92 84,86 92,79" stroke={G.green} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M65,85 C60,77 57,70 56,63" stroke={G.green} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M65,85 C70,77 73,70 74,63" stroke={G.green} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="23" cy="91" r={l[0]*17} fill={lc[0]} opacity={Math.max(0.07, l[0])} style={{transition:"all 1.1s ease"}}/>
      <circle cx="107" cy="91" r={l[0]*17} fill={lc[0]} opacity={Math.max(0.07, l[0])} style={{transition:"all 1.1s ease"}}/>
      <circle cx="34" cy="76" r={l[1]*15} fill={lc[1]} opacity={l[1]} style={{transition:"all 1.1s ease"}}/>
      <circle cx="96" cy="76" r={l[1]*15} fill={lc[1]} opacity={l[1]} style={{transition:"all 1.1s ease"}}/>
      <circle cx="50" cy="62" r={l[2]*13} fill={lc[2]} opacity={l[2]} style={{transition:"all 1.1s ease"}}/>
      <circle cx="80" cy="62" r={l[2]*13} fill={lc[2]} opacity={l[2]} style={{transition:"all 1.1s ease"}}/>
      <circle cx="65" cy="54" r={l[3]*16} fill={lc[3]} opacity={l[3]} style={{transition:"all 1.1s ease"}}/>
      <circle cx="65" cy="40" r={l[4]*13} fill={lc[4]} opacity={l[4]} style={{transition:"all 1.1s ease"}}/>
    </svg>
  );
}

function StatMini({ label, value, unit }) {
  return (
    <div style={{ background:G.surface, borderRadius:14, padding:"13px 16px", border:`1px solid ${G.border}` }}>
      <p style={{ margin:0, fontSize:10, color:G.textDim, letterSpacing:"0.1em" }}>{label}</p>
      <p style={{ margin:"4px 0 0", display:"flex", alignItems:"baseline", gap:4 }}>
        <span style={{ fontSize:22, fontWeight:600, color:G.text }}>{value}</span>
        <span style={{ fontSize:12, color:G.textSoft }}>{unit}</span>
      </p>
    </div>
  );
}

function SurahRow({ name, ar, pct, weak, onTap }) {
  return (
    <div onClick={onTap} style={{
      background:G.surface, borderRadius:14, padding:"12px 16px",
      marginBottom:8, border:`1px solid ${G.border}`, cursor:"pointer",
      display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      <div>
        <p style={{ margin:0, fontSize:14, fontWeight:500, color:G.text }}>{name}</p>
        <p style={{ margin:"2px 0 0", fontSize:12, color:G.textDim }}>{weak} words with fog</p>
      </div>
      <div style={{ textAlign:"right" }}>
        <p style={{ margin:0, fontFamily:"'Amiri Quran',serif", fontSize:16, color:G.gold }}>{ar}</p>
        <p style={{ margin:"2px 0 0", fontSize:12, fontWeight:500, color:pct>85?G.green:G.textSoft }}>{pct}% known</p>
      </div>
    </div>
  );
}

// ─── Reader ───────────────────────────────────────────────────────────────────
function ReaderScreen({ statuses, setStatuses, knownCount, totalWords, setScreen }) {
  const [tooltip,  setTooltip]  = useState(null);
  const screenRef = useRef(null);
  const knownPct  = knownCount / totalWords;

  const handleWordTap = (e, word) => {
    e.stopPropagation();
    const rect  = e.currentTarget.getBoundingClientRect();
    const sRect = screenRef.current.getBoundingClientRect();
    const x = rect.left - sRect.left + rect.width  / 2;
    const y = rect.top  - sRect.top  + rect.height / 2;
    const originalStatus = statuses[word.id];
    setStatuses(prev => ({ ...prev, [word.id]: Math.max(0, prev[word.id] - 1) }));
    setTooltip({ wordId:word.id, ar:word.ar, mean:word.mean, originalStatus, x, y });
  };

  const handleIKnewIt = (e) => {
    e.stopPropagation();
    if (!tooltip) return;
    const next = tooltip.originalStatus <= 3 ? 4 : 5;
    setStatuses(prev => ({ ...prev, [tooltip.wordId]: next }));
    setTooltip(null);
  };

  const TW = 226, TH = 138;
  let tipX = 16, tipY = 80;
  if (tooltip) {
    tipX = Math.max(8, Math.min(tooltip.x - TW / 2, 382 - TW));
    tipY = (tooltip.y - TH - 16 < 72) ? tooltip.y + 20 : tooltip.y - TH - 16;
  }

  return (
    <div ref={screenRef} onClick={() => setTooltip(null)}
      style={{ height:"100%", display:"flex", flexDirection:"column", background:S.bg, position:"relative" }}>

      {/* Header */}
      <div style={{ padding:"18px 22px 10px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <span onClick={() => setScreen("home")}
            style={{ color:S.textDim, fontSize:26, cursor:"pointer", lineHeight:1, padding:"0 4px" }}>‹</span>
          <span style={{ fontSize:12, letterSpacing:"0.2em", textTransform:"uppercase", color:S.textSoft }}>
            Al-Ikhlas · 112
          </span>
          <span style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase",
            color:S.gold, border:`1px solid rgba(201,162,75,0.3)`, borderRadius:20, padding:"4px 10px" }}>
            Review
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height:2, background:S.border, borderRadius:2, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${Math.round(knownPct*100)}%`,
            background:S.gold, borderRadius:2, transition:"width 0.55s ease" }}/>
        </div>
        <div style={{ marginTop:6, display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:S.textDim }}>KNOWN</span>
          <span style={{ fontSize:12, color:S.textSoft, fontVariantNumeric:"tabular-nums" }}>
            <span style={{ color:S.gold, fontWeight:600 }}>{knownCount}</span> / {totalWords}
          </span>
        </div>
      </div>

      {/* Arabic text */}
      <div style={{ flex:1, overflowY:"auto", padding:"4px 26px 100px" }}>
        <div style={{ textAlign:"center", direction:"rtl", fontFamily:"'Amiri Quran',serif",
          color:S.goldSoft, fontSize:"1.22rem", opacity:0.62, margin:"6px 0 22px", lineHeight:2 }}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>

        {SURAH.map(ayah => (
          <div key={ayah.num} style={{
            direction:"rtl", textAlign:"center",
            fontFamily:"'Amiri Quran',serif",
            lineHeight:2.9, marginBottom:10, fontSize:"1.95rem",
          }}>
            {ayah.words.map(word => {
              const s = statuses[word.id] ?? word.s;
              const isActive = tooltip?.wordId === word.id;
              return (
                <span key={word.id}
                  onClick={e => handleWordTap(e, word)}
                  style={{
                    display:"inline-block", cursor:"pointer",
                    padding:"0.04em 0.12em", borderRadius:"0.45em", margin:"0 0.03em",
                    background: FOG[Math.min(s, 5)],
                    borderBottom: s===0 ? "1.5px dotted rgba(201,140,60,0.5)" : "1.5px solid transparent",
                    outline: isActive ? `1.5px solid ${S.gold}` : "none",
                    outlineOffset:"3px",
                    color: s >= 4 ? S.text : S.textSoft,
                    textShadow: s >= 4 ? "0 0 14px rgba(241,232,214,0.16)" : "none",
                    transition:"background 0.48s ease, color 0.3s ease, text-shadow 0.5s ease",
                  }}>
                  {word.ar}
                </span>
              );
            })}
            {/* Ayah marker */}
            <span style={{
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              fontFamily:"'Hanken Grotesk',sans-serif", fontSize:"0.5em", color:S.gold,
              border:`1px solid rgba(201,162,75,0.38)`, borderRadius:"50%",
              width:"1.95em", height:"1.95em", margin:"0 0.28em", verticalAlign:"0.22em",
            }}>{ayah.num}</span>
          </div>
        ))}

        <p style={{ textAlign:"center", fontSize:12, color:S.textDim, letterSpacing:"0.04em",
          marginTop:16, opacity:tooltip?0:1, transition:"opacity 0.3s" }}>
          Tap words you don't know
        </p>
      </div>

      {/* Floating tooltip — hovers above/below the tapped word */}
      {tooltip && (
        <div onClick={e => e.stopPropagation()} style={{
          position:"absolute", left:tipX, top:tipY,
          width:TW, zIndex:30,
          background:S.surface,
          border:"1px solid rgba(201,162,75,0.28)",
          borderRadius:18, padding:"14px 18px",
          boxShadow:"0 10px 36px rgba(0,0,0,0.55)",
          animation:"fadeIn 0.2s ease",
        }}>
          {/* Arabic word */}
          <div style={{ textAlign:"center", fontFamily:"'Amiri Quran',serif",
            fontSize:"2.3rem", color:S.text, direction:"rtl", lineHeight:1.6, marginBottom:2 }}>
            {tooltip.ar}
          </div>
          {/* Contextual meaning */}
          <div style={{ textAlign:"center", fontFamily:"'Cormorant Garamond',serif",
            fontStyle:"italic", fontSize:"1.18rem", color:S.textSoft,
            lineHeight:1.35, marginBottom:12 }}>
            {tooltip.mean}
          </div>
          {/* Status + action */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:10, color:S.textDim, letterSpacing:"0.08em", whiteSpace:"nowrap" }}>
              {STATUS_NAMES[Math.min(tooltip.originalStatus, 5)]}
            </span>
            <button onClick={handleIKnewIt} style={{
              flex:1, padding:"9px 0", cursor:"pointer",
              background:"transparent", border:`1px solid ${S.gold}`,
              borderRadius:30, color:S.gold, fontSize:12, fontWeight:600,
              fontFamily:"'Hanken Grotesk',sans-serif", letterSpacing:"0.05em",
            }}>
              I knew it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Metrics ──────────────────────────────────────────────────────────────────
function MetricsScreen({ knownCount, totalWords, knownPct }) {
  const gain = WEEKLY[WEEKLY.length-1] - WEEKLY[0];
  return (
    <div style={{ height:"100%", overflowY:"auto", background:G.bg }}>
      <div style={{ padding:"22px 24px 0" }}>
        <p style={{ margin:0, fontSize:11, letterSpacing:"0.22em", textTransform:"uppercase", color:G.textDim }}>
          PROGRESS
        </p>
        <h2 style={{ margin:"4px 0 0", fontSize:22, fontWeight:600, color:G.text }}>12-Week Review</h2>
      </div>

      {/* Chart card */}
      <div style={{ margin:"16px 20px 0", background:G.surface,
        borderRadius:18, border:`1px solid ${G.border}`, padding:"18px 18px 14px" }}>
        <p style={{ margin:"0 0 4px", fontSize:10, letterSpacing:"0.22em",
          textTransform:"uppercase", color:G.textDim }}>KNOWN WORDS</p>
        <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:14 }}>
          <span style={{ fontSize:32, fontWeight:600, color:G.green, fontVariantNumeric:"tabular-nums" }}>
            {WEEKLY[WEEKLY.length-1].toLocaleString()}
          </span>
          <span style={{ fontSize:13, color:G.textSoft }}>+{gain} this period</span>
        </div>
        <KnownChart />
      </div>

      {/* Stat grid */}
      <div style={{ padding:"14px 20px 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <StatCard label="Sessions today" value="4"  color={G.green}/>
        <StatCard label="This week"      value="21" color={G.green}/>
        <StatCard label="Promoted"       value="+9" color={G.green}/>
        <StatCard label="Net movement"   value="+7" color={G.gold}/>
      </div>

      {/* Surah coverage */}
      <div style={{ padding:"16px 20px 24px" }}>
        <p style={{ margin:"0 0 12px", fontSize:10, letterSpacing:"0.22em",
          textTransform:"uppercase", color:G.textDim }}>SURAH COVERAGE</p>
        {[
          { name:"Al-Ikhlas",    pct:Math.round(knownPct*100), cat:"Memorized" },
          { name:"Az-Zalzalah",  pct:84,  cat:"Memorized" },
          { name:"Al-Ghāshiyah",pct:72,  cat:"Current"   },
          { name:"Al-Mulk",      pct:44,  cat:"Long Hike" },
          { name:"Yusuf",        pct:38,  cat:"Long Hike" },
        ].map(s => <SurahBar key={s.name} {...s} />)}
      </div>
    </div>
  );
}

function KnownChart() {
  const min = Math.min(...WEEKLY), max = Math.max(...WEEKLY);
  const range = max - min || 1;
  const H = 58, W = 320, bw = Math.floor(W / WEEKLY.length) - 3;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H+18}`} style={{ overflow:"visible" }}>
      {WEEKLY.map((v,i) => {
        const h = ((v-min)/range)*(H*0.8) + H*0.12;
        const isLast = i === WEEKLY.length - 1;
        return (
          <rect key={i} x={i*(W/WEEKLY.length)+1} y={H-h} width={bw} height={h} rx="3"
            fill={isLast ? G.green : G.greenLight}
            opacity={isLast ? 1 : 0.28 + (i/WEEKLY.length)*0.55}/>
        );
      })}
      <text x="1"    y={H+14} fontSize="10" fill={G.textDim} fontFamily="Hanken Grotesk,sans-serif">Wk 1</text>
      <text x={W-22} y={H+14} fontSize="10" fill={G.textDim} fontFamily="Hanken Grotesk,sans-serif">Now</text>
    </svg>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background:G.surface, borderRadius:14, padding:"13px 16px", border:`1px solid ${G.border}` }}>
      <p style={{ margin:0, fontSize:10, color:G.textDim, letterSpacing:"0.1em" }}>{label}</p>
      <p style={{ margin:"4px 0 0", fontSize:26, fontWeight:600, color, fontVariantNumeric:"tabular-nums" }}>{value}</p>
    </div>
  );
}

function SurahBar({ name, pct, cat }) {
  const cc = { Memorized:G.green, Current:G.gold, "Long Hike":G.textSoft };
  const bc = pct>=85 ? G.green : pct>=50 ? G.greenLight : G.gold;
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <span style={{ fontSize:14, fontWeight:500, color:G.text }}>{name}</span>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:10, letterSpacing:"0.1em", color:cc[cat]??G.textDim }}>{cat}</span>
          <span style={{ fontSize:13, fontWeight:600, color:bc }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height:4, background:G.border, borderRadius:4 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:bc, borderRadius:4, transition:"width 0.6s ease" }}/>
      </div>
    </div>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
function BottomNav({ screen, setScreen, isStudy }) {
  const bg     = isStudy ? S.surface : G.surface;
  const border = isStudy ? `1px solid ${S.border}` : `1px solid ${G.border}`;
  const active = isStudy ? S.gold    : G.green;
  const dim    = isStudy ? S.textDim : G.textDim;

  return (
    <div style={{ background:bg, borderTop:border, display:"flex", padding:"8px 0 14px", flexShrink:0 }}>
      {[
        { id:"home",    label:"Garden",   Icon:Home       },
        { id:"reader",  label:"Review",   Icon:BookOpen   },
        { id:"metrics", label:"Progress", Icon:TrendingUp },
      ].map(({ id, label, Icon }) => {
        const on = screen === id;
        return (
          <button key={id} onClick={() => setScreen(id)} style={{
            flex:1, background:"none", border:"none", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"4px 0",
          }}>
            <Icon size={20} color={on ? active : dim} strokeWidth={on ? 2 : 1.5}/>
            <span style={{
              fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase",
              color: on ? active : dim, fontWeight: on ? 600 : 400,
              fontFamily:"'Hanken Grotesk',sans-serif",
            }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
