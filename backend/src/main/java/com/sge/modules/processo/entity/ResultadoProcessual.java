package com.sge.modules.processo.entity;

import com.sge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "resultados_processuais", schema = "sge_victoriano")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultadoProcessual extends BaseEntity {

    public enum TipoResultado { sentenca, acordao, agravo }

    public enum Tipo { favoravel, desfavoravel, provido, improvido }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_resultado", nullable = false, length = 20)
    private TipoResultado tipoResultado;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Tipo tipo;

    @NotNull
    @Column(nullable = false)
    private LocalDate data;

    private String obs;
}
