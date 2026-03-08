-- =============================================================================
-- V4 - Tabela de clientes
-- Suporta Pessoa Física (PF) e Pessoa Jurídica (PJ)
-- Campos exclusivos de PF: rg, estado_civil, profissao
-- Campos exclusivos de PJ: representantes legais (tabela V5)
-- =============================================================================

CREATE TABLE sge_victoriano.clientes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo          VARCHAR(10) NOT NULL UNIQUE,        -- código interno: 0001, 0002...
    tipo_pessoa     CHAR(2) NOT NULL
                    CHECK (tipo_pessoa IN ('PF', 'PJ')),
    nome            VARCHAR(255) NOT NULL,              -- nome completo ou razão social
    cpf_cnpj        VARCHAR(18),                        -- CPF (PF) ou CNPJ (PJ)

    -- Exclusivo PF
    rg              VARCHAR(20),
    estado_civil    VARCHAR(30),
    profissao       VARCHAR(100),

    email           VARCHAR(150),
    obs             TEXT,
    endereco_id     UUID REFERENCES sge_victoriano.enderecos(id) ON DELETE SET NULL,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    version         BIGINT NOT NULL DEFAULT 0,

    created_date    TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,
    modified_date   TIMESTAMP,
    modified_by     UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_clientes_tipo_pessoa ON sge_victoriano.clientes(tipo_pessoa);
CREATE INDEX idx_clientes_cpf_cnpj    ON sge_victoriano.clientes(cpf_cnpj);
CREATE INDEX idx_clientes_ativo       ON sge_victoriano.clientes(ativo);
CREATE INDEX idx_clientes_nome        ON sge_victoriano.clientes(nome);
