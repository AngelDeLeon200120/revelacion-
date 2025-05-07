const express = require('express');
const router = express.Router();
const { 
  enviarConfirmacion,
  obtenerInvitados 
} = require('../controllers/invitadoController');

// Middleware para loggear las peticiones
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

router.post('/confirmar', enviarConfirmacion);
router.get('/listar', obtenerInvitados);

// Manejo de rutas no encontradas
router.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Ruta no encontrada' 
  });
});

module.exports = router;