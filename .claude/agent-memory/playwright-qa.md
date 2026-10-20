# Memoria del agente de QA

Lo que el agente aprendio trabajando en este proyecto. Se lee al empezar, se actualiza al terminar.

## Sitios de practica

### saucedemo.com
- Usa `data-test`, no `data-testid`. El config ya tiene `testIdAttribute: 'data-test'`.
- Usuarios: standard_user (normal), locked_out_user (bloqueado), problem_user (con bugs a proposito), performance_glitch_user (lento).
- Password siempre: secret_sauce
- Rapido y estable, no necesita retries.

### the-internet.herokuapp.com
- Tira 503 de forma intermitente. Siempre configurar retries: 2 y timeout alto.
- El mensaje de login aparece en `#flash`, puede tardar.

### demoqa.com
- Dropdowns custom de React, no son `<select>` nativos. No sirve `selectOption()`.
- Hay que clickear el contenedor y despues la opcion.

### jqueryui.com/datepicker
- El datepicker esta dentro de un iframe. Usar `frameLocator()`.
- Para el dia, usar `exact: true` o matchea varios (el 1 matchea 1, 11, 21).

## Decisiones tomadas

- Modulos 1-5 en JavaScript, modulo 6 en adelante en TypeScript.
- El config soporta ambos con `testMatch`.
- Se saco el project `edge` del config porque no esta instalado.

## Errores que ya se cometieron

- Generar el test en la carpeta equivocada por copiar el prompt de otro lab.
- Usar `chromiun` en vez de `chromium` en `--project`.
- Olvidar `testIdAttribute` y que `getByTestId` no matchee nada en saucedemo.

## Como actualizar este archivo

Agregar solo cosas que van a servir mas adelante:
- Comportamientos raros de un sitio
- Locators que fallaron y por que
- Decisiones de arquitectura del proyecto

No agregar: resultados de un test puntual, cosas obvias de la documentacion de Playwright.