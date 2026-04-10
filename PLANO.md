# Plano de Desenvolvimento do MVP - FastLock

## 1. Objetivo

Construir um MVP funcional para demonstrar o controle digital de acesso a lockers.

O sistema deve permitir que um usuario escolha um locker disponivel, simule um pagamento, receba um codigo unico de acesso, abra o locker por meio desse codigo e permita que o parceiro acompanhe status e metricas simples em um dashboard.

## 2. Escopo do MVP

### Dentro do escopo

- Landing page com apresentacao da solucao.
- Fluxo de uso do usuario.
- Dashboard simples para parceiro.
- API REST em Bun + TypeScript + Fastify.
- Banco Postgres.
- Inicializacao do banco por script SQL.
- Controle de migrations versionadas.
- Cadastro e atualizacao de lockers.
- Criacao de alugueis.
- Geracao de codigo unico.
- Validacao de codigo para abertura do locker.
- Atualizacao de status do locker.
- Simulacao de pagamento.
- Simulacao de abertura do locker.
- Metricas basicas no dashboard.

### Fora do escopo

- Pagamento real.
- Autenticacao completa.
- Integracao com hardware real.
- Integracao com seguro.
- Sistema completo de usuarios e permissoes.
- Multi-tenant real para parceiros.

## 3. Arquitetura Proposta

### Frontend

Stack atual/sugerida:

- Vue.js + Vite.
- Vue Router para navegacao.
- Tailwind.
- Biblioteca simples para QR Code, se houver tempo.

Paginas:

- `/`: landing page.
- `/use`: fluxo do usuario.
- `/partner`: dashboard do parceiro.

### Backend

Stack definida:

- Bun como runtime e gerenciador de pacotes.
- TypeScript.
- Fastify para API HTTP.
- Postgres como banco relacional.
- Driver `pg` para conexao com Postgres.
- Validacao de payloads com schemas JSON do Fastify ou Zod, escolhendo uma abordagem e mantendo consistente.
- Migrations SQL versionadas no repositorio.

O backend deve ficar em uma pasta propria:

```txt
backend/
  package.json
  tsconfig.json
  .env.example
  src/
    server.ts
    app.ts
    config/
      env.ts
    db/
      pool.ts
      migrate.ts
      seed.ts
    modules/
      lockers/
        lockers.routes.ts
        lockers.repository.ts
        lockers.schemas.ts
      rentals/
        rentals.routes.ts
        rentals.repository.ts
        rentals.schemas.ts
      dashboard/
        dashboard.routes.ts
        dashboard.repository.ts
  db/
    init/
      001_create_database.sql
    migrations/
      000001_create_migrations_table.sql
      000002_create_lockers.sql
      000003_create_rentals.sql
      000004_create_unlock_events.sql
    seeds/
      000001_seed_lockers.sql
```

## 4. Banco de Dados

### Estrategia

- Usar Postgres local no desenvolvimento.
- Manter schema em migrations SQL versionadas.
- Criar uma tabela `schema_migrations` para registrar migrations aplicadas.
- Rodar migrations via comando do backend, sem depender de alteracoes manuais no banco.
- Rodar seed separadamente para dados de demonstracao.

### Variaveis de ambiente

Arquivo `backend/.env.example`:

```env
PORT=3333
DATABASE_URL=postgres://fastlock:fastlock@localhost:5432/fastlock
```

### DB init

O DB init deve preparar usuario, database e extensoes necessarias.

Arquivo sugerido: `backend/db/init/001_create_database.sql`

```sql
CREATE USER fastlock WITH PASSWORD 'fastlock';
CREATE DATABASE fastlock OWNER fastlock;

\connect fastlock

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

Observacao: se o ambiente local usar Docker, este arquivo pode ser montado em `/docker-entrypoint-initdb.d/` do container Postgres. Se o banco for criado manualmente ou via Supabase, o init pode ser adaptado para executar apenas as extensoes e permissao de schema.

### Docker opcional para Postgres local

Arquivo sugerido na raiz: `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16
    container_name: fastlock-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    volumes:
      - fastlock-postgres-data:/var/lib/postgresql/data
      - ./backend/db/init:/docker-entrypoint-initdb.d

volumes:
  fastlock-postgres-data:
```

Nesse formato, o container sobe com o superusuario `postgres` e o script de init cria o usuario e o database da aplicacao (`fastlock`). Isso evita conflito entre as variaveis do container e o SQL de inicializacao.

Comandos planejados:

```bash
docker compose up -d postgres
cd backend
bun install
bun run db:migrate
bun run db:seed
bun run dev
```

## 5. Controle de Migrations

### Modelo escolhido

Controlar migrations com arquivos SQL e um runner em TypeScript executado pelo Bun.

Motivo:

- O MVP precisa de controle claro e auditavel do schema.
- SQL puro e suficiente para poucas tabelas.
- Evita amarrar o MVP cedo demais a um ORM.
- Mantem compatibilidade direta com Postgres local e Supabase, se for usado depois.

### Tabela de controle

Migration base: `backend/db/migrations/000001_create_migrations_table.sql`

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id text PRIMARY KEY,
  name text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
```

### Regra do runner

O script `backend/src/db/migrate.ts` deve:

1. Abrir conexao com `DATABASE_URL`.
2. Garantir que `schema_migrations` existe.
3. Ler arquivos `backend/db/migrations/*.sql` em ordem lexicografica.
4. Para cada arquivo ainda nao registrado, executar dentro de uma transacao.
5. Registrar o arquivo em `schema_migrations`.
6. Interromper a execucao se qualquer migration falhar.

Scripts planejados em `backend/package.json`:

```json
{
  "scripts": {
    "dev": "bun --watch src/server.ts",
    "start": "bun src/server.ts",
    "typecheck": "tsc --noEmit",
    "db:migrate": "bun src/db/migrate.ts",
    "db:seed": "bun src/db/seed.ts"
  }
}
```

### Convencao de nomes

Formato:

```txt
000001_create_migrations_table.sql
000002_create_lockers.sql
000003_create_rentals.sql
000004_create_unlock_events.sql
```

Regras:

- Nunca editar uma migration que ja foi aplicada em outro ambiente.
- Criar nova migration para mudancas de schema.
- Usar transacoes no runner, nao dentro de cada arquivo SQL.
- Seeds nao devem ficar na pasta de migrations.

## 6. Modelo de Dados

### `lockers`

Campos:

- `id`: UUID gerado no banco.
- `code`: identificador humano curto, unico, exemplo `LCK-001`.
- `size`: tamanho do locker. Valores esperados: `P`, `M`, `G`.
- `status`: estado atual. Valores esperados: `free`, `occupied`, `maintenance`.
- `created_at`: data de criacao.
- `updated_at`: data da ultima atualizacao.

Migration sugerida:

```sql
CREATE TABLE lockers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  size text NOT NULL CHECK (size IN ('P', 'M', 'G')),
  status text NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'maintenance')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX lockers_status_idx ON lockers (status);
CREATE INDEX lockers_size_idx ON lockers (size);
```

### `rentals`

Campos:

- `id`: UUID gerado no banco.
- `locker_id`: locker associado ao aluguel.
- `access_code`: codigo unico de acesso.
- `status`: estado atual. Valores esperados: `active`, `finished`, `cancelled`.
- `started_at`: data de inicio.
- `finished_at`: data de finalizacao.
- `created_at`: data de criacao.
- `updated_at`: data da ultima atualizacao.

Migration sugerida:

```sql
CREATE TABLE rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locker_id uuid NOT NULL REFERENCES lockers(id),
  access_code text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished', 'cancelled')),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX rentals_active_access_code_unique
  ON rentals (access_code)
  WHERE status = 'active';

CREATE INDEX rentals_locker_id_idx ON rentals (locker_id);
CREATE INDEX rentals_status_idx ON rentals (status);
```

### `unlock_events`

Campos:

- `id`: UUID gerado no banco.
- `rental_id`: aluguel associado quando o codigo for valido.
- `locker_id`: locker associado quando o codigo for valido.
- `access_code`: codigo informado.
- `success`: se a tentativa foi aceita.
- `reason`: motivo em caso de falha.
- `created_at`: data da tentativa.

Migration sugerida:

```sql
CREATE TABLE unlock_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid REFERENCES rentals(id),
  locker_id uuid REFERENCES lockers(id),
  access_code text NOT NULL,
  success boolean NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX unlock_events_created_at_idx ON unlock_events (created_at);
CREATE INDEX unlock_events_success_idx ON unlock_events (success);
```

## 7. API REST

Prefixo recomendado: `/api`.

### Health

#### `GET /api/health`

Retorna status basico da API.

Resposta:

```json
{
  "status": "ok"
}
```

### Lockers

#### `GET /api/lockers`

Lista lockers.

Query params opcionais:

- `status`: `free`, `occupied`, `maintenance`.
- `size`: `P`, `M`, `G`.

Uso no MVP:

- Exibir lockers disponiveis no fluxo do usuario.
- Exibir status no dashboard do parceiro.

#### `POST /api/lockers`

Cria um locker.

Payload:

```json
{
  "code": "LCK-001",
  "size": "M"
}
```

Comportamento:

- Criar locker com status inicial `free`.
- Validar `code` unico.
- Retornar o locker criado.

#### `PATCH /api/lockers/:id`

Atualiza um locker.

Payload:

```json
{
  "status": "maintenance"
}
```

Comportamento:

- Validar se o locker existe.
- Atualizar apenas campos enviados.
- Retornar o locker atualizado.

### Rentals

#### `POST /api/rentals`

Cria um aluguel.

Payload:

```json
{
  "locker_id": "uuid-do-locker"
}
```

Comportamento:

- Validar se o locker existe.
- Validar se o locker esta `free`.
- Gerar `access_code` unico entre alugueis ativos.
- Criar rental com status `active`.
- Marcar locker como `occupied`.
- Executar criacao do aluguel e atualizacao do locker na mesma transacao.
- Retornar rental criado com codigo de acesso.

#### `GET /api/rentals/:id`

Busca um aluguel especifico.

Comportamento:

- Validar se o aluguel existe.
- Retornar dados do aluguel e do locker associado.

### Unlock

#### `POST /api/unlock`

Valida o codigo de acesso e simula a abertura do locker.

Payload:

```json
{
  "access_code": "839204"
}
```

Comportamento:

- Validar se existe aluguel ativo com esse codigo.
- Registrar tentativa em `unlock_events`.
- Retornar mensagem `Locker aberto` quando valido.
- Para o MVP, finalizar automaticamente o aluguel e liberar o locker apos abertura.
- Executar finalizacao do aluguel, liberacao do locker e registro do evento em transacao.

Resposta:

```json
{
  "message": "Locker aberto",
  "rental_id": "uuid-do-rental",
  "locker_id": "uuid-do-locker"
}
```

### Dashboard

#### `GET /api/dashboard`

Retorna metricas simples para o parceiro.

Metricas:

- Total de lockers.
- Lockers livres.
- Lockers ocupados.
- Lockers em manutencao.
- Alugueis ativos.
- Alugueis finalizados.
- Total de alugueis criados.
- Tentativas de abertura com sucesso.
- Tentativas de abertura recusadas.

Exemplo:

```json
{
  "total_lockers": 10,
  "free_lockers": 6,
  "occupied_lockers": 3,
  "maintenance_lockers": 1,
  "active_rentals": 3,
  "finished_rentals": 12,
  "total_rentals": 15,
  "successful_unlocks": 12,
  "failed_unlocks": 2
}
```

## 8. Regras de Negocio

### Criacao de aluguel

- O locker escolhido deve existir.
- O locker escolhido deve estar com status `free`.
- O codigo gerado deve ser unico entre alugueis ativos.
- A criacao do aluguel e a mudanca do locker para `occupied` devem ocorrer na mesma transacao.
- Se a transacao falhar, nenhum estado parcial deve ficar salvo.

### Geracao de codigo

- Gerar codigo numerico de 6 digitos para facilitar a demonstracao.
- Antes de salvar, verificar conflito com `rentals_active_access_code_unique`.
- Em caso de colisao, tentar gerar novamente.
- Limitar tentativas e retornar erro interno se houver falha repetida.

### Abertura do locker

- O codigo informado deve existir em um aluguel `active`.
- O sistema deve registrar tentativa valida ou invalida em `unlock_events`.
- No MVP, abertura valida finaliza o aluguel e libera o locker.
- Codigo invalido nao altera locker nem rental.

## 9. Fluxos Principais

### Fluxo do usuario

1. Usuario acessa `/use`.
2. Frontend chama `GET /api/lockers?status=free`.
3. Usuario escolhe um locker.
4. Usuario clica em `Pagar`.
5. Frontend simula pagamento aprovado.
6. Frontend chama `POST /api/rentals`.
7. Backend cria aluguel, gera codigo e ocupa o locker.
8. Usuario visualiza o codigo de acesso.
9. Usuario informa o codigo para abrir o locker.
10. Frontend chama `POST /api/unlock`.
11. Backend valida o codigo, registra evento, finaliza rental e libera locker.
12. Frontend exibe `Locker aberto`.

### Fluxo do parceiro

1. Parceiro acessa `/partner`.
2. Frontend chama `GET /api/dashboard`.
3. Frontend chama `GET /api/lockers`.
4. Sistema exibe quantidade de lockers livres, ocupados e em manutencao.
5. Sistema exibe alugueis ativos e finalizados.
6. Sistema permite acompanhar o status operacional do MVP.

## 10. Seed de Demonstracao

Arquivo sugerido: `backend/db/seeds/000001_seed_lockers.sql`

```sql
INSERT INTO lockers (code, size, status)
VALUES
  ('LCK-001', 'P', 'free'),
  ('LCK-002', 'M', 'free'),
  ('LCK-003', 'G', 'free'),
  ('LCK-004', 'M', 'maintenance'),
  ('LCK-005', 'P', 'free')
ON CONFLICT (code) DO NOTHING;
```

O script `backend/src/db/seed.ts` deve executar os arquivos de seed em ordem e usar `ON CONFLICT` para permitir reexecucao segura.

## 11. Etapas de Desenvolvimento

### Etapa 1 - Setup do backend

Entregas:

- Criar pasta `backend`.
- Configurar Bun + TypeScript.
- Instalar Fastify, `pg` e ferramentas de desenvolvimento.
- Criar `src/app.ts` e `src/server.ts`.
- Criar `GET /api/health`.
- Criar `.env.example`.

Criterio de conclusao:

- `bun run dev` inicia a API.
- `GET /api/health` responde `status: ok`.

### Etapa 2 - Postgres, init e migrations

Entregas:

- Criar `docker-compose.yml` para Postgres local, se o projeto usar Docker.
- Criar `backend/db/init/001_create_database.sql`.
- Criar pasta `backend/db/migrations`.
- Criar migration de `schema_migrations`.
- Criar runner `backend/src/db/migrate.ts`.
- Criar scripts `db:migrate` e `db:seed`.

Criterio de conclusao:

- Banco sobe localmente.
- `bun run db:migrate` aplica migrations em ordem.
- `schema_migrations` registra os arquivos aplicados.
- Rodar o comando novamente nao reaplica migrations ja registradas.

### Etapa 3 - Schema inicial

Entregas:

- Criar migration `lockers`.
- Criar migration `rentals`.
- Criar migration `unlock_events`.
- Criar seed inicial de lockers.

Criterio de conclusao:

- Tabelas existem no Postgres.
- Seed cria lockers de demonstracao.
- Constraints impedem status e tamanhos invalidos.

### Etapa 4 - Rotas de lockers

Entregas:

- Implementar `GET /api/lockers`.
- Implementar `POST /api/lockers`.
- Implementar `PATCH /api/lockers/:id`.
- Validar payloads.

Criterio de conclusao:

- API lista lockers do banco.
- API cria lockers com `code` unico.
- API atualiza status de locker existente.

### Etapa 5 - Rotas de rentals

Entregas:

- Implementar `POST /api/rentals`.
- Implementar `GET /api/rentals/:id`.
- Implementar transacao para criar aluguel e ocupar locker.
- Implementar geracao de codigo unico.

Criterio de conclusao:

- Usuario consegue criar aluguel para locker livre.
- Locker ocupado nao pode ser alugado novamente.
- Rental criado retorna codigo de acesso.

### Etapa 6 - Unlock e dashboard

Entregas:

- Implementar `POST /api/unlock`.
- Registrar tentativas em `unlock_events`.
- Finalizar rental e liberar locker em caso de sucesso.
- Implementar `GET /api/dashboard`.

Criterio de conclusao:

- Codigo valido abre locker.
- Codigo invalido nao altera estado.
- Dashboard reflete lockers, rentals e tentativas de abertura.

### Etapa 7 - Integracao com frontend

Entregas:

- Configurar base URL da API no frontend.
- Trocar dados mockados por chamadas HTTP.
- Conectar `/use` aos endpoints de lockers, rentals e unlock.
- Conectar `/partner` ao endpoint de dashboard.

Criterio de conclusao:

- Fluxo completo funciona ponta a ponta.
- Dashboard atualiza conforme o uso do MVP.

## 12. Riscos e Cuidados

### Codigo duplicado

Risco:

- Gerar o mesmo codigo para dois alugueis ativos.

Mitigacao:

- Usar indice unico parcial em `rentals(access_code)` para status `active`.
- Tentar gerar novo codigo em caso de colisao.

### Estado inconsistente

Risco:

- Rental criado, mas locker nao atualizado.

Mitigacao:

- Usar transacao no backend.
- Centralizar regra de criacao de aluguel no modulo de rentals.

### Migrations fora de controle

Risco:

- Ambientes com schema diferente por alteracoes manuais.

Mitigacao:

- Toda mudanca de schema deve virar nova migration.
- `schema_migrations` deve ser a fonte de controle de aplicacao.
- Seeds ficam separados das migrations.

### Demonstracao sem dados

Risco:

- Dashboard vazio ou sem informacao util.

Mitigacao:

- Manter seed idempotente de lockers.
- Criar alugueis pela propria interface durante a demonstracao.

## 13. Roteiro de Demonstracao

1. Subir Postgres.
2. Rodar `bun run db:migrate`.
3. Rodar `bun run db:seed`.
4. Rodar backend com `bun run dev`.
5. Rodar frontend.
6. Acessar `/`.
7. Acessar `/use`.
8. Escolher um locker livre.
9. Clicar em `Pagar`.
10. Exibir o codigo unico gerado.
11. Informar o codigo para abrir o locker.
12. Exibir mensagem `Locker aberto`.
13. Acessar `/partner`.
14. Mostrar status atualizado dos lockers.
15. Mostrar metricas simples no dashboard.

## 14. Backlog Opcional

- QR Code para codigo de acesso.
- Historico de alugueis no dashboard.
- Filtro por tamanho do locker.
- Botao para finalizar aluguel manualmente.
- Tela de administracao para criar lockers.
- Autenticacao simples para parceiro.
- Deploy do backend.
- Deploy do Postgres gerenciado.
