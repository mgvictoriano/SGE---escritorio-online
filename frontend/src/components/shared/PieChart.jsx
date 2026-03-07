import { C } from '../../constants/paleta';

export default function PieChart({ slices, size = 160 }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <div style={{ color: C.muted, fontSize: 12, textAlign: "center" }}>Sem dados</div>;

  let angle = -Math.PI / 2;
  const cx = size / 2, cy = size / 2, r = size / 2 - 8;
  const paths = slices.filter(s => s.value > 0).map(s => {
    const sweep = (s.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + sweep), y2 = cy + r * Math.sin(angle + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} Z`;
    angle += sweep;
    return { path, color: s.color, label: s.label, pct: ((s.value / total) * 100).toFixed(1) };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {paths.map((p, i) => <path key={i} d={p.path} fill={p.color} stroke={C.bg} strokeWidth={2} />)}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {paths.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
            <span style={{ color: C.text, fontSize: 12 }}>{p.label}</span>
            <span style={{ color: p.color, fontWeight: 700, fontSize: 12 }}>{p.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
