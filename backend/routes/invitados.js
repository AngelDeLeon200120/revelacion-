const express = require('express');
const router = express.Router();
const { enviarConfirmacion,obtenerInvitados } = require('../controllers/invitadoController.js');

router.post('/confirmar', enviarConfirmacion);
router.get('/listar', obtenerInvitados);

module.exports = router;
