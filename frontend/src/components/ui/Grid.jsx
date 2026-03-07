export default function Grid({ cols, gap = 14, children, style }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: cols, gap, ...style }}>
      {children}
    </div>
  );
}
