-- =============================================================
-- ECO MUNDI — Schema Completo do Banco de Dados
-- Gerado em: Julho 2026
-- Todas as tabelas em ordem de dependência (sem dados)
-- =============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- -------------------------------------------------------------
-- Tabela: usuarios
-- Usuários do painel administrativo
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome      VARCHAR(150) NOT NULL,
  email     VARCHAR(254) NOT NULL,
  senha     VARCHAR(255) NOT NULL,
  ativo     TINYINT(1) NOT NULL DEFAULT 1,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: contatos
-- Submissões do formulário de contato do site
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contatos (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome      VARCHAR(150) NOT NULL,
  empresa   VARCHAR(150),
  email     VARCHAR(254) NOT NULL,
  telefone  VARCHAR(30),
  mensagem  TEXT NOT NULL,
  lido      TINYINT(1) NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lido (lido),
  INDEX idx_criado_em (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: newsletter
-- Inscritos na newsletter
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email     VARCHAR(254) NOT NULL,
  ativo     TINYINT(1) NOT NULL DEFAULT 1,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email),
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: noticias
-- Artigos do blog (conteúdo HTML gerado pelo editor Tiptap)
-- Imagem armazenada como BLOB (redimensionada com Jimp)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS noticias (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo               VARCHAR(255) NOT NULL,
  slug                 VARCHAR(255) NOT NULL,
  resumo               TEXT,
  conteudo             LONGTEXT NOT NULL,
  imagem               MEDIUMBLOB,
  publicado            TINYINT(1) NOT NULL DEFAULT 0,
  newsletter_enviado_em DATETIME DEFAULT NULL,
  criado_em            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_slug (slug),
  INDEX idx_publicado (publicado),
  INDEX idx_criado_em (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: ebooks
-- E-books disponíveis para download (PDF + capa como BLOB)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ebooks (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo          VARCHAR(255) NOT NULL,
  descricao       TEXT,
  arquivo         LONGBLOB,
  arquivo_nome    VARCHAR(255),
  arquivo_tamanho INT UNSIGNED,
  imagem_capa     MEDIUMBLOB,
  ativo           TINYINT(1) NOT NULL DEFAULT 1,
  criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: ebook_downloads
-- Registro de downloads (captura de lead)
-- Unicidade por (ebook_id, email) garantida pela aplicação
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ebook_downloads (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ebook_id             INT UNSIGNED NOT NULL,
  nome                 VARCHAR(150) NOT NULL,
  email                VARCHAR(254) NOT NULL,
  inscrito_newsletter  TINYINT(1) DEFAULT 0,
  criado_em            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ebook (ebook_id),
  INDEX idx_email (email),
  FOREIGN KEY (ebook_id) REFERENCES ebooks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- MÓDULO DIAGNÓSTICO
-- =============================================================

-- -------------------------------------------------------------
-- Tabela: diagnostico_formularios
-- Formulários de diagnóstico (apenas 1 pode estar ativo)
-- campos_perfil: JSON array de campos dinâmicos do Passo 2
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnostico_formularios (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(150) NOT NULL,
  descricao    TEXT,
  campos_perfil JSON,
  ativo        TINYINT(1) NOT NULL DEFAULT 0,
  criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: diagnostico_categorias
-- Categorias de avaliação de cada formulário
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnostico_categorias (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  formulario_id INT UNSIGNED NOT NULL,
  nome          VARCHAR(150) NOT NULL,
  descricao     TEXT,
  ordem         SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  ativo         TINYINT(1) NOT NULL DEFAULT 1,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_formulario (formulario_id),
  FOREIGN KEY (formulario_id) REFERENCES diagnostico_formularios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: diagnostico_perguntas
-- Perguntas por categoria (desativadas se tiverem respostas)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnostico_perguntas (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT UNSIGNED NOT NULL,
  texto        TEXT NOT NULL,
  ordem        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  ativo        TINYINT(1) NOT NULL DEFAULT 1,
  criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categoria (categoria_id),
  FOREIGN KEY (categoria_id) REFERENCES diagnostico_categorias(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: diagnostico_alternativas
-- 5 alternativas por pergunta, pontuação 0–4
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnostico_alternativas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pergunta_id INT UNSIGNED NOT NULL,
  texto       TEXT NOT NULL,
  pontuacao   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  ordem       TINYINT UNSIGNED NOT NULL DEFAULT 0,
  INDEX idx_pergunta (pergunta_id),
  FOREIGN KEY (pergunta_id) REFERENCES diagnostico_perguntas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: diagnostico_resultados
-- Resultado de cada diagnóstico submetido
-- desbloqueado: 0 = bloqueado para reenvio (padrão)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnostico_resultados (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  formulario_id    INT UNSIGNED NOT NULL,
  nome             VARCHAR(150) NOT NULL,
  email            VARCHAR(254) NOT NULL,
  telefone         VARCHAR(30),
  razao_social     VARCHAR(250),
  cnpj             VARCHAR(20),
  dados_perfil     JSON,
  pontuacao_total  SMALLINT UNSIGNED NOT NULL,
  pontuacao_maxima SMALLINT UNSIGNED NOT NULL,
  percentual       DECIMAL(5,2) NOT NULL,
  classificacao    ENUM('Crítico','Vulnerável','Em Desenvolvimento','Conformidade Adequada') NOT NULL,
  desbloqueado     TINYINT(1) NOT NULL DEFAULT 0,
  email_enviado    TINYINT(1) NOT NULL DEFAULT 0,
  criado_em        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_formulario (formulario_id),
  INDEX idx_criado_em (criado_em),
  INDEX idx_classificacao (classificacao),
  INDEX idx_desbloqueado (desbloqueado),
  FOREIGN KEY (formulario_id) REFERENCES diagnostico_formularios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: diagnostico_respostas
-- Resposta individual por pergunta em cada resultado
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnostico_respostas (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  resultado_id   INT UNSIGNED NOT NULL,
  pergunta_id    INT UNSIGNED NOT NULL,
  alternativa_id INT UNSIGNED NOT NULL,
  pontuacao      TINYINT UNSIGNED NOT NULL,
  INDEX idx_resultado (resultado_id),
  FOREIGN KEY (resultado_id)   REFERENCES diagnostico_resultados(id) ON DELETE CASCADE,
  FOREIGN KEY (pergunta_id)    REFERENCES diagnostico_perguntas(id),
  FOREIGN KEY (alternativa_id) REFERENCES diagnostico_alternativas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: diagnostico_scores_categoria
-- Pontuação agregada por categoria em cada resultado
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnostico_scores_categoria (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  resultado_id  INT UNSIGNED NOT NULL,
  categoria_id  INT UNSIGNED NOT NULL,
  pontuacao     SMALLINT UNSIGNED NOT NULL,
  pontuacao_max SMALLINT UNSIGNED NOT NULL,
  percentual    DECIMAL(5,2) NOT NULL,
  UNIQUE KEY uk_resultado_categoria (resultado_id, categoria_id),
  FOREIGN KEY (resultado_id) REFERENCES diagnostico_resultados(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES diagnostico_categorias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- Tabela: diagnostico_convites
-- Convites enviados por e-mail com token UUID único
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnostico_convites (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  formulario_id INT UNSIGNED NOT NULL,
  email         VARCHAR(254) NOT NULL,
  nome_empresa  VARCHAR(250),
  nome_contato  VARCHAR(150),
  mensagem      TEXT,
  token         VARCHAR(64) NOT NULL,
  status        ENUM('pendente','concluido') NOT NULL DEFAULT 'pendente',
  resultado_id  INT UNSIGNED NULL,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  concluido_em  DATETIME NULL,
  UNIQUE KEY uk_token (token),
  INDEX idx_formulario (formulario_id),
  INDEX idx_status (status),
  FOREIGN KEY (formulario_id) REFERENCES diagnostico_formularios(id) ON DELETE CASCADE,
  FOREIGN KEY (resultado_id)  REFERENCES diagnostico_resultados(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
