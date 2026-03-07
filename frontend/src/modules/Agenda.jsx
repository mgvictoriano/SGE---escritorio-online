import { useState } from "react";
import { C } from '../constants/paleta';
import { TRIBUNAIS } from '../constants/geograficos';
import { DIAS_ABREV, fmt, fmtComDia, today } from '../utils/datas';
import { addDias, getFeriado, getSuspensaoTribunal } from '../utils/prazos';
import { Badge, Btn, Card, Grid, Inp, Sel } from '../components/ui';

function AgendaSemana({ ordenada, hoje, tipoClr, setForm }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const startOfWeek = (d) => { const dt = new Date(d + "T12:00:00"); dt.setDate(dt.getDate() - dt.getDay()); return dt; };
  const sw = startOfWeek(hoje); sw.setDate(sw.getDate() + weekOffset * 7);
  const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(sw); d.setDate(d.getDate() + i); return d.toISOString().split("T")[0]; });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <Btn label="◀" onClick={() => setWeekOffset(w => w - 1)} small color={C.border} />
        <span style={{ color: C.text, fontWeight: 600 }}>{fmtComDia(dias[0])} – {fmtComDia(dias[6])}</span>
        <Btn label="▶" onClick={() => setWeekOffset(w => w + 1)} small color={C.border} />
        <Btn label="Hoje" onClick={() => setWeekOffset(0)} small color={C.accent} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
        {dias.map(d => {
          const evs = ordenada.filter(e => e.data === d);
          const isHj = d === hoje;
          const diaN = new Date(d + "T12:00:00").getDay();
          return (
            <div key={d} style={{ minHeight: 130, background: isHj ? C.accent + "18" : C.card, borderRadius: 10, border: `1px solid ${isHj ? C.accent : C.border}`, padding: 8 }}>
              <div style={{ color: isHj ? C.accent : C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                {DIAS_ABREV[diaN]}<br />
                <span style={{ fontSize: 14, color: isHj ? C.accent : C.text }}>{fmt(d).slice(0, 5)}</span>
              </div>
              {evs.map(e => (
                <div key={e.id} style={{ background: (tipoClr[e.tipo] || C.muted) + "22", border: `1px solid ${(tipoClr[e.tipo] || C.muted)}44`, borderRadius: 6, padding: "3px 6px", marginBottom: 4, cursor: "pointer" }} onClick={() => setForm({ ...e })}>
                  <div style={{ color: tipoClr[e.tipo] || C.muted, fontSize: 10, fontWeight: 700 }}>{e.hora || "—"}</div>
                  <div style={{ color: C.text, fontSize: 11, lineHeight: 1.3 }}>{e.titulo.slice(0, 28)}{e.titulo.length > 28 ? "…" : ""}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgendaMes({ ordenada, hoje, tipoClr, setForm }) {
  const [mesOffset, setMesOffset] = useState(0);
  const refDate = new Date(hoje + "T12:00:00"); refDate.setMonth(refDate.getMonth() + mesOffset);
  const ano = refDate.getFullYear(); const mes = refDate.getMonth();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const cells = Array.from({ length: primeiroDia }, () => null).concat(Array.from({ length: diasNoMes }, (_, i) => i + 1));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Btn label="◀" onClick={() => setMesOffset(m => m - 1)} small color={C.border} />
        <span style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{meses[mes]} {ano}</span>
        <Btn label="▶" onClick={() => setMesOffset(m => m + 1)} small color={C.border} />
        <Btn label="Hoje" onClick={() => setMesOffset(0)} small color={C.accent} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
        {DIAS_ABREV.map(d => (
          <div key={d} style={{ textAlign: "center", color: C.muted, fontSize: 11, fontWeight: 700, padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {cells.map((dia, i) => {
          if (!dia) return <div key={`e${i}`} style={{ minHeight: 70 }} />;
          const dStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const evs = ordenada.filter(e => e.data === dStr);
          const isHj = dStr === hoje;
          return (
            <div key={dStr} style={{ minHeight: 70, background: isHj ? C.accent + "22" : C.card, borderRadius: 10, border: `1px solid ${isHj ? C.accent : C.border}`, boxShadow: isHj ? `0 0 12px ${C.accent}30` : "none", padding: 5 }}>
              <div style={{ color: isHj ? C.accent : C.text, fontWeight: isHj ? 700 : 400, fontSize: 13, marginBottom: 3 }}>{dia}</div>
              {evs.slice(0, 3).map(e => (
                <div key={e.id} style={{ background: (tipoClr[e.tipo] || C.muted) + "33", borderLeft: `2px solid ${tipoClr[e.tipo] || C.muted}`, borderRadius: 3, padding: "1px 5px", marginBottom: 2, fontSize: 10, color: C.text, cursor: "pointer" }} onClick={() => setForm({ ...e })}>
                  {e.titulo.slice(0, 18)}
                </div>
              ))}
              {evs.length > 3 && <div style={{ color: C.muted, fontSize: 10 }}>+{evs.length - 3}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Agenda({ agenda, setAgenda, processos, advs }) {
  const [tab, setTab] = useState("lista");
  const [agendaView, setAgendaView] = useState("lista");
  const [form, setForm] = useState(null);
  const [calc, setCalc] = useState({ marco: "", qtd: "15", tipo: "uteis", tribunal: "", resultado: null });
  const hoje = today();
  const em3 = new Date(); em3.setDate(em3.getDate() + 3); const em3s = em3.toISOString().split("T")[0];
  const tipoClr = { audiencia: C.warning, prazo: C.danger, reuniao: C.accent, tarefa: C.success, financeiro: C.accent2 };
  const ordenada = [...agenda].sort((a, b) => a.data.localeCompare(b.data));

  function salvar() {
    if (!form.titulo || !form.data) return alert("Título e data obrigatórios.");
    if (form._novo) setAgenda(a => [...a, { ...form, id: Date.now(), _novo: undefined }]);
    else setAgenda(a => a.map(x => x.id === form.id ? { ...form, _novo: undefined } : x));
    setForm(null);
  }

  function calcular() {
    if (!calc.marco) return alert("Informe o marco inicial.");
    const r = addDias(calc.marco, parseInt(calc.qtd) || 1, calc.tipo, calc.tribunal);
    setCalc(c => ({ ...c, resultado: r }));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: C.text, margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>Agenda & Prazos</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {["lista", "calculadora"].map(t => (
            <Btn key={t} label={t === "lista" ? "📅 Agenda" : "⏱ Calculadora"} onClick={() => setTab(t)} color={tab === t ? C.accent : C.border} />
          ))}
          {tab === "lista" && (<>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
              {[["lista", "☰"], ["semana", "7"], ["mes", "📆"]].map(([v, l]) => (
                <button key={v} onClick={() => setAgendaView(v)} style={{ padding: "8px 13px", background: agendaView === v ? C.accent + "33" : "transparent", color: agendaView === v ? C.accent : C.muted, border: "none", cursor: "pointer", fontSize: 13, fontWeight: agendaView === v ? 700 : 400 }}>{l}</button>
              ))}
            </div>
            <Btn label="+ Evento" onClick={() => setForm({ _novo: true, tipo: "reuniao", titulo: "", data: hoje, hora: "", local: "", obs: "", processoId: "", responsavel: advs[0]?.id || "" })} />
          </>)}
        </div>
      </div>

      {(() => {
        const urgentes = agenda.filter(e => e.data >= hoje && e.data <= em3s && (e.tipo === "prazo" || e.tipo === "audiencia"));
        if (!urgentes.length) return null;
        return (
          <div style={{ background: C.danger + "18", border: `1px solid ${C.danger}44`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <div style={{ color: C.danger, fontWeight: 700, marginBottom: 8 }}>🔔 Prazos/Audiências nos próximos 3 dias</div>
            {urgentes.map(e => {
              const adv = advs.find(a => a.id === e.responsavel);
              return (
                <div key={e.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: C.text, fontSize: 13 }}>{e.titulo}</span>
                  <span style={{ color: C.danger, fontWeight: 700, fontSize: 13 }}>{fmtComDia(e.data)} {adv && `• ${adv.nome.split(" ")[0]}`}</span>
                </div>
              );
            })}
          </div>
        );
      })()}

      {tab === "lista" && !form && agendaView === "semana" && <AgendaSemana ordenada={ordenada} hoje={hoje} tipoClr={tipoClr} setForm={setForm} />}
      {tab === "lista" && !form && agendaView === "mes" && <AgendaMes ordenada={ordenada} hoje={hoje} tipoClr={tipoClr} setForm={setForm} />}

      {tab === "lista" && !form && agendaView === "lista" && (
        <div>
          {["prazo", "audiencia", "reuniao", "tarefa", "financeiro"].map(tipo => {
            const evs = ordenada.filter(e => e.tipo === tipo);
            if (!evs.length) return null;
            return (
              <div key={tipo} style={{ marginBottom: 20 }}>
                <div style={{ color: tipoClr[tipo], fontWeight: 600, fontSize: 14, marginBottom: 8, textTransform: "capitalize" }}>
                  {tipo === "audiencia" ? "Audiências" : tipo === "reuniao" ? "Reuniões" : tipo === "tarefa" ? "Tarefas" : tipo === "financeiro" ? "Financeiro" : "Prazos"}
                </div>
                <Card style={{ padding: 0, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}><tbody>
                    {evs.map(e => {
                      const adv = advs.find(a => a.id === e.responsavel);
                      return (
                        <tr key={e.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "10px 16px", width: 36 }}>
                            <div style={{ width: 9, height: 9, borderRadius: "50%", background: e.data < hoje ? C.danger : e.data === hoje ? C.warning : tipoClr[tipo], flexShrink: 0, boxShadow: `0 0 6px ${e.data < hoje ? C.danger : e.data === hoje ? C.warning : tipoClr[tipo]}80` }} />
                          </td>
                          <td style={{ padding: "10px 8px", color: C.accent, fontWeight: 700, fontSize: 13, width: 130 }}>{fmtComDia(e.data)}</td>
                          <td style={{ padding: "10px 8px", color: C.muted, fontSize: 12, width: 50 }}>{e.hora}</td>
                          <td style={{ padding: "10px 8px", color: C.text, fontSize: 13 }}>
                            {e.titulo}
                            {e.gcal && <span style={{ marginLeft: 6, background: "#34a85322", color: "#34a853", borderRadius: 5, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>📅 GCal</span>}
                          </td>
                          <td style={{ padding: "10px 8px" }}>
                            {adv && <span style={{ background: adv.cor + "22", color: adv.cor, borderRadius: 6, padding: "2px 7px", fontSize: 11 }}>{adv.nome.split(" ")[0]}</span>}
                          </td>
                          <td style={{ padding: "10px 16px" }}><Btn label="Editar" small onClick={() => setForm({ ...e })} /></td>
                        </tr>
                      );
                    })}
                  </tbody></table>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {tab === "lista" && form && (
        <Card>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 14 }}>{form._novo ? "Novo Evento" : "Editar Evento"}</div>
          <Grid cols="1fr 1fr 1fr" gap={14}>
            <Sel label="Tipo" value={form.tipo} onChange={v => setForm(f => ({ ...f, tipo: v }))} options={["audiencia", "prazo", "reuniao", "tarefa", "financeiro"].map(x => ({ value: x, label: x }))} />
            <Inp label="Título" value={form.titulo} onChange={v => setForm(f => ({ ...f, titulo: v }))} style={{ gridColumn: "span 2" }} />
            <Inp label="Data" type="date" value={form.data} onChange={v => setForm(f => ({ ...f, data: v }))} />
            <Inp label="Hora" type="time" value={form.hora} onChange={v => setForm(f => ({ ...f, hora: v }))} />
            <Sel label="Responsável" value={form.responsavel || ""} onChange={v => setForm(f => ({ ...f, responsavel: v }))} options={[{ value: "", label: "Nenhum" }, ...advs.map(a => ({ value: a.id, label: a.nome }))]} />
            <Sel label="Processo" value={form.processoId || ""} onChange={v => setForm(f => ({ ...f, processoId: v }))} options={[{ value: "", label: "Nenhum" }, ...processos.map(p => ({ value: p.id, label: p.id }))]} />
            <Inp label="Local" value={form.local || ""} onChange={v => setForm(f => ({ ...f, local: v }))} style={{ gridColumn: "span 2" }} />
            <Inp label="Obs" value={form.obs || ""} onChange={v => setForm(f => ({ ...f, obs: v }))} style={{ gridColumn: "span 3" }} />
          </Grid>
          {form.data && <div style={{ marginTop: 10, color: C.muted, fontSize: 12 }}>📅 {fmtComDia(form.data)}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Btn label="Salvar" onClick={salvar} />
            <Btn label="Cancelar" onClick={() => setForm(null)} color={C.border} />
          </div>
        </Card>
      )}

      {tab === "calculadora" && (
        <Card style={{ maxWidth: 680 }}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 16 }}>Calculadora de Prazos</div>
          <Grid cols="1fr 1fr" gap={14}>
            <div>
              <Inp label="Marco inicial" type="date" value={calc.marco} onChange={v => setCalc(c => ({ ...c, marco: v, resultado: null }))} />
              {calc.marco && <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{fmtComDia(calc.marco)}</div>}
            </div>
            <Inp label="Quantidade de dias" type="number" value={calc.qtd} onChange={v => setCalc(c => ({ ...c, qtd: v, resultado: null }))} />
            <Sel label="Tipo de contagem" value={calc.tipo} onChange={v => setCalc(c => ({ ...c, tipo: v, resultado: null }))} options={[{ value: "uteis", label: "Dias úteis (art. 219 CPC)" }, { value: "corridos", label: "Dias corridos" }]} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ color: C.muted, fontSize: 12 }}>Tribunal</label>
              <select value={calc.tribunal} onChange={e => setCalc(c => ({ ...c, tribunal: e.target.value, resultado: null }))}
                style={{ background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 13px", color: C.text, fontSize: 13, outline: "none" }}>
                <option value="">— Sem tribunal específico —</option>
                {TRIBUNAIS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </Grid>
          <Btn label="Calcular" onClick={calcular} style={{ marginTop: 16 }} />
          {calc.resultado && (
            <div style={{ marginTop: 20, padding: 16, background: C.inputBg, borderRadius: 12, border: `1px solid ${C.accent}44` }}>
              <div style={{ color: C.muted, fontSize: 12 }}>Vencimento:</div>
              <div style={{ color: C.accent, fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{fmtComDia(calc.resultado.data)}</div>
              <div style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>Marco: {fmtComDia(calc.marco)} +{calc.qtd} dias {calc.tipo}</div>
              {calc.tipo === "uteis" && calc.resultado.desc.length > 0 && (
                <div>
                  <div style={{ color: C.text, fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Dias desconsiderados ({calc.resultado.desc.length}):</div>
                  {calc.resultado.desc.map((d, i) => {
                    const fer = getFeriado(d.iso);
                    const susp = getSuspensaoTribunal(d.iso, calc.tribunal);
                    return (
                      <div key={i} style={{ padding: "8px 12px", background: C.card, borderRadius: 8, marginBottom: 6, border: `1px solid ${susp ? C.warning : C.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div><span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{fmtComDia(d.iso)}</span></div>
                          {fer && <Badge label={fer.tipo} color={fer.tipo === "nacional" ? C.danger : fer.tipo === "estadual" ? C.warning : C.accent} />}
                          {susp && !fer && <Badge label="Suspensão" color={C.warning} />}
                          {!fer && !susp && <Badge label="Fim de semana" color={C.muted} />}
                        </div>
                        {fer && <div style={{ color: C.text, fontSize: 12, marginTop: 4 }}>{fer.nome}<br /><span style={{ color: C.muted, fontSize: 11 }}>{fer.fonte}</span></div>}
                        {susp && <div style={{ color: C.warning, fontSize: 12, marginTop: 4 }}>⚠️ {susp.motivo}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
