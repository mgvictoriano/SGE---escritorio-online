import { useState, useEffect, useMemo } from "react";
import { C, PALETA_DARK, PALETA_LIGHT, makeGS } from './constants/paleta';
import { initClientes, initAdv, initProcessos, initAndamentos, initAgenda, initContratos, initPecas, initServicosAvulsos } from './constants/mockData';
import { fmt, fmtComDia, today } from './utils/datas';
import Dashboard from './modules/Dashboard';
import Clientes from './modules/Clientes';
import Processos from './modules/Processos';
import Agenda from './modules/Agenda';
import Financeiro from './modules/Financeiro';
import Documentos from './modules/Documentos';
import Colaboradores from './modules/Colaboradores';
import Produtividade from './modules/Produtividade';
import EfiBankIntegracao from './modules/EfiBank';
import Configuracoes from './modules/Configuracoes';
import BuscaGlobal from './components/shared/BuscaGlobal';
import PainelNotificacoes from './components/shared/PainelNotificacoes';
import LogAuditoria from './components/shared/LogAuditoria';
import CalcHonorarios from './components/shared/CalcHonorarios';
import MapaRiscos from './components/shared/MapaRiscos';

const MENU = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "clientes", icon: "👥", label: "Clientes" },
  { id: "processos", icon: "⚖️", label: "Processos" },
  { id: "agenda", icon: "📅", label: "Agenda & Prazos" },
  { id: "financeiro", icon: "💰", label: "Financeiro" },
  { id: "documentos", icon: "📄", label: "Documentos" },
  { id: "colaboradores", icon: "👨‍⚖️", label: "Colaboradores" },
  { id: "produtividade", icon: "📊", label: "Produtividade" },
  { id: "efi", icon: "🏦", label: "Banco Efí" },
];

export default function App() {
  const [tema, setTemaState] = useState("dark");
  const [mod, setMod] = useState("dashboard");
  const [showConfig, setShowConfig] = useState(false);
  const [showBusca, setShowBusca] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showCalcHon, setShowCalcHon] = useState(false);
  const [showMapaRiscos, setShowMapaRiscos] = useState(false);
  const [usuario, setUsuario] = useState({ id: "ADV001", nome: "Dr. André Ferreira", oab: "SP 123.456", email: "andre@escritorio.com", tel: "(11) 99000-0001", perfil: "Administrador", cor: "#4f8ef7" });
  const [clientes, setClientes] = useState(initClientes);
  const [advs, setAdvs] = useState(initAdv);
  const [processos, setProcessos] = useState(initProcessos);
  const [andamentos, setAndamentos] = useState(initAndamentos);
  const [agenda, setAgenda] = useState(initAgenda);
  const [contratos, setContratos] = useState(initContratos);
  const [pecas, setPecas] = useState(initPecas);
  const [servicosAvulsos, setServicosAvulsos] = useState(initServicosAvulsos);
  const [escritorio, setEscritorio] = useState({ nome: "Escritório Advocacia Exemplo", cnpj: "12.345.678/0001-99", oab: "SP 123.456", email: "contato@escritorio.com.br", telefone: "(11) 3456-7890", cep: "01310-100", endereco: "Av. Paulista, 1000, Sala 501", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP", site: "www.escritorio.com.br", caixaPercDefault: 10 });

  const hoje = today();
  const em3 = new Date(); em3.setDate(em3.getDate() + 3); const em3s = em3.toISOString().split("T")[0];
  const [notifLidas, setNotifLidas] = useState([]);

  const notifsDinamicas = useMemo(() => {
    const ns = [];
    agenda.filter(e => e.data >= hoje && e.data <= em3s && (e.tipo === "prazo" || e.tipo === "audiencia")).forEach(e => {
      ns.push({ id: "ag_" + e.id, icon: "⏰", titulo: `Prazo urgente: ${e.titulo}`, msg: `${fmtComDia(e.data)} às ${e.hora || "—"}`, data: "Agenda", tipo: "urgente" });
    });
    contratos.forEach(c => c.parcelas.forEach(p => {
      if (p.status === "atrasada" || (p.venc < hoje && p.status === "aberta")) {
        ns.push({ id: "fin_" + c.id + "_" + p.n, icon: "💸", titulo: `Parcela em atraso — ${c.id}`, msg: `Parcela ${p.n} venceu em ${fmt(p.venc)} (R$ ${p.valor.toLocaleString("pt-BR")})`, data: "Financeiro", tipo: "atraso" });
      }
    }));
    processos.filter(p => p.status === "ativo").forEach(p => {
      const ands = andamentos.filter(a => a.processoId === p.id);
      if (ands.length > 0) {
        const ua = ands.map(a => a.data).sort().at(-1);
        const diff = Math.floor((new Date() - new Date(ua + "T12:00:00")) / (1000 * 60 * 60 * 24));
        if (diff > 30) ns.push({ id: "proc_" + p.id, icon: "📂", titulo: `Processo sem atualização — ${p.id}`, msg: `Último andamento há ${diff} dias`, data: "Processos", tipo: "atencao" });
      }
    });
    return ns.map(n => ({ ...n, lida: notifLidas.includes(n.id) }));
  }, [agenda, contratos, processos, andamentos, notifLidas, hoje, em3s]);

  const naoLidas = notifsDinamicas.filter(n => !n.lida).length;

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setShowBusca(true); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const [, forceRender] = useState(0);
  function setTema(t) {
    setTemaState(t);
    const p = t === "light" ? PALETA_LIGHT : PALETA_DARK;
    Object.assign(C, p);
    forceRender(n => n + 1);
  }

  const gs = makeGS(tema);
  const sidebarLight = tema === "light" ? "#1a2e48" : C.sidebar;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, fontFamily: "'DM Sans',system-ui,sans-serif", overflow: "hidden" }}>
      <style>{gs}</style>

      {showConfig && <Configuracoes tema={tema} setTema={setTema} usuario={usuario} setUsuario={setUsuario} escritorio={escritorio} setEscritorio={setEscritorio} onClose={() => setShowConfig(false)} />}
      {showBusca && <BuscaGlobal clientes={clientes} processos={processos} andamentos={andamentos} pecas={pecas} onNavegar={m => { setMod(m); }} onClose={() => setShowBusca(false)} />}
      {showNotifs && <PainelNotificacoes notifs={notifsDinamicas} onMarcarLida={id => setNotifLidas(l => [...l, id])} onMarcarTodas={() => setNotifLidas(notifsDinamicas.map(n => n.id))} onClose={() => setShowNotifs(false)} />}
      {showAudit && <LogAuditoria usuario={usuario.nome} onClose={() => setShowAudit(false)} />}
      {showCalcHon && <CalcHonorarios onClose={() => setShowCalcHon(false)} />}
      {showMapaRiscos && <MapaRiscos processos={processos} clientes={clientes} onClose={() => setShowMapaRiscos(false)} />}

      {/* SIDEBAR */}
      <div style={{ width: 230, background: sidebarLight, borderRight: `1px solid ${tema === "light" ? "#2a4a70" : C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: "4px 0 24px rgba(0,0,0,0.4)", position: "relative" }}>
        {/* Logo */}
        <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(180deg,rgba(74,158,255,0.1) 0%,transparent 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${C.gold},${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: `0 4px 12px ${C.gold}55` }}>⚖️</div>
            <div>
              <div style={{ color: "#ddeeff", fontWeight: 700, fontSize: 15, letterSpacing: "0.5px", fontFamily: "'DM Serif Display',serif" }}>SGE</div>
              <div style={{ color: "#8aaccc", fontSize: 10, letterSpacing: "0.8px", textTransform: "uppercase", marginTop: 1 }}>Gestão Advocatícia</div>
            </div>
            <button onClick={() => setTema(tema === "dark" ? "light" : "dark")} title={tema === "dark" ? "Modo claro" : "Modo escuro"} style={{ marginLeft: "auto", width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#ddeeff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0 }}>
              {tema === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
          <button onClick={() => setShowBusca(true)} style={{ width: "100%", marginTop: 12, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, padding: "7px 12px", color: "#8aaccc", cursor: "pointer", fontSize: 12, textAlign: "left" }}>
            <span>🔍</span><span style={{ flex: 1 }}>Buscar... </span><span style={{ fontSize: 10, opacity: 0.6 }}>Ctrl+K</span>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          {MENU.map(m => (
            <button key={m.id} onClick={() => setMod(m.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 13px", borderRadius: 12, border: `1px solid ${mod === m.id ? "rgba(74,158,255,0.4)" : "transparent"}`, background: mod === m.id ? "rgba(74,158,255,0.18)" : "transparent", color: mod === m.id ? "#7ec8e3" : "#8aaccc", cursor: "pointer", fontSize: 13, fontWeight: mod === m.id ? 600 : 400, marginBottom: 3, textAlign: "left", transition: "all .18s ease", boxShadow: mod === m.id ? "0 2px 12px rgba(74,158,255,0.15)" : "none" }}>
              <span style={{ fontSize: 15 }}>{m.icon}</span>
              <span style={{ flex: 1 }}>{m.label}</span>
              {m.id === "agenda" && naoLidas > 0 && <span style={{ background: C.danger, color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{naoLidas}</span>}
            </button>
          ))}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {[["⚖️ Calc. Honorários", () => setShowCalcHon(true)], ["🎯 Mapa de Riscos", () => setShowMapaRiscos(true)], ["📋 Log de Auditoria", () => setShowAudit(true)]].map(([l, fn]) => (
              <button key={l} onClick={fn} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 13px", borderRadius: 10, border: "none", background: "transparent", color: "#6a8aaa", cursor: "pointer", fontSize: 11.5, textAlign: "left", transition: "all .15s", marginBottom: 1 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(74,158,255,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {l}
              </button>
            ))}
          </div>
        </nav>

        {/* Rodapé */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(74,158,255,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${C.gold},${C.goldHi})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>👤</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#ddeeff", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{usuario.nome}</div>
              <div style={{ color: "#8aaccc", fontSize: 10, marginTop: 1 }}>{usuario.perfil}</div>
            </div>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowNotifs(true)} title="Notificações" style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "#8aaccc", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0 }}>🔔</button>
              {naoLidas > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: C.danger, color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>{naoLidas}</span>}
            </div>
            <button onClick={() => setShowConfig(true)} title="Configurações" style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "#8aaccc", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", flexShrink: 0 }}>
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: tema === "light" ? `radial-gradient(ellipse 80% 50% at 20% -10%,rgba(26,111,196,0.06),transparent),${C.bg}` : `radial-gradient(ellipse 80% 50% at 20% -10%, ${C.accent}09, transparent), radial-gradient(ellipse 60% 40% at 80% 110%, ${C.accent2}06, transparent), ${C.bg}` }}>
        {mod === "dashboard" && <Dashboard clientes={clientes} processos={processos} agenda={agenda} contratos={contratos} andamentos={andamentos} pecas={pecas} advs={advs} servicosAvulsos={servicosAvulsos} />}
        {mod === "clientes" && <Clientes clientes={clientes} setClientes={setClientes} andamentos={andamentos} />}
        {mod === "processos" && <Processos processos={processos} setProcessos={setProcessos} clientes={clientes} andamentos={andamentos} setAndamentos={setAndamentos} pecas={pecas} setPecas={setPecas} advs={advs} agenda={agenda} setAgenda={setAgenda} />}
        {mod === "agenda" && <Agenda agenda={agenda} setAgenda={setAgenda} processos={processos} advs={advs} />}
        {mod === "financeiro" && <Financeiro contratos={contratos} setContratos={setContratos} clientes={clientes} processos={processos} advs={advs} servicosAvulsos={servicosAvulsos} setServicosAvulsos={setServicosAvulsos} />}
        {mod === "documentos" && <Documentos clientes={clientes} processos={processos} escritorio={escritorio} />}
        {mod === "colaboradores" && <Colaboradores advs={advs} setAdvs={setAdvs} processos={processos} agenda={agenda} andamentos={andamentos} />}
        {mod === "produtividade" && <Produtividade advs={advs} processos={processos} andamentos={andamentos} pecas={pecas} contratos={contratos} clientes={clientes} />}
        {mod === "efi" && <EfiBankIntegracao contratos={contratos} clientes={clientes} setContratos={setContratos} />}
      </div>
    </div>
  );
}
