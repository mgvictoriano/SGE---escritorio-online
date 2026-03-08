package com.sge.modules.cliente.entity;

import com.sge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "representantes_legais", schema = "sge_victoriano")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepresentanteLegal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String nome;

    @NotBlank
    @Size(max = 14)
    @Column(nullable = false)
    private String cpf;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String cargo;
}
