// Base del API.
// - En build de producción se usa VITE_API_URL (definirla en el hosting).
// - En desarrollo se usa el mismo host desde el que se abre el frontend
//   (así funciona tanto en localhost como accediendo por IP de la LAN, p. ej. el teléfono).
const fromEnv = import.meta.env.VITE_API_URL;

export const API_BASE =
  fromEnv && fromEnv.trim() !== ""
    ? fromEnv.replace(/\/$/, "")
    : `${window.location.protocol}//${window.location.hostname}:3001`;
