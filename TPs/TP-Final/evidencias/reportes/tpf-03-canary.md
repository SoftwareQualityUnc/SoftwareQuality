# Reporte TPF-03 — Imágenes y variante Canary

## Estado

**Completo.** TPF-03 queda cerrado: las imágenes stable/canary, ESLint y la validación Horusec fueron ejecutados y documentados.

## Validaciones realizadas

- Docker build de `terrasense-front:1.0.0`: **pasó**.
- Docker build de `terrasense-front:1.1.0`: **pasó**.
- `npm run lint` en Node 20 Alpine: **pasó**.
- Runtime de stable:
  - `/version.txt`: `1.0.0`.
  - `X-App-Version`: `1.0.0`.
  - Banner canary: **no visible**.
- Runtime de canary:
  - `/version.txt`: `1.1.0`.
  - `X-App-Version`: `1.1.0`.
  - Banner visible: `ESTÁS VIENDO LA VERSIÓN CANARY 1.1.0`.

## Validación Horusec

Desde la raíz del repositorio, se ejecutó Horusec en Docker utilizando la imagen oficial fija `horuszup/horusec-cli:v2.8.0`:

```bash
docker run --rm -v "$PWD:/repo" horuszup/horusec-cli:v2.8.0 horusec start -p /repo/frontend -P /repo --config-file-path /repo/material/Horusec/horusec-config.json -o json -O /repo/TPs/TP-Final/evidencias/reportes/tpf-03-horusec-frontend.json
```

Resultado observado:

- Exit code: `0`.
- JSON: `status: "success"`.
- JSON: `errors: ""`.
- Evidencia completa: `evidencias/reportes/tpf-03-horusec-frontend.json`.
- Un finding `INFO` con confidence `LOW` en `src/components/ItemDetail/ItemDetailContainer.jsx:18`, sobre `console.error(error)`.
- Regla/herramienta: `HorusecEngine/CWE-532`.

El finding se clasifica como **hallazgo informativo registrado para revisión**. No se afirma que haya cero findings ni que el hallazgo esté corregido. En esta ejecución no se observaron findings bloqueantes.

## Pendiente

No quedan pendientes dentro del alcance de TPF-03. El rollout progresivo, las pruebas k6, la evidencia del HPA y la evaluación ISO corresponden a los siguientes integrantes.

## Próximos pasos

1. Mantener la evidencia Horusec junto con el reporte de TPF-03.
2. Continuar con el rollout progresivo y las pruebas de carga de los siguientes integrantes.
3. Completar posteriormente la evidencia ISO/presentación sin reinterpretar el finding informativo como ausencia de hallazgos.
