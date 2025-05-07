const mysql = require('mysql2/promise'); // Usamos la versión con promises

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000 // 10 segundos de timeout
});

// Verificación de conexión al iniciar
pool.getConnection()
  .then(conn => {
    console.log('🟢 Conectado a la base de datos MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('🔴 Error de conexión a MySQL:', err);
  });

module.exports = pool;