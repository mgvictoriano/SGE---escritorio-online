package com.sge.modules.processo.entity;

import com.sge.modules.usuario.entity.Usuario;
import com.sge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "docs_processuais", schema = "sge_victoriano")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocProcessual extends BaseEntity {

    public enum Tipo { decisao, despacho, sentenca, acordao, intimacao, citacao, oficio }

    public enum TipoDias { uteis, corridos }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id")
    private Usuario responsavel;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Tipo tipo;

    @NotNull
    @Column(nullable = false)
    private LocalDate data;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "tem_prazo", nullable = false)
    @Builder.Default
    private Boolean temPrazo = false;

    @Min(1)
    @Column(name = "qtd_dias")
    private Short qtdDias;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_dias", length = 10)
    private TipoDias tipoDias;

    @Column(name = "prazo_vencimento")
    private LocalDate prazoVencimento;
}
