# ECO MUNDI — Documentação do Sistema

**Versão documentada:** Julho 2026  
**Stack:** Next.js 16 (App Router) · TypeScript · MySQL · Tailwind CSS v4 · shadcn/ui

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Tecnologias e Dependências](#tecnologias-e-dependências)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Site Público](#site-público)
5. [Painel Administrativo](#painel-administrativo)
6. [Módulo Diagnóstico — Detalhes](#módulo-diagnóstico--detalhes)
7. [Módulo E-books — Detalhes](#módulo-e-books--detalhes)
8. [API Routes](#api-routes)
9. [Banco de Dados](#banco-de-dados)
10. [Comandos](#comandos)

---

## Visão Geral

**ECO MUNDI** é o site institucional de uma empresa de consultoria ambiental. O sistema é composto por:

- **Site público** — landing page de marketing + páginas de notícias, e-books e diagnóstico
- **Painel administrativo** (`/admin`) — gerenciamento de todo o conteúdo, protegido por autenticação JWT
- **API RESTful** — endpoints Next.js App Router que conectam frontend ao banco MySQL

---

## Tecnologias e Dependências

| Categoria | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS v4, shadcn/ui, Radix UI |
| Banco de dados | MySQL 8 via `mysql2/promise` |
| Autenticação | JWT (`jose`) — cookie `ecomundi_session` (7 dias) |
| E-mail | Nodemailer (SMTP) |
| Captcha | hCaptcha (`@hcaptcha/react-hcaptcha`) |
| Editor rich text | Tiptap (`@tiptap/react`) com StarterKit, Underline, TextAlign, Link |
| Gráficos | Recharts (painel de diagnóstico) |
| Processamento de imagem | Jimp (redimensionamento antes do BLOB) |
| Validação de e-mail | Regex + DNS MX lookup (`lib/email-validator.ts`) |
| Ícones | lucide-react |
| Fontes | Cormorant Garamond (serif) + Inter (sans) |
| Gerenciador de pacotes | pnpm |

---

## Variáveis de Ambiente

Criar `.env.local` na raiz do projeto:

```env
# Banco de dados
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# E-mail (SMTP)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_TO=          # destinatário das notificações de contato

# Autenticação
JWT_SECRET=        # string aleatória longa para assinar cookies JWT
SITE_URL=          # ex: https://ecomundi.com.br (usado em links de e-mail)

# Primeiro admin (seed automático no primeiro login se o banco estiver vazio)
ADMIN_USER=
ADMIN_PASSWORD=

# hCaptcha
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=    # chave pública (test: 10000000-ffff-ffff-ffff-000000000001)
HCAPTCHA_SECRET_KEY=              # chave secreta (test: 0x0000000000000000000000000000000000000000)
```

---

## Site Público

### Home (`/`)

Landing page de página única composta pelas seguintes seções (em ordem):

| Componente | Descrição |
|---|---|
| `Header` | Navegação fixa com links para âncoras + "E-books" + "Notícias" |
| `Hero` | Banner principal com CTA |
| `About` | Seção "Sobre nós" |
| `PracticeAreas` | Áreas de atuação |
| `Services` | Serviços oferecidos |
| `Profissionais` | Equipe |
| `Newsletter` | Formulário de inscrição na newsletter com hCaptcha |
| `Clientes` | Logos de clientes |
| `Contact` | Formulário de contato com hCaptcha |
| `Footer` | Rodapé |
| `WhatsAppButton` | Botão flutuante do WhatsApp |

### Notícias (`/noticias`)

- Lista todas as notícias publicadas (busca via `/api/noticias`)
- Cards com imagem (ou gradiente), título, resumo, data
- Cada card leva para `/noticias/[slug]`

### Artigo de Notícia (`/noticias/[slug]`)

- Exibe o conteúdo completo em HTML (gerado pelo editor Tiptap)
- Renderizado com `dangerouslySetInnerHTML` e classes Tailwind `prose`

### E-books (`/ebooks`)

- Lista e-books ativos (busca via `/api/ebooks`)
- Cards com capa (ou gradiente), título, descrição e botão "Baixar grátis"
- Ao clicar, abre modal de captura de lead (ver [Módulo E-books](#módulo-e-books--detalhes))

### Diagnóstico (`/diagnostico`)

- Formulário público de diagnóstico de conformidade ambiental
- Acesso direto ou via link de convite com token (`/diagnostico?token=...`)
- Ver [Módulo Diagnóstico](#módulo-diagnóstico--detalhes) para detalhes do fluxo

### Cancelar Inscrição (`/cancelar-inscricao/[token]`)

- Página de descadastro da newsletter
- Token JWT assinado com `JWT_SECRET`, válido por 365 dias
- Ao confirmar, chama `POST /api/newsletter/cancelar` e inativa o e-mail

---

## Painel Administrativo

Acesso em `/admin`. Protegido por cookie JWT (`ecomundi_session`).  
Layout: sidebar fixa + header com título da página + área de conteúdo.

### Dashboard (`/admin`)

Cards de estatísticas em tempo real:

| Card | Dado exibido |
|---|---|
| Mensagens não lidas | Contatos não lidos / total |
| Inscritos na newsletter | Ativos / total |
| Notícias publicadas | Publicadas / rascunhos |
| Usuários ativos | Ativos / total |
| E-books ativos | Ativos / total downloads |
| Diagnósticos realizados | Total / convites pendentes |

Painéis: últimas mensagens (6) + últimas notícias (6).  
Ações rápidas: Nova notícia, Ver mensagens, Newsletter, Usuários, Novo e-book, Diagnóstico.

### Contatos (`/admin/contatos`)

- Lista todas as submissões do formulário de contato
- Marcação de lido/não lido (badge laranja para não lidos)
- Exclusão individual com confirmação inline
- Campos exibidos: nome, empresa, e-mail, telefone, mensagem, data

### Newsletter (`/admin/newsletter`)

- Lista todos os inscritos (ativos e inativos)
- Exclusão de inscritos
- Inscrições chegam via formulário da home ou via checkbox no download de e-book

### Notícias (`/admin/noticias`)

- Listagem com status (publicado/rascunho), data, imagem
- **Ações por linha:** editar, excluir, enviar newsletter (ícone verde se disponível)
- **Seleção em lote:** publicar, mover para rascunho, excluir, enviar newsletter (só 1 selecionado, publicado e não enviado)
- Confirmação inline antes de enviar newsletter

**Nova/Editar notícia:**
- Título, resumo, conteúdo (editor Tiptap com toolbar completa)
- Upload de imagem de capa (preview + armazenada como BLOB)
- Toggle publicado/rascunho
- Seção "Distribuição de Newsletter": envia para todos os inscritos ativos em lotes de 8; registra `newsletter_enviado_em` para evitar reenvio

**Editor Tiptap (toolbar):** Desfazer/Refazer · H1/H2/H3 · Negrito · Itálico · Sublinhado · Tachado · Alinhar L/C/R · Lista com marcadores · Lista numerada · Citação · Linha horizontal · Inserir/remover link

### E-books (`/admin/ebooks`)

- Listagem com título, arquivo, tamanho, status (ativo/inativo), total de downloads
- Toggle ativo/inativo inline
- Exclusão com confirmação

**Novo/Editar e-book:**
- Título, descrição
- Upload de PDF (via `FormData`, armazenado como LONGBLOB)
- Upload de capa (base64, armazenado como MEDIUMBLOB)
- Toggle ativo

**Página de edição — Downloads:** tabela com nome, e-mail, se inscreveu na newsletter, data/hora do download.

### Diagnóstico

#### Resultados (`/admin/diagnostico`)

- Filtros: formulário, busca (nome/e-mail/empresa/CNPJ), classificação
- Paginação (10 por página)
- Gráficos (Recharts):
  - Pizza: distribuição por classificação
  - Barras horizontais: média por categoria
  - Linha: diagnósticos por mês
- Ações por resultado: ver detalhe, desbloquear/bloquear reenvio, excluir

**Detalhe do resultado (`/admin/diagnostico/resultados/[id]`):**
- Dados de perfil da empresa
- Pontuação geral e por categoria (barras de progresso)
- Respostas individuais por pergunta
- Botão de desbloqueio para permitir novo envio

#### Formulários (`/admin/diagnostico/formularios`)

- CRUD de formulários de diagnóstico
- Apenas um formulário pode estar ativo por vez (botão "Ativar")
- Link para gerenciar perguntas e perfil de empresa de cada formulário

**Perguntas (`/admin/diagnostico/formularios/[id]/perguntas`):**
- Gerenciamento de categorias (criar, editar, reordenar, excluir)
- Gerenciamento de perguntas por categoria (criar, editar, reordenar)
- Cada pergunta tem 5 alternativas com pontuação 0–4
- Busca de categorias/perguntas existentes em outros formulários para reuso
- Exclusão de pergunta com respostas → desativa em vez de excluir (preserva histórico)

**Perfil da Empresa (`/admin/diagnostico/formularios/[id]/perfil`):**
- Editor de campos dinâmicos exibidos no Passo 2 do formulário público
- Tipos de campo: `text`, `number`, `boolean` (botões SIM/NÃO), `select` (grid de opções)
- `telefone` é campo fixo presente em todos os formulários
- Pode carregar campos de outros formulários como template

#### Convites (`/admin/diagnostico/convites`)

- Lista de convites enviados com status (pendente/concluído)
- Criar convite: e-mail, nome da empresa, nome do contato, mensagem personalizada
- Convite gera token UUID único e envia e-mail com link personalizado
- Botão de reenvio para convites pendentes

### Usuários (`/admin/usuarios`)

- CRUD de usuários do painel administrativo
- Campos: nome, e-mail, senha (bcrypt)
- Não é possível excluir o próprio usuário logado

---

## Módulo Diagnóstico — Detalhes

### Fluxo público (5 etapas)

```
intro → dados → identificacao → perguntas (1 categoria por vez) → resultado
```

| Etapa | Campos |
|---|---|
| intro | Apresentação do diagnóstico + botão iniciar |
| dados | Nome, e-mail + verificação hCaptcha |
| identificacao | Razão social, CNPJ, telefone + campos_perfil dinâmicos do formulário ativo |
| perguntas | Uma categoria por vez; cada pergunta com 5 alternativas (rádio) |
| resultado | Classificação, percentual, pontuação por categoria |

### Trava de reenvio

- Ao iniciar (`dados`), chama `GET /api/diagnostico/verificar?email=...&cnpj=...&formulario_id=...`
- Se já existe resultado com `desbloqueado = 0` para aquele e-mail **ou** CNPJ → bloqueia com mensagem orientando a entrar em contato
- O endpoint `POST /api/diagnostico/submeter` repete a verificação server-side (retorna 409 se bloqueado)

### Desbloqueio admin

- `PATCH /api/admin/diagnostico/resultados/[id]` com `{ desbloqueado: 1 }` libera novo envio sem apagar o histórico
- Pode ser revertido com `{ desbloqueado: 0 }`

### Sistema de convites

- Token UUID único gerado e salvo em `diagnostico_convites`
- Link: `/diagnostico?token=<uuid>`
- Ao acessar, busca `GET /api/diagnostico/convite/[token]` → pré-preenche nome, empresa e e-mail
- Token muda de `pendente` para `concluido` na submissão
- Reuso de token retorna HTTP 410

### Pontuação e classificação

- Cada questão tem 5 alternativas com pontuações 0, 1, 2, 3, 4
- Pontuação máxima = número de perguntas × 4
- Percentual = (pontuação_total / pontuacao_maxima) × 100

| Percentual | Classificação |
|---|---|
| < 25% | Crítico |
| 25% – 49% | Vulnerável |
| 50% – 74% | Em Desenvolvimento |
| ≥ 75% | Conformidade Adequada |

- Pontuação por categoria salva em `diagnostico_scores_categoria`
- E-mail com resultado enviado automaticamente ao usuário após submissão

---

## Módulo E-books — Detalhes

### Fluxo de download

1. Usuário acessa `/ebooks` e clica em "Baixar grátis"
2. Modal abre com campos: nome, e-mail, checkbox newsletter, hCaptcha
3. Submit → `POST /api/ebook-download`
4. API valida hCaptcha + formato e MX do e-mail
5. Se e-mail já baixou este e-book → permite re-download sem criar registro duplicado
6. Se checkbox newsletter marcado e e-mail é novo → insere em `newsletter` + envia e-mail de boas-vindas
7. Se checkbox newsletter **desmarcado** e e-mail já está ativo na newsletter → inativa o cadastro
8. Retorna sucesso → `window.open('/api/ebooks/[id]/arquivo', '_blank')` inicia o download

### Deduplicação

- Checagem por `(ebook_id, email)` em `ebook_downloads` antes de inserir
- Newsletter: verifica `ativo` antes de inserir ou atualizar

---

## API Routes

### Públicas

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/contact` | Salva contato no DB, envia e-mail ao admin e confirmação ao remetente |
| GET | `/api/newsletter` | (interno) |
| POST | `/api/newsletter` | Inscreve e-mail na newsletter; valida MX; envia e-mail de boas-vindas |
| POST | `/api/newsletter/cancelar` | Inativa inscrição via token JWT |
| GET | `/api/noticias` | Lista notícias publicadas |
| GET | `/api/noticias/[slug]` | Retorna notícia por slug |
| GET | `/api/noticias/[slug]/imagem` | Serve imagem da notícia (BLOB) |
| GET | `/api/diagnostico/perguntas` | Lista perguntas ativas do formulário ativo |
| GET | `/api/diagnostico/verificar` | Verifica se e-mail/CNPJ já tem resultado bloqueado |
| POST | `/api/diagnostico/submeter` | Submete respostas, calcula pontuação, salva resultado, envia e-mails |
| GET | `/api/diagnostico/convite/[token]` | Valida token de convite e retorna dados de pré-preenchimento |
| GET | `/api/ebooks` | Lista e-books ativos (sem arquivos) |
| GET | `/api/ebooks/[id]/capa` | Serve imagem de capa (BLOB) |
| GET | `/api/ebooks/[id]/arquivo` | Serve PDF com `Content-Disposition: attachment` |
| POST | `/api/ebook-download` | Registra download, inscreve/inativa newsletter, valida hCaptcha + MX |

### Admin — Autenticação

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/admin/auth/login` | Autentica usuário; seed do primeiro admin se DB vazio; define cookie JWT |
| POST | `/api/admin/auth/logout` | Remove cookie de sessão |
| GET | `/api/admin/auth/me` | Retorna dados do usuário logado |

### Admin — Conteúdo

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/dashboard` | Stats agregados (contatos, newsletter, notícias, usuários, e-books, diagnóstico) |
| GET | `/api/admin/contatos` | Lista contatos |
| DELETE | `/api/admin/contatos/[id]` | Exclui contato |
| DELETE | `/api/admin/newsletter/[id]` | Remove inscrito |
| GET/POST | `/api/admin/noticias` | Lista / cria notícia |
| GET/PUT/DELETE | `/api/admin/noticias/[id]` | Lê / atualiza / exclui notícia |
| GET/POST | `/api/admin/noticias/[id]/enviar-newsletter` | Preview / envia newsletter (lotes de 8) |
| GET/POST | `/api/admin/usuarios` | Lista / cria usuário admin |
| PUT/DELETE | `/api/admin/usuarios/[id]` | Atualiza / exclui usuário admin |
| GET/POST | `/api/admin/ebooks` | Lista (com contagem de downloads) / cria e-book (FormData) |
| GET/PUT/DELETE | `/api/admin/ebooks/[id]` | Lê / atualiza (partial) / exclui e-book |
| GET | `/api/admin/ebooks/[id]/downloads` | Lista downloads de um e-book |

### Admin — Diagnóstico

| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/admin/diagnostico/formularios` | Lista / cria formulário |
| GET/PUT/DELETE | `/api/admin/diagnostico/formularios/[id]` | Lê / atualiza (partial) / exclui formulário |
| PUT | `/api/admin/diagnostico/formularios/[id]/ativar` | Ativa formulário (desativa todos os outros) |
| PUT | `/api/admin/diagnostico/formularios/[id]/inativar` | Inativa formulário |
| GET/POST | `/api/admin/diagnostico/categorias` | Lista por formulário / cria; `?all=true` retorna de todos os formulários |
| PUT/DELETE | `/api/admin/diagnostico/categorias/[id]` | Atualiza / exclui categoria |
| GET/POST | `/api/admin/diagnostico/perguntas` | Lista por categoria / cria; `?all=true` retorna de outras categorias |
| GET/PUT/DELETE | `/api/admin/diagnostico/perguntas/[id]` | Lê / atualiza / desativa ou exclui pergunta |
| GET | `/api/admin/diagnostico/resultados` | Lista resultados paginados com filtros |
| GET/PATCH/DELETE | `/api/admin/diagnostico/resultados/[id]` | Detalhe / toggle `desbloqueado` / exclui |
| GET | `/api/admin/diagnostico/stats` | Stats para os gráficos do dashboard de diagnóstico |
| GET/POST | `/api/admin/diagnostico/convites` | Lista / cria convite (gera UUID, envia e-mail) |
| GET | `/api/admin/diagnostico/convites/[id]` | Detalhe do convite |
| POST | `/api/admin/diagnostico/convites/[id]/reenviar` | Reenvia e-mail do convite |

---

## Banco de Dados

MySQL 8. Pool de conexões singleton em `lib/db.ts`.

### Tabelas principais

#### `usuarios`
Usuários do painel administrativo.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| nome | VARCHAR(150) | Nome completo |
| email | VARCHAR(254) UNIQUE | E-mail de acesso |
| senha | VARCHAR(255) | Hash bcrypt |
| ativo | TINYINT(1) | 1 = ativo |
| criado_em | DATETIME | |

#### `contatos`
Submissões do formulário de contato.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| nome | VARCHAR(150) | |
| empresa | VARCHAR(150) | Opcional |
| email | VARCHAR(254) | |
| telefone | VARCHAR(30) | Opcional |
| mensagem | TEXT | |
| lido | TINYINT(1) | 0 = não lido |
| criado_em | DATETIME | |

#### `newsletter`
Inscritos na newsletter.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| email | VARCHAR(254) UNIQUE | |
| ativo | TINYINT(1) | 1 = ativo |
| criado_em | DATETIME | |

#### `noticias`
Artigos do blog.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| titulo | VARCHAR(255) | |
| slug | VARCHAR(255) UNIQUE | URL amigável |
| resumo | TEXT | Opcional |
| conteudo | LONGTEXT | HTML gerado pelo Tiptap |
| imagem | MEDIUMBLOB | Capa (redimensionada com Jimp) |
| publicado | TINYINT(1) | 0 = rascunho |
| newsletter_enviado_em | DATETIME | NULL = não enviado |
| criado_em | DATETIME | |
| atualizado_em | DATETIME | |

#### `ebooks`
E-books disponíveis para download.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| titulo | VARCHAR(255) | |
| descricao | TEXT | |
| arquivo | LONGBLOB | PDF |
| arquivo_nome | VARCHAR(255) | Nome original do arquivo |
| arquivo_tamanho | INT UNSIGNED | Tamanho em bytes |
| imagem_capa | MEDIUMBLOB | Capa |
| ativo | TINYINT(1) | 1 = visível no site |
| criado_em | DATETIME | |
| atualizado_em | DATETIME | |

#### `ebook_downloads`
Registro de downloads (captura de lead).

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| ebook_id | INT UNSIGNED FK | Referência a `ebooks.id` |
| nome | VARCHAR(150) | |
| email | VARCHAR(254) | |
| inscrito_newsletter | TINYINT(1) | 1 = aceitou receber newsletter |
| criado_em | DATETIME | |

### Tabelas do Módulo Diagnóstico

#### `diagnostico_formularios`
Formulários de diagnóstico (apenas 1 pode estar ativo).

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| nome | VARCHAR(150) | |
| descricao | TEXT | |
| campos_perfil | JSON | Array de campos dinâmicos do Passo 2 |
| ativo | TINYINT(1) | Apenas 1 ativo por vez |
| criado_em | DATETIME | |

#### `diagnostico_categorias`
Categorias de avaliação de cada formulário.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| formulario_id | INT UNSIGNED FK | |
| nome | VARCHAR(150) | |
| descricao | TEXT | |
| ordem | SMALLINT UNSIGNED | Ordem de exibição |
| ativo | TINYINT(1) | |
| criado_em | DATETIME | |

#### `diagnostico_perguntas`
Perguntas por categoria.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| categoria_id | INT UNSIGNED FK | |
| texto | TEXT | Enunciado da pergunta |
| ordem | SMALLINT UNSIGNED | |
| ativo | TINYINT(1) | 0 se desativada por ter respostas |
| criado_em | DATETIME | |

#### `diagnostico_alternativas`
Alternativas de cada pergunta (sempre 5, pontuação 0–4).

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| pergunta_id | INT UNSIGNED FK | |
| texto | TEXT | |
| pontuacao | TINYINT UNSIGNED | 0 a 4 |
| ordem | TINYINT UNSIGNED | |

#### `diagnostico_resultados`
Resultado de cada diagnóstico submetido.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| formulario_id | INT UNSIGNED FK | |
| nome | VARCHAR(150) | |
| email | VARCHAR(254) | |
| telefone | VARCHAR(30) | |
| razao_social | VARCHAR(250) | |
| cnpj | VARCHAR(20) | |
| dados_perfil | JSON | Respostas dos campos_perfil |
| pontuacao_total | SMALLINT UNSIGNED | |
| pontuacao_maxima | SMALLINT UNSIGNED | |
| percentual | DECIMAL(5,2) | |
| classificacao | ENUM | Crítico / Vulnerável / Em Desenvolvimento / Conformidade Adequada |
| desbloqueado | TINYINT(1) | 0 = bloqueado para reenvio |
| email_enviado | TINYINT(1) | 1 = e-mail de resultado enviado |
| criado_em | DATETIME | |

#### `diagnostico_respostas`
Resposta individual por pergunta.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| resultado_id | INT UNSIGNED FK | |
| pergunta_id | INT UNSIGNED FK | |
| alternativa_id | INT UNSIGNED FK | |
| pontuacao | TINYINT UNSIGNED | Pontuação da alternativa escolhida |

#### `diagnostico_scores_categoria`
Pontuação agregada por categoria em cada resultado.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| resultado_id | INT UNSIGNED FK | |
| categoria_id | INT UNSIGNED FK | |
| pontuacao | SMALLINT UNSIGNED | |
| pontuacao_max | SMALLINT UNSIGNED | |
| percentual | DECIMAL(5,2) | |

#### `diagnostico_convites`
Convites enviados por e-mail para o diagnóstico.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | INT UNSIGNED PK | |
| formulario_id | INT UNSIGNED FK | |
| email | VARCHAR(254) | Destinatário |
| nome_empresa | VARCHAR(250) | Pré-preenchimento |
| nome_contato | VARCHAR(150) | Pré-preenchimento |
| mensagem | TEXT | Mensagem personalizada no e-mail |
| token | VARCHAR(64) UNIQUE | UUID gerado |
| status | ENUM | `pendente` ou `concluido` |
| resultado_id | INT UNSIGNED FK NULL | Preenchido ao concluir |
| criado_em | DATETIME | |
| concluido_em | DATETIME NULL | |

---

## Comandos

```bash
pnpm dev          # Inicia servidor de desenvolvimento
pnpm build        # Build de produção (erros TypeScript ignorados)
pnpm start        # Inicia servidor de produção
pnpm lint         # ESLint
pnpm add <pkg>    # Instala pacote
```

### Deploy

O projeto é hospedado com Node.js standalone. Após cada atualização:

```bash
git pull
pnpm install
pnpm build
# reiniciar o processo Node (pm2 restart / systemctl restart)
```
