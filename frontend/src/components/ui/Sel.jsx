import { C } from '../../constants/paleta';

export default function Sel({ label, value, onChange, options, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, ...style }}>
      {label && (
        <label style={{ color: C.silver, fontSize: 11.5, fontWeight: 500, letterSpacing: "0.3px" }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: C.inputBg,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "9px 13px",
          color: C.text,
          fontSize: 13.5,
          outline: "none",
          cursor: "pointer",
          appearance: "auto",
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: C.card, color: C.text }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
