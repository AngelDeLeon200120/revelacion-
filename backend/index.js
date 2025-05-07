require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createPool } = require('mysql2/promise');

const app = express();

// Configuración mejorada de CORS con valores por defecto
const getCorsOptions = () => {
  // Lista de orígenes permitidos por defecto
  const defaultOrigins = [
    'https://revelacion-six.vercel.app',
    'http://localhost:3000'
  ];

  try {
    // Obtener orígenes de las variables de entorno o usar los por defecto
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : defaultOrigins;

    return {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      optionsSuccessStatus: 200
    };
  } catch (error) {
    console.error('Error al configurar CORS:', error);
    return {
      origin: defaultOrigins,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    };
  }
};

app.use(cors(getCorsOptions()));
app.options('*', cors(getCorsOptions()));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Verificación de variables de entorno requeridas
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
requiredEnvVars.forEach(env => {
  if (!process.env[env]) {
    console.error(`❌ Missing required environment variable: ${env}`);
    process.exit(1);
  }
});

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

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API de Revelación de Género',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  pool.getConnection()
    .then(conn => {
      conn.release();
      res.status(200).json({ 
        status: 'OK',
        database: 'Conectado',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    })
    .catch(err => {
      res.status(500).json({ 
        status: 'ERROR',
        database: 'Desconectado',
        error: err.message,
        timestamp: new Date().toISOString()
      });
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Orígenes permitidos: ${getCorsOptions().origin.join(', ')}`);
});