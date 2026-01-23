

---

# MIBE Admin - Especificação Técnica (React Web)

## Visão Geral

**Nome:** MIBE Dashboard Administrativo
**Versão:** 1.0.0
**Tecnologia:** React (Web)
**Propósito:** Gestão centralizada de estabelecimentos parceiros, clientes finais e auditoria de movimentações financeiras (cashback).

---

## 1. Stack Tecnológica

* **Framework:** Next.js 14 (App Router)
* **Linguagem:** TypeScript
* **Gerenciamento de Estado:** Zustand (Estado global de autenticação e dados persistentes)
* **Estilização:** CSS Modules (Padrão nativo do Next.js para isolamento de estilos)
* **Ícones:** `react-icons/io5` (Ionicons) para paridade visual com o app mobile
* **Notificações:** `react-hot-toast`
* **HTTP Client:** Axios (com suporte a dados mockados em desenvolvimento)

---

## 2. Arquitetura de Telas e Funcionalidades

### A. Dashboard (Home)

* **KPI Cards:** Total de cashback gerado, número de novos negócios no mês, total de clientes ativos.
* **Gráfico de Volume:** Transações de acúmulo vs. resgate nos últimos 30 dias.

### B. Gestão de Negócios (B2B)

* **Lista de Negócios:** Grid com nome, categoria e avaliação (Ionicons).
* **Cadastro de Novo Negócio (Modal):**
    * **Imagens:** Logo (Perfil) e Foto de Capa.
    * **Dados:** Nome, CNPJ, Endereço, Contato, Categoria.
    * **Configuração de Cashback:** Percentual (%), Validade (dias), Valor Mínimo de Compra.
    * **Responsável:** Nome, CPF, Contato.
* **Detalhes do Negócio:**
    * **Painel de Controle:** Estatísticas (Total recebido, resgatado, transações).
    * **Gestão:** Edição de dados via Modal com pré-preenchimento e ícone de "lápis" sobreposto.
    * **Histórico de Transações:** Lista completa com filtros de busca, tipo e período.


* **Ações:** Editar dados cadastrais, visualizar transações detalhadas, visualizar avaliações.

### C. Gestão de Clientes (B2C)

* **Lista de Clientes:** Avatar, Nome, CPF, e-mail.
* **Detalhes do Cliente (Visualização Detalhada):**
    * Exibição de foto de perfil, dados de contato e CPF.
* **Ações:** Visualizar detalhes e futuramente gerenciar bloqueios.

### D. Transações (Auditoria)

* **Log Geral:** Tabela mestre de todas as transações do sistema em tempo real.
* **Filtros:** Por período, por valor, por tipo (Acúmulo/Resgate) ou por estabelecimento.

### E. Gestão de Usuários de Estabelecimento

Cada estabelecimento pode ter múltiplos usuários vinculados (donos, gerentes, funcionários) que utilizam o app da empresa para operações do dia-a-dia.

* **Acesso:** Aba "Usuários" dentro dos Detalhes do Estabelecimento.
* **Dados do Usuário:**
    * Nome completo
    * E-mail (pode ser fictício, único por estabelecimento)
    * Senha (autenticação customizada)
    * Role: `owner`, `manager`, `employee` (para expansão futura)
    * Status: Ativo/Inativo
* **Cadastro:** Realizado via MIBE Admin ou diretamente pelo app da empresa.
* **Listagem:** Exibe todos os usuários do estabelecimento com opções de editar, ativar/desativar.
* **Ações Disponíveis:**
    * Adicionar novo usuário
    * Editar dados do usuário
    * Desativar/Reativar usuário
    * Redefinir senha (futuramente)

> **Nota:** Este módulo é separado da gestão de clientes finais (B2C). Usuários de estabelecimento não acumulam cashback.

---

## 3. Fluxo de Navegação (Menu Lateral)

```text
MIBE Admin
├── [IoGridOutline] Dashboard
├── [IoStorefrontOutline] Estabelecimentos
├── [IoWalletOutline] Carteiras (Wallets)
├── [IoPeopleOutline] Usuários (Clientes)
├── [IoStarOutline] Avaliações
└── [IoSettingsOutline] Configurações
```

---

## 4. Design System (Consistência com App Mobile)

Para que o administrador sinta que está no mesmo ecossistema do app mobile, utilizaremos os tokens definidos no `specd.md` original:

| Elemento | Token / Valor |
| --- | --- |
| **Cor Primária** | `#181818` (Header e Sidebar) |
| **Sucesso** | `#34C759` (Indicadores de lucro e status Ativo) |
| **Erro/Alerta** | `#FF3B30` (Botão de desativar e status Inadimplente) |
| **Background** | `#F5F5F5` (Fundo das páginas para destacar os cards brancos) |
| **Fontes** | Plus Jakarta Sans (Regular, Medium, Bold) |

---

## 5. Estrutura de Pastas (Next.js App Router)

```text
src/
├── app/               # Rotas (Next.js App Router)
│   ├── (auth)/        # Grupo de rotas públicas (Login)
│   ├── (dashboard)/   # Grupo de rotas protegidas
│   └── layout.tsx     # Root layout
├── components/        # Componentes UI
│   ├── common/        # Átomos (Button, Input, Modal)
│   ├── layout/        # Organismos de layout (Sidebar, Header)
│   └── domain/        # Moléculas de domínio (StoreCard, DetailLayout)
├── constants/         # Navegação e configurações fixas
├── hooks/             # Custom hooks (useAuth, useFetch)
├── services/          # Camada de API (Mock Data e Axios)
├── store/             # Estado global (Zustand)
├── types/             # Definições TypeScript
├── utils/             # Formatadores (BRL, CPF, CNPJ)
└── styles/            # Estilos globais
```

---

## 6. Regras de Negócio para o Admin

1. **Segurança:** Apenas usuários com nível "Admin" podem desativar negócios ou clientes.
2. **Assinaturas:** O sistema deve destacar em vermelho negócios cujo status de assinatura esteja "Inadimplente", permitindo a desativação rápida.
3. **Logs:** Toda ação de "Desativar" deve solicitar uma confirmação (Modal) para evitar cliques acidentais.
4. **Exportação:** Opção de exportar o histórico de transações em CSV para contabilidade.

---

