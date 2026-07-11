-- =============================================================
-- ECO MUNDI — Diagnóstico Preliminar de Conformidade Regulatória
-- Seed: tabelas + formulário Hotelaria (Diagnóstico Preliminar)
-- Executar no banco MySQL configurado em .env.local
-- =============================================================

-- TABELAS

CREATE TABLE IF NOT EXISTS diagnostico_formularios (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome      VARCHAR(150) NOT NULL,
  descricao TEXT,
  ativo     TINYINT(1) NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ativo (ativo)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diagnostico_categorias (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  formulario_id INT UNSIGNED NOT NULL,
  nome          VARCHAR(150) NOT NULL,
  descricao     TEXT,
  ordem         SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  ativo         TINYINT(1) NOT NULL DEFAULT 1,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (formulario_id) REFERENCES diagnostico_formularios(id) ON DELETE CASCADE,
  INDEX idx_formulario (formulario_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diagnostico_perguntas (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT UNSIGNED NOT NULL,
  texto        TEXT NOT NULL,
  ordem        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  ativo        TINYINT(1) NOT NULL DEFAULT 1,
  criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES diagnostico_categorias(id) ON DELETE CASCADE,
  INDEX idx_categoria (categoria_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diagnostico_alternativas (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pergunta_id INT UNSIGNED NOT NULL,
  texto       TEXT NOT NULL,
  pontuacao   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  ordem       TINYINT UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (pergunta_id) REFERENCES diagnostico_perguntas(id) ON DELETE CASCADE,
  INDEX idx_pergunta (pergunta_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diagnostico_resultados (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  formulario_id    INT UNSIGNED NOT NULL,
  nome             VARCHAR(150) NOT NULL,
  email            VARCHAR(254) NOT NULL,
  razao_social     VARCHAR(250),
  cnpj             VARCHAR(20),
  num_hospedes     VARCHAR(50),
  tem_restaurante  VARCHAR(50),
  tem_eventos      TINYINT(1),
  tem_piscina      TINYINT(1),
  tem_caldeira     TINYINT(1),
  tem_animais      TINYINT(1),
  tem_ambulatorio  TINYINT(1),
  tem_refeitorio   TINYINT(1),
  pontuacao_total  SMALLINT UNSIGNED NOT NULL,
  pontuacao_maxima SMALLINT UNSIGNED NOT NULL,
  percentual       DECIMAL(5,2) NOT NULL,
  classificacao    ENUM('Crítico','Vulnerável','Em Desenvolvimento','Conformidade Adequada') NOT NULL,
  email_enviado    TINYINT(1) NOT NULL DEFAULT 0,
  criado_em        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (formulario_id) REFERENCES diagnostico_formularios(id),
  INDEX idx_formulario (formulario_id),
  INDEX idx_criado_em (criado_em),
  INDEX idx_classificacao (classificacao)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diagnostico_respostas (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  resultado_id   INT UNSIGNED NOT NULL,
  pergunta_id    INT UNSIGNED NOT NULL,
  alternativa_id INT UNSIGNED NOT NULL,
  pontuacao      TINYINT UNSIGNED NOT NULL,
  FOREIGN KEY (resultado_id)   REFERENCES diagnostico_resultados(id) ON DELETE CASCADE,
  FOREIGN KEY (pergunta_id)    REFERENCES diagnostico_perguntas(id),
  FOREIGN KEY (alternativa_id) REFERENCES diagnostico_alternativas(id),
  INDEX idx_resultado (resultado_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diagnostico_scores_categoria (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  resultado_id  INT UNSIGNED NOT NULL,
  categoria_id  INT UNSIGNED NOT NULL,
  pontuacao     SMALLINT UNSIGNED NOT NULL,
  pontuacao_max SMALLINT UNSIGNED NOT NULL,
  percentual    DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (resultado_id) REFERENCES diagnostico_resultados(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES diagnostico_categorias(id),
  UNIQUE KEY uk_resultado_categoria (resultado_id, categoria_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =============================================================
-- SEED: Formulário Hotelaria
-- =============================================================

INSERT INTO diagnostico_formularios (nome, descricao, ativo) VALUES
('Diagnóstico Hotelaria', 'Diagnóstico Preliminar de Conformidade Regulatória e Sustentabilidade Corporativa para o setor hoteleiro.', 1);

SET @F = LAST_INSERT_ID();

-- Categorias
INSERT INTO diagnostico_categorias (formulario_id, nome, descricao, ordem) VALUES
(@F, 'Governança e Compliance Regulatório', 'Avalia a estrutura de responsabilidade, controle documental e acompanhamento legislativo.', 1),
(@F, 'Licenciamento e Autorizações', 'Verifica a situação dos alvarás, licenças ambientais, CLCB e demais autorizações obrigatórias.', 2),
(@F, 'Gestão de Resíduos', 'Avalia o PGRS, rastreabilidade, destinação e treinamento das equipes.', 3),
(@F, 'Sustentabilidade e Eficiência Operacional', 'Monitora política de compras sustentáveis, consumo de recursos e reuso de água.', 4),
(@F, 'Gestão Estratégica de Riscos', 'Examina matriz de riscos, planos de emergência e diagnósticos internos.', 5),
(@F, 'Critérios Reputacionais e Diferenciação Competitiva', 'Avalia greenwashing, avaliações externas, política de sustentabilidade e comunicação.', 6);

-- Captura os IDs das categorias recém-criadas
SET @CAT1 = (SELECT id FROM diagnostico_categorias WHERE formulario_id = @F AND ordem = 1);
SET @CAT2 = (SELECT id FROM diagnostico_categorias WHERE formulario_id = @F AND ordem = 2);
SET @CAT3 = (SELECT id FROM diagnostico_categorias WHERE formulario_id = @F AND ordem = 3);
SET @CAT4 = (SELECT id FROM diagnostico_categorias WHERE formulario_id = @F AND ordem = 4);
SET @CAT5 = (SELECT id FROM diagnostico_categorias WHERE formulario_id = @F AND ordem = 5);
SET @CAT6 = (SELECT id FROM diagnostico_categorias WHERE formulario_id = @F AND ordem = 6);

-- ---------------------------------------------------------------
-- Categoria 1: Governança e Compliance Regulatório (5 perguntas)
-- ---------------------------------------------------------------

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT1, 'A empresa possui um responsável pelo cumprimento da conformidade regulatória?', 1);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não possui responsável definido.', 0, 1),
(@P, 'Possui, mas realiza um trabalho parcial.', 1, 2),
(@P, 'Possui, mas não teve um treinamento e atualização.', 2, 3),
(@P, 'Possui, mas não está integrado à gestão.', 3, 4),
(@P, 'Possui, está atualizado e integrado à gestão.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT1, 'Existe um controle de documentos legais obrigatórios?', 2);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não existe.', 0, 1),
(@P, 'Existe mas é parcial e sem atualização.', 1, 2),
(@P, 'Existe mas é parcial mas com atualização.', 2, 3),
(@P, 'Existe e contempla todos os documentos obrigatórios mas não há uma atualização.', 3, 4),
(@P, 'Existe, contempla todos os documentos obrigatórios e está sempre atualizado.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT1, 'A empresa possui um controle do calendário de validade e renovações de licenças, autorizações, alvarás, dentre outros?', 3);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não existe esse controle.', 0, 1),
(@P, 'Esse controle já foi feito mas não houve continuidade.', 1, 2),
(@P, 'Existe esse controle mas ele é parcial e não ocorre atualizações.', 2, 3),
(@P, 'Existe esse controle de todos os documentos mas não é atualizado.', 3, 4),
(@P, 'Existe esse controle de todos os documentos e é atualizado.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT1, 'A empresa dispõe de procedimentos para atendimento e resposta aos órgãos de fiscalização e controle? (Prefeitura, Ministério Público, Vigilância Sanitária, Gestão de Resíduos, etc)', 4);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não temos procedimentos para atendimento aos órgãos de controle e fiscalização.', 0, 1),
(@P, 'Existem esses controles mas são parciais e sem atualização.', 1, 2),
(@P, 'Existem esses controles de toda operação mas sem atualização.', 2, 3),
(@P, 'Existem esses controles de toda operação e são atualizados periodicamente.', 3, 4),
(@P, 'Existem esses controles de toda operação, são atualizados e monitorados pela empresa.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT1, 'Existe um acompanhamento das alterações da legislação e normas aplicáveis ao seu segmento?', 5);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não há esse tipo de acompanhamento quanto as leis e normas aplicáveis ao negócio.', 0, 1),
(@P, 'Já foi feito um levantamento mas não houve continuidade ou atualização.', 1, 2),
(@P, 'Sim, esse acompanhamento é feito somente em relação às leis municipais.', 2, 3),
(@P, 'Sim, esse acompanhamento é feito somente em relação às leis federais e estaduais.', 3, 4),
(@P, 'Sim, esse acompanhamento acompanha às leis e normas (federal, estadual e municipal).', 4, 5);

-- ---------------------------------------------------------------
-- Categoria 2: Licenciamento e Autorizações (8 perguntas)
-- ---------------------------------------------------------------

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT2, 'Possui Alvará de Localização válido expedido pela Prefeitura?', 1);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não possui Alvará de Localização expedido pela Prefeitura.', 0, 1),
(@P, 'Possui Alvará, mas as atividades desenvolvidas foram alteradas.', 1, 2),
(@P, 'Possui Alvará, mas nem todas as atividades estão contempladas.', 2, 3),
(@P, 'Possui Alvará, com todas as atividades adequadas mas está vencido.', 3, 4),
(@P, 'Possui Alvará, com todas as atividades previstas e dentro da validade.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT2, 'A empresa possui licença ambiental vigente?', 2);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não possui licença ambiental.', 0, 1),
(@P, 'Possui licença ambiental mas para outra atividade da mesma empresa.', 1, 2),
(@P, 'Possui licença ambiental para algumas atividades da empresa.', 2, 3),
(@P, 'Possui licença ambiental para todas as atividades da empresa mas está vencida.', 3, 4),
(@P, 'Possui licença ambiental para todas as atividades da empresa e está válida.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT2, 'Todas as condicionantes da licença ambiental estão plenamente atendidas?', 3);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não atende as condicionantes da licença ambiental e está vencida.', 0, 1),
(@P, 'Não atende as condicionantes da licença ambiental mas está válida.', 1, 2),
(@P, 'Sim, atende algumas condicionantes da licença ambiental, mas está vencida.', 2, 3),
(@P, 'Sim, atende algumas condicionantes da licença ambiental e está válida.', 3, 4),
(@P, 'Sim, atende todas as condicionantes da licença ambiental e está válida.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT2, 'O empreendimento dispõe de Certificado de Licenciamento do Corpo de Bombeiros dentro do prazo de validade?', 4);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não dispõe de Certificado de Licenciamento do Corpo de Bombeiros (CLCB).', 0, 1),
(@P, 'Deu entrada no CLCB mas ainda está pendente de decisão.', 1, 2),
(@P, 'Sim, possui mas existem pendências ainda não cumpridas.', 2, 3),
(@P, 'Sim, possui mas vencida.', 3, 4),
(@P, 'Sim, possui e está válida.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT2, 'Caso disponha de restaurante, cantina, lanchonete ou refeitório, todos estão com o Alvará Sanitário expedido pela Vigilância Sanitária?', 5);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não dispõe de restaurante, cantina, lanchonete ou refeitório.', 0, 1),
(@P, 'Sim, dispõe mas não possui Licença Sanitária.', 1, 2),
(@P, 'Sim, dispõe mas a Licença Sanitária não é para todos os espaços existentes no local.', 2, 3),
(@P, 'Sim, dispõe mas a Licença Sanitária está vencida.', 3, 4),
(@P, 'Sim e a Licença Sanitária está em dia.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT2, 'A empresa possui cadastro em dia junto aos órgãos ambientais na esfera federal, estadual e municipal?', 6);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não possui cadastro em nenhum dos órgãos ambientais.', 0, 1),
(@P, 'Sim, possui cadastro mas está vencido.', 1, 2),
(@P, 'Sim, possui cadastro apenas no órgão municipal.', 2, 3),
(@P, 'Sim, possui cadastro apenas no órgão estadual.', 3, 4),
(@P, 'Sim, possui cadastro nos órgãos da esfera federal, estadual e municipal.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT2, 'Se a empresa dispõe de caixa d\'água para consumo humano, os laudos de limpeza e potabilidade estão em dia?', 7);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não possui.', 0, 1),
(@P, 'Sim, possui mas não mantém laudos de limpeza e potabilidade.', 1, 2),
(@P, 'Sim, possui mas mantém somente laudo de limpeza.', 2, 3),
(@P, 'Sim, possui mas mantém somente laudo de potabilidade.', 3, 4),
(@P, 'Sim, possui e mantém laudo de limpeza e potabilidade semestral.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT2, 'Se existe controle de pragas e dedetização dos ambientes, estão em dia?', 8);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não possui.', 0, 1),
(@P, 'Possui apenas de controle de pragas mas não de dedetização de ambientes.', 1, 2),
(@P, 'Possui de controle de pragas e dedetização de ambientes, mas estão vencidos.', 2, 3),
(@P, 'Possui de controle de pragas e dedetização de ambientes mas anual.', 3, 4),
(@P, 'Possui de controle de pragas e dedetização de ambientes trimestral ou semestral.', 4, 5);

-- ---------------------------------------------------------------
-- Categoria 3: Gestão de Resíduos (7 perguntas)
-- ---------------------------------------------------------------

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT3, 'A empresa possui Plano de Gerenciamento de Resíduos Sólidos (PGRS) com anotação de responsabilidade técnica por profissional habilitado?', 1);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não possui PGRS.', 0, 1),
(@P, 'Possui PGRS mas sem um responsável técnico da elaboração do documento.', 1, 2),
(@P, 'Possui PGRS mas com responsável técnico somente pela elaboração.', 2, 3),
(@P, 'Possui PGRS com responsável técnico pela elaboração e implantação.', 3, 4),
(@P, 'Possui PGRS com responsável técnico pela elaboração, implantação e monitoramento.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT3, 'O PGRS é cumprido integralmente?', 2);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não existe um controle do PGRS ou do seu cumprimento.', 0, 1),
(@P, 'O PGRS é executado de forma alternativa e não segue o PGRS.', 1, 2),
(@P, 'O PGRS é cumprido parcialmente e sem controle de um técnico.', 2, 3),
(@P, 'O PGRS é cumprido parcialmente com o controle de um técnico.', 3, 4),
(@P, 'O PGRS é cumprido integralmente e com o acompanhamento de um técnico.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT3, 'Existe registro e rastreabilidade dos resíduos gerados? (o que vai pra onde)', 3);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não existe um registro e controle de rastreabilidade dos resíduos.', 0, 1),
(@P, 'O registro e rastreabilidade de resíduos é feito de vez em quando e sem Responsável Técnico.', 1, 2),
(@P, 'O registro e rastreabilidade de resíduos é feito de forma parcial e sem Responsável Técnico.', 2, 3),
(@P, 'O registro e rastreabilidade dos resíduos é feito integralmente mas sem um RT.', 3, 4),
(@P, 'O registro e rastreabilidade dos resíduos é feito integralmente e com RT.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT3, 'Possui uma empresa responsável pela retirada e transporte dos resíduos?', 4);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não possui uma empresa contratada que faz a retirada e transporte dos resíduos.', 0, 1),
(@P, 'A retirada e o transporte é feito pela coleta pública municipal.', 1, 2),
(@P, 'A empresa contratada retira e transporta os resíduos, sem informar o destino.', 2, 3),
(@P, 'A empresa contratada retira e transporta os resíduos, leva para a associação de recicladores.', 3, 4),
(@P, 'A empresa contratada retira, transporta e comprova a correta destinação dos resíduos.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT3, 'As empresas envolvidas no processo de transporte, destinação e recebimento dos resíduos possuem e apresentaram todas as licenças e autorizações necessárias?', 5);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não temos conhecimento, pois nunca foram apresentados.', 0, 1),
(@P, 'A empresa contratada apresentou apenas os documentos de constituição (CNPJ).', 1, 2),
(@P, 'A empresa contratada apresentou parte dos documentos e as licenças à época.', 2, 3),
(@P, 'A empresa contratada apresentou todos os documentos e as licenças ambientais, atualmente podem estar vencidas.', 3, 4),
(@P, 'A empresa contratada apresentou todos os documentos e licenças, inclusive ambientais, os quais apresentam todas as renovações.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT3, 'Existem documentos de comprovação destinação final de todos os resíduos?', 6);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não são apresentados e nem solicitados.', 0, 1),
(@P, 'Apresentam um documento próprio de controle de volume de retirada, sem indicar o destino.', 1, 2),
(@P, 'Apresentam um documento próprio de controle de volume de retirada, indicando o destino mas sem comprovação.', 2, 3),
(@P, 'Apresentam documento do sistema oficial do governo, com indicação do destino.', 3, 4),
(@P, 'Apresentam documento do sistema oficial do governo e comprovação do recebimento no destino.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT3, 'As equipes internas de manutenção e limpeza são treinadas para proceder corretamente a segregação dos resíduos?', 7);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não há treinamento dessas equipes.', 0, 1),
(@P, 'Sim, mas só há treinamento para a equipe de limpeza.', 1, 2),
(@P, 'Sim, mas só há treinamento para a equipe de manutenção.', 2, 3),
(@P, 'Sim, há treinamento para equipe de manutenção e limpeza, mas somente na contratação.', 3, 4),
(@P, 'Sim, há treinamento semestral para as equipes de manutenção e limpeza.', 4, 5);

-- ---------------------------------------------------------------
-- Categoria 4: Sustentabilidade e Eficiência Operacional (3 perguntas)
-- ---------------------------------------------------------------

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT4, 'A empresa possui uma política de compras e contratações sustentáveis?', 1);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não possui.', 0, 1),
(@P, 'Possui, mas está desatualizado e não é usado para os processos de compras e contratos.', 1, 2),
(@P, 'Possui, mas é usado apenas para os contratos.', 2, 3),
(@P, 'Possui, mas está desatualizado e não é usado para os processos de compras.', 3, 4),
(@P, 'Possui para os processos de compras e contratos, inclusive com atuação frequente.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT4, 'A empresa monitora o consumo de água e energia elétrica?', 2);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não há esse monitoramento.', 0, 1),
(@P, 'Sim, às vezes avalia o consumo de água.', 1, 2),
(@P, 'Sim, às vezes avalia o consumo de energia.', 2, 3),
(@P, 'Sim, às vezes avalia o consumo de água e energia.', 3, 4),
(@P, 'Sim, monitora o consumo de água e energia e busca alternativas de racionalização de uso.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT4, 'A empresa possui algum procedimento de reuso de água?', 3);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não possui.', 0, 1),
(@P, 'Possui, mas utiliza apenas de vez em quando.', 1, 2),
(@P, 'Possui, mas utiliza apenas nas épocas de racionamento.', 2, 3),
(@P, 'Possui, mas utiliza de forma pontual.', 3, 4),
(@P, 'Possui e utiliza de forma permanente.', 4, 5);

-- ---------------------------------------------------------------
-- Categoria 5: Gestão Estratégica de Riscos (4 perguntas)
-- ---------------------------------------------------------------

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT5, 'A empresa dispõe de uma matriz de riscos regulatórios?', 1);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não.', 0, 1),
(@P, 'Dispõe de um controle de riscos regulatório (RR) simplificado, mas sem atualização.', 1, 2),
(@P, 'Dispõe de um controle de riscos (RR) elaborado pela própria empresa e sem atualização.', 2, 3),
(@P, 'Dispõe de um controle de riscos (RR) elaborado por uma consultoria, mas sem atualização.', 3, 4),
(@P, 'Dispõe de uma matriz de riscos (RR) elaborado por uma consultoria e atualizado.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT5, 'Conta com um Plano de Emergência para incidentes ambientais?', 2);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não.', 0, 1),
(@P, 'Sim, a empresa elaborou um PE de incidentes ambientais, mas sem atualização.', 1, 2),
(@P, 'Sim, a empresa elaborou um PE de incidentes ambientais e atualiza periodicamente.', 2, 3),
(@P, 'Sim, uma consultoria foi contratada e elaborou um PE de incidentes ambientais, mas está desatualizado.', 3, 4),
(@P, 'Sim, uma consultoria foi contratada e elaborou um PE de incidentes ambientais e está atualizado.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT5, 'Dispõe de um Plano de Gestão de Crises (incêndio, emergências, situações climáticas extremas, dentre outras)?', 3);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não.', 0, 1),
(@P, 'Sim, elaborado pela própria empresa mas está desatualizado.', 1, 2),
(@P, 'Sim, elaborado pela própria empresa e segue sendo atualizado.', 2, 3),
(@P, 'Sim, foi contratada uma empresa para elaborar, mas está desatualizado.', 3, 4),
(@P, 'Sim, foi contratada uma empresa para elaborar, com atualização contínua.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT5, 'A empresa já realizou ou realiza diagnósticos internos de riscos?', 4);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não.', 0, 1),
(@P, 'Sim, realizou mas com metodologia própria e não foi feito novamente.', 1, 2),
(@P, 'Sim, foi contratada uma empresa para elaborar, mas está desatualizado.', 2, 3),
(@P, 'Sim, foi contratada uma empresa para realizar o diagnóstico, mas está desatualizado.', 3, 4),
(@P, 'Sim, foi contratada uma empresa para realizar o diagnóstico, é atualizado com frequência.', 4, 5);

-- ---------------------------------------------------------------
-- Categoria 6: Critérios Reputacionais e Diferenciação Competitiva (4 perguntas)
-- ---------------------------------------------------------------

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT6, 'A empresa usa propagandas, embalagens ou discursos de cuidado com o meio ambiente, mas acaba não adotando práticas realmente sustentáveis?', 1);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'A empresa não usa esses recursos de propaganda, embalagens ou discursos.', 0, 1),
(@P, 'A empresa usa esses recursos, mas suas práticas não são sustentáveis.', 1, 2),
(@P, 'A empresa usa esses recursos, mas suas práticas quase sempre são sustentáveis.', 2, 3),
(@P, 'A empresa usa esses recursos e acredita que suas práticas são sempre sustentáveis.', 3, 4),
(@P, 'A empresa usa esses recursos e comprova que suas práticas são sempre sustentáveis.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT6, 'Recebe avaliações sobre sustentabilidade?', 2);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não.', 0, 1),
(@P, 'Recebe avaliações de sustentabilidade mas são negativas.', 1, 2),
(@P, 'Recebe avaliações de sustentabilidade e parte delas são negativas.', 2, 3),
(@P, 'Recebe avaliações de sustentabilidade e parte delas são positivas.', 3, 4),
(@P, 'Recebe avaliações de sustentabilidade e todas são positivas.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT6, 'Possui uma Política de Sustentabilidade?', 3);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não.', 0, 1),
(@P, 'Possui, elaborada pela própria empresa, mas sem atualização.', 1, 2),
(@P, 'Possui, elaborada pela própria empresa e com atualização constante.', 2, 3),
(@P, 'Possui, elaborada por empresa de consultoria especializada, mas sem atualização.', 3, 4),
(@P, 'Possui, elaborada por empresa de consultoria especializada e com atualização constante.', 4, 5);

INSERT INTO diagnostico_perguntas (categoria_id, texto, ordem) VALUES (@CAT6, 'Divulga ações em prol ao meio ambiente?', 4);
SET @P = LAST_INSERT_ID();
INSERT INTO diagnostico_alternativas (pergunta_id, texto, pontuacao, ordem) VALUES
(@P, 'Não.', 0, 1),
(@P, 'Sim, mas apenas para a alta gestão.', 1, 2),
(@P, 'Sim, mas apenas internamente para o nível gerencial.', 2, 3),
(@P, 'Sim, para todo o público interno e para os principais parceiros comerciais/estratégicos.', 3, 4),
(@P, 'Sim, para o público interno e externo em geral.', 4, 5);
