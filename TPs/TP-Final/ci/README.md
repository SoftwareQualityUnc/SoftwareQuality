# Integración Continua (CI) y Quality Gates — TP Final

Esta carpeta reúne las configuraciones y enlaces de la **primera Quality Gate del release** (etapa previa a la construcción y publicación de las imágenes Docker versionadas `terrasense-front:1.0.0`, `terrasense-front:1.1.0` y `terrasense-back:1.0`).

## 1. Archivos incluidos en `ci/`

| Archivo local | Origen en el repositorio | Función en el pipeline de calidad |
| :--- | :--- | :--- |
| [`quality-gate.yml`](./quality-gate.yml) | [`../../.github/workflows/quality-gate.yml`](../../../.github/workflows/quality-gate.yml) | Workflow de GitHub Actions que ejecuta en `push` y `pull_request` dos *jobs* independientes: **Backend Checkstyle** (`10.12.5`, `maxWarnings = 0`) y **Frontend ESLint** (`8.57.0`), publicando summaries y artefactos aunque fallen. |
| [`horusec-config.json`](./horusec-config.json) | [`../../../material/Horusec/horusec-config.json`](../../../material/Horusec/horusec-config.json) | Configuración SAST de Horusec CLI (`horusecCliDisableDocker: true`, `HorusecEngine` habilitado, severidad `INFO` incluida). |
| [`sonar-project.properties`](./sonar-project.properties) | [`../../TP3-SonarQube/sonar-project.properties`](../../TP3-SonarQube/sonar-project.properties) | Descriptor de SonarQube (`softwarequality-tp3`) que integra código fuente Java 17 y React, reportes de cobertura JaCoCo (`jacocoTestReport.xml`) y Vitest (`lcov.info`), y resultados JUnit. |

---

## 2. Validación de la versión candidata Canary (`v1.1.0`)

Antes de desplegar `terrasense-front:1.1.0` en Minikube, el código candidato superó las puertas de calidad estática:

1. **ESLint (`frontend/`)**: Ejecutado sobre React/Vite en Node 20 Alpine (`npm run lint`), finalizó con `exit code 0` (**0 errores, 0 warnings**).
2. **Horusec SAST (`frontend/`)**: Ejecutado con Horusec CLI `v2.8.0` sobre la versión `1.1.0` ([`../evidencias/reportes/horusec-frontend-canary.json`](../evidencias/reportes/horusec-frontend-canary.json)), arrojando:
   - **0 vulnerabilidades `CRITICAL`, `HIGH`, `MEDIUM` ni `LOW`**.
   - **1 único hallazgo `INFO`** (`HS-JAVASCRIPT-1`, `CWE-532` en `src/components/ItemDetail/ItemDetailContainer.jsx:18`), ya clasificado como **falso positivo (`H13`)** en el [TP2](../../TP2-Horusec/README.md) (reducción de 6 hallazgos `INFO` a 1 respecto a la línea base).
   - **0 hallazgos nuevos** en los archivos modificados para el Canary `1.1.0`.
3. **Respaldo de pruebas y calidad interna (TP3)**: El proyecto cuenta además con **62 pruebas unitarias Java** (JUnit/Mockito), suite de pruebas de componentes React en **Vitest** (`frontend/tests/`), análisis con **SonarQube** (que redujo hallazgos totales de 55 a 25 y vulnerabilidades de 5 a 0, elevando la cobertura global de `7,9 %` a `33,1 %`) y **Checkstyle** en el backend (`0` violaciones).

---

## 3. Comandos de ejecución local desde la raíz del repositorio

```bash
# 1. Linter de Backend (Checkstyle) y pruebas unitarias Java
cd backend
chmod +x gradlew
./gradlew checkstyleMain test --no-daemon
cd ..

# 2. Linter de Frontend (ESLint) y pruebas unitarias React
cd frontend
npm ci
npm run lint
npm test
cd ..

# 3. Análisis SAST con Horusec sobre el Frontend Canary
horusec start -p ./frontend \
  --config-file-path ./TPs/TP-Final/ci/horusec-config.json \
  -D \
  -o json \
  -O ./TPs/TP-Final/evidencias/reportes/horusec-frontend-canary.json

# 4. (Opcional) Análisis estático completo Backend + Frontend excluyendo carpetas de TPs/build
horusec start -p . \
  --config-file-path ./TPs/TP-Final/ci/horusec-config.json \
  -D \
  -i "**/material/**,**/TPs/**,**/build/**,**/bin/**,**/node_modules/**,**/dist/**"
```

> **Nota sobre análisis en todo el repositorio:** Al ejecutar Horusec sin exclusiones desde la raíz, la herramienta inspecciona también los archivos YAML de `TPs/` (detectando credenciales de demostración en `02-secret-demo.yaml` y constantes en scripts de `k6` bajo `HS-LEAKS-25`/`HS-LEAKS-26`) y reportes XML autogenerados de JaCoCo (`HS-JAVA-115`). Por ello se recomienda usar los filtros de exclusión anteriores para auditar exclusivamente el código fuente productivo.
