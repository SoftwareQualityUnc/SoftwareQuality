# Reporte TPF-03 — Imágenes y variante Canary

## Estado

**Parcial.** TPF-03 no se marca como completo porque Horusec no está instalado ni validado.

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

## Pendiente

- Instalar o habilitar Horusec.
- Ejecutar Horusec sobre `frontend/` y registrar su resultado.
- Recién después evaluar el cierre de TPF-03.

## Próximos pasos

1. Completar la validación Horusec.
2. Implementar los Deployments y Services stable/canary de TPF-04.
3. Implementar los Ingress y continuar con la validación del ruteo.
