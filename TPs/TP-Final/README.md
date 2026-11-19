# TP Final — Despliegue Canary de Terrasense en Minikube

Este documento es la guía final de entrega del TP Final. Describe el estado alcanzado por Integrante 1 y permite reproducir el despliegue del frontend estable y canary en un Minikube local. No es una bitácora: los pendientes y las tareas que quedan para Integrante 2 se separan explícitamente del procedimiento que ya fue validado.

Todos los comandos que usan rutas de archivos se ejecutan desde `TPs/TP-Final/`. Por eso, las rutas de este README son relativas a ese directorio.

## 1. Objetivo y alcance de Integrante 1

El objetivo es dejar preparada una liberación progresiva del frontend de Terrasense. La versión estable `1.0.0` y la versión canary `1.1.0` se construyen desde el mismo frontend, se identifican por sus tags de imagen y exponen su versión en el HTML, en `/version.txt` y mediante el header `X-App-Version`.

El alcance de Integrante 1 comprende:

- preparar los manifiestos de Kubernetes para la infraestructura compartida, stable y canary;
- construir las imágenes versionadas `terrasense-front:1.0.0`, `terrasense-front:1.1.0` y `terrasense-back:1.0`;
- cargar esas imágenes en Minikube y aplicar los recursos en el orden reproducible indicado abajo;
- validar los rollouts iniciales, el estado de los recursos y el ruteo normal y forzado;
- organizar las evidencias y dejar un handoff operativo para Integrante 2.

Quedan fuera del alcance de Integrante 1 el cierre de Horusec, la ejecución del rollout progresivo completo, las pruebas de carga con k6, el análisis o exposición según ISO/IEC 25010 y la presentación final. Esas actividades no se presentan como realizadas en esta entrega.

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

## 6. Limpieza opcional del frontend legado

El Deployment y el Service `front` del TP4 no son necesarios para el ruteo stable/canary. Se pueden conservar para comparación o eliminar cuando Integrante 2 confirme que ya no los necesita:

```bash
kubectl delete deployment/front service/front -n terrasense --ignore-not-found
```

Esta limpieza es opcional y no forma parte de la validación de ruteo documentada.

## 7. Estructura de evidencias

La entrega queda organizada de la siguiente manera:

- `k8s/base/`: namespace, configuración, secreto de demostración, base de datos, backend y HPA;
- `k8s/stable/`: Deployment, Service e Ingress estable;
- `k8s/canary/`: Deployment, Service e Ingress canary;
- `evidencias/capturas/`: capturas visuales de las versiones y del estado de Kubernetes;
- `evidencias/reportes/`: reportes reproducibles por tarea;
- `evidencias/videos/`: espacio reservado para videos o GIFs de demostración;
- `k6/`: scripts reservados para las pruebas de carga y rollout de la siguiente etapa;
- `ci/`, `presentacion/` y `assets/`: espacios de automatización, exposición y recursos gráficos.

Los reportes disponibles para esta parte son:

- [TPF-02 — Versionado observable](evidencias/reportes/tpf-02-versionado.md);
- [TPF-03 — Imágenes y variante canary](evidencias/reportes/tpf-03-canary.md), con estado parcial por Horusec;
- [TPF-05 — Minikube, ruteo y handoff](evidencias/reportes/tpf-05-minikube-routing.md).

Las capturas relacionadas están enlazadas desde el reporte TPF-05:

- [Frontend stable/canary](evidencias/capturas/01-frontend-stable-1.0.0.png): el nombre histórico contiene `stable`, pero la captura es combinada y muestra stable `1.0.0` y canary `1.1.0`;
- [Recursos Kubernetes saludables](evidencias/capturas/03-kubernetes-recursos-healthy.png).

## 8. Estado final y handoff

Integrante 1 deja validado el camino reproducible de construcción, carga de imágenes, aplicación de `base/stable/canary`, salud inicial y ruteo por port-forward. TPF-05 está completado para ese alcance. TPF-03 continúa pendiente únicamente por la instalación y validación de Horusec.

Integrante 2 recibe:

1. las imágenes versionadas y los nombres de recursos stable/canary;
2. el canary iniciado en peso `0`, con forzado por header y cookie;
3. la secuencia `0 → 10 → 25 → 50 → 100` y el rollback a `0`;
4. los comandos de verificación y las rutas de evidencias.

El cierre del rollout progresivo, las pruebas k6, la evaluación ISO/IEC 25010 y la presentación final deben documentarse por separado cuando se ejecuten. Este README no afirma resultados que todavía no están respaldados por los reportes o capturas existentes.
