import { useState } from "react";
import { C } from '../constants/paleta';
import { BANCOS, FORMAS_PAG, getParcClr } from '../constants/dominios';
import { fmt, fmtComDia, today } from '../utils/datas';
import { Badge, Btn, Card, Grid, Inp, Sel } from '../components/ui';
import PieChart from '../components/shared/PieChart';

function RelCaixa({ contratos, servicosAvulsos, advs, clientes, onClose }) {
  const hoje = today();
  const [filtroIni, setFiltroIni] = useState(hoje.slice(0, 7) + "-01");
  const [filtroFim, setFiltroFim] = useState(hoje);
  const [grafTipo, setGrafTipo] = useState("pizza");

  const parcelas = contratos.flatMap(c => c.parcelas.filter(p => p.status === "paga" && p.dataPag >= filtroIni && p.dataPag <= filtroFim).map(p => ({
    tipo: "contrato", contId: c.id, clienteId: c.clienteId, valor: p.valor, data: p.dataPag, forma: p.forma,
    caixaEsc: c.caixaEsc || 0, rateios: c.rateios || [],
  })));
  const avulsos = servicosAvulsos.filter(s => s.status === "paga" && s.data >= filtroIni && s.data <= filtroFim).map(s => ({
    tipo: "avulso", contId: "Avulso", clienteId: s.clienteId, valor: s.valor, data: s.data, forma: s.forma,
    caixaEsc: s.caixaEsc || 0, rateios: s.rateios || [],
  }));
  const todos = [...parcelas, ...avulsos].sort((a, b) => a.data.localeCompare(b.data));
  const totalBruto = todos.reduce((s, x) => s + x.valor, 0);
  const totalCaixa = todos.reduce((s, x) => s + x.valor * (x.caixaEsc || 0) / 100, 0);

  const porAdv = advs.map(adv => {
    const ganhos = todos.reduce((s, x) => {
      const r = (x.rateios || []).find(r => r.advId === adv.id);
      return s + (r ? x.valor * (parseFloat(r.perc) || 0) / 100 : 0);
    }, 0);
    return { ...adv, ganhos };
  }).filter(a => a.ganhos > 0);
  const totalDistrib = porAdv.reduce((s, a) => s + a.ganhos, 0);
  const naoDistrib = Math.max(0, totalBruto - totalCaixa - totalDistrib);

  const pizzaSlices = [
    ...porAdv.map(a => ({ label: a.nome.split(" ")[0] + " " + a.nome.split(" ").at(-1), value: a.ganhos, color: a.cor })),
    ...(totalCaixa > 0 ? [{ label: "Caixa Escritório", value: totalCaixa, color: C.warning }] : []),
    ...(naoDistrib > 0 ? [{ label: "Não distribuído", value: naoDistrib, color: C.border }] : []),
  ];

  const maxBar = Math.max(...porAdv.map(a => a.ganhos), totalCaixa, 1);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 2000, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "30px 0" }}>
      <div style={{ width: "min(920px,96vw)", background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ color: C.silver, fontWeight: 600, fontSize: 17, fontFamily: "'DM Serif Display',serif" }}>💼 Relatório de Caixa</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn label="🖨 Imprimir" small onClick={() => window.print()} color={C.accent2} />
            <Btn label="✕ Fechar" small onClick={onClose} color={C.border} />
          </div>
        </div>
        <Grid cols="1fr 1fr" gap={12} style={{ marginBottom: 20 }}>
          <Inp label="De" type="date" value={filtroIni} onChange={setFiltroIni} />
          <Inp label="Até" type="date" value={filtroFim} onChange={setFiltroFim} />
        </Grid>
        <Grid cols="repeat(4,1fr)" gap={12} style={{ marginBottom: 20 }}>
          {[
            [`R$ ${totalBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, `Bruto (${todos.length} receb.)`, C.success],
            [`R$ ${totalCaixa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Caixa Escritório", C.warning],
            [`R$ ${totalDistrib.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Distribuído (advogados)", C.accent],
            [`R$ ${naoDistrib.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Não distribuído", C.muted],
          ].map(([v, l, cor]) => (
            <div key={l} style={{ background: C.tableHead, borderRadius: 12, padding: 14, textAlign: "center" }}>
              <div style={{ color: cor, fontWeight: 700, fontSize: 16 }}>{v}</div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </Grid>
        <Card style={{ marginBottom: 20, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ color: C.silver, fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>📊 Distribuição do Caixa</div>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
              {[["pizza", "🥧 Pizza"], ["barras", "📊 Barras"]].map(([v, l]) => (
                <button key={v} onClick={() => setGrafTipo(v)} style={{ padding: "6px 14px", background: grafTipo === v ? C.accent + "28" : "transparent", color: grafTipo === v ? C.accent2 : C.muted, border: "none", cursor: "pointer", fontSize: 12, fontWeight: grafTipo === v ? 700 : 400 }}>{l}</button>
              ))}
            </div>
          </div>
          {grafTipo === "pizza" && (
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
              <PieChart slices={pizzaSlices} size={180} />
            </div>
          )}
          {grafTipo === "barras" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...porAdv.map(a => ({ label: a.nome.split(" ")[0] + " " + a.nome.split(" ").at(-1), valor: a.ganhos, cor: a.cor })),
                ...(totalCaixa > 0 ? [{ label: "Caixa Escritório", valor: totalCaixa, cor: C.warning }] : []),
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 140, color: item.cor, fontWeight: 600, fontSize: 13, flexShrink: 0 }}>{item.label}</div>
                  <div style={{ flex: 1, background: C.barTrack, borderRadius: 20, height: 22, overflow: "hidden", position: "relative" }}>
                    <div style={{ width: `${(item.valor / maxBar) * 100}%`, background: item.cor, height: "100%", borderRadius: 20, transition: "width .4s ease", minWidth: item.valor > 0 ? 4 : 0 }} />
                  </div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 13, width: 130, textAlign: "right", flexShrink: 0 }}>
                    R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ color: C.muted, fontSize: 11, width: 42, flexShrink: 0 }}>
                    {totalBruto > 0 ? ((item.valor / totalBruto) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card style={{ marginBottom: 20, padding: 16 }}>
          <div style={{ color: C.silver, fontWeight: 600, marginBottom: 14, fontSize: 13, letterSpacing: "0.2px" }}>⚖️ Divisão por Advogado</div>
          {porAdv.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontStyle: "italic" }}>Nenhum rateio registrado no período.</div>}
          {porAdv.map(a => {
            const perc = totalBruto > 0 ? (a.ganhos / totalBruto * 100).toFixed(1) : 0;
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 140, color: a.cor, fontWeight: 600, fontSize: 13, flexShrink: 0 }}>{a.nome.split(" ")[0] + " " + a.nome.split(" ").at(-1)}</div>
                <div style={{ flex: 1, background: C.barTrack, borderRadius: 20, height: 8, overflow: "hidden" }}>
                  <div style={{ width: `${perc}%`, background: a.cor, height: "100%", borderRadius: 20 }} />
                </div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 13, width: 130, textAlign: "right", flexShrink: 0 }}>R$ {a.ganhos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                <div style={{ color: C.muted, fontSize: 11, width: 42, flexShrink: 0 }}>{perc}%</div>
              </div>
            );
          })}
          <div style={{ marginTop: 14, padding: "10px 14px", background: C.warning + "18", border: `1px solid ${C.warning}33`, borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.warning, fontWeight: 600 }}>💼 Caixa Escritório</span>
            <span style={{ color: C.warning, fontWeight: 700 }}>R$ {totalCaixa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({totalBruto > 0 ? (totalCaixa / totalBruto * 100).toFixed(1) : 0}%)</span>
          </div>
        </Card>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, color: C.silver, fontWeight: 600, fontSize: 13, letterSpacing: "0.2px" }}>📋 Extrato Detalhado do Período</div>
          {todos.length === 0 && <div style={{ padding: 20, color: C.muted, fontSize: 13, fontStyle: "italic" }}>Nenhum recebimento no período selecionado.</div>}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.tableHead }}>
                {["Data", "Tipo", "Cliente", "Valor", "Forma", "Caixa Esc.", "Advogados"].map(h => (
                  <th key={h} style={{ color: C.muted, fontSize: 10.5, padding: "10px 14px", textAlign: "left", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todos.map((r, i) => {
                const cli = clientes.find(c => c.id === r.clienteId);
                const caixaVal = r.valor * (r.caixaEsc || 0) / 100;
                const rateioStr = (r.rateios || []).map(rt => { const adv = advs.find(a => a.id === rt.advId); return `${adv?.nome?.split(" ")[0] || rt.advId}: R$${(r.valor * parseFloat(rt.perc || 0) / 100).toFixed(0)}`; }).join(", ");
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 14px", color: C.muted, fontSize: 12 }}>{fmtComDia(r.data)}</td>
                    <td style={{ padding: "10px 14px" }}><Badge label={r.tipo} color={r.tipo === "contrato" ? C.accent : C.accent2} /></td>
                    <td style={{ padding: "10px 14px", color: C.text, fontSize: 12 }}>{cli?.nome || "—"}</td>
                    <td style={{ padding: "10px 14px", color: C.success, fontWeight: 700, fontSize: 13 }}>R$ {r.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: "10px 14px", color: C.muted, fontSize: 12 }}>{r.forma}</td>
                    <td style={{ padding: "10px 14px", color: C.warning, fontSize: 12 }}>{r.caixaEsc > 0 ? `${r.caixaEsc}% = R$${caixaVal.toFixed(0)}` : "—"}</td>
                    <td style={{ padding: "10px 14px", color: C.muted, fontSize: 11 }}>{rateioStr || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
            {todos.length > 0 && (
              <tfoot>
                <tr style={{ background: C.tableHead, borderTop: `2px solid ${C.border}` }}>
                  <td colSpan={3} style={{ padding: "12px 14px", color: C.text, fontWeight: 600 }}>TOTAL</td>
                  <td style={{ padding: "12px 14px", color: C.success, fontWeight: 700 }}>R$ {totalBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td />
                  <td style={{ padding: "12px 14px", color: C.warning, fontWeight: 700 }}>R$ {totalCaixa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </Card>
      </div>
    </div>
  );
}

export default function Financeiro({ contratos, setContratos, clientes, processos, advs, servicosAvulsos, setServicosAvulsos }) {
  const [view, setView] = useState(null);
  const [form, setForm] = useState(null);
  const [baixaForm, setBaixaForm] = useState(null);
  const [tabFin, setTabFin] = useState("contratos");
  const [showRel, setShowRel] = useState(false);
  const hoje = today();

  function salvar() {
    if (!form.clienteId || !form.total) return alert("Cliente e valor total obrigatórios.");
    const total = parseFloat(form.total) || 0, nP = parseInt(form.nParc) || 1, ent = parseFloat(form.entrada) || 0;
    const valP = (total - ent) / nP, db = form.venc1 || hoje;
    const parcelas = Array.from({ length: nP }, (_, i) => {
      const d = new Date(db + "T12:00:00"); d.setMonth(d.getMonth() + i);
      return { n: i + 1, venc: d.toISOString().split("T")[0], valor: Math.round(valP * 100) / 100, status: "aberta", dataPag: "", forma: "", banco: "", conta: "", comp: "" };
    });
    const id = `${form.clienteId}-${String.fromCharCode(65 + contratos.filter(c => c.clienteId === form.clienteId).length)}`;
    setContratos(c => [...c, { id, clienteId: form.clienteId, processoId: form.processoId || "", objeto: form.objeto || "", total, entrada: ent, caixaEsc: parseFloat(form.caixaEsc) || 0, rateios: form.rateios || [], parcelas }]);
    setForm(null);
  }

  function salvarAvulso() {
    if (!form.clienteId || !form.valor) return alert("Cliente e valor obrigatórios.");
    const novo = { id: Date.now(), clienteId: form.clienteId, descricao: form.descricao || "Serviço avulso", valor: parseFloat(form.valor) || 0, data: form.data || hoje, forma: form.forma || "Pix", banco: form.banco || "", status: "aberta", rateios: form.rateios || [], caixaEsc: parseFloat(form.caixaEsc) || 0 };
    setServicosAvulsos(s => [...s, novo]); setForm(null);
  }

  function baixar() {
    if (!baixaForm.forma) return alert("Informe a forma.");
    setContratos(cs => cs.map(c => c.id !== baixaForm.cid ? c : { ...c, parcelas: c.parcelas.map(p => p.n !== baixaForm.n ? p : { ...p, status: "paga", dataPag: baixaForm.data || hoje, forma: baixaForm.forma, banco: baixaForm.banco, conta: baixaForm.conta, comp: baixaForm.comp }) }));
    setBaixaForm(null);
  }

  const contrato = view ? contratos.find(f => f.id === view) : null;
  const cli = contrato ? clientes.find(c => c.id === contrato.clienteId) : null;
  const tRec = contratos.reduce((s, c) => s + c.parcelas.filter(p => p.status === "aberta").reduce((a, p) => a + p.valor, 0), 0);
  const tAtr = contratos.reduce((s, c) => s + c.parcelas.filter(p => p.status === "atrasada" || (p.venc < hoje && p.status === "aberta")).reduce((a, p) => a + p.valor, 0), 0);
  const tRcb = contratos.reduce((s, c) => s + c.parcelas.filter(p => p.status === "paga").reduce((a, p) => a + p.valor, 0), 0);
  const tAvPago = servicosAvulsos.filter(s => s.status === "paga").reduce((a, s) => a + s.valor, 0);
  const tCaixaEsc = contratos.reduce((s, c) => s + (parseFloat(c.caixaEsc || 0) / 100) * c.parcelas.filter(p => p.status === "paga").reduce((a, p) => a + p.valor, 0), 0)
    + servicosAvulsos.filter(s => s.status === "paga").reduce((a, s) => a + (parseFloat(s.caixaEsc || 0) / 100) * s.valor, 0);

  const RateioEditor = ({ rateios, onChange, total }) => (
    <div style={{ gridColumn: "span 3" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>⚖️ Divisão entre Advogados</div>
        <Btn label="+ Adicionar advogado" small color={C.accent2} onClick={() => onChange([...(rateios || []), { advId: "", perc: "" }])} />
      </div>
      {(rateios || []).map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-end" }}>
          <Sel label={i === 0 ? "Advogado" : ""} value={r.advId} onChange={v => onChange(rateios.map((x, j) => j === i ? { ...x, advId: v } : x))} options={[{ value: "", label: "Selecione..." }, ...advs.map(a => ({ value: a.id, label: a.nome }))]} style={{ flex: 2 }} />
          <Inp label={i === 0 ? "% participação" : ""} type="number" value={r.perc} onChange={v => onChange(rateios.map((x, j) => j === i ? { ...x, perc: v } : x))} style={{ flex: 1 }} />
          {total > 0 && r.perc > 0 && <div style={{ color: C.accent, fontSize: 12, paddingBottom: 10 }}>R$ {(parseFloat(total || 0) * parseFloat(r.perc || 0) / 100).toFixed(2)}</div>}
          <Btn label="✕" small color={C.danger} onClick={() => onChange(rateios.filter((_, j) => j !== i))} style={{ marginBottom: 0 }} />
        </div>
      ))}
      {(rateios || []).length > 0 && (
        <div style={{ color: C.success, fontSize: 12, marginTop: 4 }}>
          Total: {((rateios || []).reduce((s, r) => s + parseFloat(r.perc || 0), 0)).toFixed(1)}% (excluindo caixa)
        </div>
      )}
    </div>
  );

  if (showRel) return <RelCaixa contratos={contratos} servicosAvulsos={servicosAvulsos} advs={advs} clientes={clientes} onClose={() => setShowRel(false)} />;

  if (form && form._tipo === "avulso") return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Btn label="← Voltar" onClick={() => setForm(null)} color={C.border} />
        <h2 style={{ color: C.text, margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>Novo Serviço Avulso / À Vista</h2>
      </div>
      <Card>
        <Grid cols="1fr 1fr 1fr" gap={14}>
          <Sel label="Cliente" value={form.clienteId || ""} onChange={v => setForm(f => ({ ...f, clienteId: v }))} style={{ gridColumn: "span 2" }} options={[{ value: "", label: "Selecione..." }, ...clientes.map(c => ({ value: c.id, label: `${c.id} — ${c.nome}` }))]} />
          <Inp label="Data" type="date" value={form.data || hoje} onChange={v => setForm(f => ({ ...f, data: v }))} />
          <Inp label="Descrição do serviço" value={form.descricao || ""} onChange={v => setForm(f => ({ ...f, descricao: v }))} style={{ gridColumn: "span 3" }} />
          <Inp label="Valor (R$)" type="number" value={form.valor || ""} onChange={v => setForm(f => ({ ...f, valor: v }))} />
          <Sel label="Forma de Pagamento" value={form.forma || "Pix"} onChange={v => setForm(f => ({ ...f, forma: v }))} options={FORMAS_PAG.map(x => ({ value: x, label: x }))} />
          <Inp label="% caixa escritório" type="number" value={form.caixaEsc || ""} onChange={v => setForm(f => ({ ...f, caixaEsc: v }))} />
          <RateioEditor rateios={form.rateios || []} onChange={v => setForm(f => ({ ...f, rateios: v }))} total={parseFloat(form.valor || 0)} />
        </Grid>
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Btn label="Salvar Serviço" onClick={salvarAvulso} />
          <Btn label="Cancelar" onClick={() => setForm(null)} color={C.border} />
        </div>
      </Card>
    </div>
  );

  if (form) return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Btn label="← Voltar" onClick={() => setForm(null)} color={C.border} />
        <h2 style={{ color: C.text, margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>Novo Contrato de Honorários</h2>
      </div>
      <Card>
        <Grid cols="1fr 1fr 1fr" gap={14}>
          <Sel label="Cliente" value={form.clienteId || ""} onChange={v => setForm(f => ({ ...f, clienteId: v }))} style={{ gridColumn: "span 2" }} options={[{ value: "", label: "Selecione..." }, ...clientes.map(c => ({ value: c.id, label: `${c.id} — ${c.nome}` }))]} />
          <Sel label="Processo (opcional)" value={form.processoId || ""} onChange={v => setForm(f => ({ ...f, processoId: v }))} options={[{ value: "", label: "Nenhum" }, ...processos.filter(p => !form.clienteId || p.clienteId === form.clienteId).map(p => ({ value: p.id, label: p.id }))]} />
          <Inp label="Objeto" value={form.objeto || ""} onChange={v => setForm(f => ({ ...f, objeto: v }))} style={{ gridColumn: "span 3" }} />
          <Inp label="Valor Total (R$)" type="number" value={form.total || ""} onChange={v => setForm(f => ({ ...f, total: v }))} />
          <Inp label="Entrada (R$)" type="number" value={form.entrada || ""} onChange={v => setForm(f => ({ ...f, entrada: v }))} />
          <Inp label="Nº Parcelas" type="number" value={form.nParc || ""} onChange={v => setForm(f => ({ ...f, nParc: v }))} />
          <Inp label="Vencimento 1ª Parcela" type="date" value={form.venc1 || ""} onChange={v => setForm(f => ({ ...f, venc1: v }))} />
          <Inp label="% caixa escritório" type="number" value={form.caixaEsc || ""} onChange={v => setForm(f => ({ ...f, caixaEsc: v }))} style={{ gridColumn: "span 2" }} />
          <RateioEditor rateios={form.rateios || []} onChange={v => setForm(f => ({ ...f, rateios: v }))} total={parseFloat(form.total || 0)} />
        </Grid>
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Btn label="Gerar Contrato" onClick={salvar} />
          <Btn label="Cancelar" onClick={() => setForm(null)} color={C.border} />
        </div>
      </Card>
    </div>
  );

  if (view && contrato) return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}><Btn label="← Voltar" onClick={() => setView(null)} color={C.border} /></div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div><div style={{ color: C.muted, fontSize: 11 }}>Contrato</div><div style={{ color: C.accent, fontWeight: 700 }}>{contrato.id}</div></div>
          <div><div style={{ color: C.muted, fontSize: 11 }}>Cliente</div><div style={{ color: C.text, fontWeight: 600 }}>{cli?.nome}</div></div>
          <div><div style={{ color: C.muted, fontSize: 11 }}>Objeto</div><div style={{ color: C.muted, fontSize: 12 }}>{contrato.objeto || "—"}</div></div>
          <div><div style={{ color: C.muted, fontSize: 11 }}>Total</div><div style={{ color: C.success, fontWeight: 700 }}>R$ {contrato.total.toLocaleString("pt-BR")}</div></div>
          <div><div style={{ color: C.muted, fontSize: 11 }}>Caixa Esc.</div><div style={{ color: C.warning }}>{contrato.caixaEsc || 0}%</div></div>
        </div>
        {(contrato.rateios || []).length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>Rateio:</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {contrato.rateios.map((r, i) => { const adv = advs.find(a => a.id === r.advId); return <Badge key={i} label={`${adv?.nome?.split(" ")[0] || r.advId}: ${r.perc}%`} color={adv?.cor || C.accent} />; })}
            </div>
          </div>
        )}
      </Card>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.tableHead }}>
              {["Parc.", "Venc.", "Valor", "Status", "Pagamento", "Forma", "Banco", ""].map(h => (
                <th key={h} style={{ color: C.muted, fontSize: 10.5, padding: "10px 12px", textAlign: "left", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contrato.parcelas.map(p => (
              <tr key={p.n} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 12px", color: C.muted, fontSize: 13 }}>#{p.n}</td>
                <td style={{ padding: "10px 12px", color: p.venc < hoje && p.status === "aberta" ? C.danger : C.text, fontSize: 13 }}>{fmtComDia(p.venc)}</td>
                <td style={{ padding: "10px 12px", color: C.text, fontSize: 13 }}>R$ {p.valor.toLocaleString("pt-BR")}</td>
                <td style={{ padding: "10px 12px" }}><Badge label={p.status} color={getParcClr()[p.status] || C.muted} /></td>
                <td style={{ padding: "10px 12px", color: C.muted, fontSize: 12 }}>{p.dataPag ? fmtComDia(p.dataPag) : "—"}</td>
                <td style={{ padding: "10px 12px", color: C.muted, fontSize: 12 }}>{p.forma || "—"}</td>
                <td style={{ padding: "10px 12px", color: C.muted, fontSize: 12 }}>{p.banco || "—"}</td>
                <td style={{ padding: "10px 12px" }}>
                  {p.status !== "paga" && <Btn label="Baixar" small onClick={() => setBaixaForm({ cid: contrato.id, n: p.n, data: hoje, forma: "Pix", banco: "NuBank", conta: "", comp: "" })} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {baixaForm && (
        <Card style={{ marginTop: 16 }}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 12 }}>Dar Baixa — Parcela #{baixaForm.n}</div>
          <Grid cols="1fr 1fr 1fr" gap={12}>
            <Inp label="Data do Pagamento" type="date" value={baixaForm.data} onChange={v => setBaixaForm(f => ({ ...f, data: v }))} />
            <Sel label="Forma de Pagamento" value={baixaForm.forma} onChange={v => setBaixaForm(f => ({ ...f, forma: v }))} options={FORMAS_PAG.map(x => ({ value: x, label: x }))} />
            <Sel label="Banco" value={baixaForm.banco} onChange={v => setBaixaForm(f => ({ ...f, banco: v }))} options={BANCOS.map(x => ({ value: x, label: x }))} />
            <Inp label="Conta / Identificação" value={baixaForm.conta || ""} onChange={v => setBaixaForm(f => ({ ...f, conta: v }))} />
            <Inp label="Comprovante / TxID" value={baixaForm.comp || ""} onChange={v => setBaixaForm(f => ({ ...f, comp: v }))} style={{ gridColumn: "span 2" }} />
          </Grid>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <Btn label="Confirmar Baixa" onClick={baixar} color={C.success} />
            <Btn label="Cancelar" onClick={() => setBaixaForm(null)} color={C.border} />
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: C.text, margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>Financeiro</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="📊 Relatório de Caixa" onClick={() => setShowRel(true)} color={C.warning} />
          <Btn label="+ Serviço Avulso" onClick={() => setForm({ _tipo: "avulso", clienteId: "", descricao: "", valor: "", data: hoje, forma: "Pix", banco: "NuBank", rateios: [], caixaEsc: "" })} color={C.accent2} />
          <Btn label="+ Novo Contrato" onClick={() => setForm({ clienteId: "", processoId: "", objeto: "", total: "", entrada: "", nParc: "", venc1: "", rateios: [], caixaEsc: "" })} />
        </div>
      </div>
      <Grid cols="repeat(5,1fr)" gap={12} style={{ marginBottom: 16 }}>
        {[["Recebido", tRcb, C.success], ["A Receber", tRec, C.accent], ["Vencido", tAtr, C.danger], ["Avulsos Recebidos", tAvPago, C.accent2], ["Caixa Escritório", tCaixaEsc, C.warning]].map(([l, v, cor]) => (
          <Card key={l} style={{ textAlign: "center", padding: 14 }}>
            <div style={{ color: cor, fontSize: 20, fontWeight: 700 }}>R$ {v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{l}</div>
          </Card>
        ))}
      </Grid>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["contratos", "📋 Contratos"], ["avulsos", "💳 Serviços Avulsos"]].map(([v, l]) => (
          <Btn key={v} label={l} onClick={() => setTabFin(v)} color={tabFin === v ? C.accent : C.border} />
        ))}
      </div>
      {tabFin === "avulsos" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.tableHead }}>
                {["Data", "Cliente", "Descrição", "Valor", "Forma", "Status", ""].map(h => (
                  <th key={h} style={{ color: C.muted, fontSize: 10.5, padding: "10px 12px", textAlign: "left", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {servicosAvulsos.map(s => {
                const cl = clientes.find(x => x.id === s.clienteId);
                return (
                  <tr key={s.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 12px", color: C.muted, fontSize: 12 }}>{fmtComDia(s.data)}</td>
                    <td style={{ padding: "10px 12px", color: C.text, fontSize: 13 }}>{cl?.nome || "—"}</td>
                    <td style={{ padding: "10px 12px", color: C.muted, fontSize: 12 }}>{s.descricao}</td>
                    <td style={{ padding: "10px 12px", color: C.success, fontWeight: 700, fontSize: 13 }}>R$ {s.valor.toLocaleString("pt-BR")}</td>
                    <td style={{ padding: "10px 12px", color: C.muted, fontSize: 12 }}>{s.forma}</td>
                    <td style={{ padding: "10px 12px" }}><Badge label={s.status} color={s.status === "paga" ? C.success : C.accent} /></td>
                    <td style={{ padding: "10px 12px" }}>
                      {s.status !== "paga" && <Btn label="✓ Baixar" small color={C.success} onClick={() => setServicosAvulsos(list => list.map(x => x.id === s.id ? { ...x, status: "paga" } : x))} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      {tabFin === "contratos" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.tableHead }}>
                {["Contrato", "Cliente", "Objeto", "Total", "Parcelas", "Situação", ""].map(h => (
                  <th key={h} style={{ color: C.muted, fontSize: 10.5, padding: "12px 16px", textAlign: "left", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contratos.map(c => {
                const cl = clientes.find(x => x.id === c.clienteId);
                const pagas = c.parcelas.filter(p => p.status === "paga").length;
                const atras = c.parcelas.filter(p => p.venc < hoje && p.status === "aberta").length;
                return (
                  <tr key={c.id} style={{ borderTop: `1px solid ${C.border}`, transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = C.glass} onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <td style={{ padding: "12px 16px", color: C.accent, fontWeight: 700, fontSize: 13 }}>{c.id}</td>
                    <td style={{ padding: "12px 16px", color: C.text, fontSize: 13 }}>{cl?.nome}</td>
                    <td style={{ padding: "12px 16px", color: C.muted, fontSize: 12, maxWidth: 140 }}>{(c.objeto || "—").slice(0, 35)}</td>
                    <td style={{ padding: "12px 16px", color: C.text, fontSize: 13 }}>R$ {c.total.toLocaleString("pt-BR")}</td>
                    <td style={{ padding: "12px 16px", color: C.muted, fontSize: 12 }}>{pagas}/{c.parcelas.length}</td>
                    <td style={{ padding: "12px 16px" }}>{atras > 0 ? <Badge label={`${atras} atrasada(s)`} color={C.danger} /> : <Badge label="Em dia" color={C.success} />}</td>
                    <td style={{ padding: "12px 16px" }}><Btn label="Ver" small onClick={() => setView(c.id)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
