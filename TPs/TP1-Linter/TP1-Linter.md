# TP1: Linter

**Materia:** Gestión de la Calidad del Software

## Consigna

Se debe crear un **repositorio público** por grupo. Se debe reutilizar el código del repositorio que utilizaron en la materia **Ingeniería del Software**.

El repositorio debe estar debidamente configurado para que:

- Los **Actions bloqueen las PRs** si no se cumplen las condiciones de calidad definidas.
- **No se puedan hacer commits directos a `main`** (protección de rama).

Se deberá implementar las **herramientas de linteo** correspondientes a cada lenguaje/código que se utilice en el repositorio, y el Action debe funcionar como **gate de calidad** (es decir, si el linteo falla, no se puede mergear la PR).

### Linters vistos

- ESLint
- Ruff
- Pylint
- Checkstyle
- PMD
- SpotBugs

> Se pueden utilizar otros linters, siempre que sean adecuados para los lenguajes del repositorio.

### README

Se debe confeccionar un **README** donde se explique el TP1:

- ¿Cómo funciona? (arquitectura del workflow, qué dispara el Action, qué valida, etc.)
- ¿Qué área de calidad se trabaja, especialmente en relación a la **ISO** correspondiente (ISO 25000)?
- Adjuntar capturas como evidencia

## Modalidad de entrega

1. Este markdown se carga en una **Issue** llamada igual que el TP: **"TP1: Linter"**.
2. Se resuelve el TP mediante una **Pull Request** que se asocia a la Issue (incluyendo `Closes #<número de issue>` en la descripción de la PR) y, al mergearse, la **cierra automáticamente**.

## Checklist de guía 

- [ ] Crear el repositorio público del grupo
- [ ] Configurar la protección de la rama `main`
  - [ ] Bloquear commits directos a `main`
  - [ ] Requerir que los checks de GitHub Actions pasen antes de poder mergear una PR
- [ ] Crear el workflow de GitHub Actions que ejecute los linters
- [ ] Verificar que el Action funcione como gate de calidad (bloquea el merge si el linteo falla)
- [ ] Redactar el README del TP
