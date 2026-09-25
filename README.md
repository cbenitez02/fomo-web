# Fomo (tienda pública)

Angular 20. Consume **solo** `GET /api/public` del API de `fomo-admin-panel`. Sin JWT, sin `/api/admin`, sin secretos de admin.

Contratos: `fomo-admin-panel/docs/public-api.md`. Configuración: `fomo-admin-panel/docs/production.md`. Docker del VPS: `fomo-admin-panel/docs/deployment.md`.

## Development

API local + proxy. No hace falta tocar TypeScript.

```bash
# en fomo-admin-panel
npm run dev:api

# en fomo-web
npm install
npm start
```

`ng serve` abre `http://localhost:4200/`. `proxy.conf.js` reenvía `/api` y `/uploads` a `FOMO_API_ORIGIN` (default `http://127.0.0.1:3000`).

`src/environments/environment.development.ts` y `public/config.json` usan rutas relativas (`/api/public`).

## Lookbook

El collage de Home tiene **6 slots fijos** (`look-1` … `look-6`). El API devuelve todos los looks `published` ordenados por `sort_order`. La web usa los **primeros 6**. Con 0–5, los huecos quedan vacíos. Con más de 6, el resto no se muestra (siguen en admin).

## CI / CD

CI y deploy automático a producción: [`docs/deployment.md`](docs/deployment.md).

- Rama: `master`
- CI (PR y push a `master`): `npm ci`, tests ChromeHeadless, `npm run build`
- CD: push a `master` con CI OK (`workflow_run`); `workflow_dispatch` no re-corre CI y exige CI verde del SHA actual de `origin/master`
- Environment GitHub: `production`
- En el VPS se reconstruye **solo** el servicio Compose `web`

## Production

```bash
npm run build
```

Artefactos en `dist/`. **No** hardcodear el host de la API en el source.

La imagen Docker (`Dockerfile`) compila este build y Nginx sirve el resultado. Al arrancar, el entrypoint escribe `/config.json` desde `API_BASE_URL` y `ASSET_BASE_URL`. Cambiar de ambiente no recompila Angular.

Fuera de Docker, copiar `config.production.example.json` sobre el `config.json` del dist (o reemplazar `public/config.json` antes del build):

```json
{
  "apiBaseUrl": "https://api.example.com/api/public",
  "assetBaseUrl": "https://api.example.com"
}
```

Same-origin (reverse proxy que sirve la web y `/api` + `/uploads`): dejar `apiBaseUrl: "/api/public"` y `assetBaseUrl: ""`.

`/uploads/products/x.webp` se resuelve contra `assetBaseUrl` (host del API), no contra el dominio de la tienda. Si la página es HTTPS, las URLs HTTP se suben a HTTPS.

## Uploads y mixed content

La API puede devolver paths relativos. `resolveAssetUrl` los une al origin del API. En split-host hay que setear `assetBaseUrl` o un `apiBaseUrl` absoluto.

## Tests

```bash
npx ng test --watch=false --browsers=ChromeHeadless
```
