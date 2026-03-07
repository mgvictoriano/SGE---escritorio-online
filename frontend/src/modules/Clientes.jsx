import { useState } from "react";
import { C } from '../constants/paleta';
import { today, fmt, fmtComDia } from '../utils/datas';
import { Badge, Card, Inp, Sel, Btn, Grid } from '../components/ui';
import CepInput from '../components/shared/CepInput';

export default function Clientes({ clientes, setClientes, andamentos }) {
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState(null);
  const [view, setView] = useState(null);
  const [ordem, setOrdem] = useState("codigo");
  const newAdmin = () => ({ nome: "", cpf: "", cargo: "" });

  function novoForm() {
    const nextId = String(Math.max(...clientes.map(c => parseInt(c.id) || 0), 0) + 1).padStart(4, "0");
    setForm({ id: nextId, tipoPessoa: "PF", nome: "", cpf: "", rg: "", estadoCivil: "", profissao: "", cep: "", endereco: "", bairro: "", cidade: "", uf: "", telefone: "", email: "", obs: "", admins: [], _novo: true, updatedAt: today() });
  }

  function salvar() {
    if (!form.nome) return alert("Nome obrigatório.");
    if (form.tipoPessoa === "PJ" && (!form.admins || form.admins.length === 0))
      return alert("Pessoa Jurídica requer ao menos 1 representante legal cadastrado.");
    const now = today();
    if (form._novo) setClientes(p => [...p, { ...form, _novo: undefined, updatedAt: now }]);
    else setClientes(p => p.map(c => c.id === form.id ? { ...form, _novo: undefined, updatedAt: now } : c));
    setForm(null);
  }

  function addAdmin() { setForm(f => ({ ...f, admins: [...f.admins, newAdmin()] })); }
  function setAdmin(i, k, v) { setForm(f => ({ ...f, admins: f.admins.map((a, j) => j === i ? { ...a, [k]: v } : a) })); }
  function remAdmin(i) { setForm(f => ({ ...f, admins: f.admins.filter((_, j) => j !== i) })); }

  const handleCepFill = (data) => {
    setForm(f => ({
      ...f,
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      uf: data.uf || "",
      endereco: `${data.logradouro || ""}${data.complemento ? ", " + data.complemento : ""}`,
    }));
  };

  function ultimoAnd(clienteId) {
    const procs = andamentos ? andamentos.filter(a => a.processoId?.startsWith(clienteId)) : [];
    return procs.length ? procs.sort((a, b) => b.data.localeCompare(a.data))[0].data : "";
  }

  const base = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) || c.id.includes(busca) || (c.cpf || "").includes(busca)
  );
  const lista = [...base].sort((a, b) => {
    if (ordem === "alfa") return a.nome.localeCompare(b.nome, "pt-BR");
    if (ordem === "atualizacao") {
      const da = ultimoAnd(a.id) || a.updatedAt || a.id;
      const db = ultimoAnd(b.id) || b.updatedAt || b.id;
      return db.localeCompare(da);
    }
    return a.id.localeCompare(b.id);
  });

  if (form) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Btn label="← Voltar" onClick={() => setForm(null)} color={C.border} />
        <h2 style={{ color: C.text, margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>
          {form._novo ? "Novo Cliente" : "Editar Cliente"}
        </h2>
      </div>
      <Card>
        <Grid cols="1fr 1fr 1fr" gap={14}>
          <Inp label="Código Interno" value={form.id} onChange={v => setForm(f => ({ ...f, id: v }))} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ color: C.muted, fontSize: 12 }}>Tipo de Pessoa</label>
            <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
              {["PF", "PJ"].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, tipoPessoa: t, admins: [] }))}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: `1px solid ${form.tipoPessoa === t ? C.accent : C.border}`, background: form.tipoPessoa === t ? C.accent + "18" : "transparent", color: form.tipoPessoa === t ? C.accent : C.muted, cursor: "pointer", fontWeight: form.tipoPessoa === t ? 700 : 400 }}>
                  {t === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                </button>
              ))}
            </div>
          </div>
          <Inp label={form.tipoPessoa === "PF" ? "Nome Completo" : "Razão Social"} value={form.nome} onChange={v => setForm(f => ({ ...f, nome: v }))} />
          <Inp label={form.tipoPessoa === "PF" ? "CPF" : "CNPJ"} value={form.cpf} onChange={v => setForm(f => ({ ...f, cpf: v }))} />
          {form.tipoPessoa === "PF" && <Inp label="RG" value={form.rg} onChange={v => setForm(f => ({ ...f, rg: v }))} />}
          {form.tipoPessoa === "PF" && <Inp label="Estado Civil" value={form.estadoCivil} onChange={v => setForm(f => ({ ...f, estadoCivil: v }))} />}
          {form.tipoPessoa === "PF" && <Inp label="Profissão" value={form.profissao} onChange={v => setForm(f => ({ ...f, profissao: v }))} style={{ gridColumn: "span 2" }} />}
          <Inp label="Telefone" value={form.telefone} onChange={v => setForm(f => ({ ...f, telefone: v }))} />
          <Inp label="E-mail" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} style={{ gridColumn: "span 2" }} />
          <div style={{ gridColumn: "span 3" }}>
            <div style={{ color: C.silver, fontWeight: 600, marginBottom: 12, fontSize: 13, letterSpacing: "0.2px", borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>📍 Endereço</div>
            <Grid cols="1fr 1fr 1fr" gap={14}>
              <CepInput value={form.cep || ""} onChange={v => setForm(f => ({ ...f, cep: v }))} onFill={handleCepFill} />
              <Inp label="Logradouro" value={form.endereco || ""} onChange={v => setForm(f => ({ ...f, endereco: v }))} style={{ gridColumn: "span 2" }} />
              <Inp label="Número" value={form.numero || ""} onChange={v => setForm(f => ({ ...f, numero: v }))} />
              <Inp label="Bairro" value={form.bairro || ""} onChange={v => setForm(f => ({ ...f, bairro: v }))} />
              <Inp label="Complemento" value={form.complemento || ""} onChange={v => setForm(f => ({ ...f, complemento: v }))} />
              <Inp label="Cidade" value={form.cidade || ""} onChange={v => setForm(f => ({ ...f, cidade: v }))} />
              <Inp label="UF" value={form.uf || ""} onChange={v => setForm(f => ({ ...f, uf: v }))} />
            </Grid>
          </div>
          <Inp label="Observações" value={form.obs} onChange={v => setForm(f => ({ ...f, obs: v }))} style={{ gridColumn: "span 3" }} />
        </Grid>

        {form.tipoPessoa === "PJ" && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ color: C.text, fontWeight: 600 }}>Representantes Legais <span style={{ color: C.danger, fontSize: 12 }}>* obrigatório ao menos 1</span></div>
              <Btn label="+ Adicionar" onClick={addAdmin} small color={C.accent2} />
            </div>
            {form.admins.length === 0 && <div style={{ color: C.danger, fontSize: 13, padding: "10px 14px", background: C.danger + "10", borderRadius: 12, border: `1px solid ${C.danger}30` }}>⚠️ Nenhum representante legal cadastrado. Ao menos 1 é obrigatório para Pessoa Jurídica.</div>}
            {form.admins.map((a, i) => (
              <Card key={i} style={{ marginBottom: 10, padding: 14 }}>
                <Grid cols="1fr 1fr 1fr auto" gap={12}>
                  <Inp label="Nome" value={a.nome} onChange={v => setAdmin(i, "nome", v)} />
                  <Inp label="CPF" value={a.cpf} onChange={v => setAdmin(i, "cpf", v)} />
                  <Inp label="Cargo" value={a.cargo} onChange={v => setAdmin(i, "cargo", v)} />
                  <div style={{ display: "flex", alignItems: "flex-end" }}><Btn label="✕" onClick={() => remAdmin(i)} small color={C.danger} /></div>
                </Grid>
              </Card>
            ))}
          </div>
        )}
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Btn label="Salvar" onClick={salvar} />
          <Btn label="Cancelar" onClick={() => setForm(null)} color={C.border} />
        </div>
      </Card>
    </div>
  );

  if (view) {
    const c = clientes.find(x => x.id === view);
    return (
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <Btn label="← Voltar" onClick={() => setView(null)} color={C.border} />
          <Btn label="Editar" onClick={() => { setForm({ ...c, admins: c.admins || [] }); setView(null); }} color={C.accent2} />
        </div>
        <Card>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <span style={{ background: C.accent + "18", color: C.accent2, borderRadius: 12, padding: "4px 12px", fontWeight: 600, fontSize: 12, letterSpacing: "0.5px" }}>{c.id}</span>
            <Badge label={c.tipoPessoa === "PF" ? "Pessoa Física" : "Pessoa Jurídica"} color={c.tipoPessoa === "PF" ? C.accent : C.accent2} />
          </div>
          <h3 style={{ color: C.text, margin: "0 0 16px" }}>{c.nome}</h3>
          <Grid cols="1fr 1fr" gap={10}>
            {[["CPF/CNPJ", c.cpf], ["RG", c.rg], ["Estado Civil", c.estadoCivil], ["Profissão", c.profissao], ["Telefone", c.telefone], ["E-mail", c.email], ["CEP", c.cep], ["Endereço", `${c.endereco || ""}${c.numero ? ", " + c.numero : ""}${c.bairro ? ", " + c.bairro : ""}${c.cidade ? ", " + c.cidade : ""}${c.uf ? " – " + c.uf : ""}`], ["Obs", c.obs]].map(([l, v]) => v && (
              <div key={l}><div style={{ color: C.muted, fontSize: 11 }}>{l}</div><div style={{ color: C.text, fontSize: 13 }}>{v}</div></div>
            ))}
          </Grid>
          {(c.admins || []).length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ color: C.text, fontWeight: 600, marginBottom: 10 }}>Representantes Legais</div>
              {c.admins.map((a, i) => (
                <div key={i} style={{ padding: "8px 12px", background: C.surface, borderRadius: 10, marginBottom: 8 }}>
                  <span style={{ color: C.text, fontWeight: 600 }}>{a.nome}</span> <span style={{ color: C.muted, fontSize: 12 }}>CPF: {a.cpf}</span> <Badge label={a.cargo} color={C.accent2} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: C.text, margin: 0, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>Clientes</h2>
        <Btn label="+ Novo Cliente" onClick={novoForm} />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Inp placeholder="Buscar por nome, código ou CPF/CNPJ..." value={busca} onChange={setBusca} style={{ flex: 1, minWidth: 200, marginBottom: 0 }} />
        <div style={{ display: "flex", gap: 2, background: C.cardHi, borderRadius: 20, padding: 3, border: `1px solid ${C.border}`, flexShrink: 0 }}>
          {[["codigo", "# Código"], ["alfa", "A–Z Nome"], ["atualizacao", "↺ Atualização"]].map(([v, l]) => (
            <button key={v} onClick={() => setOrdem(v)} style={{ padding: "5px 12px", borderRadius: 16, background: ordem === v ? C.accent : "transparent", color: ordem === v ? "#fff" : C.muted, border: "none", cursor: "pointer", fontSize: 11, fontWeight: ordem === v ? 700 : 400, transition: "all .15s", whiteSpace: "nowrap" }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>{lista.length} cliente{lista.length !== 1 ? "s" : ""}</div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: C.cardHi }}>
              {["Código", "Tipo", "Nome", "CPF/CNPJ", "Telefone", "Últ. atualização", ""].map(h => (
                <th key={h} style={{ color: C.muted, fontSize: 10.5, padding: "12px 16px", textAlign: "left", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map(c => {
              const ua = ultimoAnd(c.id) || c.updatedAt;
              return (
                <tr key={c.id} style={{ borderTop: `1px solid ${C.border}`, transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = C.glass} onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "12px 16px", color: C.accent, fontWeight: 700, fontSize: 13 }}>{c.id}</td>
                  <td style={{ padding: "12px 16px" }}><Badge label={c.tipoPessoa} color={c.tipoPessoa === "PF" ? C.accent : C.accent2} /></td>
                  <td style={{ padding: "12px 16px", color: C.text, fontSize: 13 }}>
                    {c.nome}
                    {c.tipoPessoa === "PJ" && (!c.admins || c.admins.length === 0) && <span style={{ marginLeft: 8, color: C.danger, fontSize: 10 }}>⚠️ sem rep.</span>}
                  </td>
                  <td style={{ padding: "12px 16px", color: C.muted, fontSize: 12 }}>{c.cpf}</td>
                  <td style={{ padding: "12px 16px", color: C.muted, fontSize: 12 }}>{c.telefone}</td>
                  <td style={{ padding: "12px 16px", color: C.muted, fontSize: 11 }}>{ua ? fmtComDia(ua) : "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Btn label="Ver" onClick={() => setView(c.id)} small color={C.accent2} style={{ marginRight: 6 }} />
                    <Btn label="Editar" onClick={() => setForm({ ...c, admins: c.admins || [] })} small />
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
