-- =============================================================================
-- V1 - Tabela de endereços
-- Criada antes de usuarios pois usuarios referencia esta tabela
-- =============================================================================

CREATE TABLE sge_victoriano.enderecos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logradouro      VARCHAR(200) NOT NULL,
    numero          VARCHAR(20),
    complemento     VARCHAR(100),
    bairro          VARCHAR(100),
    cidade          VARCHAR(100) NOT NULL,
    estado          CHAR(2) NOT NULL,
    cep             VARCHAR(9),                         -- formato: 00000-000
    pais            VARCHAR(60) NOT NULL DEFAULT 'Brasil',
    version         BIGINT NOT NULL DEFAULT 0,

    created_date    TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      UUID,
    modified_date   TIMESTAMP,
    modified_by     UUID
);
