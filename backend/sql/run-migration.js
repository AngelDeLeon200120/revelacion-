// Ejecuta un archivo .sql contra la base de datos configurada en .env
// Uso: node sql/run-migration.js sql/2026-08-30_drop_placaVehiculo.sql
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

(async () => {
  const file = process.argv[2];
  if (!file) {
    console.error("Falta la ruta del archivo .sql");
    process.exit(1);
  }
  const sql = fs.readFileSync(path.resolve(file), "utf8");
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  try {
    await conn.query(sql);
    console.log("✅ Migración ejecutada:", file);
  } catch (err) {
    console.error("🔴 Error al ejecutar la migración:", err.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
