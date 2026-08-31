-- Esquema de la base de datos - Invitación / Confirmación de asistencia
-- Ejecutar una vez en la base MySQL nueva (Hostinger: phpMyAdmin -> pestaña SQL).

CREATE TABLE IF NOT EXISTS invitados (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  nombre             VARCHAR(255) NOT NULL,
  email              VARCHAR(255) DEFAULT NULL,
  asistencia         TINYINT(1)   NOT NULL DEFAULT 1,
  cantidad           INT          NOT NULL DEFAULT 1,
  fecha_confirmacion TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
