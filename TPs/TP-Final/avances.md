# Avances TP Final — Canary frontend e infraestructura Kubernetes

## Registro inicial

- **Fecha:** 2026-11-18
- **Estado:** scaffold documental inicial creado.
- **Objetivo:** preparar el entregable del TP Final para desplegar una versión estable `1.0.0` y una versión canary `1.1.0` del frontend, con versionado observable y distribución progresiva de tráfico mediante Kubernetes/NGINX Ingress.

## Alcance de Integrante 1

- Preparar la estructura del entregable `TPs/TP-Final/`.
- Adaptar el frontend para que exponga su versión mediante `APP_VERSION`, el meta HTML, `/version.txt` y el header HTTP `X-App-Version`.
- Construir y diferenciar las imágenes Docker versionadas del frontend estable y canary.
- Crear los recursos Kubernetes de stable y canary: Deployments, Services e Ingress.
- Dejar un handoff reproducible para que Integrante 2 ejecute el rollout, las pruebas de carga y la recolección de evidencia.
- Organizar las evidencias y los recursos gráficos que se usarán en la presentación final.

## Decisiones confirmadas

1. **Canary sólo del frontend:** el backend canary queda fuera del alcance inicial.
2. **Tags explícitos:** se usarán `terrasense-front:1.0.0` y `terrasense-front:1.1.0`.
3. **Sin `latest`:** no se usarán tags flotantes para las imágenes del TP Final.
4. **Versionado observable:** la versión se implementará mediante `APP_VERSION`, `<meta name="app-version">`, `/version.txt` y el header `X-App-Version`.
5. **Separación por versión:** se crearán dos Deployments y dos Services, uno stable y otro canary.
6. **Ruteo progresivo:** se crearán dos Ingress para controlar el tráfico stable/canary y permitir el forzado de la canary durante las pruebas.
7. **Versión como fuente de verdad del build:** React recibirá `VITE_APP_VERSION` desde `APP_VERSION`; así la misma fuente puede construir stable `1.0.0` y canary `1.1.0` de forma reproducible, mostrando el banner sólo en `1.1.0`.

## Estructura creada

- `k8s/base/` — namespace, ConfigMap, Secret demo, PostgreSQL, backend y HPA.
- `k8s/stable/` — Deployment, Service e Ingress de la versión estable.
- `k8s/canary/` — Deployment, Service e Ingress de la versión canary.
- `k8s/README.md` — orden de aplicación, carga de imágenes, cambio de peso y forzado por header/cookie.
- `k6/` — scripts de carga y rollout.
- `ci/` — configuración o automatizaciones de CI.
- `evidencias/capturas/` — capturas de pantalla.
- `evidencias/videos/` — videos o GIFs de demostración.
- `evidencias/reportes/` — reportes y salidas de validación.
- `presentacion/` — materiales de la presentación final.
- `assets/` — recursos gráficos reutilizables para la presentación.

## Estado y próximos pasos

- [x] Crear scaffold documental y directorios vacíos.
- [x] Registrar el alcance y las decisiones iniciales.
- [x] Adaptar el build del frontend para versionado observable (implementado y validado con Docker).
- [x] Construir y validar las imágenes `terrasense-front:1.0.0` y `terrasense-front:1.1.0`.
- [ ] Ejecutar y validar Horusec sobre el frontend; es el único pendiente de TPF-03.
- [x] Implementar Deployments, Services e Ingress stable/canary.
- [x] Validar ruteo, headers y forzado de canary.
- [x] Entregar comandos y evidencia reproducible a Integrante 2.

## Registro TPF-02 — Versionado observable del frontend

- **Estado:** completado.
- Se actualizó `frontend/Dockerfile` para aceptar `APP_VERSION` como build argument, con valor por defecto `1.0.0`.
- El build genera `<meta name="app-version" content="...">` y `/version.txt` dentro de la imagen.
- Se creó `frontend/nginx.conf.template` para mantener el puerto `8080`, el fallback de la SPA y devolver `X-App-Version` en todas las respuestas.
- Se construyó `terrasense-front:1.0.0` con `APP_VERSION=1.0.0` y el build terminó correctamente.
- Se levantó un contenedor temporal y se verificó `/version.txt`, `X-App-Version` y el meta HTML con valor `1.0.0`.
- La validación de formato pasó con `git diff --check`.
- El archivo anterior `frontend/nginx.conf` permanece sin usar por ahora; se revisará durante la validación para evitar configuración duplicada o confusa.
- Reporte reproducible: `evidencias/reportes/tpf-02-versionado.md`.

## Decisión TPF-03 — Canary reproducible

La variante visual canary se activará por la versión de build (`VITE_APP_VERSION === "1.1.0"`) y no por el orden en que se editen los archivos. De esta forma, un tercero puede construir ambas imágenes desde el mismo checkout: `1.0.0` no muestra el banner canary y `1.1.0` sí.

## Progreso TPF-03 — Imágenes y validación parcial

- **Estado:** parcial; TPF-03 no se marca como completado porque Horusec todavía no está instalado ni validado.
- Se construyeron correctamente las imágenes `terrasense-front:1.0.0` y `terrasense-front:1.1.0`.
- `npm run lint` pasó ejecutándose en Node 20 Alpine.
- En runtime, `/version.txt` y `X-App-Version` devolvieron `1.0.0` para stable y `1.1.0` para canary.
- La validación visual confirmó que stable no muestra el banner y que canary muestra `ESTÁS VIENDO LA VERSIÓN CANARY 1.1.0`.
- Horusec queda pendiente: no está instalado y no se considera validado.
- Reporte reproducible: `evidencias/reportes/tpf-03-canary.md`.

### Próximos pasos

1. Instalar o habilitar Horusec y ejecutar la validación sobre `frontend/`.
2. Registrar el resultado de Horusec y, si corresponde, cerrar TPF-03.
3. Mantener disponible la evidencia de TPF-05 para que Integrante 2 continúe con rollout progresivo y pruebas de carga.

## Registro TPF-04 — Manifiestos Kubernetes stable/canary

- **Estado:** completado.
- Se crearon los manifiestos de `base/`, `stable/` y `canary/`, junto con `k8s/README.md`.
- Stable y canary tienen Deployments y Services separados, con selectors `track: stable` y `track: canary`.
- Stable usa `terrasense-front:1.0.0` y canary usa `terrasense-front:1.1.0`, ambos con `imagePullPolicy: IfNotPresent` y los mismos recursos, réplicas y probes.
- El Ingress canary inicia con `nginx.ingress.kubernetes.io/canary-weight: "0"` y permite forzar la ruta mediante `X-Canary: always` o la cookie `canary=always`.
- Durante un apply sobre el Minikube existente apareció un conflicto de admission de NGINX porque el Ingress legado del TP4 (`terrasense-ingress`) ya definía `api.terrasense.local/` y `terrasense.local/`; se resolvió documentando su eliminación previa con `kubectl delete ingress terrasense-ingress -n terrasense --ignore-not-found`.
- La resolución conserva el diseño final de dos Ingress en un cluster limpio: stable posee API y frontend estable, y canary comparte el host del frontend. La limpieza del Service/Deployment legado `front` queda como opcional y no requerida.
- La validación observada con `kubectl apply --dry-run=client --validate=false` pasó para todos los YAML de `base/`, `stable/` y `canary/`; la salida mostró los recursos como `created/configured` en modo dry-run.
- Esta evidencia valida la estructura de los manifiestos, pero no declara runtime Minikube validado.
- Reporte reproducible: `evidencias/reportes/tpf-04-k8s-manifiestos.md`.

## Registro TPF-05 — Minikube, ruteo y handoff

- **Estado:** completado para carga de imágenes, aplicación, ruteo y handoff.
- `minikube status` observó `host`, `kubelet` y `apiserver` en `Running`, y `kubeconfig` en `Configured`.
- `minikube image load` terminó correctamente para `terrasense-front:1.0.0`, `terrasense-front:1.1.0` y `terrasense-back:1.0`.
- Se aplicaron `base/`, `stable/` y `canary/`, reemplazando previamente el Ingress legado según el procedimiento del README.
- Los rollouts de `front-stable` y `front-canary` terminaron correctamente.
- `kubectl get deploy,svc,ingress,pods,hpa -n terrasense` mostró los recursos saludables.
- Con `kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 18080:80`, el tráfico normal con `Host: terrasense.local` devolvió body/header `1.0.0`; `X-Canary: always` y `Cookie: canary=always` devolvieron `1.1.0`.
- El Deployment/Service `front` legado del TP4 permanece presente como recurso no utilizado; su limpieza es opcional.
- TPF-03 continúa pendiente únicamente por la instalación/validación de Horusec.
- No se declara cierre del rollout progresivo ni de las pruebas de carga del Integrante 2.

## README final de entrega

- Se creó `README.md` como guía de entrega reproducible, separada de esta bitácora.
- Incluye prerrequisitos, arquitectura stable/canary, builds versionados, carga en Minikube, orden de aplicación, migración del Ingress legado, verificación, port-forward, forzado por header/cookie, rollout/rollback y handoff.
- El reporte `evidencias/reportes/tpf-05-minikube-routing.md` ahora enlaza las capturas existentes de frontend y Kubernetes.
