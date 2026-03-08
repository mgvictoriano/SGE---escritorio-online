-- =============================================================================
-- V7 - Tabela de processos
-- Parte contrária inline (1-to-1 com processo)
-- Subtabelas: andamentos (V8), pecas (V9), docs_processuais (V10), resultados (V11)
-- =============================================================================

CREATE TABLE sge_victoriano.processos (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo                  VARCHAR(20) NOT NULL UNIQUE,    -- ex: 0001-A, 0002-A
    cliente_id              UUID NOT NULL REFERENCES sge_victoriano.clientes(id) ON DELETE RESTRICT,
    responsavel_id          UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,

    -- Dados judiciais
    numero                  VARCHAR(50),                    -- número completo com formatação: 1234567-89.2024.8.26.0114
    nr_pesquisa             VARCHAR(25),                    -- apenas dígitos para busca: 12345678920248260114
    tribunal                VARCHAR(150),
    comarca                 VARCHAR(100),
    vara                    VARCHAR(100),
    classe                  VARCHAR(150),                   -- classe processual
    assunto                 VARCHAR(200),
    valor_causa             NUMERIC(15,2),
    status                  VARCHAR(20) NOT NULL DEFAULT 'ativo'
                            CHECK (status IN ('ativo', 'suspenso', 'arquivado', 'encerrado')),
    tags                    VARCHAR(200),
    obs                     TEXT,

    -- Estatísticas
    pedidos_deferidos       SMALLINT DEFAULT 0,
    pedidos_indeferidos     SMALLINT DEFAULT 0,

    -- Parte contrária (1-to-1, inline para evitar JOIN desnecessário)
    pc_nome                 VARCHAR(255),
    pc_cpf_cnpj             VARCHAR(18),
    pc_advogado             VARCHAR(255),
    pc_tipo                 VARCHAR(30)
                            CHECK (pc_tipo IN ('Réu','Ré','Reclamado','Recorrido','Apelado','Executado','Impetrado','Outro')),
    version                 BIGINT NOT NULL DEFAULT 0,

    created_date            TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by              UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,
    modified_date           TIMESTAMP,
    modified_by             UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_processos_cliente_id     ON sge_victoriano.processos(cliente_id);
CREATE INDEX idx_processos_responsavel_id ON sge_victoriano.processos(responsavel_id);
CREATE INDEX idx_processos_status         ON sge_victoriano.processos(status);
CREATE INDEX idx_processos_numero         ON sge_victoriano.processos(numero);
CREATE INDEX idx_processos_nr_pesquisa    ON sge_victoriano.processos(nr_pesquisa);
