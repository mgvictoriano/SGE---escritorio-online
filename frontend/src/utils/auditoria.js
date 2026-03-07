let _auditLog = [];

export function registrarAuditoria(usuario, acao, modulo, detalhe = "") {
  _auditLog.unshift({
    id: Date.now(),
    ts: new Date().toLocaleString("pt-BR"),
    usuario,
    acao,
    modulo,
    detalhe,
  });
  if (_auditLog.length > 200) _auditLog = _auditLog.slice(0, 200);
}

export { _auditLog };
