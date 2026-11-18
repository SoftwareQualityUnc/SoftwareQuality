# TP2: Análisis de seguridad con Horusec

Este trabajo consiste en analizar la seguridad del backend y el frontend del proyecto con Horusec. Se revisaron las alertas en el código para distinguir vulnerabilidades reales de falsos positivos. El objetivo es justificar cada clasificación, explicar el posible impacto de los problemas encontrados y proponer mejoras.

## Resultados

| Resultado | Cantidad |
|---|---:|
| Hallazgos totales | **13** |
| Backend | 7 |
| Frontend | 6 |
| Severidad HIGH | 2 |
| Severidad INFO | 11 |
| Falsos positivos en los flujos analizados | 13 |
| Verdaderos positivos confirmados | 0 |

La consigna pide encontrar 20 defectos en el proyecto del laboratorio. Al aplicarla a nuestro proyecto, Horusec devolvió 13 alertas. La revisión del código llevó a clasificarlas como falsos positivos por los motivos que se detallan abajo. Esto no significa que la aplicación esté libre de vulnerabilidades.

## Registro de hallazgos

Para clasificar cada alerta se revisó qué información se imprime y dónde aparece. También se incluyeron mejoras posibles, aunque el caso se haya considerado un falso positivo. En el punto 5 se explica cada decisión con más detalle.

### Backend

Las rutas son relativas a `backend/src/main/java/com/backend/backend/`.

| ID | Archivo y línea | Regla / categoría reportada | Severidad | Clasificación | Justificación técnica | Dato o activo afectado | Consecuencia posible en producción | Propuesta de corrección |
|---|---|---|---|---|---|---|---|---|
| H01 | `BackendApplication.java:21` | `HS-JVM-1`: datos sensibles en logs, CWE-532 | INFO | Falso positivo | Imprime el literal `Backend iniciado!`, sin datos variables. | Estado de inicio del proceso. | No se identifica exposición de secretos. | Conservar el mensaje genérico, sin añadir credenciales. |
| H02 | `repositories/impl/CategoriaRepositoryImpl.java:68` | `HS-JVM-1`: datos sensibles en logs, CWE-532 | INFO | Falso positivo | Registra el error en el servidor y devuelve `null`. El cliente recibe `Categoría no encontrada.`. No se encontró que se agreguen credenciales al registro. | Detalles del error de consulta. | Si los logs incluyeran datos privados y se publicaran, podrían exponerlos. | Reducir el detalle del mensaje y restringir el acceso a los logs. |
| H03 | `repositories/impl/ProductoRepositoryImpl.java:43` | `HS-JAVA-63`: exposición mediante errores, CWE-209 | HIGH | Falso positivo | El catch señalado sólo devuelve `null`; no imprime ni propaga la excepción. | Diagnóstico del repositorio. | Pérdida de información de diagnóstico, pero no la fuga señalada por la regla. | Diferenciar falla interna y resultado vacío, con diagnóstico controlado. |
| H04 | `repositories/impl/SubCategoriaRepositoryImpl.java:39` | `HS-JAVA-63`: exposición mediante errores, CWE-209 | HIGH | Falso positivo | La traza de la excepción se imprime en el servidor. El cliente sólo recibe el mensaje genérico creado por el servicio. | Detalles internos del error de subcategorías. | Publicar los logs podría revelar esos detalles; la respuesta HTTP actual no los incluye. | Usar un logger y mantener los detalles del error fuera de la respuesta pública. |
| H05 | `repositories/impl/SubCategoriaRepositoryImpl.java:73` | `HS-JVM-1`: datos sensibles en logs, CWE-532 | INFO | Falso positivo | Imprime `Una subCategoria vino null`, sin documentos ni credenciales. | Estado de una operación. | No se identifica pérdida de confidencialidad. | Mantener información mínima en el mensaje. |
| H06 | `services/impl/ProductoServiceImpl.java:97` | `HS-JVM-1`: datos sensibles en logs, CWE-532 | INFO | Falso positivo | Registra un DTO con datos de catálogo también expuestos por los GET, sin claves ni datos personales. | Descripción, precio, stock e identificadores públicos del catálogo. | Podría divulgar información si el DTO incorporara campos reservados en el futuro. | Registrar ID y estado de la operación, evitando volcar todo el objeto. |
| H07 | `services/impl/SubCategoriaServiceImpl.java:75` | `HS-JVM-1`: datos sensibles en logs, CWE-532 | INFO | Falso positivo | Imprime el literal `Error al insertar la subcategoria`, sin incluir la entidad. | Resultado de la operación. | No se observa exposición de datos sensibles. | Utilizar un mensaje mínimo con identificador de correlación. |

### Frontend

Las rutas son relativas a `frontend/src/`.

| ID | Archivo y línea | Regla / categoría reportada | Severidad | Clasificación | Justificación técnica | Dato o activo afectado | Consecuencia posible en producción | Propuesta de corrección |
|---|---|---|---|---|---|---|---|---|
| H08 | `components/Home/FilterBar/FilterBar.jsx:24` | `HS-JAVASCRIPT-1`: datos sensibles en consola, CWE-532 | INFO | Falso positivo | Imprime un error del listado público de categorías. La consulta no agrega credenciales y no se encontró que la consola se reenvíe a terceros. | Error de la consulta de categorías. | El riesgo cambiaría si se agregaran credenciales al error o se enviara la consola a otro servicio. | Mostrar sólo un código y un mensaje genérico. |
| H09 | `components/Home/FilterBar/FilterBar.jsx:34` | `HS-JAVASCRIPT-1`: datos sensibles en consola, CWE-532 | INFO | Falso positivo | Consulta subcategorías públicas sin credenciales. Los errores previstos del servicio contienen mensajes genéricos. | Error de la consulta de subcategorías. | No se encontró exposición de datos privados en esta consulta. | Manejar los errores en un lugar común y registrar sólo lo necesario. |
| H10 | `components/Home/ItemListContainer/ItemList.jsx:18` | `HS-JAVASCRIPT-1`: datos sensibles en consola, CWE-532 | INFO | Falso positivo | La llamada a `console.log` está comentada y no se ejecuta. | Ninguno por esta línea. | No hay exposición en ejecución por ese comentario. | Eliminar el código comentado si ya no se utiliza. |
| H11 | `components/Home/ItemListContainer/ItemList.jsx:23` | `HS-JAVASCRIPT-1`: datos sensibles en consola, CWE-532 | INFO | Falso positivo | Imprime los filtros del catálogo elegidos por el usuario, sin credenciales ni envío a otro sistema. | Filtros de búsqueda. | El riesgo cambiaría si los filtros contuvieran datos sensibles o se recopilaran fuera del navegador. | Quitar los logs de depuración en producción. |
| H12 | `components/Home/ItemListContainer/ItemList.jsx:25` | `HS-JAVASCRIPT-1`: datos sensibles en consola, CWE-532 | INFO | Falso positivo | Registra una respuesta de catálogo público; el cliente Axios no incorpora cabeceras de autenticación. | Productos y configuración pública de la consulta. | Podría exponer información si el contrato o la configuración incorporan datos privados. | Evitar imprimir la respuesta completa y mantener sólo diagnóstico mínimo. |
| H13 | `components/ItemDetail/ItemDetailContainer.jsx:18` | `HS-JAVASCRIPT-1`: datos sensibles en consola, CWE-532 | INFO | Falso positivo | Consulta un producto público sin token. Si el ID es inválido o el producto no existe, imprime el error con un mensaje genérico. | Error e identificador del producto consultado. | No se encontró exposición de credenciales en este caso. | Mostrar un mensaje breve en lugar del objeto de error completo. |

## Preguntas para entregar

### 1. ¿Cuántos findings totales obtuviste?

Se obtuvieron **13 hallazgos: 7 en el backend y 6 en el frontend**. Dos tienen severidad HIGH y once INFO. El resumen de consola muestra sólo dos; al contar también las alertas informativas del JSON, el total es trece.

### 2. ¿Cuáles corresponden a los 20 verdaderos positivos?

En nuestro proyecto no se encontraron los 20 verdaderos positivos que plantea la consigna. Las 13 alertas se clasificaron como falsos positivos después de revisar qué datos se registran y cómo se manejan las respuestas. Las razones están en el punto 5.

### 3. ¿Qué categorías de vulnerabilidad diferentes encontraste?

Las alertas corresponden a dos categorías: **información sensible en logs o consola (CWE-532)** e **información expuesta mediante mensajes de error (CWE-209)**. En los casos revisados no se confirmó la exposición que indican esas reglas.

### 4. Elegí cinco verdaderos positivos y describí un escenario de impacto realista.

No se confirmaron verdaderos positivos entre las 13 alertas obtenidas. Por lo tanto, con estos resultados no se pueden seleccionar los cinco casos que pide la consigna.

### 5. Identificá todos los falsos positivos y explicá qué contexto hace que la regla no aplique.

La mayoría de las alertas aparecen por llamadas que escriben en los logs o en la consola. Para decidir si representan un problema, se revisó el contenido de cada mensaje y si podía exponer información privada.

**Backend**

- **H01 — Mensaje de inicio:** `BackendApplication.java` sólo imprime `Backend iniciado!`. La aplicación carga variables de entorno, pero ninguna se incluye en ese mensaje. Se considera falso positivo porque el texto no contiene claves ni datos personales.
- **H02 — Error de categoría:** `CategoriaRepositoryImpl.get()` registra la excepción en el servidor y devuelve `null`. Luego, `CategoriaServiceImpl.get()` responde con `Categoría no encontrada.`. En el código revisado no se encontró que se agreguen credenciales al registro, y la excepción original no llega al cliente. Por eso se clasificó como falso positivo; de todos modos, los logs del servidor deben tener acceso restringido.
- **H03 — Error al listar productos:** el bloque que señala Horusec sólo hace `return null`. No imprime ni devuelve el texto de la excepción. El servicio responde con `No se encontraron productos`, así que no expone los detalles internos del error. El manejo de errores puede mejorarse, pero no presenta la fuga que indica esta alerta.
- **H04 — Error de subcategoría:** `printStackTrace()` muestra los detalles del error en la salida del servidor. El cliente recibe `No se encontro la subcategoria seleccionada`, sin la traza de la excepción. Se considera falso positivo para la regla de exposición mediante respuestas de error porque esos detalles no se incluyen en la respuesta HTTP. Si los logs se publicaran o fueran accesibles sin autorización, habría que revisar esta clasificación.
- **H05 — Subcategoría nula:** se imprime el texto fijo `Una subCategoria vino null`. No se muestra el documento de Firestore ni sus datos. El mensaje sólo informa que faltó una subcategoría, por lo que no hay información sensible en esa línea.
- **H06 — Datos del producto:** se imprime un `ProductoDTO` con descripción, precio, stock, identificadores, imagen y estados del catálogo. Esos mismos datos se pueden consultar desde la API pública y el objeto no contiene contraseñas ni datos de clientes. Por eso se considera falso positivo. Aun así, conviene registrar sólo el identificador del producto para evitar problemas si más adelante se agregan campos privados.
- **H07 — Alta fallida:** el mensaje es `Error al insertar la subcategoria`. Es un texto fijo que no incluye la subcategoría enviada, las credenciales ni el detalle de la excepción. La llamada a la consola existe, pero su contenido no es sensible.

**Frontend**

- **H08 — Consulta de categorías:** el error corresponde a `GET /categoria/list`, que consulta información pública. Axios configura la URL base y `Content-Type`, sin agregar tokens ni credenciales. El error queda en la consola del navegador y no se encontró código que lo envíe a terceros. En esta consulta no se identificaron datos privados que justifiquen la alerta.
- **H09 — Consulta de subcategorías:** `GET /subCategoria/list` también es una consulta pública y no envía credenciales. Para los errores previstos, el servicio devuelve mensajes genéricos en lugar de la excepción de Firestore. Se clasificó como falso positivo porque el error registrado no muestra información privada en ese recorrido.
- **H10 — Código comentado:** la línea `console.log(filtroProductos)` está comentada. Horusec detectó el texto, pero JavaScript no lo ejecuta. Por lo tanto, esa línea no puede imprimir ni exponer datos.
- **H11 — Filtros de búsqueda:** la consola muestra los filtros de productos que eligió el propio usuario. No contienen credenciales y no se envían a otro sistema desde esa instrucción. Se considera falso positivo por tratarse de datos de la búsqueda del catálogo; de todas formas, el mensaje de depuración puede quitarse en producción.
- **H12 — Respuesta de productos:** `console.log(res)` imprime una respuesta de Axios con productos del catálogo público. La configuración de esa consulta no lleva cabeceras de autenticación y los datos ya están disponibles para el usuario. No se encontró un secreto en esa respuesta, aunque es preferible no imprimir el objeto completo.
- **H13 — Detalle del producto:** `getProducto(id)` consulta un producto público sin usar un token. Cuando el identificador es inválido o el producto no existe, `ProductoServiceImpl.get()` devuelve un mensaje genérico. El error que se imprime en el navegador no incluye, por ese recorrido, las credenciales del backend ni la clave usada para las altas.

La clasificación se basa en el código actual. No se probaron todos los errores posibles de las bibliotecas ni se revisaron los permisos de los logs en producción. Por eso, aunque estas alertas se consideren falsos positivos, sigue siendo recomendable reducir los mensajes de depuración y proteger los registros del servidor.

### 6. Elegí dos falsos positivos: ¿qué tendría que cambiar para que pasen a ser verdaderos positivos?

- **H01:** si se agregara la API key o las credenciales de Firebase al mensaje de inicio, esas claves quedarían guardadas en los logs. En ese caso sí habría información sensible registrada.
- **H12:** si la respuesta de Axios incluyera datos privados o cabeceras de autenticación y se siguiera imprimiendo completa, podría exponerlos a personas sin autorización para verlos, por ejemplo mediante un servicio que recopile la consola.

### 7. ¿Qué riesgo existe si se ignoran automáticamente los findings LOW o INFO?

Se podrían pasar por alto problemas reales. Por ejemplo, una regla de logs puede tener severidad INFO, pero si el mensaje contiene una contraseña, el riesgo es importante. Hay que revisar qué dato aparece y quién puede acceder a él, además de mirar la severidad.

### 8. ¿Por qué un análisis sin alertas no demuestra que el sistema sea seguro?

Porque la herramienta sólo encuentra los problemas que sus reglas pueden reconocer en los archivos analizados. Puede dejar pasar errores de permisos, de lógica de negocio o de configuración. Que no genere alertas significa que no detectó problemas, no que se hayan descartado todos.

### 9. ¿Qué controles complementarían a SAST en un pipeline DevSecOps?

Lo complementaría con revisión de código, análisis de dependencias de Gradle y npm, y detección de secretos. También agregaría pruebas de permisos y validación de entradas, revisión de la configuración y pruebas de seguridad sobre la aplicación en ejecución (DAST) en un entorno autorizado. En producción, mantendría monitoreo para detectar comportamientos fuera de lo esperado.

### 10. ¿Qué severidades usarías como Quality Gate en GitHub Actions y por qué?

Usaría **HIGH y CRITICAL** para bloquear la integración hasta revisar cada alerta, porque pueden señalar problemas de mayor impacto. Si se confirma la vulnerabilidad, habría que corregirla; si es un falso positivo, dejaría la justificación registrada. Las alertas MEDIUM, LOW e INFO también se revisarían según el riesgo del caso. Además, el job debería fallar si Horusec no termina correctamente o no genera el reporte, para no confundir un error de ejecución con un análisis sin hallazgos. Esta es la política propuesta; no se agregó un workflow en este trabajo.

## Ejecución

Se analizó cada proyecto por separado con la configuración del laboratorio y se guardaron los resultados en JSON. Los comandos equivalentes para Linux, desde la raíz del repositorio y con Horusec instalado, son:

```bash
horusec start -p ./backend --config-file-path ./material/Horusec/horusec-config.json \
  -o json -O ./TPs/TP2-Horusec/evidence/horusec-config-laboratorio-backend.json

horusec start -p ./frontend --config-file-path ./material/Horusec/horusec-config.json \
  -o json -O ./TPs/TP2-Horusec/evidence/horusec-config-laboratorio-frontend.json
```

Evidencia: [resultado del backend](evidence/horusec-config-laboratorio-backend.json), [resultado del frontend](evidence/horusec-config-laboratorio-frontend.json) y [datos de ejecución](evidence/ejecucion-config-laboratorio.json).

Estos resultados corresponden al análisis del código; no incluyen una auditoría de dependencias.
