-- =============================================================================
-- V6 - Telefones de clientes
-- Separado de telefones_usuarios pois clientes e usuários são entidades distintas
-- =============================================================================

CREATE TABLE sge_victoriano.telefones_clientes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id      UUID NOT NULL REFERENCES sge_victoriano.clientes(id) ON DELETE CASCADE,
    ddd             CHAR(2) NOT NULL,
    numero          VARCHAR(10) NOT NULL,
    tipo            VARCHAR(20) NOT NULL DEFAULT 'celular'
                    CHECK (tipo IN ('celular', 'fixo', 'whatsapp', 'comercial')),
    principal       BOOLEAN NOT NULL DEFAULT FALSE,
    version         BIGINT NOT NULL DEFAULT 0,

    created_date    TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,
    modified_date   TIMESTAMP,
    modified_by     UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_telefones_clientes_cliente_id ON sge_victoriano.telefones_clientes(cliente_id);

-- Garante apenas um telefone principal por cliente
CREATE UNIQUE INDEX idx_telefones_clientes_principal
    ON sge_victoriano.telefones_clientes(cliente_id)
    WHERE principal = TRUE;
