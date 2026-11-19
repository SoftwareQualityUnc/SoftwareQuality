# TP Final — Despliegue Canary de Terrasense en Minikube

Este documento es la guía final de entrega del TP Final. Describe el estado alcanzado por Integrante 1 y permite reproducir el despliegue del frontend estable y canary en un Minikube local. No es una bitácora: los pendientes y las tareas que quedan para Integrante 2 se separan explícitamente del procedimiento que ya fue validado.

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

La API continúa siendo publicada por el Ingress estable bajo `api.terrasense.local` y apunta al Service `back`. El recurso `front` heredado del TP4 puede seguir visible en el namespace, pero no es utilizado por los Ingress finales.

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

### 5.1. Plan de rollout definido y bitácora de ejecución *(a completar por Integrante 2)*

| Etapa | Peso (`canary-weight`) | Duración | Hora ejecución | Métricas observadas (`visitas_stable` / `visitas_canary`, `p(95)`, error) | Decisión tomada |
| :---: | :---: | :---: | :---: | :--- | :--- |
| **0** | `0` (forzado por cookie/header) | Smoke | `[Pendiente]` | Validación inicial de `v1.1.0` (`X-Canary: always` / `canary=always` -> `1.1.0`). | Avanzar a etapa 1 |
| **1** | `10` | 3–5 min | `[Pendiente]` | `[Pendiente]` | `[Pendiente]` |
| **2** | `25` | 3–5 min | `[Pendiente]` | `[Pendiente]` | `[Pendiente]` |
| **3** | `50` | 5 min | `[Pendiente]` | `[Pendiente]` | `[Pendiente]` |
| **4** | `100` / Promoción o Rollback | Cierre | `[Pendiente]` | `[Pendiente]` | `[Pendiente]` |

> **Criterios objetivos definidos de antemano:** Avanzar solo si `http_req_failed < 1%`, `lat_canary p(95) < 300ms` (o `<= lat_stable p(95) + 10%`), la proporción real de visitas coincide aproximadamente con el peso configurado y las capturas de `k6/browser` renderizan completas sin errores en consola. En caso contrario, ejecutar rollback inmediato (`canary-weight: "0"`).

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

### Handoff operativo de Integrante 1 y cierre de TPF-03 (Integrante 3)

- **Integrante 1** dejó validado el build reproducible (`1.0.0` y `1.1.0`), carga de imágenes, aplicación de `base/stable/canary`, salud inicial de Pods y ruteo por port-forward ([`tpf-04`](evidencias/reportes/tpf-04-k8s-manifiestos.md), [`tpf-05`](evidencias/reportes/tpf-05-minikube-routing.md)).
- **Integrante 3** completó el análisis pendiente de **Horusec SAST (`v2.8.0`)** sobre el frontend Canary ([`tpf-03-canary.md`](evidencias/reportes/tpf-03-canary.md), [`horusec-frontend-canary.json`](evidencias/reportes/horusec-frontend-canary.json)), verificando **0 hallazgos `CRITICAL`/`HIGH`/`MEDIUM`/`LOW`** y un único `INFO` preexistente (`H13` en `ItemDetailContainer.jsx:18`), cerrando así `TPF-03`.
- **Pendiente de Integrante 2:** ejecutar las etapas del rollout (`0 → 10 → 25 → 50 → 100`/rollback), ejecutar la prueba de estrés con hipótesis sobre las versiones equiparadas (`1` réplica, `50m`/`150m` CPU y `64Mi`/`128Mi` RAM cada una), exportar los reportes a `evidencias/reportes/` y grabar los videos en `evidencias/videos/`.

---

## 8. Fundamentación de la prueba de estrés *(Actividad 2 — a completar por Integrante 2)*

- **Versión y estrategia elegida:** `[Definir: A/B 50/50 entre front-stable (1.0.0) y front-canary (1.1.0) equiparadas a 1 réplica y mismos requests/limits, o Canary aislado con header X-Canary: always]`
- **Hipótesis previa a la ejecución:** `[Ejemplo: "La versión canary 1.1.0 (NGINX + bundle con banner/tests) mantiene el p(95) < 300ms y tasa de error < 1%, sin degradar el p(95) más de un 10% respecto de la versión estable 1.0.0 bajo igual carga"]`
- **Fundamentación del objetivo:** validar si el rediseño visual de la `v1.1.0` (nuevo CSS, banner y logo `mvcLogo-v2.png` de ~619 KB) introduce sobrecarga de ancho de banda o regresión de latencia/errores antes de promoverla al 100 % de los usuarios.
- **Condiciones comparables garantizadas:** `front-stable` y `front-canary` declarados con idénticos recursos (`requests: 50m/64Mi`, `limits: 150m/128Mi`), idéntica cantidad de réplicas (`replicas: 1`) y sondas sobre `/version.txt:8080`.
- **Resultados y conclusión:** `[Pendiente de ejecución de k6 y exportación a evidencias/reportes/ por Integrante 2: comparar p(95), req/s, data_received y tasa de error para confirmar o refutar la hipótesis]`

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

### Evidencia a anexar por Integrante 2 *(rollout, estrés con hipótesis y videos)*

| Archivo / Enlace | Etapa | Qué demuestra |
| :--- | :---: | :--- |
| `k6/front-canary-split.js` y reportes en `evidencias/reportes/` | Act. 1 | `[Pendiente Integrante 2: conteo de visitas y p(95) separados entre stable y canary en >= 2 etapas]` |
| `k6/browser-canary.js` y lote de capturas en `evidencias/capturas/` | Act. 1 | `[Pendiente Integrante 2: grilla de 20 capturas de Chromium evidenciando el reparto visual real]` |
| Script de estrés con hipótesis y reporte JSON/HTML en `evidencias/reportes/` | Act. 2 | `[Pendiente Integrante 2: comparativa cuantitativa entre versiones bajo carga equiparada]` |
| Videos cortos (`< 3 min`) en `evidencias/videos/` (o enlaces) | Act. 4 | `[Pendiente Integrante 2: (1) HPA escalando y Pod eliminado en vivo; (2) cambio de peso Canary con navegador recargando]` |

---

## 11. Veredicto Final (`Go / No-Go`)

### 11.1. Promoción del Frontend `v1.1.0` (Panel de Monitoreo)
- **Estado actual: CONDICIONADO AL CIERRE DEL ROLLOUT PROGRESIVO (`TPF-03` y `TPF-05` aprobados; pendiente métricas del Integrante 2).**
- Desde el punto de vista de **calidad interna, seguridad e infraestructura**, la versión `1.1.0` merece un **GO parcial para iniciar exposición progresiva**:
  - Pasó el pipeline de calidad (**ESLint** en `0` errores/warnings + suite Vitest).
  - Pasó la auditoría SAST de **Horusec** ([`horusec-frontend-canary.json`](./evidencias/reportes/horusec-frontend-canary.json)) con `0` vulnerabilidades nuevas y `0` hallazgos `HIGH/CRITICAL`.
  - Está desplegada en Kubernetes con etiquetas `track: canary`, sondas sobre `/version.txt` y canales observables (`X-App-Version`, `<meta>`).
  - La promoción definitiva al **100 % (`GO final`)** se aprobará únicamente si las etapas `10% → 25% → 50%` y la prueba de estrés de la Actividad 2 confirman `http_req_failed < 1%` y ausencia de regresión significativa en `p(95)` frente a `v1.0.0`. En caso de anomalía, la arquitectura garantiza un **rollback inmediato en < 5 segundos** fijando `canary-weight: "0"`.

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
