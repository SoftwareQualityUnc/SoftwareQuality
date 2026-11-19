# Reporte TPF-04 — Manifiestos Kubernetes stable/canary

## Estado

**Completado para la definición y validación estática de los manifiestos.** La aplicación real en Minikube queda registrada en TPF-05.

## Implementación

- `k8s/base/`: namespace, ConfigMap, Secret de demostración, PostgreSQL, backend y HPA compartidos.
- `k8s/stable/`: `front-stable` con la imagen `terrasense-front:1.0.0` y su Ingress estable.
- `k8s/canary/`: `front-canary` con la imagen `terrasense-front:1.1.0` y su Ingress canary.
- Stable y canary usan selectores separados mediante `track: stable` y `track: canary`.
- Ambas variantes usan las mismas réplicas, recursos y probes sobre `/version.txt`.
- El canary inicia con peso `0` y se puede forzar con `X-Canary: always` o con la cookie `canary=always`.

## Validación ejecutada

Desde WSL, en la raíz del repositorio:

```bash
kubectl apply --dry-run=client --validate=false \
  -f TPs/TP-Final/k8s/base/00-namespace.yaml \
  -f TPs/TP-Final/k8s/base/01-configmap.yaml \
  -f TPs/TP-Final/k8s/base/02-secret-demo.yaml \
  -f TPs/TP-Final/k8s/base/03-db.yaml \
  -f TPs/TP-Final/k8s/base/04-backend.yaml \
  -f TPs/TP-Final/k8s/base/05-hpa.yaml \
  -f TPs/TP-Final/k8s/stable/ \
  -f TPs/TP-Final/k8s/canary/
```

Resultado observado: Kubernetes reconoció namespace, ConfigMap, Secret, Service/StatefulSet de DB, Service/Deployment de backend, HPA, Deployments/Services frontend e Ingress stable/canary. El comando terminó con código `0` y no se aplicaron cambios al clúster. La validación se repitió después de agregar el forzado por cookie y volvió a terminar con código `0`.

## Pendiente

- Aplicar los manifiestos en Minikube.
- Cargar las dos imágenes frontend y la imagen backend en Minikube.
- Verificar Pods, headers, versiones y forzado de canary mediante el Ingress.
