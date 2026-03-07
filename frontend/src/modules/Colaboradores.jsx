import { useState, useRef } from "react";
import { C } from '../constants/paleta';
import { fmtComDia, today } from '../utils/datas';
import { fmtHoras } from '../utils/prazos';
import { Badge, Btn, Card, Grid, Inp, Sel } from '../components/ui';

export function Avatar({ adv, size = 44, uploadable = false, onUpload }) {
  const ref = useRef();
  const initials = (adv.nome || "?").split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {adv.foto
        ? <img src={adv.foto} alt={adv.nome} style={{ width: size, height: size, borderRadius: 10, objectFit: "cover", border: `2px solid ${adv.cor}55` }} />
        : <div style={{ width: size, height: size, borderRadius: 10, background: `linear-gradient(135deg,${adv.cor}cc,${adv.cor}55)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: "#fff", border: `2px solid ${adv.cor}44` }}>{initials}</div>
      }
      {uploadable && <>
        <div onClick={() => ref.current?.click()} style={{ position: "absolute", inset: 0, borderRadius: 10, background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.45)"; e.currentTarget.querySelector("span").style.opacity = 1; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0)"; e.currentTarget.querySelector("span").style.opacity = 0; }}>
          <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, opacity: 0, transition: "opacity .2s", textAlign: "center", lineHeight: 1.3 }}>📷<br />Foto</span>
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
          const f = e.target.files?.[0]; if (!f) return;
          const r = new FileReader(); r.onload = ev => onUpload && onUpload(ev.target.result); r.readAsDataURL(f);
        }} />
      </>}
    </div>
  );
}

export default function Colaboradores({ advs, setAdvs, processos, agenda, andamentos }) {
  const [form, setForm] = useState(null);
  const [tsAdv, setTsAdv] = useState(null);
  const [tsPeriodo, setTsPeriodo] = useState("mes");
  const hoje = today();
  const em7 = new Date(); em7.setDate(em7.getDate() + 7); const em7s = em7.toISOString().split("T")[0];
  const cores = ["#4f8ef7", "#6c63ff", "#34d399", "#fbbf24", "#f87171", "#fb923c", "#a78bfa"];

  function salvar() {
    if (!form.nome || !form.oab) return alert("Nome e OAB obrigatórios.");
    const id = form._novo ? `ADV${String(advs.length + 1).padStart(3, "0")}` : form.id;
    if (form._novo) setAdvs(a => [...a, { ...form, id, _novo: undefined }]);
    else setAdvs(a => a.map(x => x.id === form.id ? { ...form, _novo: undefined } : x));
    setForm(null);
  }

  function setFoto(advId, url) { setAdvs(a => a.map(x => x.id === advId ? { ...x, foto: url } : x)); }

  const periodos = [["dia", "Hoje"], ["semana", "Semana"], ["mes", "Mês"], ["trimestre", "Trimestre"], ["semestre", "Semestre"], ["ano", "Ano"]];

  function getIni(periodo) {
    const n = new Date(hoje + "T12:00:00");
    if (periodo === "dia") return hoje;
    if (periodo === "semana") { n.setDate(n.getDate() - 6); return n.toISOString().split("T")[0]; }
    if (periodo === "mes") { n.setDate(1); return n.toISOString().split("T")[0]; }
    if (periodo === "trimestre") { n.setMonth(n.getMonth() - 3); return n.toISOString().split("T")[0]; }
    if (periodo === "semestre") { n.setMonth(n.getMonth() - 6); return n.toISOString().split("T")[0]; }
    if (periodo === "ano") { return `${n.getFullYear()}-01-01`; }
    return hoje;
  }

  if (tsAdv) {
    const a = advs.find(x => x.id === tsAdv);
    const ini = getIni(tsPeriodo);
    const ands = andamentos.filter(x => x.usuario === tsAdv && x.data >= ini && x.data <= hoje);
    const totalMins = ands.reduce((s, x) => s + (x.horas || 0) * 60 + (x.minutos || 0), 0);
    const diasSet = {}; ands.forEach(x => diasSet[x.data] = (diasSet[x.data] || 0) + (x.horas || 0) * 60 + (x.minutos || 0));
    const diasOrdenados = Object.keys(diasSet).sort();
    const maxDiaMins = Math.max(...Object.values(diasSet), 1);
    const procSet = {}; ands.forEach(x => procSet[x.processoId] = (procSet[x.processoId] || 0) + (x.horas || 0) * 60 + (x.minutos || 0));
    const maxProcMins = Math.max(...Object.values(procSet), 1);

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <Btn label="← Voltar" onClick={() => setTsAdv(null)} color={C.border} />
          <Avatar adv={a} size={40} />
          <div>
            <div style={{ color: a.cor, fontWeight: 700, fontSize: 16 }}>{a.nome}</div>
            <div style={{ color: C.muted, fontSize: 12 }}>{a.oab} · {a.perfil}</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 2, background: C.cardHi, borderRadius: 20, padding: 3, border: `1px solid ${C.border}`, flexWrap: "wrap" }}>
            {periodos.map(([v, l]) => (
              <button key={v} onClick={() => setTsPeriodo(v)} style={{ padding: "5px 11px", borderRadius: 16, background: tsPeriodo === v ? a.cor : "transparent", color: tsPeriodo === v ? "#fff" : C.muted, border: "none", cursor: "pointer", fontSize: 11, fontWeight: tsPeriodo === v ? 700 : 400, transition: "all .15s" }}>{l}</button>
            ))}
          </div>
        </div>

        <Grid cols="repeat(4,1fr)" gap={12} style={{ marginBottom: 20 }}>
          {[["⏱", fmtHoras(Math.floor(totalMins / 60), totalMins % 60), "Total", a.cor], ["📄", ands.filter(x => x.tipoPeca).length, "Peças", C.accent2], ["⚖️", ands.length, "Andamentos", C.success], ["📅", Object.keys(diasSet).length, "Dias trabalhados", C.warning]].map(([ic, v, l, cor]) => (
            <Card key={l} style={{ textAlign: "center", padding: 14, border: `1px solid ${cor}22` }}>
              <div style={{ fontSize: 18, marginBottom: 2 }}>{ic}</div>
              <div style={{ color: cor, fontSize: 20, fontWeight: 800 }}>{v}</div>
              <div style={{ color: C.muted, fontSize: 10, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.4px" }}>{l}</div>
            </Card>
          ))}
        </Grid>

        <Grid cols="1fr 1fr" gap={16} style={{ marginBottom: 16 }}>
          <Card>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 13, marginBottom: 14 }}>⏱ Horas por dia</div>
            {diasOrdenados.length === 0 && <div style={{ color: C.muted, fontSize: 12, fontStyle: "italic" }}>Nenhum registro no período.</div>}
            {diasOrdenados.map(d => {
              const m = diasSet[d]; const pct = Math.max(4, (m / maxDiaMins) * 100);
              return (
                <div key={d} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ color: C.silver, fontSize: 11 }}>{fmtComDia(d)}</span>
                    <span style={{ color: a.cor, fontSize: 11, fontWeight: 700 }}>{fmtHoras(Math.floor(m / 60), m % 60)}</span>
                  </div>
                  <div style={{ background: C.border, borderRadius: 20, height: 6 }}><div style={{ width: `${pct}%`, background: a.cor, height: "100%", borderRadius: 20 }} /></div>
                </div>
              );
            })}
          </Card>
          <Card>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 13, marginBottom: 14 }}>⚖️ Horas por processo</div>
            {Object.keys(procSet).length === 0 && <div style={{ color: C.muted, fontSize: 12, fontStyle: "italic" }}>Nenhum registro no período.</div>}
            {Object.entries(procSet).sort((a, b) => b[1] - a[1]).map(([pid, m]) => {
              const proc = processos.find(p => p.id === pid);
              return (
                <div key={pid} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <div><span style={{ color: C.accent, fontSize: 11, fontWeight: 700 }}>{pid}</span>{proc && <span style={{ color: C.muted, fontSize: 10 }}> · {proc.classe}</span>}</div>
                    <span style={{ color: C.warning, fontSize: 11, fontWeight: 700 }}>{fmtHoras(Math.floor(m / 60), m % 60)}</span>
                  </div>
                  <div style={{ background: C.border, borderRadius: 20, height: 6 }}><div style={{ width: `${Math.max(4, (m / maxProcMins) * 100)}%`, background: C.warning, height: "100%", borderRadius: 20 }} /></div>
                </div>
              );
            })}
          </Card>
        </Grid>

        <Card>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📋 Registros detalhados</div>
          {ands.length === 0 && <div style={{ color: C.muted, fontSize: 13, fontStyle: "italic" }}>Sem andamentos no período.</div>}
          {[...ands].sort((a, b) => b.data.localeCompare(a.data)).map(x => {
            const proc = processos.find(p => p.id === x.processoId);
            return (
              <div key={x.id} style={{ borderBottom: `1px solid ${C.border}`, padding: "10px 0", display: "grid", gridTemplateColumns: "130px 70px 1fr auto", gap: 10, alignItems: "start" }}>
                <span style={{ color: C.muted, fontSize: 11 }}>{fmtComDia(x.data)}</span>
                <span style={{ color: C.warning, fontWeight: 700, fontSize: 12 }}>{fmtHoras(x.horas || 0, x.minutos || 0)}</span>
                <div>
                  <div style={{ color: C.text, fontSize: 12 }}>{x.descricao}</div>
                  <div style={{ color: C.muted, fontSize: 10 }}>{x.processoId}{proc ? ` · ${proc.classe}` : ""}</div>
                </div>
                {x.tipoPeca && <Badge label={x.tipoPeca} color={C.accent2} />}
              </div>
            );
          })}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: C.text, margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>Advogados & Colaboradores</h2>
        <Btn label="+ Novo Colaborador" onClick={() => setForm({ _novo: true, nome: "", oab: "", email: "", tel: "", perfil: "Colaborador", cor: cores[advs.length % cores.length], foto: null })} />
      </div>

      {form && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, padding: 14, background: C.cardHi, borderRadius: 12, border: `1px solid ${C.border}` }}>
            <Avatar adv={form} size={68} uploadable onUpload={url => setForm(f => ({ ...f, foto: url }))} />
            <div style={{ flex: 1 }}>
              <div style={{ color: C.silver, fontWeight: 600, fontSize: 13, marginBottom: 3 }}>Foto de identificação (3×4)</div>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>Clique na imagem para fazer upload · JPG/PNG · proporção 3×4 recomendada</div>
              {form.foto && <Btn label="🗑 Remover" onClick={() => setForm(f => ({ ...f, foto: null }))} small color={C.danger} />}
            </div>
            <div>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 6 }}>Cor no sistema</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", maxWidth: 130 }}>
                {cores.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, cor: c }))} style={{ width: 22, height: 22, borderRadius: 6, background: c, border: `3px solid ${form.cor === c ? "#fff" : "transparent"}`, cursor: "pointer", boxShadow: form.cor === c ? `0 0 0 2px ${c}88` : "none" }} />
                ))}
              </div>
            </div>
          </div>
          <Grid cols="1fr 1fr 1fr" gap={14}>
            <Inp label="Nome completo" value={form.nome} onChange={v => setForm(f => ({ ...f, nome: v }))} style={{ gridColumn: "span 2" }} />
            <Inp label="OAB" value={form.oab} onChange={v => setForm(f => ({ ...f, oab: v }))} />
            <Inp label="E-mail" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} />
            <Inp label="Telefone" value={form.tel} onChange={v => setForm(f => ({ ...f, tel: v }))} />
            <Sel label="Perfil" value={form.perfil} onChange={v => setForm(f => ({ ...f, perfil: v }))} options={["Administrador", "Advogado", "Colaborador", "Estagiário"].map(x => ({ value: x, label: x }))} />
          </Grid>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <Btn label="Salvar" onClick={salvar} />
            <Btn label="Cancelar" onClick={() => setForm(null)} color={C.border} />
          </div>
        </Card>
      )}

      <Grid cols="repeat(3,1fr)" gap={16}>
        {advs.map(a => {
          const procs = processos.filter(p => p.responsavel === a.id);
          const ativos = procs.filter(p => p.status === "ativo").length;
          const andAdv = andamentos.filter(x => x.usuario === a.id);
          const totalMins = andAdv.reduce((s, x) => s + (x.horas || 0) * 60 + (x.minutos || 0), 0);
          const prazos = agenda.filter(e => e.responsavel === a.id && e.data >= hoje && e.data <= em7s && (e.tipo === "prazo" || e.tipo === "audiencia"));
          return (
            <Card key={a.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Avatar adv={a} size={48} uploadable onUpload={url => setFoto(a.id, url)} />
                  <div>
                    <div style={{ color: a.cor, fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{a.nome}</div>
                    <div style={{ color: C.muted, fontSize: 11 }}>{a.oab}</div>
                    <Badge label={a.perfil} color={a.cor} />
                  </div>
                </div>
                <Btn label="✏" small onClick={() => setForm({ ...a })} color={C.border} />
              </div>
              <Grid cols="1fr 1fr 1fr" gap={8} style={{ marginBottom: 10 }}>
                {[[ativos, "Processos", a.cor], [fmtHoras(Math.floor(totalMins / 60), totalMins % 60), "Timesheet", C.accent], [prazos.length, "Prazos 7d", prazos.length > 0 ? C.danger : C.success]].map(([v, l, cor]) => (
                  <div key={l} style={{ textAlign: "center", background: C.cardHi, borderRadius: 8, padding: "8px 4px" }}>
                    <div style={{ color: cor, fontWeight: 700, fontSize: 14 }}>{v}</div>
                    <div style={{ color: C.muted, fontSize: 10 }}>{l}</div>
                  </div>
                ))}
              </Grid>
              <Btn label="📊 Ver Timesheet Detalhado" onClick={() => { setTsAdv(a.id); setTsPeriodo("mes"); }} color={C.border} style={{ width: "100%", fontSize: 12, borderRadius: 10, marginBottom: prazos.length > 0 ? 10 : 0 }} />
              {prazos.length > 0 && (
                <div style={{ marginTop: 6, background: C.danger + "18", borderRadius: 8, padding: 10 }}>
                  <div style={{ color: C.danger, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>🔔 Prazos próximos:</div>
                  {prazos.slice(0, 2).map(e => (
                    <div key={e.id} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: C.text, fontSize: 11 }}>{e.titulo}</span>
                      <span style={{ color: C.danger, fontSize: 11, fontWeight: 600 }}>{fmtComDia(e.data)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </Grid>
    </div>
  );
}
