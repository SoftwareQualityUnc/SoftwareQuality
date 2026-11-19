# Evidencia TPF-02 — Versionado observable del frontend

## Imagen validada

```text
terrasense-front:1.0.0
```

Construcción ejecutada desde la raíz del repositorio:

```bash
docker build --build-arg APP_VERSION=1.0.0 \
  -t terrasense-front:1.0.0 ./frontend
```

Resultado: build exitoso (`exit code 0`).

## Verificaciones funcionales

Se levantó temporalmente la imagen en el puerto `18081` y se verificó:

### Archivo de versión

```bash
curl http://127.0.0.1:18081/version.txt
```

Salida:

```text
1.0.0
```

### Header HTTP

```bash
curl -I http://127.0.0.1:18081/
```

Salida relevante:

```text
HTTP/1.1 200 OK
X-App-Version: 1.0.0
```

### Meta HTML

La respuesta HTML contiene:

```html
<meta name="app-version" content="1.0.0">
```

## Conclusión

La imagen estable expone correctamente la versión por los tres canales requeridos: meta HTML, `/version.txt` y `X-App-Version`. La imagen se validó en un contenedor temporal, que luego fue eliminado.

## Evidencia visual pendiente

Para la presentación se recomienda tomar una captura de terminal que muestre juntas las tres verificaciones anteriores. La comparación visual stable/canary y el GIF del rollout quedan para TPF-03/TPF-04.
