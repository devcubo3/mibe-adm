# MIBE Admin - Arquitetura de Frontend

Este documento descreve a arquitetura, padrões e convenções a serem seguidos no desenvolvimento do painel administrativo em React.

---

## 1. Estrutura de Pastas Recomendada

```
src/
├── app/                  # Rotas (Next.js App Router)
│   ├── (auth)/           # Grupo de rotas públicas
│   │   ├── login/        # page.tsx
│   │   └── ...
│   ├── (dashboard)/      # Grupo de rotas autenticadas
│   │   ├── stores/       # [id]/page.tsx
│   │   └── ...
│   ├── layout.tsx        # Root layout (Next)
│   └── middleware.ts     # Proteção de rotas
│
├── components/           # Componentes reutilizáveis
│   ├── common/           # Componentes genéricos (Button, Input, Modal)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   └── ...
│   ├── layout/           # Componentes de layout (Sidebar, Header)
│   └── domain/           # Componentes específicos (StoreCard, DetailLayout)
│
├── constants/            # Navegação e enums
├── hooks/                # Custom hooks (useAuth, useFetch)
├── services/             # Chamadas de API (serviços desacoplados)
├── store/                # Estado global (Zustand)
├── types/                # Definições TypeScript
├── utils/                # Formatadores e helpers
└── styles/               # Estilos globais (globals.css, variables.css)
```

---

## 2. Padrões de Componentes

### 2.1 Estrutura de Componente

Cada componente deve seguir esta estrutura:

```typescript
// Button/Button.tsx
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  className,
}) => {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[variant]}
        ${disabled ? styles.disabled : ''}
        ${className || ''}
      `}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? 'Carregando...' : title}
    </button>
  );
};

export default Button;
```

```typescript
// Button/index.ts
export { default } from './Button';
export type { ButtonProps } from './Button';
```

### 2.2 Componentes Extraídos do App Mobile

#### Button
```typescript
interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  textStyle?: React.CSSProperties;
}
```

#### Input
```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: string;
  disabled?: boolean;
}
```

#### SearchInput
```typescript
interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
}
```

#### CategoryCard
```typescript
interface CategoryCardProps {
  title: string;
  icon: string; // nome do ícone Ionicons
  onClick?: () => void;
}
```

#### StoreCard
```typescript
interface StoreCardProps {
  name: string;
  category: string;
  image: string;
  rating?: number;
  distance?: string;
  onClick?: () => void;
}
```

#### ActivityItem
```typescript
interface Activity {
  id: string;
  storeName: string;
  storeLogo: string;
  type: 'received' | 'redeemed';
  amount: number;
  description: string;
  date: string;
}

interface ActivityItemProps {
  activity: Activity;
  onClick?: () => void;
}
```

#### WalletCard
```typescript
interface Wallet {
  id: string;
  storeName: string;
  storeLogo: string;
  balance: number;
  expiresIn: string;
  category: string;
}

interface WalletCardProps {
  wallet: Wallet;
  onClick?: () => void;
}
```

#### ReviewCard
```typescript
interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  reply?: {
    text: string;
    date: string;
  };
}

interface ReviewCardProps {
  review: Review;
}
```

#### StarRating
```typescript
interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}
```

#### Pagination
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}
```

---

## 3. Padrões de Layout

### 3.1 Page Layout (Admin)

```typescript
// components/layout/PageLayout.tsx
interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode; // Botões de ação do header
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children, actions }) => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
};
```

### 3.2 Section Layout

```typescript
// components/layout/Section.tsx
interface SectionProps {
  title: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Section: React.FC<SectionProps> = ({ title, children, action }) => {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {action && (
          <button onClick={action.onClick} className={styles.seeAllButton}>
            {action.label}
            <IoArrowForward size={16} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
};
```

### 3.3 Card Grid

```typescript
// components/layout/CardGrid.tsx
interface CardGridProps {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

const CardGrid: React.FC<CardGridProps> = ({ columns = 2, children }) => {
  return (
    <div className={`${styles.grid} ${styles[`grid-${columns}`]}`}>
      {children}
    </div>
  );
};
```

---

## 4. Estrutura de Páginas

### 4.1 Padrão de Página

```typescript
// app/(dashboard)/stores/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout';
import { Button, SearchInput } from '@/components/common';
import { StoreCard } from '@/components/domain';
import { storeService } from '@/services';
import { Store } from '@/types';
import styles from './stores.module.css';

export default function StoreListPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const data = await storeService.getAll();
      setStores(data);
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout
      title="Estabelecimentos"
      actions={<Button title="Novo Estabelecimento" onClick={() => {}} />}
    >
      <div className={styles.filters}>
        <SearchInput
          placeholder="Buscar estabelecimento..."
          value={search}
          onChange={setSearch}
        />
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className={styles.storeList}>
          {filteredStores.map(store => (
            <StoreCard
              key={store.id}
              {...store}
              onClick={() => router.push(`/stores/${store.id}`)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
```

---

## 5. Convenções de Código

### 5.1 Naming Conventions

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes | PascalCase | `StoreCard`, `ActivityItem` |
| Funções/Hooks | camelCase | `useAuth`, `formatCurrency` |
| Variáveis | camelCase | `isLoading`, `userName` |
| Constantes | SCREAMING_SNAKE_CASE | `API_URL`, `MAX_ITEMS` |
| CSS Modules | camelCase | `styles.buttonPrimary` |
| Arquivos de componente | PascalCase | `Button.tsx` |
| Arquivos utilitários | camelCase | `formatters.ts` |

### 5.2 Importações

Ordem recomendada:
```typescript
// 1. React e bibliotecas externas
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Componentes internos
import { Button, Input, Card } from '@/components';

// 3. Hooks
import { useAuth } from '@/hooks';

// 4. Services/Utils
import { storeService } from '@/services';
import { formatCurrency } from '@/utils';

// 5. Types
import { Store } from '@/types';

// 6. Estilos
import styles from './Component.module.css';
```

### 5.3 Props Destructuring

```typescript
// Bom - Desestruturar props
const Button = ({ title, variant = 'primary', onClick }) => {
  // ...
};

// Ruim - Usar props diretamente
const Button = (props) => {
  return <button onClick={props.onClick}>{props.title}</button>;
};
```

---

## 6. Gerenciamento de Estado

### 6.1 Estado Local (useState)

Use para:
- Estados de UI (loading, modals, forms)
- Dados temporários
- Filtros de busca

```typescript
const [isOpen, setIsOpen] = useState(false);
const [search, setSearch] = useState('');
const [formData, setFormData] = useState({ name: '', email: '' });
```

### 6.2 Estado Global (Zustand/Redux/Context)

Use para:
- Dados do usuário autenticado
- Configurações globais
- Cache de dados frequentes

```typescript
// store/authStore.ts (Zustand)
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

---

## 7. Services (API)

### 7.1 Configuração Base

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 7.2 Service Pattern

```typescript
// services/storeService.ts
import api from './api';
import { Store, CreateStoreDTO, UpdateStoreDTO } from '@/types';

export const storeService = {
  getAll: async (): Promise<Store[]> => {
    const response = await api.get('/stores');
    return response.data;
  },

  getById: async (id: string): Promise<Store> => {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },

  create: async (data: CreateStoreDTO): Promise<Store> => {
    const response = await api.post('/stores', data);
    return response.data;
  },

  update: async (id: string, data: UpdateStoreDTO): Promise<Store> => {
    const response = await api.put(`/stores/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/stores/${id}`);
  },
};
```

---

## 8. Hooks Personalizados

### 8.1 useFetch

```typescript
// hooks/useFetch.ts
import { useState, useEffect } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetch<T>(fetchFn: () => Promise<T>): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, loading, error, refetch: fetch };
}
```

### 8.2 useDebounce

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 9. Validação de Formulários

### 9.1 Funções de Validação

```typescript
// utils/validators.ts
export const validators = {
  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'E-mail inválido';
  },

  required: (value: string): string | null => {
    return value.trim() ? null : 'Campo obrigatório';
  },

  minLength: (min: number) => (value: string): string | null => {
    return value.length >= min ? null : `Mínimo ${min} caracteres`;
  },

  cpf: (value: string): string | null => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 11 ? null : 'CPF inválido';
  },

  password: (value: string): string | null => {
    if (value.length < 8) return 'Mínimo 8 caracteres';
    return null;
  },
};
```

### 9.2 Hook de Formulário

```typescript
// hooks/useForm.ts
import { useState } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof T) => (value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setValues,
  };
}
```

---

## 10. Rotas (Next.js App Router)

A navegação é baseada no sistema de arquivos da pasta `src/app`.

### Estrutura de Rotas

- `src/app/(auth)/login/page.tsx` -> `/login`
- `src/app/(dashboard)/page.tsx` -> `/` (Dashboard Principal)
- `src/app/(dashboard)/stores/page.tsx` -> `/stores` (Lista de Estabelecimentos)
- `src/app/(dashboard)/stores/[id]/page.tsx` -> `/stores/:id` (Detalhes)
- `src/app/(dashboard)/wallets/page.tsx` -> `/wallets` (Lista de Carteiras)
- `src/app/(dashboard)/users/page.tsx` -> `/users` (Lista de Usuários)
- `src/app/(dashboard)/settings/page.tsx` -> `/settings` (Configurações)

### Proteção de Rotas

Utilizamos o `src/middleware.ts` para verificar a presença de tokens de autenticação e redirecionar usuários não autorizados para a tela de login.

### Detalhes do Estabelecimento (`/stores/:id`)

A página de detalhes do estabelecimento é organizada em abas:

| Aba | Descrição |
|-----|-----------|
| **Informações** | Dados cadastrais, estatísticas e configurações de cashback |
| **Transações** | Histórico de transações do estabelecimento com filtros |
| **Avaliações** | Reviews dos clientes com opção de resposta |
| **Usuários** | Usuários vinculados ao estabelecimento (novo) |

#### Aba de Usuários do Estabelecimento

Interface para gerenciar usuários que acessam o app da empresa:

```typescript
// Componentes necessários
components/
└── domain/
    └── CompanyUserCard/
        ├── CompanyUserCard.tsx
        ├── CompanyUserCard.module.css
        └── index.ts
    └── CompanyUserModal/
        ├── CompanyUserModal.tsx
        ├── CompanyUserModal.module.css
        └── index.ts

// Service
services/
└── companyUserService.ts
```

**Funcionalidades da Aba:**
- Lista de usuários com nome, email, role e status
- Botão "Novo Usuário" abre modal de cadastro
- Campos do modal: Nome, E-mail, Senha, Confirmação de Senha
- Edição de usuário existente (nome, email, senha opcional)
- Toggle de ativar/desativar usuário (soft delete)
- Indicação visual de status (Ativo/Inativo)

---

## 11. Sidebar Navigation (Admin)

```typescript
// constants/navigation.ts
export const SIDEBAR_ITEMS = [
  {
    label: 'Dashboard',
    icon: 'grid-outline',
    path: '/',
  },
  {
    label: 'Estabelecimentos',
    icon: 'storefront-outline',
    path: '/stores',
    children: [
      { label: 'Lista', path: '/stores' },
      { label: 'Novo', path: '/stores/new' },
      { label: 'Categorias', path: '/stores/categories' },
    ],
  },
  {
    label: 'Carteiras',
    icon: 'wallet-outline',
    path: '/wallets',
  },
  {
    label: 'Usuários',
    icon: 'people-outline',
    path: '/users',
  },
  {
    label: 'Transações',
    icon: 'swap-horizontal-outline',
    path: '/transactions',
  },
  {
    label: 'Relatórios',
    icon: 'bar-chart-outline',
    path: '/reports',
  },
  {
    label: 'Configurações',
    icon: 'settings-outline',
    path: '/settings',
  },
];
```

---

## 12. Entidades do Sistema

### 12.1 Types/Interfaces

```typescript
// types/store.types.ts
export interface Store {
  id: string;
  name: string;
  category: string;
  description: string;
  coverImage: string;
  logo: string;
  rating: number;
  totalReviews: number;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  cashback: {
    percentage: number;
    description: string;
  };
  rules: {
    expirationDays: number;
    minPurchase: number;
    description: string;
  };
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

// types/wallet.types.ts
export interface Wallet {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  storeLogo: string;
  balance: number;
  expiresAt: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// types/transaction.types.ts
export interface Transaction {
  id: string;
  userId: string;
  storeId: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: string;
}

// types/user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'store_owner';
  createdAt: string;
  updatedAt: string;
}

// types/review.types.ts
export interface Review {
  id: string;
  userId: string;
  userName: string;
  storeId: string;
  rating: number;
  comment: string;
  reply?: {
    text: string;
    createdAt: string;
  };
  createdAt: string;
}

// types/companyUser.types.ts
export interface CompanyUser {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'employee';
  permissions?: Record<string, boolean>; // Para expansão futura
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyUserDTO {
  companyId: string;
  name: string;
  email: string;
  password: string;
  role?: 'owner' | 'manager' | 'employee';
}

export interface UpdateCompanyUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: 'owner' | 'manager' | 'employee';
  isActive?: boolean;
}
```

---

## 13. Testes

### 13.1 Estrutura de Testes

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx    # Testes unitários
│       └── Button.stories.tsx # Storybook (opcional)
```

### 13.2 Exemplo de Teste

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with title', () => {
    render(<Button title="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button title="Click" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button title="Submit" loading />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies disabled state', () => {
    render(<Button title="Submit" disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 14. Tecnologias Recomendadas

| Categoria | Recomendação | Alternativa |
|-----------|--------------|-------------|
| Framework | React 18+ | - |
| Linguagem | TypeScript | - |
| Build Tool | Vite | Next.js |
| Estilização | CSS Modules | Styled Components, Tailwind |
| Roteamento | React Router v6 | - |
| Estado Global | Zustand | Redux Toolkit, Jotai |
| Formulários | React Hook Form | Formik |
| Validação | Zod | Yup |
| HTTP Client | Axios | Fetch API |
| Ícones | React Icons (Ionicons) | Lucide React |
| Data Tables | TanStack Table | AG Grid |
| Charts | Recharts | Chart.js |
| Date Picker | React DatePicker | Day.js |
| Notifications | React Hot Toast | Sonner |
| Testes | Vitest + Testing Library | Jest |

---

## 15. Checklist de Implementação

### Fase 1 - Setup
- [ ] Criar projeto com Vite + TypeScript
- [ ] Configurar estrutura de pastas
- [ ] Configurar theme (variáveis CSS)
- [ ] Instalar dependências
- [ ] Configurar rotas básicas

### Fase 2 - Componentes Base
- [ ] Button
- [ ] Input
- [ ] SearchInput
- [ ] Card (base)
- [ ] Modal
- [ ] Badge
- [ ] Loading Spinner

### Fase 3 - Layout
- [ ] AuthLayout
- [ ] DashboardLayout (Sidebar + Header)
- [ ] PageLayout
- [ ] Section

### Fase 4 - Auth
- [ ] LoginPage
- [ ] RegisterPage
- [ ] AuthStore
- [ ] PrivateRoute

### Fase 5 - Dashboard
- [ ] DashboardPage
- [ ] StatsCards
- [ ] RecentActivity
- [ ] Charts

### Fase 6 - Módulos
- [ ] Stores (CRUD)
- [ ] Wallets (List + Detail)
- [ ] Users (List + Detail)
- [ ] Transactions
- [ ] Reviews

### Fase 7 - Polish
- [ ] Responsividade
- [ ] Dark mode (opcional)
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
