-- Elimina la columna placaVehiculo de la tabla invitados.
-- Ya no se solicita la placa en el formulario de confirmación.
--
-- Solo hace falta en bases que YA tenían la columna (la base local vieja).
-- En una base nueva creada con schema.sql la columna no existe y no hay nada que hacer.
--
-- MariaDB (lo que usa Hostinger) soporta IF EXISTS:
ALTER TABLE invitados DROP COLUMN IF EXISTS placaVehiculo;

-- MySQL < 8.0.29 no soporta IF EXISTS. En ese caso usar:
--   ALTER TABLE invitados DROP COLUMN placaVehiculo;
