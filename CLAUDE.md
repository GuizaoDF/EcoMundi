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
A single-page marketing site assembled from section components (`components/header.tsx`, `components/hero.tsx`, `components/about.tsx`, `components/practice-areas.tsx`, `components/services.tsx`, `components/profissionais.tsx`, `components/newsletter.tsx`, `components/clientes.tsx`, `components/contact.tsx`, `components/footer.tsx`, `components/whatsapp-button.tsx`). There is also a `/noticias` section (`app/noticias/`) that lists and shows individual news articles fetched from the database.

### Admin panel (`app/admin/`)
Password-protected dashboard at `/admin`. Route groups:
- `(auth)` — login page, no sidebar
- `(dashboard)` — authenticated pages with `Sidebar` + `Header` layout (`components/admin/`)

Admin pages: Dashboard stats, Contatos (contact form submissions), Newsletter (subscriber list), Notícias (news CRUD + newsletter dispatch), Usuários (user management).

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

### Notes
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` — the build won't fail on TS errors.
- `contexts/news-context.tsx` (`NewsContext`) is legacy in-memory state from an earlier prototype; production data comes from the DB via API routes.
- Newsletter dispatch sends in batches of 8 concurrent emails and records `newsletter_enviado_em` to prevent double-sending.
- Admin auth routes are **not** protected by middleware — each admin API route that needs auth calls `getSession()` and returns 401 manually.
