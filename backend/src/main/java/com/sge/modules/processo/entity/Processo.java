package com.sge.modules.processo.entity;

import com.sge.modules.cliente.entity.Cliente;
import com.sge.modules.usuario.entity.Usuario;
import com.sge.shared.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "processos", schema = "sge_victoriano")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Processo extends BaseEntity {

    public enum Status { ativo, suspenso, arquivado, encerrado }

    public enum TipoParteContraria { Réu, Ré, Reclamado, Recorrido, Apelado, Executado, Impetrado, Outro }

    @NotNull
    @Size(max = 20)
    @Column(nullable = false, unique = true)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id")
    private Usuario responsavel;

    // Dados judiciais
    @Size(max = 50)
    private String numero;

    @Size(max = 25)
    @Column(name = "nr_pesquisa")
    private String nrPesquisa;

    @Size(max = 150)
    private String tribunal;

    @Size(max = 100)
    private String comarca;

    @Size(max = 100)
    private String vara;

    @Size(max = 150)
    private String classe;

    @Size(max = 200)
    private String assunto;

    @Column(name = "valor_causa", precision = 15, scale = 2)
    private BigDecimal valorCausa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.ativo;

    @Size(max = 200)
    private String tags;

    private String obs;

    // Estatísticas
    @Min(0) @Max(9999)
    @Column(name = "pedidos_deferidos")
    @Builder.Default
    private Short pedidosDeferidos = 0;

    @Min(0) @Max(9999)
    @Column(name = "pedidos_indeferidos")
    @Builder.Default
    private Short pedidosIndeferidos = 0;

    // Parte contrária (inline)
    @Size(max = 255)
    @Column(name = "pc_nome")
    private String pcNome;

    @Size(max = 18)
    @Column(name = "pc_cpf_cnpj")
    private String pcCpfCnpj;

    @Size(max = 255)
    @Column(name = "pc_advogado")
    private String pcAdvogado;

    @Enumerated(EnumType.STRING)
    @Column(name = "pc_tipo", length = 30)
    private TipoParteContraria pcTipo;

    // Subtabelas
    @OneToMany(mappedBy = "processo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Andamento> andamentos = new ArrayList<>();

    @OneToMany(mappedBy = "processo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Peca> pecas = new ArrayList<>();

    @OneToMany(mappedBy = "processo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DocProcessual> docsProcessuais = new ArrayList<>();

    @OneToMany(mappedBy = "processo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ResultadoProcessual> resultados = new ArrayList<>();
}
