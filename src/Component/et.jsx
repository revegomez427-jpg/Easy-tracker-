
// ET — Mascota de Easy Tracker
// Rediseñado estilo caricatura moderna (referencia búho verde)
// Estados: "happy" | "sleepy" | "coffee" | "sweat" | "cool" | "cry"

export default function ET({ size = 80, mood = "happy" }) {
  const s = size;
  const id = `et_${mood}_${Math.random().toString(36).slice(2,6)}`;

  const css = `
    @keyframes ${id}_bounce {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-4px); }
    }
    @keyframes ${id}_blink {
      0%,88%,100% { transform: scaleY(1); }
      93%         { transform: scaleY(0.05); }
    }
    @keyframes ${id}_zzz1 {
      0%   { opacity:0; transform: translate(0,0) scale(0.5); }
      40%  { opacity:1; }
      100% { opacity:0; transform: translate(12px,-16px) scale(1); }
    }
    @keyframes ${id}_zzz2 {
      0%,25% { opacity:0; transform: translate(0,0) scale(0.4); }
      65%    { opacity:1; }
      100%   { opacity:0; transform: translate(18px,-22px) scale(1.2); }
    }
    @keyframes ${id}_sweat {
      0%   { opacity:1; transform: translateY(0) scaleY(1); }
      100% { opacity:0; transform: translateY(14px) scaleY(1.3); }
    }
    @keyframes ${id}_tear {
      0%   { opacity:1; transform: translateY(0); }
      100% { opacity:0; transform: translateY(18px); }
    }
    @keyframes ${id}_shake {
      0%,100% { transform: rotate(0deg); }
      20%     { transform: rotate(-4deg); }
      60%     { transform: rotate(4deg); }
    }
    @keyframes ${id}_celebrate {
      0%,100% { transform: rotate(-8deg) translateY(0); }
      50%     { transform: rotate(8deg) translateY(-4px); }
    }
    @keyframes ${id}_confetti1 {
      0%   { opacity:1; transform: translate(0,0) rotate(0deg); }
      100% { opacity:0; transform: translate(-14px,-18px) rotate(-120deg); }
    }
    @keyframes ${id}_confetti2 {
      0%   { opacity:1; transform: translate(0,0) rotate(0deg); }
      100% { opacity:0; transform: translate(14px,-20px) rotate(120deg); }
    }
    @keyframes ${id}_confetti3 {
      0%   { opacity:1; transform: translate(0,0); }
      100% { opacity:0; transform: translate(0,-22px); }
    }
    @keyframes ${id}_tilt {
      0%,100% { transform: rotate(-10deg); }
      50%     { transform: rotate(-14deg); }
    }
    @keyframes ${id}_wing {
      0%,100% { transform: rotate(-5deg); }
      50%     { transform: rotate(8deg); }
    }
  `;

  // Color palette — green owl
  const bodyGreen  = "#2EAF7D";
  const bodyDark   = "#1D8F62";
  const bodyLight  = "#4DD4A0";
  const cream      = "#F5EDD6";
  const creamDark  = "#E8D9B8";
  const eyeWhite   = "#FFFFFF";
  const pupilDark  = "#1A1A1A";
  const beakOrange = "#F5A623";
  const beakDark   = "#D4891A";
  const footOrange = "#F5A623";
  const lime       = "#c8f135";

  // ── SHARED BODY PARTS ────────────────────────────────
  function Body({ anim }) {
    return (
      <g style={anim ? { animation: anim } : {}}>
        {/* Shadow */}
        <ellipse cx={s*.5} cy={s*.94} rx={s*.28} ry={s*.04} fill="rgba(0,0,0,0.12)"/>

        {/* Left wing */}
        <g style={{transformOrigin:`${s*.18}px ${s*.62}px`,
          animation:`${id}_wing 1.2s ease-in-out infinite`}}>
          <ellipse cx={s*.18} cy={s*.62} rx={s*.13} ry={s*.2}
            fill={bodyDark} transform={`rotate(-20,${s*.18},${s*.62})`}/>
          <ellipse cx={s*.15} cy={s*.64} rx={s*.09} ry={s*.15}
            fill={bodyGreen} transform={`rotate(-20,${s*.15},${s*.64})`}/>
        </g>

        {/* Right wing */}
        <g style={{transformOrigin:`${s*.82}px ${s*.62}px`,
          animation:`${id}_wing 1.2s ease-in-out infinite reverse`}}>
          <ellipse cx={s*.82} cy={s*.62} rx={s*.13} ry={s*.2}
            fill={bodyDark} transform={`rotate(20,${s*.82},${s*.62})`}/>
          <ellipse cx={s*.85} cy={s*.64} rx={s*.09} ry={s*.15}
            fill={bodyGreen} transform={`rotate(20,${s*.85},${s*.64})`}/>
        </g>

        {/* Body */}
        <ellipse cx={s*.5} cy={s*.65} rx={s*.28} ry={s*.3} fill={bodyGreen}/>
        {/* Body shading */}
        <ellipse cx={s*.44} cy={s*.58} rx={s*.1} ry={s*.14} fill={bodyLight} opacity=".35"/>

        {/* Belly */}
        <ellipse cx={s*.5} cy={s*.7} rx={s*.18} ry={s*.2} fill={cream}/>
        {/* Belly feather marks */}
        <path d={`M${s*.43},${s*.67} Q${s*.5},${s*.64} ${s*.57},${s*.67}`}
          stroke={creamDark} strokeWidth={s*.015} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.42},${s*.73} Q${s*.5},${s*.7} ${s*.58},${s*.73}`}
          stroke={creamDark} strokeWidth={s*.013} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.44},${s*.79} Q${s*.5},${s*.76} ${s*.56},${s*.79}`}
          stroke={creamDark} strokeWidth={s*.012} fill="none" strokeLinecap="round"/>

        {/* Feet */}
        <g>
          <rect x={s*.35} y={s*.88} width={s*.06} height={s*.07} rx={s*.02} fill={footOrange}/>
          <rect x={s*.29} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
          <rect x={s*.36} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
          <rect x={s*.43} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
        </g>
        <g>
          <rect x={s*.59} y={s*.88} width={s*.06} height={s*.07} rx={s*.02} fill={footOrange}/>
          <rect x={s*.53} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
          <rect x={s*.6} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
          <rect x={s*.67} y={s*.93} width={s*.07} height={s*.04} rx={s*.02} fill={footOrange}/>
        </g>

        {/* Head */}
        <circle cx={s*.5} cy={s*.36} r={s*.3} fill={bodyGreen}/>
        {/* Head shading */}
        <circle cx={s*.4} cy={s*.28} r={s*.12} fill={bodyLight} opacity=".3"/>

        {/* Ear tufts */}
        <path d={`M${s*.27},${s*.14} L${s*.22},${s*.03} L${s*.34},${s*.12}`}
          fill={bodyDark} stroke={bodyDark} strokeWidth={s*.01}
          strokeLinejoin="round"/>
        <path d={`M${s*.73},${s*.14} L${s*.78},${s*.03} L${s*.66},${s*.12}`}
          fill={bodyDark} stroke={bodyDark} strokeWidth={s*.01}
          strokeLinejoin="round"/>
        {/* Tuft highlight */}
        <path d={`M${s*.27},${s*.13} L${s*.24},${s*.06} L${s*.31},${s*.12}`}
          fill={bodyGreen} opacity=".6"/>
        <path d={`M${s*.73},${s*.13} L${s*.76},${s*.06} L${s*.69},${s*.12}`}
          fill={bodyGreen} opacity=".6"/>

        {/* Face plate */}
        <ellipse cx={s*.5} cy={s*.38} rx={s*.22} ry={s*.2} fill={cream} opacity=".9"/>

        {/* Beak */}
        <path d={`M${s*.44},${s*.44} L${s*.56},${s*.44} L${s*.5},${s*.52}`}
          fill={beakOrange}/>
        <path d={`M${s*.44},${s*.44} L${s*.56},${s*.44} L${s*.5},${s*.47}`}
          fill={beakDark} opacity=".4"/>
      </g>
    );
  }

  // ── EYE HELPER ───────────────────────────────────────
  function Eye({ cx, cy, r=s*.1, pupilDy=2, blinkAnim, extra }) {
    return (
      <g style={blinkAnim?{animation:blinkAnim,transformOrigin:`${cx}px ${cy}px`}:{}}>
        {/* Eye white */}
        <circle cx={cx} cy={cy} r={r} fill={eyeWhite}/>
        {/* Eye ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={bodyDark}
          strokeWidth={s*.015} opacity=".3"/>
        {/* Pupil */}
        <circle cx={cx} cy={cy+pupilDy*s*.01} r={r*.52} fill={pupilDark}/>
        {/* Shine 1 */}
        <circle cx={cx-r*.28} cy={cy-r*.3+pupilDy*s*.01} r={r*.2} fill={eyeWhite}/>
        {/* Shine 2 small */}
        <circle cx={cx+r*.22} cy={cy+r*.15+pupilDy*s*.01} r={r*.1} fill={eyeWhite} opacity=".7"/>
        {extra}
      </g>
    );
  }

  // ── HAPPY ────────────────────────────────────────────
  if(mood==="happy") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`${id}_bounce 2s ease-in-out infinite`}}>
        <Body/>
        {/* Brow happy */}
        <path d={`M${s*.26},${s*.23} Q${s*.33},${s*.19} ${s*.4},${s*.23}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.6},${s*.23} Q${s*.67},${s*.19} ${s*.74},${s*.23}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
        {/* Eyes with blink */}
        <Eye cx={s*.34} cy={s*.33} blinkAnim={`${id}_blink 3.5s ease-in-out infinite`}/>
        <Eye cx={s*.66} cy={s*.33} blinkAnim={`${id}_blink 3.5s ease-in-out infinite 0.1s`}/>
        {/* Smile */}
        <path d={`M${s*.4},${s*.5} Q${s*.5},${s*.56} ${s*.6},${s*.5}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );

  // ── SLEEPY ───────────────────────────────────────────
  if(mood==="sleepy") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <Body anim={`${id}_tilt 2.5s ease-in-out infinite`}/>
      {/* Half closed eyes */}
      <circle cx={s*.34} cy={s*.33} r={s*.1} fill={eyeWhite}/>
      <rect x={s*.24} y={s*.24} width={s*.2} height={s*.12} rx={s*.04}
        fill={bodyGreen}/>
      <circle cx={s*.66} cy={s*.33} r={s*.1} fill={eyeWhite}/>
      <rect x={s*.56} y={s*.24} width={s*.2} height={s*.12} rx={s*.04}
        fill={bodyGreen}/>
      {/* Drowsy lines */}
      <path d={`M${s*.26},${s*.27} L${s*.42},${s*.27}`}
        stroke={bodyDark} strokeWidth={s*.02} strokeLinecap="round"/>
      <path d={`M${s*.58},${s*.27} L${s*.74},${s*.27}`}
        stroke={bodyDark} strokeWidth={s*.02} strokeLinecap="round"/>
      {/* Zzz */}
      <text x={s*.72} y={s*.2} fontSize={s*.12} fill={lime} fontWeight="900"
        fontFamily="Inter,sans-serif"
        style={{animation:`${id}_zzz1 2s ease-in-out infinite`}}>z</text>
      <text x={s*.8} y={s*.1} fontSize={s*.16} fill={lime} fontWeight="900"
        fontFamily="Inter,sans-serif"
        style={{animation:`${id}_zzz2 2s ease-in-out infinite`}}>Z</text>
    </svg>
  );

  // ── COOL (celebrating) ───────────────────────────────
  if(mood==="cool") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`${id}_celebrate 1s ease-in-out infinite`}}>
        <Body/>
        {/* Happy arc eyes */}
        <path d={`M${s*.24},${s*.33} Q${s*.34},${s*.24} ${s*.44},${s*.33}`}
          stroke={pupilDark} strokeWidth={s*.035} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.56},${s*.33} Q${s*.66},${s*.24} ${s*.76},${s*.33}`}
          stroke={pupilDark} strokeWidth={s*.035} fill="none" strokeLinecap="round"/>
        {/* Big smile */}
        <path d={`M${s*.38},${s*.5} Q${s*.5},${s*.6} ${s*.62},${s*.5}`}
          stroke={bodyDark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        {/* Rosy cheeks */}
        <circle cx={s*.24} cy={s*.42} r={s*.05} fill="#FF9BB0" opacity=".5"/>
        <circle cx={s*.76} cy={s*.42} r={s*.05} fill="#FF9BB0" opacity=".5"/>
      </g>
      {/* Confetti */}
      <rect x={s*.2} y={s*.12} width={s*.05} height={s*.05} rx={s*.01}
        fill="#FF6B9D" style={{animation:`${id}_confetti1 1.2s ease-out infinite`}}/>
      <rect x={s*.72} y={s*.1} width={s*.05} height={s*.05} rx={s*.01}
        fill="#c8f135" style={{animation:`${id}_confetti2 1.2s ease-out infinite 0.2s`}}/>
      <circle cx={s*.5} cy={s*.08} r={s*.03}
        fill="#38bdf8" style={{animation:`${id}_confetti3 1.2s ease-out infinite 0.4s`}}/>
      <rect x={s*.14} y={s*.18} width={s*.04} height={s*.04} rx={s*.01}
        fill="#a78bfa" style={{animation:`${id}_confetti1 1.2s ease-out infinite 0.6s`}}/>
      <rect x={s*.78} y={s*.2} width={s*.04} height={s*.04} rx={s*.01}
        fill="#f5a623" style={{animation:`${id}_confetti2 1.2s ease-out infinite 0.3s`}}/>
    </svg>
  );

  // ── SWEAT ────────────────────────────────────────────
  if(mood==="sweat") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`${id}_shake 0.6s ease-in-out infinite`}}>
        <Body/>
        {/* Wide worried eyes */}
        <Eye cx={s*.34} cy={s*.32} r={s*.11} pupilDy={1}/>
        <Eye cx={s*.66} cy={s*.32} r={s*.11} pupilDy={1}/>
        {/* Worried brows — inner corners up */}
        <path d={`M${s*.24},${s*.2} Q${s*.31},${s*.24} ${s*.4},${s*.21}`}
          stroke={bodyDark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.6},${s*.21} Q${s*.69},${s*.24} ${s*.76},${s*.2}`}
          stroke={bodyDark} strokeWidth={s*.025} fill="none" strokeLinecap="round"/>
        {/* Nervous mouth */}
        <path d={`M${s*.41},${s*.52} Q${s*.46},${s*.49} ${s*.5},${s*.52} Q${s*.54},${s*.55} ${s*.59},${s*.52}`}
          stroke={bodyDark} strokeWidth={s*.02} fill="none" strokeLinecap="round"/>
      </g>
      {/* Sweat drops */}
      <ellipse cx={s*.16} cy={s*.3} rx={s*.025} ry={s*.04}
        fill="#7EC8E3" style={{animation:`${id}_sweat 0.9s ease-in infinite`}}/>
      <ellipse cx={s*.84} cy={s*.28} rx={s*.02} ry={s*.032}
        fill="#7EC8E3" style={{animation:`${id}_sweat 0.9s ease-in infinite 0.3s`}}/>
      <ellipse cx={s*.12} cy={s*.42} rx={s*.018} ry={s*.028}
        fill="#7EC8E3" style={{animation:`${id}_sweat 0.9s ease-in infinite 0.6s`}}/>
    </svg>
  );

  // ── CRY ──────────────────────────────────────────────
  if(mood==="cry") return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <Body/>
      {/* Sad droopy eyes */}
      <Eye cx={s*.34} cy={s*.34} r={s*.1} pupilDy={2}
        extra={
          <>
            <path d={`M${s*.25},${s*.27} Q${s*.31},${s*.3} ${s*.38},${s*.27}`}
              stroke={bodyDark} strokeWidth={s*.02} fill="none" strokeLinecap="round"/>
          </>
        }/>
      <Eye cx={s*.66} cy={s*.34} r={s*.1} pupilDy={2}
        extra={
          <>
            <path d={`M${s*.62},${s*.27} Q${s*.69},${s*.3} ${s*.75},${s*.27}`}
              stroke={bodyDark} strokeWidth={s*.02} fill="none" strokeLinecap="round"/>
          </>
        }/>
      {/* Sad brows */}
      <path d={`M${s*.26},${s*.22} Q${s*.3},${s*.26} ${s*.38},${s*.23}`}
        stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      <path d={`M${s*.62},${s*.23} Q${s*.7},${s*.26} ${s*.74},${s*.22}`}
        stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      {/* Sad mouth */}
      <path d={`M${s*.4},${s*.55} Q${s*.5},${s*.5} ${s*.6},${s*.55}`}
        stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      {/* Tears */}
      <ellipse cx={s*.29} cy={s*.46} rx={s*.025} ry={s*.05}
        fill="#7EC8E3" style={{animation:`${id}_tear 1s ease-in infinite`}}/>
      <ellipse cx={s*.71} cy={s*.46} rx={s*.025} ry={s*.05}
        fill="#7EC8E3" style={{animation:`${id}_tear 1s ease-in infinite 0.3s`}}/>
      <ellipse cx={s*.26} cy={s*.56} rx={s*.02} ry={s*.038}
        fill="#7EC8E3" style={{animation:`${id}_tear 1s ease-in infinite 0.5s`}}/>
      <ellipse cx={s*.74} cy={s*.56} rx={s*.02} ry={s*.038}
        fill="#7EC8E3" style={{animation:`${id}_tear 1s ease-in infinite 0.7s`}}/>
    </svg>
  );

  // ── COFFEE (default fallback) ─────────────────────────
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} overflow="visible">
      <style>{css}</style>
      <g style={{animation:`${id}_bounce 1.5s ease-in-out infinite`}}>
        <Body/>
        <Eye cx={s*.34} cy={s*.32} r={s*.11} pupilDy={0}/>
        <Eye cx={s*.66} cy={s*.32} r={s*.11} pupilDy={0}/>
        <path d={`M${s*.26},${s*.2} Q${s*.33},${s*.15} ${s*.42},${s*.2}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.58},${s*.2} Q${s*.67},${s*.15} ${s*.74},${s*.2}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
        <path d={`M${s*.4},${s*.51} Q${s*.5},${s*.57} ${s*.6},${s*.51}`}
          stroke={bodyDark} strokeWidth={s*.022} fill="none" strokeLinecap="round"/>
      </g>
    </svg>
  );
}
