/**
 * Destino del backend solo en development (`ng serve`).
 * La imagen de producción escucha únicamente en el puerto interno 3000.
 * Override local: FOMO_API_ORIGIN=http://127.0.0.1:3000
 */
const target = process.env.FOMO_API_ORIGIN || 'http://127.0.0.1:3000';

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
  },
  '/uploads': {
    target,
    secure: false,
    changeOrigin: true,
  },
};
