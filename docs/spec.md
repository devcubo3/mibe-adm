

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
    * **Dados:** Nome, CNPJ, Endereço, Contato, Categoria, E-mail.
    * **Configuração de Cashback:** Percentual (%), Validade (dias), Valor Mínimo de Compra.
    * **Responsável:** Nome, CPF, Contato.
    > **Nota:** O cadastro de estabelecimento não inclui senha. As credenciais de acesso são gerenciadas na seção "Usuários" do estabelecimento, onde são cadastrados os usuários (owners, gerentes, funcionários) com suas respectivas senhas.
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

### F. Gestão de Planos de Assinatura

O sistema de assinaturas permite ao administrador criar e gerenciar planos que determinam os limites e cobranças para cada estabelecimento parceiro.

* **Acesso:** Tela dedicada no menu lateral ("Planos").
* **Lista de Planos:** Exibe todos os planos cadastrados com nome, limite de profiles e valor do excedente.

#### Dados do Plano

| Campo | Coluna BD | Tipo | Descrição |
| --- | --- | --- | --- |
| Nome | `name` | `string` | Nome identificador do plano (ex: "Básico", "Premium", "Enterprise") |
| Descrição | `description` | `string` | Descrição opcional do plano |
| Limite de Usuários | `user_limit` | `number` | Quantidade máxima de clientes inclusos no plano |
| Valor por Excedente | `excess_user_fee` | `decimal` | Valor cobrado por cada cliente que exceder o limite (R$) |
| Status | `is_active` | `boolean` | Ativo / Inativo |
| Preço Mensal | `monthly_price` | `decimal` | Valor mensal da assinatura |

#### Funcionalidades

* **Criar Plano:** Modal para cadastro de novo plano com os campos acima.
* **Editar Plano:** Modal com pré-preenchimento dos dados para edição.
* **Ativar/Desativar Plano:** Toggle para alterar status do plano.
* **Visualizar Estabelecimentos:** Lista de estabelecimentos vinculados a cada plano.

#### Regras de Negócio

1. **Limite de Profiles:** Cada plano define uma quantidade máxima de clientes que o estabelecimento pode ter cadastrados sem cobrança adicional.
2. **Cobrança de Excedentes:** Clientes cadastrados acima do limite geram cobrança adicional conforme o valor definido no plano.
3. **Vinculação:** Um estabelecimento só pode estar vinculado a um plano por vez.
4. **Proteção:** Planos com estabelecimentos vinculados não podem ser excluídos, apenas desativados.

---

### G. Assinaturas de Estabelecimentos

Tela dedicada para gerenciar a vinculação de planos aos estabelecimentos e monitorar o uso de cada assinatura.

* **Acesso:** Tela separada no menu lateral ("Assinaturas").
* **Lista de Assinaturas:** Tabela com todos os estabelecimentos e seus respectivos planos.

#### Dados da Assinatura

| Campo | Tipo | Descrição |
| --- | --- | --- |
| Estabelecimento | `FK` | Referência ao estabelecimento vinculado |
| Plano | `FK` | Referência ao plano contratado |
| Data de Início | `date` | Data em que a assinatura foi ativada |
| Status | `enum` | Ativo / Inadimplente / Cancelado |
| Profiles Atuais | `number` | Quantidade atual de clientes cadastrados |
| Excedentes | `number` | Quantidade de clientes acima do limite |
| Valor Excedente | `decimal` | Valor total a ser cobrado pelos excedentes |

#### Funcionalidades

* **Vincular Plano:** Modal para associar um plano a um estabelecimento.
* **Alterar Plano:** Trocar o plano de um estabelecimento (upgrade/downgrade).
* **Histórico:** Visualizar histórico de mudanças de plano.
* **Filtros:** Por status (Ativo, Inadimplente), por plano, por estabelecimento.

---

### H. Detalhes da Assinatura (Excedentes Inclusos)

Ao clicar em uma assinatura na lista, o administrador acessa uma página de detalhes que inclui:

* **Acesso:** `/subscriptions/[id]` - Página de detalhes da assinatura.

#### Cards Informativos

* **Plano Contratado:**
  - Nome do plano
  - Valor mensal
  - Limite de clientes
  - Valor por excedente

* **Uso Atual:**
  - Clientes cadastrados vs limite
  - Barra de progresso visual

* **Excedentes:**
  - Quantidade de clientes excedentes
  - Valor adicional a cobrar
  - Destaque visual (laranja/vermelho) quando há excedentes

* **Informações:**
  - Data de início da assinatura
  - Última atualização

#### Ações Disponíveis

* Alterar Plano (upgrade/downgrade)
* Sugerir Upgrade (quando há excedentes)

---

### I. Integração com Gateway de Pagamento

O sistema de assinaturas será integrado a um gateway de pagamento para automação de cobranças.

#### Funcionalidades Planejadas

* **Cobrança Recorrente:** Faturamento automático mensal do valor base do plano.
* **Cobrança de Excedentes:** Inclusão automática do valor excedente na fatura mensal.
* **Histórico de Pagamentos:** Registro de todas as transações de pagamento.
* **Status de Pagamento:** Atualização automática do status (Pago, Pendente, Inadimplente).
* **Notificações:** Alertas de vencimento e inadimplência.

> **Nota:** A escolha do gateway de pagamento e detalhes da integração serão definidos em fase posterior.

> **Expansão Futura:** O módulo de assinaturas poderá incluir funcionalidades adicionais como:
> - Período de faturamento (mensal, anual)
> - Limite de transações por plano
> - Funcionalidades exclusivas por plano
> - Cupons de desconto

---

## 3. Fluxo de Navegação (Menu Lateral)

```text
MIBE Admin
├── [IoGridOutline] Dashboard
├── [IoStorefrontOutline] Estabelecimentos
├── [IoWalletOutline] Carteiras (Wallets)
├── [IoPeopleOutline] Usuários (Clientes)
├── [IoStarOutline] Avaliações
├── [IoDocumentTextOutline] Planos
├── [IoCardOutline] Assinaturas (inclui excedentes nos detalhes)
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

