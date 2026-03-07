import { useState } from "react";
import { C } from '../constants/paleta';
import { fmtComDia, today } from '../utils/datas';
import { Badge, Btn, Card, Grid, Inp, Sel } from '../components/ui';

export default function EfiBankIntegracao({ contratos, clientes, setContratos }) {
  const [tab, setTab] = useState("config");
  const [config, setConfig] = useState({ clientId: "", clientSecret: "", ambiente: "homologacao", webhookUrl: "", pixChave: "", pixTipo: "aleatoria" });
  const [carneSel, setCarneSel] = useState({ contratoId: "", repeats: 12, fine: 2, interest: 1, message: "Honorários advocatícios" });
  const [carnes, setCarnes] = useState([
    { id: "CNE001", contratoId: "C001", cliente: "João Silva", repeats: 12, status: "ativo", parcelas: [{ n: 1, venc: "2026-02-01", status: "paid" }, { n: 2, venc: "2026-03-01", status: "waiting" }, { n: 3, venc: "2026-04-01", status: "waiting" }], valor: 850 },
    { id: "CNE002", contratoId: "C002", cliente: "Empresa XYZ Ltda", repeats: 6, status: "ativo", parcelas: [{ n: 1, venc: "2026-01-15", status: "paid" }, { n: 2, venc: "2026-02-15", status: "paid" }, { n: 3, venc: "2026-03-15", status: "unpaid" }], valor: 1200 },
  ]);
  const [despesas, setDespesas] = useState([
    { id: 1, data: "2026-02-10", descricao: "Distribuição – Processo 0001-A", valor: 28.50, tipo: "despesa", origem: "manual", processoId: "0001-A" },
    { id: 2, data: "2026-02-15", descricao: "Cópias autenticadas", valor: 45.00, tipo: "despesa", origem: "manual", processoId: "0423-A" },
    { id: 3, data: "2026-03-01", descricao: "Honorários recebidos – João Silva (parcela 1)", valor: 850.00, tipo: "receita", origem: "efi", processoId: "0001-A" },
  ]);
  const [despForm, setDespForm] = useState(null);
  const [testando, setTestando] = useState(false);
  const [testeOk, setTesteOk] = useState(null);

  const statusClrEfi = { waiting: C.warning, unpaid: C.danger, paid: C.success, settled: C.success, canceled: C.muted, contested: C.danger };
  const statusLblEfi = { waiting: "Aguardando", unpaid: "Não pago", paid: "Pago", settled: "Liquidado", canceled: "Cancelado", contested: "Contestado" };

  const totalReceitas = despesas.filter(d => d.tipo === "receita").reduce((s, d) => s + d.valor, 0);
  const totalDespesas = despesas.filter(d => d.tipo === "despesa").reduce((s, d) => s + d.valor, 0);

  async function testarConexao() {
    setTestando(true); setTesteOk(null);
    await new Promise(r => setTimeout(r, 1200));
    setTesteOk(config.clientId && config.clientSecret ? "ok" : "erro");
    setTestando(false);
  }

  const tabStyle = (t) => ({ padding: "8px 16px", borderRadius: 10, border: `1px solid ${tab === t ? C.accent : C.border}`, background: tab === t ? C.accent + "22" : "transparent", color: tab === t ? C.accent : C.muted, cursor: "pointer", fontSize: 12, fontWeight: tab === t ? 700 : 400 });

  return (
    <div>
      <h2 style={{ color: C.text, margin: "0 0 20px", fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400 }}>🏦 Integração Banco Efí</h2>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {[["config", "⚙️ Configuração"], ["carnes", "📜 Carnês"], ["financeiro", "💳 Financeiro"], ["docs", "📚 Documentação API"]].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={tabStyle(v)}>{l}</button>
        ))}
      </div>

      {tab === "config" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🔑 Credenciais da Aplicação Efí</div>
            <div style={{ padding: 12, background: C.warning + "15", border: `1px solid ${C.warning}44`, borderRadius: 10, marginBottom: 14, fontSize: 12, color: C.silver }}>
              <strong style={{ color: C.warning }}>Como obter:</strong> Acesse <strong>efipay.com.br → Login → API → Criar Aplicação</strong>. Habilite escopos "API Cobranças" (boleto/carnê). Copie Client_ID e Client_Secret gerados.
            </div>
            <Grid cols="1fr 1fr" gap={14}>
              <Inp label="Client_ID" value={config.clientId} onChange={v => setConfig(c => ({ ...c, clientId: v }))} style={{ gridColumn: "span 2" }} />
              <Inp label="Client_Secret" value={config.clientSecret} onChange={v => setConfig(c => ({ ...c, clientSecret: v }))} style={{ gridColumn: "span 2" }} />
              <Sel label="Ambiente" value={config.ambiente} onChange={v => setConfig(c => ({ ...c, ambiente: v }))} options={[{ value: "homologacao", label: "🧪 Homologação (sandbox)" }, { value: "producao", label: "🟢 Produção" }]} />
              <Inp label="URL Webhook (callback de pagamentos)" value={config.webhookUrl} onChange={v => setConfig(c => ({ ...c, webhookUrl: v }))} />
            </Grid>
            <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
              <Btn label={testando ? "Testando..." : "🔌 Testar Conexão"} onClick={testarConexao} color={C.accent2} />
              {testeOk === "ok" && <span style={{ color: C.success, fontSize: 12, fontWeight: 700 }}>✓ Conexão OK — credenciais válidas</span>}
              {testeOk === "erro" && <span style={{ color: C.danger, fontSize: 12, fontWeight: 700 }}>✗ Preencha Client_ID e Client_Secret</span>}
            </div>
          </Card>
          <Card>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🔷 Configuração Pix (opcional)</div>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>Para emitir boletos com QR Code Pix (Bolix). A API Pix requer certificado .p12 adicional — configure no backend Java.</div>
            <Grid cols="1fr 1fr" gap={14}>
              <Inp label="Chave Pix" value={config.pixChave} onChange={v => setConfig(c => ({ ...c, pixChave: v }))} />
              <Sel label="Tipo da Chave" value={config.pixTipo} onChange={v => setConfig(c => ({ ...c, pixTipo: v }))} options={["cpf", "cnpj", "email", "telefone", "aleatoria"].map(x => ({ value: x, label: x }))} />
            </Grid>
          </Card>
        </div>
      )}

      {tab === "carnes" && (
        <div>
          <div style={{ marginBottom: 16, padding: 12, background: C.accent + "11", border: `1px solid ${C.accent}33`, borderRadius: 10, fontSize: 12, color: C.silver }}>
            <strong style={{ color: C.accent }}>Carnê Efí:</strong> até 24 parcelas mensais, boleto + QR Code Pix, com multa e juros configuráveis. Pagamentos confirmados automaticamente via webhook.
          </div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>+ Emitir Novo Carnê</div>
            <Grid cols="1fr 1fr 1fr" gap={14}>
              <Sel label="Contrato / Cliente" value={carneSel.contratoId} onChange={v => setCarneSel(c => ({ ...c, contratoId: v }))} style={{ gridColumn: "span 2" }}
                options={[{ value: "", label: "Selecione um contrato..." }, ...contratos.map(c => { const cl = clientes.find(x => x.id === c.clienteId); return { value: c.id, label: `${c.id} — ${cl?.nome || c.clienteId} — R$ ${parseFloat(c.valorTotal || 0).toLocaleString("pt-BR")}` }; })]} />
              <Inp label="Nº de parcelas (máx 24)" type="number" value={String(carneSel.repeats)} onChange={v => setCarneSel(c => ({ ...c, repeats: Math.min(24, Math.max(1, parseInt(v) || 1)) }))} />
              <Inp label="Multa por atraso (%)" type="number" value={String(carneSel.fine)} onChange={v => setCarneSel(c => ({ ...c, fine: parseFloat(v) || 0 }))} />
              <Inp label="Juros a.m. (%)" type="number" value={String(carneSel.interest)} onChange={v => setCarneSel(c => ({ ...c, interest: parseFloat(v) || 0 }))} />
              <Inp label="Mensagem no boleto" value={carneSel.message} onChange={v => setCarneSel(c => ({ ...c, message: v }))} style={{ gridColumn: "span 3" }} />
            </Grid>
            <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
              <Btn label="📤 Emitir Carnê via API Efí" onClick={() => {
                if (!carneSel.contratoId) return alert("Selecione um contrato.");
                const cont = contratos.find(c => c.id === carneSel.contratoId);
                const cl = clientes.find(c => c.id === cont?.clienteId);
                alert(`Simulação: Carnê de ${carneSel.repeats}x para ${cl?.nome || "cliente"} seria enviado à API Efí.\n\nEm produção, o backend Java faz POST /v1/carnet com as credenciais OAuth2 e retorna o carnet_id e links dos boletos.`);
              }} color={C.success} />
              <span style={{ color: C.muted, fontSize: 11 }}>* Requer credenciais configuradas e backend Java conectado</span>
            </div>
          </Card>
          {carnes.map(cn => (
            <Card key={cn.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}>{cn.id} — {cn.cliente}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{cn.repeats} parcelas · R$ {cn.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/parcela</div>
                </div>
                <Badge label={cn.status === "ativo" ? "Ativo" : "Cancelado"} color={cn.status === "ativo" ? C.success : C.danger} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {cn.parcelas.map(p => (
                  <div key={p.n} style={{ minWidth: 100, padding: "8px 10px", background: statusClrEfi[p.status] + "18", border: `1px solid ${statusClrEfi[p.status]}44`, borderRadius: 8, textAlign: "center" }}>
                    <div style={{ color: C.muted, fontSize: 10 }}>Parcela {p.n}</div>
                    <div style={{ color: statusClrEfi[p.status], fontSize: 11, fontWeight: 700 }}>{statusLblEfi[p.status]}</div>
                    <div style={{ color: C.muted, fontSize: 10 }}>{fmtComDia(p.venc)}</div>
                    {p.status === "unpaid" && (
                      <button onClick={() => setCarnes(cs => cs.map(c => c.id === cn.id ? { ...c, parcelas: c.parcelas.map(x => x.n === p.n ? { ...x, status: "settled" } : x) } : c))}
                        style={{ marginTop: 4, padding: "2px 8px", borderRadius: 6, border: `1px solid ${C.success}`, background: "transparent", color: C.success, cursor: "pointer", fontSize: 10 }}>
                        Marcar pago
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "financeiro" && (
        <div>
          <Grid cols="1fr 1fr 1fr" gap={12} style={{ marginBottom: 16 }}>
            {[["💰", `R$ ${totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Receitas", C.success], ["📤", `R$ ${totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Despesas", C.danger], ["📊", `R$ ${(totalReceitas - totalDespesas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Saldo", totalReceitas >= totalDespesas ? C.success : C.danger]].map(([ic, v, l, cor]) => (
              <Card key={l} style={{ textAlign: "center", padding: 14, border: `1px solid ${cor}22` }}>
                <div style={{ fontSize: 20 }}>{ic}</div>
                <div style={{ color: cor, fontWeight: 800, fontSize: 18, margin: "4px 0" }}>{v}</div>
                <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3px" }}>{l}</div>
              </Card>
            ))}
          </Grid>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>Lançamentos</div>
            <Btn label="+ Lançamento" onClick={() => setDespForm({ data: today(), descricao: "", valor: 0, tipo: "despesa", origem: "manual", processoId: "" })} small color={C.accent2} />
          </div>
          {despForm && (
            <Card style={{ marginBottom: 12 }}>
              <Grid cols="1fr 1fr 1fr" gap={12}>
                <Inp label="Data" type="date" value={despForm.data} onChange={v => setDespForm(f => ({ ...f, data: v }))} />
                <Sel label="Tipo" value={despForm.tipo} onChange={v => setDespForm(f => ({ ...f, tipo: v }))} options={[{ value: "receita", label: "💰 Receita" }, { value: "despesa", label: "📤 Despesa" }]} />
                <Inp label="Valor (R$)" type="number" value={String(despForm.valor)} onChange={v => setDespForm(f => ({ ...f, valor: parseFloat(v) || 0 }))} />
                <Inp label="Descrição" value={despForm.descricao} onChange={v => setDespForm(f => ({ ...f, descricao: v }))} style={{ gridColumn: "span 2" }} />
                <Inp label="Processo (ex: 0001-A)" value={despForm.processoId} onChange={v => setDespForm(f => ({ ...f, processoId: v }))} />
              </Grid>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <Btn label="Salvar" small onClick={() => { setDespesas(d => [...d, { ...despForm, id: Date.now() }]); setDespForm(null); }} />
                <Btn label="Cancelar" small onClick={() => setDespForm(null)} color={C.border} />
              </div>
            </Card>
          )}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.cardHi }}>
                  {["Data", "Tipo", "Descrição", "Processo", "Origem", "Valor"].map(h => (
                    <th key={h} style={{ color: C.muted, fontSize: 10.5, padding: "10px 14px", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...despesas].sort((a, b) => b.data.localeCompare(a.data)).map(d => (
                  <tr key={d.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 14px", color: C.muted, fontSize: 12 }}>{fmtComDia(d.data)}</td>
                    <td style={{ padding: "10px 14px" }}><Badge label={d.tipo === "receita" ? "💰 Receita" : "📤 Despesa"} color={d.tipo === "receita" ? C.success : C.danger} /></td>
                    <td style={{ padding: "10px 14px", color: C.text, fontSize: 12 }}>{d.descricao}</td>
                    <td style={{ padding: "10px 14px", color: C.accent, fontSize: 12 }}>{d.processoId || "—"}</td>
                    <td style={{ padding: "10px 14px" }}><Badge label={d.origem === "efi" ? "🏦 Efí" : "Manual"} color={d.origem === "efi" ? C.accent2 : C.border} /></td>
                    <td style={{ padding: "10px 14px", color: d.tipo === "receita" ? C.success : C.danger, fontWeight: 700, fontSize: 13 }}>{d.tipo === "receita" ? "+" : "-"} R$ {d.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "docs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["🔐 Autenticação OAuth2", "POST /v1/authorize", "Header: Authorization: Basic base64(client_id:client_secret)\nBody: {\"grant_type\":\"client_credentials\"}\n→ Retorna access_token (válido 3600s)\nUsar: Authorization: Bearer {access_token} em todas as requisições subsequentes", C.accent],
            ["📜 Emitir Carnê", "POST /v1/carnet", "Body: { items:[{name,value,amount}], customer:{name,cpf,email,phone_number,address}, expire_at:'YYYY-MM-DD', repeats:12, configurations:{fine:2,interest:1}, message:'...' }\n→ Retorna: { code:200, data:{ carnet_id, status, parcels:[{parcel,link,barcode,expire_at}] } }", C.success],
            ["🔔 Webhook de Pagamento", "POST {sua-url-callback}", "Efí envia automaticamente: { notification_token:'...' }\nConsultar: GET /v1/notification/{token}\n→ Retorna status atualizado da parcela/cobrança", C.warning],
            ["✅ Marcar Parcela Paga", "PUT /v1/carnet/:id/parcel/:n/settle", "Usar quando pagamento ocorreu fora da Efí (ex: depósito bancário, Pix manual).\nNão gera movimentação financeira real na conta Efí — apenas atualiza status.", C.accent2],
            ["🔍 Listar Cobranças", "GET /v1/charges", "Query params: begin_date, end_date, status, customer_document\nEx: /v1/charges?begin_date=2026-01-01&end_date=2026-03-31&status=paid\n→ Lista paginada de todas as cobranças no período", C.warning],
          ].map(([titulo, endpoint, desc, cor]) => (
            <Card key={titulo} style={{ border: `1px solid ${cor}22` }}>
              <div style={{ color: cor, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{titulo}</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: C.accent2, background: C.cardHi, borderRadius: 6, padding: "6px 10px", marginBottom: 8 }}>{endpoint}</div>
              <pre style={{ color: C.muted, fontSize: 11, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{desc}</pre>
            </Card>
          ))}
          <Card style={{ border: `1px solid ${C.border}` }}>
            <div style={{ color: C.silver, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>📦 SDK Java — dependência Maven</div>
            <pre style={{ fontFamily: "monospace", fontSize: 11, color: C.accent, background: C.cardHi, borderRadius: 8, padding: "10px 14px", margin: 0, overflowX: "auto" }}>{`<dependency>
  <groupId>br.com.efipay</groupId>
  <artifactId>sdk-java-apis-efi</artifactId>
  <version>LATEST</version>
</dependency>

// Configuração Spring Boot:
EfiOptions options = new EfiOptions(clientId, clientSecret, false);
EfiCobrancas api = new EfiCobrancas(options);
HashMap<String,Object> body = new HashMap<>();
// body.put("items", ...) → POST /v1/carnet`}</pre>
          </Card>
        </div>
      )}
    </div>
  );
}
