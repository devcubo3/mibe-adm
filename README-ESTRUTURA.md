# MIBE Admin - Estrutura do Projeto Next.js 14

## Estrutura Completa Criada

### 📁 Constantes (`src/constants/`)
- `theme.ts` - Design tokens (cores, fontes, espaçamentos, etc)
- `routes.ts` - Rotas da aplicação
- `api.ts` - Endpoints da API
- `navigation.ts` - Itens do menu lateral

### 📁 Types (`src/types/`)
- `auth.types.ts` - Tipos de autenticação (User, LoginCredentials, etc)
- `store.types.ts` - Tipos de estabelecimentos
- `wallet.types.ts` - Tipos de carteiras
- `transaction.types.ts` - Tipos de transações
- `review.types.ts` - Tipos de avaliações
- `index.ts` - Exportação centralizada

### 📁 Utils (`src/utils/`)
- `formatters.ts` - Formatação de moeda, CPF, data, telefone
- `validators.ts` - Validações de formulários
- `helpers.ts` - Funções auxiliares
- `index.ts` - Exportação centralizada

### 📁 Services (`src/services/`)
- `api.ts` - Configuração do Axios com interceptors
- `authService.ts` - Serviços de autenticação
- `storeService.ts` - Serviços de estabelecimentos
- `walletService.ts` - Serviços de carteiras
- `userService.ts` - Serviços de usuários
- `transactionService.ts` - Serviços de transações
- `reviewService.ts` - Serviços de avaliações
- `index.ts` - Exportação centralizada

### 📁 Hooks (`src/hooks/`)
- `useFetch.ts` - Hook para requisições HTTP
- `useDebounce.ts` - Hook para debounce
- `useForm.ts` - Hook para gerenciamento de formulários
- `useAuth.ts` - Hook para autenticação (COM 'use client')
- `index.ts` - Exportação centralizada

### 📁 Store (`src/store/`)
- `authStore.ts` - Store Zustand para autenticação

### 📁 Componentes Comuns (`src/components/common/`)
- **Button/** - Botão com variantes primary/secondary
- **Input/** - Input com label e validação
- **SearchInput/** - Input de busca com ícone
- **Badge/** - Badge com variantes
- **Card/** - Card base com variantes
- **Modal/** - Modal com overlay (COM 'use client')
- `index.ts` - Exportação centralizada

### 📁 Componentes de Domínio (`src/components/domain/`)
- **StoreCard/** - Card de estabelecimento (COM 'use client')
- **WalletCard/** - Card de carteira (COM 'use client')
- **ActivityItem/** - Item de atividade/transação (COM 'use client')
- **ReviewCard/** - Card de avaliação (COM 'use client')
- **StarRating/** - Componente de avaliação por estrelas (COM 'use client')
- `index.ts` - Exportação centralizada

### 📁 Componentes de Layout (`src/components/layout/`)
- **Sidebar/** - Menu lateral com navegação (COM 'use client')
- **Header/** - Cabeçalho com usuário e logout (COM 'use client')
- **PageLayout/** - Layout de página
- **Section/** - Seção com título e ação
- **DashboardLayout/** - Layout principal do dashboard (COM 'use client')
- `index.ts` - Exportação centralizada

### 📁 App Router (`src/app/`)

#### Root
- `layout.tsx` - Root layout com metadata
- `providers.tsx` - Providers (Toaster) COM 'use client'
- `globals.css` - Estilos globais com variáveis CSS
- `page.tsx` - Dashboard principal (COM 'use client')
- `page.module.css` - Estilos do dashboard

#### Auth Route Group `(auth)/`
- `login/page.tsx` - Página de login (COM 'use client')
- `login/login.module.css` - Estilos de login
- `register/page.tsx` - Página de cadastro (COM 'use client')

#### Dashboard Route Group `(dashboard)/`
- `stores/page.tsx` - Lista de estabelecimentos (COM 'use client')
- `stores/stores.module.css`
- `wallets/page.tsx` - Lista de carteiras (COM 'use client')
- `wallets/wallets.module.css`
- `users/page.tsx` - Lista de usuários (COM 'use client')
- `users/users.module.css`
- `transactions/page.tsx` - Lista de transações (COM 'use client')
- `transactions/transactions.module.css`

### 📁 Middleware
- `middleware.ts` - Proteção de rotas (verifica token)

## Padrões Utilizados

### 'use client' Directive
Todos os componentes que utilizam:
- Hooks do React (useState, useEffect, etc)
- Event handlers (onClick, onChange, etc)
- Hooks personalizados (useAuth, useForm, etc)
- Zustand stores
- Browser APIs (localStorage, window, etc)

**DEVEM** ter `'use client'` no topo do arquivo.

### CSS Modules
Todos os componentes utilizam CSS Modules para estilização:
- Nomenclatura: `Component.module.css`
- Classes em camelCase
- Importação: `import styles from './Component.module.css'`

### Estrutura de Componentes
```
Component/
├── Component.tsx       # Lógica do componente
├── Component.module.css # Estilos
└── index.ts            # Re-exportação
```

### Path Aliases
Configurado no `tsconfig.json`:
```typescript
import { Button } from '@/components/common';
import { useAuth } from '@/hooks';
import { formatCurrency } from '@/utils';
```

## Como Executar

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Edite .env com a URL da sua API
```

3. **Executar em desenvolvimento:**
```bash
npm run dev
```

4. **Build para produção:**
```bash
npm run build
npm start
```

## Rotas Disponíveis

### Públicas
- `/login` - Página de login
- `/register` - Página de cadastro

### Protegidas (requer autenticação)
- `/` - Dashboard principal
- `/stores` - Lista de estabelecimentos
- `/wallets` - Lista de carteiras
- `/users` - Lista de usuários
- `/transactions` - Lista de transações

## Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificações
- **React Icons** - Ícones (Ionicons)
- **CSS Modules** - Estilização

## Design System

Baseado no app mobile MIBE:
- Fonte: Plus Jakarta Sans
- Cor primária: #181818
- Input height: 56px
- Border radius: 4px/8px/12px

Veja `src/constants/theme.ts` para todos os tokens de design.

## Próximos Passos

1. Implementar páginas de detalhes (stores/[id], wallets/[id], etc)
2. Implementar formulário de criação/edição de estabelecimentos
3. Adicionar paginação nas listas
4. Implementar filtros avançados
5. Adicionar gráficos no dashboard (usando Recharts)
6. Implementar upload de imagens
7. Adicionar testes (Vitest + Testing Library)

## Observações Importantes

- O middleware protege automaticamente todas as rotas exceto `/login` e `/register`
- O token é armazenado no localStorage (considere usar cookies httpOnly para produção)
- Todos os serviços incluem tratamento de erro 401 (redirect para login)
- O Zustand store é restaurado do localStorage no mount da aplicação
