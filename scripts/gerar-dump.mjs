// Script para gerar dump completo do banco (schema + dados)
// Uso: node scripts/gerar-dump.mjs
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Carrega variáveis do .env.local manualmente
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env.local");
const env = Object.fromEntries(
  fs.readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const conn = await mysql.createConnection({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  multipleStatements: true,
});

const output = [];
const ts = new Date().toISOString();
output.push(`-- ECO MUNDI — Dump completo gerado em ${ts}`);
output.push(`-- Banco: ${env.DB_NAME} @ ${env.DB_HOST}`);
output.push("");
output.push("SET NAMES utf8mb4;");
output.push("SET FOREIGN_KEY_CHECKS = 0;");
output.push("");

// Tabelas na ordem correta de dependência
const TABLES = [
  "usuarios",
  "contatos",
  "newsletter",
  "noticias",
  "ebooks",
  "ebook_downloads",
  "diagnostico_formularios",
  "diagnostico_categorias",
  "diagnostico_perguntas",
  "diagnostico_alternativas",
  "diagnostico_resultados",
  "diagnostico_respostas",
  "diagnostico_scores_categoria",
  "diagnostico_convites",
];

for (const table of TABLES) {
  console.log(`Exportando ${table}...`);

  // CREATE TABLE
  const [[createRow]] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
  const createSql = createRow["Create Table"];
  output.push(`-- -----------------------------------------------------------`);
  output.push(`-- Tabela: ${table}`);
  output.push(`-- -----------------------------------------------------------`);
  output.push(`DROP TABLE IF EXISTS \`${table}\`;`);
  output.push(createSql + ";");
  output.push("");

  // Dados (pula BLOBs: imagem, arquivo, imagem_capa)
  const [cols] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
  const blobCols = new Set(
    cols.filter((c) => /blob|binary/i.test(c.Type)).map((c) => c.Field)
  );

  const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
  if (rows.length > 0) {
    const colNames = cols.map((c) => `\`${c.Field}\``).join(", ");
    for (const row of rows) {
      const values = cols.map((c) => {
        const val = row[c.Field];
        if (val === null) return "NULL";
        if (blobCols.has(c.Field)) return val.length ? "'[BLOB]'" : "NULL";
        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
        if (typeof val === "number") return val;
        return `'${String(val).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r")}'`;
      }).join(", ");
      output.push(`INSERT INTO \`${table}\` (${colNames}) VALUES (${values});`);
    }
    output.push("");
  }
}

output.push("SET FOREIGN_KEY_CHECKS = 1;");
output.push("");

const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../dump-completo.sql");
fs.writeFileSync(outPath, output.join("\n"), "utf-8");
await conn.end();

const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`\nDump gerado: dump-completo.sql (${sizeKB} KB)`);
console.log("Nota: colunas BLOB (imagens, PDFs) foram substituídas por [BLOB] para economizar espaço.");
