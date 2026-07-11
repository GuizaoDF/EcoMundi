# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm**. Always use `pnpm` (not `npm`) to install packages.

```bash
pnpm dev          # Start development server
pnpm build        # Production build (TypeScript errors are ignored — see next.config.mjs)
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm add <pkg>    # Install a new package
```

There are no tests in this project.

## Required Environment Variables

Create `.env.local` with:

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_TO=         # recipient for contact form notifications

JWT_SECRET=       # used to sign/verify session cookies
SITE_URL=         # e.g. https://ecomundi.com.br (used in newsletter email links)

ADMIN_USER=       # seeds the first admin user on first login if DB is empty
ADMIN_PASSWORD=

NEXT_PUBLIC_HCAPTCHA_SITE_KEY=   # hCaptcha public site key (test: 10000000-ffff-ffff-ffff-000000000001)
HCAPTCHA_SECRET_KEY=             # hCaptcha secret key (test: 0x0000000000000000000000000000000000000000)
```

## Architecture

**ECO MUNDI** is a Next.js 16 (App Router) website for an environmental consulting firm. It has two distinct parts:

### Public site (`app/page.tsx`)
A single-page marketing site assembled from section components (`components/header.tsx`, `components/hero.tsx`, `components/about.tsx`, `components/practice-areas.tsx`, `components/services.tsx`, `components/profissionais.tsx`, `components/newsletter.tsx`, `components/clientes.tsx`, `components/contact.tsx`, `components/footer.tsx`, `components/whatsapp-button.tsx`). There is also a `/noticias` section (`app/noticias/`) that lists and shows individual news articles fetched from the database. The `/diagnostico` route (`app/diagnostico/`) hosts the public-facing multi-step diagnostic form (see Módulo de Diagnóstico below).

### Admin panel (`app/admin/`)
Password-protected dashboard at `/admin`. Route groups:
- `(auth)` — login page, no sidebar
- `(dashboard)` — authenticated pages with `Sidebar` + `Header` layout (`components/admin/`)

Admin pages: Dashboard stats, Contatos (contact form submissions), Newsletter (subscriber list), Notícias (news CRUD + newsletter dispatch), Usuários (user management), Diagnóstico (formulários CRUD + gerenciamento de perguntas/categorias + convites + resultados).

### API routes (`app/api/`)

| Route | Purpose |
|---|---|
| `POST /api/contact` | Saves contact to DB, sends email to admin + confirmation to sender |
| `POST /api/newsletter` | Subscribes email to newsletter, sends welcome email; validates MX record |
| `GET /api/noticias` | Lists published news |
| `GET /api/noticias/[slug]` | Gets single article |
| `GET /api/noticias/[slug]/imagem` | Serves article image stored as BLOB |
| `POST /api/admin/auth/login` | JWT auth (cookie `ecomundi_session`, 7d); seeds first admin if DB empty |
| `POST /api/admin/auth/logout` | Clears session cookie |
| `GET /api/admin/auth/me` | Returns current session |
| `GET/POST /api/admin/noticias` | List/create news articles |
| `GET/PUT/DELETE /api/admin/noticias/[id]` | Read/update/delete article |
| `GET/POST /api/admin/noticias/[id]/enviar-newsletter` | Preview / send newsletter to all active subscribers in batches of 8 |
| `GET /api/admin/contatos` | List contact submissions |
| `DELETE /api/admin/contatos/[id]` | Delete contact |
| `GET /api/admin/newsletter` | List newsletter subscribers |
| `DELETE /api/admin/newsletter/[id]` | Remove subscriber |
| `GET/POST /api/admin/usuarios` | List/create admin users |
| `PUT/DELETE /api/admin/usuarios/[id]` | Update/delete admin user |
| `GET /api/admin/dashboard` | Aggregate stats (counts for contatos, newsletter, noticias) |
| `GET /api/diagnostico/convite/[token]` | Validates invite token and returns pre-fill data |
| `GET /api/diagnostico/perguntas` | Lists active questions for the active form |
| `GET /api/diagnostico/verificar` | Checks if email/CNPJ already has a completed diagnostic (resubmission lock) |
| `POST /api/diagnostico/submeter` | Submits answers, calculates score, saves result, sends emails |
| `GET/POST /api/admin/diagnostico/formularios` | List/create diagnostic forms |
| `GET/PUT/DELETE /api/admin/diagnostico/formularios/[id]` | Read/update/delete form |
| `PUT /api/admin/diagnostico/formularios/[id]/ativar` | Activate a form (deactivates all others) |
| `GET/POST /api/admin/diagnostico/categorias` | List categories by form / create category; `?all=true` returns distinct names across all forms |
| `PUT/DELETE /api/admin/diagnostico/categorias/[id]` | Update/delete category |
| `GET/POST /api/admin/diagnostico/perguntas` | List questions by category / create question; `?all=true` returns questions from other categories |
| `GET/PUT/DELETE /api/admin/diagnostico/perguntas/[id]` | Read/update/delete question (delete deactivates if answers exist) |
| `GET /api/admin/diagnostico/resultados` | List results paginated with search |
| `GET/PATCH/DELETE /api/admin/diagnostico/resultados/[id]` | Detail result; PATCH toggles `desbloqueado`; DELETE removes |
| `GET/POST /api/admin/diagnostico/convites` | List/create invites (generates UUID token, sends email) |

### Key libraries
- **Database**: `mysql2/promise` via a connection pool singleton at `lib/db.ts`
- **Auth**: `jose` JWT signed with `JWT_SECRET`, verified via `lib/auth.ts`; `getSession()` reads the cookie server-side
- **Email**: `nodemailer` for all outbound email (contact notifications, welcome emails, newsletter dispatch)
- **Email validation**: `lib/email-validator.ts` — regex format check + DNS MX record lookup
- **Image processing**: `jimp` for resizing article images before storing as BLOB
- **UI**: Tailwind CSS v4, shadcn/ui components (`components/ui/`), Radix UI primitives, `lucide-react` icons
- **Fonts**: Cormorant Garamond (serif, CSS var `--font-serif`) + Inter (sans, `--font-sans`)

### Database tables
`usuarios`, `contatos`, `newsletter` (columns: `id`, `email`, `ativo`, `criado_em`), `noticias` (columns: `id`, `titulo`, `slug`, `resumo`, `conteudo`, `imagem` BLOB, `publicado`, `newsletter_enviado_em`, `criado_em`, `atualizado_em`).

**Diagnóstico** (seed: `scripts/diagnostico-seed.sql`, migrations: `scripts/diagnostico-desbloqueio.sql`, `scripts/diagnostico-campos-perfil.sql`):
- `diagnostico_formularios` — `id`, `nome`, `descricao`, `campos_perfil` JSON, `ativo`, `criado_em`
- `diagnostico_categorias` — `id`, `formulario_id`, `nome`, `descricao`, `ordem`, `ativo`
- `diagnostico_perguntas` — `id`, `categoria_id`, `texto`, `ordem`, `ativo`
- `diagnostico_alternativas` — `id`, `pergunta_id`, `texto`, `pontuacao` (0–4), `ordem`
- `diagnostico_resultados` — `id`, `formulario_id`, `nome`, `email`, `telefone`, `razao_social`, `cnpj`, `dados_perfil` JSON, `pontuacao_total`, `pontuacao_maxima`, `percentual`, `classificacao` ENUM, `desbloqueado`, `email_enviado`, `criado_em`
- `diagnostico_respostas` — `id`, `resultado_id`, `pergunta_id`, `alternativa_id`, `pontuacao`
- `diagnostico_scores_categoria` — `id`, `resultado_id`, `categoria_id`, `pontuacao`, `pontuacao_max`, `percentual`
- `diagnostico_convites` — `id`, `formulario_id`, `email`, `nome_empresa`, `nome_contato`, `mensagem`, `token` (unique UUID), `status` (`pendente`|`concluido`), `resultado_id`, `criado_em`, `concluido_em`

### Notes
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` — the build won't fail on TS errors.
- `contexts/news-context.tsx` (`NewsContext`) is legacy in-memory state from an earlier prototype; production data comes from the DB via API routes.
- Newsletter dispatch sends in batches of 8 concurrent emails and records `newsletter_enviado_em` to prevent double-sending.
- Admin auth routes are **not** protected by middleware — each admin API route that needs auth calls `getSession()` and returns 401 manually.

### Módulo de Diagnóstico
**Fluxo público** (`app/diagnostico/page.tsx`): `intro → dados (nome + email + hCaptcha) → identificacao (empresa + CNPJ + telefone + campos_perfil dinâmicos) → perguntas (uma categoria por vez) → resultado`.

- Only one form can be `ativo` at a time; it is the one shown on the public site.
- **Resubmission lock**: on "Iniciar Questionário", the frontend calls `GET /api/diagnostico/verificar`. If `email` OR `cnpj` already exists in `diagnostico_resultados` with `desbloqueado = 0` for the same `formulario_id`, the user is blocked with a message linking to `/contato`. The `submeter` route enforces the same check server-side (returns 409).
- **Admin unblock**: `PATCH /api/admin/diagnostico/resultados/[id]` with `{ desbloqueado: 1 }` allows a new submission without deleting history. Can be reverted with `{ desbloqueado: 0 }`.
- **Invites** (`diagnostico_convites`): unique UUID token sent by email; pre-fills nome, empresa, e-mail on the form; token status changes `pendente → concluido` on submission. Token reuse returns HTTP 410.
- **Scoring**: each question has 5 alternatives scored 0–4. Classification by percentual: `< 25%` → Crítico, `< 50%` → Vulnerável, `< 75%` → Em Desenvolvimento, `≥ 75%` → Conformidade Adequada.
- `lib/diagnostico-email-copy.ts` — analysis texts per classification and per category used in result emails.
- **Category/question reuse**: when creating a new category or question in the admin, a search shows existing ones from other forms/categories that can be pre-filled to avoid duplication. Duplicate category names within the same form are blocked (API + frontend).
- Question deletion deactivates the question (instead of deleting) if it has recorded answers.
- **Perfil da Empresa (`campos_perfil`)**: each form has a JSON array of configurable profile fields shown in Step 2 of the public form. Managed via `/admin/diagnostico/formularios/[id]/perfil`. Field types: `text`, `number`, `boolean` (SIM/NÃO buttons), `select` (option grid). `telefone` is a fixed standard field present on all forms. Answers are saved as `dados_perfil` JSON in `diagnostico_resultados`. The `PUT /api/admin/diagnostico/formularios/[id]` is a **partial update** — only keys present in the body are updated, so sending `{ campos_perfil: [...] }` does not overwrite `nome`/`descricao`. The "Carregar existente" panel in the perfil editor shows campos from all forms (including the current one as templates) — loading a same-form campo clears the ID so the user must change the label to generate a new unique campo.
