import { useState } from "react";
import { C } from '../constants/paleta';
import { today, fmt, fmtComDia } from '../utils/datas';
import { fmtHoras, addDias } from '../utils/prazos';
import { getStatusClr } from '../constants/dominios';
import { TIPOS_DOC_PROCESSUAL, TIPOS_PECA } from '../constants/dominios';
import { Badge, Card, Inp, Sel, Btn, Grid } from '../components/ui';
import TribunalInput from '../components/shared/TribunalInput';
import ComarcaInput from '../components/shared/ComarcaInput';
import { useEffect } from "react";

// ── Modal de Documento Processual ────────────────────────────────────────────
function DocProcessualModal({ processo, advs, onSave, onClose, setAgenda }) {
  const [doc, setDoc] = useState({
    tipo: "decisao", data: today(), descricao: "",
    temPrazo: false, qtdDias: "", tipoDias: "",
    responsavel: processo.responsavel || advs[0]?.id || "",
  });
  const [prazoCalc, setPrazoCalc] = useState(null);
  const [prazoErro, setPrazoErro] = useState("");

  useEffect(() => {
    if (doc.temPrazo && doc.data && doc.qtdDias && doc.tipoDias) {
      const r = addDias(doc.data, parseInt(doc.qtdDias) || 1, doc.tipoDias, processo.tribunal);
      setPrazoCalc(r.data);
      setPrazoErro("");
    } else {
      setPrazoCalc(null);
      if (doc.temPrazo && (!doc.qtdDias || !doc.tipoDias)) setPrazoErro("Preencha a quantidade e o tipo de contagem.");
      else setPrazoErro("");
    }
  }, [doc.temPrazo, doc.data, doc.qtdDias, doc.tipoDias]);

  function salvar() {
    if (!doc.descricao) return alert("Descreva o documento.");
    if (doc.temPrazo && (!doc.qtdDias || !doc.tipoDias)) return alert("Informe a quantidade de dias e o tipo de contagem para o prazo.");
    onSave({ ...doc, id: Date.now() });
    if (doc.temPrazo && prazoCalc) {
      const tipoLabel = TIPOS_DOC_PROCESSUAL.find(t => t.value === doc.tipo)?.label || doc.tipo;
      setAgenda(a => [...a, {
        id: Date.now() + 1, tipo: "prazo",
        titulo: `Prazo — ${tipoLabel} — ${processo.id}`,
        data: prazoCalc, hora: "23:59", local: "",
        obs: `${doc.descricao} (${doc.qtdDias} dias ${doc.tipoDias} a partir de ${fmt(doc.data)})`,
        processoId: processo.id, responsavel: doc.responsavel,
      }]);
    }
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card style={{ width: 600, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: C.silver, fontWeight: 600, fontSize: 15, letterSpacing: "0.3px" }}>📋 Novo Documento Processual</div>
          <Btn label="✕" small onClick={onClose} color={C.border} />
        </div>
        <Grid cols="1fr 1fr" gap={14}>
          <Sel label="Tipo de Documento" value={doc.tipo} onChange={v => { const t = TIPOS_DOC_PROCESSUAL.find(x => x.value === v); setDoc(d => ({ ...d, tipo: v, qtdDias: String(t?.prazoPadrao || 15), tipoDias: t?.tipoPrazo || "uteis" })); }} options={TIPOS_DOC_PROCESSUAL.map(t => ({ value: t.value, label: t.label }))} />
          <Inp label="Data da Publicação/Juntada" type="date" value={doc.data} onChange={v => setDoc(d => ({ ...d, data: v }))} />
          <Inp label="Descrição / Ementa" value={doc.descricao} onChange={v => setDoc(d => ({ ...d, descricao: v }))} style={{ gridColumn: "span 2" }} />
          <Sel label="Responsável pelo prazo" value={doc.responsavel} onChange={v => setDoc(d => ({ ...d, responsavel: v }))} options={advs.map(a => ({ value: a.id, label: a.nome }))} />
        </Grid>
        <div style={{ marginTop: 16, padding: 14, background: C.inputBg, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: doc.temPrazo ? 14 : 0 }}>
            <button onClick={() => setDoc(d => ({ ...d, temPrazo: !d.temPrazo }))} style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${doc.temPrazo ? C.accent : C.muted}`, background: doc.temPrazo ? C.accent : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>{doc.temPrazo ? "✓" : ""}</button>
            <span style={{ color: C.text, fontWeight: 600 }}>Há prazo a contar deste documento?</span>
          </div>
          {doc.temPrazo && (
            <Grid cols="1fr 1fr 1fr" gap={12}>
              <Inp label="Quantidade de dias *" type="number" value={doc.qtdDias} onChange={v => setDoc(d => ({ ...d, qtdDias: v }))} placeholder="Ex: 15" />
              <Sel label="Tipo de prazo *" value={doc.tipoDias} onChange={v => setDoc(d => ({ ...d, tipoDias: v }))} options={[{ value: "", label: "— Selecione —" }, { value: "uteis", label: "Dias úteis (art. 219 CPC)" }, { value: "corridos", label: "Dias corridos" }]} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ color: C.muted, fontSize: 12 }}>Vencimento calculado</label>
                {prazoCalc ? (
                  <div style={{ background: C.accent + "14", border: `1px solid ${C.accent}35`, borderRadius: 12, padding: "10px 14px" }}>
                    <div style={{ color: C.accent, fontWeight: 700, fontSize: 16 }}>{fmtComDia(prazoCalc)}</div>
                    <div style={{ color: C.muted, fontSize: 10 }}>Será adicionado à agenda</div>
                  </div>
                ) : (
                  <div style={{ color: prazoErro ? C.danger : C.muted, fontSize: 12, padding: "8px 0" }}>{prazoErro || "Preencha os campos ao lado"}</div>
                )}
              </div>
            </Grid>
          )}
        </div>
        {doc.temPrazo && prazoCalc && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: C.success + "15", border: `1px solid ${C.success}33`, borderRadius: 8 }}>
            <div style={{ color: C.success, fontWeight: 600, fontSize: 13 }}>✓ Prazo será criado na agenda de {advs.find(a => a.id === doc.responsavel)?.nome}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Vencimento: {fmtComDia(prazoCalc)}</div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Btn label="Salvar Documento" onClick={salvar} />
          <Btn label="Cancelar" onClick={onClose} color={C.border} />
        </div>
      </Card>
    </div>
  );
}

// ── Módulo Processos ──────────────────────────────────────────────────────────
export default function Processos({ processos, setProcessos, clientes, andamentos, setAndamentos, pecas, setPecas, advs, agenda, setAgenda }) {
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState(null);
  const [view, setView] = useState(null);
  const [andForm, setAndForm] = useState(null);
  const [tabView, setTabView] = useState("andamentos");
  const [docModal, setDocModal] = useState(false);
  const [ordem, setOrdem] = useState("codigo");
  const statusClr = getStatusClr();

  const tipoDocClr = { oficio: C.accent, decisao: C.warning, despacho: C.muted, sentenca: C.success, acordao: C.accent2, intimacao: C.danger, citacao: C.danger };

  function ultimoAndProc(procId) {
    const ands = andamentos.filter(a => a.processoId === procId);
    return ands.length ? ands.sort((a, b) => b.data.localeCompare(a.data))[0].data : "";
  }

  const base = processos.filter(p =>
    p.id.toLowerCase().includes(busca.toLowerCase()) || p.nup.includes(busca) ||
    (clientes.find(c => c.id === p.clienteId) || {}).nome?.toLowerCase().includes(busca.toLowerCase())
  );
  const lista = [...base].sort((a, b) => {
    if (ordem === "alfa") { const ca = clientes.find(c => c.id === a.clienteId)?.nome || ""; const cb = clientes.find(c => c.id === b.clienteId)?.nome || ""; return ca.localeCompare(cb, "pt-BR"); }
    if (ordem === "atualizacao") { const da = ultimoAndProc(a.id) || a.id; const db = ultimoAndProc(b.id) || b.id; return db.localeCompare(da); }
    return a.id.localeCompare(b.id);
  });

  function nextProcId(clienteId) {
    const ex = processos.filter(p => p.clienteId === clienteId).map(p => p.id.split("-")[1]).filter(Boolean);
    if (!ex.length) return `${clienteId}-A`;
    const last = ex.sort().at(-1);
    return `${clienteId}-${String.fromCharCode(last.charCodeAt(0) + 1)}`;
  }

  function salvar() {
    if (!form.clienteId || !form.nup) return alert("Cliente e NUP obrigatórios.");
    const id = form._novo ? nextProcId(form.clienteId) : form.id;
    if (form._novo) setProcessos(p => [...p, { ...form, id, _novo: undefined }]);
    else setProcessos(p => p.map(x => x.id === form.id ? { ...form, _novo: undefined } : x));
    setForm(null);
  }

  function addResultado(tipo, tipoItem) {
    const novo = { data: today(), tipo: tipoItem, obs: "" };
    setProcessos(ps => ps.map(p => p.id === view ? { ...p, [tipo]: [...(p[tipo] || []), novo] } : p));
  }

  function saveDocProcessual(doc) {
    setProcessos(ps => ps.map(p => p.id === view ? { ...p, docsProcessuais: [...(p.docsProcessuais || []), doc] } : p));
  }

  if (form) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Btn label="← Voltar" onClick={() => setForm(null)} color={C.border} />
        <h2 style={{ color: C.text, margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>{form._novo ? "Novo Processo" : "Editar Processo"}</h2>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: C.silver, fontWeight: 600, marginBottom: 14, fontSize: 13, letterSpacing: "0.2px" }}>⚖️ Dados do Processo</div>
        <Grid cols="1fr 1fr 1fr" gap={14}>
          <Sel label="Cliente" value={form.clienteId} onChange={v => setForm(f => ({ ...f, clienteId: v }))} style={{ gridColumn: "span 2" }} options={[{ value: "", label: "Selecione..." }, ...clientes.map(c => ({ value: c.id, label: `${c.id} — ${c.nome}` }))]} />
          <Sel label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={["ativo", "suspenso", "arquivado", "encerrado"].map(s => ({ value: s, label: s }))} />
          <Inp label="Número CNJ (NUP)" value={form.nup} onChange={v => setForm(f => ({ ...f, nup: v }))} style={{ gridColumn: "span 2" }} />
          <Sel label="Responsável" value={form.responsavel || ""} onChange={v => setForm(f => ({ ...f, responsavel: v }))} options={[{ value: "", label: "Selecione..." }, ...advs.map(a => ({ value: a.id, label: a.nome }))]} />
          <div style={{ gridColumn: "span 3" }}><TribunalInput value={form.tribunal} onChange={v => setForm(f => ({ ...f, tribunal: v, comarca: "" }))} /></div>
          <div><ComarcaInput value={form.comarca} onChange={v => setForm(f => ({ ...f, comarca: v }))} /></div>
          <Inp label="Vara" value={form.vara} onChange={v => setForm(f => ({ ...f, vara: v }))} />
          <Inp label="Classe Processual" value={form.classe} onChange={v => setForm(f => ({ ...f, classe: v }))} />
          <Inp label="Assunto" value={form.assunto} onChange={v => setForm(f => ({ ...f, assunto: v }))} style={{ gridColumn: "span 2" }} />
          <Inp label="Valor da Causa (R$)" value={form.valor || ""} onChange={v => setForm(f => ({ ...f, valor: v, valorCausa: parseFloat(v) || 0 }))} />
          <Inp label="Tags" value={form.tags || ""} onChange={v => setForm(f => ({ ...f, tags: v }))} />
          <Inp label="Observações" value={form.obs || ""} onChange={v => setForm(f => ({ ...f, obs: v }))} style={{ gridColumn: "span 3" }} />
        </Grid>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: C.silver, fontWeight: 600, marginBottom: 14, fontSize: 13, letterSpacing: "0.2px" }}>🎯 Análise de Risco</div>
        <Grid cols="1fr 1fr" gap={14}>
          <div>
            <label style={{ color: C.silver, fontSize: 11.5, fontWeight: 500, display: "block", marginBottom: 5 }}>Probabilidade de Êxito: <span style={{ color: (form.probExito ?? 50) >= 70 ? C.success : (form.probExito ?? 50) >= 40 ? C.warning : C.danger, fontWeight: 700 }}>{form.probExito ?? 50}%</span></label>
            <input type="range" min={0} max={100} step={5} value={form.probExito ?? 50} onChange={e => setForm(f => ({ ...f, probExito: Number(e.target.value) }))} style={{ width: "100%", accentColor: C.accent }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: C.muted, fontSize: 10 }}><span>0% — Inviável</span><span>50% — Incerto</span><span>100% — Certo</span></div>
          </div>
          <div style={{ background: ((form.probExito ?? 50) >= 70 ? C.success : (form.probExito ?? 50) >= 40 ? C.warning : C.danger) + "11", border: `1px solid ${((form.probExito ?? 50) >= 70 ? C.success : (form.probExito ?? 50) >= 40 ? C.warning : C.danger)}30`, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ color: C.muted, fontSize: 11 }}>Impacto financeiro estimado</div>
            <div style={{ color: (form.probExito ?? 50) >= 70 ? C.success : (form.probExito ?? 50) >= 40 ? C.warning : C.danger, fontSize: 20, fontWeight: 700, marginTop: 4 }}>R$ {((parseFloat(form.valor) || 0) * ((form.probExito ?? 50) / 100)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
            <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>{form.probExito ?? 50}% de R$ {(parseFloat(form.valor) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
          </div>
        </Grid>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: C.silver, fontWeight: 600, marginBottom: 14, fontSize: 13, letterSpacing: "0.2px" }}>🆚 Parte Contrária</div>
        <Grid cols="1fr 1fr 1fr" gap={14}>
          <Inp label="Nome da parte contrária" value={form.parteContraria?.nome || ""} onChange={v => setForm(f => ({ ...f, parteContraria: { ...f.parteContraria, nome: v } }))} style={{ gridColumn: "span 2" }} />
          <Sel label="Tipo" value={form.parteContraria?.tipo || "Réu"} onChange={v => setForm(f => ({ ...f, parteContraria: { ...f.parteContraria, tipo: v } }))} options={["Réu", "Ré", "Reclamado", "Recorrido", "Apelado", "Executado", "Impetrado", "Outro"].map(x => ({ value: x, label: x }))} />
          <Inp label="CPF / CNPJ" value={form.parteContraria?.cpfCnpj || ""} onChange={v => setForm(f => ({ ...f, parteContraria: { ...f.parteContraria, cpfCnpj: v } }))} />
          <Inp label="Advogado(s) da parte contrária" value={form.parteContraria?.advogado || ""} onChange={v => setForm(f => ({ ...f, parteContraria: { ...f.parteContraria, advogado: v } }))} style={{ gridColumn: "span 2" }} />
        </Grid>
      </Card>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn label="Salvar Processo" onClick={salvar} />
        <Btn label="Cancelar" onClick={() => setForm(null)} color={C.border} />
      </div>
    </div>
  );

  if (view) {
    const p = processos.find(x => x.id === view);
    const cli = clientes.find(c => c.id === p.clienteId);
    const adv = advs.find(a => a.id === p.responsavel);
    const ands = andamentos.filter(a => a.processoId === view);
    const pcs = pecas.filter(x => x.processoId === view);
    const docs = p.docsProcessuais || [];
    const relev = { prazo: "🔴", audiencia: "🟡", despacho: "🔵", sentenca: "⚠️", urgente: "🚨" };
    const tabs = ["andamentos", "peças", "documentos", "resultados"];
    const totalMins = ands.reduce((s, a) => s + (a.horas || 0) * 60 + (a.minutos || 0), 0);

    function imprimirRelatorio() {
      const html = `<html><head><title>Relatório – Processo ${p.id}</title><style>
        body{font-family:Georgia,serif;font-size:13px;line-height:1.7;padding:40px 60px;max-width:820px;margin:auto;color:#111}
        h1{font-size:20px;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:4px}
        h2{font-size:14px;color:#444;font-weight:normal;margin:0 0 20px}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        th{background:#1a2e48;color:#fff;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px}
        td{padding:8px 12px;border-bottom:1px solid #ddd;vertical-align:top;font-size:12px}
        tr:nth-child(even){background:#f7f9fc}
        .meta{background:#f0f4f8;border-radius:6px;padding:14px;margin-bottom:20px}
        .meta p{margin:3px 0;font-size:12px}
        .kpi{display:inline-block;margin-right:20px;font-size:12px}
        .kpi strong{display:block;font-size:18px;color:#1a2e48}
        @media print{body{padding:20px}}
      </style></head><body>
        <h1>Relatório de Andamentos — Processo ${p.id}</h1>
        <h2>${p.classe} · ${p.tribunal}</h2>
        <div class="meta">
          <p><strong>NUP:</strong> ${p.nup}</p>
          <p><strong>Cliente:</strong> ${cli?.nome || "—"}</p>
          <p><strong>Vara:</strong> ${p.vara} · ${p.comarca}</p>
          <p><strong>Responsável:</strong> ${adv?.nome || "—"}</p>
          <p><strong>Status:</strong> ${p.status}</p>
          ${p.parteContraria?.nome ? `<p><strong>Parte contrária:</strong> ${p.parteContraria.nome} (${p.parteContraria.tipo})</p>` : ""}
        </div>
        <div style="margin-bottom:20px">
          <span class="kpi"><strong>${ands.length}</strong>Andamentos</span>
          <span class="kpi"><strong>${fmtHoras(Math.floor(totalMins / 60), totalMins % 60)}</strong>Horas</span>
          <span class="kpi"><strong>${pcs.length}</strong>Peças</span>
          <span class="kpi"><strong>${p.pedidosDeferidos || 0}✓ / ${p.pedidosIndeferidos || 0}✗</strong>Ped. Def/Ind.</span>
        </div>
        <table>
          <thead><tr><th>Data</th><th>Advogado</th><th>Relevância</th><th>Descrição</th><th>Horas</th><th>Peça</th></tr></thead>
          <tbody>${[...ands].sort((a, b) => a.data.localeCompare(b.data)).map(a => `
            <tr>
              <td style="white-space:nowrap">${fmtComDia(a.data)}</td>
              <td>${advs.find(x => x.id === a.usuario)?.nome || a.usuario || "—"}</td>
              <td>${a.relevancia || "—"}</td>
              <td>${a.descricao}</td>
              <td style="white-space:nowrap">${fmtHoras(a.horas || 0, a.minutos || 0)}</td>
              <td>${a.tipoPeca || "—"}</td>
            </tr>`).join("")}
          </tbody>
        </table>
        <p style="margin-top:30px;color:#777;font-size:11px">Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
      </body></html>`;
      const w = window.open("", "_blank", "width=900,height=700");
      w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500);
    }

    return (
      <div>
        {docModal && <DocProcessualModal processo={p} advs={advs} onSave={saveDocProcessual} onClose={() => setDocModal(false)} setAgenda={setAgenda} />}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <Btn label="← Voltar" onClick={() => setView(null)} color={C.border} />
          <Btn label="Editar Processo" onClick={() => { setForm({ ...p, parteContraria: p.parteContraria || {} }); setView(null); }} color={C.accent2} />
          <Btn label="+ Andamento" onClick={() => setAndForm({ processoId: view, data: today(), descricao: "", origem: "manual", relevancia: "", usuario: advs[0]?.id || "", horas: 0, minutos: 0, tipoPeca: "" })} />
          <Btn label="+ Documento Processual" onClick={() => setDocModal(true)} color={C.warning} />
          <Btn label="🖨 Relatório de Andamentos" onClick={imprimirRelatorio} color={C.success} />
        </div>
        <Grid cols="1fr 1fr" gap={16} style={{ marginBottom: 16 }}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ color: C.accent, fontWeight: 700, fontSize: 16 }}>{p.id}</span>
              <Badge label={p.status} color={statusClr[p.status] || C.muted} />
            </div>
            <div style={{ color: C.text, fontWeight: 600, marginBottom: 8 }}>{p.classe}</div>
            {[["Cliente", cli?.nome], ["Tribunal", p.tribunal], ["Comarca", p.comarca], ["Vara", p.vara], ["NUP", p.nup], ["Responsável", adv?.nome], ["Horas (TS)", fmtHoras(Math.floor(totalMins / 60), totalMins % 60)], ["Ped. Def./Ind.", `${p.pedidosDeferidos || 0} / ${p.pedidosIndeferidos || 0}`]].map(([l, v]) => v && (
              <div key={l} style={{ marginBottom: 5 }}><span style={{ color: C.muted, fontSize: 11 }}>{l}: </span><span style={{ color: C.text, fontSize: 13 }}>{v}</span></div>
            ))}
            {p.parteContraria?.nome && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: C.danger + "11", border: `1px solid ${C.danger}22`, borderRadius: 8 }}>
                <div style={{ color: C.danger, fontWeight: 600, fontSize: 12, marginBottom: 6 }}>🆚 Parte Contrária — {p.parteContraria.tipo}</div>
                <div style={{ color: C.text, fontSize: 13 }}>{p.parteContraria.nome}</div>
                {p.parteContraria.cpfCnpj && <div style={{ color: C.muted, fontSize: 11 }}>CPF/CNPJ: {p.parteContraria.cpfCnpj}</div>}
                {p.parteContraria.advogado && <div style={{ color: C.muted, fontSize: 11 }}>Adv.: {p.parteContraria.advogado}</div>}
              </div>
            )}
          </Card>
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setTabView(t)} style={{ padding: "7px 12px", borderRadius: 10, border: `1px solid ${tabView === t ? C.accent : C.border}`, background: tabView === t ? C.accent + "22" : "transparent", color: tabView === t ? C.accent : C.muted, cursor: "pointer", fontSize: 12, fontWeight: tabView === t ? 700 : 400, textTransform: "capitalize" }}>{t === "documentos" ? "📋 Documentos" : t}</button>
              ))}
            </div>
            {tabView === "andamentos" && (
              <Card style={{ maxHeight: 340, overflowY: "auto", padding: 14 }}>
                {ands.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontStyle: "italic" }}>Nenhum andamento.</div>}
                {[...ands].reverse().map(a => (
                  <div key={a.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: C.muted, fontSize: 11 }}>{fmtComDia(a.data)} • {advs.find(x => x.id === a.usuario)?.nome || a.usuario}</span>
                      {a.relevancia && <span style={{ fontSize: 11 }}>{relev[a.relevancia] || ""} {a.relevancia}</span>}
                    </div>
                    <div style={{ color: C.text, fontSize: 13, marginTop: 4 }}>{a.descricao}</div>
                    <div style={{ color: C.accent, fontSize: 11, marginTop: 3 }}>{fmtHoras(a.horas || 0, a.minutos || 0)} {a.tipoPeca && `• ${a.tipoPeca}`}</div>
                  </div>
                ))}
              </Card>
            )}
            {tabView === "peças" && (
              <Card style={{ maxHeight: 340, overflowY: "auto", padding: 14 }}>
                {pcs.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontStyle: "italic" }}>Nenhuma peça registrada.</div>}
                {pcs.map(pc => (
                  <div key={pc.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8 }}>
                    <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{pc.tipo}</div>
                    <div style={{ color: C.muted, fontSize: 11 }}>{fmtComDia(pc.data)} • {advs.find(a => a.id === pc.advId)?.nome}</div>
                    {pc.obs && <div style={{ color: C.muted, fontSize: 11 }}>{pc.obs}</div>}
                  </div>
                ))}
              </Card>
            )}
            {tabView === "documentos" && (
              <Card style={{ maxHeight: 340, overflowY: "auto", padding: 14 }}>
                {docs.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontStyle: "italic" }}>Nenhum documento processual registrado.</div>}
                {[...docs].reverse().map(d => {
                  const tipoInfo = TIPOS_DOC_PROCESSUAL.find(t => t.value === d.tipo);
                  const advDoc = advs.find(a => a.id === d.responsavel);
                  return (
                    <div key={d.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Badge label={tipoInfo?.label || d.tipo} color={tipoDocClr[d.tipo] || C.muted} />
                        <span style={{ color: C.muted, fontSize: 11 }}>{fmtComDia(d.data)}</span>
                      </div>
                      <div style={{ color: C.text, fontSize: 13, marginTop: 6 }}>{d.descricao}</div>
                      {d.temPrazo && (
                        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: C.warning, fontSize: 11 }}>⏱ {d.qtdDias} dias {d.tipoDias}</span>
                          {advDoc && <span style={{ color: C.muted, fontSize: 11 }}>• {advDoc.nome}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>
            )}
            {tabView === "resultados" && (
              <Card style={{ maxHeight: 340, overflowY: "auto", padding: 14 }}>
                {["sentencas", "acordaos", "agravos"].map(tipo => {
                  const items = p[tipo] || [];
                  const labels = { sentencas: "Sentenças", acordaos: "Acórdãos", agravos: "Agravos" };
                  const opts = { sentencas: ["favoravel", "desfavoravel"], acordaos: ["provido", "improvido"], agravos: ["provido", "improvido"] };
                  return (
                    <div key={tipo} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{labels[tipo]}</span>
                        <div style={{ display: "flex", gap: 4 }}>
                          {opts[tipo].map(op => <Btn key={op} label={`+ ${op}`} small onClick={() => addResultado(tipo, op)} color={op === "favoravel" || op === "provido" ? C.success : C.danger} />)}
                        </div>
                      </div>
                      {items.length === 0 && <div style={{ color: C.muted, fontSize: 12 }}>Nenhum registro.</div>}
                      {items.map((it, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: C.surface, borderRadius: 8, marginBottom: 4 }}>
                          <span style={{ color: C.text, fontSize: 12 }}>{fmtComDia(it.data)} {it.obs && `— ${it.obs}`}</span>
                          <Badge label={it.tipo} color={it.tipo === "favoravel" || it.tipo === "provido" ? C.success : C.danger} />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </Card>
            )}
          </div>
        </Grid>
        {andForm && (
          <Card style={{ marginTop: 0 }}>
            <div style={{ color: C.text, fontWeight: 600, marginBottom: 12 }}>Novo Andamento / Peça</div>
            <Grid cols="1fr 1fr 1fr" gap={12}>
              <Inp label="Data" type="date" value={andForm.data} onChange={v => setAndForm(f => ({ ...f, data: v }))} />
              <Sel label="Relevância" value={andForm.relevancia} onChange={v => setAndForm(f => ({ ...f, relevancia: v }))} options={[{ value: "", label: "Normal" }, ...["prazo", "audiencia", "despacho", "sentenca", "urgente"].map(x => ({ value: x, label: x }))]} />
              <Sel label="Advogado" value={andForm.usuario} onChange={v => setAndForm(f => ({ ...f, usuario: v }))} options={advs.map(a => ({ value: a.id, label: a.nome }))} />
              <div style={{ display: "flex", gap: 8 }}>
                <Inp label="Horas" type="number" value={andForm.horas || "0"} onChange={v => setAndForm(f => ({ ...f, horas: parseInt(v) || 0 }))} style={{ flex: 1 }} />
                <Inp label="Minutos" type="number" value={andForm.minutos || "0"} onChange={v => setAndForm(f => ({ ...f, minutos: Math.min(59, parseInt(v) || 0) }))} style={{ flex: 1 }} suffix="min" />
              </div>
              <Sel label="Tipo de Peça" value={andForm.tipoPeca || ""} onChange={v => setAndForm(f => ({ ...f, tipoPeca: v }))} options={[{ value: "", label: "Nenhuma" }, ...TIPOS_PECA.map(x => ({ value: x, label: x }))]} />
              <Inp label="Descrição" value={andForm.descricao} onChange={v => setAndForm(f => ({ ...f, descricao: v }))} style={{ gridColumn: "span 3" }} />
            </Grid>
            {(andForm.horas > 0 || andForm.minutos > 0) && (
              <div style={{ marginTop: 8, padding: "7px 13px", background: C.accent + "12", borderRadius: 10, color: C.accent, fontSize: 13 }}>
                ⏱ Tempo registrado: {fmtHoras(andForm.horas || 0, andForm.minutos || 0)}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <Btn label="Salvar" onClick={() => {
                if (!andForm.descricao) return alert("Descrição obrigatória.");
                const novoPeca = andForm.tipoPeca ? { id: Date.now(), processoId: view, data: andForm.data, tipo: andForm.tipoPeca, advId: andForm.usuario, obs: "" } : null;
                if (novoPeca) setPecas(p => [...p, novoPeca]);
                setAndamentos(a => [...a, { ...andForm, id: Date.now() }]);
                setAndForm(null);
              }} />
              <Btn label="Cancelar" onClick={() => setAndForm(null)} color={C.border} />
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: C.text, margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>Processos</h2>
        <Btn label="+ Novo Processo" onClick={() => setForm({ id: "", clienteId: "", parteContraria: { nome: "", cpfCnpj: "", advogado: "", tipo: "Réu" }, nup: "", tribunal: "", comarca: "", vara: "", classe: "", assunto: "", valor: "", status: "ativo", responsavel: "", tags: "", obs: "", horasTrabalhadas: 0, pedidosDeferidos: 0, pedidosIndeferidos: 0, sentencas: [], acordaos: [], agravos: [], docsProcessuais: [], probExito: 50, valorCausa: 0, _novo: true })} />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Inp placeholder="Buscar por código, NUP ou cliente..." value={busca} onChange={setBusca} style={{ flex: 1, minWidth: 200, marginBottom: 0 }} />
        <div style={{ display: "flex", gap: 2, background: C.cardHi, borderRadius: 20, padding: 3, border: `1px solid ${C.border}`, flexShrink: 0 }}>
          {[["codigo", "# Código"], ["alfa", "A–Z Cliente"], ["atualizacao", "↺ Atualização"]].map(([v, l]) => (
            <button key={v} onClick={() => setOrdem(v)} style={{ padding: "5px 12px", borderRadius: 16, background: ordem === v ? C.accent : "transparent", color: ordem === v ? "#fff" : C.muted, border: "none", cursor: "pointer", fontSize: 11, fontWeight: ordem === v ? 700 : 400, transition: "all .15s", whiteSpace: "nowrap" }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>{lista.length} processo{lista.length !== 1 ? "s" : ""}</div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.cardHi }}>
              {["", "Código", "Cliente", "Parte Contrária", "Classe", "Tribunal", "Responsável", "Status", "Últ. mov.", ""].map(h => (
                <th key={h} style={{ color: C.muted, fontSize: 10.5, padding: "12px 16px", textAlign: "left", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map(p => {
              const cli = clientes.find(c => c.id === p.clienteId);
              const adv = advs.find(a => a.id === p.responsavel);
              const ua = ultimoAndProc(p.id);
              const hoje2 = today();
              const em3b = new Date(); em3b.setDate(em3b.getDate() + 3); const em3bs = em3b.toISOString().split("T")[0];
              const em7b = new Date(); em7b.setDate(em7b.getDate() + 7); const em7bs = em7b.toISOString().split("T")[0];
              const prxPrazo = agenda.filter(e => e.processoId === p.id && e.data >= hoje2 && (e.tipo === "prazo" || e.tipo === "audiencia")).sort((a, b) => a.data.localeCompare(b.data))[0];
              const semClr = !prxPrazo ? "#555" : prxPrazo.data <= em3bs ? C.danger : prxPrazo.data <= em7bs ? C.warning : C.success;
              const semTitle = !prxPrazo ? "Sem prazos futuros" : `Próx. prazo: ${fmt(prxPrazo.data)} — ${prxPrazo.titulo}`;
              return (
                <tr key={p.id} style={{ borderTop: `1px solid ${C.border}`, transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = C.glass} onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "12px 8px 12px 16px" }}><div title={semTitle} style={{ width: 10, height: 10, borderRadius: "50%", background: semClr, boxShadow: `0 0 6px ${semClr}99`, flexShrink: 0 }} /></td>
                  <td style={{ padding: "12px 16px", color: C.accent, fontWeight: 700, fontSize: 13 }}>{p.id}</td>
                  <td style={{ padding: "12px 16px", color: C.text, fontSize: 13 }}>{cli?.nome}</td>
                  <td style={{ padding: "12px 16px", color: C.muted, fontSize: 12 }}>{p.parteContraria?.nome || <span style={{ color: C.muted, opacity: 0.4 }}>—</span>}</td>
                  <td style={{ padding: "12px 16px", color: C.muted, fontSize: 12 }}>{p.classe}</td>
                  <td style={{ padding: "12px 16px", color: C.muted, fontSize: 11 }}>{p.tribunal?.split("–")[0]}</td>
                  <td style={{ padding: "12px 16px" }}>{adv && <span style={{ background: adv.cor + "22", color: adv.cor, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{adv.nome.split(" ")[0] + " " + adv.nome.split(" ").at(-1)}</span>}</td>
                  <td style={{ padding: "12px 16px" }}><Badge label={p.status} color={statusClr[p.status] || C.muted} /></td>
                  <td style={{ padding: "12px 16px", color: C.muted, fontSize: 11 }}>{ua ? fmtComDia(ua) : "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Btn label="Ver" onClick={() => setView(p.id)} small color={C.accent2} style={{ marginRight: 6 }} />
                    <Btn label="Editar" onClick={() => setForm({ ...p, parteContraria: p.parteContraria || {} })} small />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
