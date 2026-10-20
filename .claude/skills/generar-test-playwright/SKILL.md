---
name: generar-test-playwright
description: Procedimiento de 4 pasos para generar un test de Playwright nuevo. Usar cuando se pida crear un test desde cero para un flujo o pantalla.
---

# Generar un test de Playwright

Procedimiento fijo. No saltear pasos.

## Paso 1: Capture

Conseguir el HTML real. Dos vias:

- Si el sitio es publico: navegarlo con el MCP de Playwright y sacar los locators del snapshot de accesibilidad.
- Si no es accesible: pedir al usuario el outerHTML de los elementos clave (DevTools > Inspect > click derecho > Copy > Copy outerHTML).

Nunca inventar locators. Si no se tiene el HTML, pedirlo antes de seguir.

## Paso 2: Prompt

Antes de escribir, confirmar en voz alta:

1. Que flujo se testea (los pasos concretos)
2. Que datos se usan (credenciales, valores de entrada)
3. Que significa que el test paso (la assertion que lo prueba)

Si alguno de los tres no esta claro, preguntarlo. Un test sin assertion real no sirve.

## Paso 3: Verify

Escribir el test y decirle al usuario el comando exacto para correrlo:

npx playwright test <ruta> --project=chromium

Pedirle que pegue la salida.

Si falla, leer el error completo antes de proponer un cambio. No cambiar locators a ciegas.

## Paso 4: Harden

Una vez que pasa, revisar:

- Se puede romper a proposito? Decir como. Si no se puede romper, la assertion no sirve.
- Hay waitForTimeout? Sacarlo.
- Los locators siguen la prioridad de CLAUDE.md?
- El sitio es inestable? Agregar retries.
- El test corre solo, sin depender de otros?

## Al terminar

Resumir en tres lineas:
- Que verifica el test
- Que locators se usaron y por que
- Como romperlo para comprobar que funciona