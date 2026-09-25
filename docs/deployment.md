# Deploy — fomo-web

Storefront público: [https://fomooficial.shop](https://fomooficial.shop).

La imagen Docker de este repo (`Dockerfile`) compila `npm run build` (configuración de producción por defecto en `angular.json`) y Nginx sirve `dist/fomo/browser`. El entrypoint escribe `/config.json` desde `API_BASE_URL` y `ASSET_BASE_URL`.

El Docker Compose de producción **no está en este repositorio**. En el VPS vive en `/opt/fomo/app/docker-compose.prod.yml`, con `.env` en `/opt/fomo/app/.env`. El checkout de este repo está en `/opt/fomo/fomo-web`. El servicio Compose es `web` (container `fomo-web-1`).

## CI

Workflow: `.github/workflows/ci.yml`.

Corre en:

- `pull_request` → `master`
- `push` → `master`

Pasos reales del proyecto (Node 22, la misma major que el `Dockerfile`):

1. `npm ci`
2. `npm test -- --watch=false --browsers=ChromeHeadless` (el script `test` es `ng test`; los flags son los documentados en el README para CI)
3. `npm run build` (`ng build`, `defaultConfiguration: production`)

No hay script `typecheck` en `package.json`. El build de Angular ya typechequea app y templates.

Cache de npm vía `actions/setup-node` y `package-lock.json`.

## CD

Workflow: `.github/workflows/deploy.yml`.

Despliega solo:

- `push` a `master` **después de CI exitoso** (`workflow_run` del workflow `CI`, evento `push`, `conclusion: success`)
- `workflow_dispatch` (manual): **no** re-ejecuta CI; exige un run de CI ya exitoso para el SHA actual de `origin/master`

`concurrency`:

```yaml
group: fomo-production
cancel-in-progress: false
```

Un deploy no cancela otro en curso.

GitHub Environment requerido: `production`.

## Secrets

Definir en el environment **production** (recomendado) o como secrets de repositorio:

| Secret | Uso |
| --- | --- |
| `VPS_HOST` | Host o IP del VPS |
| `VPS_USER` | Usuario SSH |
| `VPS_SSH_KEY` | Clave privada SSH (nunca password) |
| `VPS_PORT` | Puerto SSH (si falta, el workflow usa `22`) |

No hay secretos en el código. El `.env` del VPS no se lee ni se imprime desde GitHub Actions.

## Deploy automático (flujo exacto)

1. Push a `master`.
2. Corre CI (`npm ci`, tests headless, `npm run build`).
3. Si CI falla, no hay deploy.
4. Si CI del **push** a `master` termina OK, arranca Deploy production.
5. El job `require-ci` toma el SHA que aprobó ese run (`workflow_run.head_sha`) y confirma vía API un CI `push` a `master` con `conclusion: success` para **ese SHA**.
6. El job de deploy usa environment `production` (reglas de protección / reviewers si las configurás) y recibe ese SHA. No usa `github.sha` del workflow de deploy (ese SHA no es el del CI).
7. SSH al VPS (`BatchMode`, clave, `known_hosts` vía `ssh-keyscan`) con `EXPECTED_SHA`.
8. `cd /opt/fomo/fomo-web`
9. Falla si el working tree no está limpio (`git status --porcelain`).
10. `git fetch origin`. Si `origin/master` no es exactamente `EXPECTED_SHA`, aborta (evita desplegar un commit más nuevo si `master` avanzó antes del SSH).
11. `git checkout master` → `git merge --ff-only $EXPECTED_SHA` y comprueba que `HEAD` sea ese SHA.
12. `cd /opt/fomo/app`
13. Comprueba que el compose define el servicio `web` (`config --services`, sin dump del compose).
14. Solo el servicio web:

    ```bash
    docker compose \
      --env-file .env \
      -f docker-compose.prod.yml \
      up -d --build --no-deps web
    ```

    No toca `api`, `admin`, `mysql`, `migrate`, `oudelia-nginx`. No corre `down`, `system prune` ni `volume prune`.
15. Espera hasta 180s a que `fomo-web-1` esté `healthy` (healthcheck del `Dockerfile`: `GET /health`).
16. `curl` a `https://fomooficial.shop/` con retry/backoff (hasta 8 intentos).
17. Si falla: el workflow falla, imprime status/health del container y `docker logs --tail 100 fomo-web-1`. No imprime env vars.

`docker-compose.prod.yml` no está en este repo (no se inspeccionó el VPS). El CD asume el servicio `web` indicado para este storefront y aborta si no existe.

## workflow_dispatch

En GitHub: Actions → **Deploy production** → Run workflow.

Sirve para redesplegar el `origin/master` actual sin un push nuevo. **No** re-ejecuta CI.

Antes de abrir SSH:

1. Lee el SHA actual de `origin/master` (`GET /repos/.../commits/master`).
2. Busca un run del workflow `ci.yml` con `headSha` igual a ese SHA, `branch` `master`, `event` `push`, `conclusion` `success`.
3. Si no hay, el job `require-ci` falla y no hay SSH.

Un commit distinto al validado por ese CI no se despliega. Si entre la aprobación y el SSH `origin/master` avanzó, el VPS aborta porque el SHA ya no coincide.

## Troubleshooting

- **CI rojo:** mirar logs de Test o Production build. Reproducir: `npm ci`, `npm test -- --watch=false --browsers=ChromeHeadless`, `npm run build`.
- **Deploy no arranca tras un push:** el CD solo sigue a CI de **push** a `master`, no a PRs. El workflow `CI` tiene que existir en `master` (requisito de `workflow_run`).
- **No successful push CI run:** `workflow_dispatch` (o el chequeo API) no encontró CI verde para ese SHA. Corré un push a `master` y esperá CI, o no hay nada que desplegar.
- **origin/master is … CI approved …:** `master` avanzó (u otro commit) respecto del SHA validado. No se despliega. Esperá el deploy del CI nuevo o volvé a disparar `workflow_dispatch` cuando el HEAD tenga CI verde.
- **Working tree is not clean:** hay cambios locales en `/opt/fomo/fomo-web`. No se fuerza reset. Revisar a mano y dejar el árbol limpio.
- **merge --ff-only falló:** `master` local y el SHA aprobado divergieron. Resolver en el VPS; el CD no hace hard reset.
- **Compose file does not define service web:** el compose de `/opt/fomo/app` no tiene el servicio esperado.
- **Timeout healthy / curl:** ver el step de logs del container. Confirmar que Nginx responde `/health` y que el proxy público apunta a `fomo-web-1`.
- **SSH:** `VPS_SSH_KEY` debe ser la privada completa; el user debe poder `docker compose` sin TTY.

Fuera de alcance (no tocar): `/opt/oudelia`, `/etc/letsencrypt`, `public_proxy`, `/opt/fomo/uploads`, `/opt/fomo/app/.env` (el compose lo usa con `--env-file`, no se cat).

## Rollback manual

En el VPS, sin borrar volumes:

```bash
cd /opt/fomo/fomo-web
git fetch origin
git log --oneline -n 20
git checkout <sha-bueno>
cd /opt/fomo/app
docker compose --env-file .env -f docker-compose.prod.yml up -d --build --no-deps web
```

Para volver a la punta de `master`:

```bash
cd /opt/fomo/fomo-web
git checkout master
git pull --ff-only origin master
cd /opt/fomo/app
docker compose --env-file .env -f docker-compose.prod.yml up -d --build --no-deps web
```
