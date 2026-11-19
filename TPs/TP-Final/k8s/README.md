# Kubernetes del TP Final

Estos manifiestos separan el frontend estable `1.0.0` del frontend canary `1.1.0`. La infraestructura compartida (namespace, configuración, secreto de demostración, PostgreSQL, backend y HPA) está en `base/`.

## Importante sobre el Secret

`base/02-secret-demo.yaml` contiene valores locales de demostración del TP. No son credenciales reales y no deben reutilizarse en producción. No reemplaza ni modifica `backend/config/env`.

## Orden de aplicación

Desde la raíz del repositorio:

```bash
kubectl apply -f TPs/TP-Final/k8s/base/00-namespace.yaml
kubectl apply -f TPs/TP-Final/k8s/base/01-configmap.yaml
kubectl apply -f TPs/TP-Final/k8s/base/02-secret-demo.yaml
kubectl apply -f TPs/TP-Final/k8s/base/03-db.yaml
kubectl apply -f TPs/TP-Final/k8s/base/04-backend.yaml
kubectl apply -f TPs/TP-Final/k8s/base/05-hpa.yaml
kubectl apply -f TPs/TP-Final/k8s/base/06-ingress-api.yaml
```

> **Nota sobre afinidad de sesión (Anexo A.9):** `terrasense-ingress-stable` y `terrasense-ingress-canary` utilizan afinidad de sesión por cookie (`terrasense-front`) para evitar mezcla de hashes JS/CSS entre `v1.0.0` y `v1.1.0`. Por eso `api.terrasense.local` se separó en `base/06-ingress-api.yaml`: así la cookie de frontend nunca fija clientes/sensores de la API a un único Pod del backend.

> **Estado post-promoción en este repo:** tras completar el rollout progresivo, `stable/01-front-stable.yaml` quedó promovido a `terrasense-front:1.1.0`, `canary/02-ingress-canary.yaml` en `canary-weight: "0"` y `canary/01-front-canary.yaml` en `replicas: 0`. Para reproducir desde cero la convivencia `1.0.0` vs `1.1.0` en un Minikube limpio, cambiar `image: terrasense-front:1.0.0` en `stable/01-front-stable.yaml` y `replicas: 1` en `canary/01-front-canary.yaml` antes de aplicar.

### Migración desde el TP4 en un Minikube existente

Si el cluster todavía tiene aplicado el TP4, eliminar antes de aplicar `stable/` su Ingress legado. El recurso `terrasense-ingress` del TP4 define los mismos hosts y paths (`api.terrasense.local/` y `terrasense.local/`) que necesita el diseño final; el admission webhook de NGINX rechaza la duplicación.

```bash
kubectl delete ingress terrasense-ingress -n terrasense --ignore-not-found
```

Este comando elimina únicamente el Ingress legado del TP4 para que los Ingress finales stable y canary sean los dueños de las rutas. En un cluster limpio no existe ese recurso y el comando no produce cambios. La limpieza del Service o Deployment legado `front` es opcional y no es necesaria para aplicar el diseño final.

Continuar con stable y canary:

```bash
kubectl apply -f TPs/TP-Final/k8s/stable/
kubectl apply -f TPs/TP-Final/k8s/canary/
```

El peso inicial del canary es `0`; por lo tanto, el tráfico normal permanece en `front-stable`.

## Imágenes locales en Minikube

Las imágenes usan `imagePullPolicy: IfNotPresent` y tags explícitos. Construirlas y cargarlas antes de aplicar los Deployments:

```bash
docker build --build-arg APP_VERSION=1.0.0 -t terrasense-front:1.0.0 ./frontend
docker build --build-arg APP_VERSION=1.1.0 -t terrasense-front:1.1.0 ./frontend

minikube image load terrasense-front:1.0.0
minikube image load terrasense-front:1.1.0
minikube image load terrasense-back:1.0
```

La imagen `terrasense-back:1.0` debe existir localmente antes de ejecutar el último comando.

## Cambiar el peso del canary

Editar `canary/02-ingress-canary.yaml`, cambiar `nginx.ingress.kubernetes.io/canary-weight` y reaplicar el manifiesto:

```yaml
nginx.ingress.kubernetes.io/canary-weight: "10"
```

Ejemplo de etapas:

```text
0 → 10 → 25 → 50 → 100
```

Después de cada cambio:

```bash
kubectl apply -f TPs/TP-Final/k8s/canary/02-ingress-canary.yaml
kubectl describe ingress terrasense-ingress-canary -n terrasense
```

Para volver a stable, establecer el peso en `"0"` y reaplicar el manifiesto.

## Forzar canary

El Ingress canary permite forzar la ruta mediante el header `X-Canary: always` o la cookie `canary=always`, incluso con peso `0`.

Con header:

```bash
curl -H "Host: terrasense.local" \
     -H "X-Canary: always" \
     http://127.0.0.1/version.txt
```

Con cookie:

```bash
curl -H "Host: terrasense.local" \
     -H "Cookie: canary=always" \
     http://127.0.0.1/version.txt
```

Sin header ni cookie, el tráfico normal respeta el peso configurado:

```bash
curl -H "Host: terrasense.local" http://127.0.0.1/version.txt
```

En Windows se puede usar `curl.exe` y, si corresponde al entorno Minikube/Ingress, agregar `terrasense.local` y `api.terrasense.local` al archivo `hosts`.

## Alternativa de validación con port-forward

Si `localhost:80` o `minikube tunnel` no están disponibles, mantener abierta otra terminal y publicar temporalmente el controlador Ingress en el puerto `18080`:

```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 18080:80
```

Usar `127.0.0.1:18080` en las mismas pruebas, conservando el header `Host`:

```bash
curl -H "Host: terrasense.local" http://127.0.0.1:18080/version.txt
curl -H "Host: terrasense.local" -H "X-Canary: always" http://127.0.0.1:18080/version.txt
curl -H "Host: terrasense.local" -H "Cookie: canary=always" http://127.0.0.1:18080/version.txt
```

Las respuestas esperadas son `1.0.0` para tráfico normal y `1.1.0` para header o cookie de forzado.

## Verificación rápida

```bash
kubectl get deploy,svc,ingress,pods,hpa -n terrasense
kubectl get endpoints front-stable front-canary -n terrasense
```

La API se publica en un Ingress propio (`terrasense-ingress-api` en `base/06-ingress-api.yaml`) bajo `api.terrasense.local` y apunta al Service `back`.
