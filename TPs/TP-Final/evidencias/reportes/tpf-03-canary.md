# Reporte TPF-03 — Imágenes y variante Canary

## Estado

**Completado.** La validación estática (ESLint + Horusec SAST), el build reproducible y la verificación funcional en runtime de ambas variantes (`1.0.0` y `1.1.0`) finalizaron sin vulnerabilidades activas.

## Validaciones realizadas

- Docker build de `terrasense-front:1.0.0`: **pasó**.
- Docker build de `terrasense-front:1.1.0`: **pasó**.
- `npm run lint` (ESLint) en Node 20 Alpine: **pasó** (0 errores, 0 warnings).
- **Horusec SAST (`v2.8.0`) sobre `frontend/`** con configuración del laboratorio ([`material/Horusec/horusec-config.json`](../../../../material/Horusec/horusec-config.json)): **pasó** (quality gate `HIGH`/`CRITICAL` en `0`).
- Runtime de stable (`1.0.0`):
  - `/version.txt`: `1.0.0`.
  - `X-App-Version`: `1.0.0`.
  - Banner canary: **no visible**.
- Runtime de canary (`1.1.0`):
  - `/version.txt`: `1.1.0`.
  - `X-App-Version`: `1.1.0`.
  - Banner visible: `ESTÁS VIENDO LA VERSIÓN CANARY 1.1.0`.

## Resultado de Horusec SAST sobre `frontend/`

Comando ejecutado desde la raíz del repositorio:

```bash
horusec start -p ./frontend \
  --config-file-path ./material/Horusec/horusec-config.json \
  -D \
  -o json \
  -O ./TPs/TP-Final/evidencias/reportes/horusec-frontend-canary.json
```

Resumen del reporte generado en [`horusec-frontend-canary.json`](horusec-frontend-canary.json):

| Severidad | Cantidad en TP2 (línea base) | Cantidad en TPF-03 (`v1.1.0`) | Detalle |
| :--- | :---: | :---: | :--- |
| `CRITICAL` | 0 | **0** | Sin hallazgos críticos. |
| `HIGH` | 0 | **0** | Sin hallazgos altos (Quality Gate superada). |
| `MEDIUM` / `LOW` | 0 | **0** | Sin hallazgos medios ni bajos. |
| `INFO` | 6 | **1** | Único hallazgo preexistente: `HS-JAVASCRIPT-1` (`CWE-532`) en `src/components/ItemDetail/ItemDetailContainer.jsx:18` (`console.error(error)`), ya clasificado como **falso positivo (`H13`)** en el TP2. |

**Conclusión de seguridad:** Los archivos modificados o agregados para la versión Canary `1.1.0` (`App.jsx`, `index.css`, componentes de catálogo/layout y tests en `frontend/tests/`) introdujeron **0 hallazgos nuevos** en Horusec y la cantidad total de alertas informativas en el frontend se redujo de 6 a 1.
