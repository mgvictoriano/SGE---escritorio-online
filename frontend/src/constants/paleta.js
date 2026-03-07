export const PALETA_DARK = {
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

export const PALETA_LIGHT = {
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

// C é mutado em lugar pelo App ao trocar o tema via Object.assign(C, novaPaleta)
export let C = {...PALETA_DARK};

export function makeGS(tema) {
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
`;
}
