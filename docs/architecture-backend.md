
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

companies: Dados cadastrais (CNPJ) e as Regras de Negócio (porcentagem de cashback, valor mínimo de compra, dias para expiração).

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
plans: Define limites de usuários únicos mensais e taxas de excedente.

app_configs: Armazena a global_fee_percent, que é a comissão do Mibe sobre as vendas.

3. Regras de Negócio Cruciais (Lógica de Implementação)
3.1. A Regra de Ouro do Cashback
O cálculo do cashback acumulado NUNCA deve ser feito sobre o valor total se houver resgate.

Fórmula: cashback_earned = (total_amount - cashback_redeemed) * (company_cashback_percent / 100)

O cliente só ganha crédito sobre o dinheiro "novo" que entra na loja.

3.2. Fluxo de Expiração (Janela Deslizante)
A expiração não é uma data fixa, mas sim baseada em inatividade.

Toda nova compra (transaction) deve atualizar o campo last_purchase_date na tabela cashback_balances.

Se o cliente ficar X dias sem comprar na empresa Y, o saldo dele naquela empresa deve ser zerado.

3.3. Cobrança de Planos e Usuários Únicos
A monetização da empresa não é por transação apenas, mas por volume de clientes.

Usuário Único: Se o Cliente A comprar 10 vezes no mês na Loja B, ele conta como 1 usuário único para fins de cobrança de plano.

Se a empresa ultrapassar o user_limit do plano, deve ser cobrada a excess_user_fee por cada novo ID de usuário distinto.

3.4. Registro de Pagamento
O sistema não processa o pagamento (cartão/PIX). Ele apenas registra o evento. A IA deve tratar isso como um log de fidelidade verificado pelo lojista.

4. Padrões de Desenvolvimento Exigidos
4.1. Segurança (RLS - Row Level Security)
Clientes: Só podem ler seus próprios profiles, seus cashback_balances e suas transactions.

Empresas: Só podem ler/editar dados vinculados ao seu owner_id. Podem ler profiles de clientes apenas via busca por CPF ou QR Code.

Usuários de Estabelecimento (company_users):
- Leitura: Apenas usuários do próprio estabelecimento ou Admin do MIBE.
- Inserção/Atualização: Admin do MIBE ou owner do estabelecimento (via app empresa).
- Deleção: Soft delete (is_active = false) pelo Admin ou owner.

Admin: Acesso total via políticas de bypass ou funções específicas.

4.2. Integridade
Sempre use Transactions (DB) ao registrar uma compra. A inserção na tabela transactions e a atualização na cashback_balances devem ocorrer juntas ou falhar juntas.

Triggers: O cálculo da taxa administrativa (admin_fee_amount) deve ser automatizado via Trigger para evitar erros no front-end.


Avaliações: Um cliente só pode avaliar uma empresa uma única vez (UPSERT). A empresa pode responder, mas não editar a nota do cliente.