-- =============================================================================
-- V3 - Tabela de telefones
-- Separada pois uma pessoa pode ter múltiplos telefones
-- DDD separado do número para facilitar formatação e filtros
-- =============================================================================

CREATE TABLE sge_victoriano.telefones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID NOT NULL REFERENCES sge_victoriano.usuarios(id) ON DELETE CASCADE,
    ddd             CHAR(2) NOT NULL,
    numero          VARCHAR(10) NOT NULL,               -- apenas dígitos, sem formatação
    tipo            VARCHAR(20) NOT NULL DEFAULT 'celular'
                    CHECK (tipo IN ('celular', 'fixo', 'whatsapp', 'comercial')),
    principal       BOOLEAN NOT NULL DEFAULT FALSE,     -- telefone de contato principal
    version         BIGINT NOT NULL DEFAULT 0,

    created_date    TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      UUID,
    modified_date   TIMESTAMP,
    modified_by     UUID
);

-- Índice para buscar telefones de um usuário
CREATE INDEX idx_telefones_usuario_id ON sge_victoriano.telefones(usuario_id);

-- Garante que cada usuário tenha no máximo um telefone principal
CREATE UNIQUE INDEX idx_telefones_principal
    ON sge_victoriano.telefones(usuario_id)
    WHERE principal = TRUE;
