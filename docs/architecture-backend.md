
📘 Diretrizes de Desenvolvimento: Projeto Mibe (Fidelidade & Cashback)
1. Visão Geral do Sistema
O Mibe é um ecossistema de cashback operando em um modelo B2B2C.

Super Admin: Gerencia o app, planos e taxas globais.

Empresas (Lojistas): Configuram regras de fidelidade e registram vendas.

Clientes (Usuários): Acumulam saldo por empresa e utilizam para descontos.

2. Arquitetura de Dados (Supabase/PostgreSQL)
O banco de dados foi projetado para garantir integridade financeira. As tabelas principais são:

A. Núcleo de Identidade
profiles: Extensão da tabela auth.users. Contém CPF (único), nome completo e o role (super_admin, company_owner, client). Usado para clientes finais e admins do sistema.

companies: Dados cadastrais (CNPJ, e-mail de contato) e as Regras de Negócio (porcentagem de cashback, valor mínimo de compra, dias para expiração). **Importante:** A tabela `companies` não armazena credenciais de acesso. As senhas para login são gerenciadas exclusivamente na tabela `company_users`.

company_users: Usuários vinculados a um estabelecimento específico. Utilizam o app da empresa para operações. Estrutura:
- id (UUID, PK)
- company_id (FK → companies)
- name (VARCHAR) - Nome completo
- email (VARCHAR) - Único por empresa, pode ser fictício
- password_hash (VARCHAR) - Hash bcrypt para autenticação customizada
- role (VARCHAR) - 'owner', 'manager', 'employee' (para expansão futura de permissões)
- permissions (JSONB, nullable) - Permissões granulares para expansão futura
- is_active (BOOLEAN, default true) - Status do usuário
- created_at, updated_at (TIMESTAMP)

> **Importante:** `company_users` é separado de `profiles`. Clientes finais usam `profiles` via Supabase Auth. Usuários de estabelecimento usam `company_users` com autenticação customizada, permitindo emails fictícios.

B. Núcleo Financeiro (O Coração)
cashback_balances: Tabela de saldo consolidado. Existe uma linha para cada relação Cliente x Empresa. O saldo é por empresa, não global.

transactions: Registro imutável de cada operação. Armazena o valor total, o resgate aplicado, o valor líquido pago e o cashback gerado.

C. Núcleo de Gestão

**plans**: Define os planos de assinatura disponíveis para os estabelecimentos.
- id (UUID, PK)
- name (VARCHAR) - Nome do plano (ex: "Básico", "Premium", "Enterprise")
- description (TEXT, nullable) - Descrição opcional do plano
- user_limit (INTEGER) - Quantidade máxima de clientes inclusos no plano
- excess_user_fee (DECIMAL) - Valor cobrado por cada cliente que exceder o limite (R$)
- monthly_price (DECIMAL) - Valor mensal da assinatura
- is_active (BOOLEAN, default true) - Status do plano
- created_at, updated_at (TIMESTAMP)

**subscriptions**: Vincula um plano a um estabelecimento.
- id (UUID, PK)
- company_id (FK → companies, UNIQUE) - Estabelecimento vinculado (1 assinatura por empresa)
- plan_id (FK → plans) - Plano contratado
- status (VARCHAR) - 'active', 'overdue', 'cancelled'
- started_at (TIMESTAMP) - Data de início da assinatura
- current_profile_count (INTEGER, default 0) - Quantidade atual de clientes cadastrados
- excess_profiles (INTEGER, default 0) - Quantidade de clientes acima do limite
- excess_amount (DECIMAL, default 0) - Valor total a ser cobrado pelos excedentes
- created_at, updated_at (TIMESTAMP)

> **Nota:** A contagem de profiles é baseada na tabela `cashback_balances` (relações únicas cliente x empresa).

**payment_history**: Histórico de pagamentos de assinaturas (integração com gateway).
- id (UUID, PK)
- subscription_id (FK → subscriptions) - Assinatura relacionada
- amount (DECIMAL) - Valor total cobrado
- base_amount (DECIMAL) - Valor base do plano
- excess_amount (DECIMAL) - Valor de excedentes
- status (VARCHAR) - 'pending', 'paid', 'failed', 'refunded'
- payment_date (TIMESTAMP, nullable) - Data do pagamento efetivo
- due_date (DATE) - Data de vencimento
- gateway_reference (VARCHAR, nullable) - ID da transação no gateway de pagamento
- created_at (TIMESTAMP)

**app_configs**: Armazena a global_fee_percent, que é a comissão do Mibe sobre as vendas.

3. Regras de Negócio Cruciais (Lógica de Implementação)
3.1. A Regra de Ouro do Cashback
O cálculo do cashback acumulado NUNCA deve ser feito sobre o valor total se houver resgate.

Fórmula: cashback_earned = (total_amount - cashback_redeemed) * (company_cashback_percent / 100)

O cliente só ganha crédito sobre o dinheiro "novo" que entra na loja.

3.2. Fluxo de Expiração (Janela Deslizante)
A expiração não é uma data fixa, mas sim baseada em inatividade.

Toda nova compra (transaction) deve atualizar o campo last_purchase_date na tabela cashback_balances.

Se o cliente ficar X dias sem comprar na empresa Y, o saldo dele naquela empresa deve ser zerado.

3.3. Cobrança de Planos e Profiles
A monetização da empresa é baseada no volume de clientes (profiles) cadastrados.

**Profile Único:** Cada cliente cadastrado no estabelecimento conta como 1 profile para fins de cobrança de plano.

**Cálculo de Excedentes:**
- excess_profiles = current_profile_count - plan.user_limit (se positivo)
- excess_amount = excess_profiles * plan.excess_user_fee

Se a empresa ultrapassar o `user_limit` do plano, deve ser cobrada a `excess_user_fee` por cada cliente excedente.

3.4. Gestão de Assinaturas
Regras para vinculação de planos a estabelecimentos:

**Vinculação Única:** Um estabelecimento só pode ter uma assinatura ativa por vez.

**Status da Assinatura:**
- `active`: Pagamentos em dia, acesso liberado.
- `overdue`: Pagamento atrasado, pode haver bloqueio de funcionalidades.
- `cancelled`: Assinatura cancelada, estabelecimento inativo.

**Atualização de Excedentes:** O campo `current_profile_count` e `excess_profiles` devem ser recalculados:
- Via Trigger ao inserir novo cliente na relação com o estabelecimento.
- Via Cron Job diário para consistência.

**Histórico de Mudanças:** Mudanças de plano (upgrade/downgrade) devem ser registradas.

3.5. Integração com Gateway de Pagamento
O sistema será integrado a um gateway para automação de cobranças:

**Cobrança Recorrente:** Faturamento automático mensal.
- Valor = monthly_price + excess_amount.

**Webhooks:** O gateway notifica o sistema sobre status de pagamento.
- Webhook de sucesso: Atualiza `status = 'paid'` em `payment_history`.
- Webhook de falha: Atualiza `status = 'failed'` e marca assinatura como `overdue`.

**Sincronização:** Jobs periódicos para reconciliação de pagamentos.

3.6. Registro de Pagamento (Transações de Cashback)
O sistema não processa o pagamento (cartão/PIX) das transações de cashback. Ele apenas registra o evento. A IA deve tratar isso como um log de fidelidade verificado pelo lojista.

4. Padrões de Desenvolvimento Exigidos
4.1. Segurança (RLS - Row Level Security)
Clientes: Só podem ler seus próprios profiles, seus cashback_balances e suas transactions.

Empresas: Só podem ler/editar dados vinculados ao seu owner_id. Podem ler profiles de clientes apenas via busca por CPF ou QR Code.

Usuários de Estabelecimento (company_users):
- Leitura: Apenas usuários do próprio estabelecimento ou Admin do MIBE.
- Inserção/Atualização: Admin do MIBE ou owner do estabelecimento (via app empresa).
- Deleção: Soft delete (is_active = false) pelo Admin ou owner.

Planos (plans):
- Leitura: Público (todos podem visualizar planos disponíveis).
- Inserção/Atualização/Deleção: Apenas Admin do MIBE.

Assinaturas (subscriptions):
- Leitura: Admin do MIBE ou owner do estabelecimento vinculado.
- Inserção/Atualização: Apenas Admin do MIBE.
- Deleção: Não permitido (soft delete via status = 'cancelled').

Histórico de Pagamentos (payment_history):
- Leitura: Admin do MIBE ou owner do estabelecimento via subscription.
- Inserção: Sistema via webhooks ou Admin.
- Atualização: Sistema via webhooks.
- Deleção: Não permitido.

Admin: Acesso total via políticas de bypass ou funções específicas.

4.2. Integridade
Sempre use Transactions (DB) ao registrar uma compra. A inserção na tabela transactions e a atualização na cashback_balances devem ocorrer juntas ou falhar juntas.

Triggers: O cálculo da taxa administrativa (admin_fee_amount) deve ser automatizado via Trigger para evitar erros no front-end.

**Trigger de Atualização de Excedentes:**
- Disparado ao inserir/remover cliente vinculado a um estabelecimento.
- Recalcula `current_profile_count` na tabela `subscriptions`.
- Atualiza `excess_profiles` e `excess_amount` baseado no plano contratado.

**Cron Job de Reconciliação:**
- Executa diariamente para garantir consistência dos cálculos.
- Verifica status de assinaturas e marca como `overdue` se houver pagamentos pendentes.

Avaliações: Um cliente só pode avaliar uma empresa uma única vez (UPSERT). A empresa pode responder, mas não editar a nota do cliente.