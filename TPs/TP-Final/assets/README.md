# Assets de la presentación

Esta carpeta reúne los recursos visuales que puedan utilizarse en la presentación final del TP: capturas de pantalla, GIFs, videos, diagramas e imágenes de apoyo.

## Organización

- `assets/` — recursos gráficos reutilizables o en preparación.
- `evidencias/capturas/` — capturas que documentan ejecuciones concretas.
- `evidencias/videos/` — videos o GIFs que muestran el comportamiento del sistema.
- `evidencias/reportes/` — reportes, salidas y documentos de respaldo.

## Convención de nombres

Usar nombres descriptivos, en minúsculas, sin espacios ni tildes, y con prefijos ordenables. Ejemplos:

- `01-dashboard-pods-inicial.png`
- `02-canary-forzado-header.png`
- `03-hpa-escalado.gif`
- `04-rollout-10-por-ciento.mp4`
- `05-reporte-k6-stress.json`

Cuando corresponda, incluir la etapa o versión en el nombre: `stable-1.0.0`, `canary-1.1.0`, `rollout-10`, `rollout-25`, etc.

## Qué guardar

Priorizar evidencia que permita mostrar en la presentación:

- Diferencia visual entre stable `1.0.0` y canary `1.1.0`.
- Pods, Deployments, Services e Ingress en funcionamiento.
- Ruteo normal y canary forzado.
- Cambios de peso durante el rollout.
- Escalado o comportamiento bajo carga.
- Resultados relevantes de k6, CI y seguridad.

## Capturas prioritarias para la presentación

1. **Comparación stable/canary:** dos ventanas o capturas del frontend donde se vea stable sin banner y canary con `ESTÁS VIENDO LA VERSIÓN CANARY 1.1.0`.
2. **Prueba técnica de versión:** terminal con `curl` mostrando `/version.txt` y `X-App-Version` para ambas imágenes.
3. **Estado Kubernetes:** una captura de `kubectl get deploy,svc,ingress,pods,hpa -n terrasense` con los recursos healthy.
4. **Canary forzado:** terminal con `curl -H "Host: terrasense.local" -H "X-Canary: always" .../version.txt` devolviendo `1.1.0` con peso `0`.
5. **Rollout:** una captura por etapa del peso canary (`0`, `10`, `25`, `50`, `100`) junto con `kubectl describe ingress`.
6. **HPA y carga:** gráfico o GIF de k6 junto con `kubectl get hpa,pods -n terrasense` mostrando el cambio de réplicas.

Para la comparación visual ya se validaron localmente las dos imágenes en puertos temporales `18081` (stable) y `18082` (canary); guardar las capturas finales dentro de `evidencias/capturas/` con la convención anterior.

No guardar secretos, tokens, credenciales ni archivos de configuración sensibles.
