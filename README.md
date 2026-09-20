> **Contexto:** Este repositorio fue clonado y unificado a partir de un proyecto de la materia Ingeniería de Software de años anteriores. En condiciones normales no se recomienda mantener el backend y el frontend en un mismo repositorio; en este caso se conservaron juntos de manera intencional para simplificar el trabajo y la ejecución del proyecto.

# MVC Ecommerce

Aplicación web de comercio electrónico con un backend en Spring Boot que consulta Firebase/Firestore y un frontend en React. El backend fue reorganizado en el módulo `backend/` y el frontend se mantiene en `frontend/`.

## Inicio rápido

### 1. Preparar las credenciales del backend

El backend necesita estas variables, sin publicar sus valores. La plantilla se encuentra en `backend/src/main/resources/template.env`.

Desde la raíz del repositorio, copiar la plantilla y renombrarla como `.env`:

```powershell
Copy-Item backend/src/main/resources/template.env backend/src/main/resources/.env
```

Luego editar `backend/src/main/resources/.env` y reemplazar todos los valores de ejemplo por las credenciales locales reales:

- `API_KEY_INSERT`: clave utilizada para autorizar las operaciones de alta.
- `GOOGLE_APPLICATION_CREDENTIALS`: contenido JSON de las credenciales de servicio de Firebase, en una sola línea.

El código carga el archivo `.env` desde `backend/src/main/resources/`. También se pueden definir las variables en el entorno de la terminal. No se deben subir claves, JSON de credenciales ni archivos `.env` al repositorio; `template.env` es únicamente una guía sin secretos reales.

### 2. Iniciar el backend

Desde la raíz:

```powershell
cd backend
.\gradlew.bat bootRun
```

Antes de ejecutar el comando, configurar las variables requeridas en la terminal o en `backend/src/main/resources/.env`.

### 3. Iniciar el frontend

En otra terminal, desde la raíz:

```powershell
cd frontend
npm install
npm run dev
```

El frontend usa `VITE_API_BASE_URL` para localizar la API. Si no se define, el valor local predeterminado del código es `http://localhost:8080/api/v1`. Para establecerlo explícitamente, crear `frontend/.env.local` con un valor apropiado:

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Para trabajar con ambos módulos a la vez, mantener el backend ejecutándose en una terminal y el frontend en otra. No se requiere un orquestador adicional.

## Propósito y decisión de arquitectura

El proyecto ofrece una tienda web con navegación de productos, categorías, subcategorías, detalle de producto y carrito.

La decisión actual es mantener una arquitectura full-stack unificada:

- **Backend:** Spring Boot 3.2.4, Java 17 como compatibilidad declarada por Gradle y Firebase Admin/Firestore.
- **Frontend:** React 18 con Vite 5.
- **Repositorio:** ambos módulos viven en el mismo repositorio, pero conservan sus comandos, dependencias y directorios de trabajo separados.

Esta organización prioriza la simplicidad para el contexto académico actual; no implica que el repositorio esté preparado para producción.

## Estructura

```text
.
├── backend/
│   ├── src/main/java/com/backend/backend/
│   │   ├── controllers/       # Controladores REST
│   │   ├── dto/               # Objetos de transferencia
│   │   ├── error/             # Excepciones y respuestas de error
│   │   ├── firebase/          # Inicialización de Firebase
│   │   ├── repositories/      # Acceso a Firestore
│   │   └── services/          # Servicios de aplicación
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── src/test/              # Pruebas existentes del módulo
│   ├── build.gradle
│   ├── gradlew / gradlew.bat
│   └── gradle/wrapper/        # Gradle Wrapper 8.7
├── frontend/
│   ├── src/api/               # Cliente Axios y llamadas a la API
│   ├── src/components/        # Componentes de la interfaz
│   ├── src/context/           # Estado compartido
│   ├── src/App.jsx
│   ├── package.json
│   └── vite.config.js
├── Linter/                    # Herramienta auxiliar Python presente en el repositorio
└── .github/workflows/         # Flujos de automatización existentes
```

## Prerrequisitos y configuración

Antes de ejecutar el proyecto, instalar las herramientas de esta tabla. Las versiones corresponden a la configuración actual del repositorio:

| Herramienta | Versión requerida o recomendada | Uso |
|---|---|---|
| Git | Versión estable actual | Clonar el repositorio y consultar cambios |
| JDK | Java 17 | Compilar y ejecutar el backend |
| Gradle | 8.7 mediante Gradle Wrapper | Ejecutar el backend; no hace falta instalar Gradle globalmente |
| Node.js | 18 o superior | Ejecutar Vite y las herramientas del frontend |
| npm | El incluido con Node.js | Instalar las dependencias del frontend |
| Firebase | Proyecto con Firestore habilitado | Persistencia del backend |

Versiones principales declaradas por el proyecto:

- Backend: Spring Boot `3.2.4`, Java `17`, Gradle Wrapper `8.7`.
- Frontend: React `18.2.0`, Vite `5.2.0` y React Router `6.23.1`.

### Comprobar las herramientas instaladas

Desde PowerShell o una terminal equivalente:

```powershell
git --version
java -version
node --version
npm --version
```

También se puede comprobar el runtime que utilizará Gradle desde `backend/`:

```powershell
cd backend
.\gradlew.bat --version
```

La salida debe mostrar JVM 17. Si aparece Java 25 u otra versión incompatible, configurar `JAVA_HOME` para apuntar a una instalación de JDK 17 antes de ejecutar Gradle:

```powershell
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-17"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
```

La ruta es un ejemplo: debe reemplazarse por la ubicación real del JDK 17 instalado.

### Instalar las herramientas

En Windows se pueden instalar Git, Node.js LTS y un JDK 17 desde sus sitios oficiales o mediante `winget`:

```powershell
winget install Git.Git
winget install OpenJS.NodeJS.LTS
```

Para Java, instalar una distribución de JDK 17, por ejemplo Microsoft OpenJDK, Eclipse Temurin u otra distribución compatible. No es necesario instalar Gradle globalmente: el proyecto incluye `gradlew` y `gradlew.bat` junto con el Gradle Wrapper 8.7.

En Linux o macOS, instalar Git, Node.js LTS y un JDK 17 mediante el gestor de paquetes de la distribución o las instrucciones oficiales de cada herramienta. Luego repetir los comandos de comprobación anteriores, utilizando `./gradlew` en lugar de `gradlew.bat`.

### Configurar Firebase y las variables del backend

El backend requiere un proyecto de Firebase con Firestore habilitado y estas variables, sin publicar sus valores:

- `API_KEY_INSERT`: clave privada de la aplicación para autorizar las operaciones de alta.
- `GOOGLE_APPLICATION_CREDENTIALS`: contenido JSON de las credenciales de servicio de Firebase.

Copiar la plantilla y renombrarla como `.env`:

```powershell
Copy-Item backend/src/main/resources/template.env backend/src/main/resources/.env
```

Después, editar `backend/src/main/resources/.env` y reemplazar los valores de ejemplo por las credenciales locales reales. El backend carga ese archivo desde `src/main/resources/`. El archivo `.env` está ignorado por Git; `template.env` no contiene secretos y sí debe permanecer en el repositorio.

El valor de `GOOGLE_APPLICATION_CREDENTIALS` se interpreta como JSON de credenciales, no como una ruta de archivo. No hace falta instalar Firebase CLI para ejecutar este backend.

## API REST

La base de rutas es `/api/v1`. El frontend utiliza actualmente las rutas marcadas como **uso actual**.

| Recurso | Método y ruta | Uso |
|---|---|---|
| Categorías | `GET /categoria/list` | **Uso actual:** listar categorías |
| Categorías | `GET /categoria/{idCategoria}` | Consulta individual |
| Categorías | `GET /categoria/getAllCategoriasConSubCategorias` | Categorías con subcategorías |
| Categorías | `POST /categoria/new` | Alta protegida por `Authorization: Bearer ...` |
| Subcategorías | `GET /subCategoria/list` | **Uso actual:** listar subcategorías |
| Subcategorías | `GET /subCategoria/{idSubCategoria}` | Consulta individual |
| Subcategorías | `GET /subCategoria/getPorIdCategoria/{idCategoria}` | Consulta por categoría |
| Subcategorías | `POST /subCategoria/new` | Alta protegida por API key |
| Subcategorías | `POST /subCategoria/newMultiple` | Alta múltiple protegida por API key |
| Productos | `GET /producto/getProductosPorFiltro` | **Uso actual:** filtros `idCategoria`, `idSubCategoria` y `descrip` |
| Productos | `GET /producto/{idProducto}` | **Uso actual:** detalle de producto |
| Productos | `GET /producto/list` | Listado completo |
| Productos | `POST /producto/new` | Alta protegida por API key |
| Productos | `POST /producto/newMultiple` | Alta múltiple protegida por API key |

Las llamadas del frontend se construyen sobre `VITE_API_BASE_URL`, que ya incluye `/api/v1`. Las operaciones `POST` de alta validan el encabezado de autorización en el backend.

## Comandos de calidad

Los siguientes comandos están definidos por la configuración actual y no ejecutan la suite de pruebas:

### Backend

Desde `backend/`:

```powershell
.\gradlew.bat compileJava
.\gradlew.bat checkstyleMain
```

El proyecto usa Checkstyle 10.12.5 y falla si quedan advertencias según su configuración. La ejecución puede requerir ajustar el JDK local a una versión compatible con Gradle 8.7.

### Frontend

Desde `frontend/`:

```powershell
npm run lint
npm run build
```

`lint` ejecuta ESLint y `build` genera la compilación de Vite. La suite de pruebas y su estabilización quedan planificadas para una etapa posterior y no forman parte de este refactor de organización del repositorio.

## Limitaciones y próximos pasos

- La configuración actual está orientada al desarrollo local y no constituye una declaración de preparación para producción.
- El backend permite CORS para el origen local `http://localhost:5173`; cualquier despliegue requiere revisar esta configuración.
- Las credenciales de Firebase y la API key deben incorporarse mediante configuración segura del entorno.
- La cobertura y ejecución formal de pruebas requieren una etapa posterior.
- Conviene documentar y automatizar en el futuro una forma segura de iniciar ambos módulos y validar sus contratos de integración.
