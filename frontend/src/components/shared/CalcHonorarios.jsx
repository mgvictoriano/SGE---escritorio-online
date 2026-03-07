import { useState } from "react";
import { C } from '../../constants/paleta';
import Inp from '../ui/Inp';

const FASES_OAB = [
  {fase:"Conhecimento (1º grau)",   min:10, max:20, desc:"Art. 85 CPC"},
  {fase:"Recursal (2º grau)",        min:10, max:20, desc:"Art. 85 §11 CPC"},
  {fase:"Execução",                  min:10, max:20, desc:"Sobre o proveito"},
  {fase:"Cautelar/Tutela",           min:10, max:20, desc:"Percentual estimado"},
  {fase:"Consultoria/Preventivo",    min:0,  max:0,  desc:"Valor fixo — tabela OAB"},
];

export default function CalcHonorarios({ onClose }) {
  const [valor, setValor] = useState("");
  const [fase, setFase] = useState(0);
  const [perc, setPerc] = useState(10);
  const f = FASES_OAB[fase];
  const vn = parseFloat((valor || "0").replace(/\./g, "").replace(",", ".")) || 0;
  const honorario = vn * (perc / 100);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fadeUp" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, width: "100%", maxWidth: 480, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 17 }}>⚖️ Calculadora de Honorários</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ color: C.silver, fontSize: 11.5, fontWeight: 500, display: "block", marginBottom: 5 }}>Fase Processual</label>
            <select value={fase} onChange={e => setFase(Number(e.target.value))} style={{ width: "100%", background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 13px", color: C.text, fontSize: 13, outline: "none" }}>
              {FASES_OAB.map((f, i) => <option key={i} value={i}>{f.fase}</option>)}
            </select>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{f.desc} — faixa: {f.min}% a {f.max || "—"}%</div>
          </div>
          <Inp label="Valor da Causa (R$)" value={valor} onChange={setValor} placeholder="0,00" />
          <div>
            <label style={{ color: C.silver, fontSize: 11.5, fontWeight: 500, display: "block", marginBottom: 5 }}>Percentual dos Honorários: <span style={{ color: C.accent, fontWeight: 700 }}>{perc}%</span></label>
            <input type="range" min={f.min || 5} max={f.max || 30} step={0.5} value={perc} onChange={e => setPerc(Number(e.target.value))} style={{ width: "100%", accentColor: C.accent }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: C.muted, fontSize: 11 }}><span>Mín: {f.min || 5}%</span><span>Máx: {f.max || 30}%</span></div>
          </div>
          <div style={{ background: C.accent + "12", border: `1px solid ${C.accent}30`, borderRadius: 14, padding: 20, textAlign: "center" }}>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 4 }}>Honorários estimados</div>
            <div style={{ color: C.accent, fontSize: 30, fontWeight: 700 }}>R$ {honorario.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 6 }}>{perc}% sobre R$ {vn.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
          </div>
          <div style={{ color: C.muted, fontSize: 10, textAlign: "center", fontStyle: "italic" }}>Estimativa baseada na tabela OAB. Consulte sempre a tabela oficial do estado.</div>
        </div>
      </div>
    </div>
  );
}
