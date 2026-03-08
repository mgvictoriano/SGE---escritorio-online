-- =============================================================================
-- V11 - Resultados processuais (sentenças, acórdãos, agravos)
-- =============================================================================

CREATE TABLE sge_victoriano.resultados_processuais (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id         UUID NOT NULL REFERENCES sge_victoriano.processos(id) ON DELETE CASCADE,
    tipo_resultado      VARCHAR(20) NOT NULL
                        CHECK (tipo_resultado IN ('sentenca', 'acordao', 'agravo')),
    tipo                VARCHAR(20) NOT NULL
                        CHECK (tipo IN ('favoravel', 'desfavoravel', 'provido', 'improvido')),
    data                DATE NOT NULL,
    obs                 TEXT,
    version             BIGINT NOT NULL DEFAULT 0,

    created_date        TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by          UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL,
    modified_date       TIMESTAMP,
    modified_by         UUID REFERENCES sge_victoriano.usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_resultados_processo_id    ON sge_victoriano.resultados_processuais(processo_id);
CREATE INDEX idx_resultados_tipo_resultado ON sge_victoriano.resultados_processuais(tipo_resultado);
