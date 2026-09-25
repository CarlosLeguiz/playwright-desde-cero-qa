# Features principales de Playwright

Estas son las características que hacen a Playwright potente. Todas las vas a usar en algún momento a medida que avances.

## Codegen (generador de código)

Playwright graba lo que hacés en un navegador y te devuelve el código del test.

Se ejecuta con:

```bash
npx playwright codegen https://tu-app.com
```

Se abre un navegador. Vos interactuás normalmente (clicks, escritura, navegación) y Playwright genera el código en TypeScript en paralelo. Ideal para arrancar rápido o para partes complejas donde no querés escribir todo a mano.

## Trace Viewer (visor de trazas)

Cuando un test falla, Playwright puede grabar una traza completa de la ejecución con:

- Video de la pantalla
- Snapshots del DOM en cada paso
- Log detallado de cada acción
- Requests de red que se hicieron

Se ve como una timeline interactiva. Podés hacer click en cada paso y ver exactamente qué había en la pantalla en ese momento. Debuggear tests nunca fue tan fácil.

## UI Mode

Un modo interactivo que se abre con:

```bash
npx playwright test --ui
```

Te muestra una interfaz gráfica donde podés:

- Ver todos los tests del proyecto
- Correrlos uno por uno
- Ver el paso a paso con snapshots
- Probar locators en vivo sin tocar el código

Muy útil cuando estás aprendiendo o desarrollando un test nuevo.

## Playwright Inspector

Un debugger paso a paso que se abre con:

```bash
npx playwright test --debug
```

Pausa el test antes de cada acción, te permite avanzar de a un paso, ver el estado del navegador, y probar selectores en vivo.

## Auto-wait

Cada acción de Playwright (click, fill, etc.) espera automáticamente a que el elemento esté:

- Presente en el DOM
- Visible
- Estable (que no se esté moviendo por una animación)
- Habilitado (para clicks)

No necesitás poner `sleep()` ni `waitForElement()` en ningún lado.

## Web-first assertions

Las verificaciones (`expect(...)`) reintentan automáticamente durante unos segundos hasta que se cumplen. Ejemplo:

```typescript
await expect(page.getByText('Pedido confirmado')).toBeVisible();
```

Esto NO falla al instante si el texto todavía no apareció. Espera hasta 5 segundos por default. Muy útil para apps que tienen respuestas asíncronas (o llamadas a IA que tardan).

## Isolated contexts (contextos aislados)

Cada test corre en un navegador "limpio":

- Sin cookies de tests anteriores
- Sin sesión iniciada
- Sin cache
- Sin datos en localStorage

Esto significa que los tests no interfieren entre sí, y podés correr muchos en paralelo sin problemas.

## Network interception

Podés interceptar cualquier request HTTP que haga la app y:

- Ver qué se pidió y qué se respondió
- Modificar la respuesta antes de que la reciba la app
- Simular errores (500, timeout) para testear cómo reacciona la UI

Muy poderoso para testear apps con IA: podés mockear la respuesta del modelo y no depender de que el LLM responda algo específico.

## Parallel execution (ejecución en paralelo)

Playwright detecta cuántos núcleos tiene tu CPU y corre múltiples tests al mismo tiempo. Una suite de 100 tests que en serie tarda 20 minutos, en paralelo puede tardar 3.

## Multi-tab y multi-window

Playwright maneja de forma natural los flujos donde se abren varias pestañas o ventanas (login con SSO, popups, etc.). En Selenium esto era una pesadilla.