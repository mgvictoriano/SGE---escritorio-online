-- =============================================================================
-- V5 - Representantes legais de clientes PJ
-- Um cliente PJ pode ter múltiplos representantes
-- Obrigatório ao menos 1 para clientes do tipo PJ (regra de negócio no backend)
-- =============================================================================

CREATE TABLE sge_victoriano.representantes_legais (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id      UUID NOT NULL REFERENCES sge_victoriano.clientes(id) ON DELETE CASCADE,
    nome            VARCHAR(255) NOT NULL,
    cpf             VARCHAR(14) NOT NULL,
    cargo           VARCHAR(100) NOT NULL,
    version         BIGINT NOT NULL DEFAULT 0,

    created_date    TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,
    modified_date   TIMESTAMP,
    modified_by     UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_representantes_cliente_id ON sge_victoriano.representantes_legais(cliente_id);
