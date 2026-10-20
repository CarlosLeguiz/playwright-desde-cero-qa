# Memoria del agente de QA

Lo que el agente aprendio trabajando en este proyecto. Se lee al empezar, se actualiza al terminar.

## Sitios de practica

### saucedemo.com
- Usa `data-test`, no `data-testid`. El config ya tiene `testIdAttribute: 'data-test'`.
- Usuarios: standard_user (normal), locked_out_user (bloqueado), problem_user (con bugs a proposito), performance_glitch_user (lento).
- Password siempre: secret_sauce
- Rapido y estable, no necesita retries.
- data-test del inventario: `inventory-item` (tarjeta, <div> sin rol), `inventory-item-name`, `inventory-item-price` (texto "$29.99"). Leer nombre y precio DENTRO de cada tarjeta.
- Precios de standard_user en orden Name A to Z: 29.99, 9.99, 15.99, 49.99, 7.99, 15.99. Ojo: en un rango, el orden de pantalla no es ascendente (7.99 a 9.99 da [9.99, 7.99]).

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
- Test estatico que escanea el codigo del lab (prohibir waitForTimeout/XPath) y se incluye a si mismo: matchea sus propios literales (ej. "xpath="). Armar los patrones concatenando strings.
- Comparar un page object contra si mismo no prueba nada: para conteos u orden de pantalla, usar un locator propio del test.

## Como actualizar este archivo

Agregar solo cosas que van a servir mas adelante:
- Comportamientos raros de un sitio
- Locators que fallaron y por que
- Decisiones de arquitectura del proyecto

No agregar: resultados de un test puntual, cosas obvias de la documentacion de Playwright.