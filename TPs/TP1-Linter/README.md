# TP1: Linter y gate de calidad

Este trabajo incorpora control de calidad estática para un repositorio con backend Java/Spring Boot y frontend React/Vite. Checkstyle y ESLint fueron configurados con reglas explícitas, se corrigieron los hallazgos de la línea base y se definió un workflow de GitHub Actions que ejecuta ambos controles de manera independiente.

## Resultado

| Área | Herramienta y versión | Verificación local | Resultado |
|---|---|---|---|
| Backend Java | Checkstyle 10.12.5 mediante Gradle | `./gradlew.bat checkstyleMain --no-daemon` con Java 17 | `BUILD SUCCESSFUL` |
| Frontend JavaScript/JSX | ESLint 8.57.0, con plugins React y React Hooks | `npm run lint` | Exit code 0, sin errores ni warnings |

La línea base registró **10 errores de Checkstyle en 6 archivos** y **14 hallazgos de ESLint: 13 errores y 1 warning**. Todos fueron corregidos sin deshabilitar reglas, ocultar archivos de fuente ni convertir los fallos en advertencias toleradas.

## Alcance y decisiones

El repositorio combina dos tecnologías con necesidades de análisis diferentes:

- **Backend:** Java con Spring Boot, controlado mediante Checkstyle integrado a Gradle.
- **Frontend:** JavaScript/JSX con React y Vite, controlado mediante ESLint.

Se eligieron estas herramientas porque permiten detectar problemas de estilo, estructura y convenciones cerca del momento de escritura, sin reemplazar las pruebas funcionales ni otros controles de calidad. PMD y SpotBugs no forman parte del alcance de este TP1.

## Checkstyle para el backend

### Configuración

- Configuración: [`backend/config/checkstyle/checkstyle.xml`](../../backend/config/checkstyle/checkstyle.xml).
- Integración: [`backend/build.gradle`](../../backend/build.gradle).
- Versión: Checkstyle `10.12.5`.
- Java de compilación y verificación: `17`.
- Política del gate: `ignoreFailures = false` y `maxWarnings = 0`.
- Comando local, ejecutado desde `backend/`:

  ```powershell
  .\gradlew.bat checkstyleMain --no-daemon
  ```

El comando conserva el fallo natural cuando existe una violación. De esta forma, el resultado no se oculta ni se transforma en un éxito artificial.

### Reglas principales y fundamento

| Grupo | Reglas | Decisión y propósito |
|---|---|---|
| Longitud y caracteres | `LineLength` (120), `FileTabCharacter` | Favorecer la lectura y mantener archivos consistentes. |
| Imports | `AvoidStarImport`, `RedundantImport`, `UnusedImports`, `ImportOrder` | Hacer explícitas y ordenadas las dependencias, eliminando imports innecesarios. |
| Nombres | `PackageName`, `TypeName`, `MemberName`, `MethodName`, `ParameterName`, `LocalVariableName`, `ConstantName` | Hacer predecible el significado de tipos, miembros y variables. |
| Visibilidad | `VisibilityModifier` | Evitar exposición accidental de miembros con visibilidad de paquete. |
| Estructura y formato | `NeedBraces`, reglas de llaves y espacios, `DeclarationOrder`, `ModifierOrder`, `EmptyBlock` | Clarificar el flujo y reducir errores de lectura sin imponer una reescritura funcional. |
| Javadoc | No habilitado en esta línea base | El código existente no documenta sistemáticamente sus APIs; activarlo ahora agregaría ruido fuera del objetivo principal. |

### Línea base y corrección

La evidencia inicial mostró **10 errores en 6 archivos**, principalmente por tabs, visibilidad y estructuras `if`/`else` sin llaves. También aparecieron mensajes de compilación de Lombok y de operaciones no verificadas; se mantuvieron separados porque no son violaciones de Checkstyle.

Las correcciones consistieron en:

- reemplazar tabs por espacios en `BackendApplication.java`;
- normalizar la inyección de dependencias en `SubCategoriasController.java` mediante campos privados finales y constructor;
- agregar llaves a las estructuras señaladas por `NeedBraces`.

La ejecución posterior con Java 17 terminó en `BUILD SUCCESSFUL`. La compilación puede seguir mostrando advertencias independientes de Lombok, pero no corresponden al resultado de Checkstyle.

## ESLint para el frontend

### Configuración

- Configuración: [`frontend/.eslintrc.cjs`](../../frontend/.eslintrc.cjs).
- Dependencias: ESLint `8.57.0`, `eslint-plugin-react` y `eslint-plugin-react-hooks`.
- Script: [`frontend/package.json`](../../frontend/package.json), mediante `npm run lint`.
- Exclusión: `frontend/dist/`, por contener código generado.
- Comando local, ejecutado desde `frontend/`:

  ```powershell
  npm run lint
  ```

La configuración utiliza `eslint:recommended`, `plugin:react/recommended` y `plugin:react-hooks/recommended`, con módulos ES2021, JSX, entorno de navegador, detección automática de React y el runtime JSX moderno. `react/react-in-jsx-scope` está deshabilitada porque React 17+ no requiere importar React para cada archivo JSX.

### Reglas principales y fundamento

| Regla | Propósito |
|---|---|
| `no-unused-vars` | Eliminar variables y parámetros sin uso que dificultan el mantenimiento. |
| `eqeqeq` | Exigir comparaciones explícitas y evitar coerciones inesperadas. |
| `curly` | Hacer visibles los bloques de control y reducir errores al modificarlos. |
| `no-var` | Usar declaraciones con semántica de alcance adecuada. |
| `prefer-const` | Expresar que una referencia no se reasigna. |
| Reglas de React y React Hooks | Detectar errores frecuentes de componentes, JSX y dependencias de efectos. |

No se agregaron reglas de formato masivas: el objetivo fue detectar problemas de calidad estática relevantes sin convertir el TP en una reescritura visual del frontend. `react/prop-types` quedó fuera de esta línea base porque los componentes existentes no utilizan PropTypes de forma sistemática.

### Línea base y corrección

La línea base registró **14 hallazgos: 13 errores y 1 warning**. Incluía variables sin uso, comparaciones no estrictas, variables que podían ser `const`, propiedades `class` en JSX y una advertencia sobre dependencias de `useEffect`.

Se corrigieron sin debilitar la configuración, entre otros, los siguientes puntos:

- `Carousel.jsx`: callback estable, dependencias completas del efecto y limpieza del intervalo.
- `FilterBar.jsx`: eliminación de estado sin uso, comparaciones explícitas y uso de `const`.
- `ItemList.jsx` y `ItemListContainer.jsx`: eliminación de parámetros sin uso.
- `CartWidget.jsx` y `context.jsx`: cambio a `const` cuando no había reasignación.
- `SearchBar.jsx`: eliminación de destructuring sin uso y reemplazo de `class` por `className`.

La verificación final con `npm run lint` terminó con exit code 0, sin errores ni warnings.

## Workflow de GitHub Actions

El workflow está definido en [`.github/workflows/quality-gate.yml`](../../.github/workflows/quality-gate.yml). Su diseño mantiene jobs independientes para que el resultado del backend no oculte el del frontend:

| Job | Entorno y pasos | Evidencia generada |
|---|---|---|
| `checkstyle` | Ubuntu, Java Temurin 17, Gradle y `./gradlew checkstyleMain --no-daemon` desde `backend/` | Job Summary con archivos y violaciones; artifacts HTML/XML `checkstyle-reports`. |
| `frontend-eslint` | Ubuntu, Node.js 20, `npm ci` y `npm run lint` desde `frontend/` | Job Summary con archivos, errores y warnings; artifact JSON `eslint-reports`. |

El workflow se dispara en cualquier `push` y en Pull Requests cuyo destino sea `main` o `develop`. Declara únicamente `contents: read`, prepara el wrapper de Gradle para Linux y usa pasos `if: always()` para conservar summaries y reportes aunque el linter falle. No utiliza `continue-on-error`: una salida distinta de cero mantiene el job fallido.

La [ejecución remota de línea base](https://github.com/SoftwareQualityUnc/SoftwareQuality/actions/runs/35541760139) y la captura [`assets/checkstyle-fail.png`](./assets/checkstyle-fail.png) son evidencias concretas del fallo inicial. La configuración local del workflow demuestra qué solicitará GitHub Actions; por sí sola no demuestra que la ejecución remota actual sea exitosa ni que exista protección de ramas.

## Relación con ISO 25000 e ISO/IEC 25010

ISO 25000 reúne normas para gestionar y evaluar la calidad de productos de software. Dentro de esa familia, ISO/IEC 25010 define un modelo de calidad que sirve como referencia para especificar, medir y evaluar características del producto. La edición 2023 presenta el modelo vigente de calidad de producto; la edición 2011 es la referencia conceptual utilizada para explicar sus características y subcaracterísticas en este TP.

El aporte principal de linters como Checkstyle y ESLint se relaciona con **mantenibilidad**, especialmente:

- **Analizabilidad:** convenciones uniformes, imports claros, nombres previsibles y bloques explícitos facilitan comprender el código y localizar problemas.
- **Modificabilidad:** reglas como `NeedBraces`, `prefer-const`, `eqeqeq` y las validaciones de Hooks reducen ambigüedades y riesgos al cambiar código existente.
- **Testabilidad:** una estructura más consistente y componentes con dependencias de efectos explícitas facilitan aislar unidades y razonar sobre su comportamiento durante las pruebas.

El valor del TP consiste en detectar temprano incumplimientos repetibles, antes de que lleguen a una revisión o integración, y en mantener una base de código más consistente. Sin embargo, un linter **no demuestra por sí solo** toda la calidad ISO: no prueba el comportamiento funcional, la seguridad, el rendimiento, la compatibilidad ni la satisfacción de requisitos. Es un control estático complementario dentro de una estrategia de calidad más amplia.

### Contexto argentino

[IRAM representa a Argentina ante ISO](https://www.iso.org/member/1520.html). En términos generales, las normas técnicas se aplican voluntariamente, salvo que una autoridad competente disponga lo contrario. Por eso, este documento utiliza ISO/IEC 25010 como marco de referencia para analizar la calidad del producto, sin afirmar una adopción nacional específica de la norma. El [Centro de Documentación IRAM](https://www.iram.org.ar/venta-de-normas) informa sobre el acceso y el carácter de las normas disponibles.

## Alcance y limitaciones

### Incluido

- Calidad estática de Java mediante Checkstyle y de JavaScript/JSX mediante ESLint.
- Corrección de la línea base sin desactivar reglas ni ocultar hallazgos.
- Automatización declarada en GitHub Actions, con jobs, summaries y artifacts separados.
- Relación argumentada con mantenibilidad en el modelo de calidad de ISO/IEC 25010.

### No demostrado por este TP

- **Pruebas funcionales:** no se presentan como ejecutadas por las verificaciones de linters.
- **Seguridad:** Checkstyle y ESLint no sustituyen análisis de vulnerabilidades ni revisión de seguridad.
- **Protección de ramas:** no se afirma que `main` tenga branch protection, bloqueo de commits directos o checks obligatorios para hacer merge.
- **Ejecución remota exitosa actual:** el run enlazado documenta la línea base fallida; la evidencia de éxito presentada en este documento es local.

## Fuentes

- [ISO/IEC 25010:2023 — Product quality model](https://www.iso.org/standard/78176.html).
- [ISO/IEC 25010:2011 — Systems and software quality models](https://www.iso.org/standard/35733.html).
- [ISO — IRAM, miembro que representa a Argentina](https://www.iso.org/member/1520.html).
- [Centro de Documentación IRAM](https://www.iram.org.ar/venta-de-normas).

## Archivos relevantes

- [`backend/config/checkstyle/checkstyle.xml`](../../backend/config/checkstyle/checkstyle.xml): reglas de Checkstyle.
- [`backend/build.gradle`](../../backend/build.gradle): versión e integración de Checkstyle.
- [`frontend/.eslintrc.cjs`](../../frontend/.eslintrc.cjs): reglas de ESLint.
- [`frontend/package.json`](../../frontend/package.json): script `npm run lint` y dependencias.
- [`.github/workflows/quality-gate.yml`](../../.github/workflows/quality-gate.yml): gate automatizado.
- [`assets/checkstyle-fail.png`](./assets/checkstyle-fail.png): captura de la línea base fallida.
