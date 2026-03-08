package com.sge.modules.cliente.entity;

import com.sge.modules.endereco.entity.Endereco;
import com.sge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clientes", schema = "sge_victoriano")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente extends BaseEntity {

    public enum TipoPessoa { PF, PJ }

    @NotBlank
    @Size(max = 10)
    @Column(nullable = false, unique = true)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pessoa", nullable = false, length = 2)
    private TipoPessoa tipoPessoa;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String nome;

    @Size(max = 18)
    @Column(name = "cpf_cnpj")
    private String cpfCnpj;

    // Exclusivo PF
    @Size(max = 20)
    private String rg;

    @Size(max = 30)
    @Column(name = "estado_civil")
    private String estadoCivil;

    @Size(max = 100)
    private String profissao;

    @Size(max = 150)
    private String email;

    private String obs;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endereco_id")
    private Endereco endereco;

    @Column(nullable = false)
    private Boolean ativo = true;

    // Exclusivo PJ
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RepresentanteLegal> representantes = new ArrayList<>();

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TelefoneCliente> telefones = new ArrayList<>();
}
