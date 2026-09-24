/**
 * Defaults de compile-time (production). No editar para cambiar de ambiente:
 * la app lee `/config.json` al boot. En Docker lo escribe el entrypoint.
 *
 * Split-host: apiBaseUrl y assetBaseUrl absolutos HTTPS hacia el API.
 * Same-origin (reverse proxy): dejar relativos `/api/public` y asset vacío.
 */
export const environment = {
  production: true,
  apiBaseUrl: '/api/public',
  assetBaseUrl: '',
};
