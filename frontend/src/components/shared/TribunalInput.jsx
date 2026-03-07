import { useState, useEffect } from "react";
import { C } from '../../constants/paleta';
import { TRIBUNAIS } from '../../constants/geograficos';

export default function TribunalInput({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value || "");
  const filtered = TRIBUNAIS.filter(t => t.toLowerCase().includes(q.toLowerCase())).slice(0, 10);

  useEffect(() => { setQ(value || ""); }, [value]);

  return (
    <div style={{ position: "relative" }}>
      <label style={{ color: C.silver, fontSize: 11.5, fontWeight: 500, letterSpacing: "0.3px", display: "block", marginBottom: 5 }}>Tribunal</label>
      <input
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        style={{ width: "100%", boxSizing: "border-box", background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 13px", color: C.text, fontSize: 13.5, outline: "none" }}
        placeholder="Digite para buscar tribunal..."
      />
      {open && q && filtered.length > 0 && (
        <div style={{ position: "absolute", zIndex: 999, background: C.cardHi, border: `1px solid ${C.borderHi}`, borderRadius: 12, maxHeight: 220, overflowY: "auto", width: "100%", top: "calc(100% + 4px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          {filtered.map(t => (
            <div
              key={t}
              onMouseDown={() => { onChange(t); setQ(t); setOpen(false); }}
              style={{ padding: "9px 14px", cursor: "pointer", color: C.text, fontSize: 13, borderBottom: `1px solid ${C.border}` }}
              onMouseEnter={e => e.target.style.background = C.subtle}
              onMouseLeave={e => e.target.style.background = ""}
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
