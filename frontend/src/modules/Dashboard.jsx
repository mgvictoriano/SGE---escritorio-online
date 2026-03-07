import { C } from '../constants/paleta';
import { today, fmtComDia } from '../utils/datas';
import { fmtHoras } from '../utils/prazos';
import { Card, Grid } from '../components/ui';

export default function Dashboard({ clientes, processos, agenda, contratos, andamentos, pecas, advs, servicosAvulsos }) {
  const hoje = today();
  const em3 = new Date(); em3.setDate(em3.getDate() + 3); const em3s = em3.toISOString().split("T")[0];
  const proximos = agenda.filter(e => e.data >= hoje).sort((a, b) => a.data.localeCompare(b.data)).slice(0, 5);
  const urgentes = agenda.filter(e => e.data >= hoje && e.data <= em3s && (e.tipo === "prazo" || e.tipo === "audiencia"));

  let totalRec = 0, totalAtr = 0, totalRcb = 0;
  contratos.forEach(c => c.parcelas.forEach(p => {
    if (p.status === "aberta") totalRec += p.valor;
    if (p.status === "atrasada" || (p.venc < hoje && p.status === "aberta")) totalAtr += p.valor;
    if (p.status === "paga") totalRcb += p.valor;
  }));

  const totalHorasMin = andamentos.reduce((s, a) => s + (a.horas || 0) * 60 + (a.minutos || 0), 0);
  const totalHoras = Math.floor(totalHorasMin / 60); const totalMin = totalHorasMin % 60;
  const totalDef = processos.reduce((s, p) => s + (p.pedidosDeferidos || 0), 0);
  const totalInd = processos.reduce((s, p) => s + (p.pedidosIndeferidos || 0), 0);
  const totalSentFav  = processos.reduce((s, p) => s + (p.sentencas || []).filter(x => x.tipo === "favoravel").length, 0);
  const totalSentDesf = processos.reduce((s, p) => s + (p.sentencas || []).filter(x => x.tipo === "desfavoravel").length, 0);
  const totalAcFav    = processos.reduce((s, p) => s + (p.acordaos || []).filter(x => x.tipo === "provido").length, 0);
  const totalAcDesf   = processos.reduce((s, p) => s + (p.acordaos || []).filter(x => x.tipo === "improvido").length, 0);
  const totalAgrProv  = processos.reduce((s, p) => s + (p.agravos || []).filter(x => x.tipo === "provido").length, 0);
  const totalAgrImp   = processos.reduce((s, p) => s + (p.agravos || []).filter(x => x.tipo === "improvido").length, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: C.text, margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>Dashboard</h2>
        {urgentes.length > 0 && (
          <div style={{ background: C.danger + "18", border: `1px solid ${C.danger}40`, borderRadius: 14, padding: "9px 18px", color: C.danger, fontSize: 13, fontWeight: 600, boxShadow: `0 2px 12px ${C.danger}25` }}>
            🔔 {urgentes.length} prazo(s)/audiência(s) nos próximos 3 dias!
          </div>
        )}
      </div>

      <Grid cols="repeat(4,1fr)" gap={14} style={{ marginBottom: 16 }}>
        {[
          [clientes.length, "Clientes", C.accent],
          [processos.filter(p => p.status === "ativo").length, "Processos Ativos", C.success],
          [`R$ ${totalRcb.toLocaleString("pt-BR")}`, "Recebido", C.success],
          [`R$ ${totalAtr.toLocaleString("pt-BR")}`, "Inadimplência", C.danger],
        ].map(([v, l, cor]) => (
          <Card key={l} style={{ textAlign: "center", padding: 18, border: `1px solid ${cor}22`, boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${cor}11 inset` }}>
            <div style={{ color: cor, fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", lineHeight: 1.1 }}>{v}</div>
            <div style={{ color: C.muted, fontSize: 11.5, marginTop: 6, letterSpacing: "0.3px", textTransform: "uppercase" }}>{l}</div>
          </Card>
        ))}
      </Grid>

      <Grid cols="repeat(4,1fr)" gap={14} style={{ marginBottom: 16 }}>
        {[
          [pecas.length, "Peças Elaboradas", C.accent2],
          [`${totalHoras}h${totalMin > 0 ? ` ${totalMin}min` : ""}`, "Horas (Timesheet)", C.accent],
          [`${totalDef}✓ / ${totalInd}✗`, "Pedidos Def./Ind.", C.warning],
          [`R$ ${totalRec.toLocaleString("pt-BR")}`, "A Receber", C.accent],
        ].map(([v, l, cor]) => (
          <Card key={l} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ color: cor, fontSize: 22, fontWeight: 700 }}>{v}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{l}</div>
          </Card>
        ))}
      </Grid>

      <Grid cols="repeat(3,1fr)" gap={14} style={{ marginBottom: 20 }}>
        <Card style={{ padding: 16 }}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 10, fontSize: 13 }}>⚖️ Sentenças</div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ textAlign: "center" }}><div style={{ color: C.success, fontSize: 22, fontWeight: 700 }}>{totalSentFav}</div><div style={{ color: C.muted, fontSize: 11 }}>Favoráveis</div></div>
            <div style={{ textAlign: "center" }}><div style={{ color: C.danger, fontSize: 22, fontWeight: 700 }}>{totalSentDesf}</div><div style={{ color: C.muted, fontSize: 11 }}>Desfavoráveis</div></div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 10, fontSize: 13 }}>📋 Acórdãos</div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ textAlign: "center" }}><div style={{ color: C.success, fontSize: 22, fontWeight: 700 }}>{totalAcFav}</div><div style={{ color: C.muted, fontSize: 11 }}>Providos</div></div>
            <div style={{ textAlign: "center" }}><div style={{ color: C.danger, fontSize: 22, fontWeight: 700 }}>{totalAcDesf}</div><div style={{ color: C.muted, fontSize: 11 }}>Improvidos</div></div>
          </div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 10, fontSize: 13 }}>📎 Agravos</div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ textAlign: "center" }}><div style={{ color: C.success, fontSize: 22, fontWeight: 700 }}>{totalAgrProv}</div><div style={{ color: C.muted, fontSize: 11 }}>Providos</div></div>
            <div style={{ textAlign: "center" }}><div style={{ color: C.danger, fontSize: 22, fontWeight: 700 }}>{totalAgrImp}</div><div style={{ color: C.muted, fontSize: 11 }}>Improvidos</div></div>
          </div>
        </Card>
      </Grid>

      <Grid cols="1fr 1fr" gap={16}>
        <Card>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 12 }}>📅 Próximos Eventos</div>
          {proximos.map(e => {
            const adv = advs.find(a => a.id === e.responsavel);
            return (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ color: C.text, fontSize: 13 }}>{e.titulo}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{e.hora} {adv ? `• ${adv.nome}` : ""}</div>
                </div>
                <div style={{ color: e.data <= hoje ? C.danger : C.accent, fontSize: 13, fontWeight: 600, textAlign: "right" }}>{fmtComDia(e.data)}</div>
              </div>
            );
          })}
        </Card>
        <Card>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 12 }}>⏱ Timesheet — Top 5 Processos</div>
          {[...processos].sort((a, b) => {
            const ma = (a.horasTrabalhadas || 0) * 60 + (a.minTrabalhados || 0);
            const mb = (b.horasTrabalhadas || 0) * 60 + (b.minTrabalhados || 0);
            return mb - ma;
          }).slice(0, 5).map(p => {
            const mins = andamentos.filter(a => a.processoId === p.id).reduce((s, a) => s + (a.horas || 0) * 60 + (a.minutos || 0), 0);
            return (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ color: C.text, fontSize: 13 }}>{p.id} <span style={{ color: C.muted, fontSize: 11 }}>{p.classe?.slice(0, 28)}</span></div>
                <div style={{ color: C.accent, fontWeight: 700 }}>{fmtHoras(Math.floor(mins / 60), mins % 60)}</div>
              </div>
            );
          })}
        </Card>
      </Grid>
    </div>
  );
}
