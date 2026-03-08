package com.sge.modules.cliente.entity;

import com.sge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "telefones_clientes", schema = "sge_victoriano")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelefoneCliente extends BaseEntity {

    public enum Tipo { celular, fixo, whatsapp, comercial }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @NotBlank
    @Size(min = 2, max = 2)
    @Column(nullable = false, length = 2)
    private String ddd;

    @NotBlank
    @Size(max = 10)
    @Column(nullable = false)
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Tipo tipo = Tipo.celular;

    @Column(nullable = false)
    private Boolean principal = false;
}
