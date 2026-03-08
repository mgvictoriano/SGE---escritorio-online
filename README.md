# SGE - Sistema de Gestão para Escritório Online

Sistema web de gestão para escritórios de advocacia, com módulos integrados para controle de processos, clientes, agenda, financeiro, documentos e mais.

<img width="1874" height="904" alt="image" src="https://github.com/user-attachments/assets/e8810dd7-4911-40a8-a393-e1a865010899" />



## Visão Geral

Aplicação SPA desenvolvida em React, com tema claro/escuro, voltada para a rotina de escritórios jurídicos.

## Módulos

- **Dashboard** — visão geral com indicadores e resumos
- **Clientes** — cadastro e gestão de clientes
- **Processos** — acompanhamento de processos e andamentos
- **Agenda & Prazos** — controle de compromissos e prazos processuais
- **Financeiro** — honorários, contratos e serviços avulsos
- **Documentos** — gestão de peças e documentos
- **Colaboradores** — cadastro de advogados e equipe
- **Produtividade** — métricas e desempenho da equipe
- **Banco Efí** — integração com a plataforma Efí Bank

## Componentes Compartilhados

- **Busca Global** — pesquisa unificada em clientes, processos e documentos
- **Calculadora de Honorários** — cálculo de honorários por tipo de causa
- **Mapa de Riscos** — visualização de riscos por processo
- **Painel de Notificações** — alertas e lembretes
- **Log de Auditoria** — histórico de ações do sistema

## Estrutura do Projeto

```
SGE - escritorio online/
├── frontend/                   # Interface (React + Vite)
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── shared/         # Componentes reutilizáveis
│       │   └── ui/             # Componentes base (Button, Card, Input...)
│       ├── constants/          # Dados, paleta de cores, domínios
│       ├── modules/            # Módulos da aplicação
│       └── utils/              # Utilitários (datas, prazos, auditoria)
├── backend/                    # API REST (Java 21 + Spring Boot 3.4)
│   ├── pom.xml
│   ├── scripts/migration/      # Scripts SQL versionados (Flyway)
│   └── src/main/java/com/sge/
│       ├── SgeApplication.java
│       ├── shared/
│       │   ├── entity/         # BaseEntity (auditoria + versioning)
│       │   └── config/         # JPA, Security
│       └── modules/
│           ├── endereco/
│           ├── usuario/
│           ├── cliente/
│           └── processo/
├── nginx/                      # Configuração do proxy reverso
├── scripts/                    # Scripts de infraestrutura e backup
└── docker-compose.yml          # Orquestração dos serviços
```

## Tecnologias

### Frontend
- React 18 + Vite
- CSS-in-JS com paleta dinâmica (tema claro/escuro)

### Backend
- Java 21
- Spring Boot 3.4 (Web, JPA, Security, Validation)
- PostgreSQL 18 com multi-tenancy por schema
- Flyway para migrations versionadas
- JWT para autenticação
- Lombok

### Infraestrutura
- Docker + Docker Compose
- Nginx (proxy reverso + SSL)
- VPS Ubuntu (Hostinger)
- Backup automático via cron

## Autores

- **Michelle Victoriano** — frontend e backend
- **Claude Sonnet 4.6 (Anthropic)** — colaboração no desenvolvimento do frontend
