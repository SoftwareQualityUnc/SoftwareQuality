# Soporte360 — Laboratorio de SonarQube

## Contexto

**Soporte360** es una aplicación web funcional de mesa de ayuda construida con **React + TypeScript**. Desde el punto de vista de un usuario, permite iniciar sesión, ver un dashboard, administrar tickets, crear nuevos casos, responder a clientes, cambiar estados y responsables, filtrar la bandeja, exportar tickets y consultar clientes.

La aplicación fue preparada como laboratorio para **Gestión de la Calidad de Software**. El sistema funciona y su interfaz parece la de un producto normal, pero la base de código contiene decisiones de implementación que merecen ser analizadas.

> El objetivo no es buscar problemas mirando la UI. El objetivo es comprobar que un software puede verse bien y cumplir su función, y aun así tener problemas de mantenibilidad, confiabilidad o seguridad que un análisis estático puede ayudar a descubrir.

---

## Parte 1 — Ejecutar la aplicación como usuario

Requisitos: Node.js 20+ y npm.

```bash
npm install
npm run dev
```

Abrir la URL indicada por Vite, normalmente:

```text
http://localhost:5173
```

Las credenciales de demostración ya aparecen cargadas en el formulario. Presionar **Ingresar**.

### Recorrido funcional obligatorio

Antes de usar SonarQube, utilizar la aplicación durante unos minutos:

1. Revisar el dashboard y abrir alguno de los tickets prioritarios.
2. Entrar en **Tickets** y probar la búsqueda y los filtros.
3. Abrir un ticket y cambiar su estado o responsable.
4. Escribir una respuesta al cliente.
5. Crear un ticket nuevo desde **Nuevo ticket**.
6. Volver a la bandeja y verificar que el ticket exista.
7. Exportar la lista de tickets en CSV.
8. Entrar en **Clientes** y revisar las cuentas disponibles.

Responder antes del análisis:

- ¿La aplicación parece funcional?
- ¿Encontraste algún problema evidente solamente usando la interfaz?
- ¿Podrías afirmar, basándote solamente en la UI, que el código es seguro y mantenible? ¿Por qué?

---

## Parte 2 — Ejecutar las pruebas y generar cobertura

```bash
npm run test
npm run test:coverage
```

Luego observar el reporte de cobertura en la terminal.

Preguntas:

- ¿La existencia de algunos tests implica necesariamente buena cobertura?
- ¿Qué partes importantes de la aplicación no parecen estar cubiertas?

---

## Parte 3 — Levantar SonarQube localmente

Este laboratorio utiliza **SonarQube Community Build en Docker**. No requiere SonarCloud ni una cuenta en una plataforma externa.

Levantar el servidor:

```bash
docker compose -f docker-compose.sonar.yml up -d sonarqube
```

Esperar unos minutos y abrir:

```text
http://localhost:9000
```

En una instalación nueva las credenciales iniciales suelen ser:

```text
usuario: admin
contraseña: admin
```

SonarQube solicitará cambiar la contraseña.

---

## Parte 4 — Crear el proyecto y token

En SonarQube:

1. Crear un proyecto local/manual.
2. Usar como project key:

```text
soporte360-lab
```

3. Generar un token para ejecutar el análisis.
4. Guardarlo temporalmente en la terminal:

```bash
export SONAR_TOKEN="PEGAR_TOKEN_AQUI"
```

No guardar el token real dentro del repositorio.

---

## Parte 5 — Analizar el proyecto

Con SonarQube en ejecución y `SONAR_TOKEN` definido:

```bash
docker compose -f docker-compose.sonar.yml run --rm scanner
```

Al terminar, volver a `http://localhost:9000` y abrir el proyecto **Soporte360**.

---

# Actividad de análisis

No corregir los problemas inmediatamente. Primero realizar un diagnóstico.

## A. Panorama general

Registrar los valores que SonarQube muestre para:

- Bugs / Reliability
- Vulnerabilities / Security
- Code Smells / Maintainability
- Security Hotspots
- Coverage
- Duplicated Lines
- Complexity / Cognitive Complexity cuando corresponda

Tomar una captura del estado inicial.

## B. Elegir hallazgos concretos

Buscar ejemplos reales dentro del código y completar una tabla como esta:

| Archivo | Hallazgo | Categoría | Severidad | ¿Por qué importa? |
|---|---|---|---|---|
| `...` | `...` | Bug / Vulnerability / Smell / Hotspot | `...` | `...` |

Seleccionar al menos:

- 3 problemas de mantenibilidad.
- 2 problemas relacionados con seguridad.
- 1 fragmento con complejidad elevada.
- 1 caso de duplicación o lógica repetida.
- 1 problema relacionado con cobertura de pruebas.

## C. Relacionar el hallazgo con el software

Para cada problema elegido, explicar qué funcionalidad visible de Soporte360 podría verse afectada. Ejemplos de áreas funcionales:

- inicio de sesión;
- dashboard;
- cálculo de riesgo SLA;
- creación de tickets;
- conversación con el cliente;
- filtros y búsqueda;
- exportación CSV;
- almacenamiento local de datos.

La explicación debe conectar **código → riesgo técnico → efecto posible sobre el producto**.

## D. Refactorización

Corregir al menos **6 hallazgos**, intentando cubrir varias categorías y no solamente problemas de estilo.

Después:

```bash
npm run build
npm run test:coverage
docker compose -f docker-compose.sonar.yml run --rm scanner
```

Comparar el nuevo análisis con el inicial.

## E. Conclusión

Responder:

1. ¿Qué problemas encontró SonarQube que no eran evidentes al usar la aplicación?
2. ¿Qué diferencia existe entre que el software "funcione" y que tenga buena calidad interna?
3. ¿Qué hallazgo considerás más riesgoso para un producto real y por qué?
4. ¿Qué métrica cambió más después de la refactorización?
5. ¿Qué problemas no se solucionan simplemente aumentando la cobertura?
6. ¿Un Quality Gate tendría sentido para este proyecto? Definir qué condiciones mínimas exigirías.

---

## Detener el laboratorio

```bash
docker compose -f docker-compose.sonar.yml down
```

Para borrar además los datos persistidos de SonarQube:

```bash
docker compose -f docker-compose.sonar.yml down -v
```
