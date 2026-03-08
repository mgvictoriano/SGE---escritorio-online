package com.sge.modules.endereco.entity;

import com.sge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "enderecos", schema = "sge_victoriano")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Endereco extends BaseEntity {

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String logradouro;

    @Size(max = 20)
    private String numero;

    @Size(max = 100)
    private String complemento;

    @Size(max = 100)
    private String bairro;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String cidade;

    @NotBlank
    @Size(min = 2, max = 2)
    @Column(nullable = false, length = 2)
    private String estado;

    @Size(max = 9)
    private String cep;

    @Size(max = 60)
    @Column(nullable = false)
    private String pais = "Brasil";
}
