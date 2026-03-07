import { useState } from "react";
import { C } from '../constants/paleta';
import { Badge, Btn, Grid, Inp, Sel } from '../components/ui';

export default function Configuracoes({ tema, setTema, usuario, setUsuario, escritorio, setEscritorio, onClose }) {
  const [tab, setTab] = useState("conta");
  const [editUser, setEditUser] = useState({ ...usuario });
  const [senhaForm, setSenhaForm] = useState({ atual: "", nova: "", conf: "" });
  const [saved, setSaved] = useState(false);

  function salvarConta() { setUsuario({ ...editUser }); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function salvarSenha() {
    if (!senhaForm.nova || senhaForm.nova !== senhaForm.conf) return alert("A nova senha e a confirmação não coincidem.");
    setSenhaForm({ atual: "", nova: "", conf: "" }); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  const tabs = [["conta", "👤 Conta"], ["sistema", "⚙️ Sistema"], ["notif", "🔔 Notificações"]];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, width: 600, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 17, fontFamily: "'DM Serif Display',serif" }}>Configurações</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Gerencie sua conta e preferências do sistema</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 4, padding: "12px 24px 0", borderBottom: `1px solid ${C.border}` }}>
          {tabs.map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} style={{ padding: "8px 16px", background: "transparent", border: "none", borderBottom: `2px solid ${tab === v ? C.accent : "transparent"}`, color: tab === v ? C.accent : C.muted, cursor: "pointer", fontWeight: tab === v ? 700 : 400, fontSize: 13, transition: "all .15s", marginBottom: -1 }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ padding: 24 }}>
          {saved && <div style={{ background: C.success + "18", border: `1px solid ${C.success}44`, borderRadius: 10, padding: "10px 16px", color: C.success, fontWeight: 600, fontSize: 13, marginBottom: 16 }}>✓ Alterações salvas com sucesso!</div>}

          {tab === "conta" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: 16, background: C.glass, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg,${C.gold},${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 4px 16px ${C.gold}44`, flexShrink: 0 }}>👤</div>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>{editUser.nome}</div>
                  <div style={{ color: C.muted, fontSize: 13 }}>{editUser.oab}</div>
                  <div style={{ marginTop: 6 }}><Badge label={editUser.perfil} color={C.accent} /></div>
                </div>
              </div>
              <Grid cols="1fr 1fr" gap={14}>
                <Inp label="Nome completo" value={editUser.nome} onChange={v => setEditUser(u => ({ ...u, nome: v }))} style={{ gridColumn: "span 2" }} />
                <Inp label="E-mail" value={editUser.email} onChange={v => setEditUser(u => ({ ...u, email: v }))} />
                <Inp label="Telefone" value={editUser.tel} onChange={v => setEditUser(u => ({ ...u, tel: v }))} />
                <Inp label="OAB" value={editUser.oab} onChange={v => setEditUser(u => ({ ...u, oab: v }))} />
                <Sel label="Perfil" value={editUser.perfil} onChange={v => setEditUser(u => ({ ...u, perfil: v }))} options={["Administrador", "Advogado", "Colaborador", "Estagiário"].map(x => ({ value: x, label: x }))} />
              </Grid>
              <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 20, paddingTop: 20 }}>
                <div style={{ color: C.silver, fontWeight: 600, fontSize: 13, marginBottom: 14 }}>🔐 Alterar Senha</div>
                <Grid cols="1fr 1fr 1fr" gap={12}>
                  <Inp label="Senha atual" type="password" value={senhaForm.atual} onChange={v => setSenhaForm(f => ({ ...f, atual: v }))} />
                  <Inp label="Nova senha" type="password" value={senhaForm.nova} onChange={v => setSenhaForm(f => ({ ...f, nova: v }))} />
                  <Inp label="Confirmar nova senha" type="password" value={senhaForm.conf} onChange={v => setSenhaForm(f => ({ ...f, conf: v }))} />
                </Grid>
                <Btn label="Atualizar senha" onClick={salvarSenha} color={C.warning} style={{ marginTop: 12 }} small />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <Btn label="Salvar alterações" onClick={salvarConta} />
                <Btn label="Cancelar" onClick={onClose} color={C.border} />
              </div>
            </div>
          )}

          {tab === "sistema" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ padding: 18, background: C.cardHi, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🌗 Tema da Interface</div>
                <div style={{ color: C.muted, fontSize: 12, marginBottom: 14 }}>Escolha entre modo escuro (padrão) e modo claro</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[["dark", "🌙 Modo Escuro"], ["light", "☀️ Modo Claro"]].map(([v, l]) => (
                    <button key={v} onClick={() => setTema(v)} style={{ flex: 1, padding: "14px 10px", borderRadius: 12, border: `2px solid ${tema === v ? C.accent : C.border}`, background: tema === v ? C.accent + "18" : "transparent", color: tema === v ? C.accent : C.muted, cursor: "pointer", fontWeight: tema === v ? 700 : 400, fontSize: 13, transition: "all .18s", boxShadow: tema === v ? `0 0 16px ${C.accent}30` : "none" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ padding: 18, background: C.cardHi, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🌍 Idioma e Região</div>
                <div style={{ color: C.muted, fontSize: 12, marginBottom: 14 }}>Configurações de data e formato numérico</div>
                <Grid cols="1fr 1fr" gap={12}>
                  <Sel label="Idioma" value="pt-BR" onChange={() => {}} options={[{ value: "pt-BR", label: "Português (Brasil)" }]} />
                  <Sel label="Formato de Data" value="dd/mm/yyyy" onChange={() => {}} options={[{ value: "dd/mm/yyyy", label: "DD/MM/AAAA" }]} />
                </Grid>
              </div>
              <div style={{ padding: 18, background: C.cardHi, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>🏛️ Dados do Escritório</div>
                <div style={{ color: C.muted, fontSize: 12, marginBottom: 14 }}>Usados no timbrado dos documentos e no cabeçalho do sistema</div>
                <Grid cols="1fr 1fr" gap={12}>
                  <Inp label="Nome / Razão Social" value={escritorio?.nome || ""} onChange={v => setEscritorio(e => ({ ...e, nome: v }))} style={{ gridColumn: "span 2" }} />
                  <Inp label="CNPJ" value={escritorio?.cnpj || ""} onChange={v => setEscritorio(e => ({ ...e, cnpj: v }))} />
                  <Inp label="OAB" value={escritorio?.oab || ""} onChange={v => setEscritorio(e => ({ ...e, oab: v }))} />
                  <Inp label="E-mail" value={escritorio?.email || ""} onChange={v => setEscritorio(e => ({ ...e, email: v }))} />
                  <Inp label="Telefone" value={escritorio?.telefone || ""} onChange={v => setEscritorio(e => ({ ...e, telefone: v }))} />
                  <Inp label="Site" value={escritorio?.site || ""} onChange={v => setEscritorio(e => ({ ...e, site: v }))} style={{ gridColumn: "span 2" }} />
                  <Inp label="Endereço" value={escritorio?.endereco || ""} onChange={v => setEscritorio(e => ({ ...e, endereco: v }))} style={{ gridColumn: "span 2" }} />
                  <Inp label="Cidade" value={escritorio?.cidade || ""} onChange={v => setEscritorio(e => ({ ...e, cidade: v }))} />
                  <Inp label="UF" value={escritorio?.uf || ""} onChange={v => setEscritorio(e => ({ ...e, uf: v }))} />
                  <Inp label="% Caixa padrão nos contratos" type="number" value={String(escritorio?.caixaPercDefault || "")} onChange={v => setEscritorio(e => ({ ...e, caixaPercDefault: parseFloat(v) || 0 }))} style={{ gridColumn: "span 2" }} />
                </Grid>
                <div style={{ marginTop: 12 }}><Btn label="Salvar dados do escritório" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }} small /></div>
              </div>
            </div>
          )}

          {tab === "notif" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Prazos vencendo em 3 dias", "Alerta na interface para prazos próximos", true],
                ["Audiências próximas", "Lembrete de audiências nos próximos 3 dias", true],
                ["Parcelas em atraso", "Notificação de parcelas vencidas não baixadas", true],
                ["Novos processos", "Aviso quando um novo processo é cadastrado", false],
                ["Relatório semanal", "Resumo de produtividade toda segunda-feira", false],
              ].map(([titulo, desc, ativo], i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: C.cardHi, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 8 }}>
                  <div>
                    <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{titulo}</div>
                    <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{desc}</div>
                  </div>
                  <div style={{ width: 42, height: 24, borderRadius: 12, background: ativo ? C.accent : C.border, position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: ativo ? 21 : 3, transition: "left .2s" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
