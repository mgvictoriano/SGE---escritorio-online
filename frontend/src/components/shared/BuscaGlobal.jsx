import React, { useState, useEffect, useRef } from "react";
import { C } from '../../constants/paleta';
import { fmt } from '../../utils/datas';

export default function BuscaGlobal({ clientes, processos, andamentos, pecas, onNavegar, onClose }) {
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => { ref.current && ref.current.focus(); }, []);

  const ql = q.toLowerCase().trim();
  const res = ql.length < 2 ? [] : [];
  if (ql.length >= 2) {
    clientes.forEach(c => {
      if (c.nome.toLowerCase().includes(ql) || c.id.includes(ql) || (c.cpfCnpj || "").includes(ql))
        res.push({ tipo: "Cliente", icon: "👥", label: c.nome, sub: c.id, modulo: "clientes" });
    });
    processos.forEach(p => {
      if (p.id.toLowerCase().includes(ql) || p.classe?.toLowerCase().includes(ql) || (p.numeroOficial || "").includes(ql))
        res.push({ tipo: "Processo", icon: "⚖️", label: p.id + " — " + p.classe, sub: p.tribunal || "", modulo: "processos" });
    });
    andamentos.forEach(a => {
      if (a.descricao?.toLowerCase().includes(ql))
        res.push({ tipo: "Andamento", icon: "📝", label: a.descricao.slice(0, 60), sub: a.processoId + " • " + fmt(a.data), modulo: "processos" });
    });
    pecas.forEach(p => {
      if (p.tipo.toLowerCase().includes(ql) || (p.obs || "").toLowerCase().includes(ql))
        res.push({ tipo: "Peça", icon: "📋", label: p.tipo, sub: p.processoId + " • " + fmt(p.data), modulo: "processos" });
    });
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fadeUp" style={{ background: C.card, border: `1px solid ${C.borderHi}`, borderRadius: 20, width: "100%", maxWidth: 620, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            ref={ref}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar clientes, processos, andamentos, peças..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 15 }}
            onKeyDown={e => e.key === "Escape" && onClose()}
          />
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        {ql.length >= 2 && (
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {res.length === 0 && <div style={{ padding: "28px 20px", color: C.muted, textAlign: "center", fontSize: 13 }}>Nenhum resultado para "{q}"</div>}
            {res.slice(0, 15).map((r, i) => (
              <div
                key={i}
                onClick={() => { onNavegar(r.modulo); onClose(); }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.subtle}
                onMouseLeave={e => e.currentTarget.style.background = ""}
              >
                <span style={{ fontSize: 20 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{r.label}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{r.sub}</div>
                </div>
                <span style={{ background: C.accent + "18", color: C.accent, border: `1px solid ${C.accent}30`, borderRadius: 12, padding: "2px 9px", fontSize: 10, fontWeight: 600 }}>{r.tipo}</span>
              </div>
            ))}
            {res.length > 15 && <div style={{ padding: "10px 20px", color: C.muted, fontSize: 12, textAlign: "center" }}>+{res.length - 15} resultados — refine a busca</div>}
          </div>
        )}
        {ql.length < 2 && <div style={{ padding: "24px 20px", color: C.muted, fontSize: 13, textAlign: "center" }}>Digite ao menos 2 caracteres para buscar</div>}
      </div>
    </div>
  );
}
