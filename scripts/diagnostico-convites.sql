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
