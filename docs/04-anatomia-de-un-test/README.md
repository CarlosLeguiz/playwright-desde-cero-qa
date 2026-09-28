# Módulo 4: Anatomía de un test

Este es el módulo más importante de los primeros pasos con Playwright. Acá dejamos la teoría y aprendemos a leer código de verdad.

Cuando termines este módulo vas a poder mirar cualquier test de Playwright y entender qué hace cada línea, cómo encuentra elementos en la página, y cómo verifica que todo funcione.

## Contenido del módulo

1. [Async/await: por qué está en todos lados](./async-await.md)
   - Qué significa "asíncrono" en programación
   - Cómo funciona `await` y por qué es obligatorio
   - Qué pasa si te olvidás un `await`

2. [Estructura de un test](./estructura-de-un-test.md)
   - La función `test()` y sus parámetros
   - El objeto `page` y qué representa
   - El patrón "fixture" de Playwright

3. [Locators: encontrar elementos en la página](./locators.md)
   - Qué es un locator
   - Los locators recomendados: `getByRole`, `getByText`, `getByLabel`
   - Locators por CSS y XPath (cuándo usar cada uno)
   - Buenas prácticas

4. [Assertions: verificar que las cosas pasan](./assertions.md)
   - El objeto `expect` de Playwright
   - Assertions comunes: `toBeVisible`, `toHaveText`, `toHaveTitle`
   - Web-first assertions y auto-retry
   - Assertions negativas con `.not`

5. [Ejemplo desglosado](./ejemplo-desglosado.md)
   - Análisis línea por línea de `example.spec.ts`
   - Cómo se combinan todos los conceptos anteriores
   - Ejercicio: modificar el test

## Objetivos de aprendizaje

Al terminar este módulo vas a poder:

- Leer y entender cualquier test de Playwright
- Escribir tu primer test propio desde cero
- Explicar por qué se usa `async/await` en todas las líneas
- Elegir el locator correcto para cada situación
- Escribir assertions que sean confiables (no flaky)

## Duración estimada

45 a 60 minutos entre lectura, ejemplos y práctica.

## Prerrequisitos

Antes de arrancar este módulo deberías tener:

- Playwright instalado y funcionando ([Módulo 2](../02-instalacion/README.md))
- Corrido el test de ejemplo al menos una vez
- Entendida la estructura básica del proyecto