# FastLock Backend

Backend do MVP em Bun + TypeScript + Fastify + Postgres/Supabase, sem ORM. O schema fica em SQL versionado dentro de `db/migrations`.

## Configuracao

1. Instale as dependencias:

```bash
cd backend
bun install
```

2. Preencha `backend/.env`:

```env
PORT=3333
HOST=0.0.0.0
DATABASE_URL=postgresql://postgres.ftckqciojfecxlegjszy:<YOUR-PASSWORD>@aws-1-us-east-2.pooler.supabase.com:5432/postgres
DATABASE_SSL=true
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
ADMIN_API_KEY=change-me
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1 minute
SUPABASE_URL=https://ftckqciojfecxlegjszy.supabase.co
SUPABASE_PUBLISHABLE_KEY=
```

O backend usa acesso direto ao Postgres para dados e Supabase Auth para validar Bearer tokens.

## Modelo de usuarios e organizacoes

Usuarios agora ficam em duas camadas:

- `auth.users`: fonte de verdade do Supabase Auth
- `public.app_users`: espelho do usuario para o dominio da aplicacao

O espelho em `app_users` e sincronizado automaticamente por trigger em `auth.users`. Quando um usuario faz login pela primeira vez, ele passa a existir na camada de dominio e pode ser associado a organizacoes.

Multi-tenant:

- `organizations`: tenant dono dos lockers
- `organization_memberships`: vinculo do usuario com a organizacao
- papeis por org: `owner`, `admin`, `viewer`

Fluxo recomendado para admins por organizacao:

1. Crie a organizacao
2. Crie a membership com `email` ou `user_id`
3. Se o usuario ainda nao existe em `app_users`, use `email`
4. Quando ele fizer login no Supabase, a membership pendente e ativada automaticamente

## Banco

Fonte de verdade das migrations:

```txt
backend/db/migrations/000001_create_migrations_table.sql
backend/db/migrations/000002_create_lockers.sql
backend/db/migrations/000003_create_rentals.sql
backend/db/migrations/000004_create_unlock_events.sql
backend/db/migrations/000005_create_audit_events.sql
backend/db/migrations/000006_enable_rls.sql
backend/db/migrations/000007_create_organizations_and_users.sql
backend/db/migrations/000008_enable_multi_tenant_rls.sql
backend/db/migrations/000009_create_locker_locations.sql
backend/db/seeds/000001_seed_lockers.sql
```

Para aplicar:

```bash
bun run db:migrate
bun run db:seed
```

Arquivo consolidado para SQL Editor do Supabase:

```txt
backend/db/supabase_setup.sql
```

## API

Operacional:

```txt
GET    /api/health
GET    /api-docs
POST   /api/rentals
GET    /api/rentals/:id
POST   /api/unlock-events
GET    /api/lockers?organization_id=<uuid>&status=free&size=M&limit=50&offset=0
```

Auth e tenant:

```txt
GET    /api/me                                      # Bearer Supabase
GET    /api/organizations                          # Bearer Supabase ou x-admin-api-key
POST   /api/organizations                          # Bearer Supabase ou x-admin-api-key
GET    /api/organizations/:organizationId          # membro da org ou x-admin-api-key
GET    /api/organizations/:organizationId/memberships
POST   /api/organizations/:organizationId/memberships
PATCH  /api/organizations/:organizationId/memberships/:membershipId
GET    /api/organizations/:organizationId/lockers
POST   /api/organizations/:organizationId/lockers
PATCH  /api/organizations/:organizationId/lockers/:id
GET    /api/organizations/:organizationId/dashboard
GET    /api/platform/dashboard                     # x-admin-api-key
GET    /api/dashboard                              # alias legado, x-admin-api-key
```

## Como guardar usuarios no banco

Nao crie uma tabela de senha propria. Deixe credenciais e sessao no Supabase Auth.

O backend agora faz isso:

- valida o Bearer token no Supabase
- faz upsert do usuario em `app_users`
- usa `organization_memberships` para autorizacao por tenant

Isso evita depender de `user_metadata` ou de claims estaticas para decidir acesso por organizacao.

## Como assignar admins de cada org

Opcoes:

1. Usuario ja fez login uma vez:

```bash
curl -X POST http://localhost:3333/api/organizations/<org-id>/memberships \
  -H "x-admin-api-key: <ADMIN_API_KEY>" \
  -H "content-type: application/json" \
  -d "{\"user_id\":\"<app-user-id>\",\"role\":\"admin\"}"
```

2. Usuario ainda nao entrou:

```bash
curl -X POST http://localhost:3333/api/organizations/<org-id>/memberships \
  -H "x-admin-api-key: <ADMIN_API_KEY>" \
  -H "content-type: application/json" \
  -d "{\"email\":\"admin@cliente.com\",\"role\":\"admin\"}"
```

Quando esse email autenticar via Supabase, a membership pendente vira `active`.

## Arquitetura

Cada modulo segue:

```txt
*.routes.ts       # declaracao REST e middlewares HTTP
*.controller.ts   # traducao request/response
*.service.ts      # regra de negocio, transacoes e auditoria
*.repository.ts   # SQL e acesso a dados
*.schemas.ts      # contrato JSON Schema e tipos
```

Auditoria:

- toda escrita relevante gera `audit_events`
- `organization_id` acompanha eventos multi-tenant
- tentativas de abertura continuam em `unlock_events`

## Execucao

```bash
bun run dev
```

Health check:

```bash
curl http://localhost:3333/api/health
```

Frontend local com OAuth:

- `Site URL` no Supabase: `http://localhost:3000`
- redirect permitido: `http://localhost:3000/oauth/callback`
- no dev, o Vite faz proxy de `/api` e `/api-docs` para `http://localhost:3333`

## Container monolitico

O deploy em container agora builda o frontend e serve o bundle pela propria API Fastify na mesma imagem.

Build:

```bash
docker build -t fastlock-monolith .
```

Run:

```bash
docker run --env-file backend/.env -p 3333:3333 fastlock-monolith
```

Comportamento:

- `GET /api/*`: API
- `GET /api-docs`: Swagger UI
- `GET /assets/*`: assets do frontend
- demais rotas `GET`: fallback para `index.html` do SPA
