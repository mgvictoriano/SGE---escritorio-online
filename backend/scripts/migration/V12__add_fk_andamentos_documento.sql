-- =============================================================================
-- V12 - Adiciona FK de andamentos → docs_processuais
-- Separado pois V8 (andamentos) é criado antes de V10 (docs_processuais)
-- =============================================================================

ALTER TABLE sge_victoriano.andamentos
    ADD CONSTRAINT fk_andamentos_documento
    FOREIGN KEY (documento_id)
    REFERENCES sge_victoriano.docs_processuais(id)
    ON DELETE SET NULL;
