import { useState } from "react";
import { C } from '../../constants/paleta';
import Btn from '../ui/Btn';

function useCepLookup(onFill) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const buscar = async (cep) => {
    const c = cep.replace(/\D/g, "");
    if (c.length !== 8) return;
    setLoading(true);
    setErro("");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${c}/json/`);
      const d = await r.json();
      if (d.erro) {
        setErro("CEP não encontrado.");
      } else {
        onFill(d);
      }
    } catch (e) {
      setErro("Erro ao buscar CEP.");
    } finally {
      setLoading(false);
    }
  };

  return { buscar, loading, erro };
}

export default function CepInput({ value, onChange, onFill }) {
  const { buscar, loading, erro } = useCepLookup(onFill);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ color: C.silver, fontSize: 11.5, fontWeight: 500, letterSpacing: "0.3px" }}>CEP</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="00000-000"
          style={{ flex: 1, background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 13px", color: C.text, fontSize: 13.5, outline: "none" }}
        />
        <Btn label={loading ? "…" : "Buscar"} small onClick={() => buscar(value)} disabled={loading} color={C.accent2} />
      </div>
      {erro && <span style={{ color: C.danger, fontSize: 11 }}>{erro}</span>}
    </div>
  );
}
