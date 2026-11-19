# TP Final — Despliegue Canary de Terrasense en Minikube

Este documento es el informe técnico final de entrega del TP Final. Describe la arquitectura stable/canary, permite reproducir el despliegue en un Minikube limpio y consolida la bitácora completa del rollout progresivo, la prueba de estrés con hipótesis, el mapa ISO/IEC 25000, el índice de evidencias y el veredicto Go/No-Go.

Todos los comandos que usan rutas de archivos se ejecutan desde `TPs/TP-Final/`. Por eso, las rutas de este README son relativas a ese directorio.

## 1. Objetivo y alcance de Integrante 1

El objetivo es dejar preparada una liberación progresiva del frontend de Terrasense. La versión estable `1.0.0` y la versión canary `1.1.0` se construyen desde el mismo frontend, se identifican por sus tags de imagen y exponen su versión en el HTML, en `/version.txt` y mediante el header `X-App-Version`.

El alcance de Integrante 1 comprende:

- preparar los manifiestos de Kubernetes para la infraestructura compartida, stable y canary;
- construir las imágenes versionadas `terrasense-front:1.0.0`, `terrasense-front:1.1.0` y `terrasense-back:1.0`, previa validación de calidad estática (ESLint + Horusec);
- cargar esas imágenes en Minikube y aplicar los recursos en el orden reproducible indicado abajo;
- validar los rollouts iniciales, el estado de los recursos y el ruteo normal y forzado;
- organizar las evidencias y dejar un handoff operativo para Integrante 2.

La ejecución del rollout progresivo completo y las pruebas de carga/estrés con `k6` corresponden al **Integrante 2**, mientras que el cierre SAST de Horusec, la carpeta `ci/`, el análisis **ISO/IEC 25000 (SQuaRE)**, el índice integral de evidencia, el veredicto **Go / No-Go** y la presentación final corresponden al **Integrante 3**.

## 2. Arquitectura stable/canary

La infraestructura común está en `k8s/base/`: namespace, configuración, secreto local de demostración, PostgreSQL, backend y HPA. El backend no tiene una variante canary en este TP.

| Flujo | Deployment | Service | Imagen | Ingress |
|---|---|---|---|---|
| Stable | `front-stable` | `front-stable` | `terrasense-front:1.0.0` | `terrasense-ingress-stable` |
| Canary | `front-canary` | `front-canary` | `terrasense-front:1.1.0` | `terrasense-ingress-canary` |

Stable y canary se distinguen mediante los selectors `track: stable` y `track: canary`. Ambos Deployments mantienen la misma forma de recursos y probes; cambia la imagen y, en la canary, se muestra el banner visual `ESTÁS VIENDO LA VERSIÓN CANARY 1.1.0`.

El Ingress canary comienza con peso `0`. Así, el tráfico normal llega a stable mientras Integrante 2 puede aumentar gradualmente el peso. El header `X-Canary: always` y la cookie `canary=always` permiten probar canary de forma determinista aun con peso `0`.

La API es publicada por su propio Ingress (`terrasense-ingress-api` en `k8s/base/06-ingress-api.yaml`) bajo `api.terrasense.local` y apunta al Service `back`. De esta forma, la afinidad de sesión por cookie (`terrasense-front`) aplicada sobre `terrasense-ingress-stable` y `terrasense-ingress-canary` evita mezcla de assets en el frontend sin afectar el balanceo del backend entre réplicas del HPA. El recurso `front` heredado del TP4 no es utilizado por los Ingress finales.

## 3. Prerrequisitos

Se necesita un entorno local con:

- Docker funcionando como driver de Minikube;
- Minikube y `kubectl` disponibles en el `PATH`;
- `curl` para las verificaciones HTTP (`curl.exe` en Windows);
- el checkout del repositorio con `frontend/`, `backend/` y el contenido de este TP.

Los Dockerfiles encapsulan las herramientas de build del frontend y backend. El secreto de `k8s/base/02-secret-demo.yaml` contiene valores locales de demostración: no son credenciales reales y no debe reutilizarse en producción.

## 4. Reproducción del despliegue

### 4.1. Inicio de Minikube y addons

```bash
minikube start --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
```

La comprobación inicial es:

```bash
minikube status
```

En la validación registrada, `host`, `kubelet` y `apiserver` informaron `Running`, y `kubeconfig` informó `Configured`.

### 4.2. Builds exactos

Las imágenes se construyen con tags explícitos; no se usa `latest`.

```bash
docker build --build-arg APP_VERSION=1.0.0 -t terrasense-front:1.0.0 ../../frontend
docker build --build-arg APP_VERSION=1.1.0 -t terrasense-front:1.1.0 ../../frontend
docker build -t terrasense-back:1.0 ../../backend
```

Las dos imágenes del frontend se construyen desde el mismo checkout y se diferencian por `APP_VERSION`. El build de stable y el de canary fueron validados; la imagen del backend se usa con el tag `terrasense-back:1.0` requerido por los manifiestos.

### 4.3. Carga de imágenes en Minikube

```bash
minikube image load terrasense-front:1.0.0
minikube image load terrasense-front:1.1.0
minikube image load terrasense-back:1.0
```

La carga de las tres imágenes terminó correctamente en la ejecución documentada.

### 4.4. Aplicación exacta de los manifiestos

Primero se aplica `k8s/base/` archivo por archivo, para conservar el orden de dependencias:

```bash
kubectl apply -f k8s/base/00-namespace.yaml
kubectl apply -f k8s/base/01-configmap.yaml
kubectl apply -f k8s/base/02-secret-demo.yaml
kubectl apply -f k8s/base/03-db.yaml
kubectl apply -f k8s/base/04-backend.yaml
kubectl apply -f k8s/base/05-hpa.yaml
kubectl apply -f k8s/base/06-ingress-api.yaml
```

> **Nota de reproducibilidad (estado post-promoción):** al cierre del rollout, `k8s/stable/01-front-stable.yaml` quedó promovido a `terrasense-front:1.1.0`, `k8s/canary/02-ingress-canary.yaml` en `canary-weight: "0"` y `k8s/canary/01-front-canary.yaml` en `replicas: 0`. Si un tercero desea reproducir desde cero el experimento dual `1.0.0` vs `1.1.0` en un Minikube limpio, debe fijar `image: terrasense-front:1.0.0` en `k8s/stable/01-front-stable.yaml` y `replicas: 1` en `k8s/canary/01-front-canary.yaml` antes de aplicar.

Para que `k6` y el navegador resuelvan `terrasense.local` y `api.terrasense.local` directamente sin `port-forward`, agregar la IP de Minikube a `/etc/hosts` (Anexo D):

```bash
MINIKUBE_IP=$(minikube ip)
echo "$MINIKUBE_IP api.terrasense.local terrasense.local" | sudo tee -a /etc/hosts
```

Si el Minikube ya tenía aplicado el TP4, antes de crear stable se elimina el Ingress legado:

```bash
kubectl delete ingress terrasense-ingress -n terrasense --ignore-not-found
```

El Ingress del TP4 y los Ingress finales declaran los mismos hosts y paths; por eso el admission webhook de NGINX puede rechazar la aplicación si el recurso legado sigue presente. En un cluster limpio el comando no produce cambios. Esta eliminación no borra el Deployment ni el Service `front` heredados.

Después se aplican stable y canary:

```bash
kubectl apply -f k8s/stable/
kubectl apply -f k8s/canary/
```

El orden es, por lo tanto, `base` archivo por archivo, eliminación del Ingress TP4 si existe, `stable` y finalmente `canary`.

### 4.5. Verificación con kubectl

```bash
kubectl rollout status deployment/front-stable -n terrasense
kubectl rollout status deployment/front-canary -n terrasense
kubectl get deploy,svc,ingress,pods,hpa -n terrasense
kubectl get endpoints front-stable front-canary -n terrasense
```

La evidencia de TPF-05 registra rollouts correctos para `front-stable` y `front-canary`, y una salida saludable para Deployments, Services, Ingress, Pods y HPA. También muestra que el recurso legado `front` permanece presente, pero no participa del ruteo final.

### 4.6. Port-forward reproducible en `18080`

Cuando `localhost:80` o `minikube tunnel` no están disponibles, se deja abierta otra terminal con:

```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 18080:80
```

Las pruebas deben conservar el header `Host: terrasense.local` para que NGINX seleccione el Ingress correcto.

### 4.7. Curl normal, header y cookie

Tráfico normal, sin selección canary:

```bash
curl -H "Host: terrasense.local" \
  http://127.0.0.1:18080/version.txt
```

Forzado de canary por header:

```bash
curl -H "Host: terrasense.local" \
  -H "X-Canary: always" \
  http://127.0.0.1:18080/version.txt
```

Forzado de canary por cookie:

```bash
curl -H "Host: terrasense.local" \
  -H "Cookie: canary=always" \
  http://127.0.0.1:18080/version.txt
```

Con el peso inicial en `0`, la respuesta esperada y observada es `1.0.0` para el tráfico normal y `1.1.0` para el header o la cookie de forzado. En la misma validación, el header `X-App-Version` acompañó esas versiones.

### 4.8. Validación Horusec

La validación se ejecutó desde la raíz del repositorio con la imagen oficial fija `horuszup/horusec-cli:v2.8.0`:

```bash
docker run --rm -v "$PWD:/repo" horuszup/horusec-cli:v2.8.0 horusec start -p /repo/frontend -P /repo --config-file-path /repo/material/Horusec/horusec-config.json -o json -O /repo/TPs/TP-Final/evidencias/reportes/tpf-03-horusec-frontend.json
```

El proceso terminó con exit code `0`; el JSON informó `status: "success"` y `errors: ""`. Se registró un finding `INFO` con confidence `LOW` en `src/components/ItemDetail/ItemDetailContainer.jsx:18`, sobre `console.error(error)`, bajo `HorusecEngine/CWE-532`. El hallazgo queda documentado para revisión: no se afirma cero findings ni que esté corregido. En esta ejecución no se observaron findings bloqueantes. La evidencia completa está en [tpf-03-horusec-frontend.json](evidencias/reportes/tpf-03-horusec-frontend.json).

## 5. Rollout progresivo y rollback

Este es el procedimiento que recibe Integrante 2; no se declara como rollout ejecutado por Integrante 1. El peso se modifica en `k8s/canary/02-ingress-canary.yaml` y se reaplica el manifiesto en cada etapa:

```yaml
nginx.ingress.kubernetes.io/canary-weight: "10"
```

Secuencia solicitada:

```text
0 → 10 → 25 → 50 → 100
```

Después de cada cambio:

```bash
kubectl apply -f k8s/canary/02-ingress-canary.yaml
kubectl describe ingress terrasense-ingress-canary -n terrasense
```

Para hacer rollback y devolver todo el tráfico a stable, se establece nuevamente:

```yaml
nginx.ingress.kubernetes.io/canary-weight: "0"
```

y se reaplica el mismo manifiesto. Las pruebas con `X-Canary: always` o `canary=always` siguen siendo útiles para comprobar canary independientemente del peso.

### 5.1. Plan de rollout definido y bitácora de ejecución

| Etapa | Peso (`canary-weight`) | Duración | Hora ejecución (19/11/2026) | Métricas observadas (`visitas_stable` / `visitas_canary`, `p(95)`, error) | Decisión tomada |
| :---: | :---: | :---: | :---: | :--- | :--- |
| **0** | `0` (forzado por cookie/header) | Smoke (`5s` + navegador) | `16:16–16:18` | `visitas_canary: 10/10` (`100%`), `0,00%` error, `lat_canary p(95) = 1,19 ms`. Navegador con `canary=always` mostró banner `1.1.0` sin errores de consola. | **Avanzar a etapa 1** |
| **1** | `10` | `3m` (`20 VUs`) | `16:21:09` | `3.249` stable (`90,25%`) / `351` canary (`9,75%`). Error `0,00%`. `lat_canary p(95) = 1,67 ms` vs `lat_stable p(95) = 1,89 ms`. | **Avanzar a etapa 2** |
| **2** | `25` *(sin afinidad)* | `3m` HTTP + `20` visitas `k6/browser` | `16:26:34` | HTTP: `2.714` stable (`75,39%`) / `886` canary (`24,61%`), `0,00%` error, `lat_canary p(95) = 2,17 ms`. **Browser (`20` visitas):** `6/20` (`30%`) pantallas en blanco (`rootBytes=0`) por mezcla de hashes JS (`index-DRF0YwY2.js` vs `index-DWX9FPhn.js`) + `try_files` devolviendo `200 OK` HTML en lugar de JS. | **ROLLBACK inmediato a `0`** (`16:32:52`) y aplicar **afinidad por cookie** (Anexo A.9) |
| **2 (re-run)** | `25` *(con afinidad)* | `20` visitas `k6/browser` | `16:34:43` | **Browser (`20` visitas):** `15` stable (`75%`) / `5` canary (`25%`). **`20/20` (`100%`) renderizadas completas**, `0` errores HTTP/consola, `LCP p(95) = 470,8 ms`. | **Avanzar a etapa 3** |
| **3** | `50` | `3m` (`20 VUs`) | `16:36:27` | `1.730` stable (`48,06%`) / `1.870` canary (`51,94%`). Error `0,00%`. `lat_canary p(95) = 1,99 ms` vs `lat_stable p(95) = 2,09 ms`. | **Avanzar a prueba A/B y etapa 4** |
| **4** | `100` | `1m` (`20 VUs`) | `17:20:29` | `1.200/1.200` (`100%`) canary. Error `0,00%`. `lat_canary p(95) = 2,41 ms`. | **Promover `v1.1.0`** |
| **Promoción** | `0` (post-corte) | – | `17:22:29` | `front-stable` actualizado a `terrasense-front:1.1.0` (`1/1 Running`); `canary-weight: "0"`; `front-canary` escalado a `0` réplicas. `20/20` requests `curl` devolvieron `1.1.0`. | **Cierre exitoso (GO)** |

> **Criterios objetivos definidos de antemano:** Avanzar solo si `http_req_failed < 1%`, `lat_canary p(95) < 300ms` (o `<= lat_stable p(95) + 10%`), la proporción real de visitas coincide aproximadamente con el peso configurado y las capturas de `k6/browser` renderizan completas sin errores en consola. En caso contrario, ejecutar rollback inmediato (`canary-weight: "0"`). El criterio de `k6/browser` detectó exactamente la falla silenciosa en Etapa 2 y gatilló el rollback antes de continuar.

## 6. Limpieza opcional del frontend legado

El Deployment y el Service `front` del TP4 no son necesarios para el ruteo stable/canary. Se pueden conservar para comparación o eliminar cuando Integrante 2 confirme que ya no los necesita:

```bash
kubectl delete deployment/front service/front -n terrasense --ignore-not-found
```

Esta limpieza es opcional y no forma parte de la validación de ruteo documentada.

## 7. Estructura del entregable y estado actual

La entrega queda organizada de la siguiente manera:

- `k8s/base/`: namespace, configuración, secreto de demostración, base de datos, backend y HPA;
- `k8s/stable/`: Deployment, Service e Ingress estable (`1.0.0`);
- `k8s/canary/`: Deployment, Service e Ingress canary (`1.1.0`);
- [`ci/`](./ci/README.md): workflow de GitHub Actions (`quality-gate.yml`), configuración de Horusec (`horusec-config.json`) y descriptor de SonarQube (`sonar-project.properties`);
- `k6/`: scripts para rollout canary, `k6/browser` y prueba de estrés con hipótesis *(Integrante 2)*;
- `evidencias/capturas/`, `evidencias/reportes/` y `evidencias/videos/`: capturas, reportes JSON/MD y videos cortos para la presentación;
- `presentacion/` y [`assets/`](./assets/README.md): diapositivas exportadas a PDF y recursos visuales.

### Estado de cierre por integrante

- **Integrante 1** dejó validado el build reproducible (`1.0.0` y `1.1.0`), carga de imágenes, manifiestos `base/stable/canary`, salud inicial de Pods y ruteo por port-forward ([`tpf-04`](evidencias/reportes/tpf-04-k8s-manifiestos.md), [`tpf-05`](evidencias/reportes/tpf-05-minikube-routing.md)).
- **Integrante 2** completó los scripts [`k6/`](./k6/), ejecutó todas las etapas del rollout (`0 → 10 → 25 [rollback + fix de afinidad] → 25 → 50 → 100 → promoción`), ejecutó la prueba de estrés A/B con hipótesis (`50/50` hasta `500 VUs`), generó los reportes JSON/HTML, las 20 capturas + grilla y grabó los 2 videos cortos en `evidencias/videos/`.
- **Integrante 3** completó el cierre SAST de Horusec (`v2.8.0`) sobre `v1.1.0` ([`tpf-03-canary.md`](evidencias/reportes/tpf-03-canary.md), [`horusec-frontend-canary.json`](evidencias/reportes/horusec-frontend-canary.json)), la carpeta `ci/`, el Mapa ISO/IEC 25000, el Veredicto Go/No-Go y Aprendizaje.

---

## 8. Fundamentación de la prueba de estrés *(Actividad 2)*

- **Versión y estrategia elegida:** **Comparación A/B (`50%` vs `50%`) en simultáneo** entre `front-stable` (`v1.0.0`) y `front-canary` (`v1.1.0`) usando [`k6/front-stress-ab.js`](./k6/front-stress-ab.js) con rampa escalonada de estrés (`0 → 50 → 150 → 300 → 500 → 0 VUs` en `2m 10s`), solicitando el HTML `/` y su correspondiente bundle JS `/assets/index-*.js` (manteniendo la afinidad dentro de cada iteración).
- **Hipótesis previa a la ejecución:** *"Bajo carga de estrés escalonada (`50 → 150 → 300 → 500 VUs`) en A/B `50/50` con recursos y réplicas equiparadas, la versión `v1.1.0` mantiene `http_req_failed < 1%` y `p(95) < 300 ms` hasta cargas altas, sin degradar el `p(95)` más de un `10%` respecto de la versión `v1.0.0`."*
- **Fundamentación del objetivo:** validar si el rediseño visual de la `v1.1.0` (nuevo CSS, banner y logo `mvcLogo-v2.png` de ~619 KB, además de nuevo hash de bundle JS) introduce sobrecarga de ancho de banda, saturación de CPU/RAM o regresión de latencia/errores frente a `v1.0.0` antes de promoverla al `100%`.
- **Condiciones comparables garantizadas:** `front-stable` y `front-canary` verificados con `kubectl get deploy` antes de correr la prueba: `1` réplica cada uno, idénticos `requests` (`50m` CPU / `64Mi` RAM), idénticos `limits` (`150m` CPU / `128Mi` RAM) e idénticas sondas sobre `/version.txt:8080`.
- **Resultados cuantitativos observados (`19/11/2026 16:42:12`, `120.431` iteraciones / `240.862` requests HTTP / `1.851,5 req/s` / `26 GB` transferidos):**

| Métrica | `front-stable` (`v1.0.0`) | `front-canary` (`v1.1.0`) | Criterio / Comparación |
| :--- | :---: | :---: | :--- |
| **Cargas completas (HTML + JS)** | `60.398` (`50,15%`) | `60.033` (`49,85%`) | Reparto A/B equilibrado |
| **Tasa de error (`err_*`)** | **`0,00%`** (`0` fallos) | **`0,00%`** (`0` fallos) | `< 1%` $\rightarrow$ **CUMPLE** |
| **Checks (sin mezcla de assets)** | `100,00%` | `100,00%` | `361.293 / 361.293` checks OK |
| **Latencia `p(95)` combinada (HTML+JS)** | **`315,88 ms`** | **`319,41 ms`** | Diferencia: **`+1,12%`** ($\ll 10\%$ tolerado) |
| **Latencia `avg` / `med` combinada** | `109,66 ms` / `78,90 ms` | `110,44 ms` / `79,23 ms` | Prácticamente idénticas |
| **Consumo en pico (`kubectl top`)** | `81m` CPU / `6Mi` RAM | `69m` CPU / `5Mi` RAM | Por debajo de límites (`150m` / `128Mi`) |

- **Conclusión (verificación de hipótesis e implicación para la promoción):**
  - El `p(95)` individual de `http_req_duration` fue **`180,50 ms`** (`< 300 ms`), mientras que la suma combinada de dos requests (`HTML + bundle JS`) en el pico extremo de `500 VUs` (`~198 MB/s`) alcanzó `315,88 ms` (`v1.0.0`) y `319,41 ms` (`v1.1.0`), cruzando levemente el umbral absoluto de `300 ms` por saturación de red/Ingress local en ambas versiones por igual.
  - **En la comparación A/B queda confirmada la ausencia de regresión:** la `v1.1.0` difiere en apenas **`+1,12%`** en `p(95)` frente a la `v1.0.0` (muy por debajo del `10%`), mantiene **`0,00%`** de fallos en `60.033` cargas y consume menos CPU en el pico (`69m` vs `81m`).
  - **Implicación para la promoción:** **GO** para promover `v1.1.0` al `100%` ([`stress-ab-50-50.json`](./evidencias/reportes/stress-ab-50-50.json), [`stress-ab-50-50.html`](./evidencias/reportes/stress-ab-50-50.html)).

---

## 9. Mapa de Calidad ISO/IEC 25000 / SQuaRE *(Actividad 3)*

Para alinear el recorrido técnico del cuatrimestre con la familia de normas **ISO/IEC 25000 (SQuaRE)** —específicamente la edición vigente **ISO/IEC 25010:2023** (*Product quality model*), **ISO/IEC 25019** (*Quality-in-use*) y las divisiones de Requisitos (`2503n`), Medición (`2502n`) y Evaluación (`2504n`)—, cada etapa de ingeniería aporta cobertura específica y presenta límites explícitos:

### 9.1. Matriz de cobertura por etapa del ciclo de calidad

| Etapa del cuatrimestre | Características / Subcaracterísticas ISO/IEC 25010 | División SQuaRE principal | Métrica / Evidencia concreta obtenida | Qué NO cubre esta etapa (límites) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Linters en CI (TP1: Checkstyle + ESLint)** | **Mantenibilidad**: analizabilidad, modificabilidad, capacidad de prueba. | **2503n** (umbrales `maxWarnings = 0`) + **2502n** (conteo de errores/warnings). | Línea base: 10 errores Checkstyle en 6 archivos Java y 14 hallazgos ESLint; reducidos a **0 errores / 0 warnings** ([`TP1-Linter`](../TP1-Linter/README.md), [`ci/quality-gate.yml`](./ci/quality-gate.yml)). | No evalúa arquitectura modular, cobertura funcional, concurrencia ni seguridad real en runtime; solo verifica reglas sintácticas y de estilo estático. |
| **2. Horusec SAST (TP2 y TPF-03)** | **Seguridad**: confidencialidad, integridad, resistencia (análisis estático de fugas/manejo de errores). | **2502n** (hallazgos por severidad CWE) + **2504n** (clasificación VP/FP). | TP2: 13 hallazgos revisados (2 `HIGH`, 11 `INFO` -> 100 % falsos positivos auditados). En `v1.1.0` ([`horusec-frontend-canary.json`](./evidencias/reportes/horusec-frontend-canary.json)): **0 `CRITICAL/HIGH`**, 1 `INFO` preexistente (`H13`). | No detecta vulnerabilidades de lógica de negocio, fallas de autenticación/autorización en ejecución (DAST) ni auditoría de CVEs en dependencias si está desactivada en la config. |
| **3. SonarQube + Tests Unitarios (TP3)** | **Mantenibilidad** (duplicación, complejidad, analizabilidad) y **Fiabilidad** (ausencia de fallos / *faultlessness*). | **2502n** (cobertura JaCoCo/LCOV, complejidad ciclomática/cognitiva) + **2503n** (Quality Gate). | Bugs bajaron de `15 → 2`, Vulnerabilities `5 → 0`, Code Smells `35 → 23`, Cobertura global `7,9 % → 33,1 %`, **62 tests Java** + suite **Vitest** en `frontend/tests/` ([`TP3-SonarQube`](../TP3-SonarQube/README.md)). | Los tests unitarios simulan Firestore/servicios con Mockito y no prueban integración real contra PostgreSQL, red de clúster, navegador ni concurrencia masiva. |
| **4. K8s + Probes (`TP4` y `TPF-04`)** | **Fiabilidad** (disponibilidad, recuperabilidad) y **Flexibilidad** (instalabilidad, adaptabilidad mediante `@Profile("k8s")`). | **2504n** (evaluación operativa de arranque y salud mediante Actuator y `pg_isready`). | Pods `back`, `db-0`, `front-stable` y `front-canary` en `1/1 Running` (`0 RESTARTS`) tras ajustar `limits.cpu: 500m` e `initialDelaySeconds: 90` ante arranque de `52,8s` en Spring Boot. | Las sondas HTTP/TCP aseguran que el proceso responde, pero no garantizan rendimiento bajo carga ni evitan saturación cuando la CPU alcanza throttling. |
| **5. Autoescalado Horizontal — HPA (`TP4`)** | **Flexibilidad** (escalabilidad) y **Eficiencia de desempeño** (utilización de recursos). | **2503n** (`target CPU: 50%`, `min: 1`, `max: 5`) + **2502n** (`metrics-server`). | Ante carga, el HPA detectó `380% → 500%` CPU y escaló automáticamente de **1 a 5 Pods** (`MAXPODS = 5`), bajando luego a `13%` al cesar la carga ([`TP4-HPA-y-K6`](../TP4-HPA-y-K6/README.md)). | Tiene inercia reactiva (~15s de sondeo + ~50s de arranque JVM), no escala la base de datos (`db-0` es un único StatefulSet) y tiene techo fijo en 5 réplicas. |
| **6. k6: Smoke, Load y Stress (`TP4`)** | **Eficiencia de desempeño**: comportamiento temporal (`p(95)`), utilización de recursos y capacidad límite. | **2503n** (SLOs: `p(95) < 300ms`, `rate < 0.01`) + **2502n** (percentiles, `req/s`, tasa de fallos). | Smoke: `0 %` error. Load (2.000 VUs): `98,10 %` fallos, `p(95) = 12,32 s`. Stress: quiebre desde 200 VUs con `99,80 %` timeouts (`p(95) = 5,00 s`) por falta de pool JDBC (`DriverManagerDataSource`). | Al simular clientes HTTP sintéticos no captura por sí solo fallos visuales de renderizado React/CSS ni la percepción real de un usuario navegando el catálogo. |
| **7. Pruebas de Fallas E1 y E2 (`TP4`)** | **Fiabilidad**: tolerancia a fallos y capacidad de recuperación (*Self-Healing*), vinculada a **ISO/IEC 25045**. | **2504n / 25045** (módulo de evaluación de recuperabilidad). | **E1 (`delete pod` con réplicas activas):** `0,00 %` fallos (`574/574`), Web Vitals `LCP = 476 ms` en [`falla-ux.png`](../TP4-HPA-y-K6/evidence/falla-ux.png). **E2 (Spike 1.500 VUs en 5s):** `100 %` fallos y reinicio automático de los 5 Pods (`Exit Code 143`). | Demuestra resiliencia frente a caída de un Pod cuando hay redundancia, pero también expone que con `MINPODS = 1` (`25,37 %` éxito) o en *spikes* verticales la recuperación no es instantánea. |
| **8. Canary Release (`TP Final`)** | **Fiabilidad** (disponibilidad en despliegues, mitigación del *big bang*), **Flexibilidad** (reemplazabilidad) y **Protección (*safety*)** (*fail safe*: rollback inmediato a peso `0`). | **2503n** (criterios de promoción/rollback por etapa) + **2504n** (evaluación progresiva con tráfico controlado). | Separación reproducible en `front-stable:1.0.0` y `front-canary:1.1.0`, validación inicial por `X-Canary: always` / `canary=always` (`01-frontend-stable-1.0.0.png`) y rollback en 1 comando (`canary-weight: "0"`). | El reparto por peso de NGINX Ingress aplica únicamente al tráfico HTTP entrante por el Ingress; no aisla errores compartidos si el backend o la base de datos colapsan (tampoco evita mezcla de assets sin afinidad de sesión). |

### 9.2. Ubicación en las divisiones de SQuaRE

- **Requisitos de calidad (`ISO/IEC 2503n` / `25030`)**: se materializan en las definiciones declarativas de aceptación antes de ejecutar: umbrales `maxWarnings = 0` en Checkstyle/ESLint, Quality Gate de Horusec (`HIGH/CRITICAL = 0`), SLOs de `k6` (`p(95) < 300ms`, `http_req_failed < 1%`), política de HPA (`averageUtilization: 50%`) y criterios previos del plan de rollout Canary.
- **Medición de calidad (`ISO/IEC 2502n` / `25023`, `25022`)**: ocurre en cada ejecución de herramientas que producen valores numéricos observados: conteos de hallazgos en GitHub Actions/Horusec, cobertura JaCoCo/LCOV y complejidad en SonarQube, percentiles `p(90)/p(95)`, `req/s` y Core Web Vitals (`FCP`, `LCP`, `CLS`, `TTFB`) en `k6`.
- **Evaluación de calidad (`ISO/IEC 2504n` / `25040`, `25045`)**: se realiza al interpretar esas mediciones contra los requisitos para emitir dictamen: clasificación de falsos positivos en Horusec (TP2), validación de tolerancia a fallos y recuperación (*recoverability* **25045**) en E1/E2 (TP4), decisión de avanzar o revertir en cada etapa Canary y el veredicto final **Go / No-Go**.

### 9.3. Calidad del Producto (`ISO/IEC 25010`) vs. Calidad en Uso (`ISO/IEC 25019`)

- **Hasta el TP3 (e inicios del TP4 HTTP)** solo medimos **Calidad del Producto (`25010`)**: atributos internos y externos del artefacto en laboratorio (estilo estático, vulnerabilidades potenciales, cobertura de tests unitarios, consumo de CPU y tiempos de respuesta HTTP en `k6`).
- **Cuándo empezamos a medir Calidad en Uso (`25019`)**: el primer punto de contacto con la experiencia real del usuario ocurrió en el **Experimento 1 del TP4 (`k6/browser` en `04-e1-ux-failover.js`)**, donde un navegador Chromium real renderizó la tienda mientras caía un Pod del Backend, midiendo si el productor efectivamente podía ver los productos (`falla-ux.png`) y cuánto tardaba en pintarse el contenido útil (**LCP `476 ms`**, **CLS `0.0947`**).
- **Qué cambia con el Canary Release de la `v1.1.0`**: pasaríamos de simular usuarios en laboratorio a exponer una fracción real (`10%`, `25%`, `50%`) de productores de la Cooperativa al rediseño en producción. Allí cobran valor métricas de **25019** (*efectividad, eficiencia, satisfacción y ausencia de riesgo*): si un cambio visual confunde al productor, rompe la carga de JS por mezcla de assets sin *sticky session*, o genera errores en dispositivos reales mientras el servidor devuelve `200 OK`, solo la observación en uso real (y el rollback rápido del Canary) permite detectarlo sin repetir la *"pantalla en blanco de la madrugada"*.

### 9.4. Características de ISO/IEC 25010 sin cubrir y propuesta para abordarlas

1. **Capacidad de interacción (antes Usabilidad) — en particular *Accesibilidad / Inclusividad* y *Operabilidad* en navegador real**:
   - *Por qué quedó sin cubrir*: los linters, Horusec, pruebas unitarias y `k6` HTTP evalúan código o latencia de red, pero ninguna etapa del pipeline audita contraste de colores del rediseño `v1.1.0`, etiquetas ARIA, navegación por teclado ni rendimiento de renderizado completo en cliente.
   - *Cómo abordarla*: incorporar **Lighthouse CI (`lhci`)** o **`axe-core`** en el workflow de GitHub Actions ([`ci/quality-gate.yml`](./ci/quality-gate.yml)) ejecutándose contra un build estático del `frontend/` antes de construir la imagen Docker, fijando umbrales mínimos de *Accessibility Score >= 90* y *0 violaciones críticas WCAG* (y capturando Core Web Vitals sintéticos antes del Canary).
2. **Compatibilidad (Coexistencia e Interoperabilidad) / Auditoría de dependencias (SCA)**:
   - *Por qué quedó sin cubrir*: todo el despliegue y testing asumió contratos estáticos entre nuestro frontend/backend y se probó únicamente en Chromium sobre Linux local; además, `horusec-config.json` mantiene desactivados `NpmAudit` y `OwaspDependencyCheck`, por lo que no verificamos compatibilidad ni vulnerabilidades en librerías de terceros (`npm`/`Gradle`) ni contratos OpenAPI entre versiones `v1.0.0` y `v1.1.0`.
   - *Cómo abordarla*: sumar en la etapa de **CI** un paso de **Contract Testing / validación de esquema OpenAPI** (ej. *Schemathesis* o tests de contrato Spring Cloud Contract entre Frontend y API `v1`) junto con auditoría automática de dependencias (`npm audit --audit-level=high` / `./gradlew dependencyCheckAnalyze` o **Trivy** sobre la imagen Docker construida) como compuerta previa al registro de la imagen versionada.

---

## 10. Índice integral de evidencia *(trazabilidad TP1 → TP Final)*

### Evidencia técnica ya disponible en el repositorio

| Archivo / Enlace | Etapa | Qué demuestra |
| :--- | :---: | :--- |
| [`ci/quality-gate.yml`](./ci/quality-gate.yml) | TP1 / TP Final | Workflow CI con jobs independientes de **Checkstyle** (Java) y **ESLint** (React) como primera compuerta de calidad. |
| [`TP1-Linter/README.md`](../TP1-Linter/README.md) y [`checkstyle-fail.png`](../TP1-Linter/assets/checkstyle-fail.png) | TP1 | Línea base fallida (10 errores Checkstyle, 14 ESLint) y corrección total sin debilitar reglas. |
| [`TP2-Horusec/README.md`](../TP2-Horusec/README.md) y [`horusec-config-laboratorio-frontend.json`](../TP2-Horusec/evidence/horusec-config-laboratorio-frontend.json) | TP2 | Auditoría SAST inicial con Horusec (13 alertas revisadas y justificadas como falsos positivos). |
| [`evidencias/reportes/horusec-frontend-canary.json`](./evidencias/reportes/horusec-frontend-canary.json) y [`tpf-03-canary.md`](evidencias/reportes/tpf-03-canary.md) | **TPF-03** | Cierre de Horusec sobre `frontend/` (`v1.1.0`): **0 CRITICAL/HIGH/MEDIUM/LOW**, solo 1 `INFO` preexistente (`H13`), validando que el código Canary no introdujo vulnerabilidades. |
| [`TP3-SonarQube/README.md`](../TP3-SonarQube/README.md) y [`analisis-final.json`](../TP3-SonarQube/evidence/analisis-final.json) | TP3 | Reducción de bugs (`15→2`), vulnerabilidades (`5→0`), subida de cobertura (`7,9%→33,1%`), 62 tests Java y tests React. |
| [`TP4-HPA-y-K6/README.md`](../TP4-HPA-y-K6/README.md) y [`image-12.png`](../TP4-HPA-y-K6/evidence/image-12.png) | TP4 | Migración con `@Profile("k8s")`, autoescalado del HPA `1→4→5` Pods (`500%` CPU) y saturación a 200–2.000 VUs por falta de pool JDBC. |
| [`TP4-HPA-y-K6/evidence/falla-ux.png`](../TP4-HPA-y-K6/evidence/falla-ux.png) e [`image-14.png`](../TP4-HPA-y-K6/evidence/image-14.png) | TP4 (E1) | Tolerancia a fallos al eliminar un Pod en vivo con réplicas activas (`0%` fallos en API, catálogo visible en Chromium con `LCP = 476 ms`). |
| [`TP4-HPA-y-K6/evidence/image-15.png`](../TP4-HPA-y-K6/evidence/image-15.png) | TP4 (E2) | Colapso de Spike Test (`0→1.500` VUs en 5s, `2.902 req/s`, `100%` timeouts) provocando `Exit Code 143` por falla de `livenessProbe`. |
| [`evidencias/reportes/tpf-02-versionado.md`](evidencias/reportes/tpf-02-versionado.md) | TPF-02 | Validación de canales observables (`<meta name="app-version">`, `/version.txt`, header `X-App-Version`) en la imagen `1.0.0`. |
| [`evidencias/reportes/tpf-04-k8s-manifiestos.md`](evidencias/reportes/tpf-04-k8s-manifiestos.md) y [`k8s/README.md`](./k8s/README.md) | TPF-04 | Definición y validación `--dry-run=client` de manifiestos `base/`, `stable/` y `canary/`. |
| [`evidencias/reportes/tpf-05-minikube-routing.md`](evidencias/reportes/tpf-05-minikube-routing.md) | TPF-05 | Carga de imágenes en Minikube, resolución de conflicto del Ingress legado y verificación de ruteo por peso `0`, `X-Canary: always` y `Cookie: canary=always`. |
| [`evidencias/capturas/01-frontend-stable-1.0.0.png`](evidencias/capturas/01-frontend-stable-1.0.0.png) | TPF-05 | Comparación visual lado a lado entre `front-stable:1.0.0` (tema oscuro) y `front-canary:1.1.0` (paleta cálida + banner `ESTÁS VIENDO LA VERSIÓN CANARY 1.1.0`). |
| [`evidencias/capturas/03-kubernetes-recursos-healthy.png`](evidencias/capturas/03-kubernetes-recursos-healthy.png) | TPF-05 | Salida de `kubectl get deploy,svc,ingress,pods,hpa -n terrasense` con todos los recursos `1/1 Running` y ambos Ingress activos. |

### Evidencia técnica generada en el rollout, pruebas y videos *(Integrante 2)*

| Archivo / Enlace | Etapa | Qué demuestra |
| :--- | :---: | :--- |
| [`k6/front-canary-split.js`](./k6/front-canary-split.js) y reportes [`10%`](./evidencias/reportes/rollout-etapa1-10pct.html), [`25%`](./evidencias/reportes/rollout-etapa2-25pct.html), [`50%`](./evidencias/reportes/rollout-etapa3-50pct.html), [`100%`](./evidencias/reportes/rollout-etapa4-100pct.html) *(+ JSON)* | Act. 1 | Distribución real del tráfico por header `X-App-Version` (`9,75%` en etapa 1, `24,61%` en etapa 2, `51,94%` en etapa 3, `100%` en etapa 4), `0,00%` fallos y `p(95) <= 2,41 ms`. |
| [`k6/browser-canary.js`](./k6/browser-canary.js), [`hallazgo-mezcla-assets-1.1.0.png`](./evidencias/capturas/hallazgo-mezcla-assets-1.1.0.png) y [`hallazgo-mezcla-assets-1.0.0.png`](./evidencias/capturas/hallazgo-mezcla-assets-1.0.0.png) | Act. 1 (Hallazgo) | Detección en Chromium real de `6/20` (`30%`) pantallas en blanco por mezcla de hashes JS (`index-DRF0YwY2.js` vs `index-DWX9FPhn.js`) + `try_files` devolviendo `200 OK` HTML en lugar de JS (motivó rollback a `0` y fix con afinidad de sesión). |
| [`grilla-canary-25pct.png`](./evidencias/capturas/grilla-canary-25pct.png) *(y `visita-01`..`20.png`, [`reporte`](./evidencias/reportes/rollout-etapa2-browser-fixed.json))* | Act. 1 (Fix) | Grilla de 20 visitas en Chromium tras activar afinidad por cookie: reparto exacto `15` (`1.0.0`) vs `5` (`1.1.0`), **`20/20` (`100%`) renderizadas completas** sin errores (`LCP p(95) = 470,8 ms`). |
| [`k6/front-stress-ab.js`](./k6/front-stress-ab.js), [`stress-ab-50-50.json`](./evidencias/reportes/stress-ab-50-50.json) y [`stress-ab-50-50.html`](./evidencias/reportes/stress-ab-50-50.html) | Act. 2 | Prueba de estrés A/B `50/50` (`120.431` cargas HTML+JS hasta `500 VUs`): `0,00%` fallos en ambas versiones y apenas `+1,12%` de diferencia en `p(95)` (`319,41 ms` vs `315,88 ms`), confirmando ausencia de regresión. |
| [`video-1-hpa-failover.mp4`](./evidencias/videos/video-1-hpa-failover.mp4) *(1m 38s, x2)* | Act. 4 | Grabación en vivo de `back-hpa` escalando a `4` réplicas bajo carga de `k6` y eliminación de `back-65bf649f7d-m67mb` reemplazado automáticamente por `back-65bf649f7d-b7l49`. |
| [`video-2-canary-rollout.mp4`](./evidencias/videos/video-2-canary-rollout.mp4) *(1m 16s)* | Act. 4 | Grabación lado a lado (terminal + Firefox) cambiando `canary-weight` (`0 → 50 → 100 → 0` rollback) y observando el cambio en vivo entre `v1.0.0` y `v1.1.0` al limpiar la cookie sticky. |

---

## 11. Veredicto Final (`Go / No-Go`)

### 11.1. Promoción del Frontend `v1.1.0` (Panel de Monitoreo)
- **Dictamen técnico: `GO` definitivo (promoción al `100%` ejecutada y validada).**
- **Justificación con evidencia completa del ciclo:**
  - **Calidad interna y seguridad (`TPF-01` / `TPF-03`):** pasó **ESLint** (`0` errores/warnings), la suite **Vitest** (22 tests) y la auditoría SAST de **Horusec** ([`horusec-frontend-canary.json`](./evidencias/reportes/horusec-frontend-canary.json)) con `0` vulnerabilidades nuevas y `0` hallazgos `HIGH/CRITICAL`.
  - **Rollout progresivo (`Act. 1`):** detectó en etapa `25%` el riesgo de mezcla de hashes JS entre versiones mediante `k6/browser`, ejecutó **rollback inmediato a `0`**, incorporó afinidad de sesión por cookie (aislando la API en `terrasense-ingress-api`) y revalidó `20/20` cargas completas (`LCP p(95) = 470,8 ms`), completando luego las etapas `50%` y `100%` con `0,00%` de error y `p(95) <= 2,41 ms`.
  - **Estrés comparativo A/B (`Act. 2`):** bajo carga extrema (`500 VUs`, `1.851 req/s`, `120.431` cargas completas), `v1.1.0` registró `0,00%` de fallos, `69m` CPU en pico y apenas `+1,12%` en `p(95)` respecto de `v1.0.0`, confirmando ausencia de regresión y respaldando su promoción definitiva a `front-stable`.

### 11.2. Ampliación del Contrato de 2.000 a 10.000 Sensores ESP32
- **Dictamen técnico: `NO-GO` en las condiciones arquitectónicas actuales.**
- **Justificación empírica con SLOs (`p(95) < 300ms`, Error `< 1%`):**
  1. **Carga estimada de 10.000 sensores**: reportando cada 30 segundos equivalen a `~333 req/s` sostenidos en promedio (y picos superiores a `1.500–2.000` conexiones simultáneas ante reconexiones masivas tras un corte de red o helada).
  2. **Evidencia de saturación por debajo de ese volumen ([TP4](../TP4-HPA-y-K6/README.md))**:
     - En el **Stress Test (`03-stress-test.js`)**, enviando escrituras continuas (`245,29 req/s`, incluso *por debajo* de los `333 req/s` nominales de 10.000 sensores), la API registró **`99,80 %` de fallos** y `p(95) = 5,00 s`.
     - En el **Load Test (`02-load-test.js`, 2.000 VUs)**, aunque el HPA escaló al máximo (`5 Pods`, `500%/50%` CPU), el error llegó al **`98,10 %`** (`p(95) = 12,32 s`).
     - En el **Spike Test (`05-e2-spike-test.js`, 1.500 VUs en 5s)**, la inercia del HPA (~15s de métrica + ~52s de arranque JVM) y el estrangulamiento de CPU (`456%`) provocaron **`100 %` de fallos** y el reinicio en cascada de los 5 Pods por `livenessProbe` (`Exit Code 143`).
  3. **Causas raíz identificadas en el código del Backend**:
     - **Sin pool de conexiones JDBC**: `PostgresDatabaseConfig.java` instancia `DriverManagerDataSource`, abriendo una conexión TCP nueva por cada consulta y agotando `max_connections = 100` en `db-0`.
     - **Consultas SQL no escalables**: cada alta ejecuta un `SELECT COUNT(*) + 1` previo al `INSERT`, y `GET /getProductosPorFiltro` retorna toda la tabla sin paginación (elevando el payload de decenas de KB a `> 30 MB` totales en las pruebas).
- **Plan de remediación para pasar a `GO` (próximos pasos antes de firmar los 10.000 sensores):**
  1. Reemplazar `DriverManagerDataSource` por **HikariCP** (`spring-boot-starter-jdbc` con pool acotado por Pod) y utilizar secuencias nativas de PostgreSQL (`SERIAL`/`SEQUENCE`) en lugar de `SELECT COUNT(*)`.
  2. Incorporar paginación (`LIMIT/OFFSET` o *keyset*) en las consultas de catálogo/lecturas.
  3. Elevar `MINPODS` a al menos `2` o `3` réplicas en horario operativo para eliminar la ventana de arranque en frío y el punto único de fallo, y migrar a una arquitectura de ingesta desacoplada con cola/buffer (ej. RabbitMQ/Kafka) si se esperan reconexiones simultáneas masivas.

---

## 12. Aprendizaje: complicaciones encontradas y soluciones

1. **Conflicto de Ingress al migrar del TP4 al TP Final (`Admission Webhook`)**:
   - *Problema*: al aplicar `k8s/stable/` y `k8s/canary/` sobre un Minikube que ya tenía desplegado el TP4, el *admission webhook* de NGINX Ingress rechazó los manifiestos porque el Ingress legado `terrasense-ingress` ya declaraba los mismos hosts (`terrasense.local` y `api.terrasense.local`).
   - *Solución*: documentar la eliminación previa de ese recurso (`kubectl delete ingress terrasense-ingress -n terrasense --ignore-not-found`) antes de aplicar `stable/` y `canary/`.
2. **Escaneo de Horusec sobre todo el repositorio (`33` hallazgos vs `5` reales en código)**:
   - *Problema*: al correr Horusec sin filtros desde la raíz `.`, el motor detectó 8 `CRITICAL` (`HS-LEAKS-25`/`26`) en los manifiestos YAML de prueba (`02-secret-demo.yaml`, `02-secret.yaml`) y constantes de scripts `k6`, además de 19 `HIGH` sobre reportes XML/JS autogenerados de JaCoCo en `backend/build/` y `TP3-SonarQube/evidence/`.
   - *Solución*: aplicar exclusiones explícitas (`-i "**/material/**,**/TPs/**,**/build/**,**/bin/**,**/node_modules/**,**/dist/**"`) al auditar el código fuente de la aplicación y conservar la aclaración de que `02-secret-demo.yaml` es exclusivo del entorno local de laboratorio.
3. **Permisos de `/var/run/docker.sock` sin riesgo permanente de `root`**:
   - *Problema*: ni Minikube (`--driver=docker`) ni Horusec sin `-D` permitían ejecutarse con `sudo`, y el socket de Docker se resetea al reiniciar el equipo.
   - *Solución*: otorgar ACL temporal de sesión con `sudo setfacl -m u:$USER:rw /var/run/docker.sock` para Minikube y ejecutar Horusec en modo nativo sin Docker (`-D`) con la configuración del laboratorio.
4. **Desacoplamiento Firebase → PostgreSQL mediante `@Profile("k8s")` y errores de build**:
   - *Problema*: el backend dependía de un archivo `.env` y de Firestore; además, al agregar `@Profile("!k8s")` sin su `import` se bloqueó el procesador de anotaciones de Lombok (96 errores en cascada) y fallaron reglas de orden de imports de Checkstyle.
   - *Solución*: encapsular PostgreSQL bajo `@Profile("k8s")` con `.ignoreIfMissing()` en `Dotenv`, ordenar imports según `checkstyle.xml` y validar los 62 tests Java en verde.
5. **Arranque lento de Spring Boot vs `livenessProbe` (`52,8s`) y `Exit Code 143`**:
   - *Problema*: con `limits.cpu: 300m`, el Pod del backend demoraba `52,8s` en iniciar, por lo que `livenessProbe` (`40s`) lo reiniciaba en bucle; posteriormente, en el Spike Test (`456%` CPU), el *CPU throttling* volvió a impedir las respuestas a tiempo generando `Exit Code 143` (`SIGTERM` = `128 + 15`).
   - *Solución*: ajustar `limits.cpu: 500m` e `initialDelaySeconds: 90` en `04-backend.yaml`, y documentar el diagnóstico diferencial entre falla de aplicación, `OOMKilled` (`137`) y terminación por sonda de vida (`143`).
6. **Persistencia acumulada en `PVC` de PostgreSQL entre corridas de `k6`**:
   - *Problema*: cada corrida de Load/Stress Test dejaba miles de filas en la tabla `productos` dentro del `StatefulSet` (`db-0`), haciendo que el `GET /getProductosPorFiltro` posterior creciera de ~1,2 KB a ~60 KB por respuesta y degradara el Smoke Test (`2,01 s`) y Experimento 1 (`32 MB` transferidos).
   - *Solución*: limpiar explícitamente los registros generados por `k6` en PostgreSQL mediante `kubectl exec -it db-0 -n terrasense -- psql -U admin -d iot_db` antes de reiniciar mediciones comparables.
7. **Pantalla en blanco silenciosa en `k6/browser` (`6/20` visitas) por mezcla de assets + `try_files` sin afinidad de sesión**:
   - *Problema*: al exponer `25%` en el canary sin afinidad de sesión, NGINX Ingress sorteaba cada request por separado. Como `v1.0.0` (`index-DRF0YwY2.js`) y `v1.1.0` (`index-DWX9FPhn.js`) tienen distinto hash de bundle JS y `frontend/nginx.conf.template` usa `try_files $uri $uri/ /index.html;`, las requests cruzadas recibían `200 OK` devolviendo `index.html` (`text/html`) en lugar del JavaScript. Así, `k6` HTTP reportaba `0%` error mientras `30%` de las visitas en Chromium quedaban en pantalla vacía (`rootBytes=0`).
   - *Solución*: ejecutar rollback inmediato a `canary-weight: "0"`, separar `api.terrasense.local` en `k8s/base/06-ingress-api.yaml` para no contaminar el balanceo del backend y activar `affinity: "cookie"` (`terrasense-front`) en `terrasense-ingress-stable` y `terrasense-ingress-canary` (Anexo A.9), alcanzando `20/20` renders completos.
