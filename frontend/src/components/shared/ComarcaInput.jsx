import { useState, useEffect } from "react";
import { C } from '../../constants/paleta';
import { SUGESTOES_COMARCAS } from '../../constants/geograficos';

export default function ComarcaInput({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value || "");
  const filtered = q.length >= 2
    ? SUGESTOES_COMARCAS.filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 12)
    : [];

  useEffect(() => { setQ(value || ""); }, [value]);

  return (
    <div style={{ position: "relative" }}>
      <label style={{ color: C.silver, fontSize: 11.5, fontWeight: 500, letterSpacing: "0.3px", display: "block", marginBottom: 5 }}>Comarca / Foro</label>
      <input
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{ width: "100%", boxSizing: "border-box", background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 13px", color: C.text, fontSize: 13.5, outline: "none" }}
        placeholder="Digite a comarca ou foro..."
      />
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", zIndex: 999, background: C.cardHi, border: `1px solid ${C.borderHi}`, borderRadius: 12, maxHeight: 220, overflowY: "auto", width: "100%", top: "calc(100% + 4px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          {filtered.map(c => (
            <div
              key={c}
              onMouseDown={() => { onChange(c); setQ(c); setOpen(false); }}
              style={{ padding: "8px 14px", cursor: "pointer", color: C.text, fontSize: 13, borderBottom: `1px solid ${C.border}` }}
              onMouseEnter={e => e.target.style.background = C.subtle}
              onMouseLeave={e => e.target.style.background = ""}
            >
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
