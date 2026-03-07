import { C } from './paleta';

export const BANCOS = ["Efí","NuBank","Cora","Itaú","Santander","Banco do Brasil","Outro"];
export const FORMAS_PAG = ["Pix","Boleto","Cartão de Crédito","Cartão de Débito","Carnê","Dinheiro","TED/DOC"];

export const TIPOS_DOC_PROCESSUAL = [
  {value:"oficio",    label:"Ofício",     prazoPadrao:15, tipoPrazo:"uteis"},
  {value:"decisao",   label:"Decisão",    prazoPadrao:15, tipoPrazo:"uteis"},
  {value:"despacho",  label:"Despacho",   prazoPadrao:5,  tipoPrazo:"uteis"},
  {value:"sentenca",  label:"Sentença",   prazoPadrao:15, tipoPrazo:"uteis"},
  {value:"acordao",   label:"Acórdão",    prazoPadrao:15, tipoPrazo:"uteis"},
  {value:"intimacao", label:"Intimação",  prazoPadrao:15, tipoPrazo:"uteis"},
  {value:"citacao",   label:"Citação",    prazoPadrao:15, tipoPrazo:"uteis"},
];

export const TIPOS_PECA = [
  "Petição Inicial","Contestação","Réplica","Recurso de Apelação","Agravo de Instrumento",
  "Agravo Interno","Agravo Regimental","Embargos de Declaração","Recurso Especial",
  "Recurso Extraordinário","Mandado de Segurança","Habeas Corpus","Ação Cautelar",
  "Execução de Sentença","Impugnação","Exceção de Incompetência","Memoriais",
  "Razões Finais","Parecer","Outro",
];

// Mapeamento de status → cor (referencia C para respeitar o tema ativo)
export const getStatusClr = () => ({
  ativo:     C.success,
  suspenso:  C.warning,
  arquivado: C.muted,
  encerrado: C.muted,
});

export const getParcClr = () => ({
  paga:        C.success,
  aberta:      C.accent,
  atrasada:    C.danger,
  renegociada: C.warning,
  cancelada:   C.muted,
});
