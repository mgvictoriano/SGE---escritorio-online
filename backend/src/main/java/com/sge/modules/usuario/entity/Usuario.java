package com.sge.modules.usuario.entity;

import com.sge.modules.endereco.entity.Endereco;
import com.sge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios", schema = "sge_victoriano")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario extends BaseEntity {

    public enum Perfil { Administrador, Advogado, Colaborador, Estagiário }

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, unique = true)
    private String username;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String nome;

    @Size(max = 30)
    private String oab;

    @NotBlank
    @Email
    @Size(max = 150)
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Perfil perfil;

    @Size(max = 7)
    @Column(name = "layout_cor", nullable = false)
    private String layoutCor = "#4f8ef7";

    @Column(name = "foto_url")
    private String fotoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endereco_id")
    private Endereco endereco;

    @Column(nullable = false)
    private Boolean ativo = true;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Telefone> telefones = new ArrayList<>();
}
