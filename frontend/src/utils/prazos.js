import { FERIADOS_DB, SUSPENSOES_TRIBUNAL } from '../constants/feriados';
import { getDiaSemana } from './datas';

export function getFeriado(iso) {
  return FERIADOS_DB.find(f => f.d === iso) || null;
}

export function getSuspensaoTribunal(iso, tribunal) {
  if (!tribunal) return null;
  const chave = Object.keys(SUSPENSOES_TRIBUNAL).find(k => tribunal.includes(k.split(" – ")[0]));
  if (!chave) return null;
  return (SUSPENSOES_TRIBUNAL[chave] || []).find(s => iso >= s.ini && iso <= s.fim) || null;
}

export function isSuspenso(iso, tribunal) {
  return !!getSuspensaoTribunal(iso, tribunal);
}

export function isUtilTribunal(iso, tribunal) {
  const d = new Date(iso + "T12:00:00");
  if (d.getDay() === 0 || d.getDay() === 6) return false;
  if (FERIADOS_DB.find(f => f.d === iso)) return false;
  if (isSuspenso(iso, tribunal)) return false;
  return true;
}

export function addDias(start, qtd, tipo, tribunal = "") {
  const dt = new Date(start + "T12:00:00");
  let cont = 0;
  const desc = [];
  while (cont < qtd) {
    dt.setDate(dt.getDate() + 1);
    const iso = dt.toISOString().split("T")[0];
    if (tipo === "uteis") {
      if (isUtilTribunal(iso, tribunal)) {
        cont++;
      } else {
        const fw = getFeriado(iso);
        const susp = getSuspensaoTribunal(iso, tribunal);
        desc.push({
          iso,
          dia: getDiaSemana(iso),
          feriado: fw ? `${fw.nome} (${fw.tipo}) — ${fw.fonte}` : null,
          suspensao: susp ? `Suspensão: ${susp.motivo}` : null,
          fimSemana: dt.getDay() === 0 ? "Domingo" : dt.getDay() === 6 ? "Sábado" : null,
        });
      }
    } else {
      cont++;
    }
  }
  return { data: dt.toISOString().split("T")[0], desc };
}

export function fmtHoras(h, m) {
  const total = (h || 0) * 60 + (m || 0);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${hh}h${mm > 0 ? ` ${mm}min` : ""}`;
}
