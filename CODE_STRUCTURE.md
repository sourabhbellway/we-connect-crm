# Code Structure & Conventions

This document defines how code is organized across the monorepo and the conventions to follow.

## 1) Repository Layout
- client/ — React (TypeScript) app with Vite and Tailwind
- api/ — NestJS + Prisma API (feature-based modules)

## 2) Frontend (client/) Structure
````mdx path=null start=null
src/
├─ assets/              # Images, icons, fonts
├─ components/          # Reusable UI components (dumb/presentational when possible)
│  ├─ ui/               # Design system primitives (Button, Card, Input, etc.)
│  └─ shared/           # Cross-feature composites (e.g., Timeline, NotificationPanel)
├─ features/            # Module-based features (e.g., business-settings)
│  └─ <feature>/
│     ├─ services/      # Feature-specific API calls
│     └─ types/         # Feature-specific types
├─ layouts/             # Shared layouts (Sidebar, Header)
├─ pages/               # Route-level pages (grouped by domain)
├─ services/            # API client and domain services (Axios)
├─ hooks/               # Custom React hooks
├─ contexts/            # Global providers (Auth, Theme, Language, Counts, Menu)
├─ constants/           # App-wide enums, labels, roles, config
├─ utils/               # Pure helper functions
├─ i18n/                # Translations and i18n setup
└─ types/               # Global Typescript interfaces/types
````

Conventions:
- Components: PascalCase; hooks: useXxx; files: PascalCase for components, camelCase for utils.
- Only functional components; avoid classes.
- No magic numbers or hardcoded strings—centralize in constants/config.
- Forms: React Hook Form + Yup via @hookform/resolvers.
- Routing: React Router; protect routes with <ProtectedRoute /> using context perms.
- State: React Context API; prefer local state for component concerns.
- API: Single Axios instance (services/apiClient.ts) with interceptors (auth, errors).
- Testing: Jest + React Testing Library; put *.test.tsx next to components or in __tests__.
- Performance: lazy-load heavy routes/components; use React.memo/useMemo/useCallback where appropriate.

## 3) Backend (api/) Structure
````mdx path=null start=null
src/
├─ app.module.ts               # Root module
├─ main.ts                     # Bootstrap (global prefix, pipes)
├─ config/                     # Config via @nestjs/config
│  ├─ app.config.ts
│  ├─ database.config.ts
│  └─ jwt.config.ts
├─ common/                     # Cross-cutting concerns
│  ├─ decorators/
│  │  └─ user.decorator.ts
│  ├─ filters/
│  │  └─ http-exception.filter.ts
│  ├─ interceptors/
│  │  └─ logging.interceptor.ts
│  └─ utils/
│     └─ hash.util.ts
├─ database/
│  └─ prisma.service.ts        # Prisma client wiring
├─ modules/                    # Feature modules
│  ├─ auth/
│  │  ├─ auth.module.ts
│  │  ├─ auth.service.ts
│  │  ├─ auth.controller.ts
│  │  ├─ strategies/
│  │  │  └─ jwt.strategy.ts
│  │  └─ dto/
│  │     ├─ login.dto.ts
│  │     ├─ register.dto.ts
│  │     └─ refresh.dto.ts
│  └─ users/
│     ├─ users.module.ts
│     ├─ users.service.ts
│     ├─ users.controller.ts
│     └─ dto/
│        └─ create-user.dto.ts
└─ prisma/
   └─ schema.prisma            # Database schema (Prisma)
````

Conventions:
- Modules are feature-based (auth, users, leads, contacts, deals, etc.).
- Controllers: request/response mapping only; Services: business logic.
- DTOs: validation via class-validator.
- Guards/Interceptors/Filters live in common/ and are registered globally or per-route.
- Config: keep secrets and env in .env; access via ConfigModule.
- Testing: unit tests per module; e2e tests under test/.

## 4) Branching & Commits
- main is protected. Use feature/<name> branches; conventional commits (feat:, fix:, chore:, docs:, refactor:).

## 5) Linting & Formatting
- ESLint + Prettier enforced; run `npm run lint` and `npm run format` in client; Nest lint in api.
