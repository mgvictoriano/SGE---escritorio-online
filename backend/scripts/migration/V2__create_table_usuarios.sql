-- =============================================================================
-- V2 - Tabela de usuários (colaboradores do escritório)
-- Perfis: Administrador, Advogado, Colaborador, Estagiário
-- =============================================================================

CREATE TABLE sge_victoriano.usuarios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username        VARCHAR(100) NOT NULL UNIQUE,
    nome            VARCHAR(255) NOT NULL,
    oab             VARCHAR(30),                        -- null para não-advogados
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    perfil          VARCHAR(30) NOT NULL
                    CHECK (perfil IN ('Administrador', 'Advogado', 'Colaborador', 'Estagiário')),
    layout_cor      VARCHAR(7) NOT NULL DEFAULT '#4f8ef7', -- cor hex do avatar no sistema
    foto_url        TEXT,                               -- caminho da foto no storage
    endereco_id     UUID REFERENCES sge_victoriano.enderecos(id) ON DELETE SET NULL,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    version         BIGINT NOT NULL DEFAULT 0,

    created_date    TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      UUID,
    modified_date   TIMESTAMP,
    modified_by     UUID
);

-- Índices
CREATE INDEX idx_usuarios_perfil    ON sge_victoriano.usuarios(perfil);
CREATE INDEX idx_usuarios_ativo     ON sge_victoriano.usuarios(ativo);
CREATE INDEX idx_usuarios_email     ON sge_victoriano.usuarios(email);
CREATE INDEX idx_usuarios_username  ON sge_victoriano.usuarios(username);
