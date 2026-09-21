# Nota docente — intención del laboratorio

El repositorio está pensado para producir una diferencia clara entre la percepción del usuario y la calidad interna del código.

La aplicación visible es una mesa de ayuda normal: login, dashboard, tickets, clientes, filtros, comentarios, persistencia local y exportación.

Dentro del código se distribuyeron deliberadamente oportunidades de análisis en categorías como:

- complejidad elevada en reglas de negocio;
- lógica duplicada;
- cobertura deliberadamente baja;
- almacenamiento local de información sensible;
- secretos de demostración escritos en código;
- generación de token con aleatoriedad no criptográfica;
- renderizado de contenido de usuario como HTML;
- construcción dinámica de código;
- uso de endpoint HTTP no cifrado;
- comparaciones y estructuras mejorables;
- código legado y funciones que ya no son necesarias.

No todos los puntos tienen por qué aparecer con exactamente el mismo nombre o severidad en todas las versiones/perfiles de SonarQube. Parte del ejercicio es interpretar qué detecta la configuración instalada y qué riesgos siguen requiriendo criterio humano.
