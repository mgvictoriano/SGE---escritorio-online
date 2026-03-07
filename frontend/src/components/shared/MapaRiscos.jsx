import { C } from '../../constants/paleta';
import Badge from '../ui/Badge';

export default function MapaRiscos({ processos, clientes, onClose }) {
  const procsComRisco = processos.filter(p => p.probExito != null);
  const getCliente = (id) => clientes.find(c => c.id === id);
  const getRiscoClr = (p) => p >= 70 ? C.success : p >= 40 ? C.warning : C.danger;
  const getRiscoLabel = (p) => p >= 70 ? "Alto" : p >= 40 ? "Médio" : "Baixo";

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fadeUp" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, width: "100%", maxWidth: 860, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 17 }}>🎯 Mapa de Riscos dos Processos</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {procsComRisco.length === 0 && (
            <div style={{ textAlign: "center", color: C.muted, padding: 40, fontSize: 13 }}>
              Nenhum processo com probabilidade de êxito cadastrada.<br />
              <span style={{ fontSize: 11 }}>Edite um processo e preencha o campo "Prob. de Êxito" para aparecer aqui.</span>
            </div>
          )}
          {procsComRisco.length > 0 && (
            <div>
              <div style={{ marginBottom: 16, color: C.muted, fontSize: 12 }}>Exibindo {procsComRisco.length} processo(s) com análise de risco cadastrada.</div>
              <div style={{ position: "relative", width: "100%", height: 280, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, marginBottom: 20, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: C.border }} />
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: C.border }} />
                <div style={{ position: "absolute", top: 8, left: 8, color: C.muted, fontSize: 10 }}>Alto Impacto / Baixa Chance</div>
                <div style={{ position: "absolute", top: 8, right: 8, color: C.muted, fontSize: 10, textAlign: "right" }}>Alto Impacto / Alta Chance</div>
                <div style={{ position: "absolute", bottom: 8, left: 8, color: C.muted, fontSize: 10 }}>Baixo Impacto / Baixa Chance</div>
                <div style={{ position: "absolute", bottom: 8, right: 8, color: C.muted, fontSize: 10, textAlign: "right" }}>Baixo Impacto / Alta Chance</div>
                {procsComRisco.map(p => {
                  const x = (p.probExito || 0) / 100 * (100 - 8) + 4;
                  const valMax = Math.max(...procsComRisco.map(pp => pp.valorCausa || 0), 1);
                  const y = 100 - ((p.valorCausa || 0) / valMax * (100 - 8) + 4);
                  const cor = getRiscoClr(p.probExito || 0);
                  return (
                    <div key={p.id} title={`${p.id} — ${p.probExito}% • R$ ${(p.valorCausa || 0).toLocaleString("pt-BR")}`}
                      style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 12, height: 12, borderRadius: "50%", background: cor, border: `2px solid ${cor}88`, transform: "translate(-50%,-50%)", cursor: "pointer", boxShadow: `0 0 8px ${cor}66` }}
                    />
                  );
                })}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.tableHead }}>
                    {["Processo", "Cliente", "Prob. Êxito", "Valor da Causa", "Impacto Financeiro", "Risco"].map(h => (
                      <th key={h} style={{ padding: "9px 14px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: "0.4px", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...procsComRisco].sort((a, b) => (b.probExito || 0) - (a.probExito || 0)).map(p => {
                    const cli = getCliente(p.clienteId);
                    const impacto = (p.valorCausa || 0) * (p.probExito || 0) / 100;
                    const clr = getRiscoClr(p.probExito || 0);
                    return (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }} onMouseEnter={e => e.currentTarget.style.background = C.subtle} onMouseLeave={e => e.currentTarget.style.background = ""}>
                        <td style={{ padding: "10px 14px", color: C.text, fontSize: 13, fontWeight: 600 }}>{p.id}</td>
                        <td style={{ padding: "10px 14px", color: C.muted, fontSize: 12 }}>{cli?.nome || "—"}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: C.barTrack, borderRadius: 3, minWidth: 60 }}>
                              <div style={{ height: "100%", width: `${p.probExito || 0}%`, background: clr, borderRadius: 3 }} />
                            </div>
                            <span style={{ color: clr, fontWeight: 700, fontSize: 13 }}>{p.probExito || 0}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", color: C.text, fontSize: 12 }}>R$ {(p.valorCausa || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: "10px 14px", color: C.accent, fontWeight: 600, fontSize: 12 }}>R$ {impacto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: "10px 14px" }}><Badge label={getRiscoLabel(p.probExito || 0)} color={clr} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
