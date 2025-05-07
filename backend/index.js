require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createPool } = require('mysql2/promise');

const app = express();

// Configuración CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(','),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Conexión a la base de datos
const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexión a DB al iniciar
pool.getConnection()
  .then(conn => {
    console.log('🟢 Conectado a MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('🔴 Error de conexión a MySQL:', err);
  });

// Rutas principales
const invitadosRouter = require('./routes/invitados');
app.use('/api/invitados', invitadosRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    db: pool ? 'Conectado' : 'Desconectado',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});