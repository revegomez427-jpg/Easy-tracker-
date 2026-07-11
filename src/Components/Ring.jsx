export default function Ring({ pct, color, size=72, C }) {
  const r=28, circ=2*Math.PI*r;
  const dash=Math.min(pct/100,1)*circ;
  const stroke=pct>90?C.danger:pct>70?C.warn:color;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke={C.border} strokeWidth="6"/>
      <circle cx="36" cy="36" r={r} fill="none" stroke={stroke} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{transition:"stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)"}}/>
      <text x="36" y="40" textAnchor="middle" fill={stroke} fontSize="11" fontWeight="800"
        fontFamily="Inter,sans-serif">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}
