-- =============================================================================
-- V9 - Peças processuais
-- Registro das peças produzidas por processo
-- =============================================================================

CREATE TABLE sge_victoriano.pecas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id     UUID NOT NULL REFERENCES sge_victoriano.processos(id) ON DELETE CASCADE,
    usuario_id      UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,
    data            DATE NOT NULL,
    nome            VARCHAR(200) NOT NULL,
    tipo            VARCHAR(100) NOT NULL,
    obs             TEXT,
    arquivo_url     TEXT,                                   -- path no storage (futuro)
    version         BIGINT NOT NULL DEFAULT 0,

    created_date    TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,
    modified_date   TIMESTAMP,
    modified_by     UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_pecas_processo_id ON sge_victoriano.pecas(processo_id);
CREATE INDEX idx_pecas_usuario_id  ON sge_victoriano.pecas(usuario_id);
