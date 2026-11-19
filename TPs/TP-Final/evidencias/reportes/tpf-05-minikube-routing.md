# Reporte TPF-05 — Minikube, ruteo y handoff

## Estado

**Completado** para carga de imágenes, aplicación de recursos, ruteo y handoff reproducible. No implica el cierre de TPF-03 ni del rollout progresivo/load test del Integrante 2.

## Evidencia observada

### Estado de Minikube

`minikube status` informó:

- `host`: `Running`
- `kubelet`: `Running`
- `apiserver`: `Running`
- `kubeconfig`: `Configured`

### Imágenes cargadas

`minikube image load` terminó correctamente para:

- `terrasense-front:1.0.0`
- `terrasense-front:1.1.0`
- `terrasense-back:1.0`

### Aplicación y salud

- Se aplicaron los manifiestos de `base/`, `stable/` y `canary/`.
- En el Minikube existente se reemplazó previamente el Ingress legado `terrasense-ingress`, según el procedimiento de `k8s/README.md`.
- `kubectl rollout status` terminó correctamente para `front-stable` y `front-canary`.
- `kubectl get deploy,svc,ingress,pods,hpa -n terrasense` mostró los recursos saludables.

### Validación con port-forward

Cuando `localhost:80`/`minikube tunnel` no está disponible, se utilizó:

```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 18080:80
```

Con `Host: terrasense.local`:

- Tráfico normal: body y `X-App-Version` devolvieron `1.0.0`.
- Header `X-Canary: always`: devolvió `1.1.0`.
- Cookie `canary=always`: devolvió `1.1.0`.

### Recurso legado

El Deployment/Service `front` del TP4 sigue presente, pero no es utilizado por los Ingress finales. Su limpieza es opcional y no fue necesaria para esta validación.

## Capturas existentes

- [01-frontend-stable-1.0.0.png](../capturas/01-frontend-stable-1.0.0.png): captura combinada de stable `1.0.0` y canary `1.1.0`. El nombre del archivo es histórico y dice `stable`, pero la imagen no muestra únicamente stable: incluye también la vista canary con su banner `1.1.0`.
- [03-kubernetes-recursos-healthy.png](../capturas/03-kubernetes-recursos-healthy.png): salida de `kubectl get deploy,svc,ingress,pods,hpa -n terrasense` con los recursos observados en estado saludable.

## Pendientes fuera de TPF-05

- TPF-03 continúa pendiente únicamente por la instalación y validación de Horusec.
- El rollout progresivo y las pruebas de carga quedan a cargo del Integrante 2.
