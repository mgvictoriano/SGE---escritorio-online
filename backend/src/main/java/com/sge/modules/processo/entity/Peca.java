package com.sge.modules.processo.entity;

import com.sge.modules.usuario.entity.Usuario;
import com.sge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "pecas", schema = "sge_victoriano")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Peca extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @NotNull
    @Column(nullable = false)
    private LocalDate data;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String nome;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String tipo;

    private String obs;

    @Column(name = "arquivo_url")
    private String arquivoUrl;
}
