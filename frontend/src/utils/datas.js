export const DIAS_PT = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
export const DIAS_ABREV = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export function getDiaSemana(iso) {
  const d = new Date(iso + "T12:00:00");
  return DIAS_PT[d.getDay()];
}

export function getDiaAbrev(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return DIAS_ABREV[d.getDay()];
}

export function fmt(d) {
  if (!d) return "";
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

export function fmtComDia(d) {
  if (!d) return "";
  return `${fmt(d)} (${getDiaAbrev(d)})`;
}

export function today() {
  return new Date().toISOString().split("T")[0];
}
