-- Migração: campos de perfil configuráveis por formulário + telefone no resultado

ALTER TABLE diagnostico_formularios
  ADD COLUMN campos_perfil JSON NULL AFTER descricao;

ALTER TABLE diagnostico_resultados
  ADD COLUMN telefone VARCHAR(30) NULL AFTER email,
  ADD COLUMN dados_perfil JSON NULL AFTER cnpj;

-- Popula o formulário existente com os campos de perfil hoteleiro
UPDATE diagnostico_formularios
SET campos_perfil = '[
  {"id":"num_hospedes","label":"Número aproximado de hóspedes/mês","tipo":"text","obrigatorio":false},
  {"id":"tem_restaurante","label":"Possui restaurante próprio na mesma instalação?","tipo":"select","opcoes":["SIM","NÃO","TERCEIRIZADO","POSSUI MAS EM OUTRO LOCAL"],"obrigatorio":true},
  {"id":"tem_eventos","label":"Possui local para eventos, feiras, palestras?","tipo":"boolean","obrigatorio":true},
  {"id":"tem_piscina","label":"Possui piscina?","tipo":"boolean","obrigatorio":true},
  {"id":"tem_caldeira","label":"Possui caldeira com aquecimento a gás ou derivado florestal?","tipo":"boolean","obrigatorio":true},
  {"id":"tem_animais","label":"Possui atividades com animais silvestres, domésticos ou domesticados?","tipo":"boolean","obrigatorio":true},
  {"id":"tem_ambulatorio","label":"Possui ambulatório ou enfermaria?","tipo":"boolean","obrigatorio":true},
  {"id":"tem_refeitorio","label":"Possui refeitório para os colaboradores?","tipo":"boolean","obrigatorio":true}
]'
WHERE ativo = 1;
