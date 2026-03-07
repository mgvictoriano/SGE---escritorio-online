import { useState } from "react";
import { C } from '../constants/paleta';
import { today } from '../utils/datas';
import { fmtHoras } from '../utils/prazos';
import { Card, Grid } from '../components/ui';

export default function Produtividade({ advs, processos, andamentos, pecas, contratos, clientes }) {
  const [periodo, setPeriodo] = useState("mes");
  const hoje = today();

  function inPeriodo(data) {
    if (!data) return false;
    const d = new Date(data + "T12:00:00"); const n = new Date(hoje + "T12:00:00");
    if (periodo === "semana") { const s = new Date(n); s.setDate(s.getDate() - 7); return d >= s; }
    if (periodo === "mes") { const m = new Date(n); m.setDate(1); return d >= m; }
    if (periodo === "trimestre") { const t = new Date(n); t.setMonth(t.getMonth() - 3); return d >= t; }
    if (periodo === "ano") { return d.getFullYear() === n.getFullYear(); }
    return true;
  }

  const totalPecas = pecas.filter(p => inPeriodo(p.data)).length;
  const totalAndamentos = andamentos.filter(a => inPeriodo(a.data)).length;
  const totalContratos = contratos.filter(c => { const primeiraP = c.parcelas?.[0]; return primeiraP && inPeriodo(primeiraP.venc.slice(0, 10) || hoje); }).length;
  const totalMins = andamentos.filter(a => inPeriodo(a.data)).reduce((s, a) => s + (a.horas || 0) * 60 + (a.minutos || 0), 0);
  const recMes = contratos.reduce((s, c) => s + c.parcelas.filter(p => p.status === "paga" && inPeriodo(p.dataPag)).reduce((a, p) => a + p.valor, 0), 0);

  const statsAdv = advs.map(a => {
    const minsTot = andamentos.filter(x => x.usuario === a.id && inPeriodo(x.data)).reduce((s, x) => s + (x.horas || 0) * 60 + (x.minutos || 0), 0);
    const pecasAdv = pecas.filter(p => p.advId === a.id && inPeriodo(p.data)).length;
    const andsAdv = andamentos.filter(x => x.usuario === a.id && inPeriodo(x.data)).length;
    const procsAdv = processos.filter(p => p.responsavel === a.id && p.status === "ativo").length;
    const recAdv = contratos.reduce((s, c) => {
      const r = c.rateios && c.rateios.find(x => x.advId === a.id);
      if (!r) return s;
      return s + c.parcelas.filter(p => p.status === "paga" && inPeriodo(p.dataPag)).reduce((acc, p) => acc + p.valor * (parseFloat(r.perc) || 0) / 100, 0);
    }, 0);
    return { ...a, mins: minsTot, pecas: pecasAdv, ands: andsAdv, procs: procsAdv, rec: recAdv };
  });

  const maxPecas = Math.max(...statsAdv.map(a => a.pecas), 1);
  const maxAnds = Math.max(...statsAdv.map(a => a.ands), 1);
  const maxMins = Math.max(...statsAdv.map(a => a.mins), 1);

  const periodos = [["semana", "7 dias"], ["mes", "Este mês"], ["trimestre", "Trimestre"], ["ano", "Este ano"]];

  function BarMini({ val, max, color }) {
    const pct = Math.max(4, (val / max) * 100);
    return (
      <div style={{ flex: 1, background: C.border, borderRadius: 20, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 20, transition: "width .5s ease" }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: C.text, margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>📊 Produtividade</h2>
        <div style={{ display: "flex", gap: 4, background: C.cardHi, borderRadius: 20, padding: 4, border: `1px solid ${C.border}` }}>
          {periodos.map(([v, l]) => (
            <button key={v} onClick={() => setPeriodo(v)} style={{ padding: "6px 14px", borderRadius: 16, background: periodo === v ? C.accent : "transparent", color: periodo === v ? "#fff" : C.muted, border: "none", cursor: "pointer", fontSize: 12, fontWeight: periodo === v ? 700 : 400, transition: "all .18s" }}>{l}</button>
          ))}
        </div>
      </div>

      <Grid cols="repeat(5,1fr)" gap={12} style={{ marginBottom: 20 }}>
        {[
          ["📄", totalPecas, "Peças elaboradas", C.accent],
          ["⚖️", totalAndamentos, "Andamentos", C.accent2],
          ["📋", totalContratos, "Contratos fechados", C.success],
          ["⏱", fmtHoras(Math.floor(totalMins / 60), totalMins % 60), "Horas trabalhadas", C.warning],
          ["💰", `R$ ${recMes.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, "Recebido no período", C.gold],
        ].map(([icon, val, label, cor]) => (
          <Card key={label} style={{ textAlign: "center", padding: 16, border: `1px solid ${cor}22`, boxShadow: `0 2px 16px rgba(0,0,0,0.15),0 0 0 1px ${cor}11 inset` }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
            <div style={{ color: cor, fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.1 }}>{val}</div>
            <div style={{ color: C.muted, fontSize: 10.5, marginTop: 6, textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</div>
          </Card>
        ))}
      </Grid>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>🏆 Ranking de Produtividade — Advogados</span>
          <span style={{ color: C.muted, fontSize: 11, fontWeight: 400 }}>{periodos.find(p => p[0] === periodo)?.[1]}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 1fr 80px 100px", gap: 8, alignItems: "center", paddingBottom: 10, borderBottom: `1px solid ${C.border}`, marginBottom: 8 }}>
          {["Advogado", "Peças", "Andamentos", "Horas", "Processos", "Recebido"].map(h => (
            <div key={h} style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>
        {[...statsAdv].sort((a, b) => b.pecas + b.ands - (a.pecas + a.ands)).map((a, rank) => (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 1fr 80px 100px", gap: 8, alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}44`, transition: "background .15s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: rank === 0 ? C.gold + "30" : C.border + "44", color: rank === 0 ? C.gold : C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                {rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : rank + 1}
              </div>
              <div>
                <div style={{ color: a.cor, fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>{a.nome.split(" ")[0]} {a.nome.split(" ").at(-1)}</div>
                <div style={{ color: C.muted, fontSize: 10 }}>{a.oab}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: C.accent, fontWeight: 700, fontSize: 13 }}>{a.pecas}</span></div>
              <BarMini val={a.pecas} max={maxPecas} color={C.accent} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: C.accent2, fontWeight: 700, fontSize: 13 }}>{a.ands}</span></div>
              <BarMini val={a.ands} max={maxAnds} color={C.accent2} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ color: C.warning, fontWeight: 700, fontSize: 13 }}>{fmtHoras(Math.floor(a.mins / 60), a.mins % 60)}</div>
              <BarMini val={a.mins} max={maxMins} color={C.warning} />
            </div>
            <div style={{ textAlign: "center" }}>
              <span style={{ background: a.cor + "22", color: a.cor, borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{a.procs}</span>
            </div>
            <div style={{ color: C.success, fontWeight: 700, fontSize: 12, textAlign: "right" }}>R$ {a.rec.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</div>
          </div>
        ))}
      </Card>

      <Grid cols="1fr 1fr" gap={16}>
        <Card>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 13, marginBottom: 16 }}>📄 Peças por Advogado</div>
          {[...statsAdv].sort((a, b) => b.pecas - a.pecas).map(a => (
            <div key={a.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: a.cor, fontSize: 12, fontWeight: 600 }}>{a.nome.split(" ")[0]}</span>
                <span style={{ color: C.accent, fontSize: 12, fontWeight: 700 }}>{a.pecas}</span>
              </div>
              <div style={{ background: C.border, borderRadius: 20, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${maxPecas > 0 ? (a.pecas / maxPecas) * 100 : 0}%`, background: a.cor, height: "100%", borderRadius: 20, transition: "width .5s ease", minWidth: a.pecas > 0 ? 4 : 0 }} />
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 13, marginBottom: 16 }}>⏱ Horas por Advogado (Timesheet)</div>
          {[...statsAdv].sort((a, b) => b.mins - a.mins).map(a => (
            <div key={a.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: a.cor, fontSize: 12, fontWeight: 600 }}>{a.nome.split(" ")[0]}</span>
                <span style={{ color: C.warning, fontSize: 12, fontWeight: 700 }}>{fmtHoras(Math.floor(a.mins / 60), a.mins % 60)}</span>
              </div>
              <div style={{ background: C.border, borderRadius: 20, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${maxMins > 0 ? (a.mins / maxMins) * 100 : 0}%`, background: C.warning, height: "100%", borderRadius: 20, transition: "width .5s ease", minWidth: a.mins > 0 ? 4 : 0 }} />
              </div>
            </div>
          ))}
        </Card>
      </Grid>
    </div>
  );
}
