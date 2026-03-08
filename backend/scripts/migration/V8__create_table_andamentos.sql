-- =============================================================================
-- V8 - Andamentos do processo (timesheet + histórico)
-- =============================================================================

CREATE TABLE sge_victoriano.andamentos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_key    VARCHAR(100) NOT NULL UNIQUE,           -- chave de negócio para integrações
    processo_id     UUID NOT NULL REFERENCES sge_victoriano.processos(id) ON DELETE CASCADE,
    documento_id    UUID,                                   -- FK adicionada em V12 após criação de docs_processuais
    usuario_id      UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,
    data            DATE NOT NULL,
    data_vencimento DATE,                                   -- prazo/vencimento deste andamento
    tipo_andamento  VARCHAR(30)
                    CHECK (tipo_andamento IN ('movimentacao', 'prazo', 'audiencia', 'despacho', 'sentenca', 'peticao', 'outros')),
    descricao       TEXT NOT NULL,
    origem          VARCHAR(20) NOT NULL DEFAULT 'manual'
                    CHECK (origem IN ('manual', 'sistema', 'importado')),
    relevancia      VARCHAR(20)
                    CHECK (relevancia IN ('prazo', 'audiencia', 'despacho', 'sentenca', 'urgente')),
    horas           SMALLINT NOT NULL DEFAULT 0,
    minutos         SMALLINT NOT NULL DEFAULT 0
                    CHECK (minutos BETWEEN 0 AND 59),
    tipo_peca       VARCHAR(100),
    version         BIGINT NOT NULL DEFAULT 0,

    created_date    TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,
    modified_date   TIMESTAMP,
    modified_by     UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_andamentos_processo_id    ON sge_victoriano.andamentos(processo_id);
CREATE INDEX idx_andamentos_usuario_id     ON sge_victoriano.andamentos(usuario_id);
CREATE INDEX idx_andamentos_documento_id   ON sge_victoriano.andamentos(documento_id);
CREATE INDEX idx_andamentos_data           ON sge_victoriano.andamentos(data);
CREATE INDEX idx_andamentos_data_vencimento ON sge_victoriano.andamentos(data_vencimento);
CREATE INDEX idx_andamentos_tipo_andamento ON sge_victoriano.andamentos(tipo_andamento);
