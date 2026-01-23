# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MIBE Admin is a React administrative panel for a cashback/digital wallet system. The frontend connects to a backend API managing stores (establishments), wallets, users, transactions, and reviews.

**Current Status:** Fully implemented with Next.js 14 App Router. Using mock data for development.

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** CSS Modules
- **State Management:** Zustand
- **HTTP Client:** Axios (currently using mock data)
- **Icons:** React Icons (Ionicons - `react-icons/io5`)
- **Notifications:** React Hot Toast

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Development Notes

- All services (authService, storeService, etc.) are currently using **mock data**
- To switch to real API: uncomment the API code at the bottom of each service file
- Mock login: `admin@mibe.com` with any password

## Design System

The UI must match the existing MIBE mobile app. Key design tokens are defined in [docs/spec-frontend.md](docs/spec-frontend.md):

- **Primary color:** `#181818` (dark gray)
- **Font:** Plus Jakarta Sans (weights: 400, 500, 600, 700)
- **Input height:** 56px, Search height: 44px
- **Border radius:** sm=4px, md=8px, lg=12px
- **Icons:** Ionicons library

## Architecture

### Next.js App Router Structure

- **Route Groups:**
  - `(auth)` - Public routes: login, register
  - `(dashboard)` - Protected routes: dashboard, stores, wallets, users, transactions

- **Middleware:** Route protection at [src/middleware.ts](src/middleware.ts)

- **Components:**
  - `common/` - Reusable UI components (Button, Input, Modal, etc.)
  - `layout/` - Layout components (Sidebar, Header, PageLayout, etc.)
  - `domain/` - Business-specific components (StoreCard, WalletCard, etc.)
  - Each component has its own folder with `.tsx`, `.module.css`, and `index.ts`

- **Client Components:** Components using hooks, state, or events have `'use client'` directive

- **Services:** API abstraction layer (currently using mock data)

- **Custom Hooks:** `useFetch`, `useDebounce`, `useForm`, `useAuth`

- **Path Aliases:** `@/` prefix (e.g., `@/components`, `@/hooks`)

Detailed patterns in [docs/architecture-frontend.md](docs/architecture-frontend.md)

## Key Entities

- **Store:** Establishment with cashback rules, location, reviews
- **Wallet:** User's balance at a specific store with expiration
- **Transaction:** Credit/debit operations on wallets
- **User:** Roles include `user`, `admin`, `store_owner`
- **Review:** Store ratings with optional store replies

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `StoreCard` |
| Functions/Hooks | camelCase | `useAuth` |
| Constants | SCREAMING_SNAKE_CASE | `API_URL` |
| CSS Modules | camelCase | `styles.buttonPrimary` |

## Language

Documentation and UI text are in Brazilian Portuguese. Code (variables, functions, comments) should be in English.
