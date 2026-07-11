-- Migração: adiciona suporte a desbloqueio de diagnóstico por empresa
-- Executar uma única vez no banco MySQL configurado em .env.local

ALTER TABLE diagnostico_resultados
  ADD COLUMN IF NOT EXISTS desbloqueado TINYINT(1) NOT NULL DEFAULT 0,
  ADD INDEX IF NOT EXISTS idx_desbloqueado (desbloqueado);
