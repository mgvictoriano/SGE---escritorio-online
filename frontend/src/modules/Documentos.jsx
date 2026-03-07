import { useState, useRef } from "react";
import { C } from '../constants/paleta';
import { FORMAS_PAG } from '../constants/dominios';
import { fmt, today } from '../utils/datas';
import { Btn, Card, Grid, Inp, Sel } from '../components/ui';

const PLACEHOLDERS_INFO = `{{NOME}} — Nome | {{CPF_CNPJ}} — CPF/CNPJ | {{RG}} — RG
{{ESTADO_CIVIL}} | {{PROFISSAO}} | {{ENDERECO}} — Endereço completo
{{FINALIDADE}} | {{OBJETO}} | {{VALOR_TOTAL}} | {{N_PARCELAS}}
{{FORMA_PAGAMENTO}} | {{DATA}} | {{CIDADE}}`;

export default function Documentos({ clientes, processos, escritorio }) {
  const timbrado = `<table width="100%"><tr><td style="font-size:18px;font-weight:bold;color:#1a1a2e">${escritorio?.nome || "Escritório"}</td><td style="text-align:right;font-size:12px;color:#555">OAB ${escritorio?.oab || ""}<br>${escritorio?.email || ""}<br>${escritorio?.telefone || ""}</td></tr></table>`;
  const [tipo, setTipo] = useState("procuracao");
  const [modo, setModo] = useState("cadastrado");
  const [clienteId, setClienteId] = useState("");
  const [campos, setCampos] = useState({ cidade: "São Paulo" });
  const [preview, setPreview] = useState(null);
  const [tabDoc, setTabDoc] = useState("gerar");
  const fileRef = useRef();
  const [templateTexto, setTemplateTexto] = useState({
    procuracao: `PROCURAÇÃO AD JUDICIA ET EXTRA\n\nOUTORGANTE: {{NOME}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, portador(a) do CPF nº {{CPF_CNPJ}}, RG nº {{RG}}, residente à {{ENDERECO}}.\n\nOUTORGADOS: [Nome(s) do(s) advogado(s)], OAB/SP nº [número].\n\nFINALIDADE: {{FINALIDADE}}\n\nPoderes: representar o(a) outorgante em juízo ou fora dele, podendo praticar todos os atos necessários ao fiel cumprimento deste mandato.\n\n{{CIDADE}}, {{DATA}}.\n\n___________________________\n{{NOME}}\nOutorgante`,
    hipossuficiencia: `DECLARAÇÃO DE HIPOSSUFICIÊNCIA\n\nEu, {{NOME}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, portador(a) do CPF nº {{CPF_CNPJ}}, residente à {{ENDERECO}}, DECLARO, sob as penas da lei, que não possuo condições financeiras de arcar com as custas processuais sem prejuízo do próprio sustento, requerendo os benefícios da Justiça Gratuita (art. 98 do CPC).\n\n{{CIDADE}}, {{DATA}}.\n\n___________________________\n{{NOME}}\nDeclarante`,
    contrato: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS\n\nCONTRATANTE: {{NOME}}, {{ESTADO_CIVIL}}, {{PROFISSAO}}, portador(a) do CPF nº {{CPF_CNPJ}}, residente à {{ENDERECO}}.\n\nCONTRATADA: [Nome do Escritório], OAB/SP nº [número].\n\nCLÁUSULA 1ª – OBJETO\n{{OBJETO}}\n\nCLÁUSULA 2ª – HONORÁRIOS\nValor total: R$ {{VALOR_TOTAL}}, em {{N_PARCELAS}} parcela(s) via {{FORMA_PAGAMENTO}}.\n\nCLÁUSULA 3ª – INADIMPLÊNCIA\nMulta de 2% e juros de 1% ao mês.\n\n{{CIDADE}}, {{DATA}}.\n\n___________________________\t___________________________\nContratante\t\t\t\tContratada`,
  });

  const cli = clientes.find(c => c.id === clienteId);

  function set(k, v) { setCampos(f => ({ ...f, [k]: v })); setPreview(null); }

  function getQual() {
    if (modo === "cadastrado" && cli) {
      const end = [cli.endereco, cli.numero, cli.bairro, cli.cidade && cli.uf ? `${cli.cidade}/${cli.uf}` : cli.cidade].filter(Boolean).join(", ");
      return { nome: cli.nome, cpfcnpj: cli.cpf, rg: cli.rg || "", estadoCivil: cli.estadoCivil || "", profissao: cli.profissao || "", endereco: end };
    }
    return { nome: campos.nomeM || "", cpfcnpj: campos.cpfM || "", rg: campos.rgM || "", estadoCivil: campos.ecM || "", profissao: campos.profM || "", endereco: campos.endM || "" };
  }

  function gerar() {
    const q = getQual(); const d = fmt(today());
    const repl = (txt) => txt
      .replace(/{{NOME}}/g, q.nome || "[NOME]")
      .replace(/{{CPF_CNPJ}}/g, q.cpfcnpj || "[CPF/CNPJ]")
      .replace(/{{RG}}/g, q.rg || "[RG]")
      .replace(/{{ESTADO_CIVIL}}/g, q.estadoCivil || "[ESTADO CIVIL]")
      .replace(/{{PROFISSAO}}/g, q.profissao || "[PROFISSÃO]")
      .replace(/{{ENDERECO}}/g, q.endereco || "[ENDEREÇO]")
      .replace(/{{FINALIDADE}}/g, campos.finalidade || "[FINALIDADE]")
      .replace(/{{OBJETO}}/g, campos.objeto || "[OBJETO]")
      .replace(/{{VALOR_TOTAL}}/g, campos.valorTotal || "[VALOR]")
      .replace(/{{N_PARCELAS}}/g, campos.parcN || "[PARCELAS]")
      .replace(/{{FORMA_PAGAMENTO}}/g, campos.formaPag || "[FORMA]")
      .replace(/{{DATA}}/g, d)
      .replace(/{{CIDADE}}/g, campos.cidade || "[CIDADE]");
    setPreview(repl(templateTexto[tipo]));
  }

  function imprimirComTimbrado() {
    const janela = window.open("", "_blank");
    janela.document.write(`<html><head><title>Documento</title><style>body{font-family:serif;font-size:14px;line-height:1.8;padding:40px 60px;max-width:800px;margin:auto}pre{white-space:pre-wrap;font-family:serif}.timbrado{text-align:center;margin-bottom:30px;border-bottom:2px solid #333;padding-bottom:20px}</style></head><body>${timbrado ? `<div class="timbrado">${timbrado}</div>` : ""}<pre>${preview}</pre></body></html>`);
    janela.document.close(); janela.print();
  }

  const tiposDoc = [{ v: "procuracao", l: "Procuração" }, { v: "hipossuficiencia", l: "Decl. Hipossuficiência" }, { v: "contrato", l: "Contrato de Honorários" }];

  return (
    <div>
      <h2 style={{ color: C.text, marginBottom: 20, fontFamily: "'DM Serif Display',serif", fontSize: 24, fontWeight: 400, letterSpacing: "-0.3px" }}>Documentos</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["gerar", "templates", "timbrado"].map(t => (
          <Btn key={t} label={t === "gerar" ? "📄 Gerar" : t === "templates" ? "✏️ Templates" : "🖼 Timbrado"} onClick={() => setTabDoc(t)} color={tabDoc === t ? C.accent : C.border} />
        ))}
      </div>

      {tabDoc === "timbrado" && (
        <Card>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 8 }}>Cabeçalho / Timbrado</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>O timbrado é gerado automaticamente com os dados do escritório. Para editar, acesse <strong style={{ color: C.accent }}>⚙️ Configurações → Escritório</strong>.</div>
          <div style={{ background: C.cardHi, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }} dangerouslySetInnerHTML={{ __html: timbrado }} />
        </Card>
      )}

      {tabDoc === "templates" && (
        <Card>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {tiposDoc.map(t => <Btn key={t.v} label={t.l} onClick={() => setTipo(t.v)} color={tipo === t.v ? C.accent : C.border} />)}
          </div>
          <pre style={{ color: C.muted, fontSize: 11, margin: "0 0 8px", background: C.inputBg, padding: 10, borderRadius: 8 }}>{PLACEHOLDERS_INFO}</pre>
          <textarea value={templateTexto[tipo]} onChange={e => setTemplateTexto(tt => ({ ...tt, [tipo]: e.target.value }))} rows={18} style={{ width: "100%", boxSizing: "border-box", background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, color: C.text, fontSize: 13, fontFamily: "monospace", outline: "none", resize: "vertical" }} />
        </Card>
      )}

      {tabDoc === "gerar" && (
        <Grid cols="320px 1fr" gap={20}>
          <div>
            <Card>
              <div style={{ color: C.text, fontWeight: 600, marginBottom: 12 }}>Tipo</div>
              {tiposDoc.map(t => (
                <button key={t.v} onClick={() => { setTipo(t.v); setPreview(null); }} style={{ display: "block", width: "100%", background: tipo === t.v ? C.accent + "22" : "transparent", border: `1px solid ${tipo === t.v ? C.accent : C.border}`, borderRadius: 8, padding: "9px 14px", color: tipo === t.v ? C.accent : C.muted, textAlign: "left", cursor: "pointer", fontWeight: tipo === t.v ? 700 : 400, fontSize: 13, marginBottom: 6 }}>{t.l}</button>
              ))}
              <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 12, paddingTop: 12 }}>
                <div style={{ color: C.text, fontWeight: 600, marginBottom: 8 }}>Cliente</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {["cadastrado", "manual"].map(m => (
                    <button key={m} onClick={() => { setModo(m); setClienteId(""); setCampos({ cidade: "São Paulo" }); setPreview(null); }} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${modo === m ? C.accent : C.border}`, background: modo === m ? C.accent + "22" : "transparent", color: modo === m ? C.accent : C.muted, cursor: "pointer", fontSize: 12 }}>
                      {m === "cadastrado" ? "Cadastrado" : "Manual"}
                    </button>
                  ))}
                </div>
                {modo === "cadastrado" && (
                  <Sel value={clienteId} onChange={v => { setClienteId(v); setPreview(null); }} options={[{ value: "", label: "Selecione..." }, ...clientes.map(c => ({ value: c.id, label: `${c.id} — ${c.nome}` }))]} />
                )}
                {modo === "manual" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Inp label="Nome" value={campos.nomeM || ""} onChange={v => set("nomeM", v)} />
                    <Inp label="CPF/CNPJ" value={campos.cpfM || ""} onChange={v => set("cpfM", v)} />
                    <Inp label="Endereço" value={campos.endM || ""} onChange={v => set("endM", v)} />
                  </div>
                )}
              </div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <Inp label="Cidade" value={campos.cidade || ""} onChange={v => set("cidade", v)} />
                {tipo === "procuracao" && <Inp label="Finalidade" value={campos.finalidade || ""} onChange={v => set("finalidade", v)} />}
                {tipo === "contrato" && (<>
                  <Inp label="Objeto" value={campos.objeto || ""} onChange={v => set("objeto", v)} />
                  <Inp label="Valor total (R$)" value={campos.valorTotal || ""} onChange={v => set("valorTotal", v)} />
                  <Inp label="Nº parcelas" type="number" value={campos.parcN || ""} onChange={v => set("parcN", v)} />
                  <Sel label="Forma de pagamento" value={campos.formaPag || "Pix"} onChange={v => set("formaPag", v)} options={FORMAS_PAG.map(x => ({ value: x, label: x }))} />
                </>)}
              </div>
              <Btn label="Gerar Documento" onClick={gerar} style={{ width: "100%", marginTop: 16 }} />
            </Card>
          </div>
          <div>
            {preview && (
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ color: C.text, fontWeight: 600 }}>Pré-visualização</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn label="📋 Copiar" small onClick={() => navigator.clipboard.writeText(preview)} color={C.accent2} />
                    <Btn label="🖨 Imprimir/PDF" small onClick={imprimirComTimbrado} color={C.success} />
                  </div>
                </div>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "serif", fontSize: 13, color: C.text, lineHeight: 1.8, background: C.inputBg, padding: 20, borderRadius: 10, border: `1px solid ${C.border}`, maxHeight: 500, overflowY: "auto" }}>{preview}</pre>
              </Card>
            )}
            {!preview && (
              <Card style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
                <div style={{ textAlign: "center", color: C.muted }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                  <div>Preencha os campos e clique em "Gerar Documento"</div>
                </div>
              </Card>
            )}
          </div>
        </Grid>
      )}
    </div>
  );
}
