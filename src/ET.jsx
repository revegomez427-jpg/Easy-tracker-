// ET — El búho mascota de Easy Tracker
// Estados: "happy" | "sleepy" | "coffee" | "sweat" | "cool" | "cry"

export default function ET({ size = 80, mood = "happy", animate = true }) {
  const s = size;
  const id = `et_${mood}_${Math.random().toString(36).slice(2,7)}`;

  // Shared keyframes injected once
  const css = `
    @keyframes et_blink {
      0%,90%,100% { transform: scaleY(1); }
      95% { transform: scaleY(0.08); }
    }
    @keyframes et_zzz {
      0%   { opacity:0; transform: translate(0px, 0px) scale(0.6); }
      30%  { opacity:1; }
      100% { opacity:0; transform: translate(14px,-18px) scale(1.1); }
    }
    @keyframes et_zzz2 {
      0%   { opacity:0; transform: translate(0px, 0px) scale(0.5); }
      20%  { opacity:0; }
      60%  { opacity:1; }
      100% { opacity:0; transform: translate(18px,-22px) scale(1.2); }
    }
    @keyframes et_steam {
      0%   { opacity:0.7; transform: translateY(0) scaleX(1); }
      100% { opacity:0; transform: translateY(-10px) scaleX(1.4); }
    }
    @keyframes et_sweat {
      0%   { opacity:1; transform: translateY(0); }
      100% { opacity:0; transform: translateY(12px); }
    }
    @keyframes et_tear {
      0%   { opacity:1; transform: translateY(0); }
      100% { opacity:0.2; transform: translateY(16px); }
    }
    @keyframes et_bounce {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(-3px); }
    }
    @keyframes et_shake {
      0%,100% { transform: rotate(0deg); }
      25%     { transform: rotate(-4deg); }
      75%     { transform: rotate(4deg); }
    }
    @keyframes et_tilt {
      0%,100% { transform: rotate(-12deg); }
      50%     { transform: rotate(-16deg); }
    }
    @keyframes et_pulse {
      0%,100% { transform: scale(1); }
      50%     { transform: scale(1.03); }
    }
  `;

  // Colors
  const body    = "#E8913A";
  const belly   = "#FFF3DC";
  const dark    = "#7A3B10";
  const beak    = "#FF8C00";
  const eyeW    = "#FFFFFF";
  const pupil   = "#1A0A00";
  const lime    = "#c8f135";
  const cream   = "#F5C98A";

  // Base body — shared across all moods
  function Body({ tiltAnim }) {
    return (
      <g style={tiltAnim ? { animation:`et_tilt 2s ease-in-out infinite`, transformOrigin:"50% 60%" } : {}}>
        {/* Shadow */}
        <ellipse cx={s*.5} cy={s*.93} rx={s*.28} ry={s*.05} fill="rgba(0,0,0,0.18)"/>
        {/* Body */}
        <ellipse cx={s*.5} cy={s*.62} rx={s*.34} ry={s*.36} fill={body}/>
        {/* Belly */}
        <ellipse cx={s*.5} cy={s*.68} rx={s*.2} ry={s*.24} fill={belly}/>
        {/* Wing left */}
        <ellipse cx={s*.19} cy={s*.65} rx={s*.1} ry={s*.18} fill={dark} transform={`rotate(-15,${s*.19},${s*.65})`}/>
        {/* Wing right */}
        <ellipse cx={s*.81} cy={s*.65} rx={s*.1} ry={s*.18} fill={dark} transform={`rotate(15,${s*.81},${s*.65})`}/>
        {/* Ear tufts */}
        <polygon points={`${s*.34},${s*.25} ${s*.28},${s*.08} ${s*.42},${s*.2}`} fill={dark}/>
        <polygon points={`${s*.66},${s*.25} ${s*.72},${s*.08} ${s*.58},${s*.2}`} fill={dark}/>
        {/* Head */}
        <circle cx={s*.5} cy={s*.34} r={s*.27} fill={body}/>
        {/* Face plate */}
        <ellipse cx={s*.5} cy={s*.36} rx={s*.2} ry={s*.18} fill={cream} opacity=".6"/>
        {/* Feet */}
        <ellipse cx={s*.38} cy={s*.92} rx={s*.08} ry={s*.04} fill={dark}/>
        <ellipse cx={s*.62} cy={s*.92} rx={s*.08} ry={s*.04} fill={dark}/>
        {/* Beak */}
        <polygon points={`${s*.44},${s*.41} ${s*.56},${s*.41} ${s*.5},${s*.49}`} fill={beak}/>
      </g>
    );
  }

  // ── HAPPY ──────────────────────────────────────────
  if (mood === "happy") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`et_bounce 2.4s ease-in-out infinite`}}>
        <Body/>
        {/* Eyes with blink */}
        <g style={{animation:`et_blink 3s ease-in-out infinite`, transformOrigin:`${s*.35}px ${s*.31}px`}}>
          <circle cx={s*.35} cy={s*.31} r={s*.1} fill={eyeW}/>
          <circle cx={s*.35} cy={s*.33} r={s*.055} fill={pupil}/>
          <circle cx={s*.32} cy={s*.29} r={s*.022} fill={eyeW}/>
        </g>
        <g style={{animation:`et_blink 3s ease-in-out infinite`, transformOrigin:`${s*.65}px ${s*.31}px`}}>
          <circle cx={s*.65} cy={s*.31} r={s*.1} fill={eyeW}/>
          <circle cx={s*.65} cy={s*.33} r={s*.055} fill={pupil}/>
          <circle cx={s*.62} cy={s*.29} r={s*.022} fill={eyeW}/>
        </g>
        {/* Eyebrows happy */}
        <path d={`M${s*.27},${s*.21} Q${s*.35},${s*.17} ${s*.43},${s*.21}`} stroke={dark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.57},${s*.21} Q${s*.65},${s*.17} ${s*.73},${s*.21}`} stroke={dark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        {/* Smile */}
        <path d={`M${s*.41},${s*.51} Q${s*.5},${s*.57} ${s*.59},${s*.51}`} stroke={dark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
        {/* Lime accent dots */}
        <circle cx={s*.22} cy={s*.45} r={s*.03} fill={lime} opacity=".7"/>
        <circle cx={s*.78} cy={s*.45} r={s*.03} fill={lime} opacity=".7"/>
      </g>
    </svg>
  );

  // ── SLEEPY ─────────────────────────────────────────
  if (mood === "sleepy") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <Body tiltAnim/>
      {/* Half-closed eyes */}
      <circle cx={s*.35} cy={s*.31} r={s*.1} fill={eyeW}/>
      <rect x={s*.25} y={s*.22} width={s*.2} height={s*.11} fill={body} rx={s*.03}/>
      <circle cx={s*.65} cy={s*.31} r={s*.1} fill={eyeW}/>
      <rect x={s*.55} y={s*.22} width={s*.2} height={s*.11} fill={body} rx={s*.03}/>
      {/* Droopy brows */}
      <path d={`M${s*.27},${s*.24} Q${s*.35},${s*.26} ${s*.43},${s*.22}`} stroke={dark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
      <path d={`M${s*.57},${s*.22} Q${s*.65},${s*.26} ${s*.73},${s*.24}`} stroke={dark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
      {/* Zzz */}
      <text x={s*.68} y={s*.18} fontSize={s*.12} fill={lime} fontWeight="900"
        style={{animation:`et_zzz 2s ease-in-out infinite`}}>z</text>
      <text x={s*.76} y={s*.1} fontSize={s*.16} fill={lime} fontWeight="900"
        style={{animation:`et_zzz2 2s ease-in-out infinite`}}>Z</text>
    </svg>
  );

  // ── COFFEE ─────────────────────────────────────────
  if (mood === "coffee") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`et_pulse 1.8s ease-in-out infinite`}}>
        <Body/>
        {/* Alert eyes */}
        <circle cx={s*.35} cy={s*.31} r={s*.11} fill={eyeW}/>
        <circle cx={s*.35} cy={s*.32} r={s*.062} fill={pupil}/>
        <circle cx={s*.32} cy={s*.28} r={s*.024} fill={eyeW}/>
        <circle cx={s*.65} cy={s*.31} r={s*.11} fill={eyeW}/>
        <circle cx={s*.65} cy={s*.32} r={s*.062} fill={pupil}/>
        <circle cx={s*.62} cy={s*.28} r={s*.024} fill={eyeW}/>
        {/* Raised brows */}
        <path d={`M${s*.27},${s*.18} Q${s*.35},${s*.14} ${s*.43},${s*.18}`} stroke={dark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.57},${s*.18} Q${s*.65},${s*.14} ${s*.73},${s*.18}`} stroke={dark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        {/* Coffee cup */}
        <rect x={s*.58} y={s*.68} width={s*.22} height={s*.16} rx={s*.03} fill="#6B3A2A"/>
        <rect x={s*.58} y={s*.68} width={s*.22} height={s*.05} rx={s*.02} fill="#8B5A3A"/>
        <path d={`M${s*.8},${s*.72} Q${s*.86},${s*.72} ${s*.86},${s*.78} Q${s*.86},${s*.84} ${s*.8},${s*.84}`} stroke="#6B3A2A" strokeWidth={s*.025} fill="none"/>
        {/* Steam */}
        <path d={`M${s*.65},${s*.65} Q${s*.68},${s*.6} ${s*.65},${s*.55}`} stroke="#FFF3DC" strokeWidth={s*.02} fill="none" strokeLinecap="round"
          style={{animation:`et_steam 1.2s ease-out infinite`}}/>
        <path d={`M${s*.72},${s*.65} Q${s*.75},${s*.58} ${s*.72},${s*.52}`} stroke="#FFF3DC" strokeWidth={s*.02} fill="none" strokeLinecap="round"
          style={{animation:`et_steam 1.2s ease-out infinite 0.4s`}}/>
        {/* Smile */}
        <path d={`M${s*.41},${s*.51} Q${s*.5},${s*.58} ${s*.59},${s*.51}`} stroke={dark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );

  // ── SWEAT ──────────────────────────────────────────
  if (mood === "sweat") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`et_shake 0.5s ease-in-out infinite`}}>
        <Body/>
        {/* Wide eyes */}
        <circle cx={s*.35} cy={s*.3} r={s*.12} fill={eyeW}/>
        <circle cx={s*.35} cy={s*.31} r={s*.07} fill={pupil}/>
        <circle cx={s*.31} cy={s*.27} r={s*.028} fill={eyeW}/>
        <circle cx={s*.65} cy={s*.3} r={s*.12} fill={eyeW}/>
        <circle cx={s*.65} cy={s*.31} r={s*.07} fill={pupil}/>
        <circle cx={s*.61} cy={s*.27} r={s*.028} fill={eyeW}/>
        {/* Worried brows */}
        <path d={`M${s*.27},${s*.17} Q${s*.35},${s*.21} ${s*.43},${s*.17}`} stroke={dark} strokeWidth={s*.03} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.57},${s*.17} Q${s*.65},${s*.21} ${s*.73},${s*.17}`} stroke={dark} strokeWidth={s*.03} fill="none" strokeLinecap="round"/>
        {/* Sweat drops */}
        <ellipse cx={s*.18} cy={s*.28} rx={s*.025} ry={s*.04} fill="#7EC8E3"
          style={{animation:`et_sweat 1s ease-in infinite`}}/>
        <ellipse cx={s*.82} cy={s*.25} rx={s*.02} ry={s*.033} fill="#7EC8E3"
          style={{animation:`et_sweat 1s ease-in infinite 0.3s`}}/>
        <ellipse cx={s*.14} cy={s*.4} rx={s*.018} ry={s*.03} fill="#7EC8E3"
          style={{animation:`et_sweat 1s ease-in infinite 0.6s`}}/>
        {/* Nervous mouth */}
        <path d={`M${s*.42},${s*.52} Q${s*.46},${s*.49} ${s*.5},${s*.52} Q${s*.54},${s*.55} ${s*.58},${s*.52}`} stroke={dark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );

  // ── COOL ───────────────────────────────────────────
  if (mood === "cool") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`et_bounce 3s ease-in-out infinite`}}>
        <Body/>
        {/* Sunglasses */}
        <rect x={s*.22} y={s*.24} width={s*.22} height={s*.14} rx={s*.06} fill={lime}/>
        <rect x={s*.56} y={s*.24} width={s*.22} height={s*.14} rx={s*.06} fill={lime}/>
        <line x1={s*.44} y1={s*.3} x2={s*.56} y2={s*.3} stroke={dark} strokeWidth={s*.022}/>
        <line x1={s*.22} y1={s*.3} x2={s*.16} y2={s*.28} stroke={dark} strokeWidth={s*.022}/>
        <line x1={s*.78} y1={s*.3} x2={s*.84} y2={s*.28} stroke={dark} strokeWidth={s*.022}/>
        {/* Eyes behind glasses */}
        <circle cx={s*.33} cy={s*.31} r={s*.055} fill={pupil} opacity=".4"/>
        <circle cx={s*.67} cy={s*.31} r={s*.055} fill={pupil} opacity=".4"/>
        {/* Smug brows */}
        <path d={`M${s*.27},${s*.2} Q${s*.35},${s*.17} ${s*.43},${s*.2}`} stroke={dark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.57},${s*.2} Q${s*.65},${s*.17} ${s*.73},${s*.2}`} stroke={dark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        {/* Cool smile */}
        <path d={`M${s*.39},${s*.51} Q${s*.5},${s*.6} ${s*.61},${s*.51}`} stroke={dark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        {/* Star sparkles */}
        <text x={s*.08} y={s*.22} fontSize={s*.14} style={{animation:`et_zzz 1.5s ease-in-out infinite`}}>⭐</text>
        <text x={s*.76} y={s*.18} fontSize={s*.1} style={{animation:`et_zzz 1.5s ease-in-out infinite 0.5s`}}>✨</text>
      </g>
    </svg>
  );

  // ── CRY ────────────────────────────────────────────
  if (mood === "cry") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <Body/>
      {/* Sad eyes — arched down */}
      <circle cx={s*.35} cy={s*.32} r={s*.1} fill={eyeW}/>
      <circle cx={s*.35} cy={s*.34} r={s*.055} fill={pupil}/>
      <circle cx={s*.32} cy={s*.3} r={s*.022} fill={eyeW}/>
      <circle cx={s*.65} cy={s*.32} r={s*.1} fill={eyeW}/>
      <circle cx={s*.65} cy={s*.34} r={s*.055} fill={pupil}/>
      <circle cx={s*.62} cy={s*.3} r={s*.022} fill={eyeW}/>
      {/* Sad brows — inner corners raised */}
      <path d={`M${s*.27},${s*.22} Q${s*.35},${s*.18} ${s*.43},${s*.22}`} stroke={dark} strokeWidth={s*.028} fill="none" strokeLinecap="round"
        style={{transform:`rotate(8deg)`,transformOrigin:`${s*.35}px ${s*.22}px`}}/>
      <path d={`M${s*.57},${s*.22} Q${s*.65},${s*.18} ${s*.73},${s*.22}`} stroke={dark} strokeWidth={s*.028} fill="none" strokeLinecap="round"
        style={{transform:`rotate(-8deg)`,transformOrigin:`${s*.65}px ${s*.22}px`}}/>
      {/* Tears */}
      <ellipse cx={s*.31} cy={s*.44} rx={s*.022} ry={s*.055} fill="#7EC8E3"
        style={{animation:`et_tear 1s ease-in infinite`}}/>
      <ellipse cx={s*.69} cy={s*.44} rx={s*.022} ry={s*.055} fill="#7EC8E3"
        style={{animation:`et_tear 1s ease-in infinite 0.35s`}}/>
      <ellipse cx={s*.28} cy={s*.54} rx={s*.018} ry={s*.04} fill="#7EC8E3"
        style={{animation:`et_tear 1s ease-in infinite 0.5s`}}/>
      <ellipse cx={s*.72} cy={s*.54} rx={s*.018} ry={s*.04} fill="#7EC8E3"
        style={{animation:`et_tear 1s ease-in infinite 0.7s`}}/>
      {/* Sad mouth */}
      <path d={`M${s*.41},${s*.55} Q${s*.5},${s*.5} ${s*.59},${s*.55}`} stroke={dark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
    </svg>
  );

  return null;
}
