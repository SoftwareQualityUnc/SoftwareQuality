# TP3: Análisis de calidad con SonarQube

En este trabajo se analizó el backend y el frontend del ecommerce con SonarQube. Se registró el estado inicial, se seleccionaron problemas de seguridad, confiabilidad y mantenibilidad, y se corrigieron varios de ellos. Después se ejecutaron las pruebas y un nuevo análisis para comparar los resultados.

## Funcionalidad y pruebas

El proyecto incluye un catálogo de productos, filtros por categoría y descripción, detalle de producto y carrito. Para comprobar esas funciones se usaron pruebas de componentes y de la API: búsqueda de productos, enlaces al detalle, manejo de errores, cantidades y total del carrito, autorización y validación de altas. Las consultas a la base de datos se simularon en las pruebas.

Se comprobaron dos errores con efecto visible: una lista vacía podía mostrar un `0`, y dos altas consecutivas en el carrito podían perder una actualización. Esto muestra por qué una interfaz que funciona en los casos habituales no alcanza para asegurar la calidad del código.

Inicialmente había **21 pruebas Java, con 6 fallos**, y el frontend no tenía pruebas. Algunas pruebas Java estaban vacías o comprobaban un objeto simulado en lugar del repositorio real. Tener archivos de prueba no garantizaba que se estuviera verificando el comportamiento de la aplicación.

## A. Panorama general

| Métrica | Inicial | Después de las correcciones |
|---|---:|---:|
| Bugs / confiabilidad | 15 | 2 |
| Vulnerabilities / seguridad | 5 | 0 |
| Code Smells / mantenibilidad | 35 | 23 |
| Security Hotspots | 0 | 0 |
| Cobertura global | 7,9 % | 33,1 % |
| Líneas duplicadas | 40 | 28 |
| Porcentaje de duplicación | 1,6 % | 1,1 % |
| Complejidad ciclomática | 231 | 230 |
| Complejidad cognitiva | 124 | 129 |
| Pruebas Java | 21, con 6 fallos | 62, sin fallos |
| Pruebas del frontend | 0 | 9, sin fallos |

La cobertura inicial se obtuvo de la ejecución que tenía seis pruebas fallidas. SonarQube cuenta las 62 pruebas Java importadas; las nueve del frontend se verifican en la salida de Vitest y aportan cobertura mediante LCOV.

El total de hallazgos abiertos bajó de **55 a 25**. Los nombres y categorías de la tabla son los informados por SonarQube. Las alertas de seguridad correspondían a trazas de depuración; su presencia no demuestra por sí sola que un cliente pudiera acceder a los logs.

Registro de resultados: [análisis inicial](evidence/analisis-inicial.json) y [análisis final](evidence/analisis-final.json).

## B y C. Hallazgos seleccionados y efecto sobre el producto

Las líneas de esta tabla corresponden al análisis inicial. Las rutas Java parten de `backend/src/` y las del frontend, de `frontend/src/`.

| Archivo y línea inicial | Hallazgo | Categoría / severidad | ¿Por qué importa y qué función afecta? |
|---|---|---|---|
| `main/java/com/backend/backend/repositories/impl/ProductoRepositoryImpl.java:109` | Traza de excepción mediante `printStackTrace()` — `java:S4507` | Seguridad / MINOR | Los errores de búsqueda imprimían detalles internos del servidor. Se reemplazó la traza por un mensaje controlado. |
| `main/java/com/backend/backend/repositories/impl/SubCategoriaRepositoryImpl.java:40` | Traza de excepción mediante `printStackTrace()` — `java:S4507` | Seguridad / MINOR | La consulta de una subcategoría dejaba información de depuración en los registros. También se corrigieron las otras tres llamadas de esta clase. |
| `main/java/com/backend/backend/repositories/impl/CategoriaRepositoryImpl.java:40` | Interrupción capturada sin restaurarla — `java:S2142` | Confiabilidad / MAJOR | Al cancelar una operación de base de datos, el hilo perdía la señal de interrupción. Se corrigieron los once casos de los repositorios. |
| `main/java/com/backend/backend/repositories/impl/CategoriaRepositoryImpl.java:41` | Devolver `null` como colección — `java:S1168` | Mantenibilidad / MAJOR | Obligaba a tratar dos representaciones de un resultado sin elementos al listar categorías. Se normalizó el retorno de las cinco consultas afectadas. |
| `components/Cart/Cart.jsx:19` | Índice del arreglo como clave de React — `javascript:S6479` | Mantenibilidad / MAJOR | Al eliminar un producto, React podía reutilizar una fila para otro elemento. Ahora se usa el identificador del producto. |
| `context/context.jsx:15` | Uso de `map` sin utilizar su resultado — `javascript:S2201` | Mantenibilidad / MAJOR | El carrito modificaba objetos del estado anterior. Se reemplazó por actualizaciones que crean nuevos objetos y conservan las altas consecutivas. |
| `components/Home/ItemListContainer/ItemList.jsx:37` | Condición numérica en JSX — `javascript:S6439` | Confiabilidad / MAJOR | Un catálogo sin productos podía imprimir `0` en la pantalla. Ahora se renderiza directamente la lista. |
| `test/java/com/backend/backend/repositories/impl/CategoriaRepositoryImplTest.java:42,47` | Pruebas vacías — `java:S1186` | Mantenibilidad / CRITICAL | Las altas y los listados parecían tener pruebas, pero esos métodos no verificaban nada. Se agregaron comprobaciones sobre el repositorio real con Firestore simulado. |
| `main/java/com/backend/backend/controllers/ProductoController.java:69–89` y `services/impl/ProductoServiceImpl.java:51–71` | Validación de producto repetida | Duplicación / sin severidad de regla | Había dos copias de las validaciones de alta. Se dejó una sola en el servicio, compartida por altas individuales y múltiples. |
| `main/java/com/backend/backend/controllers/ProductoController.java` | Complejidad cognitiva de 15 y ciclomática de 21 | Métrica de complejidad / sin severidad | El controlador mezclaba autorización, validación y respuesta. Al delegar la validación, sus métricas bajaron a 6 y 12. |
| `context/context.jsx` e `ItemList.jsx` | Cobertura inicial de 0 % | Cobertura / sin severidad de regla | No se verificaban automáticamente el total del carrito ni la carga del catálogo. La cobertura de SonarQube pasó a 95,7 % y 100 %, respectivamente. |

## D. Correcciones y verificación

Se hicieron las siguientes correcciones:

1. Restaurar la interrupción del hilo en las once operaciones de repositorio señaladas.
2. Reemplazar las cinco trazas de depuración por mensajes controlados, sin imprimir la excepción completa.
3. Devolver colecciones vacías en las cinco consultas que retornaban `null`.
4. Quitar las validaciones duplicadas del controlador y conservarlas en el servicio.
5. Usar identificadores estables en las listas de productos y del carrito.
6. Actualizar el carrito sin modificar el estado anterior ni perder altas consecutivas.
7. Corregir la lista vacía y manejar los errores de búsqueda. También se evita que una respuesta vieja reemplace los resultados de un filtro más reciente.
8. Reemplazar las pruebas vacías y corregir la inicialización duplicada de Mockito, que dejaba al servicio usando un objeto simulado distinto del configurado por la prueba.

El análisis final dejó de reportar **30 hallazgos iniciales**, sin desactivar reglas ni marcar alertas como aceptadas. El [detalle de las correcciones](evidence/correcciones.json) conserva sus identificadores, reglas y ubicaciones originales.

Pasaron las **62 pruebas Java**, las **9 pruebas del frontend**, Checkstyle, ESLint y ambas compilaciones. La [verificación](evidence/validacion.txt) contiene los resultados de los comandos.

No todas las métricas bajaron. La complejidad cognitiva global pasó de 124 a 129 al agregar caminos explícitos para interrupciones y errores, aunque la del controlador de productos se redujo. También quedan 28 líneas duplicadas entre repositorios, 2 problemas de confiabilidad y 23 de mantenibilidad.

La cobertura global sigue siendo baja: faltan pruebas de varias pantallas, métodos de controladores y operaciones de repositorio. El aumento no implica que se hayan probado todos los casos.

## E. Conclusiones

### 1. ¿Qué problemas encontró SonarQube que no eran evidentes al usar la aplicación?

Las interrupciones ignoradas, las trazas de depuración, las validaciones duplicadas y las pruebas vacías. Son problemas que no se descubren simplemente mirando el catálogo o agregando un producto al carrito.

### 2. ¿Qué diferencia existe entre que el software funcione y que tenga buena calidad interna?

Que funcione significa que permite completar una operación. La calidad interna también depende de cómo maneja errores, organiza las responsabilidades y verifica su comportamiento. Una compra puede parecer correcta mientras el código sigue siendo difícil de mantener o falla ante una situación menos frecuente.

### 3. ¿Qué hallazgo considerás más riesgoso para un producto real y por qué?

La pérdida de interrupciones en los repositorios. Afectaba once operaciones y podía impedir que una cancelación se respetara correctamente. Se corrigió y se agregaron pruebas que comprueban que la señal de interrupción se conserva.

### 4. ¿Qué métrica cambió más después de la refactorización?

La cobertura tuvo el mayor aumento: pasó de 7,9 % a 33,1 %, una mejora de 25,2 puntos porcentuales. En cantidad de alertas, la mayor reducción fue en confiabilidad: de 15 a 2. Las alertas de seguridad bajaron de 5 a 0.

### 5. ¿Qué problemas no se solucionan simplemente aumentando la cobertura?

La duplicación, la complejidad, el manejo incorrecto de errores y una autorización mal implementada. Una prueba puede ejecutar esas líneas sin comprobar que su comportamiento sea correcto. Por eso se necesitan buenas aserciones y revisión del código, además del porcentaje de cobertura.

### 6. ¿Un Quality Gate tendría sentido? ¿Qué condiciones mínimas exigirías?

Sí. Exigiría compilación y pruebas sin fallos, ningún problema nuevo de seguridad o confiabilidad sin resolver, cobertura de al menos 80 % en código nuevo y duplicación menor al 3 % en ese código. Los Security Hotspots deberían estar revisados.

El Quality Gate de SonarQube quedó en "OK", pero evalúa el código nuevo y no elimina la deuda del código existente. También convendría exigir que la cobertura global no retroceda y planificar cómo aumentarla.

## Ejecución y evidencia

Se usaron la [configuración de SonarQube](sonar-project.properties) y el [servicio local](docker-compose.sonar.yml) para analizar ambos módulos y registrar los resultados.

```bash
docker compose -p softwarequality-tp3 -f TPs/TP3-SonarQube/docker-compose.sonar.yml up -d
cd backend
./gradlew test jacocoTestReport checkstyleMain sonarLibraries bootJar
cd ../frontend
npm ci
npm run test:coverage
npm run lint
npm run build
cd ..
sonar-scanner -Dproject.settings=TPs/TP3-SonarQube/sonar-project.properties \
  -Dsonar.host.url=http://localhost:9001
```

Antes del análisis se debe crear el proyecto `softwarequality-tp3` en SonarQube y definir `SONAR_TOKEN` en el entorno, sin guardarlo en el repositorio.

Referencias:

- [Estado inicial](evidence/analisis-inicial.json).
- [Estado final](evidence/analisis-final.json).
- [Hallazgos corregidos](evidence/correcciones.json).
- [Verificación de pruebas y compilaciones](evidence/validacion.txt).
- Cobertura Java: [inicial](evidence/jacoco-inicial.xml) y [final](evidence/jacoco-final.xml).
- Cobertura del frontend: [inicial](evidence/lcov-inicial.info) y [final](evidence/lcov-final.info).
