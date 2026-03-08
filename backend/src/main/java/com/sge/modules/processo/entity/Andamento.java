package com.sge.modules.processo.entity;

import com.sge.modules.usuario.entity.Usuario;
import com.sge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "andamentos", schema = "sge_victoriano")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Andamento extends BaseEntity {

    public enum Origem { manual, sistema, importado }

    public enum Relevancia { prazo, audiencia, despacho, sentenca, urgente }

    public enum TipoAndamento { movimentacao, prazo, audiencia, despacho, sentenca, peticao, outros }

    @NotBlank
    @Column(name = "business_key", nullable = false, unique = true, length = 100)
    private String businessKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documento_id")
    private DocProcessual documento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @NotNull
    @Column(nullable = false)
    private LocalDate data;

    @Column(name = "data_vencimento")
    private LocalDate dataVencimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_andamento", length = 30)
    private TipoAndamento tipoAndamento;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Origem origem = Origem.manual;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Relevancia relevancia;

    @Min(0)
    @Column(nullable = false)
    @Builder.Default
    private Short horas = 0;

    @Min(0) @Max(59)
    @Column(nullable = false)
    @Builder.Default
    private Short minutos = 0;

    @Column(name = "tipo_peca", length = 100)
    private String tipoPeca;
}
