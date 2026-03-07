/**
 * ============================================================================
 * SGE — Sistema de Gestão Advocatícia  |  Versão 3.0
 * ============================================================================
 *
 * VISÃO GERAL
 * -----------
 * Aplicação React single-file (SPA) que gerencia todos os fluxos operacionais
 * de um escritório de advocacia. Atualmente roda 100% no navegador (sem backend).
 * Este arquivo é o ponto de partida para integração com API Java/Spring Boot.
 *
 * MÓDULOS IMPLEMENTADOS
 * ---------------------
 *  1. Dashboard       — KPIs, próximos eventos, timesheet, indicadores jurídicos
 *  2. Clientes        — Cadastro PF/PJ com representante legal obrigatório para PJ
 *  3. Processos       — Gestão processual completa com andamentos, peças e prazos
 *  4. Agenda          — Eventos, calculadora de prazos (dias úteis/corridos/tribunais)
 *  5. Financeiro      — Contratos de honorários, parcelas, serviços avulsos, rateio
 *  6. Documentos      — Geração de procurações, contratos e declarações
 *  7. Colaboradores   — Gestão de advogados e equipe
 *  8. Escritório      — Dados cadastrais do escritório
 *
 * ESTADO ATUAL (FRONTEND-ONLY)
 * -----------------------------
 *  - Todos os dados vivem em React useState (memória do browser)
 *  - Reinicia ao recarregar a página — sem persistência
 *  - Sem autenticação — usuário fixo hardcoded
 *  - Cálculo de CEP usa API pública: https://viacep.com.br
 *
 * PRÓXIMOS PASSOS COM BACKEND JAVA
 * ----------------------------------
 *  - Substituir cada useState de dados por chamadas fetch() → API REST (Spring Boot)
 *  - Implementar autenticação JWT
 *  - Banco de dados sugerido: PostgreSQL
 *  - Ver BRIEFING TÉCNICO separado para detalhes completos
 *
 * DEPENDÊNCIAS EXTERNAS
 *  - React 18+ (hooks: useState, useEffect, useRef, useMemo, useCallback)
 *  - Google Fonts: DM Sans + DM Serif Display (carregadas via @import no GS)
 *  - ViaCEP API: https://viacep.com.br (busca de endereço por CEP)
 *
 * AUTORA DO DESIGN & FUNCIONALIDADES: equipe do escritório
 * DESENVOLVEDOR FRONTEND: Claude (Anthropic) — SGE v3
 * ============================================================================
 */

import { useState, useMemo, useEffect, useRef, useCallback } from "react";

// ── PALETA ──────────────────────────────────────────────────────────────────
// ============================================================================
// SEÇÃO 1: PALETA DE CORES
// ----------------------------------------------------------------------------
// Todas as cores do sistema em um único objeto "C".
// Para trocar o tema, basta alterar os valores aqui.
//
// BACKEND: Não é necessário expor cores via API. Manter apenas no frontend.
// ============================================================================
// ── PALETAS — Dark (padrão) e Light ──────────────────────────────────────────
const PALETA_DARK = {
  bg:       "#0d1520",
  card:     "#111d2e",
  cardHi:   "#162438",
  border:   "#1e3050",
  borderHi: "#2a4a70",
  accent:   "#4a9eff",
  accent2:  "#7ec8e3",
  silver:   "#b8cce0",
  gold:     "#c9a84c",
  goldHi:   "#e8c76a",
  text:     "#ddeeff",
  muted:    "#5a7a9a",
  subtle:   "#2a4060",
  success:  "#3dd68c",
  warning:  "#f0b429",
  danger:   "#ff6b6b",
  sidebar:  "#0a1220",
  glass:    "rgba(74,158,255,0.06)",
  inputBg:  "rgba(10,18,32,0.7)",
  selectBg: "#111d2e",
  surface:  "rgba(10,18,32,0.5)",
  tableHead:"rgba(10,18,32,0.6)",
  barTrack: "rgba(10,18,32,0.6)",
  shadow:   "rgba(0,0,0,0.30)",
};
const PALETA_LIGHT = {
  bg:       "#f0f4f8",
  card:     "#ffffff",
  cardHi:   "#eef3fa",
  border:   "#c8d8ec",
  borderHi: "#99b8d8",
  accent:   "#1a6fc4",
  accent2:  "#2a8eaa",
  silver:   "#3a5a7a",
  gold:     "#8a6010",
  goldHi:   "#b08020",
  text:     "#0d1e30",
  muted:    "#607a94",
  subtle:   "#dce8f4",
  success:  "#1a9e5c",
  warning:  "#b07010",
  danger:   "#c0302a",
  sidebar:  "#1a2e48",
  glass:    "rgba(26,111,196,0.05)",
  inputBg:  "#ffffff",
  selectBg: "#ffffff",
  surface:  "#eef3fa",
  tableHead:"#e4ecf6",
  barTrack: "#d4e4f4",
  shadow:   "rgba(0,0,0,0.07)",
};
// C é inicializado como dark; o App altera via setTema que chama setCPaleta
let C = {...PALETA_DARK};

// ============================================================================
// SEÇÃO 2: ESTILOS GLOBAIS (CSS injetado no <style> do App)
// ----------------------------------------------------------------------------
// Fonte: DM Sans (corpo) + DM Serif Display (títulos) — carregadas do Google Fonts
// Scrollbar customizada, animações fadeUp, placeholders coloridos
// ============================================================================
// ── ESTILOS GLOBAIS — gerados dinamicamente por tema ─────────────────────────
function makeGS(tema) {
  const p = tema === "light" ? PALETA_LIGHT : PALETA_DARK;
  return `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');
  * { box-sizing: border-box; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${p.border}; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: ${p.borderHi}; }
  input, select, textarea, button { font-family: inherit; }
  input::placeholder { color: ${p.muted}; opacity: 0.7; }
  textarea::placeholder { color: ${p.muted}; opacity: 0.7; }
  select option { background: ${p.selectBg}; color: ${p.text}; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: ${tema==="light"?"invert(0.4)":"invert(0.7)"}; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  .fadeUp { animation: fadeUp 0.28s cubic-bezier(.22,.68,0,1.2) both; }
`;}
const GS = makeGS("dark");

// ============================================================================
// SEÇÃO 3: UTILITÁRIOS DE DATA E FORMATAÇÃO
// ----------------------------------------------------------------------------
// Funções puras de formatação — não dependem de estado React.
//
//  fmt(iso)         → "DD/MM/AAAA"
//  fmtComDia(iso)   → "DD/MM/AAAA (Seg)"
//  getDiaSemana()   → "segunda-feira"  (nome completo, pt-BR)
//  today()          → string ISO da data atual
//
// BACKEND: Replicar lógica de formatação no frontend. O backend deve retornar
// datas sempre no formato ISO 8601 (YYYY-MM-DD).
// ============================================================================
// ── DIAS DA SEMANA ──────────────────────────────────────────────────────────
const DIAS_PT = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
const DIAS_ABREV = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
function getDiaSemana(iso){ const d=new Date(iso+"T12:00:00"); return DIAS_PT[d.getDay()]; }
function getDiaAbrev(iso){ if(!iso)return""; const d=new Date(iso+"T12:00:00"); return DIAS_ABREV[d.getDay()]; }
function fmt(d){if(!d)return"";const[y,m,dd]=d.split("-");return`${dd}/${m}/${y}`;}
function fmtComDia(d){if(!d)return"";return`${fmt(d)} (${getDiaAbrev(d)})`;}
function today(){return new Date().toISOString().split("T")[0];}

// ============================================================================
// SEÇÃO 4: DADOS GEOGRÁFICOS — COMARCAS E TRIBUNAIS
// ----------------------------------------------------------------------------
// SUGESTOES_COMARCAS: lista de ~150 comarcas usadas como autocomplete.
//   O campo é LIVRE — o usuário pode digitar qualquer comarca não listada.
//
// TRIBUNAIS: lista completa de tribunais brasileiros (STF, STJ, TJs, TRFs, TRTs, TREs)
//   Também usado como autocomplete livre.
//
// BACKEND: Estes dados podem ser mantidos no frontend (hardcoded) ou servidos
// via endpoint GET /api/tribunais e GET /api/comarcas para facilitar atualizações.
// ============================================================================
// ── SUGESTÕES DE COMARCAS (campo livre — usadas apenas como dica no autocomplete) ──
const SUGESTOES_COMARCAS = [
  // SP
  "Adamantina","Americana","Amparo","Andradina","Araçatuba","Araraquara","Araras","Assis","Atibaia","Avaré",
  "Barretos","Barueri","Bauru","Birigui","Botucatu","Bragança Paulista","Campinas","Caraguatatuba","Catanduva",
  "Cotia","Diadema","Embu das Artes","Franca","Francisco Morato","Franco da Rocha","Guarujá","Guarulhos",
  "Indaiatuba","Itapecerica da Serra","Itapetininga","Itapeva","Itapevi","Itaquaquecetuba","Itu","Jaú","Jundiaí",
  "Leme","Limeira","Lins","Lorena","Marília","Mauá","Mogi das Cruzes","Mogi Guaçu","Mogi Mirim",
  "Osasco","Ourinhos","Piracicaba","Pirangi","Piraju","Praia Grande","Presidente Prudente","Registro",
  "Ribeirão Preto","Rio Claro","Salto","Santo André","Santos","São Bernardo do Campo","São Caetano do Sul",
  "São Carlos","São José do Rio Preto","São José dos Campos","São Paulo","São Roque","São Sebastião","São Vicente",
  "Sorocaba","Sumaré","Suzano","Taubaté","Tupã","Ubatuba","Vinhedo","Votuporanga",
  // RJ
  "Angra dos Reis","Cabo Frio","Campos dos Goytacazes","Duque de Caxias","Itaboraí","Itaguaí","Macaé",
  "Magé","Niterói","Nova Friburgo","Nova Iguaçu","Petrópolis","Resende","Rio das Ostras","Rio de Janeiro",
  "São Gonçalo","São João de Meriti","Teresópolis","Volta Redonda",
  // MG
  "Araguari","Araxá","Barbacena","Belo Horizonte","Betim","Caratinga","Conselheiro Lafaiete","Contagem",
  "Coronel Fabriciano","Curvelo","Diamantina","Divinópolis","Governador Valadares","Ipatinga","Itajubá",
  "Ituiutaba","Juiz de Fora","Lavras","Mariana","Montes Claros","Muriaé","Nova Lima","Ouro Preto",
  "Pará de Minas","Passos","Patos de Minas","Poços de Caldas","Ponte Nova","Sete Lagoas","São João del-Rei",
  "Teófilo Otoni","Uberaba","Uberlândia","Varginha","Viçosa",
  // RS
  "Alegrete","Bagé","Bento Gonçalves","Cachoeira do Sul","Canoas","Caxias do Sul","Cruz Alta","Erechim",
  "Gravataí","Ijuí","Lajeado","Novo Hamburgo","Passo Fundo","Pelotas","Porto Alegre","Rio Grande",
  "Santa Cruz do Sul","Santa Maria","São Leopoldo","Uruguaiana","Viamão",
  // PR
  "Apucarana","Cascavel","Curitiba","Foz do Iguaçu","Francisco Beltrão","Guarapuava","Londrina","Maringá",
  "Paranaguá","Ponta Grossa","São José dos Pinhais","Toledo","Umuarama",
  // BA / outros
  "Feira de Santana","Ilhéus","Itabuna","Salvador","Vitória da Conquista",
  // Capitais / federais
  "Belém","Belo Horizonte","Brasília","Campo Grande","Cuiabá","Curitiba","Florianópolis","Fortaleza",
  "Goiânia","João Pessoa","Macapá","Maceió","Manaus","Natal","Palmas","Porto Alegre","Porto Velho",
  "Recife","Rio Branco","Rio de Janeiro","Salvador","São Luís","São Paulo","Teresina","Vitória",
];

// ── TRIBUNAIS ───────────────────────────────────────────────────────────────
const TRIBUNAIS = ["STF – Supremo Tribunal Federal","STJ – Superior Tribunal de Justiça","TST – Tribunal Superior do Trabalho","TSE – Tribunal Superior Eleitoral","STM – Superior Tribunal Militar","TRF1 – Tribunal Regional Federal da 1ª Região","TRF2 – Tribunal Regional Federal da 2ª Região","TRF3 – Tribunal Regional Federal da 3ª Região","TRF4 – Tribunal Regional Federal da 4ª Região","TRF5 – Tribunal Regional Federal da 5ª Região","TRF6 – Tribunal Regional Federal da 6ª Região","TJAC – Tribunal de Justiça do Acre","TJAL – Tribunal de Justiça de Alagoas","TJAP – Tribunal de Justiça do Amapá","TJAM – Tribunal de Justiça do Amazonas","TJBA – Tribunal de Justiça da Bahia","TJCE – Tribunal de Justiça do Ceará","TJDFT – Tribunal de Justiça do Distrito Federal e Territórios","TJES – Tribunal de Justiça do Espírito Santo","TJGO – Tribunal de Justiça de Goiás","TJMA – Tribunal de Justiça do Maranhão","TJMT – Tribunal de Justiça do Mato Grosso","TJMS – Tribunal de Justiça do Mato Grosso do Sul","TJMG – Tribunal de Justiça de Minas Gerais","TJPA – Tribunal de Justiça do Pará","TJPB – Tribunal de Justiça da Paraíba","TJPR – Tribunal de Justiça do Paraná","TJPE – Tribunal de Justiça de Pernambuco","TJPI – Tribunal de Justiça do Piauí","TJRJ – Tribunal de Justiça do Rio de Janeiro","TJRN – Tribunal de Justiça do Rio Grande do Norte","TJRS – Tribunal de Justiça do Rio Grande do Sul","TJRO – Tribunal de Justiça de Rondônia","TJRR – Tribunal de Justiça de Roraima","TJSC – Tribunal de Justiça de Santa Catarina","TJSP – Tribunal de Justiça de São Paulo","TJSE – Tribunal de Justiça de Sergipe","TJTO – Tribunal de Justiça do Tocantins","TRT1 – TRT da 1ª Região (RJ)","TRT2 – TRT da 2ª Região (SP)","TRT3 – TRT da 3ª Região (MG)","TRT4 – TRT da 4ª Região (RS)","TRT5 – TRT da 5ª Região (BA)","TRT6 – TRT da 6ª Região (PE)","TRT7 – TRT da 7ª Região (CE)","TRT8 – TRT da 8ª Região (PA/AP)","TRT9 – TRT da 9ª Região (PR)","TRT10 – TRT da 10ª Região (DF/TO)","TRT11 – TRT da 11ª Região (AM/RR)","TRT12 – TRT da 12ª Região (SC)","TRT13 – TRT da 13ª Região (PB)","TRT14 – TRT da 14ª Região (RO/AC)","TRT15 – TRT da 15ª Região (Campinas/SP)","TRT16 – TRT da 16ª Região (MA)","TRT17 – TRT da 17ª Região (ES)","TRT18 – TRT da 18ª Região (GO)","TRT19 – TRT da 19ª Região (AL)","TRT20 – TRT da 20ª Região (SE)","TRT21 – TRT da 21ª Região (RN)","TRT22 – TRT da 22ª Região (PI)","TRT23 – TRT da 23ª Região (MT)","TRT24 – TRT da 24ª Região (MS)","TRE-AC","TRE-AL","TRE-AP","TRE-AM","TRE-BA","TRE-CE","TRE-DF","TRE-ES","TRE-GO","TRE-MA","TRE-MT","TRE-MS","TRE-MG","TRE-PA","TRE-PB","TRE-PR","TRE-PE","TRE-PI","TRE-RJ","TRE-RN","TRE-RS","TRE-RO","TRE-RR","TRE-SC","TRE-SP","TRE-SE","TRE-TO","TJMSP – Tribunal de Justiça Militar do Estado de SP","TJMMG – Tribunal de Justiça Militar do Estado de MG","TJMRS – Tribunal de Justiça Militar do Estado de RS","CARF – Conselho Administrativo de Recursos Fiscais","CADE – Conselho Administrativo de Defesa Econômica","Juizado Especial Federal","Juizado Especial Estadual","Vara Federal","Vara Estadual"];

// ============================================================================
// SEÇÃO 5: FERIADOS NACIONAIS E ESTADUAIS — ANO 2026
// ----------------------------------------------------------------------------
// Lista hardcoded de feriados nacionais, estaduais e municipais.
// Usada pelo cálculo de prazos para pular dias não úteis.
//
// CAMPOS: { d: "YYYY-MM-DD", nome, tipo: "nacional|estadual|municipal", fonte }
//
// BACKEND CRÍTICO: Esta lista DEVE ser gerenciada pelo backend e servida via
// GET /api/feriados?ano=2026
// Permite atualização sem redeploy do frontend. Incluir feriados de outros
// anos à medida que o sistema for usado.
//
// FONTE LEGAL: Lei nº 662/1949, Lei nº 9.093/1995, art. 216-A CLT
// ============================================================================
// ── FERIADOS ────────────────────────────────────────────────────────────────
const FERIADOS_DB = [
  {d:"2026-01-01",nome:"Confraternização Universal",tipo:"nacional",fonte:"Lei nº 662/1949"},
  {d:"2026-04-03",nome:"Sexta-feira Santa",tipo:"nacional",fonte:"Lei nº 9.093/1995"},
  {d:"2026-04-21",nome:"Tiradentes",tipo:"nacional",fonte:"Lei nº 662/1949"},
  {d:"2026-05-01",nome:"Dia do Trabalho",tipo:"nacional",fonte:"Lei nº 662/1949"},
  {d:"2026-06-04",nome:"Corpus Christi",tipo:"nacional",fonte:"Lei nº 9.093/1995"},
  {d:"2026-09-07",nome:"Independência do Brasil",tipo:"nacional",fonte:"Lei nº 662/1949"},
  {d:"2026-10-12",nome:"Nossa Sra. Aparecida",tipo:"nacional",fonte:"Lei nº 6.802/1980"},
  {d:"2026-11-02",nome:"Finados",tipo:"nacional",fonte:"Lei nº 662/1949"},
  {d:"2026-11-15",nome:"Proclamação da República",tipo:"nacional",fonte:"Lei nº 662/1949"},
  {d:"2026-12-25",nome:"Natal",tipo:"nacional",fonte:"Lei nº 662/1949"},
  {d:"2026-01-25",nome:"Aniversário de São Paulo",tipo:"municipal",fonte:"Lei Municipal SP"},
  {d:"2026-07-09",nome:"Revolução Constitucionalista (SP)",tipo:"estadual",fonte:"Lei Estadual SP"},
];
function getFeriado(iso){ return FERIADOS_DB.find(f=>f.d===iso)||null; }

// ============================================================================
// SEÇÃO 6: SUSPENSÕES DE PRAZOS POR TRIBUNAL (Recesso Forense)
// ----------------------------------------------------------------------------
// Períodos em que os prazos ficam SUSPENSOS por determinação do tribunal.
// Base legal: art. 220 do CPC (recesso de 20/12 a 20/01 e férias de julho).
//
// ESTRUTURA:
//   { "Nome do Tribunal": [ {ini: "YYYY-MM-DD", fim: "YYYY-MM-DD", motivo} ] }
//
// FUNÇÃO isSuspenso(iso, tribunal) → boolean
//   Verifica se uma data específica está dentro de período suspenso
//
// BACKEND CRÍTICO: Assim como os feriados, as suspensões DEVEM vir de API:
//   GET /api/suspensoes?tribunal=TJSP&ano=2026
// Cada tribunal publica seu calendário forense anualmente.
// ============================================================================
// ── SUSPENSÕES DE TRIBUNAIS ──────────────────────────────────────────────────
const SUSPENSOES_TRIBUNAL = {
  "TJSP – Tribunal de Justiça de São Paulo": [
    {ini:"2026-01-01",fim:"2026-01-31",motivo:"Recesso forense — janeiro (art. 220 CPC)"},
    {ini:"2026-07-01",fim:"2026-07-31",motivo:"Recesso forense — julho (art. 220 CPC)"},
    {ini:"2026-12-20",fim:"2026-12-31",motivo:"Recesso forense — dezembro"},
  ],
  "TJRJ – Tribunal de Justiça do Rio de Janeiro": [
    {ini:"2026-01-01",fim:"2026-01-31",motivo:"Recesso forense — janeiro"},
    {ini:"2026-02-16",fim:"2026-02-18",motivo:"Carnaval — Recesso TJRJ"},
    {ini:"2026-07-01",fim:"2026-07-31",motivo:"Recesso forense — julho"},
    {ini:"2026-12-20",fim:"2026-12-31",motivo:"Recesso forense — dezembro"},
  ],
  "STJ – Superior Tribunal de Justiça": [
    {ini:"2026-01-01",fim:"2026-01-31",motivo:"Recesso — janeiro"},
    {ini:"2026-07-01",fim:"2026-07-31",motivo:"Recesso — julho"},
    {ini:"2026-12-20",fim:"2026-12-31",motivo:"Recesso — dezembro"},
  ],
  "STF – Supremo Tribunal Federal": [
    {ini:"2026-01-01",fim:"2026-01-31",motivo:"Recesso STF — janeiro"},
    {ini:"2026-07-01",fim:"2026-07-31",motivo:"Recesso STF — julho"},
    {ini:"2026-12-20",fim:"2026-12-31",motivo:"Recesso STF — dezembro"},
  ],
  "TST – Tribunal Superior do Trabalho": [
    {ini:"2026-01-01",fim:"2026-01-20",motivo:"Recesso TST — janeiro"},
    {ini:"2026-07-01",fim:"2026-07-31",motivo:"Recesso TST — julho"},
    {ini:"2026-12-20",fim:"2026-12-31",motivo:"Recesso TST — dezembro"},
  ],
  "TRF3 – Tribunal Regional Federal da 3ª Região": [
    {ini:"2026-01-01",fim:"2026-01-31",motivo:"Recesso forense — janeiro"},
    {ini:"2026-07-01",fim:"2026-07-31",motivo:"Recesso forense — julho"},
    {ini:"2026-12-20",fim:"2026-12-31",motivo:"Recesso forense — dezembro"},
  ],
};
function getSuspensaoTribunal(iso, tribunal) {
  if(!tribunal) return null;
  const chave = Object.keys(SUSPENSOES_TRIBUNAL).find(k => tribunal.includes(k.split(" – ")[0]));
  if(!chave) return null;
  return (SUSPENSOES_TRIBUNAL[chave]||[]).find(s => iso >= s.ini && iso <= s.fim) || null;
}
function isSuspenso(iso, tribunal) { return !!getSuspensaoTribunal(iso, tribunal); }
function isUtilTribunal(iso, tribunal) {
  const d=new Date(iso+"T12:00:00");
  if(d.getDay()===0||d.getDay()===6) return false;
  if(FERIADOS_DB.find(f=>f.d===iso)) return false;
  if(isSuspenso(iso, tribunal)) return false;
  return true;
}
// ============================================================================
// SEÇÃO 7: CALCULADORA DE PRAZOS — LÓGICA CENTRAL
// ----------------------------------------------------------------------------
// addDias(start, qtd, tipo, tribunal) → { data: "YYYY-MM-DD", desc: [...] }
//
//  start     = data marco inicial (ISO string)
//  qtd       = número de dias a contar
//  tipo      = "uteis" | "corridos"
//  tribunal  = nome do tribunal (para verificar suspensões específicas)
//
// ALGORITMO (dias úteis):
//   A cada iteração, avança 1 dia e verifica:
//   1. É fim de semana? → não conta
//   2. É feriado (nacional/estadual/municipal)? → não conta
//   3. Está em período de suspensão do tribunal? → não conta
//   Só conta o dia se passar em TODAS as verificações.
//   Retorna também o array "desc" com os dias desconsiderados e o motivo.
//
// BASE LEGAL: art. 219 CPC (dias úteis), art. 220 CPC (suspensões)
//
// BACKEND CRÍTICO: Esta lógica DEVE ser replicada no Java.
//   Endpoint sugerido: POST /api/prazos/calcular
//   Body: { dataMarco, qtdDias, tipo, tribunal }
//   Response: { dataVencimento, diasDesconsiderados: [...] }
//
//   O frontend pode chamar esta API em tempo real (ao digitar) para exibir
//   o resultado calculado. Nunca confiar só no frontend para calcular prazos —
//   são datas fatais de processo judicial.
// ============================================================================

function addDias(start,qtd,tipo,tribunal=""){
  const dt=new Date(start+"T12:00:00"); let cont=0; const desc=[];
  while(cont<qtd){ dt.setDate(dt.getDate()+1); const iso=dt.toISOString().split("T")[0];
    if(tipo==="uteis"){
      if(isUtilTribunal(iso, tribunal)) cont++;
      else {
        const fw=getFeriado(iso);
        const susp=getSuspensaoTribunal(iso, tribunal);
        desc.push({iso,dia:getDiaSemana(iso),
          feriado:fw?`${fw.nome} (${fw.tipo}) — ${fw.fonte}`:null,
          suspensao:susp?`Suspensão: ${susp.motivo}`:null,
          fimSemana:dt.getDay()===0?"Domingo":dt.getDay()===6?"Sábado":null});
      }
    } else cont++;
  }
  return{data:dt.toISOString().split("T")[0],desc};
}

// ============================================================================
// SEÇÃO 8: CONSTANTES DE DOMÍNIO — BANCOS, FORMAS DE PAGAMENTO, TIPOS
// ----------------------------------------------------------------------------
// BANCOS: instituições financeiras disponíveis para registro de pagamento
// FORMAS_PAG: meios de pagamento aceitos
// TIPOS_DOC_PROCESSUAL: tipos de documento processual com prazo padrão sugerido
//   Cada tipo tem: value, label, prazoPadrao (em dias), tipoPrazo (uteis/corridos)
//
// BACKEND: Estes dados podem ser mantidos como enums no Java ou servidos via API.
// ============================================================================
// ── BANCOS / FORMAS ──────────────────────────────────────────────────────────
const BANCOS = ["Efí","NuBank","Cora","Itaú","Santander","Banco do Brasil","Outro"];
const FORMAS_PAG = ["Pix","Boleto","Cartão de Crédito","Cartão de Débito","Carnê","Dinheiro","TED/DOC"];

// ── TIPOS DE DOCUMENTOS PROCESSUAIS ─────────────────────────────────────────
const TIPOS_DOC_PROCESSUAL = [
  {value:"oficio",label:"Ofício",prazoPadrao:15,tipoPrazo:"uteis"},
  {value:"decisao",label:"Decisão",prazoPadrao:15,tipoPrazo:"uteis"},
  {value:"despacho",label:"Despacho",prazoPadrao:5,tipoPrazo:"uteis"},
  {value:"sentenca",label:"Sentença",prazoPadrao:15,tipoPrazo:"uteis"},
  {value:"acordao",label:"Acórdão",prazoPadrao:15,tipoPrazo:"uteis"},
  {value:"intimacao",label:"Intimação",prazoPadrao:15,tipoPrazo:"uteis"},
  {value:"citacao",label:"Citação",prazoPadrao:15,tipoPrazo:"uteis"},
];

// ============================================================================
// SEÇÃO 9: DADOS INICIAIS DE DEMONSTRAÇÃO (MOCK DATA)
// ----------------------------------------------------------------------------
// Dados hardcoded usados para popular o sistema enquanto não há backend.
// Quando o backend estiver pronto, TODOS estes arrays devem ser substituídos
// por chamadas à API REST no início de cada componente (useEffect + fetch).
//
// SUBSTITUIÇÃO SUGERIDA:
//   const [clientes, setClientes] = useState([]);
//   useEffect(() => {
//     fetch('/api/clientes').then(r => r.json()).then(setClientes);
//   }, []);
//
// MODELOS DE DADOS (resumo):
//
//  Cliente:   { id, tipoPessoa(PF|PJ), nome, cpf, rg, estadoCivil, profissao,
//               cep, endereco, bairro, numero, complemento, cidade, uf,
//               telefone, email, obs, admins: [{ nome, cpf, cargo }] }
//
//  Processo:  { id, clienteId, parteContraria: { nome, cpfCnpj, advogado, tipo },
//               nup, tribunal, comarca, vara, classe, assunto, valor, status,
//               responsavel(advId), tags, obs, horasTrabalhadas, pedidosDeferidos,
//               pedidosIndeferidos, sentencas[], acordaos[], agravos[],
//               docsProcessuais[] }
//
//  Andamento: { id, processoId, data, descricao, origem, relevancia,
//               usuario(advId), horas, minutos, tipoPeca }
//
//  Evento:    { id, tipo(audiencia|prazo|reuniao|tarefa|financeiro),
//               titulo, data, hora, local, obs, processoId, responsavel(advId) }
//
//  Contrato:  { id, clienteId, processoId, objeto, total, entrada,
//               caixaEsc(%), rateios: [{ advId, perc }],
//               parcelas: [{ n, venc, valor, status, dataPag, forma, banco, conta, comp }] }
//
//  ServicoAvulso: { id, clienteId, descricao, valor, data, forma, banco,
//                   status, rateios[], caixaEsc(%) }
//
//  Advogado:  { id, nome, oab, email, tel, perfil, cor }
//
//  Peça:      { id, processoId, data, tipo, advId, obs }
// ============================================================================
// ── DADOS INICIAIS ───────────────────────────────────────────────────────────
const initClientes=[
  {id:"0001",tipoPessoa:"PF",nome:"Maria Aparecida Silva",cpf:"123.456.789-00",rg:"12.345.678-9",estadoCivil:"Casada",profissao:"Professora",cep:"",endereco:"Rua das Flores, 123, Centro, Campinas/SP",telefone:"(19) 99123-4567",email:"maria@email.com",obs:"",admins:[]},
  {id:"0002",tipoPessoa:"PF",nome:"João Carlos Mendes",cpf:"987.654.321-00",rg:"98.765.432-1",estadoCivil:"Solteiro",profissao:"Engenheiro",cep:"",endereco:"Av. Brasil, 456, Jardim, Araras/SP",telefone:"(19) 98765-4321",email:"joao@email.com",obs:"",admins:[]},
  {id:"0423",tipoPessoa:"PJ",nome:"Empresa XYZ Ltda.",cpf:"12.345.678/0001-99",rg:"",estadoCivil:"",profissao:"",cep:"",endereco:"Rua Comercial, 789, Centro, São Paulo/SP",telefone:"(11) 3456-7890",email:"contato@xyz.com.br",obs:"",admins:[{nome:"Carlos Alberto Souza",cpf:"111.222.333-44",cargo:"Diretor Executivo"},{nome:"Fernanda Lima",cpf:"555.666.777-88",cargo:"Sócia Administradora"}]},
];
const initAdv=[
  {id:"ADV001",nome:"Dr. André Ferreira",oab:"SP 123.456",email:"andre@escritorio.com",tel:"(11) 99000-0001",perfil:"Administrador",cor:"#4f8ef7",foto:null},
  {id:"ADV002",nome:"Dra. Paula Mendonça",oab:"SP 789.012",email:"paula@escritorio.com",tel:"(11) 99000-0002",perfil:"Advogado",cor:"#6c63ff",foto:null},
  {id:"ADV003",nome:"Dr. Lucas Rocha",oab:"SP 345.678",email:"lucas@escritorio.com",tel:"(11) 99000-0003",perfil:"Colaborador",cor:"#34d399",foto:null},
];
const initProcessos=[
  {id:"0001-A",clienteId:"0001",parteContraria:{nome:"Seguradora Exemplo S.A.",cpfCnpj:"00.000.000/0001-00",advogado:"Dr. Fulano de Tal",tipo:"Ré"},nup:"1234567-89.2024.8.26.0114",tribunal:"TJSP – Tribunal de Justiça de São Paulo",comarca:"Campinas",vara:"1ª Vara Cível",classe:"Ação de Indenização",assunto:"Responsabilidade Civil",valor:"35000",status:"ativo",responsavel:"ADV001",tags:"urgente",obs:"",horasTrabalhadas:12,pedidosDeferidos:2,pedidosIndeferidos:1,sentencas:[],acordaos:[],agravos:[],docsProcessuais:[],probExito:75,valorCausa:35000},
  {id:"0002-A",clienteId:"0002",parteContraria:{nome:"",cpfCnpj:"",advogado:"",tipo:"Réu"},nup:"9876543-21.2025.8.26.0066",tribunal:"TJSP – Tribunal de Justiça de São Paulo",comarca:"Araras",vara:"Vara Única",classe:"Divórcio Litigioso",assunto:"Família",valor:"",status:"ativo",responsavel:"ADV002",tags:"",obs:"",horasTrabalhadas:8,pedidosDeferidos:1,pedidosIndeferidos:0,sentencas:[],acordaos:[],agravos:[],docsProcessuais:[],probExito:50,valorCausa:0},
  {id:"0423-A",clienteId:"0423",parteContraria:{nome:"Fulano da Silva",cpfCnpj:"000.111.222-33",advogado:"",tipo:"Réu"},nup:"1111111-11.2024.8.26.0100",tribunal:"TJSP – Tribunal de Justiça de São Paulo",comarca:"São Paulo",vara:"2ª Vara Empresarial",classe:"Execução de Título",assunto:"Direito Empresarial",valor:"120000",status:"ativo",responsavel:"ADV001",tags:"urgente",obs:"",horasTrabalhadas:20,pedidosDeferidos:3,pedidosIndeferidos:2,sentencas:[{data:"2025-11-01",tipo:"favoravel",obs:"Julgado procedente"}],acordaos:[],agravos:[{data:"2025-12-10",tipo:"provido",obs:""}],docsProcessuais:[],probExito:85,valorCausa:120000},
  {id:"0423-B",clienteId:"0423",parteContraria:{nome:"",cpfCnpj:"",advogado:"",tipo:"Réu"},nup:"2222222-22.2025.8.26.0100",tribunal:"TJSP – Tribunal de Justiça de São Paulo",comarca:"São Paulo",vara:"3ª Vara Cível",classe:"Ação Declaratória",assunto:"Contratos",valor:"50000",status:"suspenso",responsavel:"ADV002",tags:"",obs:"",horasTrabalhadas:5,pedidosDeferidos:0,pedidosIndeferidos:1,sentencas:[],acordaos:[],agravos:[],docsProcessuais:[],probExito:30,valorCausa:50000},
];
const initAndamentos=[
  {id:1,processoId:"0001-A",data:"2025-03-01",descricao:"Petição inicial protocolada.",origem:"manual",relevancia:"prazo",usuario:"ADV001",horas:2,minutos:0,tipoPeca:"Petição Inicial"},
  {id:2,processoId:"0001-A",data:"2025-04-10",descricao:"Audiência de conciliação designada para 15/05.",origem:"manual",relevancia:"audiencia",usuario:"ADV002",horas:1,minutos:30,tipoPeca:""},
  {id:3,processoId:"0423-A",data:"2025-06-01",descricao:"Despacho – emenda à inicial.",origem:"manual",relevancia:"despacho",usuario:"ADV001",horas:3,minutos:0,tipoPeca:"Emenda à Inicial"},
];
const initAgenda=[
  {id:1,tipo:"audiencia",titulo:"Audiência – 0001-A",data:"2026-03-15",hora:"14:00",local:"Fórum de Campinas",obs:"",processoId:"0001-A",responsavel:"ADV001"},
  {id:2,tipo:"prazo",titulo:"Prazo contestação – 0423-A",data:"2026-03-10",hora:"23:59",local:"",obs:"Prazo fatal",processoId:"0423-A",responsavel:"ADV001"},
  {id:3,tipo:"reuniao",titulo:"Reunião cliente João",data:"2026-03-08",hora:"10:00",local:"Escritório",obs:"",processoId:"",responsavel:"ADV002"},
  {id:4,tipo:"prazo",titulo:"Recurso – 0002-A",data:"2026-03-09",hora:"23:59",local:"",obs:"",processoId:"0002-A",responsavel:"ADV002"},
  {id:101,tipo:"prazo",titulo:"Prazo IMESC – Caso Bruno (1000486-76.2021.8.26.0698)",data:"2026-03-06",hora:"",local:"",obs:"Foro de Pirangi – Vara Única. Intimação DJE 15/01/2026.",processoId:"",responsavel:"ADV001",gcal:true},
  {id:108,tipo:"audiencia",titulo:"Audiência de Conciliação – Raphael (1017462-97.2025.8.26.0576)",data:"2026-03-17",hora:"16:00",local:"Virtual – Microsoft Teams",obs:"Foro SJRio Preto – 4ª Vara Família.",processoId:"",responsavel:"ADV001",gcal:true},
  {id:113,tipo:"audiencia",titulo:"Audiência Rafael – Maximillian (1027382-95.2025.8.26.0576)",data:"2026-03-24",hora:"09:15",local:"Virtual – Microsoft Teams",obs:"3ª Vara Família SJRio Preto.",processoId:"",responsavel:"ADV001",gcal:true},
  {id:114,tipo:"audiencia",titulo:"Audiência #0066 – Joelma – Pensão por Morte",data:"2026-03-24",hora:"16:00",local:"Juizado Especial Federal",obs:"INSS réu.",processoId:"",responsavel:"ADV001",gcal:true},
  {id:117,tipo:"financeiro",titulo:"#145-001 – Honorários (25x R$600)",data:"2026-04-05",hora:"",local:"",obs:"",processoId:"",responsavel:"ADV001",gcal:true},
  {id:119,tipo:"audiencia",titulo:"Audiência Andre (1001480-14.2023.8.26.0576)",data:"2026-04-14",hora:"16:00",local:"Virtual – Microsoft Teams",obs:"3ª Vara Cível SJRio Preto.",processoId:"",responsavel:"ADV001",gcal:true},
];
const initContratos=[
  {id:"0001-A",clienteId:"0001",processoId:"0001-A",objeto:"Defesa em ação de indenização por responsabilidade civil",total:5000,entrada:1000,caixaEsc:10,rateios:[{advId:"ADV001",perc:60},{advId:"ADV002",perc:30}],parcelas:[
    {n:1,venc:"2026-02-10",valor:1000,status:"paga",dataPag:"2026-02-08",forma:"Pix",banco:"NuBank",conta:"Conta PJ",comp:"txid123"},
    {n:2,venc:"2026-03-10",valor:1000,status:"paga",dataPag:"2026-03-05",forma:"Pix",banco:"NuBank",conta:"Conta PJ",comp:"txid456"},
    {n:3,venc:"2026-04-10",valor:1000,status:"aberta",dataPag:"",forma:"",banco:"",conta:"",comp:""},
    {n:4,venc:"2026-05-10",valor:1000,status:"aberta",dataPag:"",forma:"",banco:"",conta:"",comp:""},
  ]},
  {id:"0423-A",clienteId:"0423",processoId:"0423-A",objeto:"Execução de título extrajudicial",total:12000,entrada:2000,caixaEsc:10,rateios:[{advId:"ADV001",perc:70},{advId:"ADV002",perc:20}],parcelas:[
    {n:1,venc:"2026-01-15",valor:2000,status:"paga",dataPag:"2026-01-14",forma:"Boleto",banco:"Efí",conta:"Conta Cobrança",comp:""},
    {n:2,venc:"2026-02-15",valor:2000,status:"atrasada",dataPag:"",forma:"",banco:"",conta:"",comp:""},
    {n:3,venc:"2026-03-15",valor:2000,status:"aberta",dataPag:"",forma:"",banco:"",conta:"",comp:""},
    {n:4,venc:"2026-04-15",valor:2000,status:"aberta",dataPag:"",forma:"",banco:"",conta:"",comp:""},
    {n:5,venc:"2026-05-15",valor:2000,status:"aberta",dataPag:"",forma:"",banco:"",conta:"",comp:""},
  ]},
];
const initPecas=[
  {id:1,processoId:"0001-A",data:"2025-03-01",tipo:"Petição Inicial",advId:"ADV001",obs:""},
  {id:2,processoId:"0423-A",data:"2025-06-01",tipo:"Emenda à Inicial",advId:"ADV001",obs:""},
  {id:3,processoId:"0001-A",data:"2025-05-10",tipo:"Contestação",advId:"ADV002",obs:""},
];
const initServicosAvulsos=[
  {id:1,clienteId:"0001",descricao:"Consulta jurídica",valor:350,data:"2026-02-20",forma:"Pix",banco:"NuBank",status:"paga",rateios:[{advId:"ADV001",perc:80}],caixaEsc:10},
  {id:2,clienteId:"0423",descricao:"Elaboração de contrato avulso",valor:800,data:"2026-03-01",forma:"Pix",banco:"Efí",status:"aberta",rateios:[{advId:"ADV002",perc:70}],caixaEsc:15},
];

// ============================================================================
// SEÇÃO 10: COMPONENTES PRIMITIVOS DE UI
// ----------------------------------------------------------------------------
// Componentes reutilizáveis que constroem toda a interface do sistema.
// Todos consomem a paleta "C" e não têm lógica de negócio.
//
//  Badge   → tag colorida (status, tipo)
//  Card    → container flutuante com sombra
//  Inp     → campo de texto/número/data com label
//  Sel     → dropdown (select) com label
//  Btn     → botão primário ou ghost (border/subtle = ghost)
//  Grid    → layout em colunas via CSS grid
//
// BACKEND: Nenhuma alteração necessária. Puramente visuais.
// ============================================================================
// ── COMPONENTES BASE ─────────────────────────────────────────────────────────
const statusClr={ativo:C.success,suspenso:C.warning,arquivado:C.muted,encerrado:C.muted};
const parcClr={paga:C.success,aberta:C.accent,atrasada:C.danger,renegociada:C.warning,cancelada:C.muted};
const TIPOS_PECA=["Petição Inicial","Contestação","Réplica","Recurso de Apelação","Agravo de Instrumento","Agravo Interno","Agravo Regimental","Embargos de Declaração","Recurso Especial","Recurso Extraordinário","Mandado de Segurança","Habeas Corpus","Ação Cautelar","Execução de Sentença","Impugnação","Exceção de Incompetência","Memoriais","Razões Finais","Parecer","Outro"];

const Badge=({label,color})=>(<span style={{background:color+"18",color,border:`1px solid ${color}35`,borderRadius:20,padding:"3px 10px",fontSize:10.5,fontWeight:600,letterSpacing:"0.4px",textTransform:"uppercase"}}>{label}</span>);
const Card=({children,style})=>(<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:22,boxShadow:`0 2px 12px ${C.shadow||"rgba(0,0,0,0.10)"}`,position:"relative",overflow:"hidden",...style}}>{children}</div>);
const Inp=({label,value,onChange,type="text",placeholder,style,disabled,suffix})=>(<div style={{display:"flex",flexDirection:"column",gap:5,...style}}>{label&&<label style={{color:C.silver,fontSize:11.5,fontWeight:500,letterSpacing:"0.3px"}}>{label}</label>}<div style={{position:"relative",display:"flex",alignItems:"center"}}><input disabled={disabled} type={type} value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",boxSizing:"border-box",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:`9px ${suffix?"38px":"13px"} 9px 13px`,color:C.text,fontSize:13.5,outline:"none",transition:"border-color .2s, box-shadow .2s",opacity:disabled?0.45:1}}/>{suffix&&<span style={{position:"absolute",right:11,color:C.muted,fontSize:12}}>{suffix}</span>}</div></div>);
const Sel=({label,value,onChange,options,style})=>(<div style={{display:"flex",flexDirection:"column",gap:5,...style}}>{label&&<label style={{color:C.silver,fontSize:11.5,fontWeight:500,letterSpacing:"0.3px"}}>{label}</label>}<select value={value} onChange={e=>onChange(e.target.value)} style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:C.text,fontSize:13.5,outline:"none",cursor:"pointer",appearance:"auto"}}>{options.map(o=><option key={o.value} value={o.value} style={{background:C.card,color:C.text}}>{o.label}</option>)</select></div>);
const Btn=({label,onClick,color,small,style,disabled})=>{const bg=color||C.accent;const isGhost=bg===C.border||bg===C.subtle;return(<button disabled={disabled} onClick={onClick} style={{background:isGhost?C.subtle:bg+"ee",color:isGhost?C.text:"#fff",border:`1px solid ${isGhost?C.border:bg+"88"}`,borderRadius:20,padding:small?"5px 14px":"8px 20px",fontSize:small?12:13.5,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.45:1,letterSpacing:"0.2px",transition:"all .18s ease",boxShadow:isGhost?"none":`0 2px 12px ${bg}30`,...style}}>{label}</button>);};
const Grid=({cols,gap=14,children,style})=>(<div style={{display:"grid",gridTemplateColumns:cols,gap,...style}}>{children}</div>);

// ============================================================================
// SEÇÃO 11: CEP AUTO-PREENCHIMENTO
// ----------------------------------------------------------------------------
// useCepLookup(onFill) — hook que chama a API pública ViaCEP
//   Endpoint: GET https://viacep.com.br/ws/{cep}/json/
//   Preenche: logradouro → endereco, bairro, localidade → cidade, uf
//
// CepInput — componente de input com botão "Buscar"
//   Usado em: formulário de Clientes e formulário de Escritório
//
// BACKEND: Em produção, considere criar um proxy Java para esta chamada:
//   GET /api/cep/{cep} → repassa para ViaCEP e cacheia o resultado.
//   Evita que o browser faça chamadas externas diretas.
// ============================================================================
// ── CEP AUTO-COMPLETE ────────────────────────────────────────────────────────
function useCepLookup(onFill) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const buscar = async (cep) => {
    const c = cep.replace(/\D/g,"");
    if(c.length !== 8) return;
    setLoading(true); setErro("");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${c}/json/`);
      const d = await r.json();
      if(d.erro) { setErro("CEP não encontrado."); }
      else { onFill(d); }
    } catch(e) { setErro("Erro ao buscar CEP."); }
    finally { setLoading(false); }
  };
  return { buscar, loading, erro };
}

function CepInput({ value, onChange, onFill }) {
  const { buscar, loading, erro } = useCepLookup(onFill);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      <label style={{color:C.silver,fontSize:11.5,fontWeight:500,letterSpacing:"0.3px"}}>CEP</label>
      <div style={{display:"flex",gap:8}}>
        <input value={value} onChange={e=>onChange(e.target.value)} placeholder="00000-000"
          style={{flex:1,background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:C.text,fontSize:13.5,outline:"none"}}/>
        <Btn label={loading?"…":"Buscar"} small onClick={()=>buscar(value)} disabled={loading} color={C.accent2}/>
      </div>
      {erro&&<span style={{color:C.danger,fontSize:11}}>{erro}</span>}
    </div>
  );
}

// ============================================================================
// SEÇÃO 12: AUTOCOMPLETE — TRIBUNAL E COMARCA
// ----------------------------------------------------------------------------
// TribunalInput  → filtra a lista TRIBUNAIS conforme o usuário digita
// ComarcaInput   → campo livre com sugestões de SUGESTOES_COMARCAS
//   - Aceita qualquer texto mesmo que não esteja na lista de sugestões
//   - Sugestões aparecem a partir de 2 caracteres digitados
//
// BACKEND: Opcionalmente servir as listas via GET /api/tribunais e /api/comarcas
// ============================================================================
// ── AUTOCOMPLETE TRIBUNAL + COMARCA ─────────────────────────────────────────
function TribunalInput({value,onChange}){
  const[open,setOpen]=useState(false);
  const[q,setQ]=useState(value||"");
  const filtered=TRIBUNAIS.filter(t=>t.toLowerCase().includes(q.toLowerCase())).slice(0,10);
  useEffect(()=>{setQ(value||"");},[value]);
  return(<div style={{position:"relative"}}>
    <label style={{color:C.silver,fontSize:11.5,fontWeight:500,letterSpacing:"0.3px",display:"block",marginBottom:5}}>Tribunal</label>
    <input value={q} onChange={e=>{setQ(e.target.value);setOpen(true);onChange(e.target.value);}} onFocus={()=>setOpen(true)}
      style={{width:"100%",boxSizing:"border-box",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:C.text,fontSize:13.5,outline:"none"}} placeholder="Digite para buscar tribunal..."/>
    {open&&q&&filtered.length>0&&(<div style={{position:"absolute",zIndex:999,background:C.cardHi,border:`1px solid ${C.borderHi}`,borderRadius:12,maxHeight:220,overflowY:"auto",width:"100%",top:"calc(100% + 4px)",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
      {filtered.map(t=>(<div key={t} onMouseDown={()=>{onChange(t);setQ(t);setOpen(false);}} style={{padding:"9px 14px",cursor:"pointer",color:C.text,fontSize:13,borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.target.style.background=C.subtle} onMouseLeave={e=>e.target.style.background=""}>{t}</div>))}
    </div>)}
  </div>);
}

function ComarcaInput({value, onChange}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value||"");
  // Campo livre: sugestões filtradas pela digitação; usuário pode digitar qualquer coisa
  const filtered = q.length >= 2
    ? SUGESTOES_COMARCAS.filter(c=>c.toLowerCase().includes(q.toLowerCase())).slice(0,12)
    : [];
  useEffect(()=>{setQ(value||"");},[value]);
  return(<div style={{position:"relative"}}>
    <label style={{color:C.silver,fontSize:11.5,fontWeight:500,letterSpacing:"0.3px",display:"block",marginBottom:5}}>Comarca / Foro</label>
    <input value={q}
      onChange={e=>{setQ(e.target.value);setOpen(true);onChange(e.target.value);}}
      onFocus={()=>setOpen(true)}
      onBlur={()=>setTimeout(()=>setOpen(false),150)}
      style={{width:"100%",boxSizing:"border-box",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:C.text,fontSize:13.5,outline:"none"}}
      placeholder="Digite a comarca ou foro..."/>
    {open&&filtered.length>0&&(<div style={{position:"absolute",zIndex:999,background:C.cardHi,border:`1px solid ${C.borderHi}`,borderRadius:12,maxHeight:220,overflowY:"auto",width:"100%",top:"calc(100% + 4px)",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
      {filtered.map(c=>(<div key={c} onMouseDown={()=>{onChange(c);setQ(c);setOpen(false);}} style={{padding:"8px 14px",cursor:"pointer",color:C.text,fontSize:13,borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.target.style.background=C.subtle} onMouseLeave={e=>e.target.style.background=""}>{c}</div>))}
    </div>)}
  </div>);
}

// ============================================================================
// SEÇÃO 13: TIMESHEET — FORMATAÇÃO DE HORAS
// ----------------------------------------------------------------------------
// fmtHoras(horas, minutos) → "3h 30min" | "1h" | "45min"
// Converte horas + minutos inteiros para exibição legível.
//
// Timesheet é registrado por andamento de processo (horas + minutos separados).
// O total é calculado somando todos os andamentos filtrados por escopo.
//
// BACKEND: Endpoint sugerido:
//   GET /api/timesheet?advId=ADV001&processoId=0001-A&de=2026-01-01&ate=2026-12-31
//   Response: { totalHoras, totalMinutos, porProcesso: [...], porAdvogado: [...] }
// ============================================================================
// ============================================================================
// SEÇÃO 13B: BUSCA GLOBAL + NOTIFICAÇÕES + LOG DE AUDITORIA
// ============================================================================

// ── BUSCA GLOBAL ─────────────────────────────────────────────────────────────
function BuscaGlobal({clientes,processos,andamentos,pecas,onNavegar,onClose}){
  const[q,setQ]=useState("");
  const ref=React.useRef(null);
  useEffect(()=>{ref.current&&ref.current.focus();},[]);
  const ql=q.toLowerCase().trim();
  const res=ql.length<2?[]:[];
  if(ql.length>=2){
    clientes.forEach(c=>{if(c.nome.toLowerCase().includes(ql)||c.id.includes(ql)||(c.cpfCnpj||"").includes(ql))res.push({tipo:"Cliente",icon:"👥",label:c.nome,sub:c.id,modulo:"clientes"});});
    processos.forEach(p=>{if(p.id.toLowerCase().includes(ql)||p.classe?.toLowerCase().includes(ql)||(p.numeroOficial||"").includes(ql))res.push({tipo:"Processo",icon:"⚖️",label:p.id+" — "+p.classe,sub:p.tribunal||"",modulo:"processos"});});
    andamentos.forEach(a=>{if(a.descricao?.toLowerCase().includes(ql))res.push({tipo:"Andamento",icon:"📝",label:a.descricao.slice(0,60),sub:a.processoId+" • "+fmt(a.data),modulo:"processos"});});
    pecas.forEach(p=>{if(p.tipo.toLowerCase().includes(ql)||(p.obs||"").toLowerCase().includes(ql))res.push({tipo:"Peça",icon:"📋",label:p.tipo,sub:p.processoId+" • "+fmt(p.data),modulo:"processos"});});
  }
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:80}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="fadeUp" style={{background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:20,width:"100%",maxWidth:620,boxShadow:"0 20px 60px rgba(0,0,0,0.6)",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontSize:18}}>🔍</span>
          <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar clientes, processos, andamentos, peças..." style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:15}} onKeyDown={e=>e.key==="Escape"&&onClose()}/>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:18}}>✕</button>
        </div>
        {ql.length>=2&&(
          <div style={{maxHeight:400,overflowY:"auto"}}>
            {res.length===0&&<div style={{padding:"28px 20px",color:C.muted,textAlign:"center",fontSize:13}}>Nenhum resultado para "{q}"</div>}
            {res.slice(0,15).map((r,i)=>(
              <div key={i} onClick={()=>{onNavegar(r.modulo);onClose();}} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 20px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=C.subtle} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <span style={{fontSize:20}}>{r.icon}</span>
                <div style={{flex:1}}>
                  <div style={{color:C.text,fontSize:13,fontWeight:500}}>{r.label}</div>
                  <div style={{color:C.muted,fontSize:11,marginTop:2}}>{r.sub}</div>
                </div>
                <span style={{background:C.accent+"18",color:C.accent,border:`1px solid ${C.accent}30`,borderRadius:12,padding:"2px 9px",fontSize:10,fontWeight:600}}>{r.tipo}</span>
              </div>
            ))}
            {res.length>15&&<div style={{padding:"10px 20px",color:C.muted,fontSize:12,textAlign:"center"}}>+{res.length-15} resultados — refine a busca</div>}
          </div>
        )}
        {ql.length<2&&<div style={{padding:"24px 20px",color:C.muted,fontSize:13,textAlign:"center"}}>Digite ao menos 2 caracteres para buscar</div>}
      </div>
    </div>
  );
}

// ── PAINEL DE NOTIFICAÇÕES ────────────────────────────────────────────────────
function PainelNotificacoes({notifs,onMarcarLida,onMarcarTodas,onClose}){
  const naoLidas=notifs.filter(n=>!n.lida).length;
  return(
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:380,background:C.card,borderLeft:`1px solid ${C.border}`,zIndex:9998,display:"flex",flexDirection:"column",boxShadow:"-8px 0 40px rgba(0,0,0,0.4)"}} className="fadeUp">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 20px 16px",borderBottom:`1px solid ${C.border}`}}>
        <div>
          <div style={{color:C.text,fontWeight:700,fontSize:16}}>🔔 Notificações</div>
          {naoLidas>0&&<div style={{color:C.muted,fontSize:12,marginTop:2}}>{naoLidas} não lida{naoLidas>1?"s":""}</div>}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {naoLidas>0&&<button onClick={onMarcarTodas} style={{background:"none",border:"none",color:C.accent,cursor:"pointer",fontSize:11,fontWeight:600}}>Marcar todas</button>}
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,lineHeight:1}}>✕</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {notifs.length===0&&<div style={{padding:40,textAlign:"center",color:C.muted,fontSize:13}}>Nenhuma notificação</div>}
        {notifs.map(n=>(
          <div key={n.id} onClick={()=>onMarcarLida(n.id)} style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:n.lida?"transparent":C.accent+"08",transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=C.subtle} onMouseLeave={e=>e.currentTarget.style.background=n.lida?"transparent":C.accent+"08"}>
            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
              <span style={{fontSize:18,flexShrink:0}}>{n.icon}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{color:n.lida?C.muted:C.text,fontSize:13,fontWeight:n.lida?400:600,lineHeight:1.4}}>{n.titulo}</div>
                  {!n.lida&&<div style={{width:8,height:8,borderRadius:"50%",background:C.accent,flexShrink:0,marginTop:4}}/>}
                </div>
                <div style={{color:C.muted,fontSize:11,marginTop:4}}>{n.msg}</div>
                <div style={{color:C.muted,fontSize:10,marginTop:4}}>{n.data}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LOG DE AUDITORIA ──────────────────────────────────────────────────────────
let _auditLog=[];
function registrarAuditoria(usuario,acao,modulo,detalhe=""){
  _auditLog.unshift({id:Date.now(),ts:new Date().toLocaleString("pt-BR"),usuario,acao,modulo,detalhe});
  if(_auditLog.length>200)_auditLog=_auditLog.slice(0,200);
}
function LogAuditoria({usuario,onClose}){
  const[filtro,setFiltro]=useState("");
  const[modFiltro,setModFiltro]=useState("todos");
  const logs=_auditLog.filter(l=>{
    const ok=filtro?l.acao.toLowerCase().includes(filtro.toLowerCase())||l.detalhe.toLowerCase().includes(filtro.toLowerCase()):true;
    const om=modFiltro==="todos"?true:l.modulo===modFiltro;
    return ok&&om;
  });
  const modulos=[...new Set(_auditLog.map(l=>l.modulo))];
  const acoesClr={criou:C.success,editou:C.accent,excluiu:C.danger,acessou:C.muted,exportou:C.warning};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="fadeUp" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,width:"100%",maxWidth:860,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 24px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{color:C.text,fontWeight:700,fontSize:17}}>📋 Log de Auditoria</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        <div style={{display:"flex",gap:12,padding:"14px 24px",borderBottom:`1px solid ${C.border}`}}>
          <input value={filtro} onChange={e=>setFiltro(e.target.value)} placeholder="Filtrar por ação ou detalhe..." style={{flex:1,background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 12px",color:C.text,fontSize:13,outline:"none"}}/>
          <select value={modFiltro} onChange={e=>setModFiltro(e.target.value)} style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 12px",color:C.text,fontSize:13,outline:"none"}}>
            <option value="todos">Todos módulos</option>
            {modulos.map(m=><option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {logs.length===0&&<div style={{padding:40,textAlign:"center",color:C.muted,fontSize:13}}>Nenhum registro encontrado</div>}
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:C.tableHead}}>
              {["Data/Hora","Usuário","Módulo","Ação","Detalhe"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",color:C.muted,fontSize:11,fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {logs.map(l=>(
                <tr key={l.id} style={{borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background=C.subtle} onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <td style={{padding:"10px 16px",color:C.muted,fontSize:12,whiteSpace:"nowrap"}}>{l.ts}</td>
                  <td style={{padding:"10px 16px",color:C.text,fontSize:12}}>{l.usuario}</td>
                  <td style={{padding:"10px 16px"}}><Badge label={l.modulo} color={C.accent2}/></td>
                  <td style={{padding:"10px 16px"}}><Badge label={l.acao} color={acoesClr[l.acao]||C.muted}/></td>
                  <td style={{padding:"10px 16px",color:C.muted,fontSize:12}}>{l.detalhe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"12px 24px",borderTop:`1px solid ${C.border}`,color:C.muted,fontSize:11}}>{_auditLog.length} registro(s) — máximo 200 registros em memória</div>
      </div>
    </div>
  );
}

// ── CALCULADORA DE HONORÁRIOS ─────────────────────────────────────────────────
const FASES_OAB=[
  {fase:"Conhecimento (1º grau)",min:10,max:20,desc:"Art. 85 CPC"},
  {fase:"Recursal (2º grau)",min:10,max:20,desc:"Art. 85 §11 CPC"},
  {fase:"Execução",min:10,max:20,desc:"Sobre o proveito"},
  {fase:"Cautelar/Tutela",min:10,max:20,desc:"Percentual estimado"},
  {fase:"Consultoria/Preventivo",min:0,max:0,desc:"Valor fixo — tabela OAB"},
];
function CalcHonorarios({onClose}){
  const[valor,setValor]=useState("");
  const[fase,setFase]=useState(0);
  const[perc,setPerc]=useState(10);
  const f=FASES_OAB[fase];
  const vn=parseFloat((valor||"0").replace(/\./g,"").replace(",","."))||0;
  const honorario=vn*(perc/100);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="fadeUp" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,width:"100%",maxWidth:480,padding:28,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{color:C.text,fontWeight:700,fontSize:17}}>⚖️ Calculadora de Honorários</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label style={{color:C.silver,fontSize:11.5,fontWeight:500,display:"block",marginBottom:5}}>Fase Processual</label>
            <select value={fase} onChange={e=>setFase(Number(e.target.value))} style={{width:"100%",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:C.text,fontSize:13,outline:"none"}}>
              {FASES_OAB.map((f,i)=><option key={i} value={i}>{f.fase}</option>)}
            </select>
            <div style={{color:C.muted,fontSize:11,marginTop:4}}>{f.desc} — faixa: {f.min}% a {f.max||"—"}%</div>
          </div>
          <Inp label="Valor da Causa (R$)" value={valor} onChange={setValor} placeholder="0,00"/>
          <div>
            <label style={{color:C.silver,fontSize:11.5,fontWeight:500,display:"block",marginBottom:5}}>Percentual dos Honorários: <span style={{color:C.accent,fontWeight:700}}>{perc}%</span></label>
            <input type="range" min={f.min||5} max={f.max||30} step={0.5} value={perc} onChange={e=>setPerc(Number(e.target.value))} style={{width:"100%",accentColor:C.accent}}/>
            <div style={{display:"flex",justifyContent:"space-between",color:C.muted,fontSize:11}}><span>Mín: {f.min||5}%</span><span>Máx: {f.max||30}%</span></div>
          </div>
          <div style={{background:C.accent+"12",border:`1px solid ${C.accent}30`,borderRadius:14,padding:20,textAlign:"center"}}>
            <div style={{color:C.muted,fontSize:12,marginBottom:4}}>Honorários estimados</div>
            <div style={{color:C.accent,fontSize:30,fontWeight:700}}>R$ {honorario.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
            <div style={{color:C.muted,fontSize:11,marginTop:6}}>{perc}% sobre R$ {vn.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
          </div>
          <div style={{color:C.muted,fontSize:10,textAlign:"center",fontStyle:"italic"}}>Estimativa baseada na tabela OAB. Consulte sempre a tabela oficial do estado.</div>
        </div>
      </div>
    </div>
  );
}

// ── MAPA DE RISCOS ────────────────────────────────────────────────────────────
function MapaRiscos({processos,clientes,onClose}){
  const procsComRisco=processos.filter(p=>p.probExito!=null);
  const getCliente=(id)=>clientes.find(c=>c.id===id);
  const getRiscoClr=(p)=>p>=70?C.success:p>=40?C.warning:C.danger;
  const getRiscoLabel=(p)=>p>=70?"Alto":p>=40?"Médio":"Baixo";
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="fadeUp" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,width:"100%",maxWidth:860,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{color:C.text,fontWeight:700,fontSize:17}}>🎯 Mapa de Riscos dos Processos</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          {procsComRisco.length===0&&<div style={{textAlign:"center",color:C.muted,padding:40,fontSize:13}}>Nenhum processo com probabilidade de êxito cadastrada.<br/><span style={{fontSize:11}}>Edite um processo e preencha o campo "Prob. de Êxito" para aparecer aqui.</span></div>}
          {/* Scatter visual */}
          {procsComRisco.length>0&&(
            <div>
              <div style={{marginBottom:16,color:C.muted,fontSize:12}}>Exibindo {procsComRisco.length} processo(s) com análise de risco cadastrada.</div>
              {/* Quadrante visual */}
              <div style={{position:"relative",width:"100%",height:280,background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,marginBottom:20,overflow:"hidden"}}>
                <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,background:C.border}}/>
                <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:C.border}}/>
                <div style={{position:"absolute",top:8,left:8,color:C.muted,fontSize:10}}>Alto Impacto / Baixa Chance</div>
                <div style={{position:"absolute",top:8,right:8,color:C.muted,fontSize:10,textAlign:"right"}}>Alto Impacto / Alta Chance</div>
                <div style={{position:"absolute",bottom:8,left:8,color:C.muted,fontSize:10}}>Baixo Impacto / Baixa Chance</div>
                <div style={{position:"absolute",bottom:8,right:8,color:C.muted,fontSize:10,textAlign:"right"}}>Baixo Impacto / Alta Chance</div>
                {procsComRisco.map(p=>{
                  const x=(p.probExito||0)/100*(100-8)+4;
                  const valMax=Math.max(...procsComRisco.map(pp=>pp.valorCausa||0),1);
                  const y=100-((p.valorCausa||0)/valMax*(100-8)+4);
                  const cor=getRiscoClr(p.probExito||0);
                  return(<div key={p.id} title={`${p.id} — ${p.probExito}% • R$ ${(p.valorCausa||0).toLocaleString("pt-BR")}`} style={{position:"absolute",left:`${x}%`,top:`${y}%`,width:12,height:12,borderRadius:"50%",background:cor,border:`2px solid ${cor}88`,transform:"translate(-50%,-50%)",cursor:"pointer",boxShadow:`0 0 8px ${cor}66`}}/>);
                })}
              </div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:C.tableHead}}>
                  {["Processo","Cliente","Prob. Êxito","Valor da Causa","Impacto Financeiro","Risco"].map(h=><th key={h} style={{padding:"9px 14px",textAlign:"left",color:C.muted,fontSize:11,fontWeight:600,letterSpacing:"0.4px",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {[...procsComRisco].sort((a,b)=>(b.probExito||0)-(a.probExito||0)).map(p=>{
                    const cli=getCliente(p.clienteId);
                    const impacto=(p.valorCausa||0)*(p.probExito||0)/100;
                    const clr=getRiscoClr(p.probExito||0);
                    return(<tr key={p.id} style={{borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background=C.subtle} onMouseLeave={e=>e.currentTarget.style.background=""}>
                      <td style={{padding:"10px 14px",color:C.text,fontSize:13,fontWeight:600}}>{p.id}</td>
                      <td style={{padding:"10px 14px",color:C.muted,fontSize:12}}>{cli?.nome||"—"}</td>
                      <td style={{padding:"10px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{flex:1,height:6,background:C.barTrack,borderRadius:3,minWidth:60}}><div style={{height:"100%",width:`${p.probExito||0}%`,background:clr,borderRadius:3}}/></div>
                          <span style={{color:clr,fontWeight:700,fontSize:13}}>{p.probExito||0}%</span>
                        </div>
                      </td>
                      <td style={{padding:"10px 14px",color:C.text,fontSize:12}}>R$ {(p.valorCausa||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
                      <td style={{padding:"10px 14px",color:C.accent,fontWeight:600,fontSize:12}}>R$ {impacto.toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
                      <td style={{padding:"10px 14px"}}><Badge label={getRiscoLabel(p.probExito||0)} color={clr}/></td>
                    </tr>);
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TIMESHEET DISPLAY ────────────────────────────────────────────────────────
function fmtHoras(h,m){
  const total=(h||0)*60+(m||0);
  const hh=Math.floor(total/60);const mm=total%60;
  return `${hh}h${mm>0?` ${mm}min`:""}`;
}

// ============================================================================
// SEÇÃO 14: DASHBOARD — PAINEL PRINCIPAL
// ----------------------------------------------------------------------------
// Exibe KPIs calculados a partir dos dados em memória (futuramente via API).
//
// KPIs EXIBIDOS:
//   - Total de clientes ativos
//   - Processos ativos
//   - Valor recebido / inadimplência
//   - Peças elaboradas
//   - Total de horas (timesheet geral)
//   - Pedidos deferidos vs. indeferidos
//   - Sentenças favoráveis vs. desfavoráveis
//   - Acórdãos providos vs. improvidos
//   - Agravos providos vs. improvidos
//   - Próximos 5 eventos da agenda
//   - Top 5 processos por horas trabalhadas
//
// ALERTA DE URGÊNCIA: exibe banner se houver prazo ou audiência nos próximos 3 dias
//
// BACKEND: Criar endpoint dedicado para o dashboard para evitar múltiplas chamadas:
//   GET /api/dashboard → retorna todos os KPIs em uma única resposta
// ============================================================================
// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({clientes,processos,agenda,contratos,andamentos,pecas,advs,servicosAvulsos}){
  const hoje=today();
  const em3=new Date();em3.setDate(em3.getDate()+3);const em3s=em3.toISOString().split("T")[0];
  const proximos=agenda.filter(e=>e.data>=hoje).sort((a,b)=>a.data.localeCompare(b.data)).slice(0,5);
  const urgentes=agenda.filter(e=>e.data>=hoje&&e.data<=em3s&&(e.tipo==="prazo"||e.tipo==="audiencia"));
  let totalRec=0,totalAtr=0,totalRcb=0;
  contratos.forEach(c=>c.parcelas.forEach(p=>{if(p.status==="aberta")totalRec+=p.valor;if(p.status==="atrasada"||(p.venc<hoje&&p.status==="aberta"))totalAtr+=p.valor;if(p.status==="paga")totalRcb+=p.valor;}));
  const totalHorasMin=andamentos.reduce((s,a)=>s+(a.horas||0)*60+(a.minutos||0),0);
  const totalHoras=Math.floor(totalHorasMin/60);const totalMin=totalHorasMin%60;
  const totalDef=processos.reduce((s,p)=>s+(p.pedidosDeferidos||0),0);
  const totalInd=processos.reduce((s,p)=>s+(p.pedidosIndeferidos||0),0);
  const totalSentFav=processos.reduce((s,p)=>s+(p.sentencas||[]).filter(x=>x.tipo==="favoravel").length,0);
  const totalSentDesf=processos.reduce((s,p)=>s+(p.sentencas||[]).filter(x=>x.tipo==="desfavoravel").length,0);
  const totalAcFav=processos.reduce((s,p)=>s+(p.acordaos||[]).filter(x=>x.tipo==="provido").length,0);
  const totalAcDesf=processos.reduce((s,p)=>s+(p.acordaos||[]).filter(x=>x.tipo==="improvido").length,0);
  const totalAgrProv=processos.reduce((s,p)=>s+(p.agravos||[]).filter(x=>x.tipo==="provido").length,0);
  const totalAgrImp=processos.reduce((s,p)=>s+(p.agravos||[]).filter(x=>x.tipo==="improvido").length,0);

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h2 style={{color:C.text,margin:0,fontFamily:"'DM Serif Display',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>Dashboard</h2>
      {urgentes.length>0&&<div style={{background:C.danger+"18",border:`1px solid ${C.danger}40`,borderRadius:14,padding:"9px 18px",color:C.danger,fontSize:13,fontWeight:600,boxShadow:`0 2px 12px ${C.danger}25`}}>🔔 {urgentes.length} prazo(s)/audiência(s) nos próximos 3 dias!</div>}
    </div>
    <Grid cols="repeat(4,1fr)" gap={14} style={{marginBottom:16}}>
      {[[clientes.length,"Clientes",C.accent],[processos.filter(p=>p.status==="ativo").length,"Processos Ativos",C.success],[`R$ ${totalRcb.toLocaleString("pt-BR")}`,`Recebido`,C.success],[`R$ ${totalAtr.toLocaleString("pt-BR")}`,`Inadimplência`,C.danger]].map(([v,l,cor])=>(
        <Card key={l} style={{textAlign:"center",padding:18,border:`1px solid ${cor}22`,boxShadow:`0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${cor}11 inset`}}><div style={{color:cor,fontSize:28,fontWeight:700,letterSpacing:"-0.5px",lineHeight:1.1}}>{v}</div><div style={{color:C.muted,fontSize:11.5,marginTop:6,letterSpacing:"0.3px",textTransform:"uppercase"}}>{l}</div></Card>
      ))}
    </Grid>
    <Grid cols="repeat(4,1fr)" gap={14} style={{marginBottom:16}}>
      {[[pecas.length,"Peças Elaboradas",C.accent2],[`${totalHoras}h${totalMin>0?` ${totalMin}min`:""}`,`Horas (Timesheet)`,C.accent],[`${totalDef}✓ / ${totalInd}✗`,"Pedidos Def./Ind.",C.warning],[`R$ ${totalRec.toLocaleString("pt-BR")}`,"A Receber",C.accent]].map(([v,l,cor])=>(
        <Card key={l} style={{textAlign:"center",padding:16}}><div style={{color:cor,fontSize:22,fontWeight:700}}>{v}</div><div style={{color:C.muted,fontSize:12,marginTop:4}}>{l}</div></Card>
      ))}
    </Grid>
    <Grid cols="repeat(3,1fr)" gap={14} style={{marginBottom:20}}>
      <Card style={{padding:16}}><div style={{color:C.text,fontWeight:600,marginBottom:10,fontSize:13}}>⚖️ Sentenças</div><div style={{display:"flex",gap:16}}><div style={{textAlign:"center"}}><div style={{color:C.success,fontSize:22,fontWeight:700}}>{totalSentFav}</div><div style={{color:C.muted,fontSize:11}}>Favoráveis</div></div><div style={{textAlign:"center"}}><div style={{color:C.danger,fontSize:22,fontWeight:700}}>{totalSentDesf}</div><div style={{color:C.muted,fontSize:11}}>Desfavoráveis</div></div></div></Card>
      <Card style={{padding:16}}><div style={{color:C.text,fontWeight:600,marginBottom:10,fontSize:13}}>📋 Acórdãos</div><div style={{display:"flex",gap:16}}><div style={{textAlign:"center"}}><div style={{color:C.success,fontSize:22,fontWeight:700}}>{totalAcFav}</div><div style={{color:C.muted,fontSize:11}}>Providos</div></div><div style={{textAlign:"center"}}><div style={{color:C.danger,fontSize:22,fontWeight:700}}>{totalAcDesf}</div><div style={{color:C.muted,fontSize:11}}>Improvidos</div></div></div></Card>
      <Card style={{padding:16}}><div style={{color:C.text,fontWeight:600,marginBottom:10,fontSize:13}}>📎 Agravos</div><div style={{display:"flex",gap:16}}><div style={{textAlign:"center"}}><div style={{color:C.success,fontSize:22,fontWeight:700}}>{totalAgrProv}</div><div style={{color:C.muted,fontSize:11}}>Providos</div></div><div style={{textAlign:"center"}}><div style={{color:C.danger,fontSize:22,fontWeight:700}}>{totalAgrImp}</div><div style={{color:C.muted,fontSize:11}}>Improvidos</div></div></div></Card>
    </Grid>
    <Grid cols="1fr 1fr" gap={16}>
      <Card>
        <div style={{color:C.text,fontWeight:600,marginBottom:12}}>📅 Próximos Eventos</div>
        {proximos.map(e=>{const adv=advs.find(a=>a.id===e.responsavel);return(
          <div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
            <div><div style={{color:C.text,fontSize:13}}>{e.titulo}</div><div style={{color:C.muted,fontSize:11}}>{e.hora} {adv?`• ${adv.nome}`:""}</div></div>
            <div style={{color:e.data<=hoje?C.danger:C.accent,fontSize:13,fontWeight:600,textAlign:"right"}}>{fmtComDia(e.data)}</div>
          </div>);})}
      </Card>
      <Card>
        <div style={{color:C.text,fontWeight:600,marginBottom:12}}>⏱ Timesheet — Top 5 Processos</div>
        {[...processos].sort((a,b)=>{const ma=(a.horasTrabalhadas||0)*60+(a.minTrabalhados||0);const mb=(b.horasTrabalhadas||0)*60+(b.minTrabalhados||0);return mb-ma;}).slice(0,5).map(p=>{
          const mins=andamentos.filter(a=>a.processoId===p.id).reduce((s,a)=>s+(a.horas||0)*60+(a.minutos||0),0);
          return(<div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
            <div style={{color:C.text,fontSize:13}}>{p.id} <span style={{color:C.muted,fontSize:11}}>{p.classe?.slice(0,28)}</span></div>
            <div style={{color:C.accent,fontWeight:700}}>{fmtHoras(Math.floor(mins/60),mins%60)}</div>
          </div>);
        })}
      </Card>
    </Grid>
  </div>);
}

// ============================================================================
// SEÇÃO 15: MÓDULO DE CLIENTES
// ----------------------------------------------------------------------------
// Cadastro completo de clientes Pessoa Física (PF) e Pessoa Jurídica (PJ).
//
// REGRAS DE NEGÓCIO:
//   - PJ OBRIGATORIAMENTE deve ter ao menos 1 representante legal (admin)
//   - Se PJ sem representante, bloqueia o salvar e exibe badge ⚠️ na listagem
//   - CEP auto-preenche logradouro, bairro, cidade e UF via ViaCEP
//   - Busca por: nome, código interno ou CPF/CNPJ
//
// CAMPOS DO REPRESENTANTE LEGAL (PJ):
//   nome, cpf, cargo (ex: "Diretor Executivo", "Sócio Administrador")
//
// BACKEND — ENDPOINTS SUGERIDOS:
//   GET    /api/clientes              → lista com filtro ?busca=
//   GET    /api/clientes/{id}         → detalhe
//   POST   /api/clientes              → criar
//   PUT    /api/clientes/{id}         → editar
//   DELETE /api/clientes/{id}         → excluir (soft delete recomendado)
//
// VALIDAÇÕES A REPLICAR NO BACKEND:
//   - Nome obrigatório
//   - PJ sem representante legal → 400 Bad Request
//   - CPF/CNPJ único por escritório
// ============================================================================
// ── CLIENTES ─────────────────────────────────────────────────────────────────
function Clientes({clientes,setClientes,andamentos}){
  const[busca,setBusca]=useState("");
  const[form,setForm]=useState(null);
  const[view,setView]=useState(null);
  const[ordem,setOrdem]=useState("codigo");
  const newAdmin=()=>({nome:"",cpf:"",cargo:""});

  function novoForm(){const nextId=String(Math.max(...clientes.map(c=>parseInt(c.id)||0),0)+1).padStart(4,"0");setForm({id:nextId,tipoPessoa:"PF",nome:"",cpf:"",rg:"",estadoCivil:"",profissao:"",cep:"",endereco:"",bairro:"",cidade:"",uf:"",telefone:"",email:"",obs:"",admins:[],_novo:true,updatedAt:today()});}

  function salvar(){
    if(!form.nome)return alert("Nome obrigatório.");
    if(form.tipoPessoa==="PJ"&&(!form.admins||form.admins.length===0))return alert("Pessoa Jurídica requer ao menos 1 representante legal cadastrado.");
    const now=today();
    if(form._novo)setClientes(p=>[...p,{...form,_novo:undefined,updatedAt:now}]);
    else setClientes(p=>p.map(c=>c.id===form.id?{...form,_novo:undefined,updatedAt:now}:c));
    setForm(null);
  }
  function addAdmin(){setForm(f=>({...f,admins:[...f.admins,newAdmin()]}));}
  function setAdmin(i,k,v){setForm(f=>({...f,admins:f.admins.map((a,j)=>j===i?{...a,[k]:v}:a)}));}
  function remAdmin(i){setForm(f=>({...f,admins:f.admins.filter((_,j)=>j!==i)}));}

  const handleCepFill = (data) => {
    setForm(f=>({...f,
      bairro: data.bairro||"",
      cidade: data.localidade||"",
      uf: data.uf||"",
      endereco: `${data.logradouro||""}${data.complemento?", "+data.complemento:""}`,
    }));
  };

  // última atualização de andamento por cliente
  function ultimoAnd(clienteId){
    const procs=andamentos?andamentos.filter(a=>a.processoId?.startsWith(clienteId)):[];
    return procs.length?procs.sort((a,b)=>b.data.localeCompare(a.data))[0].data:"";
  }

  const base=clientes.filter(c=>c.nome.toLowerCase().includes(busca.toLowerCase())||c.id.includes(busca)||(c.cpf||"").includes(busca));
  const lista=[...base].sort((a,b)=>{
    if(ordem==="alfa")return a.nome.localeCompare(b.nome,"pt-BR");
    if(ordem==="atualizacao"){
      const da=ultimoAnd(a.id)||a.updatedAt||a.id;
      const db=ultimoAnd(b.id)||b.updatedAt||b.id;
      return db.localeCompare(da);
    }
    return a.id.localeCompare(b.id);
  });

  if(form)return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
      <Btn label="← Voltar" onClick={()=>setForm(null)} color={C.border}/>
      <h2 style={{color:C.text,margin:0,fontFamily:"\'DM Serif Display\',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>{form._novo?"Novo Cliente":"Editar Cliente"}</h2>
    </div>
    <Card>
      <Grid cols="1fr 1fr 1fr" gap={14}>
        <Inp label="Código Interno" value={form.id} onChange={v=>setForm(f=>({...f,id:v}))}/>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          <label style={{color:C.muted,fontSize:12}}>Tipo de Pessoa</label>
          <div style={{display:"flex",gap:10,marginTop:2}}>
            {["PF","PJ"].map(t=>(<button key={t} onClick={()=>setForm(f=>({...f,tipoPessoa:t,admins:[]}))} style={{flex:1,padding:"8px 0",borderRadius:10,border:`1px solid ${form.tipoPessoa===t?C.accent:C.border}`,background:form.tipoPessoa===t?C.accent+"18":"transparent",color:form.tipoPessoa===t?C.accent:C.muted,cursor:"pointer",fontWeight:form.tipoPessoa===t?700:400}}>{t==="PF"?"Pessoa Física":"Pessoa Jurídica"}</button>))}
          </div>
        </div>
        <Inp label={form.tipoPessoa==="PF"?"Nome Completo":"Razão Social"} value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))}/>
        <Inp label={form.tipoPessoa==="PF"?"CPF":"CNPJ"} value={form.cpf} onChange={v=>setForm(f=>({...f,cpf:v}))}/>
        {form.tipoPessoa==="PF"&&<Inp label="RG" value={form.rg} onChange={v=>setForm(f=>({...f,rg:v}))}/>}
        {form.tipoPessoa==="PF"&&<Inp label="Estado Civil" value={form.estadoCivil} onChange={v=>setForm(f=>({...f,estadoCivil:v}))}/>}
        {form.tipoPessoa==="PF"&&<Inp label="Profissão" value={form.profissao} onChange={v=>setForm(f=>({...f,profissao:v}))} style={{gridColumn:"span 2"}}/>}
        <Inp label="Telefone" value={form.telefone} onChange={v=>setForm(f=>({...f,telefone:v}))}/>
        <Inp label="E-mail" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} style={{gridColumn:"span 2"}}/>
        {/* CEP + Endereço automático */}
        <div style={{gridColumn:"span 3"}}>
          <div style={{color:C.silver,fontWeight:600,marginBottom:12,fontSize:13,letterSpacing:"0.2px",borderTop:`1px solid ${C.border}`,paddingTop:14}}>📍 Endereço</div>
          <Grid cols="1fr 1fr 1fr" gap={14}>
            <CepInput value={form.cep||""} onChange={v=>setForm(f=>({...f,cep:v}))} onFill={handleCepFill}/>
            <Inp label="Logradouro" value={form.endereco||""} onChange={v=>setForm(f=>({...f,endereco:v}))} style={{gridColumn:"span 2"}}/>
            <Inp label="Número" value={form.numero||""} onChange={v=>setForm(f=>({...f,numero:v}))}/>
            <Inp label="Bairro" value={form.bairro||""} onChange={v=>setForm(f=>({...f,bairro:v}))}/>
            <Inp label="Complemento" value={form.complemento||""} onChange={v=>setForm(f=>({...f,complemento:v}))}/>
            <Inp label="Cidade" value={form.cidade||""} onChange={v=>setForm(f=>({...f,cidade:v}))}/>
            <Inp label="UF" value={form.uf||""} onChange={v=>setForm(f=>({...f,uf:v}))}/>
          </Grid>
        </div>
        <Inp label="Observações" value={form.obs} onChange={v=>setForm(f=>({...f,obs:v}))} style={{gridColumn:"span 3"}}/>
      </Grid>
      {form.tipoPessoa==="PJ"&&(<div style={{marginTop:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{color:C.text,fontWeight:600}}>Representantes Legais <span style={{color:C.danger,fontSize:12}}>* obrigatório ao menos 1</span></div>
          <Btn label="+ Adicionar" onClick={addAdmin} small color={C.accent2}/>
        </div>
        {form.admins.length===0&&<div style={{color:C.danger,fontSize:13,padding:"10px 14px",background:C.danger+"10",borderRadius:12,border:`1px solid ${C.danger}30`}}>⚠️ Nenhum representante legal cadastrado. Ao menos 1 é obrigatório para Pessoa Jurídica.</div>}
        {form.admins.map((a,i)=>(<Card key={i} style={{marginBottom:10,padding:14}}>
          <Grid cols="1fr 1fr 1fr auto" gap={12}>
            <Inp label="Nome" value={a.nome} onChange={v=>setAdmin(i,"nome",v)}/>
            <Inp label="CPF" value={a.cpf} onChange={v=>setAdmin(i,"cpf",v)}/>
            <Inp label="Cargo" value={a.cargo} onChange={v=>setAdmin(i,"cargo",v)}/>
            <div style={{display:"flex",alignItems:"flex-end"}}><Btn label="✕" onClick={()=>remAdmin(i)} small color={C.danger}/></div>
          </Grid>
        </Card>))}
      </div>)}
      <div style={{marginTop:20,display:"flex",gap:10}}><Btn label="Salvar" onClick={salvar}/><Btn label="Cancelar" onClick={()=>setForm(null)} color={C.border}/></div>
    </Card>
  </div>);

  if(view){const c=clientes.find(x=>x.id===view);return(<div>
    <div style={{display:"flex",gap:10,marginBottom:20}}><Btn label="← Voltar" onClick={()=>setView(null)} color={C.border}/><Btn label="Editar" onClick={()=>{setForm({...c,admins:c.admins||[]});setView(null);}} color={C.accent2}/></div>
    <Card>
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16}}>
        <span style={{background:C.accent+"18",color:C.accent2,borderRadius:12,padding:"4px 12px",fontWeight:600,fontSize:12,letterSpacing:"0.5px"}}>{c.id}</span>
        <Badge label={c.tipoPessoa==="PF"?"Pessoa Física":"Pessoa Jurídica"} color={c.tipoPessoa==="PF"?C.accent:C.accent2}/>
      </div>
      <h3 style={{color:C.text,margin:"0 0 16px"}}>{c.nome}</h3>
      <Grid cols="1fr 1fr" gap={10}>
        {[["CPF/CNPJ",c.cpf],["RG",c.rg],["Estado Civil",c.estadoCivil],["Profissão",c.profissao],["Telefone",c.telefone],["E-mail",c.email],["CEP",c.cep],[`Endereço`,`${c.endereco||""}${c.numero?", "+c.numero:""}${c.bairro?", "+c.bairro:""}${c.cidade?", "+c.cidade:""}${c.uf?" – "+c.uf:""}`],["Obs",c.obs]].map(([l,v])=>v&&(<div key={l}><div style={{color:C.muted,fontSize:11}}>{l}</div><div style={{color:C.text,fontSize:13}}>{v}</div></div>))}
      </Grid>
      {(c.admins||[]).length>0&&(<div style={{marginTop:16}}>
        <div style={{color:C.text,fontWeight:600,marginBottom:10}}>Representantes Legais</div>
        {c.admins.map((a,i)=>(<div key={i} style={{padding:"8px 12px",background:C.surface,borderRadius:10,marginBottom:8}}>
          <span style={{color:C.text,fontWeight:600}}>{a.nome}</span> <span style={{color:C.muted,fontSize:12}}>CPF: {a.cpf}</span> <Badge label={a.cargo} color={C.accent2}/>
        </div>))}
      </div>)}
    </Card>
  </div>);}

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <h2 style={{color:C.text,margin:0,fontFamily:"'DM Serif Display',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>Clientes</h2>
      <Btn label="+ Novo Cliente" onClick={novoForm}/>
    </div>
    <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
      <Inp placeholder="Buscar por nome, código ou CPF/CNPJ..." value={busca} onChange={setBusca} style={{flex:1,minWidth:200,marginBottom:0}}/>
      <div style={{display:"flex",gap:2,background:C.cardHi,borderRadius:20,padding:3,border:`1px solid ${C.border}`,flexShrink:0}}>
        {[["codigo","# Código"],["alfa","A–Z Nome"],["atualizacao","↺ Atualização"]].map(([v,l])=>(
          <button key={v} onClick={()=>setOrdem(v)} style={{padding:"5px 12px",borderRadius:16,background:ordem===v?C.accent:"transparent",color:ordem===v?"#fff":C.muted,border:"none",cursor:"pointer",fontSize:11,fontWeight:ordem===v?700:400,transition:"all .15s",whiteSpace:"nowrap"}}>{l}</button>
        ))}
      </div>
    </div>
    <div style={{color:C.muted,fontSize:11,marginBottom:8}}>{lista.length} cliente{lista.length!==1?"s":""}</div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:C.cardHi}}>{["Código","Tipo","Nome","CPF/CNPJ","Telefone","Últ. atualização",""].map(h=>(<th key={h} style={{color:C.muted,fontSize:10.5,padding:"12px 16px",textAlign:"left",fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>{h}</th>))}</tr></thead>
        <tbody>{lista.map(c=>{const ua=ultimoAnd(c.id)||c.updatedAt;return(
          <tr key={c.id} style={{borderTop:`1px solid ${C.border}`,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=C.glass} onMouseLeave={e=>e.currentTarget.style.background=""}>
            <td style={{padding:"12px 16px",color:C.accent,fontWeight:700,fontSize:13}}>{c.id}</td>
            <td style={{padding:"12px 16px"}}><Badge label={c.tipoPessoa} color={c.tipoPessoa==="PF"?C.accent:C.accent2}/></td>
            <td style={{padding:"12px 16px",color:C.text,fontSize:13}}>{c.nome}{c.tipoPessoa==="PJ"&&(!c.admins||c.admins.length===0)&&<span style={{marginLeft:8,color:C.danger,fontSize:10}}>⚠️ sem rep.</span>}</td>
            <td style={{padding:"12px 16px",color:C.muted,fontSize:12}}>{c.cpf}</td>
            <td style={{padding:"12px 16px",color:C.muted,fontSize:12}}>{c.telefone}</td>
            <td style={{padding:"12px 16px",color:C.muted,fontSize:11}}>{ua?fmtComDia(ua):"—"}</td>
            <td style={{padding:"12px 16px"}}><Btn label="Ver" onClick={()=>setView(c.id)} small color={C.accent2} style={{marginRight:6}}/><Btn label="Editar" onClick={()=>setForm({...c,admins:c.admins||[]})} small/></td>
          </tr>);})}
        </tbody>
      </table>
    </Card>
  </div>);
}

// ============================================================================
// SEÇÃO 16: MODAL — DOCUMENTO PROCESSUAL COM PRAZO AUTOMÁTICO
// ----------------------------------------------------------------------------
// Registra um documento recebido/juntado no processo (ofício, decisão, etc.)
// e opcionalmente calcula e cria um prazo na agenda automaticamente.
//
// FLUXO:
//   1. Usuário seleciona tipo do documento e data de publicação/juntada
//   2. Marca "Há prazo a contar?" → informa qtd de dias e tipo (úteis/corridos)
//   3. Sistema calcula data de vencimento em tempo real via addDias()
//   4. Ao salvar: adiciona doc ao processo + cria evento tipo "prazo" na agenda
//
// TIPOS DE DOCUMENTO: oficio, decisao, despacho, sentenca, acordao, intimacao, citacao
//
// IMPORTANTE: O usuário SEMPRE deve confirmar a qtd de dias e o tipo de contagem.
//   Não há valor padrão pré-selecionado (por design, para evitar erros jurídicos).
//
// BACKEND — ENDPOINTS SUGERIDOS:
//   POST /api/processos/{id}/documentos → salva doc
//   POST /api/agenda                    → cria prazo (chamado internamente)
//
//   Ou em um único endpoint transacional:
//   POST /api/processos/{id}/documentos → salva doc E cria agenda se temPrazo=true
// ============================================================================
// ── MODAL DE DOCUMENTO PROCESSUAL ────────────────────────────────────────────
function DocProcessualModal({processo, advs, onSave, onClose, setAgenda}){
  const [doc, setDoc] = useState({
    tipo:"decisao", data:today(), descricao:"",
    temPrazo:false,
    qtdDias:"",        // sem default — usuário sempre preenche
    tipoDias:"",       // sem default — usuário sempre escolhe
    responsavel:processo.responsavel||advs[0]?.id||""
  });
  const [prazoCalc, setPrazoCalc] = useState(null);
  const [prazoErro, setPrazoErro] = useState("");

  useEffect(()=>{
    if(doc.temPrazo && doc.data && doc.qtdDias && doc.tipoDias){
      const r = addDias(doc.data, parseInt(doc.qtdDias)||1, doc.tipoDias, processo.tribunal);
      setPrazoCalc(r.data);
      setPrazoErro("");
    } else {
      setPrazoCalc(null);
      if(doc.temPrazo && (!doc.qtdDias||!doc.tipoDias)) setPrazoErro("Preencha a quantidade e o tipo de contagem.");
      else setPrazoErro("");
    }
  },[doc.temPrazo, doc.data, doc.qtdDias, doc.tipoDias]);

  function salvar(){
    if(!doc.descricao) return alert("Descreva o documento.");
    if(doc.temPrazo && (!doc.qtdDias||!doc.tipoDias)) return alert("Informe a quantidade de dias e o tipo de contagem para o prazo.");
    const novoDoc = {...doc, id:Date.now()};
    onSave(novoDoc);
    if(doc.temPrazo && prazoCalc){
      const tipoLabel = TIPOS_DOC_PROCESSUAL.find(t=>t.value===doc.tipo)?.label || doc.tipo;
      const novoEvento = {
        id: Date.now()+1,
        tipo:"prazo",
        titulo:`Prazo — ${tipoLabel} — ${processo.id}`,
        data: prazoCalc,
        hora:"23:59",
        local:"",
        obs:`${doc.descricao} (${doc.qtdDias} dias ${doc.tipoDias} a partir de ${fmt(doc.data)})`,
        processoId: processo.id,
        responsavel: doc.responsavel,
      };
      setAgenda(a=>[...a, novoEvento]);
    }
    onClose();
  }

  const tipoSel = TIPOS_DOC_PROCESSUAL.find(t=>t.value===doc.tipo);

  return(<div style={{position:"fixed",inset:0,background:"#000a",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <Card style={{width:600,maxHeight:"90vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{color:C.silver,fontWeight:600,fontSize:15,letterSpacing:"0.3px"}}>📋 Novo Documento Processual</div>
        <Btn label="✕" small onClick={onClose} color={C.border}/>
      </div>
      <Grid cols="1fr 1fr" gap={14}>
        <Sel label="Tipo de Documento" value={doc.tipo} onChange={v=>{const t=TIPOS_DOC_PROCESSUAL.find(x=>x.value===v);setDoc(d=>({...d,tipo:v,qtdDias:String(t?.prazoPadrao||15),tipoDias:t?.tipoPrazo||"uteis"}));}} options={TIPOS_DOC_PROCESSUAL.map(t=>({value:t.value,label:t.label}))}/>
        <Inp label="Data da Publicação/Juntada" type="date" value={doc.data} onChange={v=>setDoc(d=>({...d,data:v}))}/>
        <Inp label="Descrição / Ementa" value={doc.descricao} onChange={v=>setDoc(d=>({...d,descricao:v}))} style={{gridColumn:"span 2"}}/>
        <Sel label="Responsável pelo prazo" value={doc.responsavel} onChange={v=>setDoc(d=>({...d,responsavel:v}))} options={advs.map(a=>({value:a.id,label:a.nome}))}/>
      </Grid>
      <div style={{marginTop:16,padding:14,background:C.inputBg,borderRadius:12,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:doc.temPrazo?14:0}}>
          <button onClick={()=>setDoc(d=>({...d,temPrazo:!d.temPrazo}))} style={{width:20,height:20,borderRadius:4,border:`2px solid ${doc.temPrazo?C.accent:C.muted}`,background:doc.temPrazo?C.accent:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12}}>{doc.temPrazo?"✓":""}</button>
          <span style={{color:C.text,fontWeight:600}}>Há prazo a contar deste documento?</span>
        </div>
        {doc.temPrazo&&(<Grid cols="1fr 1fr 1fr" gap={12}>
          <Inp label="Quantidade de dias *" type="number" value={doc.qtdDias} onChange={v=>setDoc(d=>({...d,qtdDias:v}))} placeholder="Ex: 15"/>
          <Sel label="Tipo de prazo *" value={doc.tipoDias} onChange={v=>setDoc(d=>({...d,tipoDias:v}))} options={[{value:"",label:"— Selecione —"},{value:"uteis",label:"Dias úteis (art. 219 CPC)"},{value:"corridos",label:"Dias corridos"}]}/>
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <label style={{color:C.muted,fontSize:12}}>Vencimento calculado</label>
            {prazoCalc?(<div style={{background:C.accent+"14",border:`1px solid ${C.accent}35`,borderRadius:12,padding:"10px 14px"}}>
              <div style={{color:C.accent,fontWeight:700,fontSize:16}}>{fmtComDia(prazoCalc)}</div>
              <div style={{color:C.muted,fontSize:10}}>Será adicionado à agenda</div>
            </div>):(<div style={{color:prazoErro?C.danger:C.muted,fontSize:12,padding:"8px 0"}}>{prazoErro||"Preencha os campos ao lado"}</div>)}
          </div>
        </Grid>)}
      </div>
      {doc.temPrazo&&prazoCalc&&(<div style={{marginTop:12,padding:"10px 14px",background:C.success+"15",border:`1px solid ${C.success}33`,borderRadius:8}}>
        <div style={{color:C.success,fontWeight:600,fontSize:13}}>✓ Prazo será criado na agenda de {advs.find(a=>a.id===doc.responsavel)?.nome}</div>
        <div style={{color:C.muted,fontSize:12,marginTop:2}}>Vencimento: {fmtComDia(prazoCalc)}</div>
      </div>)}
      <div style={{display:"flex",gap:10,marginTop:16}}><Btn label="Salvar Documento" onClick={salvar}/><Btn label="Cancelar" onClick={onClose} color={C.border}/></div>
    </Card>
  </div>);
}

// ============================================================================
// SEÇÃO 17: MÓDULO DE PROCESSOS
// ----------------------------------------------------------------------------
// Módulo mais complexo do sistema. Gerencia o ciclo de vida de cada processo.
//
// ESTRUTURA DO PROCESSO:
//   - Dados básicos: NUP, tribunal, comarca, vara, classe, assunto, valor
//   - Parte contrária: nome, CPF/CNPJ, tipo (Réu/Ré/Reclamado...), advogado
//   - Responsável: advogado do escritório (referência a Colaboradores)
//   - Status: ativo | suspenso | arquivado | encerrado
//
// TABS DE DETALHE DO PROCESSO:
//   1. Andamentos   → histórico cronológico + timesheet por entrada
//   2. Peças        → documentos elaborados pelo escritório
//   3. Documentos   → documentos recebidos (ofícios, intimações, decisões)
//   4. Resultados   → sentenças, acórdãos e agravos com resultado
//
// GERAÇÃO DO ID DO PROCESSO:
//   Formato: {clienteId}-{letra} → ex: "0001-A", "0001-B"
//   Primeiro processo do cliente = letra A; segundo = B; etc.
//
// ANDAMENTO / TIMESHEET:
//   Cada andamento registra: descrição, data, relevância, advogado responsável,
//   horas trabalhadas (int) e minutos (int, 0-59), tipo de peça elaborada.
//
// BACKEND — ENDPOINTS SUGERIDOS:
//   GET    /api/processos               → lista com filtro ?busca=&status=
//   GET    /api/processos/{id}          → detalhe completo
//   POST   /api/processos               → criar
//   PUT    /api/processos/{id}          → editar
//   POST   /api/processos/{id}/andamentos → adicionar andamento
//   POST   /api/processos/{id}/documentos → ver Seção 16
//   POST   /api/processos/{id}/resultados → sentença/acórdão/agravo
//   GET    /api/processos/{id}/timesheet  → horas totais do processo
// ============================================================================
// ── PROCESSOS ────────────────────────────────────────────────────────────────
function Processos({processos,setProcessos,clientes,andamentos,setAndamentos,pecas,setPecas,advs,agenda,setAgenda}){
  const[busca,setBusca]=useState("");
  const[form,setForm]=useState(null);
  const[view,setView]=useState(null);
  const[andForm,setAndForm]=useState(null);
  const[tabView,setTabView]=useState("andamentos");
  const[docModal,setDocModal]=useState(false);
  const[ordem,setOrdem]=useState("codigo");
  const[relatorio,setRelatorio]=useState(false); // modal de relatório de andamentos

  // última atualização de andamento por processo
  function ultimoAndProc(procId){
    const ands=andamentos.filter(a=>a.processoId===procId);
    return ands.length?ands.sort((a,b)=>b.data.localeCompare(a.data))[0].data:"";
  }

  const base=processos.filter(p=>p.id.toLowerCase().includes(busca.toLowerCase())||p.nup.includes(busca)||(clientes.find(c=>c.id===p.clienteId)||{}).nome?.toLowerCase().includes(busca.toLowerCase()));
  const lista=[...base].sort((a,b)=>{
    if(ordem==="alfa"){const ca=clientes.find(c=>c.id===a.clienteId)?.nome||"";const cb=clientes.find(c=>c.id===b.clienteId)?.nome||"";return ca.localeCompare(cb,"pt-BR");}
    if(ordem==="atualizacao"){const da=ultimoAndProc(a.id)||a.id;const db=ultimoAndProc(b.id)||b.id;return db.localeCompare(da);}
    return a.id.localeCompare(b.id);
  });

  function nextProcId(clienteId){
    const ex=processos.filter(p=>p.clienteId===clienteId).map(p=>p.id.split("-")[1]).filter(Boolean);
    if(!ex.length)return`${clienteId}-A`;
    const last=ex.sort().at(-1);return`${clienteId}-${String.fromCharCode(last.charCodeAt(0)+1)}`;
  }
  function salvar(){
    if(!form.clienteId||!form.nup)return alert("Cliente e NUP obrigatórios.");
    const id=form._novo?nextProcId(form.clienteId):form.id;
    if(form._novo)setProcessos(p=>[...p,{...form,id,_novo:undefined}]);
    else setProcessos(p=>p.map(x=>x.id===form.id?{...form,_novo:undefined}:x));
    setForm(null);
  }
  function addResultado(tipo,tipoItem){
    const novo={data:today(),tipo:tipoItem,obs:""};
    setProcessos(ps=>ps.map(p=>p.id===view?{...p,[tipo]:[...(p[tipo]||[]),novo]}:p));
  }
  function saveDocProcessual(doc){
    setProcessos(ps=>ps.map(p=>p.id===view?{...p,docsProcessuais:[...(p.docsProcessuais||[]),doc]}:p));
  }

  const tipoDocClr={oficio:C.accent,decisao:C.warning,despacho:C.muted,sentenca:C.success,acordao:C.accent2,intimacao:C.danger,citacao:C.danger};

  if(form)return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><Btn label="← Voltar" onClick={()=>setForm(null)} color={C.border}/><h2 style={{color:C.text,margin:0,fontFamily:"\'DM Serif Display\',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>{form._novo?"Novo Processo":"Editar Processo"}</h2></div>
    <Card style={{marginBottom:16}}>
      <div style={{color:C.silver,fontWeight:600,marginBottom:14,fontSize:13,letterSpacing:"0.2px"}}>⚖️ Dados do Processo</div>
      <Grid cols="1fr 1fr 1fr" gap={14}>
        <Sel label="Cliente" value={form.clienteId} onChange={v=>setForm(f=>({...f,clienteId:v}))} style={{gridColumn:"span 2"}} options={[{value:"",label:"Selecione..."},...clientes.map(c=>({value:c.id,label:`${c.id} — ${c.nome}`}))]}/>
        <Sel label="Status" value={form.status} onChange={v=>setForm(f=>({...f,status:v}))} options={["ativo","suspenso","arquivado","encerrado"].map(s=>({value:s,label:s}))}/>
        <Inp label="Número CNJ (NUP)" value={form.nup} onChange={v=>setForm(f=>({...f,nup:v}))} style={{gridColumn:"span 2"}}/>
        <Sel label="Responsável" value={form.responsavel||""} onChange={v=>setForm(f=>({...f,responsavel:v}))} options={[{value:"",label:"Selecione..."},...advs.map(a=>({value:a.id,label:a.nome}))]}/>
        <div style={{gridColumn:"span 3"}}><TribunalInput value={form.tribunal} onChange={v=>setForm(f=>({...f,tribunal:v,comarca:""}))}/></div>
        <div><ComarcaInput value={form.comarca} onChange={v=>setForm(f=>({...f,comarca:v}))}/></div>
        <Inp label="Vara" value={form.vara} onChange={v=>setForm(f=>({...f,vara:v}))}/>
        <Inp label="Classe Processual" value={form.classe} onChange={v=>setForm(f=>({...f,classe:v}))}/>
        <Inp label="Assunto" value={form.assunto} onChange={v=>setForm(f=>({...f,assunto:v}))} style={{gridColumn:"span 2"}}/>
        <Inp label="Valor da Causa (R$)" value={form.valor||""} onChange={v=>setForm(f=>({...f,valor:v,valorCausa:parseFloat(v)||0}))}/>
        <Inp label="Tags" value={form.tags||""} onChange={v=>setForm(f=>({...f,tags:v}))}/>
        <Inp label="Observações" value={form.obs||""} onChange={v=>setForm(f=>({...f,obs:v}))} style={{gridColumn:"span 3"}}/>
      </Grid>
    </Card>
    {/* Análise de Risco */}
    <Card style={{marginBottom:16}}>
      <div style={{color:C.silver,fontWeight:600,marginBottom:14,fontSize:13,letterSpacing:"0.2px"}}>🎯 Análise de Risco</div>
      <Grid cols="1fr 1fr" gap={14}>
        <div>
          <label style={{color:C.silver,fontSize:11.5,fontWeight:500,display:"block",marginBottom:5}}>Probabilidade de Êxito: <span style={{color:(form.probExito??50)>=70?C.success:(form.probExito??50)>=40?C.warning:C.danger,fontWeight:700}}>{form.probExito??50}%</span></label>
          <input type="range" min={0} max={100} step={5} value={form.probExito??50} onChange={e=>setForm(f=>({...f,probExito:Number(e.target.value)}))} style={{width:"100%",accentColor:C.accent}}/>
          <div style={{display:"flex",justifyContent:"space-between",color:C.muted,fontSize:10}}><span>0% — Inviável</span><span>50% — Incerto</span><span>100% — Certo</span></div>
        </div>
        <div style={{background:((form.probExito??50)>=70?C.success:(form.probExito??50)>=40?C.warning:C.danger)+"11",border:`1px solid ${((form.probExito??50)>=70?C.success:(form.probExito??50)>=40?C.warning:C.danger)}30`,borderRadius:12,padding:14,display:"flex",flexDirection:"column",justifyContent:"center"}}>
          <div style={{color:C.muted,fontSize:11}}>Impacto financeiro estimado</div>
          <div style={{color:(form.probExito??50)>=70?C.success:(form.probExito??50)>=40?C.warning:C.danger,fontSize:20,fontWeight:700,marginTop:4}}>R$ {((parseFloat(form.valor)||0)*((form.probExito??50)/100)).toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
          <div style={{color:C.muted,fontSize:10,marginTop:2}}>{form.probExito??50}% de R$ {(parseFloat(form.valor)||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
        </div>
      </Grid>
    </Card>
    {/* Parte Contrária */}
    <Card style={{marginBottom:16}}>
      <div style={{color:C.silver,fontWeight:600,marginBottom:14,fontSize:13,letterSpacing:"0.2px"}}>🆚 Parte Contrária</div>
      <Grid cols="1fr 1fr 1fr" gap={14}>
        <Inp label="Nome da parte contrária" value={form.parteContraria?.nome||""} onChange={v=>setForm(f=>({...f,parteContraria:{...f.parteContraria,nome:v}}))} style={{gridColumn:"span 2"}}/>
        <Sel label="Tipo" value={form.parteContraria?.tipo||"Réu"} onChange={v=>setForm(f=>({...f,parteContraria:{...f.parteContraria,tipo:v}}))} options={["Réu","Ré","Reclamado","Recorrido","Apelado","Executado","Impetrado","Outro"].map(x=>({value:x,label:x}))}/>
        <Inp label="CPF / CNPJ" value={form.parteContraria?.cpfCnpj||""} onChange={v=>setForm(f=>({...f,parteContraria:{...f.parteContraria,cpfCnpj:v}}))}/>
        <Inp label="Advogado(s) da parte contrária" value={form.parteContraria?.advogado||""} onChange={v=>setForm(f=>({...f,parteContraria:{...f.parteContraria,advogado:v}}))} style={{gridColumn:"span 2"}}/>
      </Grid>
    </Card>
    <div style={{display:"flex",gap:10}}><Btn label="Salvar Processo" onClick={salvar}/><Btn label="Cancelar" onClick={()=>setForm(null)} color={C.border}/></div>
  </div>);

  if(view){
    const p=processos.find(x=>x.id===view);
    const cli=clientes.find(c=>c.id===p.clienteId);
    const adv=advs.find(a=>a.id===p.responsavel);
    const ands=andamentos.filter(a=>a.processoId===view);
    const pcs=pecas.filter(x=>x.processoId===view);
    const docs=p.docsProcessuais||[];
    const relev={prazo:"🔴",audiencia:"🟡",despacho:"🔵",sentenca:"⚠️",urgente:"🚨"};
    const tabs=["andamentos","peças","documentos","resultados"];
    const totalMins=ands.reduce((s,a)=>s+(a.horas||0)*60+(a.minutos||0),0);

    // ── RELATÓRIO DE ANDAMENTOS (impressão) ────────────────────────────────
    function imprimirRelatorio(){
      const escritorioNome=document.title||"Escritório";
      const html=`<html><head><title>Relatório – Processo ${p.id}</title><style>
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
          <p><strong>Cliente:</strong> ${cli?.nome||"—"}</p>
          <p><strong>Vara:</strong> ${p.vara} · ${p.comarca}</p>
          <p><strong>Responsável:</strong> ${adv?.nome||"—"}</p>
          <p><strong>Status:</strong> ${p.status}</p>
          ${p.parteContraria?.nome?`<p><strong>Parte contrária:</strong> ${p.parteContraria.nome} (${p.parteContraria.tipo})</p>`:""}
        </div>
        <div style="margin-bottom:20px">
          <span class="kpi"><strong>${ands.length}</strong>Andamentos</span>
          <span class="kpi"><strong>${fmtHoras(Math.floor(totalMins/60),totalMins%60)}</strong>Horas</span>
          <span class="kpi"><strong>${pcs.length}</strong>Peças</span>
          <span class="kpi"><strong>${p.pedidosDeferidos||0}✓ / ${p.pedidosIndeferidos||0}✗</strong>Ped. Def/Ind.</span>
        </div>
        <table>
          <thead><tr><th>Data</th><th>Advogado</th><th>Relevância</th><th>Descrição</th><th>Horas</th><th>Peça</th></tr></thead>
          <tbody>
            ${[...ands].sort((a,b)=>a.data.localeCompare(b.data)).map(a=>`
              <tr>
                <td style="white-space:nowrap">${fmtComDia(a.data)}</td>
                <td>${advs.find(x=>x.id===a.usuario)?.nome||a.usuario||"—"}</td>
                <td>${a.relevancia||"—"}</td>
                <td>${a.descricao}</td>
                <td style="white-space:nowrap">${fmtHoras(a.horas||0,a.minutos||0)}</td>
                <td>${a.tipoPeca||"—"}</td>
              </tr>`).join("")}
          </tbody>
        </table>
        <p style="margin-top:30px;color:#777;font-size:11px">Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</p>
      </body></html>`;
      const w=window.open("","_blank","width=900,height=700");
      w.document.write(html);w.document.close();setTimeout(()=>w.print(),500);
    }

    return(<div>
      {docModal&&<DocProcessualModal processo={p} advs={advs} onSave={saveDocProcessual} onClose={()=>setDocModal(false)} setAgenda={setAgenda}/>}
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <Btn label="← Voltar" onClick={()=>setView(null)} color={C.border}/>
        <Btn label="Editar Processo" onClick={()=>{setForm({...p,parteContraria:p.parteContraria||{}});setView(null);}} color={C.accent2}/>
        <Btn label="+ Andamento" onClick={()=>setAndForm({processoId:view,data:today(),descricao:"",origem:"manual",relevancia:"",usuario:advs[0]?.id||"",horas:0,minutos:0,tipoPeca:""})}/>
        <Btn label="+ Documento Processual" onClick={()=>setDocModal(true)} color={C.warning}/>
        <Btn label="🖨 Relatório de Andamentos" onClick={imprimirRelatorio} color={C.success}/>
      </div>
      <Grid cols="1fr 1fr" gap={16} style={{marginBottom:16}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{color:C.accent,fontWeight:700,fontSize:16}}>{p.id}</span>
            <Badge label={p.status} color={statusClr[p.status]||C.muted}/>
          </div>
          <div style={{color:C.text,fontWeight:600,marginBottom:8}}>{p.classe}</div>
          {[["Cliente",cli?.nome],["Tribunal",p.tribunal],["Comarca",p.comarca],["Vara",p.vara],["NUP",p.nup],["Responsável",adv?.nome],["Horas (TS)",fmtHoras(Math.floor(totalMins/60),totalMins%60)],["Ped. Def./Ind.",`${p.pedidosDeferidos||0} / ${p.pedidosIndeferidos||0}`]].map(([l,v])=>v&&(
            <div key={l} style={{marginBottom:5}}><span style={{color:C.muted,fontSize:11}}>{l}: </span><span style={{color:C.text,fontSize:13}}>{v}</span></div>
          ))}
          {/* Parte contrária */}
          {p.parteContraria?.nome&&(<div style={{marginTop:12,padding:"10px 14px",background:C.danger+"11",border:`1px solid ${C.danger}22`,borderRadius:8}}>
            <div style={{color:C.danger,fontWeight:600,fontSize:12,marginBottom:6}}>🆚 Parte Contrária — {p.parteContraria.tipo}</div>
            <div style={{color:C.text,fontSize:13}}>{p.parteContraria.nome}</div>
            {p.parteContraria.cpfCnpj&&<div style={{color:C.muted,fontSize:11}}>CPF/CNPJ: {p.parteContraria.cpfCnpj}</div>}
            {p.parteContraria.advogado&&<div style={{color:C.muted,fontSize:11}}>Adv.: {p.parteContraria.advogado}</div>}
          </div>)}
        </Card>
        <div>
          <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
            {tabs.map(t=>(<button key={t} onClick={()=>setTabView(t)} style={{padding:"7px 12px",borderRadius:10,border:`1px solid ${tabView===t?C.accent:C.border}`,background:tabView===t?C.accent+"22":"transparent",color:tabView===t?C.accent:C.muted,cursor:"pointer",fontSize:12,fontWeight:tabView===t?700:400,textTransform:"capitalize"}}>{t==="documentos"?"📋 Documentos":t}</button>))}
          </div>
          {tabView==="andamentos"&&<Card style={{maxHeight:340,overflowY:"auto",padding:14}}>
            {ands.length===0&&<div style={{color:C.muted,fontSize:13,fontStyle:"italic"}}>Nenhum andamento.</div>}
            {[...ands].reverse().map(a=>(<div key={a.id} style={{borderBottom:`1px solid ${C.border}`,paddingBottom:10,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{color:C.muted,fontSize:11}}>{fmtComDia(a.data)} • {advs.find(x=>x.id===a.usuario)?.nome||a.usuario}</span>
                {a.relevancia&&<span style={{fontSize:11}}>{relev[a.relevancia]||""} {a.relevancia}</span>}
              </div>
              <div style={{color:C.text,fontSize:13,marginTop:4}}>{a.descricao}</div>
              <div style={{color:C.accent,fontSize:11,marginTop:3}}>{fmtHoras(a.horas||0,a.minutos||0)} {a.tipoPeca&&`• ${a.tipoPeca}`}</div>
            </div>))}
          </Card>}
          {tabView==="peças"&&<Card style={{maxHeight:340,overflowY:"auto",padding:14}}>
            {pcs.length===0&&<div style={{color:C.muted,fontSize:13,fontStyle:"italic"}}>Nenhuma peça registrada.</div>}
            {pcs.map(pc=>(<div key={pc.id} style={{borderBottom:`1px solid ${C.border}`,paddingBottom:8,marginBottom:8}}>
              <div style={{color:C.text,fontSize:13,fontWeight:600}}>{pc.tipo}</div>
              <div style={{color:C.muted,fontSize:11}}>{fmtComDia(pc.data)} • {advs.find(a=>a.id===pc.advId)?.nome}</div>
              {pc.obs&&<div style={{color:C.muted,fontSize:11}}>{pc.obs}</div>}
            </div>))}
          </Card>}
          {tabView==="documentos"&&<Card style={{maxHeight:340,overflowY:"auto",padding:14}}>
            {docs.length===0&&<div style={{color:C.muted,fontSize:13,fontStyle:"italic"}}>Nenhum documento processual registrado.</div>}
            {[...docs].reverse().map(d=>{
              const tipoInfo=TIPOS_DOC_PROCESSUAL.find(t=>t.value===d.tipo);
              const adv=advs.find(a=>a.id===d.responsavel);
              return(<div key={d.id} style={{borderBottom:`1px solid ${C.border}`,paddingBottom:10,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <Badge label={tipoInfo?.label||d.tipo} color={tipoDocClr[d.tipo]||C.muted}/>
                  <span style={{color:C.muted,fontSize:11}}>{fmtComDia(d.data)}</span>
                </div>
                <div style={{color:C.text,fontSize:13,marginTop:6}}>{d.descricao}</div>
                {d.temPrazo&&(<div style={{marginTop:6,display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:C.warning,fontSize:11}}>⏱ {d.qtdDias} dias {d.tipoDias}</span>
                  {adv&&<span style={{color:C.muted,fontSize:11}}>• {adv.nome}</span>}
                </div>)}
              </div>);
            })}
          </Card>}
          {tabView==="resultados"&&<Card style={{maxHeight:340,overflowY:"auto",padding:14}}>
            {["sentencas","acordaos","agravos"].map(tipo=>{const items=p[tipo]||[];const labels={sentencas:"Sentenças",acordaos:"Acórdãos",agravos:"Agravos"};const opts={sentencas:["favoravel","desfavoravel"],acordaos:["provido","improvido"],agravos:["provido","improvido"]};
              return(<div key={tipo} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{color:C.text,fontWeight:600,fontSize:13}}>{labels[tipo]}</span>
                  <div style={{display:"flex",gap:4}}>
                    {opts[tipo].map(op=>(<Btn key={op} label={`+ ${op}`} small onClick={()=>addResultado(tipo,op)} color={op==="favoravel"||op==="provido"?C.success:C.danger}/>))}
                  </div>
                </div>
                {items.length===0&&<div style={{color:C.muted,fontSize:12}}>Nenhum registro.</div>}
                {items.map((it,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",background:C.surface,borderRadius:8,marginBottom:4}}>
                  <span style={{color:C.text,fontSize:12}}>{fmtComDia(it.data)} {it.obs&&`— ${it.obs}`}</span>
                  <Badge label={it.tipo} color={it.tipo==="favoravel"||it.tipo==="provido"?C.success:C.danger}/>
                </div>))}
              </div>);
            })}
          </Card>}
        </div>
      </Grid>
      {andForm&&<Card style={{marginTop:0}}>
        <div style={{color:C.text,fontWeight:600,marginBottom:12}}>Novo Andamento / Peça</div>
        <Grid cols="1fr 1fr 1fr" gap={12}>
          <Inp label="Data" type="date" value={andForm.data} onChange={v=>setAndForm(f=>({...f,data:v}))}/>
          <Sel label="Relevância" value={andForm.relevancia} onChange={v=>setAndForm(f=>({...f,relevancia:v}))} options={[{value:"",label:"Normal"},...["prazo","audiencia","despacho","sentenca","urgente"].map(x=>({value:x,label:x}))]}/>
          <Sel label="Advogado" value={andForm.usuario} onChange={v=>setAndForm(f=>({...f,usuario:v}))} options={advs.map(a=>({value:a.id,label:a.nome}))}/>
          {/* TIMESHEET — horas e minutos */}
          <div style={{display:"flex",gap:8}}>
            <Inp label="Horas" type="number" value={andForm.horas||"0"} onChange={v=>setAndForm(f=>({...f,horas:parseInt(v)||0}))} style={{flex:1}}/>
            <Inp label="Minutos" type="number" value={andForm.minutos||"0"} onChange={v=>setAndForm(f=>({...f,minutos:Math.min(59,parseInt(v)||0)}))} style={{flex:1}} suffix="min"/>
          </div>
          <Sel label="Tipo de Peça" value={andForm.tipoPeca||""} onChange={v=>setAndForm(f=>({...f,tipoPeca:v}))} options={[{value:"",label:"Nenhuma"},...TIPOS_PECA.map(x=>({value:x,label:x}))]}/>
          <Inp label="Descrição" value={andForm.descricao} onChange={v=>setAndForm(f=>({...f,descricao:v}))} style={{gridColumn:"span 3"}}/>
        </Grid>
        {(andForm.horas>0||andForm.minutos>0)&&(<div style={{marginTop:8,padding:"7px 13px",background:C.accent+"12",borderRadius:10,color:C.accent,fontSize:13}}>
          ⏱ Tempo registrado: {fmtHoras(andForm.horas||0,andForm.minutos||0)}
        </div>)}
        <div style={{display:"flex",gap:10,marginTop:12}}>
          <Btn label="Salvar" onClick={()=>{
            if(!andForm.descricao)return alert("Descrição obrigatória.");
            const novoPeca=andForm.tipoPeca?{id:Date.now(),processoId:view,data:andForm.data,tipo:andForm.tipoPeca,advId:andForm.usuario,obs:""}:null;
            if(novoPeca)setPecas(p=>[...p,novoPeca]);
            setAndamentos(a=>[...a,{...andForm,id:Date.now()}]);
            setAndForm(null);
          }}/>
          <Btn label="Cancelar" onClick={()=>setAndForm(null)} color={C.border}/>
        </div>
      </Card>}
    </div>);
  }

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h2 style={{color:C.text,margin:0,fontFamily:"\'DM Serif Display\',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>Processos</h2>
      <Btn label="+ Novo Processo" onClick={()=>setForm({id:"",clienteId:"",parteContraria:{nome:"",cpfCnpj:"",advogado:"",tipo:"Réu"},nup:"",tribunal:"",comarca:"",vara:"",classe:"",assunto:"",valor:"",status:"ativo",responsavel:"",tags:"",obs:"",horasTrabalhadas:0,pedidosDeferidos:0,pedidosIndeferidos:0,sentencas:[],acordaos:[],agravos:[],docsProcessuais:[],probExito:50,valorCausa:0,_novo:true})}/>
    </div>
    <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
      <Inp placeholder="Buscar por código, NUP ou cliente..." value={busca} onChange={setBusca} style={{flex:1,minWidth:200,marginBottom:0}}/>
      <div style={{display:"flex",gap:2,background:C.cardHi,borderRadius:20,padding:3,border:`1px solid ${C.border}`,flexShrink:0}}>
        {[["codigo","# Código"],["alfa","A–Z Cliente"],["atualizacao","↺ Atualização"]].map(([v,l])=>(
          <button key={v} onClick={()=>setOrdem(v)} style={{padding:"5px 12px",borderRadius:16,background:ordem===v?C.accent:"transparent",color:ordem===v?"#fff":C.muted,border:"none",cursor:"pointer",fontSize:11,fontWeight:ordem===v?700:400,transition:"all .15s",whiteSpace:"nowrap"}}>{l}</button>
        ))}
      </div>
    </div>
    <div style={{color:C.muted,fontSize:11,marginBottom:8}}>{lista.length} processo{lista.length!==1?"s":""}</div>
    <Card style={{padding:0,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:C.cardHi}}>{["","Código","Cliente","Parte Contrária","Classe","Tribunal","Responsável","Status","Últ. mov.",""].map(h=>(<th key={h} style={{color:C.muted,fontSize:10.5,padding:"12px 16px",textAlign:"left",fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>{h}</th>))}</tr></thead>
        <tbody>{lista.map(p=>{const cli=clientes.find(c=>c.id===p.clienteId);const adv=advs.find(a=>a.id===p.responsavel);const ua=ultimoAndProc(p.id);
          // semáforo de prazo
          const prxPrazo=agenda.filter(e=>e.processoId===p.id&&e.data>=today()&&(e.tipo==="prazo"||e.tipo==="audiencia")).sort((a,b)=>a.data.localeCompare(b.data))[0];
          const hoje2=today();const em3b=new Date();em3b.setDate(em3b.getDate()+3);const em3bs=em3b.toISOString().split("T")[0];const em7b=new Date();em7b.setDate(em7b.getDate()+7);const em7bs=em7b.toISOString().split("T")[0];
          const semClr=!prxPrazo?"#555":prxPrazo.data<=em3bs?C.danger:prxPrazo.data<=em7bs?C.warning:C.success;
          const semTitle=!prxPrazo?"Sem prazos futuros":`Próx. prazo: ${fmt(prxPrazo.data)} — ${prxPrazo.titulo}`;
          return(
          <tr key={p.id} style={{borderTop:`1px solid ${C.border}`,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=C.glass} onMouseLeave={e=>e.currentTarget.style.background=""}>
            <td style={{padding:"12px 8px 12px 16px"}}><div title={semTitle} style={{width:10,height:10,borderRadius:"50%",background:semClr,boxShadow:`0 0 6px ${semClr}99`,flexShrink:0}}/></td>
            <td style={{padding:"12px 16px",color:C.accent,fontWeight:700,fontSize:13}}>{p.id}</td>
            <td style={{padding:"12px 16px",color:C.text,fontSize:13}}>{cli?.nome}</td>
            <td style={{padding:"12px 16px",color:C.muted,fontSize:12}}>{p.parteContraria?.nome||<span style={{color:C.muted,opacity:0.4}}>—</span>}</td>
            <td style={{padding:"12px 16px",color:C.muted,fontSize:12}}>{p.classe}</td>
            <td style={{padding:"12px 16px",color:C.muted,fontSize:11}}>{p.tribunal?.split("–")[0]}</td>
            <td style={{padding:"12px 16px"}}>{adv&&<span style={{background:adv.cor+"22",color:adv.cor,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>{adv.nome.split(" ")[0]+" "+adv.nome.split(" ").at(-1)}</span>}</td>
            <td style={{padding:"12px 16px"}}><Badge label={p.status} color={statusClr[p.status]||C.muted}/></td>
            <td style={{padding:"12px 16px",color:C.muted,fontSize:11}}>{ua?fmtComDia(ua):"—"}</td>
            <td style={{padding:"12px 16px"}}><Btn label="Ver" onClick={()=>setView(p.id)} small color={C.accent2} style={{marginRight:6}}/><Btn label="Editar" onClick={()=>setForm({...p,parteContraria:p.parteContraria||{}})} small/></td>
          </tr>);})}
        </tbody>
      </table>
    </Card>
  </div>);
}

// ============================================================================
// SEÇÃO 18: MÓDULO DE AGENDA & PRAZOS
// ----------------------------------------------------------------------------
// Gerencia eventos do escritório com 3 visões: lista, semana e mês.
// Inclui calculadora de prazos standalone (sem salvar na agenda).
//
// TIPOS DE EVENTO: audiencia | prazo | reuniao | tarefa | financeiro
//
// ALERTA DE URGÊNCIA:
//   Eventos tipo "prazo" ou "audiencia" nos próximos 3 dias geram alerta
//   vermelho no topo da agenda E badge numérico no menu lateral.
//
// CALCULADORA DE PRAZOS (aba separada):
//   - Marco inicial, qtd dias, tipo (úteis/corridos), tribunal opcional
//   - Usa addDias() — veja Seção 7
//   - Exibe a data de vencimento E todos os dias desconsiderados com motivo
//   - NÃO salva automaticamente na agenda (apenas calcula)
//
// CRIAÇÃO AUTOMÁTICA DE PRAZO:
//   Quando um Documento Processual tem prazo (Seção 16), um evento tipo "prazo"
//   é criado automaticamente neste módulo.
//
// BACKEND — ENDPOINTS SUGERIDOS:
//   GET    /api/agenda?de=&ate=&advId=&tipo=   → lista filtrada
//   POST   /api/agenda                          → criar evento
//   PUT    /api/agenda/{id}                     → editar
//   DELETE /api/agenda/{id}                     → excluir
//   POST   /api/prazos/calcular                 → calculadora (sem persistir)
// ============================================================================
// ── AGENDA ────────────────────────────────────────────────────────────────────
function AgendaSemana({ordenada,hoje,tipoClr,setForm}){
  const[weekOffset,setWeekOffset]=useState(0);
  const startOfWeek=(d)=>{const dt=new Date(d+"T12:00:00");dt.setDate(dt.getDate()-dt.getDay());return dt;};
  const sw=startOfWeek(hoje);sw.setDate(sw.getDate()+weekOffset*7);
  const dias=Array.from({length:7},(_,i)=>{const d=new Date(sw);d.setDate(d.getDate()+i);return d.toISOString().split("T")[0];});
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
      <Btn label="◀" onClick={()=>setWeekOffset(w=>w-1)} small color={C.border}/>
      <span style={{color:C.text,fontWeight:600}}>{fmtComDia(dias[0])} – {fmtComDia(dias[6])}</span>
      <Btn label="▶" onClick={()=>setWeekOffset(w=>w+1)} small color={C.border}/>
      <Btn label="Hoje" onClick={()=>setWeekOffset(0)} small color={C.accent}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
      {dias.map(d=>{
        const evs=ordenada.filter(e=>e.data===d);
        const isHj=d===hoje;const diaN=new Date(d+"T12:00:00").getDay();
        return(<div key={d} style={{minHeight:130,background:isHj?C.accent+"18":C.card,borderRadius:10,border:`1px solid ${isHj?C.accent:C.border}`,padding:8}}>
          <div style={{color:isHj?C.accent:C.muted,fontSize:11,fontWeight:700,marginBottom:6}}>{DIAS_ABREV[diaN]}<br/><span style={{fontSize:14,color:isHj?C.accent:C.text}}>{fmt(d).slice(0,5)}</span></div>
          {evs.map(e=>(<div key={e.id} style={{background:(tipoClr[e.tipo]||C.muted)+"22",border:`1px solid ${(tipoClr[e.tipo]||C.muted)}44`,borderRadius:6,padding:"3px 6px",marginBottom:4,cursor:"pointer"}} onClick={()=>setForm({...e})}>
            <div style={{color:tipoClr[e.tipo]||C.muted,fontSize:10,fontWeight:700}}>{e.hora||"—"}</div>
            <div style={{color:C.text,fontSize:11,lineHeight:1.3}}>{e.titulo.slice(0,28)}{e.titulo.length>28?"…":""}</div>
          </div>))}
        </div>);
      })}
    </div>
  </div>);
}

function AgendaMes({ordenada,hoje,tipoClr,setForm}){
  const[mesOffset,setMesOffset]=useState(0);
  const refDate=new Date(hoje+"T12:00:00");refDate.setMonth(refDate.getMonth()+mesOffset);
  const ano=refDate.getFullYear();const mes=refDate.getMonth();
  const primeiroDia=new Date(ano,mes,1).getDay();
  const diasNoMes=new Date(ano,mes+1,0).getDate();
  const meses=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const cells=Array.from({length:primeiroDia},()=>null).concat(Array.from({length:diasNoMes},(_,i)=>i+1));
  return(<div>
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
      <Btn label="◀" onClick={()=>setMesOffset(m=>m-1)} small color={C.border}/>
      <span style={{color:C.text,fontWeight:700,fontSize:16}}>{meses[mes]} {ano}</span>
      <Btn label="▶" onClick={()=>setMesOffset(m=>m+1)} small color={C.border}/>
      <Btn label="Hoje" onClick={()=>setMesOffset(0)} small color={C.accent}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
      {DIAS_ABREV.map(d=>(<div key={d} style={{textAlign:"center",color:C.muted,fontSize:11,fontWeight:700,padding:"4px 0"}}>{d}</div>))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
      {cells.map((dia,i)=>{
        if(!dia)return(<div key={`e${i}`} style={{minHeight:70}}/>);
        const dStr=`${ano}-${String(mes+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
        const evs=ordenada.filter(e=>e.data===dStr);
        const isHj=dStr===hoje;
        return(<div key={dStr} style={{minHeight:70,background:isHj?C.accent+"22":C.card,borderRadius:10,border:`1px solid ${isHj?C.accent:C.border}`,boxShadow:isHj?`0 0 12px ${C.accent}30`:"none",padding:5}}>
          <div style={{color:isHj?C.accent:C.text,fontWeight:isHj?700:400,fontSize:13,marginBottom:3}}>{dia}</div>
          {evs.slice(0,3).map(e=>(<div key={e.id} style={{background:(tipoClr[e.tipo]||C.muted)+"33",borderLeft:`2px solid ${tipoClr[e.tipo]||C.muted}`,borderRadius:3,padding:"1px 5px",marginBottom:2,fontSize:10,color:C.text,cursor:"pointer"}} onClick={()=>setForm({...e})}>{e.titulo.slice(0,18)}</div>))}
          {evs.length>3&&<div style={{color:C.muted,fontSize:10}}>+{evs.length-3}</div>}
        </div>);
      })}
    </div>
  </div>);
}

function Agenda({agenda,setAgenda,processos,advs}){
  const[tab,setTab]=useState("lista");
  const[agendaView,setAgendaView]=useState("lista");
  const[form,setForm]=useState(null);
  const[calc,setCalc]=useState({marco:"",qtd:"15",tipo:"uteis",tribunal:"",resultado:null});
  const hoje=today();
  const em3=new Date();em3.setDate(em3.getDate()+3);const em3s=em3.toISOString().split("T")[0];
  const tipoClr={audiencia:C.warning,prazo:C.danger,reuniao:C.accent,tarefa:C.success,financeiro:C.accent2};
  const ordenada=[...agenda].sort((a,b)=>a.data.localeCompare(b.data));

  function salvar(){if(!form.titulo||!form.data)return alert("Título e data obrigatórios.");if(form._novo)setAgenda(a=>[...a,{...form,id:Date.now(),_novo:undefined}]);else setAgenda(a=>a.map(x=>x.id===form.id?{...form,_novo:undefined}:x));setForm(null);}
  function calcular(){if(!calc.marco)return alert("Informe o marco inicial.");const r=addDias(calc.marco,parseInt(calc.qtd)||1,calc.tipo,calc.tribunal);setCalc(c=>({...c,resultado:r}));}

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h2 style={{color:C.text,margin:0,fontFamily:"\'DM Serif Display\',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>Agenda & Prazos</h2>
      <div style={{display:"flex",gap:8}}>
        {["lista","calculadora"].map(t=>(<Btn key={t} label={t==="lista"?"📅 Agenda":"⏱ Calculadora"} onClick={()=>setTab(t)} color={tab===t?C.accent:C.border}/>))}
        {tab==="lista"&&(<>
          <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {[["lista","☰"],["semana","7"],["mes","📆"]].map(([v,l])=>(<button key={v} onClick={()=>setAgendaView(v)} style={{padding:"8px 13px",background:agendaView===v?C.accent+"33":"transparent",color:agendaView===v?C.accent:C.muted,border:"none",cursor:"pointer",fontSize:13,fontWeight:agendaView===v?700:400}}>{l}</button>))}
          </div>
          <Btn label="+ Evento" onClick={()=>setForm({_novo:true,tipo:"reuniao",titulo:"",data:hoje,hora:"",local:"",obs:"",processoId:"",responsavel:advs[0]?.id||""})}/>
        </>)}
      </div>
    </div>
    {(() => {
      const urgentes=agenda.filter(e=>e.data>=hoje&&e.data<=em3s&&(e.tipo==="prazo"||e.tipo==="audiencia"));
      if(!urgentes.length)return null;
      return(<div style={{background:C.danger+"18",border:`1px solid ${C.danger}44`,borderRadius:10,padding:14,marginBottom:16}}>
        <div style={{color:C.danger,fontWeight:700,marginBottom:8}}>🔔 Prazos/Audiências nos próximos 3 dias</div>
        {urgentes.map(e=>{const adv=advs.find(a=>a.id===e.responsavel);return(
          <div key={e.id} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{color:C.text,fontSize:13}}>{e.titulo}</span>
            <span style={{color:C.danger,fontWeight:700,fontSize:13}}>{fmtComDia(e.data)} {adv&&`• ${adv.nome.split(" ")[0]}`}</span>
          </div>);})}
      </div>);
    })()}

    {tab==="lista"&&!form&&agendaView==="semana"&&<AgendaSemana ordenada={ordenada} hoje={hoje} tipoClr={tipoClr} setForm={setForm}/>}
    {tab==="lista"&&!form&&agendaView==="mes"&&<AgendaMes ordenada={ordenada} hoje={hoje} tipoClr={tipoClr} setForm={setForm}/>}

    {tab==="lista"&&!form&&agendaView==="lista"&&(<div>
      {["prazo","audiencia","reuniao","tarefa","financeiro"].map(tipo=>{const evs=ordenada.filter(e=>e.tipo===tipo);if(!evs.length)return null;
        return(<div key={tipo} style={{marginBottom:20}}>
          <div style={{color:tipoClr[tipo],fontWeight:600,fontSize:14,marginBottom:8,textTransform:"capitalize"}}>{tipo==="audiencia"?"Audiências":tipo==="reuniao"?"Reuniões":tipo==="tarefa"?"Tarefas":tipo==="financeiro"?"Financeiro":"Prazos"}</div>
          <Card style={{padding:0,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>
              {evs.map(e=>{const adv=advs.find(a=>a.id===e.responsavel);return(
                <tr key={e.id} style={{borderBottom:`1px solid ${C.border}`}}>
                  <td style={{padding:"10px 16px",width:36}}><div style={{width:9,height:9,borderRadius:"50%",background:e.data<hoje?C.danger:e.data===hoje?C.warning:tipoClr[tipo],flexShrink:0,boxShadow:`0 0 6px ${e.data<hoje?C.danger:e.data===hoje?C.warning:tipoClr[tipo]}80`}}/></td>
                  <td style={{padding:"10px 8px",color:C.accent,fontWeight:700,fontSize:13,width:130}}>{fmtComDia(e.data)}</td>
                  <td style={{padding:"10px 8px",color:C.muted,fontSize:12,width:50}}>{e.hora}</td>
                  <td style={{padding:"10px 8px",color:C.text,fontSize:13}}>{e.titulo}{e.gcal&&<span style={{marginLeft:6,background:"#34a85322",color:"#34a853",borderRadius:5,padding:"1px 6px",fontSize:10,fontWeight:700}}>📅 GCal</span>}</td>
                  <td style={{padding:"10px 8px"}}>{adv&&<span style={{background:adv.cor+"22",color:adv.cor,borderRadius:6,padding:"2px 7px",fontSize:11}}>{adv.nome.split(" ")[0]}</span>}</td>
                  <td style={{padding:"10px 16px"}}><Btn label="Editar" small onClick={()=>setForm({...e})}/></td>
                </tr>);})}
            </tbody></table>
          </Card>
        </div>);})}
    </div>)}

    {tab==="lista"&&form&&(<Card>
      <div style={{color:C.text,fontWeight:600,marginBottom:14}}>{form._novo?"Novo Evento":"Editar Evento"}</div>
      <Grid cols="1fr 1fr 1fr" gap={14}>
        <Sel label="Tipo" value={form.tipo} onChange={v=>setForm(f=>({...f,tipo:v}))} options={["audiencia","prazo","reuniao","tarefa","financeiro"].map(x=>({value:x,label:x}))}/>
        <Inp label="Título" value={form.titulo} onChange={v=>setForm(f=>({...f,titulo:v}))} style={{gridColumn:"span 2"}}/>
        <Inp label="Data" type="date" value={form.data} onChange={v=>setForm(f=>({...f,data:v}))}/>
        <Inp label="Hora" type="time" value={form.hora} onChange={v=>setForm(f=>({...f,hora:v}))}/>
        <Sel label="Responsável" value={form.responsavel||""} onChange={v=>setForm(f=>({...f,responsavel:v}))} options={[{value:"",label:"Nenhum"},...advs.map(a=>({value:a.id,label:a.nome}))]}/>
        <Sel label="Processo" value={form.processoId||""} onChange={v=>setForm(f=>({...f,processoId:v}))} options={[{value:"",label:"Nenhum"},...processos.map(p=>({value:p.id,label:p.id}))]}/>
        <Inp label="Local" value={form.local||""} onChange={v=>setForm(f=>({...f,local:v}))} style={{gridColumn:"span 2"}}/>
        <Inp label="Obs" value={form.obs||""} onChange={v=>setForm(f=>({...f,obs:v}))} style={{gridColumn:"span 3"}}/>
      </Grid>
      {form.data&&<div style={{marginTop:10,color:C.muted,fontSize:12}}>📅 {fmtComDia(form.data)}</div>}
      <div style={{display:"flex",gap:10,marginTop:16}}><Btn label="Salvar" onClick={salvar}/><Btn label="Cancelar" onClick={()=>setForm(null)} color={C.border}/></div>
    </Card>)}

    {tab==="calculadora"&&(<Card style={{maxWidth:680}}>
      <div style={{color:C.text,fontWeight:600,marginBottom:16}}>Calculadora de Prazos</div>
      <Grid cols="1fr 1fr" gap={14}>
        <div>
          <Inp label="Marco inicial" type="date" value={calc.marco} onChange={v=>setCalc(c=>({...c,marco:v,resultado:null}))}/>
          {calc.marco&&<div style={{color:C.muted,fontSize:11,marginTop:4}}>{fmtComDia(calc.marco)}</div>}
        </div>
        <Inp label="Quantidade de dias" type="number" value={calc.qtd} onChange={v=>setCalc(c=>({...c,qtd:v,resultado:null}))}/>
        <Sel label="Tipo de contagem" value={calc.tipo} onChange={v=>setCalc(c=>({...c,tipo:v,resultado:null}))} options={[{value:"uteis",label:"Dias úteis (art. 219 CPC)"},{value:"corridos",label:"Dias corridos"}]}/>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          <label style={{color:C.muted,fontSize:12}}>Tribunal</label>
          <select value={calc.tribunal} onChange={e=>setCalc(c=>({...c,tribunal:e.target.value,resultado:null}))}
            style={{background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:C.text,fontSize:13,outline:"none"}}>
            <option value="">— Sem tribunal específico —</option>
            {TRIBUNAIS.map(t=>(<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
      </Grid>
      <Btn label="Calcular" onClick={calcular} style={{marginTop:16}}/>
      {calc.resultado&&(<div style={{marginTop:20,padding:16,background:C.inputBg,borderRadius:12,border:`1px solid ${C.accent}44`}}>
        <div style={{color:C.muted,fontSize:12}}>Vencimento:</div>
        <div style={{color:C.accent,fontSize:28,fontWeight:700,marginBottom:4}}>{fmtComDia(calc.resultado.data)}</div>
        <div style={{color:C.muted,fontSize:12,marginBottom:12}}>Marco: {fmtComDia(calc.marco)} +{calc.qtd} dias {calc.tipo}</div>
        {calc.tipo==="uteis"&&calc.resultado.desc.length>0&&(<div>
          <div style={{color:C.text,fontWeight:600,fontSize:13,marginBottom:8}}>Dias desconsiderados ({calc.resultado.desc.length}):</div>
          {calc.resultado.desc.map((d,i)=>{const fer=getFeriado(d.iso);const susp=getSuspensaoTribunal(d.iso,calc.tribunal);return(
            <div key={i} style={{padding:"8px 12px",background:C.card,borderRadius:8,marginBottom:6,border:`1px solid ${susp?C.warning:C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><span style={{color:C.text,fontWeight:600,fontSize:13}}>{fmtComDia(d.iso)}</span></div>
                {fer&&<Badge label={fer.tipo} color={fer.tipo==="nacional"?C.danger:fer.tipo==="estadual"?C.warning:C.accent}/>}
                {susp&&!fer&&<Badge label="Suspensão" color={C.warning}/>}
                {!fer&&!susp&&<Badge label="Fim de semana" color={C.muted}/>}
              </div>
              {fer&&<div style={{color:C.text,fontSize:12,marginTop:4}}>{fer.nome}<br/><span style={{color:C.muted,fontSize:11}}>{fer.fonte}</span></div>}
              {susp&&<div style={{color:C.warning,fontSize:12,marginTop:4}}>⚠️ {susp.motivo}</div>}
            </div>);})}
        </div>)}
      </div>)}
    </Card>)}
  </div>);
}

// ============================================================================
// SEÇÃO 19: COMPONENTE DE GRÁFICO — PIZZA E BARRAS
// ----------------------------------------------------------------------------
// PieChart({ slices, size }) — gráfico de pizza puro em SVG (sem biblioteca)
//   slices: [{ label, value, color }]
//   Renderiza fatias proporcionais com legenda lateral.
//
// O gráfico de barras (RelCaixa) é renderizado inline no componente Financeiro.
//
// BACKEND: Apenas visual. Os dados vêm do Relatório de Caixa (Seção 20).
// ============================================================================
// ── MINI GRÁFICO DE PIZZA SVG ────────────────────────────────────────────────
function PieChart({slices, size=160}){
  // slices: [{label, value, color}]
  const total = slices.reduce((s,x)=>s+x.value,0);
  if(total===0) return <div style={{color:C.muted,fontSize:12,textAlign:"center"}}>Sem dados</div>;
  let angle = -Math.PI/2;
  const cx=size/2, cy=size/2, r=size/2-8;
  const paths = slices.filter(s=>s.value>0).map(s=>{
    const sweep = (s.value/total)*2*Math.PI;
    const x1=cx+r*Math.cos(angle), y1=cy+r*Math.sin(angle);
    const x2=cx+r*Math.cos(angle+sweep), y2=cy+r*Math.sin(angle+sweep);
    const large=sweep>Math.PI?1:0;
    const path=`M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} Z`;
    angle+=sweep;
    return {path, color:s.color, label:s.label, pct:((s.value/total)*100).toFixed(1)};
  });
  return(
    <div style={{display:"flex",alignItems:"center",gap:20}}>
      <svg width={size} height={size} style={{flexShrink:0}}>
        {paths.map((p,i)=><path key={i} d={p.path} fill={p.color} stroke={C.bg} strokeWidth={2}/>)}
      </svg>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {paths.map((p,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:p.color,flexShrink:0}}/>
            <span style={{color:C.text,fontSize:12}}>{p.label}</span>
            <span style={{color:p.color,fontWeight:700,fontSize:12}}>{p.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SEÇÃO 20: RELATÓRIO DE CAIXA
// ----------------------------------------------------------------------------
// Componente modal fullscreen com análise financeira por período.
//
// FILTROS: data inicial e final (padrão: mês corrente)
//
// DADOS CONSOLIDADOS:
//   - Parcelas de contratos pagas no período
//   - Serviços avulsos pagos no período
//
// KPIs CALCULADOS:
//   - Total Bruto: soma de todos os recebimentos
//   - Caixa Escritório: % do total destinado ao escritório (configurável por contrato)
//   - Distribuído: soma dos rateios dos advogados
//   - Não distribuído: Bruto - Caixa - Distribuído
//
// GRÁFICOS: pizza e barras horizontais (alternáveis)
//
// RATEIO POR ADVOGADO:
//   Cada contrato/serviço define um array de rateios: [{ advId, perc }]
//   O relatório agrupa por advogado e soma os valores proporcionais.
//
// BACKEND — ENDPOINT SUGERIDO:
//   GET /api/financeiro/relatorio-caixa?de=2026-03-01&ate=2026-03-31
//   Response: {
//     totalBruto, totalCaixa, totalDistribuido, naoDistribuido,
//     porAdvogado: [{ advId, nome, ganhos, percentual }],
//     extrato: [{ data, tipo, clienteNome, valor, forma, caixaEsc, rateios }]
//   }
// ============================================================================
// ── FINANCEIRO — RELATÓRIO DE CAIXA ─────────────────────────────────────────
function RelCaixa({contratos,servicosAvulsos,advs,clientes,onClose}){
  const hoje=today();
  const [filtroIni, setFiltroIni] = useState(hoje.slice(0,7)+"-01");
  const [filtroFim, setFiltroFim] = useState(hoje);
  const [grafTipo, setGrafTipo] = useState("pizza"); // pizza | barras

  // Parcelas pagas no período
  const parcelas = contratos.flatMap(c=>c.parcelas.filter(p=>p.status==="paga"&&p.dataPag>=filtroIni&&p.dataPag<=filtroFim).map(p=>({
    tipo:"contrato", contId:c.id, clienteId:c.clienteId, valor:p.valor, data:p.dataPag, forma:p.forma,
    caixaEsc:c.caixaEsc||0, rateios:c.rateios||[],
  })));
  const avulsos = servicosAvulsos.filter(s=>s.status==="paga"&&s.data>=filtroIni&&s.data<=filtroFim).map(s=>({
    tipo:"avulso", contId:"Avulso", clienteId:s.clienteId, valor:s.valor, data:s.data, forma:s.forma,
    caixaEsc:s.caixaEsc||0, rateios:s.rateios||[],
  }));
  const todos = [...parcelas,...avulsos].sort((a,b)=>a.data.localeCompare(b.data));
  const totalBruto = todos.reduce((s,x)=>s+x.valor,0);
  const totalCaixa = todos.reduce((s,x)=>s+x.valor*(x.caixaEsc||0)/100,0);

  // Por advogado
  const porAdv = advs.map(adv=>{
    const ganhos = todos.reduce((s,x)=>{
      const r=(x.rateios||[]).find(r=>r.advId===adv.id);
      return s+(r?x.valor*(parseFloat(r.perc)||0)/100:0);
    },0);
    return {...adv, ganhos};
  }).filter(a=>a.ganhos>0);
  const totalDistrib = porAdv.reduce((s,a)=>s+a.ganhos,0);
  const naoDistrib = Math.max(0, totalBruto - totalCaixa - totalDistrib);

  // Slices do gráfico
  const pizzaSlices = [
    ...porAdv.map(a=>({label:a.nome.split(" ")[0]+" "+a.nome.split(" ").at(-1), value:a.ganhos, color:a.cor})),
    ...(totalCaixa>0?[{label:"Caixa Escritório", value:totalCaixa, color:C.warning}]:[]),
    ...(naoDistrib>0?[{label:"Não distribuído", value:naoDistrib, color:C.border}]:[]),
  ];

  const maxBar = Math.max(...porAdv.map(a=>a.ganhos), totalCaixa, 1);

  return(<div style={{position:"fixed",inset:0,background:"#000b",zIndex:2000,display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",padding:"30px 0"}}>
    <div style={{width:"min(920px,96vw)",background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{color:C.silver,fontWeight:600,fontSize:17,fontFamily:"'DM Serif Display',serif"}}>💼 Relatório de Caixa</div>
        <div style={{display:"flex",gap:8}}>
          <Btn label="🖨 Imprimir" small onClick={()=>window.print()} color={C.accent2}/>
          <Btn label="✕ Fechar" small onClick={onClose} color={C.border}/>
        </div>
      </div>
      {/* Filtro de período */}
      <Grid cols="1fr 1fr" gap={12} style={{marginBottom:20}}>
        <Inp label="De" type="date" value={filtroIni} onChange={setFiltroIni}/>
        <Inp label="Até" type="date" value={filtroFim} onChange={setFiltroFim}/>
      </Grid>
      {/* KPIs */}
      <Grid cols="repeat(4,1fr)" gap={12} style={{marginBottom:20}}>
        {[
          [`R$ ${totalBruto.toLocaleString("pt-BR",{minimumFractionDigits:2})}`,`Bruto (${todos.length} receb.)`,C.success],
          [`R$ ${totalCaixa.toLocaleString("pt-BR",{minimumFractionDigits:2})}`,"Caixa Escritório",C.warning],
          [`R$ ${totalDistrib.toLocaleString("pt-BR",{minimumFractionDigits:2})}`,"Distribuído (advogados)",C.accent],
          [`R$ ${naoDistrib.toLocaleString("pt-BR",{minimumFractionDigits:2})}`,"Não distribuído",C.muted],
        ].map(([v,l,cor])=>(
          <div key={l} style={{background:C.tableHead,borderRadius:12,padding:14,textAlign:"center"}}>
            <div style={{color:cor,fontWeight:700,fontSize:16}}>{v}</div>
            <div style={{color:C.muted,fontSize:11,marginTop:4}}>{l}</div>
          </div>
        ))}
      </Grid>
      {/* Gráfico */}
      <Card style={{marginBottom:20,padding:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{color:C.silver,fontWeight:600,fontSize:13,letterSpacing:"0.2px"}}>📊 Distribuição do Caixa</div>
          <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {[["pizza","🥧 Pizza"],["barras","📊 Barras"]].map(([v,l])=>(
              <button key={v} onClick={()=>setGrafTipo(v)} style={{padding:"6px 14px",background:grafTipo===v?C.accent+"28":"transparent",color:grafTipo===v?C.accent2:C.muted,border:"none",cursor:"pointer",fontSize:12,fontWeight:grafTipo===v?700:400}}>{l}</button>
            ))}
          </div>
        </div>
        {grafTipo==="pizza"&&(
          <div style={{display:"flex",justifyContent:"center",padding:"10px 0"}}>
            <PieChart slices={pizzaSlices} size={180}/>
          </div>
        )}
        {grafTipo==="barras"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[...porAdv.map(a=>({label:a.nome.split(" ")[0]+" "+a.nome.split(" ").at(-1),valor:a.ganhos,cor:a.cor})),
              ...(totalCaixa>0?[{label:"Caixa Escritório",valor:totalCaixa,cor:C.warning}]:[]),
            ].map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:140,color:item.cor,fontWeight:600,fontSize:13,flexShrink:0}}>{item.label}</div>
                <div style={{flex:1,background:C.barTrack,borderRadius:20,height:22,overflow:"hidden",position:"relative"}}>
                  <div style={{width:`${(item.valor/maxBar)*100}%`,background:item.cor,height:"100%",borderRadius:20,transition:"width .4s ease",minWidth:item.valor>0?4:0}}/>
                </div>
                <div style={{color:C.text,fontWeight:700,fontSize:13,width:130,textAlign:"right",flexShrink:0}}>
                  R$ {item.valor.toLocaleString("pt-BR",{minimumFractionDigits:2})}
                </div>
                <div style={{color:C.muted,fontSize:11,width:42,flexShrink:0}}>
                  {totalBruto>0?((item.valor/totalBruto)*100).toFixed(1):0}%
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {/* Divisão detalhada por advogado */}
      <Card style={{marginBottom:20,padding:16}}>
        <div style={{color:C.silver,fontWeight:600,marginBottom:14,fontSize:13,letterSpacing:"0.2px"}}>⚖️ Divisão por Advogado</div>
        {porAdv.length===0&&<div style={{color:C.muted,fontSize:13,fontStyle:"italic"}}>Nenhum rateio registrado no período.</div>}
        {porAdv.map(a=>{
          const perc=totalBruto>0?(a.ganhos/totalBruto*100).toFixed(1):0;
          return(<div key={a.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:140,color:a.cor,fontWeight:600,fontSize:13,flexShrink:0}}>{a.nome.split(" ")[0]+" "+a.nome.split(" ").at(-1)}</div>
            <div style={{flex:1,background:C.barTrack,borderRadius:20,height:8,overflow:"hidden"}}>
              <div style={{width:`${perc}%`,background:a.cor,height:"100%",borderRadius:20}}/>
            </div>
            <div style={{color:C.text,fontWeight:700,fontSize:13,width:130,textAlign:"right",flexShrink:0}}>R$ {a.ganhos.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
            <div style={{color:C.muted,fontSize:11,width:42,flexShrink:0}}>{perc}%</div>
          </div>);
        })}
        <div style={{marginTop:14,padding:"10px 14px",background:C.warning+"18",border:`1px solid ${C.warning}33`,borderRadius:8,display:"flex",justifyContent:"space-between"}}>
          <span style={{color:C.warning,fontWeight:600}}>💼 Caixa Escritório</span>
          <span style={{color:C.warning,fontWeight:700}}>R$ {totalCaixa.toLocaleString("pt-BR",{minimumFractionDigits:2})} ({totalBruto>0?(totalCaixa/totalBruto*100).toFixed(1):0}%)</span>
        </div>
      </Card>
      {/* Extrato detalhado */}
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,color:C.silver,fontWeight:600,fontSize:13,letterSpacing:"0.2px"}}>📋 Extrato Detalhado do Período</div>
        {todos.length===0&&<div style={{padding:20,color:C.muted,fontSize:13,fontStyle:"italic"}}>Nenhum recebimento no período selecionado.</div>}
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:C.tableHead}}>{["Data","Tipo","Cliente","Valor","Forma","Caixa Esc.","Advogados"].map(h=>(<th key={h} style={{color:C.muted,fontSize:10.5,padding:"10px 14px",textAlign:"left",fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>{h}</th>))}</tr></thead>
          <tbody>{todos.map((r,i)=>{
            const cli=clientes.find(c=>c.id===r.clienteId);
            const caixaVal=r.valor*(r.caixaEsc||0)/100;
            const rateioStr=(r.rateios||[]).map(rt=>{const adv=advs.find(a=>a.id===rt.advId);return`${adv?.nome?.split(" ")[0]||rt.advId}: R$${(r.valor*parseFloat(rt.perc||0)/100).toFixed(0)}`;}).join(", ");
            return(<tr key={i} style={{borderTop:`1px solid ${C.border}`}}>
              <td style={{padding:"10px 14px",color:C.muted,fontSize:12}}>{fmtComDia(r.data)}</td>
              <td style={{padding:"10px 14px"}}><Badge label={r.tipo} color={r.tipo==="contrato"?C.accent:C.accent2}/></td>
              <td style={{padding:"10px 14px",color:C.text,fontSize:12}}>{cli?.nome||"—"}</td>
              <td style={{padding:"10px 14px",color:C.success,fontWeight:700,fontSize:13}}>R$ {r.valor.toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
              <td style={{padding:"10px 14px",color:C.muted,fontSize:12}}>{r.forma}</td>
              <td style={{padding:"10px 14px",color:C.warning,fontSize:12}}>{r.caixaEsc>0?`${r.caixaEsc}% = R$${caixaVal.toFixed(0)}`:"—"}</td>
              <td style={{padding:"10px 14px",color:C.muted,fontSize:11}}>{rateioStr||"—"}</td>
            </tr>);
          })}</tbody>
          {todos.length>0&&(<tfoot>
            <tr style={{background:C.tableHead,borderTop:`2px solid ${C.border}`}}>
              <td colSpan={3} style={{padding:"12px 14px",color:C.text,fontWeight:600}}>TOTAL</td>
              <td style={{padding:"12px 14px",color:C.success,fontWeight:700}}>R$ {totalBruto.toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
              <td/>
              <td style={{padding:"12px 14px",color:C.warning,fontWeight:700}}>R$ {totalCaixa.toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
              <td/>
            </tr>
          </tfoot>)}
        </table>
      </Card>
    </div>
  </div>);
}

// ============================================================================
// SEÇÃO 21: MÓDULO FINANCEIRO
// ----------------------------------------------------------------------------
// Gerencia contratos de honorários e serviços avulsos.
//
// CONTRATOS DE HONORÁRIOS:
//   - Vinculados a um cliente e opcionalmente a um processo
//   - Total, entrada, número de parcelas, data do 1º vencimento
//   - Parcelas geradas automaticamente com vencimentos mensais consecutivos
//   - Status de parcela: aberta | paga | atrasada | renegociada | cancelada
//   - "Dar baixa" registra: data de pagamento, forma, banco, conta, comprovante
//   - % do caixa escritório configurável por contrato
//   - Rateio entre advogados: array [{ advId, perc }]
//
// SERVIÇOS AVULSOS:
//   - Pagamento único (à vista)
//   - Mesmos campos de rateio e caixa do contrato
//
// REGRA DE INADIMPLÊNCIA:
//   Parcela com venc < hoje e status "aberta" → exibida em vermelho (atrasada)
//
// BACKEND — ENDPOINTS SUGERIDOS:
//   GET    /api/contratos              → lista
//   POST   /api/contratos              → criar (gera parcelas automaticamente)
//   PUT    /api/contratos/{id}/parcelas/{n}/baixa → dar baixa em parcela
//   GET    /api/servicos-avulsos       → lista
//   POST   /api/servicos-avulsos       → criar
//   PUT    /api/servicos-avulsos/{id}/baixa → marcar como pago
//
// VALIDAÇÕES BACKEND:
//   - Não permitir baixa dupla na mesma parcela
//   - Calcular status de inadimplência no servidor (não confiar no frontend)
// ============================================================================
// ── FINANCEIRO ────────────────────────────────────────────────────────────────
function Financeiro({contratos,setContratos,clientes,processos,advs,servicosAvulsos,setServicosAvulsos}){
  const[view,setView]=useState(null);
  const[form,setForm]=useState(null);
  const[baixaForm,setBaixaForm]=useState(null);
  const[tabFin,setTabFin]=useState("contratos");
  const[showRel,setShowRel]=useState(false);
  const hoje=today();

  function salvar(){
    if(!form.clienteId||!form.total)return alert("Cliente e valor total obrigatórios.");
    const total=parseFloat(form.total)||0,nP=parseInt(form.nParc)||1,ent=parseFloat(form.entrada)||0;
    const valP=(total-ent)/nP,db=form.venc1||hoje;
    const parcelas=Array.from({length:nP},(_,i)=>{const d=new Date(db+"T12:00:00");d.setMonth(d.getMonth()+i);return{n:i+1,venc:d.toISOString().split("T")[0],valor:Math.round(valP*100)/100,status:"aberta",dataPag:"",forma:"",banco:"",conta:"",comp:""};});
    const id=`${form.clienteId}-${String.fromCharCode(65+contratos.filter(c=>c.clienteId===form.clienteId).length)}`;
    setContratos(c=>[...c,{id,clienteId:form.clienteId,processoId:form.processoId||"",objeto:form.objeto||"",total,entrada:ent,caixaEsc:parseFloat(form.caixaEsc)||0,rateios:form.rateios||[],parcelas}]);
    setForm(null);
  }
  function salvarAvulso(){
    if(!form.clienteId||!form.valor)return alert("Cliente e valor obrigatórios.");
    const novo={id:Date.now(),clienteId:form.clienteId,descricao:form.descricao||"Serviço avulso",valor:parseFloat(form.valor)||0,data:form.data||hoje,forma:form.forma||"Pix",banco:form.banco||"",status:"aberta",rateios:form.rateios||[],caixaEsc:parseFloat(form.caixaEsc)||0};
    setServicosAvulsos(s=>[...s,novo]);setForm(null);
  }
  function baixar(){
    if(!baixaForm.forma)return alert("Informe a forma.");
    setContratos(cs=>cs.map(c=>c.id!==baixaForm.cid?c:{...c,parcelas:c.parcelas.map(p=>p.n!==baixaForm.n?p:{...p,status:"paga",dataPag:baixaForm.data||hoje,forma:baixaForm.forma,banco:baixaForm.banco,conta:baixaForm.conta,comp:baixaForm.comp})}));
    setBaixaForm(null);
  }

  const contrato=view?contratos.find(f=>f.id===view):null;
  const cli=contrato?clientes.find(c=>c.id===contrato.clienteId):null;
  const tRec=contratos.reduce((s,c)=>s+c.parcelas.filter(p=>p.status==="aberta").reduce((a,p)=>a+p.valor,0),0);
  const tAtr=contratos.reduce((s,c)=>s+c.parcelas.filter(p=>p.status==="atrasada"||(p.venc<hoje&&p.status==="aberta")).reduce((a,p)=>a+p.valor,0),0);
  const tRcb=contratos.reduce((s,c)=>s+c.parcelas.filter(p=>p.status==="paga").reduce((a,p)=>a+p.valor,0),0);
  const tAvPago=servicosAvulsos.filter(s=>s.status==="paga").reduce((a,s)=>a+s.valor,0);
  const tCaixaEsc=contratos.reduce((s,c)=>s+(parseFloat(c.caixaEsc||0)/100)*c.parcelas.filter(p=>p.status==="paga").reduce((a,p)=>a+p.valor,0),0)
    +servicosAvulsos.filter(s=>s.status==="paga").reduce((a,s)=>a+(parseFloat(s.caixaEsc||0)/100)*s.valor,0);

  const RateioEditor = ({rateios,onChange,total}) => (<div style={{gridColumn:"span 3"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <div style={{color:C.text,fontWeight:600,fontSize:13}}>⚖️ Divisão entre Advogados</div>
      <Btn label="+ Adicionar advogado" small color={C.accent2} onClick={()=>onChange([...(rateios||[]),{advId:"",perc:""}])}/>
    </div>
    {(rateios||[]).map((r,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-end"}}>
      <Sel label={i===0?"Advogado":""} value={r.advId} onChange={v=>onChange(rateios.map((x,j)=>j===i?{...x,advId:v}:x))} options={[{value:"",label:"Selecione..."},...advs.map(a=>({value:a.id,label:a.nome}))]} style={{flex:2}}/>
      <Inp label={i===0?"% participação":""} type="number" value={r.perc} onChange={v=>onChange(rateios.map((x,j)=>j===i?{...x,perc:v}:x))} style={{flex:1}}/>
      {total>0&&r.perc>0&&(<div style={{color:C.accent,fontSize:12,paddingBottom:10}}>R$ {(parseFloat(total||0)*parseFloat(r.perc||0)/100).toFixed(2)}</div>)}
      <Btn label="✕" small color={C.danger} onClick={()=>onChange(rateios.filter((_,j)=>j!==i))} style={{marginBottom:0}}/>
    </div>))}
    {(rateios||[]).length>0&&(<div style={{color:C.success,fontSize:12,marginTop:4}}>
      Total: {((rateios||[]).reduce((s,r)=>s+parseFloat(r.perc||0),0)).toFixed(1)}% (excluindo caixa)
    </div>)}
  </div>);

  if(showRel)return(<RelCaixa contratos={contratos} servicosAvulsos={servicosAvulsos} advs={advs} clientes={clientes} onClose={()=>setShowRel(false)}/>);

  if(form&&form._tipo==="avulso")return(<div>
    <div style={{display:"flex",gap:10,marginBottom:20}}><Btn label="← Voltar" onClick={()=>setForm(null)} color={C.border}/><h2 style={{color:C.text,margin:0,fontFamily:"\'DM Serif Display\',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>Novo Serviço Avulso / À Vista</h2></div>
    <Card>
      <Grid cols="1fr 1fr 1fr" gap={14}>
        <Sel label="Cliente" value={form.clienteId||""} onChange={v=>setForm(f=>({...f,clienteId:v}))} style={{gridColumn:"span 2"}} options={[{value:"",label:"Selecione..."},...clientes.map(c=>({value:c.id,label:`${c.id} — ${c.nome}`}))]}/>
        <Inp label="Data" type="date" value={form.data||hoje} onChange={v=>setForm(f=>({...f,data:v}))}/>
        <Inp label="Descrição do serviço" value={form.descricao||""} onChange={v=>setForm(f=>({...f,descricao:v}))} style={{gridColumn:"span 3"}}/>
        <Inp label="Valor (R$)" type="number" value={form.valor||""} onChange={v=>setForm(f=>({...f,valor:v}))}/>
        <Sel label="Forma de Pagamento" value={form.forma||"Pix"} onChange={v=>setForm(f=>({...f,forma:v}))} options={FORMAS_PAG.map(x=>({value:x,label:x}))}/>
        <Inp label="% caixa escritório" type="number" value={form.caixaEsc||""} onChange={v=>setForm(f=>({...f,caixaEsc:v}))}/>
        <RateioEditor rateios={form.rateios||[]} onChange={v=>setForm(f=>({...f,rateios:v}))} total={parseFloat(form.valor||0)}/>
      </Grid>
      <div style={{marginTop:20,display:"flex",gap:10}}><Btn label="Salvar Serviço" onClick={salvarAvulso}/><Btn label="Cancelar" onClick={()=>setForm(null)} color={C.border}/></div>
    </Card>
  </div>);

  if(form)return(<div>
    <div style={{display:"flex",gap:10,marginBottom:20}}><Btn label="← Voltar" onClick={()=>setForm(null)} color={C.border}/><h2 style={{color:C.text,margin:0,fontFamily:"\'DM Serif Display\',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>Novo Contrato de Honorários</h2></div>
    <Card>
      <Grid cols="1fr 1fr 1fr" gap={14}>
        <Sel label="Cliente" value={form.clienteId||""} onChange={v=>setForm(f=>({...f,clienteId:v}))} style={{gridColumn:"span 2"}} options={[{value:"",label:"Selecione..."},...clientes.map(c=>({value:c.id,label:`${c.id} — ${c.nome}`}))]}/>
        <Sel label="Processo (opcional)" value={form.processoId||""} onChange={v=>setForm(f=>({...f,processoId:v}))} options={[{value:"",label:"Nenhum"},...processos.filter(p=>!form.clienteId||p.clienteId===form.clienteId).map(p=>({value:p.id,label:p.id}))]}/>
        <Inp label="Objeto" value={form.objeto||""} onChange={v=>setForm(f=>({...f,objeto:v}))} style={{gridColumn:"span 3"}}/>
        <Inp label="Valor Total (R$)" type="number" value={form.total||""} onChange={v=>setForm(f=>({...f,total:v}))}/>
        <Inp label="Entrada (R$)" type="number" value={form.entrada||""} onChange={v=>setForm(f=>({...f,entrada:v}))}/>
        <Inp label="Nº Parcelas" type="number" value={form.nParc||""} onChange={v=>setForm(f=>({...f,nParc:v}))}/>
        <Inp label="Vencimento 1ª Parcela" type="date" value={form.venc1||""} onChange={v=>setForm(f=>({...f,venc1:v}))}/>
        <Inp label="% caixa escritório" type="number" value={form.caixaEsc||""} onChange={v=>setForm(f=>({...f,caixaEsc:v}))} style={{gridColumn:"span 2"}}/>
        <RateioEditor rateios={form.rateios||[]} onChange={v=>setForm(f=>({...f,rateios:v}))} total={parseFloat(form.total||0)}/>
      </Grid>
      <div style={{marginTop:20,display:"flex",gap:10}}><Btn label="Gerar Contrato" onClick={salvar}/><Btn label="Cancelar" onClick={()=>setForm(null)} color={C.border}/></div>
    </Card>
  </div>);

  if(view&&contrato)return(<div>
    <div style={{display:"flex",gap:10,marginBottom:20}}><Btn label="← Voltar" onClick={()=>setView(null)} color={C.border}/></div>
    <Card style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div><div style={{color:C.muted,fontSize:11}}>Contrato</div><div style={{color:C.accent,fontWeight:700}}>{contrato.id}</div></div>
        <div><div style={{color:C.muted,fontSize:11}}>Cliente</div><div style={{color:C.text,fontWeight:600}}>{cli?.nome}</div></div>
        <div><div style={{color:C.muted,fontSize:11}}>Objeto</div><div style={{color:C.muted,fontSize:12}}>{contrato.objeto||"—"}</div></div>
        <div><div style={{color:C.muted,fontSize:11}}>Total</div><div style={{color:C.success,fontWeight:700}}>R$ {contrato.total.toLocaleString("pt-BR")}</div></div>
        <div><div style={{color:C.muted,fontSize:11}}>Caixa Esc.</div><div style={{color:C.warning}}>{contrato.caixaEsc||0}%</div></div>
      </div>
      {(contrato.rateios||[]).length>0&&(<div style={{marginTop:12}}>
        <div style={{color:C.muted,fontSize:11,marginBottom:6}}>Rateio:</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {contrato.rateios.map((r,i)=>{const adv=advs.find(a=>a.id===r.advId);return(<Badge key={i} label={`${adv?.nome?.split(" ")[0]||r.advId}: ${r.perc}%`} color={adv?.cor||C.accent}/>);})}
        </div>
      </div>)}
    </Card>
    <Card style={{padding:0,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:C.tableHead}}>{["Parc.","Venc.","Valor","Status","Pagamento","Forma","Banco",""].map(h=>(<th key={h} style={{color:C.muted,fontSize:10.5,padding:"10px 12px",textAlign:"left",fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>{h}</th>))}</tr></thead>
        <tbody>{contrato.parcelas.map(p=>(<tr key={p.n} style={{borderTop:`1px solid ${C.border}`}}>
          <td style={{padding:"10px 12px",color:C.muted,fontSize:13}}>#{p.n}</td>
          <td style={{padding:"10px 12px",color:p.venc<hoje&&p.status==="aberta"?C.danger:C.text,fontSize:13}}>{fmtComDia(p.venc)}</td>
          <td style={{padding:"10px 12px",color:C.text,fontSize:13}}>R$ {p.valor.toLocaleString("pt-BR")}</td>
          <td style={{padding:"10px 12px"}}><Badge label={p.status} color={parcClr[p.status]||C.muted}/></td>
          <td style={{padding:"10px 12px",color:C.muted,fontSize:12}}>{p.dataPag?fmtComDia(p.dataPag):"—"}</td>
          <td style={{padding:"10px 12px",color:C.muted,fontSize:12}}>{p.forma||"—"}</td>
          <td style={{padding:"10px 12px",color:C.muted,fontSize:12}}>{p.banco||"—"}</td>
          <td style={{padding:"10px 12px"}}>{p.status!=="paga"&&<Btn label="Baixar" small onClick={()=>setBaixaForm({cid:contrato.id,n:p.n,data:hoje,forma:"Pix",banco:"NuBank",conta:"",comp:""})}/>}</td>
        </tr>))}</tbody>
      </table>
    </Card>
    {baixaForm&&(<Card style={{marginTop:16}}>
      <div style={{color:C.text,fontWeight:600,marginBottom:12}}>Dar Baixa — Parcela #{baixaForm.n}</div>
      <Grid cols="1fr 1fr 1fr" gap={12}>
        <Inp label="Data do Pagamento" type="date" value={baixaForm.data} onChange={v=>setBaixaForm(f=>({...f,data:v}))}/>
        <Sel label="Forma de Pagamento" value={baixaForm.forma} onChange={v=>setBaixaForm(f=>({...f,forma:v}))} options={FORMAS_PAG.map(x=>({value:x,label:x}))}/>
        <Sel label="Banco" value={baixaForm.banco} onChange={v=>setBaixaForm(f=>({...f,banco:v}))} options={BANCOS.map(x=>({value:x,label:x}))}/>
        <Inp label="Conta / Identificação" value={baixaForm.conta||""} onChange={v=>setBaixaForm(f=>({...f,conta:v}))}/>
        <Inp label="Comprovante / TxID" value={baixaForm.comp||""} onChange={v=>setBaixaForm(f=>({...f,comp:v}))} style={{gridColumn:"span 2"}}/>
      </Grid>
      <div style={{display:"flex",gap:10,marginTop:12}}>
        <Btn label="Confirmar Baixa" onClick={baixar} color={C.success}/>
        <Btn label="Cancelar" onClick={()=>setBaixaForm(null)} color={C.border}/>
      </div>
    </Card>)}
  </div>);

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h2 style={{color:C.text,margin:0,fontFamily:"\'DM Serif Display\',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>Financeiro</h2>
      <div style={{display:"flex",gap:8}}>
        <Btn label="📊 Relatório de Caixa" onClick={()=>setShowRel(true)} color={C.warning}/>
        <Btn label="+ Serviço Avulso" onClick={()=>setForm({_tipo:"avulso",clienteId:"",descricao:"",valor:"",data:hoje,forma:"Pix",banco:"NuBank",rateios:[],caixaEsc:""})} color={C.accent2}/>
        <Btn label="+ Novo Contrato" onClick={()=>setForm({clienteId:"",processoId:"",objeto:"",total:"",entrada:"",nParc:"",venc1:"",rateios:[],caixaEsc:""})}/>
      </div>
    </div>
    <Grid cols="repeat(5,1fr)" gap={12} style={{marginBottom:16}}>
      {[["Recebido",tRcb,C.success],["A Receber",tRec,C.accent],["Vencido",tAtr,C.danger],["Avulsos Recebidos",tAvPago,C.accent2],["Caixa Escritório",tCaixaEsc,C.warning]].map(([l,v,cor])=>(<Card key={l} style={{textAlign:"center",padding:14}}><div style={{color:cor,fontSize:20,fontWeight:700}}>R$ {v.toLocaleString("pt-BR",{minimumFractionDigits:0})}</div><div style={{color:C.muted,fontSize:11,marginTop:4}}>{l}</div></Card>))}
    </Grid>
    <div style={{display:"flex",gap:8,marginBottom:16}}>
      {[["contratos","📋 Contratos"],["avulsos","💳 Serviços Avulsos"]].map(([v,l])=>(<Btn key={v} label={l} onClick={()=>setTabFin(v)} color={tabFin===v?C.accent:C.border}/>))}
    </div>
    {tabFin==="avulsos"&&(<Card style={{padding:0,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:C.tableHead}}>{["Data","Cliente","Descrição","Valor","Forma","Status",""].map(h=>(<th key={h} style={{color:C.muted,fontSize:10.5,padding:"10px 12px",textAlign:"left",fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>{h}</th>))}</tr></thead>
        <tbody>{servicosAvulsos.map(s=>{const cl=clientes.find(x=>x.id===s.clienteId);return(
          <tr key={s.id} style={{borderTop:`1px solid ${C.border}`}}>
            <td style={{padding:"10px 12px",color:C.muted,fontSize:12}}>{fmtComDia(s.data)}</td>
            <td style={{padding:"10px 12px",color:C.text,fontSize:13}}>{cl?.nome||"—"}</td>
            <td style={{padding:"10px 12px",color:C.muted,fontSize:12}}>{s.descricao}</td>
            <td style={{padding:"10px 12px",color:C.success,fontWeight:700,fontSize:13}}>R$ {s.valor.toLocaleString("pt-BR")}</td>
            <td style={{padding:"10px 12px",color:C.muted,fontSize:12}}>{s.forma}</td>
            <td style={{padding:"10px 12px"}}><Badge label={s.status} color={s.status==="paga"?C.success:C.accent}/></td>
            <td style={{padding:"10px 12px"}}>{s.status!=="paga"&&<Btn label="✓ Baixar" small color={C.success} onClick={()=>setServicosAvulsos(list=>list.map(x=>x.id===s.id?{...x,status:"paga"}:x))}/>}</td>
          </tr>);})}
        </tbody>
      </table>
    </Card>)}
    {tabFin==="contratos"&&(<Card style={{padding:0,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:C.tableHead}}>{["Contrato","Cliente","Objeto","Total","Parcelas","Situação",""].map(h=>(<th key={h} style={{color:C.muted,fontSize:10.5,padding:"12px 16px",textAlign:"left",fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>{h}</th>))}</tr></thead>
        <tbody>{contratos.map(c=>{const cl=clientes.find(x=>x.id===c.clienteId);const pagas=c.parcelas.filter(p=>p.status==="paga").length;const atras=c.parcelas.filter(p=>p.venc<hoje&&p.status==="aberta").length;return(
          <tr key={c.id} style={{borderTop:`1px solid ${C.border}`,transition:"background .15s"}} onMouseEnter={e=>e.currentTarget.style.background=C.glass} onMouseLeave={e=>e.currentTarget.style.background=""}>
            <td style={{padding:"12px 16px",color:C.accent,fontWeight:700,fontSize:13}}>{c.id}</td>
            <td style={{padding:"12px 16px",color:C.text,fontSize:13}}>{cl?.nome}</td>
            <td style={{padding:"12px 16px",color:C.muted,fontSize:12,maxWidth:140}}>{(c.objeto||"—").slice(0,35)}</td>
            <td style={{padding:"12px 16px",color:C.text,fontSize:13}}>R$ {c.total.toLocaleString("pt-BR")}</td>
            <td style={{padding:"12px 16px",color:C.muted,fontSize:12}}>{pagas}/{c.parcelas.length}</td>
            <td style={{padding:"12px 16px"}}>{atras>0?<Badge label={`${atras} atrasada(s)`} color={C.danger}/>:<Badge label="Em dia" color={C.success}/>}</td>
            <td style={{padding:"12px 16px"}}><Btn label="Ver" small onClick={()=>setView(c.id)}/></td>
          </tr>);})}
        </tbody>
      </table>
    </Card>)}
  </div>);
}

// ============================================================================
// SEÇÃO 22: MÓDULO DE COLABORADORES
// ----------------------------------------------------------------------------
// Cadastro e visão geral dos advogados e colaboradores do escritório.
//
// PERFIS: Administrador | Advogado | Colaborador | Estagiário
//
// CARD DE CADA ADVOGADO exibe:
//   - Processos ativos sob responsabilidade
//   - Total de horas no timesheet (calculado dos andamentos)
//   - Prazos e audiências nos próximos 7 dias
//
// BACKEND — ENDPOINTS SUGERIDOS:
//   GET    /api/colaboradores          → lista
//   POST   /api/colaboradores          → criar (criar também usuário para login)
//   PUT    /api/colaboradores/{id}     → editar
//   GET    /api/colaboradores/{id}/dashboard → KPIs individuais
//
// AUTENTICAÇÃO: cada colaborador deve ter login/senha para acessar o sistema.
//   Sugestão: ao criar colaborador, disparar e-mail de convite com link de cadastro de senha.
// ============================================================================
// ── AVATAR ────────────────────────────────────────────────────────────────────
function Avatar({adv,size=44,uploadable=false,onUpload}){
  const ref=useRef();
  const initials=(adv.nome||"?").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase();
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      {adv.foto
        ?<img src={adv.foto} alt={adv.nome} style={{width:size,height:size,borderRadius:10,objectFit:"cover",border:`2px solid ${adv.cor}55`}}/>
        :<div style={{width:size,height:size,borderRadius:10,background:`linear-gradient(135deg,${adv.cor}cc,${adv.cor}55)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:700,color:"#fff",border:`2px solid ${adv.cor}44`}}>{initials}</div>}
      {uploadable&&<>
        <div onClick={()=>ref.current?.click()} style={{position:"absolute",inset:0,borderRadius:10,background:"rgba(0,0,0,0)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"background .2s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,0,0,0.45)";e.currentTarget.querySelector("span").style.opacity=1}}
          onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,0,0,0)";e.currentTarget.querySelector("span").style.opacity=0}}>
          <span style={{color:"#fff",fontSize:10,fontWeight:700,opacity:0,transition:"opacity .2s",textAlign:"center",lineHeight:1.3}}>📷<br/>Foto</span>
        </div>
        <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
          const f=e.target.files?.[0];if(!f)return;
          const r=new FileReader();r.onload=ev=>onUpload&&onUpload(ev.target.result);r.readAsDataURL(f);
        }}/>
      </>}
    </div>);
}

// ── COLABORADORES ─────────────────────────────────────────────────────────────
function Colaboradores({advs,setAdvs,processos,agenda,andamentos}){
  const[form,setForm]=useState(null);
  const[tsAdv,setTsAdv]=useState(null);
  const[tsPeriodo,setTsPeriodo]=useState("mes");
  const hoje=today();
  const em7=new Date();em7.setDate(em7.getDate()+7);const em7s=em7.toISOString().split("T")[0];
  const cores=["#4f8ef7","#6c63ff","#34d399","#fbbf24","#f87171","#fb923c","#a78bfa"];

  function salvar(){
    if(!form.nome||!form.oab)return alert("Nome e OAB obrigatórios.");
    const id=form._novo?`ADV${String(advs.length+1).padStart(3,"0")}`:form.id;
    if(form._novo)setAdvs(a=>[...a,{...form,id,_novo:undefined}]);
    else setAdvs(a=>a.map(x=>x.id===form.id?{...form,_novo:undefined}:x));
    setForm(null);
  }
  function setFoto(advId,url){setAdvs(a=>a.map(x=>x.id===advId?{...x,foto:url}:x));}

  const periodos=[["dia","Hoje"],["semana","Semana"],["mes","Mês"],["trimestre","Trimestre"],["semestre","Semestre"],["ano","Ano"]];

  function getIni(periodo){
    const n=new Date(hoje+"T12:00:00");
    if(periodo==="dia")return hoje;
    if(periodo==="semana"){n.setDate(n.getDate()-6);return n.toISOString().split("T")[0];}
    if(periodo==="mes"){n.setDate(1);return n.toISOString().split("T")[0];}
    if(periodo==="trimestre"){n.setMonth(n.getMonth()-3);return n.toISOString().split("T")[0];}
    if(periodo==="semestre"){n.setMonth(n.getMonth()-6);return n.toISOString().split("T")[0];}
    if(periodo==="ano"){return `${n.getFullYear()}-01-01`;}
    return hoje;
  }

  // ── TIMESHEET DETALHADO ──────────────────────────────────────────────────
  if(tsAdv){
    const a=advs.find(x=>x.id===tsAdv);
    const ini=getIni(tsPeriodo);
    const ands=andamentos.filter(x=>x.usuario===tsAdv&&x.data>=ini&&x.data<=hoje);
    const totalMins=ands.reduce((s,x)=>s+(x.horas||0)*60+(x.minutos||0),0);
    const diasSet={};ands.forEach(x=>diasSet[x.data]=(diasSet[x.data]||0)+(x.horas||0)*60+(x.minutos||0));
    const diasOrdenados=Object.keys(diasSet).sort();
    const maxDiaMins=Math.max(...Object.values(diasSet),1);
    const procSet={};ands.forEach(x=>procSet[x.processoId]=(procSet[x.processoId]||0)+(x.horas||0)*60+(x.minutos||0));
    const maxProcMins=Math.max(...Object.values(procSet),1);

    return(<div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <Btn label="← Voltar" onClick={()=>setTsAdv(null)} color={C.border}/>
        <Avatar adv={a} size={40}/>
        <div><div style={{color:a.cor,fontWeight:700,fontSize:16}}>{a.nome}</div><div style={{color:C.muted,fontSize:12}}>{a.oab} · {a.perfil}</div></div>
        <div style={{marginLeft:"auto",display:"flex",gap:2,background:C.cardHi,borderRadius:20,padding:3,border:`1px solid ${C.border}`,flexWrap:"wrap"}}>
          {periodos.map(([v,l])=>(<button key={v} onClick={()=>setTsPeriodo(v)} style={{padding:"5px 11px",borderRadius:16,background:tsPeriodo===v?a.cor:"transparent",color:tsPeriodo===v?"#fff":C.muted,border:"none",cursor:"pointer",fontSize:11,fontWeight:tsPeriodo===v?700:400,transition:"all .15s"}}>{l}</button>))}
        </div>
      </div>

      <Grid cols="repeat(4,1fr)" gap={12} style={{marginBottom:20}}>
        {[["⏱",fmtHoras(Math.floor(totalMins/60),totalMins%60),"Total",a.cor],["📄",ands.filter(x=>x.tipoPeca).length,"Peças",C.accent2],["⚖️",ands.length,"Andamentos",C.success],["📅",Object.keys(diasSet).length,"Dias trabalhados",C.warning]].map(([ic,v,l,cor])=>(
          <Card key={l} style={{textAlign:"center",padding:14,border:`1px solid ${cor}22`}}>
            <div style={{fontSize:18,marginBottom:2}}>{ic}</div>
            <div style={{color:cor,fontSize:20,fontWeight:800}}>{v}</div>
            <div style={{color:C.muted,fontSize:10,marginTop:3,textTransform:"uppercase",letterSpacing:"0.4px"}}>{l}</div>
          </Card>
        ))}
      </Grid>

      <Grid cols="1fr 1fr" gap={16} style={{marginBottom:16}}>
        <Card>
          <div style={{color:C.text,fontWeight:700,fontSize:13,marginBottom:14}}>⏱ Horas por dia</div>
          {diasOrdenados.length===0&&<div style={{color:C.muted,fontSize:12,fontStyle:"italic"}}>Nenhum registro no período.</div>}
          {diasOrdenados.map(d=>{const m=diasSet[d];const pct=Math.max(4,(m/maxDiaMins)*100);return(<div key={d} style={{marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{color:C.silver,fontSize:11}}>{fmtComDia(d)}</span>
              <span style={{color:a.cor,fontSize:11,fontWeight:700}}>{fmtHoras(Math.floor(m/60),m%60)}</span>
            </div>
            <div style={{background:C.border,borderRadius:20,height:6}}><div style={{width:`${pct}%`,background:a.cor,height:"100%",borderRadius:20}}/></div>
          </div>);})}
        </Card>
        <Card>
          <div style={{color:C.text,fontWeight:700,fontSize:13,marginBottom:14}}>⚖️ Horas por processo</div>
          {Object.keys(procSet).length===0&&<div style={{color:C.muted,fontSize:12,fontStyle:"italic"}}>Nenhum registro no período.</div>}
          {Object.entries(procSet).sort((a,b)=>b[1]-a[1]).map(([pid,m])=>{
            const proc=processos.find(p=>p.id===pid);
            return(<div key={pid} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <div><span style={{color:C.accent,fontSize:11,fontWeight:700}}>{pid}</span>{proc&&<span style={{color:C.muted,fontSize:10}}> · {proc.classe}</span>}</div>
                <span style={{color:C.warning,fontSize:11,fontWeight:700}}>{fmtHoras(Math.floor(m/60),m%60)}</span>
              </div>
              <div style={{background:C.border,borderRadius:20,height:6}}><div style={{width:`${Math.max(4,(m/maxProcMins)*100)}%`,background:C.warning,height:"100%",borderRadius:20}}/></div>
            </div>);
          })}
        </Card>
      </Grid>

      <Card>
        <div style={{color:C.text,fontWeight:700,fontSize:13,marginBottom:12}}>📋 Registros detalhados</div>
        {ands.length===0&&<div style={{color:C.muted,fontSize:13,fontStyle:"italic"}}>Sem andamentos no período.</div>}
        {[...ands].sort((a,b)=>b.data.localeCompare(a.data)).map(x=>{
          const proc=processos.find(p=>p.id===x.processoId);
          return(<div key={x.id} style={{borderBottom:`1px solid ${C.border}`,padding:"10px 0",display:"grid",gridTemplateColumns:"130px 70px 1fr auto",gap:10,alignItems:"start"}}>
            <span style={{color:C.muted,fontSize:11}}>{fmtComDia(x.data)}</span>
            <span style={{color:C.warning,fontWeight:700,fontSize:12}}>{fmtHoras(x.horas||0,x.minutos||0)}</span>
            <div>
              <div style={{color:C.text,fontSize:12}}>{x.descricao}</div>
              <div style={{color:C.muted,fontSize:10}}>{x.processoId}{proc?` · ${proc.classe}`:""}</div>
            </div>
            {x.tipoPeca&&<Badge label={x.tipoPeca} color={C.accent2}/>}
          </div>);
        })}
      </Card>
    </div>);
  }

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h2 style={{color:C.text,margin:0,fontFamily:"'DM Serif Display',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>Advogados & Colaboradores</h2>
      <Btn label="+ Novo Colaborador" onClick={()=>setForm({_novo:true,nome:"",oab:"",email:"",tel:"",perfil:"Colaborador",cor:cores[advs.length%cores.length],foto:null})}/>
    </div>

    {form&&(<Card style={{marginBottom:20}}>
      {/* Foto */}
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:18,padding:14,background:C.cardHi,borderRadius:12,border:`1px solid ${C.border}`}}>
        <Avatar adv={form} size={68} uploadable onUpload={url=>setForm(f=>({...f,foto:url}))}/>
        <div style={{flex:1}}>
          <div style={{color:C.silver,fontWeight:600,fontSize:13,marginBottom:3}}>Foto de identificação (3×4)</div>
          <div style={{color:C.muted,fontSize:11,marginBottom:8}}>Clique na imagem para fazer upload · JPG/PNG · proporção 3×4 recomendada</div>
          {form.foto&&<Btn label="🗑 Remover" onClick={()=>setForm(f=>({...f,foto:null}))} small color={C.danger}/>}
        </div>
        <div>
          <div style={{color:C.muted,fontSize:11,marginBottom:6}}>Cor no sistema</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",maxWidth:130}}>
            {cores.map(c=>(<button key={c} onClick={()=>setForm(f=>({...f,cor:c}))} style={{width:22,height:22,borderRadius:6,background:c,border:`3px solid ${form.cor===c?"#fff":"transparent"}`,cursor:"pointer",boxShadow:form.cor===c?`0 0 0 2px ${c}88`:"none"}}/>))}
          </div>
        </div>
      </div>
      <Grid cols="1fr 1fr 1fr" gap={14}>
        <Inp label="Nome completo" value={form.nome} onChange={v=>setForm(f=>({...f,nome:v}))} style={{gridColumn:"span 2"}}/>
        <Inp label="OAB" value={form.oab} onChange={v=>setForm(f=>({...f,oab:v}))}/>
        <Inp label="E-mail" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))}/>
        <Inp label="Telefone" value={form.tel} onChange={v=>setForm(f=>({...f,tel:v}))}/>
        <Sel label="Perfil" value={form.perfil} onChange={v=>setForm(f=>({...f,perfil:v}))} options={["Administrador","Advogado","Colaborador","Estagiário"].map(x=>({value:x,label:x}))}/>
      </Grid>
      <div style={{marginTop:14,display:"flex",gap:10}}><Btn label="Salvar" onClick={salvar}/><Btn label="Cancelar" onClick={()=>setForm(null)} color={C.border}/></div>
    </Card>)}

    <Grid cols="repeat(3,1fr)" gap={16}>
      {advs.map(a=>{
        const procs=processos.filter(p=>p.responsavel===a.id);
        const ativos=procs.filter(p=>p.status==="ativo").length;
        const andAdv=andamentos.filter(x=>x.usuario===a.id);
        const totalMins=andAdv.reduce((s,x)=>s+(x.horas||0)*60+(x.minutos||0),0);
        const prazos=agenda.filter(e=>e.responsavel===a.id&&e.data>=hoje&&e.data<=em7s&&(e.tipo==="prazo"||e.tipo==="audiencia"));
        return(<Card key={a.id}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <Avatar adv={a} size={48} uploadable onUpload={url=>setFoto(a.id,url)}/>
              <div>
                <div style={{color:a.cor,fontWeight:700,fontSize:14,lineHeight:1.3}}>{a.nome}</div>
                <div style={{color:C.muted,fontSize:11}}>{a.oab}</div>
                <Badge label={a.perfil} color={a.cor}/>
              </div>
            </div>
            <Btn label="✏" small onClick={()=>setForm({...a})} color={C.border}/>
          </div>
          <Grid cols="1fr 1fr 1fr" gap={8} style={{marginBottom:10}}>
            {[[ativos,"Processos",a.cor],[fmtHoras(Math.floor(totalMins/60),totalMins%60),"Timesheet",C.accent],[prazos.length,"Prazos 7d",prazos.length>0?C.danger:C.success]].map(([v,l,cor])=>(<div key={l} style={{textAlign:"center",background:C.cardHi,borderRadius:8,padding:"8px 4px"}}><div style={{color:cor,fontWeight:700,fontSize:14}}>{v}</div><div style={{color:C.muted,fontSize:10}}>{l}</div></div>))}
          </Grid>
          <Btn label="📊 Ver Timesheet Detalhado" onClick={()=>{setTsAdv(a.id);setTsPeriodo("mes");}} color={C.border} style={{width:"100%",fontSize:12,borderRadius:10,marginBottom:prazos.length>0?10:0}}/>
          {prazos.length>0&&(<div style={{marginTop:6,background:C.danger+"18",borderRadius:8,padding:10}}>
            <div style={{color:C.danger,fontSize:11,fontWeight:700,marginBottom:4}}>🔔 Prazos próximos:</div>
            {prazos.slice(0,2).map(e=>(<div key={e.id} style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{color:C.text,fontSize:11}}>{e.titulo}</span>
              <span style={{color:C.danger,fontSize:11,fontWeight:600}}>{fmtComDia(e.data)}</span>
            </div>))}
          </div>)}
        </Card>);
      })}
    </Grid>
  </div>);
}

// ============================================================================
// SEÇÃO 23: MÓDULO DE DOCUMENTOS
// ----------------------------------------------------------------------------
// Geração de documentos jurídicos a partir de templates com variáveis.
//
// TEMPLATES DISPONÍVEIS:
//   1. Procuração Ad Judicia et Extra
//   2. Declaração de Hipossuficiência (art. 98 CPC)
//   3. Contrato de Prestação de Serviços Advocatícios
//
// PLACEHOLDERS (variáveis no template):
//   {{NOME}}, {{CPF_CNPJ}}, {{RG}}, {{ESTADO_CIVIL}}, {{PROFISSAO}},
//   {{ENDERECO}}, {{FINALIDADE}}, {{OBJETO}}, {{VALOR_TOTAL}},
//   {{N_PARCELAS}}, {{FORMA_PAGAMENTO}}, {{DATA}}, {{CIDADE}}
//
// FLUXO:
//   1. Escolher tipo de documento
//   2. Vincular a cliente cadastrado OU preencher manualmente
//   3. Preencher campos adicionais (finalidade, objeto, etc.)
//   4. Pré-visualizar → Copiar ou Imprimir/PDF (abre janela de impressão do browser)
//
// TIMBRADO:
//   HTML customizável inserido no cabeçalho ao imprimir.
//   Padrão: nome do escritório, OAB, e-mail, telefone.
//
// BACKEND — ENDPOINTS SUGERIDOS:
//   GET    /api/templates              → lista de templates
//   PUT    /api/templates/{tipo}       → salvar edição de template
//   POST   /api/documentos/gerar       → gerar documento (retorna HTML/PDF)
//   POST   /api/documentos/salvar      → salvar cópia no processo (opcional)
//   GET    /api/timbrado               → buscar timbrado do escritório
//   PUT    /api/timbrado               → salvar timbrado
// ============================================================================
// ── DOCUMENTOS ────────────────────────────────────────────────────────────────
const PLACEHOLDERS_INFO=`{{NOME}} — Nome | {{CPF_CNPJ}} — CPF/CNPJ | {{RG}} — RG
{{ESTADO_CIVIL}} | {{PROFISSAO}} | {{ENDERECO}} — Endereço completo
{{FINALIDADE}} | {{OBJETO}} | {{VALOR_TOTAL}} | {{N_PARCELAS}}
{{FORMA_PAGAMENTO}} | {{DATA}} | {{CIDADE}}`;

function Documentos({clientes,processos,escritorio}){
  const timbrado=`<table width="100%"><tr><td style="font-size:18px;font-weight:bold;color:#1a1a2e">${escritorio?.nome||"Escritório"}</td><td style="text-align:right;font-size:12px;color:#555">OAB ${escritorio?.oab||""}<br>${escritorio?.email||""}<br>${escritorio?.telefone||""}</td></tr></table>`;
  const[tipo,setTipo]=useState("procuracao");
  const[modo,setModo]=useState("cadastrado");
  const[clienteId,setClienteId]=useState("");
  const[campos,setCampos]=useState({cidade:"São Paulo"});
  const[preview,setPreview]=useState(null);
  const[tabDoc,setTabDoc]=useState("gerar");
  const fileRef=useRef();
  const[templateTexto,setTemplateTexto]=useState({
    procuracao:`PROCURAÇÃO AD JUDICIA ET EXTRA\n\nOUTORGANTE: {{NOME}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, portador(a) do CPF nº {{CPF_CNPJ}}, RG nº {{RG}}, residente à {{ENDERECO}}.\n\nOUTORGADOS: [Nome(s) do(s) advogado(s)], OAB/SP nº [número].\n\nFINALIDADE: {{FINALIDADE}}\n\nPoderes: representar o(a) outorgante em juízo ou fora dele, podendo praticar todos os atos necessários ao fiel cumprimento deste mandato.\n\n{{CIDADE}}, {{DATA}}.\n\n___________________________\n{{NOME}}\nOutorgante`,
    hipossuficiencia:`DECLARAÇÃO DE HIPOSSUFICIÊNCIA\n\nEu, {{NOME}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, portador(a) do CPF nº {{CPF_CNPJ}}, residente à {{ENDERECO}}, DECLARO, sob as penas da lei, que não possuo condições financeiras de arcar com as custas processuais sem prejuízo do próprio sustento, requerendo os benefícios da Justiça Gratuita (art. 98 do CPC).\n\n{{CIDADE}}, {{DATA}}.\n\n___________________________\n{{NOME}}\nDeclarante`,
    contrato:`CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS\n\nCONTRATANTE: {{NOME}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, portador(a) do CPF nº {{CPF_CNPJ}}, residente à {{ENDERECO}}.\n\nCONTRATADA: [Nome do Escritório], OAB/SP nº [número].\n\nCLÁUSULA 1ª – OBJETO\n{{OBJETO}}\n\nCLÁUSULA 2ª – HONORÁRIOS\nValor total: R$ {{VALOR_TOTAL}}, em {{N_PARCELAS}} parcela(s) via {{FORMA_PAGAMENTO}}.\n\nCLÁUSULA 3ª – INADIMPLÊNCIA\nMulta de 2% e juros de 1% ao mês.\n\n{{CIDADE}}, {{DATA}}.\n\n___________________________\t___________________________\nContratante\t\t\t\tContratada`,
  });

  const cli=clientes.find(c=>c.id===clienteId);
  function set(k,v){setCampos(f=>({...f,[k]:v}));setPreview(null);}
  function getQual(){
    if(modo==="cadastrado"&&cli){
      const end=[cli.endereco,cli.numero,cli.bairro,cli.cidade&&cli.uf?`${cli.cidade}/${cli.uf}`:cli.cidade].filter(Boolean).join(", ");
      return{nome:cli.nome,cpfcnpj:cli.cpf,rg:cli.rg||"",estadoCivil:cli.estadoCivil||"",profissao:cli.profissao||"",endereco:end};
    }
    return{nome:campos.nomeM||"",cpfcnpj:campos.cpfM||"",rg:campos.rgM||"",estadoCivil:campos.ecM||"",profissao:campos.profM||"",endereco:campos.endM||""};
  }
  function gerar(){
    const q=getQual();const d=fmt(today());
    const repl=(txt)=>txt.replace(/{{NOME}}/g,q.nome||"[NOME]").replace(/{{CPF_CNPJ}}/g,q.cpfcnpj||"[CPF/CNPJ]").replace(/{{RG}}/g,q.rg||"[RG]").replace(/{{ESTADO_CIVIL}}/g,q.estadoCivil||"[ESTADO CIVIL]").replace(/{{PROFISSAO}}/g,q.profissao||"[PROFISSÃO]").replace(/{{ENDERECO}}/g,q.endereco||"[ENDEREÇO]").replace(/{{FINALIDADE}}/g,campos.finalidade||"[FINALIDADE]").replace(/{{OBJETO}}/g,campos.objeto||"[OBJETO]").replace(/{{VALOR_TOTAL}}/g,campos.valorTotal||"[VALOR]").replace(/{{N_PARCELAS}}/g,campos.parcN||"[PARCELAS]").replace(/{{FORMA_PAGAMENTO}}/g,campos.formaPag||"[FORMA]").replace(/{{DATA}}/g,d).replace(/{{CIDADE}}/g,campos.cidade||"[CIDADE]");
    setPreview(repl(templateTexto[tipo]));
  }
  function imprimirComTimbrado(){
    const janela=window.open("","_blank");
    janela.document.write(`<html><head><title>Documento</title><style>body{font-family:serif;font-size:14px;line-height:1.8;padding:40px 60px;max-width:800px;margin:auto}pre{white-space:pre-wrap;font-family:serif}.timbrado{text-align:center;margin-bottom:30px;border-bottom:2px solid #333;padding-bottom:20px}</style></head><body>${timbrado?`<div class="timbrado">${timbrado}</div>`:""}<pre>${preview}</pre></body></html>`);
    janela.document.close();janela.print();
  }
  const tiposDoc=[{v:"procuracao",l:"Procuração"},{v:"hipossuficiencia",l:"Decl. Hipossuficiência"},{v:"contrato",l:"Contrato de Honorários"}];
  return(<div>
    <h2 style={{color:C.text,marginBottom:20,fontFamily:"'DM Serif Display',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>Documentos</h2>
    <div style={{display:"flex",gap:8,marginBottom:20}}>
      {["gerar","templates","timbrado"].map(t=>(<Btn key={t} label={t==="gerar"?"📄 Gerar":t==="templates"?"✏️ Templates":"🖼 Timbrado"} onClick={()=>setTabDoc(t)} color={tabDoc===t?C.accent:C.border}/>))}
    </div>
    {tabDoc==="timbrado"&&(<Card>
      <div style={{color:C.text,fontWeight:600,marginBottom:8}}>Cabeçalho / Timbrado</div>
      <div style={{color:C.muted,fontSize:12,marginBottom:12}}>O timbrado é gerado automaticamente com os dados do escritório. Para editar, acesse <strong style={{color:C.accent}}>⚙️ Configurações → Escritório</strong>.</div>
      <div style={{background:C.cardHi,border:`1px solid ${C.border}`,borderRadius:10,padding:16}} dangerouslySetInnerHTML={{__html:timbrado}}/>
    </Card>)}
    {tabDoc==="templates"&&(<Card>
      <div style={{display:"flex",gap:8,marginBottom:12}}>{tiposDoc.map(t=>(<Btn key={t.v} label={t.l} onClick={()=>setTipo(t.v)} color={tipo===t.v?C.accent:C.border}/>))}</div>
      <pre style={{color:C.muted,fontSize:11,margin:"0 0 8px",background:C.inputBg,padding:10,borderRadius:8}}>{PLACEHOLDERS_INFO}</pre>
      <textarea value={templateTexto[tipo]} onChange={e=>setTemplateTexto(tt=>({...tt,[tipo]:e.target.value}))} rows={18} style={{width:"100%",boxSizing:"border-box",background:C.inputBg,border:`1px solid ${C.border}`,borderRadius:10,padding:12,color:C.text,fontSize:13,fontFamily:"monospace",outline:"none",resize:"vertical"}}/>
    </Card>)}
    {tabDoc==="gerar"&&(<Grid cols="320px 1fr" gap={20}>
      <div>
        <Card>
          <div style={{color:C.text,fontWeight:600,marginBottom:12}}>Tipo</div>
          {tiposDoc.map(t=>(<button key={t.v} onClick={()=>{setTipo(t.v);setPreview(null);}} style={{display:"block",width:"100%",background:tipo===t.v?C.accent+"22":"transparent",border:`1px solid ${tipo===t.v?C.accent:C.border}`,borderRadius:8,padding:"9px 14px",color:tipo===t.v?C.accent:C.muted,textAlign:"left",cursor:"pointer",fontWeight:tipo===t.v?700:400,fontSize:13,marginBottom:6}}>{t.l}</button>))}
          <div style={{borderTop:`1px solid ${C.border}`,marginTop:12,paddingTop:12}}>
            <div style={{color:C.text,fontWeight:600,marginBottom:8}}>Cliente</div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              {["cadastrado","manual"].map(m=>(<button key={m} onClick={()=>{setModo(m);setClienteId("");setCampos({cidade:"São Paulo"});setPreview(null);}} style={{flex:1,padding:"7px 0",borderRadius:8,border:`1px solid ${modo===m?C.accent:C.border}`,background:modo===m?C.accent+"22":"transparent",color:modo===m?C.accent:C.muted,cursor:"pointer",fontSize:12}}>{m==="cadastrado"?"Cadastrado":"Manual"}</button>))}
            </div>
            {modo==="cadastrado"&&<Sel value={clienteId} onChange={v=>{setClienteId(v);setPreview(null);}} options={[{value:"",label:"Selecione..."},...clientes.map(c=>({value:c.id,label:`${c.id} — ${c.nome}`}))]}/>}
            {modo==="manual"&&(<div style={{display:"flex",flexDirection:"column",gap:8}}>
              <Inp label="Nome" value={campos.nomeM||""} onChange={v=>set("nomeM",v)}/>
              <Inp label="CPF/CNPJ" value={campos.cpfM||""} onChange={v=>set("cpfM",v)}/>
              <Inp label="Endereço" value={campos.endM||""} onChange={v=>set("endM",v)}/>
            </div>)}
          </div>
          <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10}}>
            <Inp label="Cidade" value={campos.cidade||""} onChange={v=>set("cidade",v)}/>
            {tipo==="procuracao"&&<Inp label="Finalidade" value={campos.finalidade||""} onChange={v=>set("finalidade",v)}/>}
            {tipo==="contrato"&&(<>
              <Inp label="Objeto" value={campos.objeto||""} onChange={v=>set("objeto",v)}/>
              <Inp label="Valor total (R$)" value={campos.valorTotal||""} onChange={v=>set("valorTotal",v)}/>
              <Inp label="Nº parcelas" type="number" value={campos.parcN||""} onChange={v=>set("parcN",v)}/>
              <Sel label="Forma de pagamento" value={campos.formaPag||"Pix"} onChange={v=>set("formaPag",v)} options={FORMAS_PAG.map(x=>({value:x,label:x}))}/>
            </>)}
          </div>
          <Btn label="Gerar Documento" onClick={gerar} style={{width:"100%",marginTop:16}}/>
        </Card>
      </div>
      <div>
        {preview&&(<Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{color:C.text,fontWeight:600}}>Pré-visualização</div>
            <div style={{display:"flex",gap:8}}>
              <Btn label="📋 Copiar" small onClick={()=>navigator.clipboard.writeText(preview)} color={C.accent2}/>
              <Btn label="🖨 Imprimir/PDF" small onClick={imprimirComTimbrado} color={C.success}/>
            </div>
          </div>
          <pre style={{whiteSpace:"pre-wrap",fontFamily:"serif",fontSize:13,color:C.text,lineHeight:1.8,background:C.inputBg,padding:20,borderRadius:10,border:`1px solid ${C.border}`,maxHeight:500,overflowY:"auto"}}>{preview}</pre>
        </Card>)}
        {!preview&&(<Card style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center",minHeight:300}}><div style={{textAlign:"center",color:C.muted}}><div style={{fontSize:40,marginBottom:12}}>📄</div><div>Preencha os campos e clique em "Gerar Documento"</div></div></Card>)}
      </div>
    </Grid>)}
  </div>);
}

// ── ESCRITÓRIO removido como módulo — dados gerenciados em Configurações > Escritório

// ============================================================================
// SEÇÃO 25: APP PRINCIPAL — ROTEAMENTO E ESTADO GLOBAL
// ----------------------------------------------------------------------------
// Componente raiz que:
//   1. Mantém TODO o estado da aplicação em useState (dados mockados)
//   2. Renderiza a sidebar de navegação
//   3. Exibe o módulo ativo conforme "mod" (estado de rota)
//
// MENU: Dashboard, Clientes, Processos, Agenda, Financeiro,
//       Documentos, Colaboradores, Escritório
//
// BADGE DE URGÊNCIA NO MENU:
//   O item "Agenda" exibe um badge vermelho com o número de prazos/audiências
//   nos próximos 3 dias. Calculado a partir do estado "agenda".
//
// USUÁRIO FIXO: "Dr. André Ferreira / Administrador" — hardcoded no rodapé da sidebar.
//
// SUBSTITUIÇÃO COM BACKEND:
//   - O estado global deve ser carregado de APIs no useEffect inicial
//   - Adicionar React Query ou SWR para cache e revalidação automática
//   - Implementar roteamento real com React Router (substituir o "mod" estado)
//   - Adicionar AuthContext com token JWT e informações do usuário logado
//   - O nome/perfil do usuário no rodapé deve vir do contexto de autenticação
//
// ESTRUTURA SUGERIDA COM BACKEND:
//   <AuthProvider>       → contexto de autenticação (JWT, usuário logado)
//     <QueryClientProvider> → React Query para cache de API
//       <Router>            → React Router para URLs reais
//         <App/>
//       </Router>
//     </QueryClientProvider>
//   </AuthProvider>
// ============================================================================
// ── CONFIGURAÇÕES ─────────────────────────────────────────────────────────────

// ============================================================================
// INTEGRAÇÃO BANCO EFÍ
// ----------------------------------------------------------------------------
// A API Cobranças Efí é REST + OAuth2 (client_credentials).
// NÃO requer certificado P12 para boleto/carnê (ao contrário da API Pix).
//
// AUTENTICAÇÃO:
//   POST https://cobrancas.api.efipay.com.br/v1/authorize
//   Header: Authorization: Basic base64(client_id:client_secret)
//   Body:   { "grant_type": "client_credentials" }
//   → access_token (válido por 3600s)
//
// ENDPOINTS PRINCIPAIS (API Cobranças):
//   POST /v1/charge                          → criar cobrança (boleto avulso)
//   POST /v1/charge/:id/billet               → associar boleto à cobrança
//   POST /v1/carnet                          → emitir carnê (até 24 parcelas)
//   GET  /v1/carnet/:id                      → consultar carnê
//   GET  /v1/carnet/:id/parcel/:num          → consultar parcela
//   PUT  /v1/carnet/:id/parcel/:num/settle   → marcar parcela como paga (manual)
//   PUT  /v1/carnet/:id/settle               → marcar carnê inteiro como pago
//   DELETE /v1/carnet/:id                    → cancelar carnê
//   GET  /v1/charges?begin_date=&end_date=   → listar cobranças por período
//
// CORPO DO CARNÊ:
//   {
//     items: [{ name, value, amount }],
//     customer: { name, cpf, email, phone_number, address:{...} },
//     expire_at: "YYYY-MM-DD",        // vencimento 1ª parcela
//     repeats: 12,                    // nº de parcelas (1-24)
//     split_items: false,
//     configurations: { fine:2, interest:1 },  // multa % e juros % a.m.
//     message: "texto no boleto"
//   }
//
// WEBHOOK (notificação automática de pagamento):
//   Cadastrar URL de callback no painel Efí > API > Aplicações
//   O Efí faz POST para sua URL com { notification_token }
//   Consultar status: GET /v1/notification/:token
//
// STATUS DE PARCELA: waiting | unpaid | paid | settled | canceled | contested
//
// AMBIENTES:
//   Homologação: https://cobrancas-h.api.efipay.com.br
//   Produção:    https://cobrancas.api.efipay.com.br
//
// IMPORTANTE: A API Cobranças NÃO usa certificado P12.
//   A API Pix SIM requer certificado P12 (.pem/.p12) em todas as requisições.
//   O backend Java (Spring Boot) deve usar o sdk-java-apis-efi ou chamar direto.
//
// SDK JAVA: https://github.com/efipay/sdk-java-apis-efi
//   <dependency>
//     <groupId>br.com.efipay</groupId>
//     <artifactId>sdk-java-apis-efi</artifactId>
//     <version>LATEST</version>
//   </dependency>
// ============================================================================
function EfiBankIntegracao({contratos,clientes,setContratos}){
  const[tab,setTab]=useState("config");
  const[config,setConfig]=useState({clientId:"",clientSecret:"",ambiente:"homologacao",webhookUrl:"",pixChave:"",pixTipo:"aleatoria"});
  const[carneSel,setCarneSel]=useState({contratoId:"",repeats:12,fine:2,interest:1,message:"Honorários advocatícios"});
  const[carnes,setCarnes]=useState([
    {id:"CNE001",contratoId:"C001",cliente:"João Silva",repeats:12,status:"ativo",parcelas:[{n:1,venc:"2026-02-01",status:"paid"},{n:2,venc:"2026-03-01",status:"waiting"},{n:3,venc:"2026-04-01",status:"waiting"}],valor:850},
    {id:"CNE002",contratoId:"C002",cliente:"Empresa XYZ Ltda",repeats:6,status:"ativo",parcelas:[{n:1,venc:"2026-01-15",status:"paid"},{n:2,venc:"2026-02-15",status:"paid"},{n:3,venc:"2026-03-15",status:"unpaid"}],valor:1200},
  ]);
  const[despesas,setDespesas]=useState([
    {id:1,data:"2026-02-10",descricao:"Distribuição – Processo 0001-A",valor:28.50,tipo:"despesa",origem:"manual",processoId:"0001-A"},
    {id:2,data:"2026-02-15",descricao:"Cópias autenticadas",valor:45.00,tipo:"despesa",origem:"manual",processoId:"0423-A"},
    {id:3,data:"2026-03-01",descricao:"Honorários recebidos – João Silva (parcela 1)",valor:850.00,tipo:"receita",origem:"efi",processoId:"0001-A"},
  ]);
  const[despForm,setDespForm]=useState(null);
  const[testando,setTestando]=useState(false);
  const[testeOk,setTesteOk]=useState(null);

  const statusClrEfi={waiting:C.warning,unpaid:C.danger,paid:C.success,settled:C.success,canceled:C.muted,contested:C.danger};
  const statusLblEfi={waiting:"Aguardando",unpaid:"Não pago",paid:"Pago",settled:"Liquidado",canceled:"Cancelado",contested:"Contestado"};

  const totalReceitas=despesas.filter(d=>d.tipo==="receita").reduce((s,d)=>s+d.valor,0);
  const totalDespesas=despesas.filter(d=>d.tipo==="despesa").reduce((s,d)=>s+d.valor,0);

  async function testarConexao(){
    setTestando(true);setTesteOk(null);
    await new Promise(r=>setTimeout(r,1200));
    setTesteOk(config.clientId&&config.clientSecret?"ok":"erro");
    setTestando(false);
  }

  const tabStyle=(t)=>({padding:"8px 16px",borderRadius:10,border:`1px solid ${tab===t?C.accent:C.border}`,background:tab===t?C.accent+"22":"transparent",color:tab===t?C.accent:C.muted,cursor:"pointer",fontSize:12,fontWeight:tab===t?700:400});

  return(<div>
    <h2 style={{color:C.text,margin:"0 0 20px",fontFamily:"'DM Serif Display',serif",fontSize:24,fontWeight:400}}>🏦 Integração Banco Efí</h2>

    {/* Tabs */}
    <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
      {[["config","⚙️ Configuração"],["carnes","📜 Carnês"],["financeiro","💳 Financeiro"],["docs","📚 Documentação API"]].map(([v,l])=>(
        <button key={v} onClick={()=>setTab(v)} style={tabStyle(v)}>{l}</button>
      ))}
    </div>

    {/* ── CONFIG ── */}
    {tab==="config"&&(<div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:14}}>🔑 Credenciais da Aplicação Efí</div>
        <div style={{padding:12,background:C.warning+"15",border:`1px solid ${C.warning}44`,borderRadius:10,marginBottom:14,fontSize:12,color:C.silver}}>
          <strong style={{color:C.warning}}>Como obter:</strong> Acesse <strong>efipay.com.br → Login → API → Criar Aplicação</strong>. Habilite escopos "API Cobranças" (boleto/carnê). Copie Client_ID e Client_Secret gerados.
        </div>
        <Grid cols="1fr 1fr" gap={14}>
          <Inp label="Client_ID" value={config.clientId} onChange={v=>setConfig(c=>({...c,clientId:v}))} style={{gridColumn:"span 2"}}/>
          <Inp label="Client_Secret" value={config.clientSecret} onChange={v=>setConfig(c=>({...c,clientSecret:v}))} style={{gridColumn:"span 2"}}/>
          <Sel label="Ambiente" value={config.ambiente} onChange={v=>setConfig(c=>({...c,ambiente:v}))} options={[{value:"homologacao",label:"🧪 Homologação (sandbox)"},{value:"producao",label:"🟢 Produção"}]}/>
          <Inp label="URL Webhook (callback de pagamentos)" value={config.webhookUrl} onChange={v=>setConfig(c=>({...c,webhookUrl:v}))}/>
        </Grid>
        <div style={{marginTop:14,display:"flex",gap:10,alignItems:"center"}}>
          <Btn label={testando?"Testando...":"🔌 Testar Conexão"} onClick={testarConexao} color={C.accent2}/>
          {testeOk==="ok"&&<span style={{color:C.success,fontSize:12,fontWeight:700}}>✓ Conexão OK — credenciais válidas</span>}
          {testeOk==="erro"&&<span style={{color:C.danger,fontSize:12,fontWeight:700}}>✗ Preencha Client_ID e Client_Secret</span>}
        </div>
      </Card>
      <Card>
        <div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:10}}>🔷 Configuração Pix (opcional)</div>
        <div style={{color:C.muted,fontSize:12,marginBottom:12}}>Para emitir boletos com QR Code Pix (Bolix). A API Pix requer certificado .p12 adicional — configure no backend Java.</div>
        <Grid cols="1fr 1fr" gap={14}>
          <Inp label="Chave Pix" value={config.pixChave} onChange={v=>setConfig(c=>({...c,pixChave:v}))}/>
          <Sel label="Tipo da Chave" value={config.pixTipo} onChange={v=>setConfig(c=>({...c,pixTipo:v}))} options={["cpf","cnpj","email","telefone","aleatoria"].map(x=>({value:x,label:x}))}/>
        </Grid>
      </Card>
    </div>)}

    {/* ── CARNÊS ── */}
    {tab==="carnes"&&(<div>
      <div style={{marginBottom:16,padding:12,background:C.accent+"11",border:`1px solid ${C.accent}33`,borderRadius:10,fontSize:12,color:C.silver}}>
        <strong style={{color:C.accent}}>Carnê Efí:</strong> até 24 parcelas mensais, boleto + QR Code Pix, com multa e juros configuráveis. Pagamentos confirmados automaticamente via webhook.
      </div>
      {/* Emitir novo carnê */}
      <Card style={{marginBottom:16}}>
        <div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:14}}>+ Emitir Novo Carnê</div>
        <Grid cols="1fr 1fr 1fr" gap={14}>
          <Sel label="Contrato / Cliente" value={carneSel.contratoId} onChange={v=>setCarneSel(c=>({...c,contratoId:v}))} style={{gridColumn:"span 2"}}
            options={[{value:"",label:"Selecione um contrato..."},...contratos.map(c=>{const cl=clientes.find(x=>x.id===c.clienteId);return{value:c.id,label:`${c.id} — ${cl?.nome||c.clienteId} — R$ ${parseFloat(c.valorTotal||0).toLocaleString("pt-BR")}`};})]}/>
          <Inp label="Nº de parcelas (máx 24)" type="number" value={String(carneSel.repeats)} onChange={v=>setCarneSel(c=>({...c,repeats:Math.min(24,Math.max(1,parseInt(v)||1))}))}/>
          <Inp label="Multa por atraso (%)" type="number" value={String(carneSel.fine)} onChange={v=>setCarneSel(c=>({...c,fine:parseFloat(v)||0}))}/>
          <Inp label="Juros a.m. (%)" type="number" value={String(carneSel.interest)} onChange={v=>setCarneSel(c=>({...c,interest:parseFloat(v)||0}))}/>
          <Inp label="Mensagem no boleto" value={carneSel.message} onChange={v=>setCarneSel(c=>({...c,message:v}))} style={{gridColumn:"span 3"}}/>
        </Grid>
        <div style={{marginTop:12,display:"flex",gap:10,alignItems:"center"}}>
          <Btn label="📤 Emitir Carnê via API Efí" onClick={()=>{
            if(!carneSel.contratoId)return alert("Selecione um contrato.");
            const cont=contratos.find(c=>c.id===carneSel.contratoId);
            const cli=clientes.find(c=>c.id===cont?.clienteId);
            alert(`Simulação: Carnê de ${carneSel.repeats}x para ${cli?.nome||"cliente"} seria enviado à API Efí.\n\nEm produção, o backend Java faz POST /v1/carnet com as credenciais OAuth2 e retorna o carnet_id e links dos boletos.`);
          }} color={C.success}/>
          <span style={{color:C.muted,fontSize:11}}>* Requer credenciais configuradas e backend Java conectado</span>
        </div>
      </Card>

      {/* Lista de carnês */}
      {carnes.map(cn=>(
        <Card key={cn.id} style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{color:C.accent,fontWeight:700,fontSize:14}}>{cn.id} — {cn.cliente}</div>
              <div style={{color:C.muted,fontSize:11}}>{cn.repeats} parcelas · R$ {cn.valor.toLocaleString("pt-BR",{minimumFractionDigits:2})}/parcela</div>
            </div>
            <Badge label={cn.status==="ativo"?"Ativo":"Cancelado"} color={cn.status==="ativo"?C.success:C.danger}/>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {cn.parcelas.map(p=>(
              <div key={p.n} style={{minWidth:100,padding:"8px 10px",background:statusClrEfi[p.status]+"18",border:`1px solid ${statusClrEfi[p.status]}44`,borderRadius:8,textAlign:"center"}}>
                <div style={{color:C.muted,fontSize:10}}>Parcela {p.n}</div>
                <div style={{color:statusClrEfi[p.status],fontSize:11,fontWeight:700}}>{statusLblEfi[p.status]}</div>
                <div style={{color:C.muted,fontSize:10}}>{fmtComDia(p.venc)}</div>
                {p.status==="unpaid"&&<button onClick={()=>{
                  setCarnes(cs=>cs.map(c=>c.id===cn.id?{...c,parcelas:c.parcelas.map(x=>x.n===p.n?{...x,status:"settled"}:x)}:c));
                }} style={{marginTop:4,padding:"2px 8px",borderRadius:6,border:`1px solid ${C.success}`,background:"transparent",color:C.success,cursor:"pointer",fontSize:10}}>Marcar pago</button>}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>)}

    {/* ── FINANCEIRO ── */}
    {tab==="financeiro"&&(<div>
      <Grid cols="1fr 1fr 1fr" gap={12} style={{marginBottom:16}}>
        {[["💰",`R$ ${totalReceitas.toLocaleString("pt-BR",{minimumFractionDigits:2})}`,"Receitas",C.success],["📤",`R$ ${totalDespesas.toLocaleString("pt-BR",{minimumFractionDigits:2})}`,"Despesas",C.danger],["📊",`R$ ${(totalReceitas-totalDespesas).toLocaleString("pt-BR",{minimumFractionDigits:2})}`,"Saldo",totalReceitas>=totalDespesas?C.success:C.danger]].map(([ic,v,l,cor])=>(
          <Card key={l} style={{textAlign:"center",padding:14,border:`1px solid ${cor}22`}}>
            <div style={{fontSize:20}}>{ic}</div><div style={{color:cor,fontWeight:800,fontSize:18,margin:"4px 0"}}>{v}</div>
            <div style={{color:C.muted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.3px"}}>{l}</div>
          </Card>
        ))}
      </Grid>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{color:C.text,fontWeight:600,fontSize:14}}>Lançamentos</div>
        <Btn label="+ Lançamento" onClick={()=>setDespForm({data:today(),descricao:"",valor:0,tipo:"despesa",origem:"manual",processoId:""})} small color={C.accent2}/>
      </div>
      {despForm&&(<Card style={{marginBottom:12}}>
        <Grid cols="1fr 1fr 1fr" gap={12}>
          <Inp label="Data" type="date" value={despForm.data} onChange={v=>setDespForm(f=>({...f,data:v}))}/>
          <Sel label="Tipo" value={despForm.tipo} onChange={v=>setDespForm(f=>({...f,tipo:v}))} options={[{value:"receita",label:"💰 Receita"},{value:"despesa",label:"📤 Despesa"}]}/>
          <Inp label="Valor (R$)" type="number" value={String(despForm.valor)} onChange={v=>setDespForm(f=>({...f,valor:parseFloat(v)||0}))}/>
          <Inp label="Descrição" value={despForm.descricao} onChange={v=>setDespForm(f=>({...f,descricao:v}))} style={{gridColumn:"span 2"}}/>
          <Inp label="Processo (ex: 0001-A)" value={despForm.processoId} onChange={v=>setDespForm(f=>({...f,processoId:v}))}/>
        </Grid>
        <div style={{marginTop:10,display:"flex",gap:8}}>
          <Btn label="Salvar" small onClick={()=>{setDespesas(d=>[...d,{...despForm,id:Date.now()}]);setDespForm(null);}}/>
          <Btn label="Cancelar" small onClick={()=>setDespForm(null)} color={C.border}/>
        </div>
      </Card>)}
      <Card style={{padding:0,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:C.cardHi}}>{["Data","Tipo","Descrição","Processo","Origem","Valor"].map(h=>(<th key={h} style={{color:C.muted,fontSize:10.5,padding:"10px 14px",textAlign:"left",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>))}</tr></thead>
          <tbody>{[...despesas].sort((a,b)=>b.data.localeCompare(a.data)).map(d=>(
            <tr key={d.id} style={{borderTop:`1px solid ${C.border}`}}>
              <td style={{padding:"10px 14px",color:C.muted,fontSize:12}}>{fmtComDia(d.data)}</td>
              <td style={{padding:"10px 14px"}}><Badge label={d.tipo==="receita"?"💰 Receita":"📤 Despesa"} color={d.tipo==="receita"?C.success:C.danger}/></td>
              <td style={{padding:"10px 14px",color:C.text,fontSize:12}}>{d.descricao}</td>
              <td style={{padding:"10px 14px",color:C.accent,fontSize:12}}>{d.processoId||"—"}</td>
              <td style={{padding:"10px 14px"}}><Badge label={d.origem==="efi"?"🏦 Efí":"Manual"} color={d.origem==="efi"?C.accent2:C.border}/></td>
              <td style={{padding:"10px 14px",color:d.tipo==="receita"?C.success:C.danger,fontWeight:700,fontSize:13}}>{d.tipo==="receita"?"+":"-"} R$ {d.valor.toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>)}

    {/* ── DOCS API ── */}
    {tab==="docs"&&(<div style={{display:"flex",flexDirection:"column",gap:12}}>
      {[
        ["🔐 Autenticação OAuth2","POST /v1/authorize","Header: Authorization: Basic base64(client_id:client_secret)\nBody: {\"grant_type\":\"client_credentials\"}\n→ Retorna access_token (válido 3600s)\nUsar: Authorization: Bearer {access_token} em todas as requisições subsequentes",C.accent],
        ["📜 Emitir Carnê","POST /v1/carnet","Body: { items:[{name,value,amount}], customer:{name,cpf,email,phone_number,address}, expire_at:'YYYY-MM-DD', repeats:12, configurations:{fine:2,interest:1}, message:'...' }\n→ Retorna: { code:200, data:{ carnet_id, status, parcels:[{parcel,link,barcode,expire_at}] } }",C.success],
        ["🔔 Webhook de Pagamento","POST {sua-url-callback}","Efí envia automaticamente: { notification_token:'...' }\nConsultar: GET /v1/notification/{token}\n→ Retorna status atualizado da parcela/cobrança",C.warning],
        ["✅ Marcar Parcela Paga","PUT /v1/carnet/:id/parcel/:n/settle","Usar quando pagamento ocorreu fora da Efí (ex: depósito bancário, Pix manual).\nNão gera movimentação financeira real na conta Efí — apenas atualiza status.",C.accent2],
        ["🔍 Listar Cobranças","GET /v1/charges","Query params: begin_date, end_date, status, customer_document\nEx: /v1/charges?begin_date=2026-01-01&end_date=2026-03-31&status=paid\n→ Lista paginada de todas as cobranças no período",C.gold||C.warning],
      ].map(([titulo,endpoint,desc,cor])=>(
        <Card key={titulo} style={{border:`1px solid ${cor}22`}}>
          <div style={{color:cor,fontWeight:700,fontSize:13,marginBottom:4}}>{titulo}</div>
          <div style={{fontFamily:"monospace",fontSize:11,color:C.accent2,background:C.cardHi,borderRadius:6,padding:"6px 10px",marginBottom:8}}>{endpoint}</div>
          <pre style={{color:C.muted,fontSize:11,lineHeight:1.6,margin:0,whiteSpace:"pre-wrap"}}>{desc}</pre>
        </Card>
      ))}
      <Card style={{border:`1px solid ${C.border}`}}>
        <div style={{color:C.silver,fontWeight:700,fontSize:13,marginBottom:8}}>📦 SDK Java — dependência Maven</div>
        <pre style={{fontFamily:"monospace",fontSize:11,color:C.accent,background:C.cardHi,borderRadius:8,padding:"10px 14px",margin:0,overflowX:"auto"}}>{`<dependency>
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
    </div>)}
  </div>);
}

function Configuracoes({tema,setTema,usuario,setUsuario,escritorio,setEscritorio,onClose}){
  const[tab,setTab]=useState("conta");
  const[editUser,setEditUser]=useState({...usuario});
  const[senhaForm,setSenhaForm]=useState({atual:"",nova:"",conf:""});
  const[saved,setSaved]=useState(false);

  function salvarConta(){setUsuario({...editUser});setSaved(true);setTimeout(()=>setSaved(false),2000);}
  function salvarSenha(){
    if(!senhaForm.nova||senhaForm.nova!==senhaForm.conf)return alert("A nova senha e a confirmação não coincidem.");
    setSenhaForm({atual:"",nova:"",conf:""});setSaved(true);setTimeout(()=>setSaved(false),2000);
  }

  const tabs=[["conta","👤 Conta"],["sistema","⚙️ Sistema"],["notif","🔔 Notificações"]];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,width:600,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
        {/* Header */}
        <div style={{padding:"20px 24px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:C.text,fontWeight:700,fontSize:17,fontFamily:"'DM Serif Display',serif"}}>Configurações</div>
            <div style={{color:C.muted,fontSize:12,marginTop:2}}>Gerencie sua conta e preferências do sistema</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:10,padding:"6px 12px",cursor:"pointer",fontSize:18,lineHeight:1}}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",gap:4,padding:"12px 24px 0",borderBottom:`1px solid ${C.border}`}}>
          {tabs.map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)} style={{padding:"8px 16px",background:"transparent",border:"none",borderBottom:`2px solid ${tab===v?C.accent:"transparent"}`,color:tab===v?C.accent:C.muted,cursor:"pointer",fontWeight:tab===v?700:400,fontSize:13,transition:"all .15s",marginBottom:-1}}>
              {l}
            </button>
          ))}
        </div>
        <div style={{padding:24}}>
          {saved&&<div style={{background:C.success+"18",border:`1px solid ${C.success}44`,borderRadius:10,padding:"10px 16px",color:C.success,fontWeight:600,fontSize:13,marginBottom:16}}>✓ Alterações salvas com sucesso!</div>}

          {/* ABA: CONTA */}
          {tab==="conta"&&(<div>
            {/* Avatar */}
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24,padding:16,background:C.glass,borderRadius:14,border:`1px solid ${C.border}`}}>
              <div style={{width:60,height:60,borderRadius:16,background:`linear-gradient(135deg,${C.gold},${C.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:`0 4px 16px ${C.gold}44`,flexShrink:0}}>👤</div>
              <div>
                <div style={{color:C.text,fontWeight:700,fontSize:16}}>{editUser.nome}</div>
                <div style={{color:C.muted,fontSize:13}}>{editUser.oab}</div>
                <div style={{marginTop:6}}><Badge label={editUser.perfil} color={C.accent}/></div>
              </div>
            </div>
            <Grid cols="1fr 1fr" gap={14}>
              <Inp label="Nome completo" value={editUser.nome} onChange={v=>setEditUser(u=>({...u,nome:v}))} style={{gridColumn:"span 2"}}/>
              <Inp label="E-mail" value={editUser.email} onChange={v=>setEditUser(u=>({...u,email:v}))}/>
              <Inp label="Telefone" value={editUser.tel} onChange={v=>setEditUser(u=>({...u,tel:v}))}/>
              <Inp label="OAB" value={editUser.oab} onChange={v=>setEditUser(u=>({...u,oab:v}))}/>
              <Sel label="Perfil" value={editUser.perfil} onChange={v=>setEditUser(u=>({...u,perfil:v}))} options={["Administrador","Advogado","Colaborador","Estagiário"].map(x=>({value:x,label:x}))}/>
            </Grid>
            <div style={{borderTop:`1px solid ${C.border}`,marginTop:20,paddingTop:20}}>
              <div style={{color:C.silver,fontWeight:600,fontSize:13,marginBottom:14}}>🔐 Alterar Senha</div>
              <Grid cols="1fr 1fr 1fr" gap={12}>
                <Inp label="Senha atual" type="password" value={senhaForm.atual} onChange={v=>setSenhaForm(f=>({...f,atual:v}))}/>
                <Inp label="Nova senha" type="password" value={senhaForm.nova} onChange={v=>setSenhaForm(f=>({...f,nova:v}))}/>
                <Inp label="Confirmar nova senha" type="password" value={senhaForm.conf} onChange={v=>setSenhaForm(f=>({...f,conf:v}))}/>
              </Grid>
              <Btn label="Atualizar senha" onClick={salvarSenha} color={C.warning} style={{marginTop:12}} small/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}><Btn label="Salvar alterações" onClick={salvarConta}/><Btn label="Cancelar" onClick={onClose} color={C.border}/></div>
          </div>)}

          {/* ABA: SISTEMA */}
          {tab==="sistema"&&(<div style={{display:"flex",flexDirection:"column",gap:20}}>
            {/* Tema */}
            <div style={{padding:18,background:C.cardHi,borderRadius:14,border:`1px solid ${C.border}`}}>
              <div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:4}}>🌗 Tema da Interface</div>
              <div style={{color:C.muted,fontSize:12,marginBottom:14}}>Escolha entre modo escuro (padrão) e modo claro</div>
              <div style={{display:"flex",gap:10}}>
                {[["dark","🌙 Modo Escuro"],["light","☀️ Modo Claro"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setTema(v)} style={{flex:1,padding:"14px 10px",borderRadius:12,border:`2px solid ${tema===v?C.accent:C.border}`,background:tema===v?C.accent+"18":"transparent",color:tema===v?C.accent:C.muted,cursor:"pointer",fontWeight:tema===v?700:400,fontSize:13,transition:"all .18s",boxShadow:tema===v?`0 0 16px ${C.accent}30`:"none"}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {/* Idioma */}
            <div style={{padding:18,background:C.cardHi,borderRadius:14,border:`1px solid ${C.border}`}}>
              <div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:4}}>🌍 Idioma e Região</div>
              <div style={{color:C.muted,fontSize:12,marginBottom:14}}>Configurações de data e formato numérico</div>
              <Grid cols="1fr 1fr" gap={12}>
                <Sel label="Idioma" value="pt-BR" onChange={()=>{}} options={[{value:"pt-BR",label:"Português (Brasil)"}]}/>
                <Sel label="Formato de Data" value="dd/mm/yyyy" onChange={()=>{}} options={[{value:"dd/mm/yyyy",label:"DD/MM/AAAA"}]}/>
              </Grid>
            </div>
            {/* Escritório */}
            <div style={{padding:18,background:C.cardHi,borderRadius:14,border:`1px solid ${C.border}`}}>
              <div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:4}}>🏛️ Dados do Escritório</div>
              <div style={{color:C.muted,fontSize:12,marginBottom:14}}>Usados no timbrado dos documentos e no cabeçalho do sistema</div>
              <Grid cols="1fr 1fr" gap={12}>
                <Inp label="Nome / Razão Social" value={escritorio?.nome||""} onChange={v=>setEscritorio(e=>({...e,nome:v}))} style={{gridColumn:"span 2"}}/>
                <Inp label="CNPJ" value={escritorio?.cnpj||""} onChange={v=>setEscritorio(e=>({...e,cnpj:v}))}/>
                <Inp label="OAB" value={escritorio?.oab||""} onChange={v=>setEscritorio(e=>({...e,oab:v}))}/>
                <Inp label="E-mail" value={escritorio?.email||""} onChange={v=>setEscritorio(e=>({...e,email:v}))}/>
                <Inp label="Telefone" value={escritorio?.telefone||""} onChange={v=>setEscritorio(e=>({...e,telefone:v}))}/>
                <Inp label="Site" value={escritorio?.site||""} onChange={v=>setEscritorio(e=>({...e,site:v}))} style={{gridColumn:"span 2"}}/>
                <Inp label="Endereço" value={escritorio?.endereco||""} onChange={v=>setEscritorio(e=>({...e,endereco:v}))} style={{gridColumn:"span 2"}}/>
                <Inp label="Cidade" value={escritorio?.cidade||""} onChange={v=>setEscritorio(e=>({...e,cidade:v}))}/>
                <Inp label="UF" value={escritorio?.uf||""} onChange={v=>setEscritorio(e=>({...e,uf:v}))}/>
                <Inp label="% Caixa padrão nos contratos" type="number" value={String(escritorio?.caixaPercDefault||"")} onChange={v=>setEscritorio(e=>({...e,caixaPercDefault:parseFloat(v)||0}))} style={{gridColumn:"span 2"}}/>
              </Grid>
              <div style={{marginTop:12}}><Btn label="Salvar dados do escritório" onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}} small/></div>
            </div>
          </div>)}

          {/* ABA: NOTIFICAÇÕES */}
          {tab==="notif"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}>
            {[
              ["Prazos vencendo em 3 dias","Alerta na interface para prazos próximos",true],
              ["Audiências próximas","Lembrete de audiências nos próximos 3 dias",true],
              ["Parcelas em atraso","Notificação de parcelas vencidas não baixadas",true],
              ["Novos processos","Aviso quando um novo processo é cadastrado",false],
              ["Relatório semanal","Resumo de produtividade toda segunda-feira",false],
            ].map(([titulo,desc,ativo],i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:C.cardHi,borderRadius:12,border:`1px solid ${C.border}`,marginBottom:8}}>
                <div>
                  <div style={{color:C.text,fontWeight:600,fontSize:13}}>{titulo}</div>
                  <div style={{color:C.muted,fontSize:12,marginTop:2}}>{desc}</div>
                </div>
                <div style={{width:42,height:24,borderRadius:12,background:ativo?C.accent:C.border,position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0}}>
                  <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:ativo?21:3,transition:"left .2s"}}/>
                </div>
              </div>
            ))}
          </div>)}
        </div>
      </div>
    </div>
  );
}

// ── PRODUTIVIDADE ─────────────────────────────────────────────────────────────
function Produtividade({advs,processos,andamentos,pecas,contratos,clientes}){
  const[periodo,setPeriodo]=useState("mes");
  const hoje=today();
  // Filtro de período
  function inPeriodo(data){
    if(!data)return false;
    const d=new Date(data+"T12:00:00");const n=new Date(hoje+"T12:00:00");
    if(periodo==="semana"){const s=new Date(n);s.setDate(s.getDate()-7);return d>=s;}
    if(periodo==="mes"){const m=new Date(n);m.setDate(1);return d>=m;}
    if(periodo==="trimestre"){const t=new Date(n);t.setMonth(t.getMonth()-3);return d>=t;}
    if(periodo==="ano"){return d.getFullYear()===n.getFullYear();}
    return true;
  }
  // Totais escritório
  const totalPecas=pecas.filter(p=>inPeriodo(p.data)).length;
  const totalAndamentos=andamentos.filter(a=>inPeriodo(a.data)).length;
  const totalContratos=contratos.filter(c=>{const primeiraP=c.parcelas?.[0];return primeiraP&&inPeriodo(primeiraP.venc.slice(0,10)||hoje);}).length;
  const totalMins=andamentos.filter(a=>inPeriodo(a.data)).reduce((s,a)=>s+(a.horas||0)*60+(a.minutos||0),0);
  const procAtivos=processos.filter(p=>p.status==="ativo").length;
  const recMes=contratos.reduce((s,c)=>s+c.parcelas.filter(p=>p.status==="paga"&&inPeriodo(p.dataPag)).reduce((a,p)=>a+p.valor,0),0);

  // Por advogado
  const statsAdv=advs.map(a=>{
    const minsTot=andamentos.filter(x=>x.usuario===a.id&&inPeriodo(x.data)).reduce((s,x)=>s+(x.horas||0)*60+(x.minutos||0),0);
    const pecasAdv=pecas.filter(p=>p.advId===a.id&&inPeriodo(p.data)).length;
    const andsAdv=andamentos.filter(x=>x.usuario===a.id&&inPeriodo(x.data)).length;
    const procsAdv=processos.filter(p=>p.responsavel===a.id&&p.status==="ativo").length;
    const contrsAdv=contratos.filter(c=>c.rateios&&c.rateios.some(r=>r.advId===a.id)).length;
    const recAdv=contratos.reduce((s,c)=>{
      const r=c.rateios&&c.rateios.find(x=>x.advId===a.id);
      if(!r)return s;
      return s+c.parcelas.filter(p=>p.status==="paga"&&inPeriodo(p.dataPag)).reduce((acc,p)=>acc+p.valor*(parseFloat(r.perc)||0)/100,0);
    },0);
    return{...a,mins:minsTot,pecas:pecasAdv,ands:andsAdv,procs:procsAdv,contrs:contrsAdv,rec:recAdv};
  });

  const maxPecas=Math.max(...statsAdv.map(a=>a.pecas),1);
  const maxAnds=Math.max(...statsAdv.map(a=>a.ands),1);
  const maxMins=Math.max(...statsAdv.map(a=>a.mins),1);

  const periodos=[["semana","7 dias"],["mes","Este mês"],["trimestre","Trimestre"],["ano","Este ano"]];

  function BarMini({val,max,color}){
    const pct=Math.max(4,(val/max)*100);
    return(<div style={{flex:1,background:C.border,borderRadius:20,height:6,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,background:color,height:"100%",borderRadius:20,transition:"width .5s ease"}}/>
    </div>);
  }

  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <h2 style={{color:C.text,margin:0,fontFamily:"'DM Serif Display',serif",fontSize:24,fontWeight:400,letterSpacing:"-0.3px"}}>📊 Produtividade</h2>
      <div style={{display:"flex",gap:4,background:C.cardHi,borderRadius:20,padding:4,border:`1px solid ${C.border}`}}>
        {periodos.map(([v,l])=>(<button key={v} onClick={()=>setPeriodo(v)} style={{padding:"6px 14px",borderRadius:16,background:periodo===v?C.accent:"transparent",color:periodo===v?"#fff":C.muted,border:"none",cursor:"pointer",fontSize:12,fontWeight:periodo===v?700:400,transition:"all .18s"}}>{l}</button>))}
      </div>
    </div>

    {/* KPIs do escritório */}
    <Grid cols="repeat(5,1fr)" gap={12} style={{marginBottom:20}}>
      {[
        ["📄",totalPecas,"Peças elaboradas",C.accent],
        ["⚖️",totalAndamentos,"Andamentos",C.accent2],
        ["📋",totalContratos,"Contratos fechados",C.success],
        ["⏱",fmtHoras(Math.floor(totalMins/60),totalMins%60),"Horas trabalhadas",C.warning],
        ["💰",`R$ ${recMes.toLocaleString("pt-BR",{minimumFractionDigits:0})}`, "Recebido no período",C.gold],
      ].map(([icon,val,label,cor])=>(
        <Card key={label} style={{textAlign:"center",padding:16,border:`1px solid ${cor}22`,boxShadow:`0 2px 16px rgba(0,0,0,0.15),0 0 0 1px ${cor}11 inset`}}>
          <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
          <div style={{color:cor,fontSize:22,fontWeight:800,letterSpacing:"-0.5px",lineHeight:1.1}}>{val}</div>
          <div style={{color:C.muted,fontSize:10.5,marginTop:6,textTransform:"uppercase",letterSpacing:"0.3px"}}>{label}</div>
        </Card>
      ))}
    </Grid>

    {/* Ranking por advogado */}
    <Card style={{marginBottom:16}}>
      <div style={{color:C.text,fontWeight:700,fontSize:14,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>🏆 Ranking de Produtividade — Advogados</span>
        <span style={{color:C.muted,fontSize:11,fontWeight:400}}>{periodos.find(p=>p[0]===periodo)?.[1]}</span>
      </div>
      {/* Cabeçalho */}
      <div style={{display:"grid",gridTemplateColumns:"180px 1fr 1fr 1fr 80px 100px",gap:8,alignItems:"center",paddingBottom:10,borderBottom:`1px solid ${C.border}`,marginBottom:8}}>
        {["Advogado","Peças","Andamentos","Horas","Processos","Recebido"].map(h=>(
          <div key={h} style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:"0.5px",textTransform:"uppercase"}}>{h}</div>
        ))}
      </div>
      {[...statsAdv].sort((a,b)=>b.pecas+b.ands-(a.pecas+a.ands)).map((a,rank)=>(
        <div key={a.id} style={{display:"grid",gridTemplateColumns:"180px 1fr 1fr 1fr 80px 100px",gap:8,alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}44`,transition:"background .15s"}}>
          {/* Nome */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:22,height:22,borderRadius:6,background:rank===0?C.gold+"30":C.border+"44",color:rank===0?C.gold:C.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>
              {rank===0?"🥇":rank===1?"🥈":rank===2?"🥉":rank+1}
            </div>
            <div>
              <div style={{color:a.cor,fontWeight:700,fontSize:12,lineHeight:1.2}}>{a.nome.split(" ")[0]} {a.nome.split(" ").at(-1)}</div>
              <div style={{color:C.muted,fontSize:10}}>{a.oab}</div>
            </div>
          </div>
          {/* Peças */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:C.accent,fontWeight:700,fontSize:13}}>{a.pecas}</span></div>
            <BarMini val={a.pecas} max={maxPecas} color={C.accent}/>
          </div>
          {/* Andamentos */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{color:C.accent2,fontWeight:700,fontSize:13}}>{a.ands}</span></div>
            <BarMini val={a.ands} max={maxAnds} color={C.accent2}/>
          </div>
          {/* Horas */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            <div style={{color:C.warning,fontWeight:700,fontSize:13}}>{fmtHoras(Math.floor(a.mins/60),a.mins%60)}</div>
            <BarMini val={a.mins} max={maxMins} color={C.warning}/>
          </div>
          {/* Processos */}
          <div style={{textAlign:"center"}}>
            <span style={{background:a.cor+"22",color:a.cor,borderRadius:8,padding:"3px 10px",fontSize:12,fontWeight:700}}>{a.procs}</span>
          </div>
          {/* Recebido */}
          <div style={{color:C.success,fontWeight:700,fontSize:12,textAlign:"right"}}>R$ {a.rec.toLocaleString("pt-BR",{minimumFractionDigits:0})}</div>
        </div>
      ))}
    </Card>

    {/* Gráfico de barras comparativo */}
    <Grid cols="1fr 1fr" gap={16}>
      <Card>
        <div style={{color:C.text,fontWeight:700,fontSize:13,marginBottom:16}}>📄 Peças por Advogado</div>
        {[...statsAdv].sort((a,b)=>b.pecas-a.pecas).map(a=>(
          <div key={a.id} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{color:a.cor,fontSize:12,fontWeight:600}}>{a.nome.split(" ")[0]}</span>
              <span style={{color:C.accent,fontSize:12,fontWeight:700}}>{a.pecas}</span>
            </div>
            <div style={{background:C.border,borderRadius:20,height:8,overflow:"hidden"}}>
              <div style={{width:`${maxPecas>0?(a.pecas/maxPecas)*100:0}%`,background:a.cor,height:"100%",borderRadius:20,transition:"width .5s ease",minWidth:a.pecas>0?4:0}}/>
            </div>
          </div>
        ))}
      </Card>
      <Card>
        <div style={{color:C.text,fontWeight:700,fontSize:13,marginBottom:16}}>⏱ Horas por Advogado (Timesheet)</div>
        {[...statsAdv].sort((a,b)=>b.mins-a.mins).map(a=>(
          <div key={a.id} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{color:a.cor,fontSize:12,fontWeight:600}}>{a.nome.split(" ")[0]}</span>
              <span style={{color:C.warning,fontSize:12,fontWeight:700}}>{fmtHoras(Math.floor(a.mins/60),a.mins%60)}</span>
            </div>
            <div style={{background:C.border,borderRadius:20,height:8,overflow:"hidden"}}>
              <div style={{width:`${maxMins>0?(a.mins/maxMins)*100:0}%`,background:C.warning,height:"100%",borderRadius:20,transition:"width .5s ease",minWidth:a.mins>0?4:0}}/>
            </div>
          </div>
        ))}
      </Card>
    </Grid>
  </div>);
}

// ── APP PRINCIPAL ────────────────────────────────────────────────────────────
const MENU=[
  {id:"dashboard",icon:"🏠",label:"Dashboard"},
  {id:"clientes",icon:"👥",label:"Clientes"},
  {id:"processos",icon:"⚖️",label:"Processos"},
  {id:"agenda",icon:"📅",label:"Agenda & Prazos"},
  {id:"financeiro",icon:"💰",label:"Financeiro"},
  {id:"documentos",icon:"📄",label:"Documentos"},
  {id:"colaboradores",icon:"👨‍⚖️",label:"Colaboradores"},
  {id:"produtividade",icon:"📊",label:"Produtividade"},
  {id:"efi",icon:"🏦",label:"Banco Efí"},
];

export default function App(){
  const[tema,setTemaState]=useState("dark");
  const[mod,setMod]=useState("dashboard");
  const[showConfig,setShowConfig]=useState(false);
  const[showBusca,setShowBusca]=useState(false);
  const[showNotifs,setShowNotifs]=useState(false);
  const[showAudit,setShowAudit]=useState(false);
  const[showCalcHon,setShowCalcHon]=useState(false);
  const[showMapaRiscos,setShowMapaRiscos]=useState(false);
  const[usuario,setUsuario]=useState({id:"ADV001",nome:"Dr. André Ferreira",oab:"SP 123.456",email:"andre@escritorio.com",tel:"(11) 99000-0001",perfil:"Administrador",cor:"#4f8ef7"});
  const[clientes,setClientes]=useState(initClientes);
  const[advs,setAdvs]=useState(initAdv);
  const[processos,setProcessos]=useState(initProcessos);
  const[andamentos,setAndamentos]=useState(initAndamentos);
  const[agenda,setAgenda]=useState(initAgenda);
  const[contratos,setContratos]=useState(initContratos);
  const[pecas,setPecas]=useState(initPecas);
  const[servicosAvulsos,setServicosAvulsos]=useState(initServicosAvulsos);
  const[escritorio,setEscritorio]=useState({nome:"Escritório Advocacia Exemplo",cnpj:"12.345.678/0001-99",oab:"SP 123.456",email:"contato@escritorio.com.br",telefone:"(11) 3456-7890",cep:"01310-100",endereco:"Av. Paulista, 1000, Sala 501",bairro:"Bela Vista",cidade:"São Paulo",uf:"SP",site:"www.escritorio.com.br",caixaPercDefault:10});

  // Notificações geradas dinamicamente
  const hoje=today();
  const em7=new Date();em7.setDate(em7.getDate()+7);const em7s=em7.toISOString().split("T")[0];
  const em3=new Date();em3.setDate(em3.getDate()+3);const em3s=em3.toISOString().split("T")[0];
  const[notifLidas,setNotifLidas]=useState([]);
  const notifsDinamicas=React.useMemo(()=>{
    const ns=[];
    agenda.filter(e=>e.data>=hoje&&e.data<=em3s&&(e.tipo==="prazo"||e.tipo==="audiencia")).forEach(e=>{ns.push({id:"ag_"+e.id,icon:"⏰",titulo:`Prazo urgente: ${e.titulo}`,msg:`${fmtComDia(e.data)} às ${e.hora||"—"}`,data:"Agenda",tipo:"urgente"});});
    contratos.forEach(c=>c.parcelas.forEach(p=>{if(p.status==="atrasada"||(p.venc<hoje&&p.status==="aberta")){ns.push({id:"fin_"+c.id+"_"+p.n,icon:"💸",titulo:`Parcela em atraso — ${c.id}`,msg:`Parcela ${p.n} venceu em ${fmt(p.venc)} (R$ ${p.valor.toLocaleString("pt-BR")})`,data:"Financeiro",tipo:"atraso"});}}));
    processos.filter(p=>p.status==="ativo").forEach(p=>{const ands=andamentos.filter(a=>a.processoId===p.id);if(ands.length>0){const ua=ands.map(a=>a.data).sort().at(-1);const diff=Math.floor((new Date()-new Date(ua+"T12:00:00"))/(1000*60*60*24));if(diff>30)ns.push({id:"proc_"+p.id,icon:"📂",titulo:`Processo sem atualização — ${p.id}`,msg:`Último andamento há ${diff} dias`,data:"Processos",tipo:"atencao"});}});
    return ns.map(n=>({...n,lida:notifLidas.includes(n.id)}));
  },[agenda,contratos,processos,andamentos,notifLidas,hoje,em3s]);
  const naoLidas=notifsDinamicas.filter(n=>!n.lida).length;

  // Keyboard shortcut: Ctrl+K → busca global
  useEffect(()=>{
    const h=(e)=>{if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();setShowBusca(true);}};
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);
  },[]);

  // Troca de tema — atualiza o objeto C global e força re-render
  const[,forceRender]=useState(0);
  function setTema(t){
    setTemaState(t);
    const p=t==="light"?PALETA_LIGHT:PALETA_DARK;
    Object.assign(C,p);
    forceRender(n=>n+1);
  }

  const gs=makeGS(tema);
  const sidebarLight=tema==="light"?"#1a2e48":C.sidebar;

  return(<div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:"'DM Sans',system-ui,sans-serif",overflow:"hidden"}}><style>{gs}</style>
    {showConfig&&<Configuracoes tema={tema} setTema={setTema} usuario={usuario} setUsuario={setUsuario} escritorio={escritorio} setEscritorio={setEscritorio} onClose={()=>setShowConfig(false)}/>}
    {showBusca&&<BuscaGlobal clientes={clientes} processos={processos} andamentos={andamentos} pecas={pecas} onNavegar={m=>{setMod(m);}} onClose={()=>setShowBusca(false)}/>}
    {showNotifs&&<PainelNotificacoes notifs={notifsDinamicas} onMarcarLida={id=>setNotifLidas(l=>[...l,id])} onMarcarTodas={()=>setNotifLidas(notifsDinamicas.map(n=>n.id))} onClose={()=>setShowNotifs(false)}/>}
    {showAudit&&<LogAuditoria usuario={usuario.nome} onClose={()=>setShowAudit(false)}/>}
    {showCalcHon&&<CalcHonorarios onClose={()=>setShowCalcHon(false)}/>}
    {showMapaRiscos&&<MapaRiscos processos={processos} clientes={clientes} onClose={()=>setShowMapaRiscos(false)}/>}
    {/* SIDEBAR */}
    <div style={{width:230,background:sidebarLight,borderRight:`1px solid ${tema==="light"?"#2a4a70":C.border}`,display:"flex",flexDirection:"column",flexShrink:0,boxShadow:"4px 0 24px rgba(0,0,0,0.4)",position:"relative"}}>
      {/* Logo */}
      <div style={{padding:"22px 18px 18px",borderBottom:`1px solid rgba(255,255,255,0.08)`,background:`linear-gradient(180deg,rgba(74,158,255,0.1) 0%,transparent 100%)`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${C.gold},${C.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 4px 12px ${C.gold}55`}}>⚖️</div>
          <div>
            <div style={{color:"#ddeeff",fontWeight:700,fontSize:15,letterSpacing:"0.5px",fontFamily:"'DM Serif Display',serif"}}>SGE</div>
            <div style={{color:"#8aaccc",fontSize:10,letterSpacing:"0.8px",textTransform:"uppercase",marginTop:1}}>Gestão Advocatícia</div>
          </div>
          {/* Botão tema no topo */}
          <button onClick={()=>setTema(tema==="dark"?"light":"dark")} title={tema==="dark"?"Modo claro":"Modo escuro"} style={{marginLeft:"auto",width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:"#ddeeff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}}>
            {tema==="dark"?"☀️":"🌙"}
          </button>
        </div>
        {/* Busca global */}
        <button onClick={()=>setShowBusca(true)} style={{width:"100%",marginTop:12,display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:10,padding:"7px 12px",color:"#8aaccc",cursor:"pointer",fontSize:12,textAlign:"left"}}>
          <span>🔍</span><span style={{flex:1}}>Buscar... </span><span style={{fontSize:10,opacity:0.6}}>Ctrl+K</span>
        </button>
      </div>
      {/* Nav */}
      <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
        {MENU.map(m=>(<button key={m.id} onClick={()=>setMod(m.id)}
          style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 13px",borderRadius:12,border:`1px solid ${mod===m.id?"rgba(74,158,255,0.4)":"transparent"}`,background:mod===m.id?"rgba(74,158,255,0.18)":"transparent",color:mod===m.id?"#7ec8e3":"#8aaccc",cursor:"pointer",fontSize:13,fontWeight:mod===m.id?600:400,marginBottom:3,textAlign:"left",transition:"all .18s ease",boxShadow:mod===m.id?"0 2px 12px rgba(74,158,255,0.15)":"none"}}>
          <span style={{fontSize:15}}>{m.icon}</span>
          <span style={{flex:1}}>{m.label}</span>
          {m.id==="agenda"&&naoLidas>0&&<span style={{background:C.danger,color:"#fff",borderRadius:10,padding:"1px 7px",fontSize:10,fontWeight:700}}>{naoLidas}</span>}
        </button>))}
        {/* Ferramentas rápidas */}
        <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          {[["⚖️ Calc. Honorários",()=>setShowCalcHon(true)],["🎯 Mapa de Riscos",()=>setShowMapaRiscos(true)],["📋 Log de Auditoria",()=>setShowAudit(true)]].map(([l,fn])=>(
            <button key={l} onClick={fn} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 13px",borderRadius:10,border:"none",background:"transparent",color:"#6a8aaa",cursor:"pointer",fontSize:11.5,textAlign:"left",transition:"all .15s",marginBottom:1}} onMouseEnter={e=>e.currentTarget.style.background="rgba(74,158,255,0.08)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{l}</button>
          ))}
        </div>
      </nav>
      {/* Rodapé — usuário + notificações + configurações */}
      <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,0.08)",background:"rgba(74,158,255,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${C.gold},${C.goldHi})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>👤</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:"#ddeeff",fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{usuario.nome}</div>
            <div style={{color:"#8aaccc",fontSize:10,marginTop:1}}>{usuario.perfil}</div>
          </div>
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowNotifs(true)} title="Notificações" style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",color:"#8aaccc",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}}>🔔</button>
            {naoLidas>0&&<span style={{position:"absolute",top:-4,right:-4,background:C.danger,color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>{naoLidas}</span>}
          </div>
          <button onClick={()=>setShowConfig(true)} title="Configurações" style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.10)",color:"#8aaccc",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0}}>
            ⚙️
          </button>
        </div>
      </div>
    </div>
    {/* CONTEÚDO PRINCIPAL */}
    <div style={{flex:1,overflowY:"auto",padding:"28px 32px",background:tema==="light"?`radial-gradient(ellipse 80% 50% at 20% -10%,rgba(26,111,196,0.06),transparent),${C.bg}`:`radial-gradient(ellipse 80% 50% at 20% -10%, ${C.accent}09, transparent), radial-gradient(ellipse 60% 40% at 80% 110%, ${C.accent2}06, transparent), ${C.bg}`}}>
      {mod==="dashboard"&&<Dashboard clientes={clientes} processos={processos} agenda={agenda} contratos={contratos} andamentos={andamentos} pecas={pecas} advs={advs} servicosAvulsos={servicosAvulsos}/>}
      {mod==="clientes"&&<Clientes clientes={clientes} setClientes={setClientes} andamentos={andamentos}/>}
      {mod==="processos"&&<Processos processos={processos} setProcessos={setProcessos} clientes={clientes} andamentos={andamentos} setAndamentos={setAndamentos} pecas={pecas} setPecas={setPecas} advs={advs} agenda={agenda} setAgenda={setAgenda}/>}
      {mod==="agenda"&&<Agenda agenda={agenda} setAgenda={setAgenda} processos={processos} advs={advs}/>}
      {mod==="financeiro"&&<Financeiro contratos={contratos} setContratos={setContratos} clientes={clientes} processos={processos} advs={advs} servicosAvulsos={servicosAvulsos} setServicosAvulsos={setServicosAvulsos}/>}
      {mod==="documentos"&&<Documentos clientes={clientes} processos={processos} escritorio={escritorio}/>}
      {mod==="colaboradores"&&<Colaboradores advs={advs} setAdvs={setAdvs} processos={processos} agenda={agenda} andamentos={andamentos}/>}
      {mod==="produtividade"&&<Produtividade advs={advs} processos={processos} andamentos={andamentos} pecas={pecas} contratos={contratos} clientes={clientes}/>}
      {mod==="efi"&&<EfiBankIntegracao contratos={contratos} clientes={clientes} setContratos={setContratos}/>}
    </div>
  </div>);
}
