import { useState } from "react";
import { C } from '../../constants/paleta';
import { _auditLog } from '../../utils/auditoria';
import Badge from '../ui/Badge';

export default function LogAuditoria({ usuario, onClose }) {
  const [filtro, setFiltro] = useState("");
  const [modFiltro, setModFiltro] = useState("todos");

  const logs = _auditLog.filter(l => {
    const ok = filtro ? l.acao.toLowerCase().includes(filtro.toLowerCase()) || l.detalhe.toLowerCase().includes(filtro.toLowerCase()) : true;
    const om = modFiltro === "todos" ? true : l.modulo === modFiltro;
    return ok && om;
  });
  const modulos = [...new Set(_auditLog.map(l => l.modulo))];
  const acoesClr = { criou: C.success, editou: C.accent, excluiu: C.danger, acessou: C.muted, exportou: C.warning };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fadeUp" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, width: "100%", maxWidth: 860, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 17 }}>📋 Log de Auditoria</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 12, padding: "14px 24px", borderBottom: `1px solid ${C.border}` }}>
          <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Filtrar por ação ou detalhe..." style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }} />
          <select value={modFiltro} onChange={e => setModFiltro(e.target.value)} style={{ background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }}>
            <option value="todos">Todos módulos</option>
            {modulos.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {logs.length === 0 && <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 13 }}>Nenhum registro encontrado</div>}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.tableHead }}>
                {["Data/Hora", "Usuário", "Módulo", "Ação", "Detalhe"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} style={{ borderBottom: `1px solid ${C.border}` }} onMouseEnter={e => e.currentTarget.style.background = C.subtle} onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "10px 16px", color: C.muted, fontSize: 12, whiteSpace: "nowrap" }}>{l.ts}</td>
                  <td style={{ padding: "10px 16px", color: C.text, fontSize: 12 }}>{l.usuario}</td>
                  <td style={{ padding: "10px 16px" }}><Badge label={l.modulo} color={C.accent2} /></td>
                  <td style={{ padding: "10px 16px" }}><Badge label={l.acao} color={acoesClr[l.acao] || C.muted} /></td>
                  <td style={{ padding: "10px 16px", color: C.muted, fontSize: 12 }}>{l.detalhe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 24px", borderTop: `1px solid ${C.border}`, color: C.muted, fontSize: 11 }}>{_auditLog.length} registro(s) — máximo 200 registros em memória</div>
      </div>
    </div>
  );
}
