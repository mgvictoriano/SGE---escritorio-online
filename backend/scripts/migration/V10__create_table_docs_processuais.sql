-- =============================================================================
-- V10 - Documentos processuais
-- Decisões, despachos, sentenças, intimações etc. com cálculo de prazo
-- =============================================================================

CREATE TABLE sge_victoriano.docs_processuais (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id     UUID NOT NULL REFERENCES sge_victoriano.processos(id) ON DELETE CASCADE,
    responsavel_id  UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,
    tipo            VARCHAR(30) NOT NULL
                    CHECK (tipo IN ('decisao','despacho','sentenca','acordao','intimacao','citacao','oficio')),
    data            DATE NOT NULL,
    descricao       TEXT NOT NULL,

    -- Prazo decorrente do documento
    tem_prazo       BOOLEAN NOT NULL DEFAULT FALSE,
    qtd_dias        SMALLINT,
    tipo_dias       VARCHAR(10)
                    CHECK (tipo_dias IN ('uteis', 'corridos')),
    prazo_vencimento DATE,                                  -- data calculada do vencimento
    version          BIGINT NOT NULL DEFAULT 0,

    created_date    TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by      UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,
    modified_date   TIMESTAMP,
    modified_by     UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_docs_processuais_processo_id ON sge_victoriano.docs_processuais(processo_id);
CREATE INDEX idx_docs_processuais_data        ON sge_victoriano.docs_processuais(data);
CREATE INDEX idx_docs_processuais_vencimento  ON sge_victoriano.docs_processuais(prazo_vencimento);
